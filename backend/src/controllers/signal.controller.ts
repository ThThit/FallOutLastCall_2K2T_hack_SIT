import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";

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

function expiryFilter() {
  const now = Date.now();
  return {
    OR: [
      {
        priority: "STANDARD",
        createdAt: { gt: new Date(now - 7 * 24 * 60 * 60 * 1000) },
      },
      {
        priority: "EMERGENCY",
        createdAt: { gt: new Date(now - 3 * 24 * 60 * 60 * 1000) },
      },
    ],
  };
}

export const createSignal = async (req: Request, res: Response) => {
  const result = createSignalSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues });

  const signal = await prisma.signal.create({ data: result.data });
  return res.status(201).json(signal);
};

export const getSignals = async (req: Request, res: Response) => {
  const { sort, q, sector } = req.query;

  const where: any = {
    deletedAt: null,
    AND: [expiryFilter()],
  };

  if (q) {
    where.AND.push({
      OR: [
        { content: { contains: String(q) } },
        { authorName: { contains: String(q) } },
      ],
    });
  }

  if (sector) {
    const num = parseInt(String(sector));
    if (!isNaN(num)) where.sector = num;
  }

  const orderBy =
    sort === "trust"
      ? { trustScore: "desc" as const }
      : { createdAt: "desc" as const };

  const signals = await prisma.signal.findMany({
    where,
    include: { _count: { select: { comments: true } } },
    orderBy,
  });

  // EMERGENCY always first, then preserve sort order within each priority
  signals.sort((a, b) => {
    if (a.priority === "EMERGENCY" && b.priority !== "EMERGENCY") return -1;
    if (b.priority === "EMERGENCY" && a.priority !== "EMERGENCY") return 1;
    return 0;
  });

  return res.json(signals);
};

export const updateSignal = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = updateSignalSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues });

  const existing = await prisma.signal.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return res.status(404).json({ error: "Signal not found" });

  const signal = await prisma.signal.update({ where: { id }, data: result.data });
  return res.json(signal);
};

export const deleteSignal = async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.signal.findFirst({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Signal not found" });

  await prisma.signal.update({ where: { id }, data: { deletedAt: new Date() } });
  return res.json({ message: "Signal deleted" });
};

export const voteSignal = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = voteSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues });

  const existing = await prisma.signal.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return res.status(404).json({ error: "Signal not found" });

  const { type, action } = result.data;
  const delta = action === "remove" ? -1 : 1;

  const newVerified = type === "verified"
    ? Math.max(0, existing.verifiedCount + delta)
    : existing.verifiedCount;
  const newUnverified = type === "unverified"
    ? Math.max(0, existing.unverifiedCount + delta)
    : existing.unverifiedCount;

  const total = newVerified + newUnverified;
  const trustScore =
    total === 0 ? 50 : Math.round((newVerified / total) * 1000) / 10;

  const updated = await prisma.signal.update({
    where: { id },
    data: { verifiedCount: newVerified, unverifiedCount: newUnverified, trustScore },
  });
  return res.json(updated);
};

export const createComment = async (req: Request, res: Response) => {
  const { id: signalId } = req.params;
  const result = createCommentSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues });

  const signal = await prisma.signal.findFirst({ where: { id: signalId, deletedAt: null } });
  if (!signal) return res.status(404).json({ error: "Signal not found" });

  const comment = await prisma.comment.create({
    data: { signalId, ...result.data },
  });
  return res.status(201).json(comment);
};

export const getComments = async (req: Request, res: Response) => {
  const { id: signalId } = req.params;

  const signal = await prisma.signal.findFirst({ where: { id: signalId } });
  if (!signal) return res.status(404).json({ error: "Signal not found" });

  const comments = await prisma.comment.findMany({
    where: { signalId },
    orderBy: { createdAt: "asc" },
  });
  return res.json(comments);
};
