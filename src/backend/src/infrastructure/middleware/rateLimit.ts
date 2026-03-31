/**
 * 速率限制中间件
 */

import rateLimit from 'express-rate-limit';
import { rateLimitConfig } from '../config/rateLimitConfig';

/**
 * 全局限速器
 */
export const globalLimiter = rateLimit(rateLimitConfig.global);

/**
 * 认证限速器
 */
export const authLimiter = rateLimit(rateLimitConfig.auth);

/**
 * IP 限速器
 */
export const ipLimiter = rateLimit({
  ...rateLimitConfig.ip,
  keyGenerator: (req) => req.ip || 'unknown'
});

/**
 * 用户限速器
 */
export const userLimiter = rateLimit({
  ...rateLimitConfig.user,
  keyGenerator: (req) => {
    // 如果有用户信息，使用用户 ID
    if (req.user && req.user.userId) {
      return `user:${req.user.userId}`;
    }
    // 否则使用 IP
    return `ip:${req.ip || 'unknown'}`;
  }
});

/**
 * 任务创建限速器
 */
export const taskCreateLimiter = rateLimit(rateLimitConfig.taskCreate);

/**
 * 任务更新限速器
 */
export const taskUpdateLimiter = rateLimit(rateLimitConfig.taskUpdate);

/**
 * 任务删除限速器
 */
export const taskDeleteLimiter = rateLimit(rateLimitConfig.taskDelete);

/**
 * 自定义限速器
 */
export const createCustomLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    }
  });
};
