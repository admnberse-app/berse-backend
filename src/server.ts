import app from './app';
import { config } from './config';
import { prisma } from './config/database';
import logger from './utils/logger';
import cluster from 'cluster';
import os from 'os';
import { initializeProfileReminderJob } from './jobs/profileCompletionReminders';

// Enable cluster mode for production
const setupCluster = () => {
  const numWorkers = config.isProduction ? os.cpus().length : 1;
  
  if (cluster.isPrimary && config.isProduction) {
    logger.info(`Master ${process.pid} is running`);
    
    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
      logger.error(`Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } else {
    startServer();
  }
};

const startServer = async () => {
  try {
    // Test database connection with retry logic
    let retries = 5;
    while (retries > 0) {
      try {
        await prisma.$connect();
        logger.info('✅ Database connected successfully');
        break;
      } catch (dbError) {
        retries--;
        if (retries === 0) {
          logger.warn('⚠️  Database connection failed - running without database');
          logger.warn('Please ensure PostgreSQL is running on port 5433');
        } else {
          logger.info(`Database connection failed. Retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server is running on port ${config.port}`);
      logger.info(`📊 Environment: ${config.env}`);
      logger.info(`🔗 http://localhost:${config.port}`);
      logger.info(`👥 Worker ${process.pid} started`);
      
      // Initialize profile completion reminder job
      if (cluster.isPrimary || !config.isProduction) {
        try {
          initializeProfileReminderJob();
          logger.info('✅ Profile completion reminder job initialized');
        } catch (error) {
          logger.error('Failed to initialize profile reminder job:', error);
        }
      }
      
      if (config.isDevelopment) {
        logger.info('\n📌 Available endpoints:');
        logger.info(`   GET  http://localhost:${config.port}/`);
        logger.info(`   GET  http://localhost:${config.port}/health`);
        logger.info(`   GET  http://localhost:${config.port}/api/v1/health`);
        logger.info(`   POST http://localhost:${config.port}/api/v1/auth/register`);
        logger.info(`   POST http://localhost:${config.port}/api/v1/auth/login`);
        logger.info(`   GET  http://localhost:${config.port}/api/v1/push/vapid-public-key`);
        logger.info(`   POST http://localhost:${config.port}/api/v1/push/subscribe`);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await prisma.$disconnect();
          logger.info('Database connection closed');
        } catch (error) {
          logger.error('Error disconnecting from database:', error);
        }
        
        process.exit(0);
      });
      
      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled Rejection: ${reason}`);
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Start with clustering in production
if (config.isProduction) {
  setupCluster();
} else {
  startServer();
}