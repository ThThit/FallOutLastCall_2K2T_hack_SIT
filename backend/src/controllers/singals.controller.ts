import { Request, Response } from "express";
import { SignalsService } from "../services/signal.service.js";
import { error } from "node:console";

const signalsService = new SignalsService();

export const getSignal = async (req: Request, res: Response) => {
    try {
        const signals = await signalsService.getAllSignal();

        res.status(200).json(signals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch signals' });
    }
};

export const sendSignal = async (req: Request, res: Response) => {
    try {
        const { title, content, category, dangerLevel } = req.body;
        const userId = (req as any).userId;

        if (!title || !content || !dangerLevel) {
            return res.status(400).json({ error: "Missing fields" });
        }

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const signal = await signalsService.createSignal(title, content, userId, category, dangerLevel);

        res.status(201).json(signal);
    } catch (error) {
        console.error('Signal creation error:', error);
        res.status(500).json({ error: 'Failed to create signal', details: (error as any).message });
    }
};