/**
 * Task Repository Implementation
 */
import { PrismaClient } from '@prisma/client';
import { Task } from '../../domain/entities/Task';
import { TaskStatus } from '../../domain/value-objects/TaskStatus';
import { TaskPriority } from '../../domain/value-objects/TaskPriority';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';

const prisma = new PrismaClient();

class TaskRepository implements ITaskRepository {
  async findAll(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    tags?: string[];
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ tasks: Task[]; total: number; page: number; limit: number; totalPages: number; }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    // 搜索功能 - 支持标题和描述的全文搜索
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // 构建排序条件
    const orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Note: SQLite doesn't support array operations, so we filter tags in memory
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          completedBy: {
            select: { id: true, name: true, email: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true }
          },
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          updatedBy: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.task.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tasks: tasks.map(task => new Task(task)),
      total,
      page,
      limit,
      totalPages
    };
  }

  async findById(id: string): Promise<Task | null> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        completedBy: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        updatedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return task ? new Task(task) : null;
  }

  async create(task: Task): Promise<Task> {
    const data: any = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: JSON.stringify(task.tags)
    };

    if (task.createdBy?.id) {
      data.createdBy = { connect: { id: task.createdBy.id } };
    }

    if (task.updatedBy?.id) {
      data.updatedBy = { connect: { id: task.updatedBy.id } };
    }

    const createdTask = await prisma.task.create({ data });

    return new Task(createdTask);
  }

  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    await prisma.task.update({
      where: { id },
      data: updates as any
    });

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        completedBy: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        updatedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return task ? new Task(task) : null;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.task.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    tags?: string[];
  }): Promise<number> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    // Note: SQLite doesn't support array operations, so we filter tags in memory
    const count = await prisma.task.count({ where });

    return count;
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.task.count({
      where: { id }
    });

    return count > 0;
  }
}

export default TaskRepository;
