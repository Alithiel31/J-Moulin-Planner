import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', '),
      statusCode: 400,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Resource already exists',
        statusCode: 409,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        statusCode: 404,
      });
    }
    logger.error(`Prisma error ${err.code}: ${err.message}`);
    return res.status(400).json({
      success: false,
      message: 'Database operation failed',
      statusCode: 400,
    });
  }

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
