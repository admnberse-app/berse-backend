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
        // Add connection pool parameters if not already present
        (() => {
          const url = process.env.DATABASE_URL!;
          if (url.includes('connection_limit=')) {
            return url; // Already has connection limit
          }
          const separator = url.includes('?') ? '&' : '?';
          return `${url}${separator}connection_limit=10&pool_timeout=20`;
        })()
        : undefined,
    },
  },
  // Add connection pool settings for better performance
  // This reduces connection overhead significantly
  errorFormat: 'minimal',
});

// Check if connecting to Railway staging database and show warning
if (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('railway') || process.env.DATABASE_URL.includes('rlwy'))) {
  let host = 'unknown';
  try {
    // Extract host from DATABASE_URL without exposing password
    const url = new URL(process.env.DATABASE_URL);
    host = `${url.hostname}${url.port ? ':' + url.port : ''}`;
  } catch (e) {
    // If URL parsing fails, try to extract host manually
    const match = process.env.DATABASE_URL.match(/@([^/]+)/);
    if (match) host = match[1];
  }
  
  console.warn('\n⚠️  WARNING: Connecting to RAILWAY STAGING DATABASE');
  console.warn(`⚠️  Host: ${host}`);
  console.warn('⚠️  This affects production/staging data. Use \'npm run dev:local\' for local database.\n');
}

// Ensure connection is established on startup
prisma.$connect()
  .then(() => console.log('✅ Database connection pool established'))
  .catch((e) => console.error('❌ Database connection failed:', e));

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;