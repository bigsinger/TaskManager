/**
 * Task Dependency Controller
 * 任务依赖关系管理
 */
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TaskDependencyController {
  /**
   * 添加任务依赖
   */
  async addDependency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId, dependsOnId, type = 'BLOCKS' } = req.body;

      // 检查循环依赖
      const hasCycle = await this.checkCircularDependency(taskId, dependsOnId);
      if (hasCycle) {
        res.status(400).json({ error: 'Cannot create circular dependency' });
        return;
      }

      const dependency = await prisma.taskDependency.create({
        data: {
          taskId,
          dependsOnId,
          type,
        },
        include: {
          dependsOn: {
            select: { id: true, title: true, status: true }
          }
        }
      });

      res.status(201).json(dependency);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除任务依赖
   */
  async removeDependency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.taskDependency.delete({
        where: { id }
      });

      res.json({ message: 'Dependency removed successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取任务的依赖关系
   */
  async getDependencies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      const [dependencies, dependents] = await Promise.all([
        // 当前任务依赖哪些任务
        prisma.taskDependency.findMany({
          where: { taskId },
          include: {
            dependsOn: {
              select: { id: true, title: true, status: true, priority: true }
            }
          }
        }),
        // 哪些任务依赖当前任务
        prisma.taskDependency.findMany({
          where: { dependsOnId: taskId },
          include: {
            task: {
              select: { id: true, title: true, status: true, priority: true }
            }
          }
        })
      ]);

      res.json({
        dependencies: dependencies.map(d => ({
          id: d.id,
          type: d.type,
          task: d.dependsOn
        })),
        dependents: dependents.map(d => ({
          id: d.id,
          type: d.type,
          task: d.task
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 检查任务是否可以开始（所有依赖是否已完成）
   */
  async checkCanStart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      const incompleteDependencies = await prisma.taskDependency.count({
        where: {
          taskId,
          dependsOn: {
            status: { not: 'COMPLETED' }
          }
        }
      });

      res.json({
        canStart: incompleteDependencies === 0,
        blockedBy: incompleteDependencies
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取依赖图（用于甘特图）
   */
  async getDependencyGraph(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await prisma.task.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          dependencies: {
            select: {
              dependsOnId: true,
              type: true
            }
          }
        }
      });

      const nodes = tasks.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate
      }));

      const links = tasks.flatMap(t =>
        t.dependencies.map(d => ({
          source: t.id,
          target: d.dependsOnId,
          type: d.type
        }))
      );

      res.json({ nodes, links });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 检查循环依赖
   */
  private async checkCircularDependency(taskId: string, dependsOnId: string): Promise<boolean> {
    // 检查是否形成循环：如果dependsOnId依赖于taskId，则不能创建
    const visited = new Set<string>();
    const queue = [dependsOnId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === taskId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const deps = await prisma.taskDependency.findMany({
        where: { taskId: current },
        select: { dependsOnId: true }
      });

      queue.push(...deps.map(d => d.dependsOnId));
    }

    return false;
  }
}

export default TaskDependencyController;
