const request = require('supertest');
const app = require('./server');

describe('Task API', () => {
  let createdTaskId;

  // Test 1: Health Check
  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });
  });

  // Test 2: API Documentation
  describe('GET /api/docs', () => {
    test('should return API documentation', async () => {
      const response = await request(app)
        .get('/api/docs')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(Array.isArray(response.body.endpoints)).toBe(true);
    });
  });

  // Test 3: Metrics Endpoint
  describe('GET /api/metrics', () => {
    test('should return system metrics', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('nodeVersion');
    });
  });

  // Test 4: Get All Tasks
  describe('GET /api/tasks', () => {
    test('should return all tasks with pagination', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });
  });

  // Test 5: Create Task - Success
  describe('POST /api/tasks', () => {
    test('should create a new task with valid data', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'Test description',
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Task');
      expect(response.body.description).toBe('Test description');
      expect(response.body.status).toBe('pending');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      createdTaskId = response.body.id;
    });

    test('should create task with minimal data', async () => {
      const newTask = {
        title: 'Minimal Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Minimal Task');
      expect(response.body.description).toBe('');
      expect(response.body.status).toBe('pending');
    });

    test('should reject task without title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Title is required');
    });

    test('should reject task with empty title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '   ' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should reject task with invalid status', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          status: 'invalid-status'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Status must be one of');
    });
  });

  // Test 6: Get Single Task
  describe('GET /api/tasks/:id', () => {
    test('should return a single task by ID', async () => {
      if (!createdTaskId) {
        // Create a task first
        const createResponse = await request(app)
          .post('/api/tasks')
          .send({ title: 'Get Test Task' });
        createdTaskId = createResponse.body.id;
      }

      const response = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdTaskId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('status');
    });

    test('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task not found');
    });

    test('should reject invalid task ID', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid task ID');
    });
  });

  // Test 7: Update Task
  describe('PUT /api/tasks/:id', () => {
    test('should update an existing task', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/tasks')
          .send({ title: 'Update Test Task' });
        createdTaskId = createResponse.body.id;
      }

      const updateData = {
        title: 'Updated Task',
        description: 'Updated description',
        status: 'in-progress'
      };

      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.title).toBe('Updated Task');
      expect(response.body.description).toBe('Updated description');
      expect(response.body.status).toBe('in-progress');
    });

    test('should update task with partial data', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/tasks')
          .send({ title: 'Partial Update Test' });
        createdTaskId = createResponse.body.id;
      }

      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });

    test('should return 404 when updating non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/99999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task not found');
    });

    test('should reject update without title', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/tasks')
          .send({ title: 'Validation Test' });
        createdTaskId = createResponse.body.id;
      }

      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send({ description: 'No title' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Test 8: Delete Task
  describe('DELETE /api/tasks/:id', () => {
    test('should delete an existing task', async () => {
      // Create a task to delete
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Delete Test Task' });
      const taskId = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Task deleted successfully');
    });

    test('should return 404 when deleting non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task not found');
    });

    test('should verify task is deleted', async () => {
      // Create a task
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Verify Delete Test' });
      const taskId = createResponse.body.id;

      // Delete it
      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      // Try to get it
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(404);
    });
  });

  // Test 9: Root Endpoint
  describe('GET /', () => {
    test('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body).toHaveProperty('methods');
    });
  });

  // Test 10: Error Handling
  describe('Error Handling', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Route not found');
    });

    test('should handle invalid JSON in POST', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Test 11: Data Validation
  describe('Data Validation', () => {
    test('should trim whitespace from title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '  Trimmed Title  ' })
        .expect(201);

      expect(response.body.title).toBe('Trimmed Title');
    });

    test('should handle empty description', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', description: '' })
        .expect(201);

      expect(response.body.description).toBe('');
    });

    test('should handle null description', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', description: null })
        .expect(201);

      expect(response.body.description).toBe('');
    });
  });
});
