/**
 * 审计日志路由
 */

import { Router } from 'express';
import {
  getAuditLogsController,
  getAuditLogByIdController,
  deleteAuditLogController,
  cleanupOldAuditLogsController
} from '../controllers/auditLogController';
import { authMiddleware } from '../infrastructure/middleware/auth';
import { authorize } from '../infrastructure/middleware/auth';

const router = Router();

/**
 * @route   GET /api/audit-logs
 * @desc    获取审计日志列表
 * @access  Private (Admin only)
 */
router.get('/', authMiddleware, authorize('ADMIN'), getAuditLogsController);

/**
 * @route   GET /api/audit-logs/:id
 * @desc    获取审计日志详情
 * @access  Private (Admin only)
 */
router.get('/:id', authMiddleware, authorize('ADMIN'), getAuditLogByIdController);

/**
 * @route   DELETE /api/audit-logs/:id
 * @desc    删除审计日志
 * @access  Private (Admin only)
 */
router.delete('/:id', authMiddleware, authorize('ADMIN'), deleteAuditLogController);

/**
 * @route   POST /api/audit-logs/cleanup
 * @desc    清理旧审计日志
 * @access  Private (Admin only)
 */
router.post('/cleanup', authMiddleware, authorize('ADMIN'), cleanupOldAuditLogsController);

export default router;
