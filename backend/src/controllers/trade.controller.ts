import { Response } from "express";
import { AuthenticatedRequest } from "../types/index.js";
import {
  createTradeService,
  getTradesService,
  updateTradeService,
  cancelTradeService,
} from "../services/trade.service.js";

export const createTrade = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trade = await createTradeService(req.body, req.user?.id || "");

    res.status(201).json(trade);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getTrades = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trades = await getTradesService(req.query);

    res.status(200).json(trades);
  } catch (error: any) {
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
