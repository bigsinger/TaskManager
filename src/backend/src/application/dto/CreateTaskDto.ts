/**
 * Create Task DTO
 */
import { TaskPriority } from '../../domain/value-objects/TaskPriority';

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

export default CreateTaskDto;
