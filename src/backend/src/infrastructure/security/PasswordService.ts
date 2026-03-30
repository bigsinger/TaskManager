/**
 * Password Service Interface
 */
export interface IPasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
  validate(password: string): { isValid: boolean; errors: string[] };
  generate(): Promise<string>;
}

/**
 * Password Service Implementation
 */
import bcrypt from 'bcrypt';

class PasswordService implements IPasswordService {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};:'",.<>/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Common passwords check
    const commonPasswords = [
      'password',
      '12345678',
      'qwerty',
      'abc123',
      'password123'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async generate(): Promise<string> {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};:,.<>/?';
    let password = '';

    while (password.length < length) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }
}

const passwordService = new PasswordService();

export default passwordService;
export { passwordService as PasswordService };
