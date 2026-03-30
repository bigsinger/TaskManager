/**
 * Error Handler Middleware
 */
import { Request, Response, NextFunction } from 'express';
import WinstonLogger from '../../infrastructure/logging/WinstonLogger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  WinstonLogger.error('Error:', err);

  const statusCode = (err as any).statusCode || 500;
  const errorCode = (err as any).code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: err.message || 'Internal server error',
      ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack })
    }
  });
};

export const notFoundHandler = (
  _req: Request,
  res: Response
): void => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
};
