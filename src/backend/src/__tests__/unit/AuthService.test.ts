/**
 * Auth Service Unit Tests
 */
import { AuthService } from '../../application/services/AuthService';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { PasswordService } from '../../infrastructure/security/password';
import { JwtService } from '../../infrastructure/security/jwt';

// Mock dependencies
jest.mock('../../infrastructure/repositories/UserRepository');
jest.mock('../../infrastructure/security/password');
jest.mock('../../infrastructure/security/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockPasswordService = new PasswordService() as jest.Mocked<PasswordService>;
    mockJwtService = new JwtService() as jest.Mocked<JwtService>;
    
    authService = new AuthService();
    (authService as any).userRepository = mockUserRepository;
    (authService as any).passwordService = mockPasswordService;
    (authService as any).jwtService = mockJwtService;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(null);
      mockPasswordService.hash = jest.fn().mockResolvedValue('hashedPassword');
      mockUserRepository.create = jest.fn().mockResolvedValue({
        id: '1',
        ...userData,
        password: 'hashedPassword',
      });

      const result = await authService.register(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
    });

    it('should throw error when email already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail = jest.fn().mockResolvedValue({
        id: '1',
        email: userData.email,
      });

      await expect(authService.register(userData))
        .rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        email: credentials.email,
        password: 'hashedPassword',
        name: 'Test User',
      };

      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);
      mockPasswordService.compare = jest.fn().mockResolvedValue(true);
      mockJwtService.sign = jest.fn().mockReturnValue('mockToken');

      const result = await authService.login(credentials);

      expect(result.token).toBe('mockToken');
      expect(result.user).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: '1',
        email: credentials.email,
        password: 'hashedPassword',
      };

      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);
      mockPasswordService.compare = jest.fn().mockResolvedValue(false);

      await expect(authService.login(credentials))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
