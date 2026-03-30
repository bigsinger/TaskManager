/**
 * User Repository Implementation
 */
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

const prisma = new PrismaClient();

class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<any | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    return user;
  }

  async findById(id: string): Promise<any | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    return user;
  }

  async create(user: any): Promise<any> {
    const createdUser = await prisma.user.create({
      data: user
    });

    return createdUser;
  }

  async update(id: string, updates: any): Promise<any | null> {
    await prisma.user.update({
      where: { id },
      data: updates
    });

    const user = await prisma.user.findUnique({
      where: { id }
    });

    return user;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { id }
    });

    return count > 0;
  }

  async count(): Promise<number> {
    const count = await prisma.user.count();

    return count;
  }
}

export default UserRepository;
