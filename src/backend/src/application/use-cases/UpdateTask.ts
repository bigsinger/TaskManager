/**
 * Update Task Use Case
 */
import TaskRepository from '../../infrastructure/repositories/TaskRepository';
import { UpdateTaskDto } from '../dto/UpdateTaskDto';
import { TaskResponseDto } from '../dto/TaskResponseDto';

export class UpdateTask {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string, dto: UpdateTaskDto, userId: string): Promise<TaskResponseDto> {
    // Validate DTO
    this.validate(dto);

    // Get existing task
    const existingTask = await this.taskRepository.findById(id);

    if (!existingTask) {
      throw new Error('Task not found');
    }

    // Prepare updates
    const updates: any = {};

    if (dto.title !== undefined) {
      updates.title = dto.title;
    }

    if (dto.description !== undefined) {
      updates.description = dto.description;
    }

    if (dto.status !== undefined) {
      updates.status = dto.status;

      // If status is completed, set completedAt
      if (dto.status === 'COMPLETED') {
        updates.completedAt = new Date();
        updates.completedBy = { connect: { id: userId } };
      }
    }

    if (dto.priority !== undefined) {
      updates.priority = dto.priority;
    }

    if (dto.dueDate !== undefined) {
      updates.dueDate = new Date(dto.dueDate);
    }

    if (dto.tags !== undefined) {
      updates.tags = dto.tags;
    }

    if (dto.assignedToId !== undefined) {
      updates.assignedTo = { connect: { id: dto.assignedToId } };
    }

    // Update task in database
    const updatedTask = await this.taskRepository.update(id, updates);

    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    // Return response
    return this.toResponse(updatedTask);
  }

  private validate(dto: UpdateTaskDto): void {
    if (dto.title !== undefined && dto.title.length > 200) {
      throw new Error('Title must be less than 200 characters');
    }

    if (dto.description !== undefined && dto.description.length > 1000) {
      throw new Error('Description must be less than 1000 characters');
    }

    if (dto.tags !== undefined && dto.tags.length > 10) {
      throw new Error('Maximum 10 tags allowed');
    }
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

export default UpdateTask;
