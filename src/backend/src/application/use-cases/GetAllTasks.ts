/**
 * Get All Tasks Use Case
 */
import TaskRepository from '../../infrastructure/repositories/TaskRepository';
import { TaskResponseDto } from '../dto/TaskResponseDto';
import { TaskStatus } from '../../domain/value-objects/TaskStatus';
import { TaskPriority } from '../../domain/value-objects/TaskPriority';

export class GetAllTasks {
  constructor(private taskRepository: TaskRepository) {}

  async execute(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ tasks: TaskResponseDto[]; total: number; page: number; limit: number; totalPages: number; }> {
    const repositoryFilters: any = {};

    if (filters?.status !== undefined) {
      repositoryFilters.status = filters.status;
    }

    if (filters?.priority !== undefined) {
      repositoryFilters.priority = filters.priority;
    }

    if (filters?.tags !== undefined) {
      repositoryFilters.tags = filters.tags;
    }

    if (filters?.page !== undefined) {
      repositoryFilters.page = filters.page;
    }

    if (filters?.limit !== undefined) {
      repositoryFilters.limit = filters.limit;
    }

    const result = await this.taskRepository.findAll(repositoryFilters);

    return {
      tasks: result.tasks.map(task => this.toResponse(task)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    };
  }

  private toResponse(task: any): TaskResponseDto {
    const response: TaskResponseDto = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      tags: task.tags,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    };

    if (task.completedBy) {
      response.completedBy = {
        id: task.completedBy.id,
        name: task.completedBy.name,
        email: task.completedBy.email
      };
    }

    if (task.assignedTo) {
      response.assignedTo = {
        id: task.assignedTo.id,
        name: task.assignedTo.name,
        email: task.assignedTo.email
      };
    }

    if (task.createdBy) {
      response.createdBy = {
        id: task.createdBy.id,
        name: task.createdBy.name,
        email: task.createdBy.email
      };
    }

    if (task.updatedBy) {
      response.updatedBy = {
        id: task.updatedBy.id,
        name: task.updatedBy.name,
        email: task.updatedBy.email
      };
    }

    return response;
  }
}

export default GetAllTasks;
