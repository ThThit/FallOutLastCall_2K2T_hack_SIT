import { Response } from "express";
import { AuthenticatedRequest } from "../types/index.js";
import {
  createTradeService,
  getTradesService,
  updateTradeService,
  cancelTradeService,
} from "../services/trade.service.js";
import { getVaultItemsService } from "../services/vault.service.js";

// Helper function to generate supply alerts
async function generateAlerts(userId: string): Promise<string[]> {
  try {
    const vaultData = await getVaultItemsService(userId, {});
    const alerts: string[] = [];
    const itemsByCategory: Record<string, number> = {};

    // Count items by category
    vaultData.items.forEach((item: any) => {
      itemsByCategory[item.category] =
        (itemsByCategory[item.category] || 0) + item.quantity;
    });

    // Generate alerts for missing or low supplies
    const categories = [
      "MEDICINE",
      "FOOD",
      "FUEL",
      "BATTERIES",
      "TOOLS",
      "PARTS",
      "AMMO",
    ];
    categories.forEach((category) => {
      const count = itemsByCategory[category] || 0;
      if (count === 0) {
        alerts.push(`🚨 ${category} supplies unavailable`);
      } else if (count < 3) {
        alerts.push(`⚠ ${category} supplies critically low`);
      }
    });

    return alerts;
  } catch (error) {
    return [];
  }
}

export const createTrade = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trade = await createTradeService(req.body, req.user?.id || "");
    const alerts = await generateAlerts(req.user?.id || "");

    res.status(201).json({
      trade,
      alerts,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
export const getTrades = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trades = await getTradesService(req.query);
    const alerts = await generateAlerts(req.user?.id || "");

    res.status(200).json({
      trades,
      alerts,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateTrade = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trade = await updateTradeService(
      req.params.id as string,
      req.user?.id || "",
      req.body,
    );

    res.status(200).json(trade);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const cancelTrade = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trade = await cancelTradeService(
      req.params.id as string,
      req.user?.id || "",
    );

    res.status(200).json({
      message: "Trade cancelled successfully",
      trade,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};
