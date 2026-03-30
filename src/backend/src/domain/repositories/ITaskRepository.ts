/**
 * Task Repository Interface
 */
import { Task } from '../../domain/entities/Task';
import { TaskStatus } from '../../domain/value-objects/TaskStatus';
import { TaskPriority } from '../../domain/value-objects/TaskPriority';

export interface ITaskRepository {
  findAll(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ tasks: Task[]; total: number; page: number; limit: number; totalPages: number; }>;

  findById(id: string): Promise<Task | null>;

  create(task: Task): Promise<Task>;

  update(id: string, updates: Partial<Task>): Promise<Task | null>;

  delete(id: string): Promise<boolean>;

  count(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    tags?: string[];
  }): Promise<number>;

  exists(id: string): Promise<boolean>;
}
