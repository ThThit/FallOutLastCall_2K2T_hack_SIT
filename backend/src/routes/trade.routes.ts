import express from "express";
import {
  createTrade,
  getTrades,
  updateTrade,
  cancelTrade,
  getAvailableTradeItems,
  acceptTrade,
  getTradeHistory,
} from "../controllers/trade.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getTrades);

router.get("/available/items", authMiddleware, getAvailableTradeItems);
router.get("/history", authMiddleware, getTradeHistory);

router.post("/", authMiddleware, createTrade);

router.post("/:id/accept", authMiddleware, acceptTrade);

router.patch("/:id", authMiddleware, updateTrade);

router.delete("/:id", authMiddleware, cancelTrade);

export default router;
