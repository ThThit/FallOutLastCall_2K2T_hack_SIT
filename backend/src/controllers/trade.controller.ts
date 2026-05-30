import { Request, Response } from "express";
import { prisma } from "../prisma/client.js"



  

export const createTrade = async (req, res) => {
  try {
    const {
      resourceName,
      quantity,
      condition,
      requestedItem,
      requestedQuantity,
      traderName,
      category,
    } = req.body;

    const vaultItem = await prisma.vaultItem.findFirst({
      where: {
        resourceName,
        vault: {
          userId: req.user.id,
        },
      },
    });

    if (!vaultItem) {
      return res.status(404).json({
        message: "Resource not found in vault",
      });
    }

    const availableQuantity =
      vaultItem.quantity - vaultItem.reservedQuantity;

    if (availableQuantity < quantity) {
      return res.status(400).json({
        message: "Insufficient inventory",
      });
    }

    await prisma.vaultItem.update({
      where: {
        id: vaultItem.id,
      },
      data: {
        reservedQuantity: {
          increment: quantity,
        },
      },
    });

    const trade = await prisma.trade.create({
      data: {
        resourceName,
        quantity,
        condition,
        requestedItem,
        requestedQuantity,
        traderName,
        category,
        creatorId: req.user.id,
      },
    });

    res.status(201).json(trade);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create trade",
    });
  }
};

export const getTrades = async (req, res) => {
  try {
    const {
      sort,
      category,
      condition,
      search,
    } = req.query;

    // Sorting
    let orderBy: any = {
      createdAt: "desc",
    };

    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;

      case "quantity":
        orderBy = { quantity: "desc" };
        break;

      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    // Filtering
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

    // Get trades
    const trades = await prisma.trade.findMany({
      where,
      orderBy,
    });

    // Scarcity Alerts
    const alerts: string[] = [];

    const categories = [
      "MEDICINE",
      "FOOD",
      "FUEL",
      "BATTERIES",
      "TOOLS",
    ];

    for (const category of categories) {
      const count = await prisma.trade.count({
        where: {
          category,
          status: "ACTIVE",
        },
      });

      if (count === 0) {
        alerts.push(`🚨 ${category} supplies unavailable`);
      } else if (count < 3) {
        alerts.push(`⚠ ${category} supplies critically low`);
      } else if (count < 5) {
        alerts.push(`⚠ ${category} supplies running low`);
      }
    }

    // Demand ranking
    const categoryCounts = await Promise.all(
      categories.map(async (category) => ({
        category,
        count: await prisma.trade.count({
          where: {
            category,
            status: "ACTIVE",
          },
        }),
      }))
    );

    const demandRanking = categoryCounts
      .sort((a, b) => a.count - b.count)
      .slice(0, 3);

    // Simulated signal strength
    const signalStrength =
      Math.floor(Math.random() * 60) + 40;

    res.status(200).json({
      signalStrength,
      alerts,
      demandRanking,
      totalTrades: trades.length,
      trades,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch trades",
    });
  }
};
export const updateTrade = async (req, res) => {

  try {

    const { id } = req.params

    const updatedTrade =
      await prisma.trade.update({
        where: { id },
        data: req.body
      })

    res.json(updatedTrade)

  } catch (error) {

    res.status(500).json({
      message: "Update failed"
    })

  }

}
export const cancelTrade = async (req, res) => {
  try {
    const { id } = req.params;

    const trade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!trade) {
      return res.status(404).json({
        message: "Trade not found",
      });
    }

    if (trade.creatorId !== req.user.id) {
      return res.status(403).json({
        message: "You cannot cancel this trade",
      });
    }

    const cancelledTrade = await prisma.trade.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    res.status(200).json({
      message: "Trade cancelled successfully",
      trade: cancelledTrade,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to cancel trade",
    });
  }
};
