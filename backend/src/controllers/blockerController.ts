import { Request, Response } from 'express';
import { pool } from '../app';
import { decryptPhoneNumber } from '../utils/decryptPhone';

// GET /api/blockers/nearby - найти блокирующие парковки в радиусе 4 метров
export const getNearbyBlockers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { lat, lon } = req.query;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Не авторизован',
        code: 'UNAUTHORIZED'
      });
    }

    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Не указаны координаты',
        code: 'INVALID_COORDINATES'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    // PostGIS запрос: поиск в радиусе 4 метров
    const blockersQuery = await pool.query(
      `SELECT 
        p.id,
        p.user_id,
        p.lat,
        p.lon,
        p.created_at,
        p.expires_at,
        u.phone_encrypted,
        -- Расстояние в метрах
        ST_Distance(
          p.location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance,
        -- ГЛОБАЛЬНАЯ проверка: звонил ли КТО-НИБУДЬ этому блокирующему
        EXISTS(
          SELECT 1 FROM calls 
          WHERE blocker_id = p.user_id  -- любые звонки этому блокирующему
        ) as has_called
      FROM parkings p
      JOIN users u ON p.user_id = u.id
      WHERE 
        p.is_blocking = true 
        AND p.expires_at > NOW()
        AND p.user_id != $3
        AND ST_DWithin(
          p.location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          4  -- радиус в метрах, строго по ТЗ
        )
      ORDER BY 
        has_called ASC,  -- сначала те, кому НЕ звонили (приоритет)
        distance ASC     -- потом по расстоянию
      LIMIT 50`,
      [longitude, latitude, userId]
    );

    // Форматируем номера телефонов - ПОЛНЫЙ номер
    const blockers = blockersQuery.rows.map(row => {
      // Дешифруем полный номер
      const fullPhone = decryptPhoneNumber(row.phone_encrypted);
      
      return {
        id: row.user_id,
        parkingId: row.id,
        lat: row.lat,
        lon: row.lon,
        distance: Math.round(row.distance * 100) / 100,
        phone: fullPhone,
        hasCalled: row.has_called, // true если КТО-ТО уже звонил
        createdAt: row.created_at,
        expiresAt: row.expires_at
      };
    });

    res.json({
      success: true,
      count: blockers.length,
      blockers: blockers
    });

  } catch (error) {
    console.error('Get nearby blockers error:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      code: 'INTERNAL_ERROR'
    });
  }
};
