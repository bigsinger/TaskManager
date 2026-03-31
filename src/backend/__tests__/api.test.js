/**
 * API Integration tests
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Mock database for testing
jest.mock('./database', () => ({
  initDatabase: jest.fn().mockResolvedValue(),
  getTasks: jest.fn(),
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  getAllTags: jest.fn()
}));

const { 
  initDatabase, 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask, 
  getAllTags 
} = require('./database');

describe('API Endpoints', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh Express app for each test
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../frontend')));

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API Routes
    app.get('/api/tasks', async (req, res) => {
      try {
        const { page = 1, limit = 20, status, tags, sort, order } = req.query;
        const result = await getTasks({
          page: parseInt(page),
          limit: parseInt(limit),
          status,
          tags,
          sort,
          order
        });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.get('/api/tasks/:id', async (req, res) => {
      try {
        const task = await getTaskById(req.params.id);
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.post('/api/tasks', async (req, res) => {
      try {
        const { title, description, status, tags } = req.body;

        if (!title || title.trim() === '') {
          return res.status(400).json({ error: 'Title is required' });
        }

        if (title.length > 200) {
          return res.status(400).json({ error: 'Title must be less than 200 characters' });
        }

        const task = await createTask({
          title: title.trim(),
          description: description || '',
          status: status || 'pending',
          tags: tags || []
        });

        res.status(201).json(task);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.put('/api/tasks/:id', async (req, res) => {
      try {
        const existingTask = await getTaskById(req.params.id);
        if (!existingTask) {
          return res.status(404).json({ error: 'Task not found' });
        }

        const { title, description, status, tags } = req.body;
        
        if (title !== undefined && title.trim() === '') {
          return res.status(400).json({ error: 'Title cannot be empty' });
        }

        const task = await updateTask(req.params.id, { title, description, status, tags });
        res.json(task);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.delete('/api/tasks/:id', async (req, res) => {
      try {
        const existingTask = await getTaskById(req.params.id);
        if (!existingTask) {
          return res.status(404).json({ error: 'Task not found' });
        }

        const success = await deleteTask(req.params.id);
        if (success) {
          res.json({ message: 'Task deleted successfully' });
        } else {
          res.status(500).json({ error: 'Failed to delete task' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.get('/api/tags', async (req, res) => {
      try {
        const tags = await getAllTags();
        res.json({ tags });
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks', async () => {
      const mockTasks = {
        tasks: [{ id: '1', title: 'Test Task' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      };
      getTasks.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual(mockTasks);
      expect(getTasks).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        status: undefined,
        tags: undefined,
        sort: undefined,
        order: undefined
      });
    });

    it('should filter tasks by status', async () => {
      const mockTasks = {
        tasks: [{ id: '1', title: 'Test Task', status: 'pending' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      };
      getTasks.mockResolvedValue(mockTasks);

      await request(app)
        .get('/api/tasks?status=pending')
        .expect(200);

      expect(getTasks).toHaveBeenCalledWith(expect.objectContaining({
        status: 'pending'
      }));
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get a task by id', async () => {
      const mockTask = { id: '1', title: 'Test Task' };
      getTaskById.mockResolvedValue(mockTask);

      const response = await request(app)
        .get('/api/tasks/1')
        .expect(200);

      expect(response.body).toEqual(mockTask);
    });

    it('should return 404 for non-existent task', async () => {
      getTaskById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tasks/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Task not found');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const mockTask = { id: '1', title: 'New Task', status: 'pending' };
      createTask.mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'New Task' })
        .expect(201);

      expect(response.body).toEqual(mockTask);
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Title is required');
    });

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '   ' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Title is required');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const existingTask = { id: '1', title: 'Old Title' };
      const updatedTask = { id: '1', title: 'New Title' };
      
      getTaskById.mockResolvedValue(existingTask);
      updateTask.mockResolvedValue(updatedTask);

      const response = await request(app)
        .put('/api/tasks/1')
        .send({ title: 'New Title' })
        .expect(200);

      expect(response.body).toEqual(updatedTask);
    });

    it('should return 404 for non-existent task', async () => {
      getTaskById.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/tasks/999')
        .send({ title: 'New Title' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Task not found');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const existingTask = { id: '1', title: 'To Delete' };
      
      getTaskById.mockResolvedValue(existingTask);
      deleteTask.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/tasks/1')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Task deleted successfully');
    });

    it('should return 404 for non-existent task', async () => {
      getTaskById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/tasks/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Task not found');
    });
  });

  describe('GET /api/tags', () => {
    it('should get all tags', async () => {
      const mockTags = [{ name: 'work', count: 5 }, { name: 'personal', count: 3 }];
      getAllTags.mockResolvedValue(mockTags);

      const response = await request(app)
        .get('/api/tags')
        .expect(200);

      expect(response.body).toEqual({ tags: mockTags });
    });
  });
});
