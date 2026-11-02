import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { HttpError } from '../utils/http';

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const signToken = (userId: string) => jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '30d' });

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next(new HttpError(401, 'Authentication required'));
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as jwt.JwtPayload;
    req.userId = String(payload.sub);
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired session'));
  }
};
