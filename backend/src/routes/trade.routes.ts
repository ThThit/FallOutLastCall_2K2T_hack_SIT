import express from "express";
import {
  createTrade,
  getTrades,
  updateTrade,
  cancelTrade,
} from "../controllers/trade.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getTrades);

router.post(
  "/",
  authMiddleware,
  createTrade
);

router.patch(
  "/:id",
  authMiddleware,
  updateTrade
);

router.delete(
  "/:id",
  authMiddleware,
  cancelTrade
);

export default router;