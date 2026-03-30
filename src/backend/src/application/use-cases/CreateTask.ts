/**
 * Create Task Use Case
 */
import { Task } from '../../domain/entities/Task';
import { CreateTaskDto } from '../dto/CreateTaskDto';
import TaskRepository from '../../infrastructure/repositories/TaskRepository';
import { TaskResponseDto } from '../dto/TaskResponseDto';

export class CreateTask {
  constructor(private taskRepository: TaskRepository) {}

  async execute(dto: CreateTaskDto, userId: string | null): Promise<TaskResponseDto> {
    // Validate DTO
    this.validate(dto);

    // Create task entity
    const task = new Task({
      id: crypto.randomUUID(),
      title: dto.title,
      description: dto.description || null,
      status: dto.status || 'PENDING',
      priority: dto.priority || 'MEDIUM',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      tags: dto.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId ? { id: userId } : undefined
    });

    // Validate task
    const validation = task.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Create task in database
    const createdTask = await this.taskRepository.create(task);

    // Return response
    return this.toResponse(createdTask);
  }

  private validate(dto: CreateTaskDto): void {
    if (!dto.title || dto.title.trim() === '') {
      throw new Error('Title is required');
    }

    if (dto.title && dto.title.length > 200) {
      throw new Error('Title must be less than 200 characters');
    }

    if (dto.description && dto.description.length > 1000) {
      throw new Error('Description must be less than 1000 characters');
    }

    if (dto.tags && dto.tags.length > 10) {
      throw new Error('Maximum 10 tags allowed');
    }
  }

  private toResponse(task: Task): TaskResponseDto {
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

    if (task.createdBy) {
      response.createdBy = {
        id: task.createdBy.id,
        name: task.createdBy.name,
        email: task.createdBy.email
      };
    }

    if (task.assignedTo) {
      response.assignedTo = {
        id: task.assignedTo.id,
        name: task.assignedTo.name,
        email: task.assignedTo.email
      };
    }

    if (task.updatedBy) {
      response.updatedBy = {
        id: task.updatedBy.id,
        name: task.updatedBy.name,
        email: task.updatedBy.email
      };
    }

    if (task.completedBy) {
      response.completedBy = {
        id: task.completedBy.id,
        name: task.completedBy.name,
        email: task.completedBy.email
      };
    }

    return response;
  }
}

export default CreateTask;
