import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

// Create Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  keyPrefix: 'rl:',
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Fallback to memory store if Redis is not available
const createRateLimiter = (options: any) => {
  const baseOptions = {
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later.',
      });
    },
  };

  // Try to use Redis store, fallback to memory if Redis is unavailable
  if (redisClient.status === 'ready') {
    return rateLimit({
      ...baseOptions,
      store: new RedisStore({
        client: redisClient,
        prefix: options.prefix || 'rl:',
      }),
    });
  } else {
    console.warn('Redis not available, using memory store for rate limiting');
    return rateLimit(baseOptions);
  }
};

// General API rate limiter
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  prefix: 'rl:general:',
});

// Strict rate limiter for auth endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  prefix: 'rl:auth:',
});

// Login-specific rate limiter (even stricter)
export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 login attempts per windowMs
  skipSuccessfulRequests: true,
  prefix: 'rl:login:',
});

// Registration rate limiter
export const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration attempts per hour
  prefix: 'rl:register:',
});

// File upload rate limiter
export const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per windowMs
  prefix: 'rl:upload:',
});

// API key rate limiter (for authenticated requests)
export const apiKeyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for authenticated users
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise use IP
    return (req as any).user?.id || req.ip;
  },
  prefix: 'rl:api:',
});

// Create custom rate limiter
export const createCustomLimiter = (
  windowMs: number,
  max: number,
  prefix: string = 'rl:custom:'
) => {
  return createRateLimiter({
    windowMs,
    max,
    prefix,
  });
};

// Sliding window rate limiter for more accurate limiting
export const slidingWindowLimiter = (
  key: string,
  limit: number,
  windowMs: number
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (redisClient.status !== 'ready') {
      // If Redis is not available, pass through
      return next();
    }

    const identifier = `${key}:${(req as any).user?.id || req.ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Remove old entries
      await redisClient.zremrangebyscore(identifier, '-inf', windowStart);

      // Count current entries
      const currentCount = await redisClient.zcard(identifier);

      if (currentCount >= limit) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
        });
      }

      // Add current request
      await redisClient.zadd(identifier, now, `${now}-${Math.random()}`);
      await redisClient.expire(identifier, Math.ceil(windowMs / 1000));

      next();
    } catch (error) {
      console.error('Sliding window limiter error:', error);
      // On error, allow the request
      next();
    }
  };
};

// Cleanup expired keys periodically
setInterval(async () => {
  if (redisClient.status === 'ready') {
    try {
      const keys = await redisClient.keys('rl:*');
      for (const key of keys) {
        const ttl = await redisClient.ttl(key);
        if (ttl === -1) {
          // Key exists but has no expiration
          await redisClient.expire(key, 3600); // Set 1 hour expiration
        }
      }
    } catch (error) {
      console.error('Rate limiter cleanup error:', error);
    }
  }
}, 60 * 60 * 1000); // Run every hour

export default {
  generalLimiter,
  authLimiter,
  loginLimiter,
  registerLimiter,
  uploadLimiter,
  apiKeyLimiter,
  createCustomLimiter,
  slidingWindowLimiter,
};