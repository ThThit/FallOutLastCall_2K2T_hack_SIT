import express from "express"

import {
  getTrades,
  createTrade,
  updateTrade,
  cancelTrade
} from "../controllers/trade.controller.js"

const router = express.Router()

router.get("/", getTrades)

router.post("/", createTrade)

router.patch("/:id", updateTrade)

router.delete("/:id", cancelTrade)

export default router