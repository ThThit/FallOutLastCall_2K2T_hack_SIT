import { Router } from 'express';
import { getSignal, sendSignal } from '../controllers/singals.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getSignal);
router.post('/', authMiddleware, sendSignal);

export default router;