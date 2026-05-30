import prisma from "../lib/prisma.js";

export const createTradeService = async (tradeData: any, userId: string) => {
  const {
    resourceName,
    quantity,
    condition,
    requestedItem,
    requestedQuantity,
    traderName,
    category,
  } = tradeData;

  const trade = await prisma.trade.create({
    data: {
      resourceName,
      quantity,
      condition,
      requestedItem,
      requestedQuantity,
      traderName,
      category,
      creatorId: userId,
    },
  });

  return trade;
};
export const getTradesService = async (query: any) => {
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

    case "quantity":
      orderBy = {
        quantity: "desc",
      };
      break;
  }

  const where: any = {
    status: "ACTIVE",
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
    };
  }

  return prisma.trade.findMany({
    where,
    orderBy,
  });
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

  return prisma.trade.update({
    where: {
      id: tradeId,
    },
    data: {
      status: "CANCELLED",
    },
  });
};
