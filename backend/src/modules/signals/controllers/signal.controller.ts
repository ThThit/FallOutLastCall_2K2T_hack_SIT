import { Request, Response } from "express";
import signalModel from "../models/signal.model.js";
import {
    createSignalSchema,
    updateSignalSchema,
    voteSchema,
    createCommentSchema,
} from "../schemas/signal.schema.js";

export const createSignal = async (req: Request, res: Response) => {
    try {
        const result = createSignalSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.issues });
        }

        const signal = await signalModel.create(result.data);
        return res.status(201).json(signal);
    } catch (error: any) {
        return res.status(error.status || 500).json({ error: error.message });
    }
};

export const getSignals = async (req: Request, res: Response) => {
    try {
        const { sort, q, sector } = req.query;
        const signals = await signalModel.getAll({
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

        const signal = await signalModel.update(id, result.data);
        return res.json(signal);
    } catch (error: any) {
        return res.status(error.status || 500).json({ error: error.message });
    }
};

export const deleteSignal = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const result = await signalModel.softDelete(id);
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

        const signal = await signalModel.vote(
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

        const comment = await signalModel.addComment(signalId, result.data);
        return res.status(201).json(comment);
    } catch (error: any) {
        return res.status(error.status || 500).json({ error: error.message });
    }
};

export const getComments = async (req: Request, res: Response) => {
    try {
        const signalId = String(req.params.id);
        const comments = await signalModel.getComments(signalId);
        return res.json(comments);
    } catch (error: any) {
        return res.status(error.status || 500).json({ error: error.message });
    }
};
