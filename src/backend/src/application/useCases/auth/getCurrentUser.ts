/**
 * 获取当前用户用例
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GetCurrentUserInput {
  userId: string;
}

export interface GetCurrentUserOutput {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 获取当前用户用例
 */
export const getCurrentUserUseCase = async (
  input: GetCurrentUserInput
): Promise<GetCurrentUserOutput> => {
  const { userId } = input;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
