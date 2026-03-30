/**
 * Express Request Extension
 */
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      userId?: string;
      userEmail?: string;
    }
  }
}

export {};