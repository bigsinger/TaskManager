/**
 * Task Dependency Routes
 */
import express from 'express';
import { TaskDependencyController } from '../controllers/TaskDependencyController';
import { authenticate } from '../../infrastructure/middleware/auth';

const router = express.Router();
const controller = new TaskDependencyController();

// 依赖关系路由（需要认证）
router.post('/dependencies', authenticate, (req, res, next) => controller.addDependency(req, res, next));
router.delete('/dependencies/:id', authenticate, (req, res, next) => controller.removeDependency(req, res, next));
router.get('/tasks/:taskId/dependencies', authenticate, (req, res, next) => controller.getDependencies(req, res, next));
router.get('/tasks/:taskId/can-start', authenticate, (req, res, next) => controller.checkCanStart(req, res, next));
router.get('/dependency-graph', authenticate, (req, res, next) => controller.getDependencyGraph(req, res, next));

export default router;
