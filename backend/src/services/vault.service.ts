import prisma from "../lib/prisma.js";

export const addItemToVaultService = async (vaultData: any, userId: string) => {
  const { resourceName, quantity, condition, category, acquiredDate } =
    vaultData;

  // Check if item already exists in vault
  const existingItem = await prisma.vaultItem.findFirst({
    where: {
      userId,
      resourceName,
      condition,
      category,
    },
  });

  // If item exists, update quantity
  if (existingItem) {
    return prisma.vaultItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });
  }

  // Create new vault item
  return prisma.vaultItem.create({
    data: {
      resourceName,
      quantity,
      condition,
      category,
      acquiredDate: new Date(acquiredDate),
      userId,
    },
  });
};

export const getVaultItemsService = async (userId: string, query: any) => {
  const { sort, category, condition, search } = query;

  let orderBy: any = {
    createdAt: "desc",
  };

  switch (sort) {
    case "oldest":
      orderBy = {
        createdAt: "asc",
      };
      break;
    case "name":
      orderBy = {
        resourceName: "asc",
      };
      break;
    case "quantity":
      orderBy = {
        quantity: "desc",
      };
      break;
  }

  const where: any = {
    userId,
  };

  if (category) {
    where.category = category;
  }

  if (condition) {
    where.condition = condition;
  }

  if (search) {
    where.resourceName = {
      contains: search,
      mode: "insensitive",
    };
  }

  const items = await prisma.vaultItem.findMany({
    where,
    orderBy,
  });

  // Calculate statistics
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueTypes = items.length;
  const tradeValue = calculateTradeValue(items);

  return {
    items,
    stats: {
      totalItems,
      uniqueTypes,
      tradeValue,
    },
  };
};

export const updateVaultItemService = async (
  itemId: string,
  userId: string,
  updateData: any,
) => {
  const item = await prisma.vaultItem.findUnique({
    where: {
      id: itemId,
    },
  });

  if (!item) {
    throw new Error("Vault item not found");
  }

  if (item.userId !== userId) {
    throw new Error("Forbidden");
  }

  return prisma.vaultItem.update({
    where: {
      id: itemId,
    },
    data: updateData,
  });
};

export const removeVaultItemService = async (
  itemId: string,
  userId: string,
  quantity?: number,
) => {
  const item = await prisma.vaultItem.findUnique({
    where: {
      id: itemId,
    },
  });

  if (!item) {
    throw new Error("Vault item not found");
  }

  if (item.userId !== userId) {
    throw new Error("Forbidden");
  }

  // If quantity specified, reduce quantity
  if (quantity && quantity > 0 && quantity < item.quantity) {
    return prisma.vaultItem.update({
      where: {
        id: itemId,
      },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }

  // Otherwise delete the item
  return prisma.vaultItem.delete({
    where: {
      id: itemId,
    },
  });
};

export const getVaultStatsService = async (userId: string) => {
  const items = await prisma.vaultItem.findMany({
    where: {
      userId,
    },
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueTypes = items.length;
  const tradeValue = calculateTradeValue(items);

  return {
    totalItems,
    uniqueTypes,
    tradeValue,
  };
};

// Helper function to calculate trade value based on rarity
function calculateTradeValue(items: any[]): string {
  const rarityValues: Record<string, number> = {
    PRISTINE: 3,
    GOOD: 2,
    WORN: 1,
    DAMAGED: 0.5,
  };

  const totalValue = items.reduce((sum, item) => {
    const baseValue = rarityValues[item.condition] || 1;
    return sum + baseValue * item.quantity;
  }, 0);

  if (totalValue >= 50) return "CRITICAL";
  if (totalValue >= 25) return "HIGH";
  if (totalValue >= 10) return "MEDIUM";
  return "LOW";
}
