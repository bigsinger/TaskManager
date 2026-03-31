/**
 * Test Setup
 */
import { PrismaClient } from '@prisma/client';

// 创建测试数据库客户端
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./test.db',
    },
  },
});

// 全局测试设置
beforeAll(async () => {
  // 清理测试数据库
  await prisma.$executeRaw`DELETE FROM "AuditLog"`;
  await prisma.$executeRaw`DELETE FROM "Task"`;
  await prisma.$executeRaw`DELETE FROM "User"`;
});

// 每个测试后清理
afterEach(async () => {
  // 清理测试数据
  await prisma.$executeRaw`DELETE FROM "AuditLog"`;
  await prisma.$executeRaw`DELETE FROM "Task"`;
  await prisma.$executeRaw`DELETE FROM "User"`;
});

// 测试完成后关闭连接
afterAll(async () => {
  await prisma.$disconnect();
});

// 导出 prisma 供测试使用
export { prisma };
