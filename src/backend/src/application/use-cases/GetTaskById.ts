/**
 * Get Task By ID Use Case
 */
import TaskRepository from '../../infrastructure/repositories/TaskRepository';
import { TaskResponseDto } from '../dto/TaskResponseDto';

export class GetTaskById {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new Error('Task not found');
    }

    return this.toResponse(task);
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

export default GetTaskById;
