import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
  phoneHash: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        phoneHash: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Требуется авторизация',
      code: 'UNAUTHORIZED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = {
      id: decoded.userId,
      phoneHash: decoded.phoneHash
    };
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Недействительный токен',
      code: 'INVALID_TOKEN'
    });
  }
};
