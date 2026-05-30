import prisma from "../lib/prisma.js";

export const createTradeService = async (tradeData: any, userId: string) => {
  const {
    vaultItemId,
    quantity,
    requestedItem,
    requestedQuantity,
    traderName,
    location,
    // Direct offer fields (no vault item)
    resourceName: directResourceName,
    condition: directCondition,
    category: directCategory,
  } = tradeData;

  // Vault-linked trade
  if (vaultItemId) {
    const vaultItem = await prisma.vaultItem.findUnique({
      where: { id: vaultItemId },
    });

    if (!vaultItem) throw new Error("Vault item not found");
    if (vaultItem.userId !== userId) throw new Error("Unauthorized: This item does not belong to you");
    if (vaultItem.quantity < quantity) {
      throw new Error(`Insufficient quantity. You have ${vaultItem.quantity}, but need ${quantity}`);
    }

    return prisma.$transaction(async (tx) => {
      await tx.vaultItem.update({
        where: { id: vaultItemId },
        data: { quantity: { decrement: quantity } },
      });

      const newTrade = await tx.trade.create({
        data: {
          resourceName: vaultItem.resourceName,
          quantity,
          condition: vaultItem.condition,
          category: vaultItem.category,
          requestedItem,
          requestedQuantity,
          traderName,
          location: location || null,
          creatorId: userId,
          vaultItemId,
        },
        include: { vaultItem: true },
      });

      // Remove the vault item if its quantity dropped to zero
      await tx.vaultItem.deleteMany({
        where: { id: vaultItemId, quantity: { lte: 0 } },
      });

      return newTrade;
    });
  }

  // Direct offer (no vault item required)
  if (!directResourceName || !directCondition || !directCategory) {
    throw new Error("Resource name, condition, and category are required for direct offers");
  }

  return prisma.trade.create({
    data: {
      resourceName: directResourceName,
      quantity,
      condition: directCondition,
      category: directCategory,
      requestedItem,
      requestedQuantity,
      traderName,
      location: location || null,
      creatorId: userId,
    },
    include: { vaultItem: true },
  });
};
export const getTradesService = async (query: any, currentUserId?: string) => {
  const { sort, category, condition, search, mine } = query;

  const where: any = { status: "ACTIVE" };
  if (currentUserId) {
    // mine=true -> only your own listings; otherwise only other survivors' listings
    where.creatorId = mine === "true" ? currentUserId : { not: currentUserId };
  }
  if (category) where.category = category;
  if (condition) where.condition = condition;
  if (search) where.resourceName = { contains: search };

  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  if (sort === "quantity") orderBy = { quantity: "desc" };

  const trades = await prisma.trade.findMany({
    where,
    orderBy,
    include: { vaultItem: true },
  });

  // Sort urgency/rarity in memory (SQLite can't do CASE WHEN ordering)
  const urgencyRank: Record<string, number> = { DAMAGED: 3, WORN: 2, GOOD: 1, PRISTINE: 0 };
  const rarityRank: Record<string, number> = { MEDICINE: 6, AMMO: 5, FUEL: 4, BATTERIES: 3, TOOLS: 2, PARTS: 1, FOOD: 0 };

  if (sort === "urgency") {
    trades.sort((a, b) => (urgencyRank[b.condition] ?? 0) - (urgencyRank[a.condition] ?? 0));
  } else if (sort === "rarity") {
    trades.sort((a, b) => (rarityRank[b.category] ?? 0) - (rarityRank[a.category] ?? 0));
  }

  // Compute demand map: how many trades request each category
  const demandMap: Record<string, number> = {};
  trades.forEach((t) => {
    const key = t.requestedItem.toUpperCase();
    demandMap[key] = (demandMap[key] || 0) + 1;
  });

  return { trades, demandMap };
};
export const updateTradeService = async (
  tradeId: string,
  userId: string,
  updateData: any,
) => {
  const trade = await prisma.trade.findUnique({
    where: {
      id: tradeId,
    },
  });

  if (!trade) {
    throw new Error("Trade not found");
  }

  if (trade.creatorId !== userId) {
    throw new Error("Forbidden");
  }

  if (trade.status !== "ACTIVE") {
    throw new Error("Cannot update inactive trade");
  }

  return prisma.trade.update({
    where: {
      id: tradeId,
    },
    data: updateData,
  });
};
export const cancelTradeService = async (tradeId: string, userId: string) => {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });

  if (!trade) throw new Error("Trade not found");
  if (trade.creatorId !== userId) throw new Error("Forbidden");
  if (trade.status !== "ACTIVE") throw new Error("Only active trades can be cancelled");

  return prisma.$transaction(async (tx) => {
    // Restore vault quantity for vault-linked trades
    if (trade.vaultItemId) {
      await tx.vaultItem.update({
        where: { id: trade.vaultItemId },
        data: { quantity: { increment: trade.quantity } },
      });
    }

    return tx.trade.update({
      where: { id: tradeId },
      data: { status: "CANCELLED" },
    });
  });
};

