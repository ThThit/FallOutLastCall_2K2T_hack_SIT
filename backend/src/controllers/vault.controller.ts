import { Response } from "express";
import { AuthenticatedRequest } from "../types/index.js";
import {
  addItemToVaultService,
  getVaultItemsService,
  updateVaultItemService,
  removeVaultItemService,
  getVaultStatsService,
} from "../services/vault.service.js";

export const addItemToVault = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const item = await addItemToVaultService(req.body, req.user?.id || "");

    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getVaultItems = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const vaultData = await getVaultItemsService(req.user?.id || "", req.query);

    res.status(200).json(vaultData);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateVaultItem = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const item = await updateVaultItemService(
      req.params.id as string,
      req.user?.id || "",
      req.body,
    );

    res.status(200).json(item);
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const removeVaultItem = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { quantity } = req.query;

    const item = await removeVaultItemService(
      req.params.id as string,
      req.user?.id || "",
      quantity ? parseInt(quantity as string) : undefined,
    );

    res.status(200).json({
      message: "Item removed from vault successfully",
      item,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getVaultStats = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const stats = await getVaultStatsService(req.user?.id || "");

    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};
