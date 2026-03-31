/**
 * 登录用例
 */

import { PrismaClient } from '@prisma/client';
import { comparePassword } from '../../infrastructure/security/password';
import { generateToken } from '../../infrastructure/security/jwt';
import { logAudit } from '../../infrastructure/services/auditLogService';

const prisma = new PrismaClient();

export interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginOutput {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

/**
 * 登录用例
 */
export const loginUseCase = async (input: LoginInput): Promise<LoginOutput> => {
  const { email, password, ipAddress, userAgent } = input;

  try {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // 记录审计日志
      await logAudit({
        action: 'USER_LOGIN',
        resource: 'User',
        details: `Login failed: User not found - ${email}`,
        ipAddress,
        userAgent,
        status: 'failed'
      });

      throw new Error('Invalid email or password');
    }

    // 检查用户是否激活
    if (!user.isActive) {
      // 记录审计日志
      await logAudit({
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'User',
        details: `Login failed: Account deactivated - ${email}`,
        ipAddress,
        userAgent,
        status: 'failed'
      });

      throw new Error('Account is deactivated');
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      // 记录审计日志
      await logAudit({
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'User',
        details: `Login failed: Invalid password - ${email}`,
        ipAddress,
        userAgent,
        status: 'failed'
      });

      throw new Error('Invalid email or password');
    }

    // 生成 Token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // 记录审计日志
    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user.id,
      details: `User logged in: ${email}`,
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
    throw error;
  }
};
