import { Router, Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { z } from "zod";

const router = Router();

const archiveSchema = z.object({
  title: z.string().min(1, { message: "Transmission failed: Missing title." }),
  survivorAlias: z.string().optional().default("Anonymous"),
  category: z.string().min(1, {
    message: "Transmission failed: Missing category classification.",
  }),
  content: z
    .string()
    .min(1, { message: "Transmission failed: Missing content block." }),
  emotionalTag: z
    .string()
    .min(1, { message: "Transmission failed: Missing emotional signature." }),
});

type ArchiveInput = z.infer<typeof archiveSchema>;

type MemorySnapshot = {
  title: string;
  survivorAlias: string;
  category: string;
  content: string;
  emotionalTag: string;
  decayLevel: number;
  isRestored: boolean;
};

const getRevisionAction = (body: Record<string, unknown>) => {
  if (body.isRestored === true || body.decayLevel !== undefined) {
    return "RESTORE";
  }

  return "UPDATE";
};

const buildRevisionPayload = (
  memoryId: string,
  action: string,
  before: MemorySnapshot,
  after: MemorySnapshot,
  note?: string,
) => ({
  memoryId,
  action,
  note,
  titleBefore: before.title,
  titleAfter: after.title,
  survivorAliasBefore: before.survivorAlias,
  survivorAliasAfter: after.survivorAlias,
  categoryBefore: before.category,
  categoryAfter: after.category,
  contentBefore: before.content,
  contentAfter: after.content,
  emotionalTagBefore: before.emotionalTag,
  emotionalTagAfter: after.emotionalTag,
  decayLevelBefore: before.decayLevel,
  decayLevelAfter: after.decayLevel,
  isRestoredBefore: before.isRestored,
  isRestoredAfter: after.isRestored,
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = archiveSchema.safeParse(req.body);
    if (!parseResult.success) {
      // collect human-friendly messages from Zod
      const messages = parseResult.error.issues.map(
        (e: any) => e.message || "Invalid input",
      );
      return res.status(422).json({ errorMessages: messages });
    }

    const data: ArchiveInput = parseResult.data;

    const memory = await prisma.memoryArchive.create({
      data: {
        title: data.title,
        survivorAlias: data.survivorAlias,
        category: data.category,
        content: data.content,
        emotionalTag: data.emotionalTag,
      },
    });

    res.status(201).json(memory);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memories = await prisma.memoryArchive.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(memories);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const memory = await prisma.memoryArchive.findUnique({ where: { id } });

    if (!memory) return res.status(404).json({ error: "Memory not found" });

    res.json(memory);
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);

      const deleted = await prisma.memoryArchive.delete({ where: { id } });
      res.json(deleted);
    } catch (error) {
      next(error);
    }
  },
);

// UPDATE a specific memory
router.patch(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);

      // .partial() makes all fields optional, perfect for a PATCH request
      const parseResult = archiveSchema.partial().safeParse(req.body);

      if (!parseResult.success) {
        const messages = parseResult.error.issues.map(
          (e: any) => e.message || "Invalid input",
        );
        return res.status(422).json({ errorMessages: messages });
      }

      const existingMemory = await prisma.memoryArchive.findUnique({
        where: { id },
      });

      if (!existingMemory) {
        return res.status(404).json({ error: "Memory not found to update." });
      }

      const updateData = {
        ...parseResult.data,
        // If you are passing decayLevel or isRestored in req.body, you can grab them here:
        ...(req.body.decayLevel !== undefined && {
          decayLevel: req.body.decayLevel,
        }),
        ...(req.body.isRestored !== undefined && {
          isRestored: req.body.isRestored,
        }),
      };

      const action = getRevisionAction(req.body as Record<string, unknown>);

      const updatedMemory = await prisma.$transaction(async (tx) => {
        const updated = await tx.memoryArchive.update({
          where: { id },
          data: updateData,
        });

        await tx.memoryArchiveRevision.create({
          data: buildRevisionPayload(
            id,
            action,
            {
              title: existingMemory.title,
              survivorAlias: existingMemory.survivorAlias,
              category: existingMemory.category,
              content: existingMemory.content,
              emotionalTag: existingMemory.emotionalTag,
              decayLevel: existingMemory.decayLevel,
              isRestored: existingMemory.isRestored,
            },
            {
              title: updated.title,
              survivorAlias: updated.survivorAlias,
              category: updated.category,
              content: updated.content,
              emotionalTag: updated.emotionalTag,
              decayLevel: updated.decayLevel,
              isRestored: updated.isRestored,
            },
            action === "RESTORE" ? "Recovered archive state." : undefined,
          ),
        });

        return updated;
      });

      res.json(updatedMemory);
    } catch (error: any) {
      // Prisma throws a specific error (P2025) if the record to update doesn't exist
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Memory not found to update." });
      }
      next(error);
    }
  },
);

router.get(
  "/:id/history",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);

      const history = await prisma.memoryArchiveRevision.findMany({
        where: { memoryId: id },
        orderBy: { createdAt: "desc" },
      });

      res.json(history);
    } catch (error) {
      next(error);
    }
  },
);
export default router;
