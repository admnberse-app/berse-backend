import Redis from 'ioredis';
import logger from '../utils/logger';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private redis: Redis;
  private defaultTTL = 3600; // 1 hour
  private keyPrefix = 'bersemuka:';

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    // Event handlers
    this.redis.on('connect', () => {
      logger.info('Redis connected');
    });

    this.redis.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    this.redis.on('ready', () => {
      logger.info('Redis ready');
    });
  }

  /**
   * Generate cache key with prefix
   */
  private getKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.keyPrefix;
    return `${keyPrefix}${key}`;
  }

  /**
   * Set cache entry
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = this.defaultTTL, prefix } = options;
      const cacheKey = this.getKey(key, prefix);
      
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
      };

      await this.redis.setex(cacheKey, ttl, JSON.stringify(entry));
      logger.debug(`Cache set: ${cacheKey} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error('Cache set error:', error);
      // Don't throw - caching should be non-blocking
    }
  }

  /**
   * Get cache entry
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const { prefix } = options;
      const cacheKey = this.getKey(key, prefix);
      
      const result = await this.redis.get(cacheKey);
      if (!result) {
        logger.debug(`Cache miss: ${cacheKey}`);
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(result);
      
      // Check if entry is still valid
      const age = (Date.now() - entry.timestamp) / 1000;
      if (age > entry.ttl) {
        logger.debug(`Cache expired: ${cacheKey}`);
        await this.delete(key, options);
        return null;
      }

      logger.debug(`Cache hit: ${cacheKey}`);
      return entry.data;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string, options: CacheOptions = {}): Promise<void> {
    try {
      const { prefix } = options;
      const cacheKey = this.getKey(key, prefix);
      
      await this.redis.del(cacheKey);
      logger.debug(`Cache deleted: ${cacheKey}`);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple cache entries by pattern
   */
  async deletePattern(pattern: string, options: CacheOptions = {}): Promise<void> {
    try {
      const { prefix } = options;
      const keyPattern = this.getKey(pattern, prefix);
      
      const keys = await this.redis.keys(keyPattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache pattern deleted: ${keyPattern} (${keys.length} keys)`);
      }
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Check if cache entry exists
   */
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const { prefix } = options;
      const cacheKey = this.getKey(key, prefix);
      
      const result = await this.redis.exists(cacheKey);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, by: number = 1, options: CacheOptions = {}): Promise<number> {
    try {
      const { ttl, prefix } = options;
      const cacheKey = this.getKey(key, prefix);
      
      const result = await this.redis.incrby(cacheKey, by);
      
      if (ttl && result === by) {
        // Set TTL only on first increment
        await this.redis.expire(cacheKey, ttl);
      }
      
      return result;
    } catch (error) {
      logger.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Get multiple cache entries
   */
  async mget<T>(keys: string[], options: CacheOptions = {}): Promise<(T | null)[]> {
    try {
      const { prefix } = options;
      const cacheKeys = keys.map(key => this.getKey(key, prefix));
      
      const results = await this.redis.mget(cacheKeys);
      return results.map(result => {
        if (!result) return null;
        try {
          const entry: CacheEntry<T> = JSON.parse(result);
          const age = (Date.now() - entry.timestamp) / 1000;
          return age <= entry.ttl ? entry.data : null;
        } catch {
          return null;
        }
      });
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple cache entries
   */
  async mset<T>(entries: Record<string, T>, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = this.defaultTTL, prefix } = options;
      
      const pipeline = this.redis.pipeline();
      
      Object.entries(entries).forEach(([key, value]) => {
        const cacheKey = this.getKey(key, prefix);
        const entry: CacheEntry<T> = {
          data: value,
          timestamp: Date.now(),
          ttl,
        };
        pipeline.setex(cacheKey, ttl, JSON.stringify(entry));
      });
      
      await pipeline.exec();
      logger.debug(`Cache mset: ${Object.keys(entries).length} entries`);
    } catch (error) {
      logger.error('Cache mset error:', error);
    }
  }

  /**
   * Cache with fallback function
   */
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const value = await fallback();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Cache flush (clear all cache)
   */
  async flush(): Promise<void> {
    try {
      await this.redis.flushdb();
      logger.info('Cache flushed');
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate?: number;
  }> {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      const totalKeys = await this.redis.dbsize();
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : 'Unknown';
      
      return {
        totalKeys,
        memoryUsage,
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'Unknown',
      };
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Cache key generators for different data types
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  userEvents: (userId: string) => `user:${userId}:events`,
  event: (id: string) => `event:${id}`,
  eventRSVPs: (eventId: string) => `event:${eventId}:rsvps`,
  userNotifications: (userId: string) => `user:${userId}:notifications`,
  userMatches: (userId: string) => `user:${userId}:matches`,
  userPoints: (userId: string) => `user:${userId}:points`,
  leaderboard: (type: string) => `leaderboard:${type}`,
  rewards: () => 'rewards:active',
  userRedemptions: (userId: string) => `user:${userId}:redemptions`,
  eventsByType: (type: string) => `events:type:${type}`,
  eventsByLocation: (location: string) => `events:location:${location}`,
  userBadges: (userId: string) => `user:${userId}:badges`,
  systemStats: () => 'system:stats',
  rateLimitUser: (userId: string, action: string) => `ratelimit:${userId}:${action}`,
  rateLimitIP: (ip: string, action: string) => `ratelimit:${ip}:${action}`,
  // Event Discovery Cache Keys
  trendingEvents: (limit: number) => `events:trending:${limit}`,
  nearbyEvents: (lat: number, lng: number, radius: number, limit: number) => 
    `events:nearby:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}:${limit}`,
  recommendedEvents: (userId: string, limit: number) => `events:recommended:${userId}:${limit}`,
  userPreferences: (userId: string) => `user:${userId}:event-preferences`,
  communityEvents: (userId: string, limit: number) => `events:community:${userId}:${limit}`,
  hostEvents: (hostId: string, limit: number) => `events:host:${hostId}:${limit}`,
  userAttendedEvents: (userId: string, limit: number) => `events:attended:${userId}:${limit}`,
};

// TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 300,    // 5 minutes
  MEDIUM: 1800,  // 30 minutes
  LONG: 3600,    // 1 hour
  DAY: 86400,    // 24 hours
  WEEK: 604800,  // 7 days
  // Event-specific TTLs
  TRENDING: 900,        // 15 minutes (trending changes frequently)
  NEARBY: 600,          // 10 minutes (location-based, moderate freshness)
  RECOMMENDED: 3600,    // 1 hour (personalized, can be cached longer)
  COMMUNITY: 600,       // 10 minutes
  USER_PREFS: 7200,     // 2 hours (user preferences change infrequently)
  ATTENDED: 1800,       // 30 minutes (attended events don't change often)
};

// Create singleton instance
export const cacheService = new CacheService();

// Decorator for caching method results
export function Cacheable(keyGenerator: (...args: any[]) => string, ttl: number = CacheTTL.MEDIUM) {
  return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator(...args);
      
      // Try to get from cache first
      const cached = await cacheService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      await cacheService.set(cacheKey, result, { ttl });
      
      return result;
    };

    return descriptor;
  };
}

// Cache invalidation decorator
export function InvalidateCache(keyPattern: string) {
  return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // Invalidate cache pattern after successful operation
      await cacheService.deletePattern(keyPattern);
      
      return result;
    };

    return descriptor;
  };
}