import { Router } from 'express';
import { getNearbyBlockers } from '../controllers/blockerController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Все маршруты требуют аутентификации
router.get('/nearby', authenticateToken, getNearbyBlockers);

export default router;
