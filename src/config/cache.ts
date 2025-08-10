import Redis from 'ioredis';
import { config } from './index';

// Redis client singleton
let redisClient: Redis | null = null;

// Cache key prefixes
export const CacheKeys = {
  USER: 'user:',
  EVENT: 'event:',
  EVENTS_LIST: 'events:list:',
  MATCH: 'match:',
  POINTS: 'points:',
  BADGES: 'badges:',
  REWARDS: 'rewards:',
  SESSION: 'session:',
  RATE_LIMIT: 'rate:',
} as const;

// Cache TTL (in seconds)
export const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  DAY: 86400,          // 24 hours
  WEEK: 604800,        // 7 days
} as const;

// Initialize Redis client
export const initRedis = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err);
  });

  redisClient.on('close', () => {
    console.log('🔴 Redis connection closed');
  });

  return redisClient;
};

// Cache wrapper class
export class CacheService {
  private client: Redis;

  constructor() {
    this.client = initRedis();
  }

  // Get from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  // Set in cache
  async set(key: string, value: any, ttl: number = CacheTTL.MEDIUM): Promise<void> {
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  // Delete from cache
  async del(key: string | string[]): Promise<void> {
    try {
      if (Array.isArray(key)) {
        await this.client.del(...key);
      } else {
        await this.client.del(key);
      }
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  // Clear pattern
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error(`Cache clear pattern error for ${pattern}:`, error);
    }
  }

  // Cache invalidation strategies
  async invalidateUser(userId: string): Promise<void> {
    await this.clearPattern(`${CacheKeys.USER}${userId}*`);
  }

  async invalidateEvent(eventId: string): Promise<void> {
    await this.del([
      `${CacheKeys.EVENT}${eventId}`,
      `${CacheKeys.EVENTS_LIST}*`
    ]);
  }

  // Cache-aside pattern helper
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const data = await fetcher();
    
    // Store in cache
    await this.set(key, data, ttl);
    
    return data;
  }

  // Session management
  async setSession(sessionId: string, data: any, ttl: number = CacheTTL.DAY): Promise<void> {
    await this.set(`${CacheKeys.SESSION}${sessionId}`, data, ttl);
  }

  async getSession(sessionId: string): Promise<any> {
    return this.get(`${CacheKeys.SESSION}${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`${CacheKeys.SESSION}${sessionId}`);
  }

  // Rate limiting helper
  async incrementRateLimit(key: string, windowMs: number): Promise<number> {
    const fullKey = `${CacheKeys.RATE_LIMIT}${key}`;
    const multi = this.client.multi();
    
    multi.incr(fullKey);
    multi.expire(fullKey, Math.ceil(windowMs / 1000));
    
    const results = await multi.exec();
    return results?.[0]?.[1] as number || 1;
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  // Close connection
  async close(): Promise<void> {
    await this.client.quit();
  }
}

// Export singleton instance
export const cache = new CacheService();

// Middleware for caching responses
export const cacheMiddleware = (ttl: number = CacheTTL.MEDIUM) => {
  return async (req: any, res: any, next: any) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `response:${req.originalUrl || req.url}`;
    
    try {
      const cached = await cache.get(key);
      if (cached) {
        return res.json(cached);
      }
    } catch (error) {
      // Continue without cache on error
    }

    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache response
    res.json = function(data: any) {
      // Cache the response
      cache.set(key, data, ttl).catch(() => {});
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};