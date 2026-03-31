/**
 * 认证路由
 */

import { Router } from 'express';
import {
  registerController,
  loginController,
  logoutController,
  getCurrentUserController
} from '../controllers/authController';
import { authMiddleware } from '../infrastructure/middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    注册新用户
 * @access  Public
 */
router.post('/register', registerController);

/**
 * @route   POST /api/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', loginController);

/**
 * @route   POST /api/auth/logout
 * @desc    用户登出
 * @access  Private
 */
router.post('/logout', authMiddleware, logoutController);

/**
 * @route   GET /api/auth/me
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/me', authMiddleware, getCurrentUserController);

export default router;
