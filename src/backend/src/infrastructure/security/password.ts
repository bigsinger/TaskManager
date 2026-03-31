/**
 * Password utility module
 * 密码加密和验证工具
 */
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: '密码至少需要6个字符' };
  }
  return { valid: true };
}

/**
 * Generate random password
 */
export function generateRandomPassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateRandomPassword,
};
