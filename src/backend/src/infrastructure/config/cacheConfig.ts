/**
 * 缓存配置
 */

export const cacheConfig = {
  /**
   * 任务列表缓存
   */
  taskList: {
    ttl: 60 * 5, // 5 分钟
    key: (userId: string, filters: any) => `task:list:${userId}:${JSON.stringify(filters)}`
  },

  /**
   * 任务详情缓存
   */
  taskDetail: {
    ttl: 60 * 10, // 10 分钟
    key: (taskId: string) => `task:detail:${taskId}`
  },

  /**
   * 标签云缓存
   */
  tagCloud: {
    ttl: 60 * 30, // 30 分钟
    key: (userId: string) => `tag:cloud:${userId}`
  },

  /**
   * 用户信息缓存
   */
  userInfo: {
    ttl: 60 * 60, // 1 小时
    key: (userId: string) => `user:info:${userId}`
  },

  /**
   * 任务统计缓存
   */
  taskStats: {
    ttl: 60 * 15, // 15 分钟
    key: (userId: string) => `task:stats:${userId}`
  },

  /**
   * 搜索结果缓存
   */
  searchResults: {
    ttl: 60 * 10, // 10 分钟
    key: (userId: string, query: string) => `search:results:${userId}:${query}`
  }
};

/**
 * 缓存失效策略
 */
export const cacheInvalidationStrategies = {
  /**
   * 任务创建时失效
   */
  onTaskCreate: async (userId: string) => {
    const cacheManager = (await import('./CacheManager')).default;
    await cacheManager.delPattern(`task:list:${userId}:*`);
    await cacheManager.delPattern(`task:stats:${userId}`);
  },

  /**
   * 任务更新时失效
   */
  onTaskUpdate: async (taskId: string, userId: string) => {
    const cacheManager = (await import('./CacheManager')).default;
    await cacheManager.del(`task:detail:${taskId}`);
    await cacheManager.delPattern(`task:list:${userId}:*`);
    await cacheManager.delPattern(`task:stats:${userId}`);
  },

  /**
   * 任务删除时失效
   */
  onTaskDelete: async (taskId: string, userId: string) => {
    const cacheManager = (await import('./CacheManager')).default;
    await cacheManager.del(`task:detail:${taskId}`);
    await cacheManager.delPattern(`task:list:${userId}:*`);
    await cacheManager.delPattern(`task:stats:${userId}`);
  },

  /**
   * 用户更新时失效
   */
  onUserUpdate: async (userId: string) => {
    const cacheManager = (await import('./CacheManager')).default;
    await cacheManager.del(`user:info:${userId}`);
  },

  /**
   * 标签更新时失效
   */
  onTagUpdate: async (userId: string) => {
    const cacheManager = (await import('./CacheManager')).default;
    await cacheManager.del(`tag:cloud:${userId}`);
    await cacheManager.delPattern(`task:list:${userId}:*`);
  }
};
