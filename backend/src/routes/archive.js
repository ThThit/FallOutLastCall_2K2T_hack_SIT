import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { title, survivorAlias, category, content, emotionalTag } = req.body;

    const memory = await prisma.memoryArchive.create({
      data: {
        title,
        survivorAlias,
        category,
        content,
        emotionalTag,
      },
    });

    res.status(201).json(memory);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const memories = await prisma.memoryArchive.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(memories);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const memory = await prisma.memoryArchive.findUnique({
      where: { id },
    });

    if (!memory) {
      return res.status(404).json({ error: "Memory not found" });
    }

    res.json(memory);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedMemory = await prisma.memoryArchive.delete({
      where: { id },
    });

    res.json(deletedMemory);
  } catch (error) {
    next(error);
  }
});

export default router;
