import { Request, Response } from 'express';
import { pool } from '../app';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// POST /api/auth/login-or-register - вход/регистрация по номеру
export const loginOrRegister = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^\d{11}$/.test(phone)) {
      return res.status(400).json({ error: 'Неверный формат номера', code: 'INVALID_PHONE' });
    }

    const phoneHash = crypto.createHash('sha256').update(phone).digest('hex');

    // Ищем пользователя
    const userQuery = await pool.query(
      'SELECT id, phone_encrypted, created_at FROM users WHERE phone_hash = $1',
      [phoneHash]
    );

    let user;
    let isNewUser = false;

    if (userQuery.rows.length === 0) {
      // Создаем нового пользователя с шифрованием через Node.js crypto
      const algorithm = 'aes-256-cbc';
      const key = crypto.createHash('sha256').update(process.env.PHONE_ENCRYPTION_KEY!).digest();
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      
      let encrypted = cipher.update(phone, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Сохраняем IV вместе с зашифрованными данными
      const encryptedWithIv = iv.toString('hex') + ':' + encrypted;

      const newUser = await pool.query(
        'INSERT INTO users (phone_hash, phone_encrypted) VALUES ($1, $2) RETURNING id, phone_encrypted, created_at',
        [phoneHash, encryptedWithIv]
      );
      user = newUser.rows[0];
      isNewUser = true;
    } else {
      user = userQuery.rows[0];
      // Пользователь существует - не нужно перешифровывать
    }

    // Генерируем JWT
    const token = jwt.sign(
      { userId: user.id, phoneHash },
      process.env.JWT_SECRET!,
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
};

// GET /api/auth/me - получить текущего пользователя
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Не авторизован',
        code: 'UNAUTHORIZED'
      });
    }

    const userQuery = await pool.query(
      'SELECT id, phone_encrypted, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Пользователь не найден',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = userQuery.rows[0];

    const parkingQuery = await pool.query(
      'SELECT id, is_blocking, expires_at FROM parkings WHERE user_id = $1 AND expires_at > NOW() LIMIT 1',
      [userId]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        hasActiveParking: parkingQuery.rows.length > 0,
        activeParking: parkingQuery.rows[0] || null,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      code: 'INTERNAL_ERROR'
    });
  }
};

// POST /api/auth/logout - выход из аккаунта
export const logout = async (req: Request, res: Response) => {
  res.json({ 
    success: true,
    message: 'Выход выполнен'
  });
};
