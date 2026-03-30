/**
 * Authentication Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { JwtAuthenticationService } from '../../infrastructure/security/JwtAuthenticationService';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'NO_TOKEN',
          message: 'No token provided'
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = await JwtAuthenticationService.verifyToken(token);
      req.user = decoded;
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      next();
    } catch (error) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error'
      }
    });
  }
};

export default authMiddleware;
