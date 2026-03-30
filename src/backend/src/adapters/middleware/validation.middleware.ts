/**
 * Validation Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateMiddleware = (schema: z.ZodObject<any, any, any, any, any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req.body);

      // Replace request body with validated data
      req.body = result.data;
      next();
    } catch (error: any) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.errors
        }
      });
    }
  };
};

export default validateMiddleware;
