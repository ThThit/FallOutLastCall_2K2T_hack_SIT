import { Router } from 'express';
import { getLeaderboard, getMyStats } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/me/stats', authMiddleware, getMyStats);

export default router;
