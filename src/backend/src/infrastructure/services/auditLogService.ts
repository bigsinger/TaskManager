/**
 * 审计日志服务
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogInput {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

/**
 * 记录审计日志
 */
export const logAudit = async (input: AuditLogInput) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        details: input.details,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        status: input.status || 'success'
      }
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};

/**
 * 查询审计日志
 */
export const getAuditLogs = async (filters: AuditLogFilters) => {
  const where: any = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.resource) {
    where.resource = filters.resource;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: ((filters.page || 1) - 1) * (filters.pageSize || 20),
    take: filters.pageSize || 20,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  const total = await prisma.auditLog.count({ where });

  return { logs, total };
};

/**
 * 获取审计日志详情
 */
export const getAuditLogById = async (id: string) => {
  return await prisma.auditLog.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });
};

/**
 * 删除审计日志
 */
export const deleteAuditLog = async (id: string) => {
  return await prisma.auditLog.delete({
    where: { id }
  });
};

/**
 * 清理旧审计日志
 */
export const cleanupOldAuditLogs = async (daysToKeep: number = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate
      }
    }
  });

  return result;
};
