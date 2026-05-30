import { z } from "zod";

export const VALID_SECTORS = [1, 2, 3, 4, 5, 6, 7, 8];

export const createSignalSchema = z.object({
    authorName: z.string().min(1),
    content: z.string().min(1).max(288),
    sector: z.number().int().refine((v) => VALID_SECTORS.includes(v), {
        message: "Sector must be one of: 1, 2, 3, 4, 5, 6, 7, 8",
    }),
    priority: z.union([z.literal("STANDARD"), z.literal("EMERGENCY")]),
});

export const updateSignalSchema = z.object({
    content: z.string().min(1).max(288).optional(),
    sector: z
        .number()
        .int()
        .refine((v) => VALID_SECTORS.includes(v), {
            message: "Sector must be one of: 1, 2, 3, 4, 5, 6, 7, 8",
        })
        .optional(),
    priority: z
        .union([z.literal("STANDARD"), z.literal("EMERGENCY")])
        .optional(),
});

export const voteSchema = z.object({
    type: z.union([z.literal("verified"), z.literal("unverified")]),
    action: z.union([z.literal("add"), z.literal("remove")]).default("add"),
});

export const createCommentSchema = z.object({
    authorName: z.string().min(1),
    content: z.string().min(1),
});
