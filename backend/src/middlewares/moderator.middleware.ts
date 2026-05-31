import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import prisma from '../lib/prisma.js';

export async function moderatorMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || (user.role !== 'MODERATOR' && user.role !== 'ADMIN')) {
        res.status(403).json({ error: 'Forbidden: moderator access required' });
        return;
    }

    next();
}
