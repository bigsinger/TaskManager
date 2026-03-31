/**
 * 登出用例
 */

import { PrismaClient } from '@prisma/client';
import { logAudit } from '../../infrastructure/services/auditLogService';

const prisma = new PrismaClient();

export interface LogoutInput {
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * 登出用例
 */
export const logoutUseCase = async (input: LogoutInput): Promise<void> => {
  const { userId, token, ipAddress, userAgent } = input;

  try {
    // 删除会话
    await prisma.session.deleteMany({
      where: {
        userId,
        token
      }
    });

    // 记录审计日志
    await logAudit({
      userId,
      action: 'USER_LOGOUT',
      resource: 'User',
      resourceId: userId,
      details: 'User logged out',
      ipAddress,
      userAgent,
      status: 'success'
    });
  } catch (error) {
    // 记录审计日志
    await logAudit({
      userId,
      action: 'USER_LOGOUT',
      resource: 'User',
      details: `Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ipAddress,
      userAgent,
      status: 'failed'
    });

    throw error;
  }
};
