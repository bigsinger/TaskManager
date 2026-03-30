/**
 * Task Service
 */
import { CreateTask } from '../use-cases/CreateTask';
import { GetAllTasks } from '../use-cases/GetAllTasks';
import { GetTaskById } from '../use-cases/GetTaskById';
import { UpdateTask } from '../use-cases/UpdateTask';
import { DeleteTask } from '../use-cases/DeleteTask';
import TaskRepository from '../../infrastructure/repositories/TaskRepository';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async createTask(dto: any, userId: string | null): Promise<any> {
    const createTask = new CreateTask(this.taskRepository);
    return await createTask.execute(dto, userId);
  }

  async getAllTasks(filters?: any): Promise<any> {
    const getAllTasks = new GetAllTasks(this.taskRepository);
    return await getAllTasks.execute(filters);
  }

  async getTaskById(id: string): Promise<any> {
    const getTaskById = new GetTaskById(this.taskRepository);
    return await getTaskById.execute(id);
  }

  async updateTask(id: string, dto: any, userId: string): Promise<any> {
    const updateTask = new UpdateTask(this.taskRepository);
    return await updateTask.execute(id, dto, userId);
  }

  async deleteTask(id: string): Promise<void> {
    const deleteTask = new DeleteTask(this.taskRepository);
    await deleteTask.execute(id);
  }

  async getTaskStats(): Promise<any> {
    const total = await this.taskRepository.count();
    const pending = await this.taskRepository.count({ status: 'PENDING' as any });
    const inProgress = await this.taskRepository.count({ status: 'IN_PROGRESS' as any });
    const completed = await this.taskRepository.count({ status: 'COMPLETED' as any });
    const cancelled = await this.taskRepository.count({ status: 'CANCELLED' as any });

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled
    };
  }
}

export default TaskService;
