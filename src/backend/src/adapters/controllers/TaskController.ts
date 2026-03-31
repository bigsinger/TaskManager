/**
 * Task Controller
 */
import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../../application/services/TaskService';
import { CreateTaskDto } from '../../application/dto/CreateTaskDto';
import { UpdateTaskDto } from '../../application/dto/UpdateTaskDto';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  // Create task
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Use the first user in the database if no user is authenticated
      const userId = req.user?.userId || null;
      const dto: CreateTaskDto = req.body;

      const result = await this.taskService.createTask(dto, userId);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Get all tasks
  async getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        status: req.query['status'] as string,
        priority: req.query['priority'] as string,
        tags: req.query['tags'] as string ? (req.query['tags'] as string).split(',') : undefined,
        search: req.query['search'] as string,
        sortBy: req.query['sortBy'] as string,
        sortOrder: req.query['sortOrder'] as 'asc' | 'desc',
        page: req.query['page'] ? parseInt(req.query['page'] as string) : undefined,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : undefined
      };

      const result = await this.taskService.getAllTasks(filters);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Get task by ID
  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await this.taskService.getTaskById(id || '');

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Update task
  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'anonymous';
      const dto: UpdateTaskDto = req.body;

      const result = await this.taskService.updateTask(id || '', dto, userId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Delete task
  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await this.taskService.deleteTask(id || '');

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Get task stats
  async getTaskStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.taskService.getTaskStats();

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
