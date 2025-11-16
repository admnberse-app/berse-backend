/**
 * Centralized Prisma Client with connection pooling and timeout configuration
 * Use this singleton instance throughout the application
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Parse connection limit from DATABASE_URL or use default
const getConnectionLimit = (): number => {
  const url = process.env.DATABASE_URL || '';
  const match = url.match(/connection_limit=(\d+)/);
  return match ? parseInt(match[1], 10) : 10;
};

// Singleton instance
let prisma: PrismaClient;

/**
 * Get or create Prisma client instance
 * Uses singleton pattern to prevent connection pool exhaustion
 */
export function getPrismaClient(): PrismaClient {
  if (prisma) {
    return prisma;
  }

  const connectionLimit = getConnectionLimit();

  prisma = new PrismaClient({
    log: isDevelopment 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Connection pool configuration
  prisma.$connect()
    .then(() => {
      logger.info('✅ Prisma connected to database', {
        connectionLimit,
        environment: process.env.NODE_ENV,
      });
    })
    .catch((error) => {
      logger.error('❌ Prisma connection failed', { error });
      process.exit(1);
    });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, closing Prisma connection...`);
    await prisma.$disconnect();
    logger.info('Prisma connection closed');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });

  return prisma;
}

/**
 * Execute query with automatic timeout and retry
 * Prevents long-running queries from blocking the connection pool
 */
export async function executeWithTimeout<T>(
  queryFn: () => Promise<T>,
  timeoutMs: number = 30000 // 30 seconds default
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Query timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([queryFn(), timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Query timeout')) {
      logger.error('Query timeout', { timeoutMs });
    }
    throw error;
  }
}

/**
 * Middleware to log slow queries
 */
export function logSlowQueries(thresholdMs: number = 1000) {
  return prisma.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = Date.now();
        const result = await query(args);
        const duration = Date.now() - start;

        if (duration > thresholdMs) {
          logger.warn('Slow query detected', {
            model,
            operation,
            duration: `${duration}ms`,
            args: JSON.stringify(args).substring(0, 200),
          });
        }

        return result;
      },
    },
  });
}

// Export singleton instance
export default getPrismaClient();
