/**
 * 审计日志控制器
 */

import { Request, Response } from 'express';
import { getAuditLogs, getAuditLogById, deleteAuditLog, cleanupOldAuditLogs } from '../../infrastructure/services/auditLogService';

/**
 * 获取审计日志列表
 */
export const getAuditLogsController = async (req: Request, res: Response) => {
  try {
    const filters = {
      userId: req.query.userId as string,
      action: req.query.action as string,
      resource: req.query.resource as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 20
    };

    const result = await getAuditLogs(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get audit logs'
    });
  }
};

/**
 * 获取审计日志详情
 */
export const getAuditLogByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await getAuditLogById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        auditLog: result
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get audit log'
    });
  }
};

/**
 * 删除审计日志
 */
export const deleteAuditLogController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteAuditLog(id);

    res.status(200).json({
      success: true,
      message: 'Audit log deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete audit log'
    });
  }
};

/**
 * 清理旧审计日志
 */
export const cleanupOldAuditLogsController = async (req: Request, res: Response) => {
  try {
    const daysToKeep = req.query.daysToKeep ? parseInt(req.query.daysToKeep as string) : 90;

    const result = await cleanupOldAuditLogs(daysToKeep);

    res.status(200).json({
      success: true,
      data: {
        deletedCount: result.count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to cleanup audit logs'
    });
  }
};
