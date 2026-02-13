import { Router } from 'express';
import { createParking, getCurrentParking, deleteCurrentParking } from '../controllers/parkingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Все маршруты парковок требуют аутентификации
router.post('/', authenticateToken, createParking);
router.get('/current', authenticateToken, getCurrentParking);
router.delete('/current', authenticateToken, deleteCurrentParking);

export default router;
