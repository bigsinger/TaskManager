/**
 * 注册用例
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword, validatePasswordStrength } from '../../infrastructure/security/password';
import { generateToken } from '../../infrastructure/security/jwt';
import { logAudit } from '../../infrastructure/services/auditLogService';

const prisma = new PrismaClient();

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RegisterOutput {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

/**
 * 注册用例
 */
export const registerUseCase = async (input: RegisterInput): Promise<RegisterOutput> => {
  const { email, password, name, ipAddress, userAgent } = input;

  try {
    // 验证密码强度
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER'
      }
    });

    // 生成 Token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // 记录审计日志
    await logAudit({
      userId: user.id,
      action: 'USER_REGISTER',
      resource: 'User',
      resourceId: user.id,
      details: `User registered: ${email}`,
      ipAddress,
      userAgent,
      status: 'success'
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  } catch (error) {
    // 记录审计日志
    await logAudit({
      action: 'USER_REGISTER',
      resource: 'User',
      details: `Registration failed: ${email} - ${error instanceof Error ? error.message : 'Unknown error'}`,
      ipAddress,
      userAgent,
      status: 'failed'
    });

    throw error;
  }
};
