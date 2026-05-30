import { Router } from 'express';
import {
    verifySignal,
    getTrustStats,
    deleteSignal,
    deleteHarmfulVerifications,
    flagSignal
} from '../controllers/singals.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { moderatorMiddleware } from '../middlewares/moderator.middleware.js';

const router = Router();

// NOTE: GET / and POST / signals are owned by Peter's signal module (mounted first).
// This router only adds thit's trust / verification / moderation sub-routes.

// Authenticated
router.post('/:signalId/verify', authMiddleware, verifySignal);
router.post('/:signalId/flag', authMiddleware, flagSignal);

// Public read of trust data
router.get('/:signalId/trust', getTrustStats);

// Moderator/Admin only
router.delete('/:signalId', authMiddleware, moderatorMiddleware, deleteSignal);
router.delete('/:signalId/verifications', authMiddleware, moderatorMiddleware, deleteHarmfulVerifications);

export default router;
