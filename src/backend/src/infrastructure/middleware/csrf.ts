/**
 * CSRF 防护中间件
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * 生成 CSRF Token
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * 验证 CSRF Token
 */
export const verifyCsrfToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken;
};

/**
 * CSRF 防护中间件
 */
export const csrfMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // GET 请求不需要 CSRF Token
  if (req.method === 'GET') {
    return next();
  }

  // 获取请求中的 CSRF Token
  const csrfToken = req.headers['x-csrf-token'] as string || req.body._csrf;

  // 获取 Session 中的 CSRF Token
  const sessionCsrfToken = req.session?.csrfToken;

  // 验证 CSRF Token
  if (!csrfToken || !sessionCsrfToken || !verifyCsrfToken(csrfToken, sessionCsrfToken)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next();
};

/**
 * 获取 CSRF Token 中间件
 */
export const getCsrfTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 生成新的 CSRF Token
    const csrfToken = generateCsrfToken();

    // 存储 CSRF Token 到 Session
    if (req.session) {
      req.session.csrfToken = csrfToken;
    }

    // 返回 CSRF Token
    res.json({
      success: true,
      data: {
        csrfToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSRF token'
    });
  }
};
