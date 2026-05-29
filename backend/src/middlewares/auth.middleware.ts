import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import authService from '../services/auth.service.js';

export function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = headerToken ?? (req as any).cookies?.token ?? null;

    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    try {
        const payload = authService.verifyToken(token);
        req.userId = payload.id;
        req.user = { id: payload.id, username: payload.username };
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
