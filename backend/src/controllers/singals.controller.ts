import { Request, Response } from "express";
import { SignalsService } from "../services/signal.service.js";

const signalsService = new SignalsService();

// NOTE: GET / and POST / signals are owned by Peter's signal module.
// This controller only handles thit's trust/verification/moderation actions.

export const verifySignal = async (req: Request, res: Response) => {
    try {
        const signalId = req.params.signalId as string;
        const { status } = req.body;
        const userId = (req as any).userId;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        if (!signalId) return res.status(400).json({ error: "Signal ID is required" });
        if (!status || !['VERIFIED', 'SUSPICIOUS', 'OUTDATED'].includes(status)) {
            return res.status(400).json({ error: "Invalid verification status" });
        }

        const result = await signalsService.verifySignal(signalId, userId, status);
        res.status(200).json(result);
    } catch (error) {
        const msg = (error as any).message;
        if (msg.includes('not found')) return res.status(404).json({ error: msg });
        if (msg.includes('already verified')) return res.status(409).json({ error: msg });
        console.error('Signal verification error:', error);
        res.status(500).json({ error: 'Failed to verify signal', details: msg });
    }
};

// POST: /:signalId/vote — supports { type: 'verified'|'unverified', action: 'add'|'remove' }
export const voteSignal = async (req: Request, res: Response) => {
    try {
        const signalId = req.params.signalId as string;
        const { type, action } = req.body;
        const userId = (req as any).userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!signalId) return res.status(400).json({ error: 'Signal ID is required' });
        if (!type || !['verified', 'unverified'].includes(type)) return res.status(400).json({ error: 'Invalid vote type' });
        if (!action || !['add', 'remove'].includes(action)) return res.status(400).json({ error: 'Invalid action' });

        const result = await signalsService.vote(signalId, userId, type, action);
        res.status(200).json(result);
    } catch (error) {
        const msg = (error as any).message;
        if (msg.includes('not found')) return res.status(404).json({ error: msg });
        if (msg.includes('already verified')) return res.status(409).json({ error: msg });
        if (msg.includes('No existing verification')) return res.status(409).json({ error: msg });
        console.error('Signal vote error:', error);
        res.status(500).json({ error: 'Failed to process vote', details: msg });
    }
};

// READ: Detailed trust statistics for a signal
export const getTrustStats = async (req: Request, res: Response) => {
    try {
        const signalId = req.params.signalId as string;
        const stats = await signalsService.getTrustStats(signalId);
        res.status(200).json(stats);
    } catch (error) {
        const msg = (error as any).message;
        if (msg.includes('not found')) return res.status(404).json({ error: msg });
        res.status(500).json({ error: 'Failed to fetch trust statistics' });
    }
};

// DELETE: Moderator removes a harmful signal
export const deleteSignal = async (req: Request, res: Response) => {
    try {
        const signalId = req.params.signalId as string;
        const result = await signalsService.deleteSignal(signalId);
        res.status(200).json(result);
    } catch (error) {
        const msg = (error as any).message;
        if (msg.includes('not found')) return res.status(404).json({ error: msg });
        res.status(500).json({ error: 'Failed to delete signal' });
    }
};

// DELETE: Moderator clears harmful verification entries and resets counts
export const deleteHarmfulVerifications = async (req: Request, res: Response) => {
    try {
        const signalId = req.params.signalId as string;
        const result = await signalsService.deleteHarmfulVerifications(signalId);
        res.status(200).json(result);
    } catch (error) {
        const msg = (error as any).message;
        if (msg.includes('not found')) return res.status(404).json({ error: msg });
        res.status(500).json({ error: 'Failed to delete verifications' });
    }
};

// UPDATE: Flag a signal as potential misinformation (any authenticated user)
export const flagSignal = async (req: Request, res: Response) => {
    try {
        const signalId = req.params.signalId as string;
        const { reason } = req.body;
        const userId = (req as any).userId;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        if (!reason) return res.status(400).json({ error: "Flag reason is required" });

        const result = await signalsService.flagSignal(signalId, reason);
        res.status(200).json(result);
    } catch (error) {
        const msg = (error as any).message;
        if (msg.includes('not found')) return res.status(404).json({ error: msg });
        res.status(500).json({ error: 'Failed to flag signal' });
    }
};
