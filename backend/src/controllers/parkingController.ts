import { Request, Response } from 'express';
import { pool } from '../app';

// POST /api/parkings - создать парковку
export const createParking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { lat, lon, isBlocking } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Не авторизован',
        code: 'UNAUTHORIZED'
      });
    }

    if (!lat || !lon || isBlocking === undefined) {
      return res.status(400).json({ 
        error: 'Не указаны координаты или тип парковки',
        code: 'INVALID_DATA'
      });
    }

    // 1. Завершаем предыдущую активную парковку (если есть)
    await pool.query(
      'UPDATE parkings SET expires_at = NOW() WHERE user_id = $1 AND expires_at > NOW()',
      [userId]
    );

    // 2. Создаем новую парковку
    // Сначала вставляем без location
    const newParking = await pool.query(
      `INSERT INTO parkings (user_id, lat, lon, is_blocking)
       VALUES ($1, $2, $3, $4)
       RETURNING id, lat, lon, is_blocking, created_at, expires_at`,
      [userId, lat, lon, isBlocking]
    );

    const parking = newParking.rows[0];

    // 3. Обновляем location (PostGIS точка)
    await pool.query(
      'UPDATE parkings SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3',
      [lon, lat, parking.id]
    );

    res.status(201).json({
      success: true,
      parking: {
        id: parking.id,
        lat: parking.lat,
        lon: parking.lon,
        isBlocking: parking.is_blocking,
        createdAt: parking.created_at,
        expiresAt: parking.expires_at
      }
    });
  } catch (error) {
    console.error('Create parking error:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      code: 'INTERNAL_ERROR'
    });
  }
};

// GET /api/parkings/current - получить текущую парковку
export const getCurrentParking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Не авторизован',
        code: 'UNAUTHORIZED'
      });
    }

    const parkingQuery = await pool.query(
      `SELECT id, lat, lon, is_blocking, created_at, expires_at
       FROM parkings 
       WHERE user_id = $1 AND expires_at > NOW() 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (parkingQuery.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Нет активной парковки',
        code: 'NO_ACTIVE_PARKING'
      });
    }

    const parking = parkingQuery.rows[0];

    res.json({
      success: true,
      parking: {
        id: parking.id,
        lat: parking.lat,
        lon: parking.lon,
        isBlocking: parking.is_blocking,
        createdAt: parking.created_at,
        expiresAt: parking.expires_at
      }
    });
  } catch (error) {
    console.error('Get current parking error:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      code: 'INTERNAL_ERROR'
    });
  }
};

// DELETE /api/parkings/current - завершить текущую парковку
export const deleteCurrentParking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Не авторизован',
        code: 'UNAUTHORIZED'
      });
    }

    const result = await pool.query(
      'UPDATE parkings SET expires_at = NOW() WHERE user_id = $1 AND expires_at > NOW() RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Нет активной парковки',
        code: 'NO_ACTIVE_PARKING'
      });
    }

    res.json({
      success: true,
      message: 'Парковка завершена'
    });
  } catch (error) {
    console.error('Delete parking error:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      code: 'INTERNAL_ERROR'
    });
  }
};
