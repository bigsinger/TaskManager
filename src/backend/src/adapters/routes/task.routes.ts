/**
 * Task Routes
 */
import express from 'express';
import { TaskController } from '../controllers/TaskController';
import { AuthController } from '../controllers/AuthController';

const router = express.Router();
const taskController = new TaskController();
const authController = new AuthController();

// Auth routes
router.post('/auth/register', (req, res, next) => authController.register(req, res, next));
router.post('/auth/login', (req, res, next) => authController.login(req, res, next));
router.get('/auth/me', (req, res, next) => authController.getCurrentUser(req, res, next));
router.post('/auth/logout', (req, res, next) => authController.logout(req, res, next));

// Task routes
router.post('/tasks', (req, res, next) => taskController.createTask(req, res, next));
router.get('/tasks', (req, res, next) => taskController.getAllTasks(req, res, next));
router.get('/tasks/:id', (req, res, next) => taskController.getTaskById(req, res, next));
router.put('/tasks/:id', (req, res, next) => taskController.updateTask(req, res, next));
router.delete('/tasks/:id', (req, res, next) => taskController.deleteTask(req, res, next));
router.get('/tasks/stats', (req, res, next) => taskController.getTaskStats(req, res, next));

export default router;
