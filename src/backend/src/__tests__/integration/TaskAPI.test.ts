/**
 * Task API Integration Tests
 */
import request from 'supertest';
import express from 'express';
import taskRoutes from '../../adapters/routes/task.routes';
import { prisma } from '../setup';

const app = express();
app.use(express.json());
app.use('/api', taskRoutes);

describe('Task API Integration', () => {
  let authToken: string;

  beforeAll(async () => {
    // 创建测试用户并获取token
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      },
    });

    // 模拟登录获取token
    authToken = 'mock-jwt-token';
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Integration Test Task',
        description: 'Test Description',
        status: 'PENDING',
        priority: 'HIGH',
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(taskData.title);
    });

    it('should return 400 for invalid task data', async () => {
      const invalidData = {
        title: '', // Empty title
        status: 'PENDING',
      };

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // 创建测试任务
      await prisma.task.createMany({
        data: [
          { title: 'Task 1', status: 'PENDING', priority: 'MEDIUM' },
          { title: 'Task 2', status: 'COMPLETED', priority: 'HIGH' },
        ],
      });
    });

    it('should return list of tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      expect(Array.isArray(response.body.tasks)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks.every((t: any) => t.status === 'PENDING')).toBe(true);
    });

    it('should search tasks by keyword', async () => {
      const response = await request(app)
        .get('/api/tasks?search=Task 1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks.length).toBeGreaterThan(0);
    });

    it('should sort tasks by created date', async () => {
      const response = await request(app)
        .get('/api/tasks?sortBy=createdAt&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const tasks = response.body.tasks;
      if (tasks.length > 1) {
        const firstDate = new Date(tasks[0].createdAt);
        const secondDate = new Date(tasks[1].createdAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to Update',
          status: 'PENDING',
          priority: 'MEDIUM',
        },
      });
      taskId = task.id;
    });

    it('should update an existing task', async () => {
      const updateData = {
        title: 'Updated Task Title',
        status: 'COMPLETED',
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app)
        .put('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to Delete',
          status: 'PENDING',
        },
      });
      taskId = task.id;
    });

    it('should delete an existing task', async () => {
      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 验证任务已被删除
      const deletedTask = await prisma.task.findUnique({
        where: { id: taskId },
      });
      expect(deletedTask).toBeNull();
    });
  });
});
