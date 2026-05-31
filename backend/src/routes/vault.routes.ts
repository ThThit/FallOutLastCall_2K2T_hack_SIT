import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  addItemToVault,
  getVaultItems,
  updateVaultItem,
  removeVaultItem,
  getVaultStats,
} from "../controllers/vault.controller.js";

const router = Router();

// All vault routes require authentication
router.use(authMiddleware);

// GET /api/vault - Get all vault items with filters
router.get("/", getVaultItems);

// GET /api/vault/stats - Get vault statistics
router.get("/stats", getVaultStats);

// POST /api/vault - Add item to vault
router.post("/", addItemToVault);

// PUT /api/vault/:id - Update vault item
router.put("/:id", updateVaultItem);

// DELETE /api/vault/:id - Remove item from vault
router.delete("/:id", removeVaultItem);

export default router;
