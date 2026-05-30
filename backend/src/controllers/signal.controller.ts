import { Request, Response } from "express";
import { z } from "zod";
import signalService from "../services/signal.service.js";

const VALID_SECTORS = [1, 2, 3, 4, 5, 6, 8];

const createSignalSchema = z.object({
  authorName: z.string().min(1),
  content: z.string().min(1).max(288),
  sector: z.number().int().refine((v) => VALID_SECTORS.includes(v), {
    message: "Sector must be one of: 1, 2, 3, 4, 5, 6, 8",
  }),
  priority: z.union([z.literal("STANDARD"), z.literal("EMERGENCY")]),
});

const updateSignalSchema = z.object({
  content: z.string().min(1).max(288).optional(),
  sector: z
    .number()
    .int()
    .refine((v) => VALID_SECTORS.includes(v), {
      message: "Sector must be one of: 1, 2, 3, 4, 5, 6, 8",
    })
    .optional(),
  priority: z.union([z.literal("STANDARD"), z.literal("EMERGENCY")]).optional(),
});

const voteSchema = z.object({
  type: z.union([z.literal("verified"), z.literal("unverified")]),
  action: z.union([z.literal("add"), z.literal("remove")]).default("add"),
});

const createCommentSchema = z.object({
  authorName: z.string().min(1),
  content: z.string().min(1),
});

export const createSignal = async (req: Request, res: Response) => {
  try {
    const result = createSignalSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const signal = await signalService.create(result.data);
    return res.status(201).json(signal);
  } catch (error: any) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export const getSignals = async (req: Request, res: Response) => {
  try {
    const { sort, q, sector } = req.query;
    const signals = await signalService.getAll({
      sort: sort ? String(sort) : undefined,
      q: q ? String(q) : undefined,
      sector: sector ? String(sector) : undefined,
    });
    return res.json(signals);
  } catch (error: any) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export const updateSignal = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = updateSignalSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const signal = await signalService.update(id, result.data);
    return res.json(signal);
  } catch (error: any) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export const deleteSignal = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = await signalService.softDelete(id);
    return res.json(result);
  } catch (error: any) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export const voteSignal = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = voteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const signal = await signalService.vote(
      id,
      result.data.type,
      result.data.action,
    );
    return res.json(signal);
  } catch (error: any) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const signalId = String(req.params.id);
    const result = createCommentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const comment = await signalService.addComment(signalId, result.data);
    return res.status(201).json(comment);
  } catch (error: any) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const signalId = String(req.params.id);
    const comments = await signalService.getComments(signalId);
    return res.json(comments);
  } catch (error: any) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};
