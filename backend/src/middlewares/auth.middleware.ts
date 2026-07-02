import { Request, Response, NextFunction } from 'express';
import { token, JWTPayload } from '../lib/token';
import { AuthenticationError } from '../lib/errors';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenString = req.cookies.auth || req.headers.authorization?.replace('Bearer ', '');

    if (!tokenString) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = token.verify(tokenString);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AuthenticationError('Invalid token'));
  }
};

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenString = req.cookies.auth || req.headers.authorization?.replace('Bearer ', '');

    if (tokenString) {
      const decoded = token.verify(tokenString);
      req.user = decoded;
    }
  } catch {
    // Silent fail for optional auth
  }

  next();
};
