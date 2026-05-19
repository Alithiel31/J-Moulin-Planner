import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  logger.error('Unhandled error:', err);

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    statusCode: 500,
  });
};
