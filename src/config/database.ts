import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Optimize database connection with pooling
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL ? 
        // Add connection pool parameters to DATABASE_URL
        process.env.DATABASE_URL.includes('?') 
          ? `${process.env.DATABASE_URL}&connection_limit=5&pool_timeout=20`
          : `${process.env.DATABASE_URL}?connection_limit=5&pool_timeout=20`
        : undefined,
    },
  },
  // Add connection pool settings for better performance
  // This reduces connection overhead significantly
  errorFormat: 'minimal',
});

// Ensure connection is established on startup
prisma.$connect()
  .then(() => console.log('✅ Database connection pool established'))
  .catch((e) => console.error('❌ Database connection failed:', e));

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;