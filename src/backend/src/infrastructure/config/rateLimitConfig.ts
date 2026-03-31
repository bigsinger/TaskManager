/**
 * 速率限制配置
 */

export const rateLimitConfig = {
  /**
   * 全局限速配置
   */
  global: {
    windowMs: 60 * 1000, // 1 分钟
    max: 100, // 最多 100 个请求
    message: {
      success: false,
      message: 'Too many requests, please try again later'
    }
  },

  /**
   * 认证限速配置
   */
  auth: {
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 5, // 最多 5 个请求
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later'
    }
  },

  /**
   * IP 限速配置
   */
  ip: {
    windowMs: 60 * 1000, // 1 分钟
    max: 50, // 最多 50 个请求
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later'
    }
  },

  /**
   * 用户限速配置
   */
  user: {
    windowMs: 60 * 1000, // 1 分钟
    max: 30, // 最多 30 个请求
    message: {
      success: false,
      message: 'Too many requests, please try again later'
    }
  },

  /**
   * 任务创建限速配置
   */
  taskCreate: {
    windowMs: 60 * 1000, // 1 分钟
    max: 10, // 最多 10 个请求
    message: {
      success: false,
      message: 'Too many task creation attempts, please try again later'
    }
  },

  /**
   * 任务更新限速配置
   */
  taskUpdate: {
    windowMs: 60 * 1000, // 1 分钟
    max: 20, // 最多 20 个请求
    message: {
      success: false,
      message: 'Too many task update attempts, please try again later'
    }
  },

  /**
   * 任务删除限速配置
   */
  taskDelete: {
    windowMs: 60 * 1000, // 1 分钟
    max: 10, // 最多 10 个请求
    message: {
      success: false,
      message: 'Too many task deletion attempts, please try again later'
    }
  }
};
