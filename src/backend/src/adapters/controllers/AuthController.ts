/**
 * 认证控制器
 */

import { Request, Response } from 'express';
import { registerUseCase, RegisterInput } from '../../application/useCases/auth/register';
import { loginUseCase, LoginInput } from '../../application/useCases/auth/login';
import { logoutUseCase, LogoutInput } from '../../application/useCases/auth/logout';
import { getCurrentUserUseCase, GetCurrentUserInput } from '../../application/useCases/auth/getCurrentUser';

/**
 * 获取客户端 IP 地址
 */
const getClientIp = (req: Request): string => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * 获取 User Agent
 */
const getUserAgent = (req: Request): string => {
  return req.headers['user-agent'] || 'unknown';
};

/**
 * 注册控制器
 */
export const registerController = async (req: Request, res: Response) => {
  try {
    const input: RegisterInput = {
      ...req.body,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    };

    const result = await registerUseCase(input);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed'
    });
  }
};

/**
 * 登录控制器
 */
export const loginController = async (req: Request, res: Response) => {
  try {
    const input: LoginInput = {
      ...req.body,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    };

    const result = await loginUseCase(input);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Login failed'
    });
  }
};

/**
 * 登出控制器
 */
export const logoutController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7) || '';

    const input: LogoutInput = {
      userId: req.user.userId,
      token,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req)
    };

    await logoutUseCase(input);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Logout failed'
    });
  }
};

/**
 * 获取当前用户控制器
 */
export const getCurrentUserController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const input: GetCurrentUserInput = {
      userId: req.user.userId
    };

    const result = await getCurrentUserUseCase(input);

    res.status(200).json({
      success: true,
      data: {
        user: result
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get user'
    });
  }
};