export const getTradeHistoryService = async (userId: string) => {
  return prisma.trade.findMany({
    where: {
      status: { in: ["COMPLETED", "CANCELLED"] },
      OR: [{ creatorId: userId }, { acceptorId: userId }],
    },
    include: { vaultItem: true },
    orderBy: { updatedAt: "desc" },
  });
};

export const acceptTradeService = async (
  tradeId: string,
  acceptorId: string,
  acceptorVaultItemId: string,
) => {
  // Get the trade
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: { vaultItem: true },
  });

  if (!trade) {
    throw new Error("Trade not found");
  }

  if (trade.status !== "ACTIVE") {
    throw new Error("Trade is no longer active");
  }

  if (trade.creatorId === acceptorId) {
    throw new Error("Cannot trade with yourself");
  }

  // Get the acceptor's vault item they're offering
  const acceptorVaultItem = await prisma.vaultItem.findUnique({
    where: { id: acceptorVaultItemId },
  });

  if (!acceptorVaultItem) {
    throw new Error("Your vault item not found");
  }

  if (acceptorVaultItem.userId !== acceptorId) {
    throw new Error("Unauthorized: This item does not belong to you");
  }

  if (acceptorVaultItem.quantity < trade.requestedQuantity) {
    throw new Error(
      `Insufficient quantity. You have ${acceptorVaultItem.quantity} but this trade requires ${trade.requestedQuantity}.`,
    );
  }

  // Execute the trade in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Acceptor gives requestedQuantity of their item
    await tx.vaultItem.update({
      where: { id: acceptorVaultItemId },
      data: { quantity: { decrement: trade.requestedQuantity } },
    });

    // 2. Add/increment trade's resource in acceptor's vault
    const acceptorExistingItem = await tx.vaultItem.findFirst({
      where: {
        userId: acceptorId,
        resourceName: trade.resourceName,
        condition: trade.condition,
      },
    });

    if (acceptorExistingItem) {
      await tx.vaultItem.update({
        where: { id: acceptorExistingItem.id },
        data: { quantity: { increment: trade.quantity } },
      });
    } else {
      await tx.vaultItem.create({
        data: {
          resourceName: trade.resourceName,
          quantity: trade.quantity,
          condition: trade.condition,
          category: trade.category,
          acquiredDate: new Date(),
          userId: acceptorId,
        },
      });
    }

    // 3. Creator receives requestedQuantity of the acceptor's item
    const creatorExistingItem = await tx.vaultItem.findFirst({
      where: {
        userId: trade.creatorId,
        resourceName: acceptorVaultItem.resourceName,
        condition: acceptorVaultItem.condition,
      },
    });

    if (creatorExistingItem) {
      await tx.vaultItem.update({
        where: { id: creatorExistingItem.id },
        data: { quantity: { increment: trade.requestedQuantity } },
      });
    } else {
      await tx.vaultItem.create({
        data: {
          resourceName: acceptorVaultItem.resourceName,
          quantity: trade.requestedQuantity,
          condition: acceptorVaultItem.condition,
          category: acceptorVaultItem.category,
          acquiredDate: new Date(),
          userId: trade.creatorId,
        },
      });
    }

    // 4. Mark trade as COMPLETED with acceptor info
    const completedTrade = await tx.trade.update({
      where: { id: tradeId },
      data: {
        status: "COMPLETED",
        acceptorId,
        acceptorVaultItemId,
      },
    });

    // Remove the acceptor's vault item if its quantity dropped to zero
    await tx.vaultItem.deleteMany({
      where: { id: acceptorVaultItemId, quantity: { lte: 0 } },
    });

    return completedTrade;
  });

  return result;
};
