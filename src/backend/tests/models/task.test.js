const { Task } = require('../../src/models');

describe('Task Model', () => {
  // 测试数据
  const validTaskData = {
    title: 'Test Task',
    description: 'This is a test task',
    status: 'pending',
    tags: 'work,important',
  };

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

  describe('创建任务', () => {
    it('应该成功创建任务', async () => {
      const task = await Task.create(validTaskData);

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.title).toBe(validTaskData.title);
      expect(task.description).toBe(validTaskData.description);
      expect(task.status).toBe(validTaskData.status);
      expect(task.tags).toBe(validTaskData.tags);
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it('应该使用默认值创建任务', async () => {
      const task = await Task.create({
        title: 'Test Task',
      });

      expect(task.status).toBe('pending');
      expect(task.description).toBeNull();
      expect(task.tags).toBe('');
    });

    it('应该拒绝空标题', async () => {
      await expect(
        Task.create({
          description: 'Test',
        })
      ).rejects.toThrow();
    });

    it('应该拒绝超过 200 字符的标题', async () => {
      const longTitle = 'A'.repeat(201);

      await expect(
        Task.create({
          title: longTitle,
        })
      ).rejects.toThrow();
    });

    it('应该拒绝超过 1000 字符的描述', async () => {
      const longDescription = 'A'.repeat(1001);

      await expect(
        Task.create({
          title: 'Test',
          description: longDescription,
        })
      ).rejects.toThrow();
    });

    it('应该拒绝无效的状态', async () => {
      await expect(
        Task.create({
          title: 'Test',
          status: 'invalid',
        })
      ).rejects.toThrow();
    });
  });

  describe('更新任务', () => {
    it('应该成功更新任务', async () => {
      const task = await Task.create(validTaskData);

      const updatedData = {
        title: 'Updated Task',
        description: 'Updated description',
        status: 'in-progress',
        tags: 'work,urgent',
      };

      await task.update(updatedData);

      expect(task.title).toBe(updatedData.title);
      expect(task.description).toBe(updatedData.description);
      expect(task.status).toBe(updatedData.status);
      expect(task.tags).toBe(updatedData.tags);
      expect(task.updatedAt).not.toBe(task.createdAt);
    });

    it('应该拒绝空标题', async () => {
      const task = await Task.create(validTaskData);

      await expect(task.update({ title: '' })).rejects.toThrow();
    });

    it('应该拒绝超过 200 字符的标题', async () => {
      const task = await Task.create(validTaskData);
      const longTitle = 'A'.repeat(201);

      await expect(task.update({ title: longTitle })).rejects.toThrow();
    });
  });

  describe('删除任务', () => {
    it('应该成功删除任务', async () => {
      const task = await Task.create(validTaskData);

      await task.destroy();

      const deletedTask = await Task.findByPk(task.id);
      expect(deletedTask).toBeNull();
    });
  });

  describe('查询任务', () => {
    it('应该成功查询单个任务', async () => {
      const task = await Task.create(validTaskData);

      const foundTask = await Task.findByPk(task.id);

      expect(foundTask).toBeDefined();
      expect(foundTask.id).toBe(task.id);
      expect(foundTask.title).toBe(task.title);
    });

    it('应该成功查询所有任务', async () => {
      await Task.bulkCreate([
        { title: 'Task 1', status: 'pending' },
        { title: 'Task 2', status: 'in-progress' },
        { title: 'Task 3', status: 'completed' },
      ]);

      const tasks = await Task.findAll();

      expect(tasks).toHaveLength(3);
    });

    it('应该支持按状态筛选', async () => {
      await Task.bulkCreate([
        { title: 'Task 1', status: 'pending' },
        { title: 'Task 2', status: 'in-progress' },
        { title: 'Task 3', status: 'pending' },
      ]);

      const pendingTasks = await Task.findAll({
        where: { status: 'pending' },
      });

      expect(pendingTasks).toHaveLength(2);
      expect(pendingTasks.every((task) => task.status === 'pending')).toBe(true);
    });

    it('应该支持分页', async () => {
      await Task.bulkCreate(
        Array.from({ length: 25 }, (_, i) => ({
          title: `Task ${i + 1}`,
          status: 'pending',
        }))
      );

      const { count, rows } = await Task.findAndCountAll({
        limit: 10,
        offset: 0,
      });

      expect(count).toBe(25);
      expect(rows).toHaveLength(10);
    });

    it('应该支持排序', async () => {
      await Task.bulkCreate([
        { title: 'Task A', createdAt: '2026-03-27T10:00:00.000Z' },
        { title: 'Task B', createdAt: '2026-03-27T11:00:00.000Z' },
        { title: 'Task C', createdAt: '2026-03-27T09:00:00.000Z' },
      ]);

      const tasks = await Task.findAll({
        order: [['createdAt', 'DESC']],
      });

      expect(tasks[0].title).toBe('Task B');
      expect(tasks[2].title).toBe('Task C');
    });
  });

  describe('任务验证', () => {
    it('应该验证标题必填', async () => {
      const task = Task.build({ description: 'Test' });

      await expect(task.validate()).rejects.toThrow();
    });

    it('应该验证标题长度', async () => {
      const task = Task.build({ title: 'A'.repeat(201) });

      await expect(task.validate()).rejects.toThrow();
    });

    it('应该验证描述长度', async () => {
      const task = Task.build({
        title: 'Test',
        description: 'A'.repeat(1001),
      });

      await expect(task.validate()).rejects.toThrow();
    });

    it('应该验证状态值', async () => {
      const task = Task.build({
        title: 'Test',
        status: 'invalid',
      });

      await expect(task.validate()).rejects.toThrow();
    });
  });
});
