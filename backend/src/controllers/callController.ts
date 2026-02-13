import { Request, Response } from 'express';
import { pool } from '../app';
import { decryptPhoneNumber } from '../utils/decryptPhone';

// POST /api/calls - отметить звонок блокирующему водителю
export const markCall = async (req: Request, res: Response) => {
  try {
    const callerId = req.user?.id;  // кто звонит (текущий пользователь)
    const { blockerId } = req.body; // кому звонят (блокирующий)

    if (!callerId) {
      return res.status(401).json({ 
        error: 'Не авторизован',
        code: 'UNAUTHORIZED'
      });
    }

    if (!blockerId) {
      return res.status(400).json({ 
        error: 'Не указан блокирующий водитель',
        code: 'INVALID_DATA'
      });
    }

    if (callerId === blockerId) {
      return res.status(400).json({ 
        error: 'Нельзя звонить самому себе',
        code: 'SELF_CALL'
      });
    }

    // Проверяем, что блокирующий действительно имеет активную блокирующую парковку
    const blockerCheck = await pool.query(
      `SELECT id FROM parkings 
       WHERE user_id = $1 
         AND is_blocking = true 
         AND expires_at > NOW() 
       LIMIT 1`,
      [blockerId]
    );

    if (blockerCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Блокирующий водитель не найден или его парковка истекла',
        code: 'BLOCKER_NOT_FOUND'
      });
    }

    // Сохраняем отметку о звонке
    const callQuery = await pool.query(
      `INSERT INTO calls (caller_id, blocker_id, called_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (blocker_id, caller_id) 
       DO UPDATE SET called_at = NOW()
       RETURNING id, called_at`,
      [callerId, blockerId]
    );

    res.status(201).json({
      success: true,
      call: {
        id: callQuery.rows[0].id,
        blockerId,
        calledAt: callQuery.rows[0].called_at
      }
    });

  } catch (error) {
    console.error('Mark call error:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      code: 'INTERNAL_ERROR'
    });
  }
};

// GET /api/calls/history - получить историю звонков
export const getCallHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Не авторизован',
        code: 'UNAUTHORIZED'
      });
    }

    // Звонки, которые совершил пользователь
    const callsQuery = await pool.query(
      `SELECT 
         c.id,
         c.blocker_id,
         c.called_at,
         u.phone_encrypted
       FROM calls c
       JOIN users u ON c.blocker_id = u.id
       WHERE c.caller_id = $1
       ORDER BY c.called_at DESC
       LIMIT 50`,
      [userId]
    );

    const calls = callsQuery.rows.map(row => ({
      id: row.id,
      blockerId: row.blocker_id,
      calledAt: row.called_at,
      phone: decryptPhoneNumber(row.phone_encrypted) // ПОЛНЫЙ номер
    }));

    res.json({
      success: true,
      count: calls.length,
      calls
    });

  } catch (error) {
    console.error('Get call history error:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      code: 'INTERNAL_ERROR'
    });
  }
};
