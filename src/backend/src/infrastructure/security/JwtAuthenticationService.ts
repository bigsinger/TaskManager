/**
 * Authentication Service Interface
 */
export interface IAuthenticationService {
  register(email: string, password: string, name: string): Promise<{ user: any; token: string }>;
  login(email: string, password: string): Promise<{ user: any; token: string }>;
  logout(token: string): Promise<void>;
  verifyToken(token: string): Promise<any>;
  getCurrentUser(token: string): Promise<any>;
}

/**
 * JWT Authentication Service Implementation
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class JwtAuthenticationService implements IAuthenticationService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env['JWT_SECRET'] || 'your-secret-key-change-in-production';
    this.jwtExpiresIn = process.env['JWT_EXPIRES_IN'] || '24h';
  }

  async register(email: string, password: string, name: string): Promise<{ user: any; token: string }> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        role: 'USER'
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn } as jwt.SignOptions
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn } as jwt.SignOptions
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async logout(token: string): Promise<void> {
    // In a real system, we would add the token to a blacklist
    // For now, we just verify the token is valid
    try {
      jwt.verify(token, this.jwtSecret);
    } catch (error) {
      // Token is invalid, just ignore
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getCurrentUser(token: string): Promise<any> {
    const decoded = await this.verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}

const jwtAuthenticationService = new JwtAuthenticationService();

export default jwtAuthenticationService;
export { jwtAuthenticationService as JwtAuthenticationService };
