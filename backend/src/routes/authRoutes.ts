import { Router } from 'express';
import { loginOrRegister, getMe, logout } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Публичные маршруты (без токена)
router.post('/login-or-register', loginOrRegister);

// Защищенные маршруты (требуют токен)
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

export default router;
