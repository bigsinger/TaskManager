/**
 * Delete Task Use Case
 */
import TaskRepository from '../../infrastructure/repositories/TaskRepository';

export class DeleteTask {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string): Promise<void> {
    // Check if task exists
    const exists = await this.taskRepository.exists(id);

    if (!exists) {
      throw new Error('Task not found');
    }

    // Delete task
    const deleted = await this.taskRepository.delete(id);

    if (!deleted) {
      throw new Error('Failed to delete task');
    }
  }
}

export default DeleteTask;
