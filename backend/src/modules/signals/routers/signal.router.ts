import { Router } from "express";
import {
    createSignal,
    getSignals,
    updateSignal,
    deleteSignal,
    voteSignal,
    createComment,
    getComments,
} from "../controllers/signal.controller.js";

const router = Router();

router.post("/", createSignal);
router.get("/", getSignals);
router.patch("/:id", updateSignal);
router.delete("/:id", deleteSignal);
router.post("/:id/vote", voteSignal);
router.post("/:id/comments", createComment);
router.get("/:id/comments", getComments);

export default router;
