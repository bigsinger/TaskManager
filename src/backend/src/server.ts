/**
 * Main Server
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import logger from './infrastructure/logging/WinstonLogger';
import cacheService from './infrastructure/cache/RedisCacheService';
import taskRoutes from './adapters/routes/task.routes';
import authRoutes from './adapters/routes/auth.routes';
import { errorHandler, notFoundHandler } from './adapters/middleware/error.middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;
const LOG_LEVEL = process.env['LOG_LEVEL'] || 'info';

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || '*',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000'),
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later'
    }
  }
});
app.use('/api/', limiter);

// Connect to Redis
cacheService.connect().catch((err: any) => {
  logger.warn('Failed to connect to Redis:', err.message);
  logger.warn('Continuing without cache...');
});

// Routes
app.use('/api', taskRoutes);
app.use('/api', authRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'],
    cache: cacheService.isConnected ? 'connected' : 'disconnected'
  });
});

// Metrics endpoint
app.get('/metrics', (_req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    environment: process.env['NODE_ENV'],
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  });
});

// API documentation
app.get('/api/docs', (_req, res) => {
  res.json({
    title: 'Task Manager API',
    version: '2.0.0',
    description: 'Enterprise-grade Task Management System',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user'
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Login with email and password'
      },
      {
        method: 'GET',
        path: '/api/auth/me',
        description: 'Get current user info'
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Logout current user'
      },
      {
        method: 'POST',
        path: '/api/tasks',
        description: 'Create a new task'
      },
      {
        method: 'GET',
        path: '/api/tasks',
        description: 'Get all tasks with optional filters'
      },
      {
        method: 'GET',
        path: '/api/tasks/:id',
        description: 'Get task by ID'
      },
      {
        method: 'put',
        path: '/api/tasks/:id',
        description: 'Update task by ID'
      },
      {
        method: 'delete',
        path: '/api/tasks/:id',
        description: 'Delete task by ID'
      },
      {
        method: 'get',
        path: '/api/tasks/stats',
        description: 'Get task statistics'
      }
    ]
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env['NODE_ENV']}`);
  logger.info(`Log Level: ${LOG_LEVEL}`);
  logger.info(`Cache: ${cacheService.isConnected ? 'enabled' : 'disabled'}`);
});

module.exports = app;
