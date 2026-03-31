/**
 * Database tests
 */

const { 
  initDatabase, 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask, 
  getAllTags 
} = require('./database');

describe('Database Operations', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  beforeEach(async () => {
    // Clean up tasks before each test
    const { tasks } = await getTasks({ page: 1, limit: 100 });
    for (const task of tasks) {
      await deleteTask(task.id);
    }
  });

  describe('createTask', () => {
    it('should create a task with valid data', async () => {
      const task = await createTask({
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        tags: ['tag1', 'tag2']
      });

      expect(task).toHaveProperty('id');
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.status).toBe('pending');
      expect(task.tags).toEqual(['tag1', 'tag2']);
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('updatedAt');
    });

    it('should create a task with default values', async () => {
      const task = await createTask({
        title: 'Minimal Task'
      });

      expect(task.title).toBe('Minimal Task');
      expect(task.description).toBe('');
      expect(task.status).toBe('pending');
      expect(task.tags).toEqual([]);
    });
  });

  describe('getTasks', () => {
    beforeEach(async () => {
      await createTask({ title: 'Task 1', status: 'pending', tags: ['work'] });
      await createTask({ title: 'Task 2', status: 'completed', tags: ['personal'] });
      await createTask({ title: 'Task 3', status: 'in-progress', tags: ['work', 'urgent'] });
    });

    it('should get all tasks with pagination', async () => {
      const result = await getTasks({ page: 1, limit: 10 });

      expect(result.tasks).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter tasks by status', async () => {
      const result = await getTasks({ page: 1, limit: 10, status: 'pending' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Task 1');
    });

    it('should filter tasks by multiple statuses', async () => {
      const result = await getTasks({ page: 1, limit: 10, status: 'pending,completed' });

      expect(result.tasks).toHaveLength(2);
    });

    it('should filter tasks by tags', async () => {
      const result = await getTasks({ page: 1, limit: 10, tags: 'work' });

      expect(result.tasks).toHaveLength(2);
    });

    it('should sort tasks by createdAt desc by default', async () => {
      const result = await getTasks({ page: 1, limit: 10 });

      expect(result.tasks[0].title).toBe('Task 3');
    });

    it('should sort tasks by title asc', async () => {
      const result = await getTasks({ page: 1, limit: 10, sort: 'title', order: 'asc' });

      expect(result.tasks[0].title).toBe('Task 1');
      expect(result.tasks[1].title).toBe('Task 2');
      expect(result.tasks[2].title).toBe('Task 3');
    });
  });

  describe('getTaskById', () => {
    it('should get a task by id', async () => {
      const created = await createTask({ title: 'Find Me' });
      const found = await getTaskById(created.id);

      expect(found).not.toBeNull();
      expect(found.title).toBe('Find Me');
    });

    it('should return null for non-existent task', async () => {
      const found = await getTaskById('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const created = await createTask({ title: 'Original' });
      const updated = await updateTask(created.id, { title: 'Updated' });

      expect(updated).not.toBeNull();
      expect(updated.title).toBe('Updated');
    });

    it('should return null for non-existent task', async () => {
      const updated = await updateTask('non-existent-id', { title: 'Updated' });

      expect(updated).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const created = await createTask({ title: 'To Delete' });
      const deleted = await deleteTask(created.id);

      expect(deleted).toBe(true);

      const found = await getTaskById(created.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent task', async () => {
      const deleted = await deleteTask('non-existent-id');

      expect(deleted).toBe(false);
    });
  });

  describe('getAllTags', () => {
    beforeEach(async () => {
      await createTask({ title: 'Task 1', tags: ['work', 'urgent'] });
      await createTask({ title: 'Task 2', tags: ['work'] });
      await createTask({ title: 'Task 3', tags: ['personal'] });
    });

    it('should return all tags with counts', async () => {
      const tags = await getAllTags();

      expect(tags).toContainEqual({ name: 'work', count: 2 });
      expect(tags).toContainEqual({ name: 'urgent', count: 1 });
      expect(tags).toContainEqual({ name: 'personal', count: 1 });
    });

    it('should sort tags by count desc', async () => {
      const tags = await getAllTags();

      expect(tags[0].name).toBe('work');
      expect(tags[0].count).toBe(2);
    });
  });
});
