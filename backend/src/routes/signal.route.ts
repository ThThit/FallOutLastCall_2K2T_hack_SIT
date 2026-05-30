import { Router } from 'express';
import {
    getSignal,
    sendSignal,
    verifySignal,
    getTrustStats,
    deleteSignal,
    deleteHarmfulVerifications,
    flagSignal
} from '../controllers/singals.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { moderatorMiddleware } from '../middlewares/moderator.middleware.js';

const router = Router();

// Public
router.get('/', getSignal);

// Authenticated
router.post('/', authMiddleware, sendSignal);
router.post('/:signalId/verify', authMiddleware, verifySignal);
router.post('/:signalId/flag', authMiddleware, flagSignal);

// Read trust data (public)
router.get('/:signalId/trust', getTrustStats);

// Moderator/Admin only
router.delete('/:signalId', authMiddleware, moderatorMiddleware, deleteSignal);
router.delete('/:signalId/verifications', authMiddleware, moderatorMiddleware, deleteHarmfulVerifications);

export default router;
