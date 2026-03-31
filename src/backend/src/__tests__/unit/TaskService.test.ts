/**
 * Task Service Unit Tests
 */
import { TaskService } from '../../application/services/TaskService';
import TaskRepository from '../../infrastructure/repositories/TaskRepository';

// Mock TaskRepository
jest.mock('../../infrastructure/repositories/TaskRepository');

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    mockTaskRepository = new TaskRepository() as jest.Mocked<TaskRepository>;
    taskService = new TaskService();
    (taskService as any).taskRepository = mockTaskRepository;
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'PENDING',
        priority: 'MEDIUM',
      };

      const mockCreatedTask = {
        id: '1',
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.create = jest.fn().mockResolvedValue(mockCreatedTask);

      const result = await taskService.createTask(taskData, 'user-1');

      expect(result).toBeDefined();
      expect(result.title).toBe(taskData.title);
    });

    it('should throw error when title is empty', async () => {
      const taskData = {
        title: '',
        description: 'Test Description',
        status: 'PENDING',
        priority: 'MEDIUM',
      };

      await expect(taskService.createTask(taskData, 'user-1'))
        .rejects.toThrow();
    });
  });

  describe('getAllTasks', () => {
    it('should return paginated tasks', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'PENDING' },
        { id: '2', title: 'Task 2', status: 'COMPLETED' },
      ];

      mockTaskRepository.findAll = jest.fn().mockResolvedValue({
        tasks: mockTasks,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await taskService.getAllTasks({ page: 1, limit: 20 });

      expect(result.tasks).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter tasks by status', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'PENDING' },
      ];

      mockTaskRepository.findAll = jest.fn().mockResolvedValue({
        tasks: mockTasks,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await taskService.getAllTasks({ status: 'PENDING' as any });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].status).toBe('PENDING');
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const taskId = '1';
      const updateData = {
        title: 'Updated Task',
        status: 'COMPLETED',
      };

      const mockUpdatedTask = {
        id: taskId,
        ...updateData,
        updatedAt: new Date(),
      };

      mockTaskRepository.update = jest.fn().mockResolvedValue(mockUpdatedTask);

      const result = await taskService.updateTask(taskId, updateData, 'user-1');

      expect(result.title).toBe(updateData.title);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const taskId = '1';

      mockTaskRepository.delete = jest.fn().mockResolvedValue(undefined);

      await expect(taskService.deleteTask(taskId)).resolves.not.toThrow();
    });
  });
});
