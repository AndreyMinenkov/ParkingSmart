import { Router } from 'express';
import { markCall, getCallHistory } from '../controllers/callController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Все маршруты требуют аутентификации
router.post('/', authenticateToken, markCall);
router.get('/history', authenticateToken, getCallHistory);

export default router;
