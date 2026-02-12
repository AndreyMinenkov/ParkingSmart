import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/login-or-register', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    
    if (!phone || !/^\d{11}$/.test(phone)) {
      return res.status(400).json({ error: 'Неверный формат номера', code: 'INVALID_PHONE' });
    }

    const crypto = require('crypto');
    const phoneHash = crypto.createHash('sha256').update(phone).digest('hex');
    
    // Ищем пользователя
    const userQuery = await pool.query(
      'SELECT id, phone_encrypted, created_at FROM users WHERE phone_hash = $1',
      [phoneHash]
    );

    let user;
    let isNewUser = false;

    if (userQuery.rows.length === 0) {
      // Создаем нового пользователя
      const CryptoJS = require('crypto-js');
      const encrypted = CryptoJS.AES.encrypt(phone, process.env.PHONE_ENCRYPTION_KEY).toString();
      
      const newUser = await pool.query(
        'INSERT INTO users (phone_hash, phone_encrypted) VALUES ($1, $2) RETURNING id, phone_encrypted, created_at',
        [phoneHash, encrypted]
      );
      user = newUser.rows[0];
      isNewUser = true;
    } else {
      user = userQuery.rows[0];
    }

    // Генерируем JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, phoneHash },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Проверяем активную парковку
    const parkingQuery = await pool.query(
      'SELECT id FROM parkings WHERE user_id = $1 AND expires_at > NOW() LIMIT 1',
      [user.id]
    );

    res.json({
      success: true,
      token,
      isNewUser,
      user: {
        id: user.id,
        phone: `+7 *** *** ${phone.slice(-4)}`,
        hasActiveParking: parkingQuery.rows.length > 0,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.listen(port, () => {
  console.log(`⚡️ Server is running on port ${port}`);
});
