/**
 * Auth Routes
 */
import express from 'express';
import { AuthController } from '../controllers/AuthController';

const router = express.Router();
const authController = new AuthController();

// Auth routes
router.post('/auth/register', (req, res, next) => authController.register(req, res, next));
router.post('/auth/login', (req, res, next) => authController.login(req, res, next));
router.get('/auth/me', (req, res, next) => authController.getCurrentUser(req, res, next));
router.post('/auth/logout', (req, res, next) => authController.logout(req, res, next));

export default router;
