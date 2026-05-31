import { Request, Response } from "express";
import { UserService } from "../services/user.service.js";

const userService = new UserService();

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const leaderboard = await userService.getLeaderboard(Math.min(limit, 50));
        res.status(200).json(leaderboard);
    } catch {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};

export const getMyStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const stats = await userService.getUserStats(userId);
        res.status(200).json(stats);
    } catch (error) {
        const msg = (error as any).message;
        if (msg.includes('not found')) return res.status(404).json({ error: msg });
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};
