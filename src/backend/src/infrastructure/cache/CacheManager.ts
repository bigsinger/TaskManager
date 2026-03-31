/**
 * 缓存管理器
 */

import cacheService from './RedisCacheService';

export interface CacheConfig {
  ttl: number;
  key: (...args: any[]) => string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

class CacheManager {
  private stats: Map<string, { hits: number; misses: number }> = new Map();

  /**
   * 获取缓存
   */
  async get<T>(key: string, category: string = 'default'): Promise<T | null> {
    try {
      const value = await cacheService.get<T>(key);

      if (value !== null) {
        this.updateStats(category, true);
        return value;
      }

      this.updateStats(category, false);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * 设置缓存
   */
  async set<T>(key: string, value: T, ttl: number, category: string = 'default'): Promise<boolean> {
    try {
      return await cacheService.set(key, value, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<boolean> {
    try {
      return await cacheService.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * 删除模式匹配的缓存
   */
  async delPattern(pattern: string): Promise<boolean> {
    try {
      return await cacheService.delPattern(pattern);
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  }

  /**
   * 检查缓存是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      return await cacheService.exists(key);
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * 清空所有缓存
   */
  async flush(): Promise<boolean> {
    try {
      return await cacheService.flush();
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * 获取或设置缓存
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number,
    category: string = 'default'
  ): Promise<T> {
    try {
      // 尝试从缓存获取
      const cached = await this.get<T>(key, category);
      if (cached !== null) {
        return cached;
      }

      // 从工厂函数获取
      const value = await factory();

      // 设置缓存
      await this.set(key, value, ttl, category);

      return value;
    } catch (error) {
      console.error('Cache getOrSet error:', error);
      throw error;
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(category: string, hit: boolean): void {
    if (!this.stats.has(category)) {
      this.stats.set(category, { hits: 0, misses: 0 });
    }

    const stats = this.stats.get(category)!;
    if (hit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
  }

  /**
   * 获取统计信息
   */
  getStats(category?: string): CacheStats {
    if (category) {
      const stats = this.stats.get(category);
      if (!stats) {
        return { hits: 0, misses: 0, hitRate: 0 };
      }

      const total = stats.hits + stats.misses;
      const hitRate = total > 0 ? (stats.hits / total) * 100 : 0;

      return {
        hits: stats.hits,
        misses: stats.misses,
        hitRate
      };
    }

    // 获取所有分类的统计信息
    const allStats: Record<string, CacheStats> = {};

    for (const [cat, stats] of this.stats.entries()) {
      const total = stats.hits + stats.misses;
      const hitRate = total > 0 ? (stats.hits / total) * 100 : 0;

      allStats[cat] = {
        hits: stats.hits,
        misses: stats.misses,
        hitRate
      };
    }

    return allStats;
  }

  /**
   * 重置统计信息
   */
  resetStats(category?: string): void {
    if (category) {
      this.stats.delete(category);
    } else {
      this.stats.clear();
    }
  }
}

// 创建单例
const cacheManager = new CacheManager();

export default cacheManager;
export { cacheManager as CacheManager };
