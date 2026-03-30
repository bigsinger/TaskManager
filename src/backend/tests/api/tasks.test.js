const request = require('supertest');
const app = require('../src/app');
const { Task } = require('../src/models');

describe('Task API', () => {
  // 测试数据
  const testTask = {
    title: 'Test Task',
    description: 'This is a test task',
    status: 'pending',
    tags: 'test,important',
  };

  let taskId;

  // 在所有测试之前执行
  beforeAll(async () => {
    // 确保数据库连接
    await Task.sequelize.sync();
  });

  // 在每个测试之前执行
  beforeEach(async () => {
    // 清空测试数据
    await Task.destroy({ where: {} });
  });

  // 在所有测试之后执行
  afterAll(async () => {
    // 关闭数据库连接
    await Task.sequelize.close();
  });

  describe('GET /api/tasks', () => {
    it('应该返回空任务列表', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toEqual([]);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(0);
    });

    it('应该返回任务列表', async () => {
      // 创建测试数据
      await Task.create(testTask);

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toBe(testTask.title);
      expect(response.body.pagination.total).toBe(1);
    });

    it('应该支持分页', async () => {
      // 创建多个测试任务
      await Task.bulkCreate(
        Array.from({ length: 25 }, (_, i) => ({
          title: `Task ${i + 1}`,
          description: `Description ${i + 1}`,
          status: 'pending',
        }))
      );

      const response = await request(app).get('/api/tasks?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(10);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBe(25);
      expect(response.body.pagination.totalPages).toBe(3);
    });

    it('应该支持按状态筛选', async () => {
      // 创建不同状态的任务
      await Task.bulkCreate([
        { title: 'Task 1', status: 'pending' },
        { title: 'Task 2', status: 'in-progress' },
        { title: 'Task 3', status: 'completed' },
      ]);

      const response = await request(app).get('/api/tasks?status=pending');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe('pending');
    });

    it('应该支持按标签筛选', async () => {
      // 创建不同标签的任务
      await Task.bulkCreate([
        { title: 'Task 1', tags: 'work,important' },
        { title: 'Task 2', tags: 'personal' },
        { title: 'Task 3', tags: 'work,urgent' },
      ]);

      const response = await request(app).get('/api/tasks?tags=work');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(2);
    });

    it('应该支持排序', async () => {
      // 创建多个任务
      await Task.bulkCreate([
        { title: 'Task A', createdAt: '2026-03-27T10:00:00.000Z' },
        { title: 'Task B', createdAt: '2026-03-27T11:00:00.000Z' },
        { title: 'Task C', createdAt: '2026-03-27T09:00:00.000Z' },
      ]);

      const response = await request(app).get('/api/tasks?sort=createdAt&order=desc');

      expect(response.status).toBe(200);
      expect(response.body.tasks[0].title).toBe('Task B');
      expect(response.body.tasks[2].title).toBe('Task C');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('应该返回单个任务', async () => {
      const task = await Task.create(testTask);

      const response = await request(app).get(`/api/tasks/${task.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(task.id);
      expect(response.body.title).toBe(testTask.title);
    });

    it('应该返回 404 当任务不存在', async () => {
      const response = await request(app).get('/api/tasks/99999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/tasks', () => {
    it('应该创建新任务', async () => {
      const response = await request(app).post('/api/tasks').send(testTask);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(testTask.title);
      expect(response.body.description).toBe(testTask.description);
      expect(response.body.status).toBe(testTask.status);
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();

      taskId = response.body.id;
    });

    it('应该返回 400 当缺少标题', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('应该返回 400 当标题超过 200 字符', async () => {
      const longTitle = 'A'.repeat(201);
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: longTitle });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('应该返回 400 当描述超过 1000 字符', async () => {
      const longDescription = 'A'.repeat(1001);
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', description: longDescription });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('应该返回 400 当状态无效', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', status: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('应该更新任务', async () => {
      const task = await Task.create(testTask);

      const updatedData = {
        title: 'Updated Task',
        description: 'Updated description',
        status: 'in-progress',
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.description).toBe(updatedData.description);
      expect(response.body.status).toBe(updatedData.status);
      expect(response.body.updatedAt).not.toBe(task.updatedAt);
    });

    it('应该返回 404 当任务不存在', async () => {
      const response = await request(app)
        .put('/api/tasks/99999')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('应该返回 400 当标题超过 200 字符', async () => {
      const task = await Task.create(testTask);
      const longTitle = 'A'.repeat(201);

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: longTitle });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('应该删除任务', async () => {
      const task = await Task.create(testTask);

      const response = await request(app).delete(`/api/tasks/${task.id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');

      // 验证任务已被删除
      const deletedTask = await Task.findByPk(task.id);
      expect(deletedTask).toBeNull();
    });

    it('应该返回 404 当任务不存在', async () => {
      const response = await request(app).delete('/api/tasks/99999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });
});
