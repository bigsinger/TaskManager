/**
 * Cache Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { RedisCacheService } from '../../infrastructure/cache/RedisCacheService';

export const cacheMiddleware = (ttl: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from request
    const cacheKey = `${req.method}:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cachedData = await RedisCacheService.get(cacheKey);

      if (cachedData) {
        console.log(`Cache hit: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`Cache miss: ${cacheKey}`);

      // Hijack res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        // Cache the response
        RedisCacheService.set(cacheKey, data, ttl).catch((err: Error) => {
          console.error('Cache set error:', err);
        });
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export default cacheMiddleware;
