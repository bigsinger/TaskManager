/**
 * Auth Controller
 */
import { Request, Response, NextFunction } from 'express';
import { JwtAuthenticationService } from '../../infrastructure/security/JwtAuthenticationService';
import { z } from 'zod';

export class AuthController {
  private authService: any;

  constructor() {
    this.authService = JwtAuthenticationService;
  }

  // Register
  async register(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const schema = z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters')
      });

      const result = schema.parse(req.body);

      const { user, token } = await this.authService.register(
        result.email,
        result.password,
        result.name
      );

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const schema = z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(1, 'Password is required')
      });

      const result = schema.parse(req.body);

      const { user, token } = await this.authService.login(
        result.email,
        result.password
      );

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          error: {
            code: 'NO_TOKEN',
            message: 'No token provided'
          }
        });
      }

      const user = await this.authService.getCurrentUser(token);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          error: {
            code: 'NO_TOKEN',
            message: 'No token provided'
          }
        });
      }

      await this.authService.logout(token);

      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
