import app from './app';
import { config } from './config';
import { prisma } from './config/database';
import logger from './utils/logger';
import cluster from 'cluster';
import os from 'os';
// TEMPORARILY DISABLED - Job needs schema compliance updates
// import { initializeProfileReminderJob } from './jobs/profileCompletionReminders';
import { MembershipService } from './services/membership.service';

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
        
        // Fix any missing membership IDs on startup
        try {
          await MembershipService.fixMissingMembershipIds();
          logger.info('✅ Checked and fixed missing membership IDs');
        } catch (error) {
          logger.error('Failed to fix missing membership IDs:', error);
        }
        
        break;
      } catch (dbError) {
        retries--;
        if (retries === 0) {
          logger.error('❌ CRITICAL: Cannot start server without database connection');
          logger.error('Database error:', dbError);
          logger.error('Please check DATABASE_URL and ensure database is accessible');
          process.exit(1); // Exit with error - don't run without database
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
      // TEMPORARILY DISABLED - Job needs schema compliance updates
      // if (cluster.isPrimary || !config.isProduction) {
      //   try {
      //     initializeProfileReminderJob();
      //     logger.info('✅ Profile completion reminder job initialized');
      //   } catch (error) {
      //     logger.error('Failed to initialize profile reminder job:', error);
      //   }
      // }
      
      if (config.isDevelopment) {
        logger.info('\n� API DOCUMENTATION:');
        logger.info(`   🎨 Swagger UI:  http://localhost:${config.port}/api-docs`);
        logger.info(`   📖 ReDoc:       http://localhost:${config.port}/docs`);
        logger.info(`   📄 OpenAPI:     http://localhost:${config.port}/api-docs.json`);
        
        logger.info('\n�📌 Available V2 Endpoints (Primary):');
        logger.info(`   GET  http://localhost:${config.port}/`);
        logger.info(`   GET  http://localhost:${config.port}/health`);
        logger.info(`   GET  http://localhost:${config.port}/v2/health`);
        
        logger.info('\n🔐 Authentication:');
        logger.info(`   POST http://localhost:${config.port}/v2/auth/register`);
        logger.info(`   POST http://localhost:${config.port}/v2/auth/login`);
        logger.info(`   POST http://localhost:${config.port}/v2/auth/logout`);
        logger.info(`   POST http://localhost:${config.port}/v2/auth/refresh`);
        logger.info(`   POST http://localhost:${config.port}/v2/auth/forgot-password`);
        logger.info(`   POST http://localhost:${config.port}/v2/auth/reset-password`);
        logger.info(`   POST http://localhost:${config.port}/v2/auth/verify-email`);
        logger.info(`   POST http://localhost:${config.port}/v2/auth/resend-verification`);
        
        logger.info('\n👥 Users & Connections:');
        logger.info(`   GET  http://localhost:${config.port}/v2/users/profile`);
        logger.info(`   PUT  http://localhost:${config.port}/v2/users/profile`);
        logger.info(`   GET  http://localhost:${config.port}/v2/users/search`);
        logger.info(`   GET  http://localhost:${config.port}/v2/users/nearby`);
        logger.info(`   GET  http://localhost:${config.port}/v2/users/all`);
        logger.info(`   GET  http://localhost:${config.port}/v2/users/:id`);
        logger.info(`   POST http://localhost:${config.port}/v2/users/upload-avatar`);
        logger.info(`   POST http://localhost:${config.port}/v2/users/connections/:id/request`);
        logger.info(`   POST http://localhost:${config.port}/v2/users/connections/:id/accept`);
        logger.info(`   POST http://localhost:${config.port}/v2/users/connections/:id/reject`);
        logger.info(`   POST http://localhost:${config.port}/v2/users/connections/:id/cancel`);
        logger.info(`   DEL  http://localhost:${config.port}/v2/users/connections/:id`);
        logger.info(`   GET  http://localhost:${config.port}/v2/users/connections`);
        
        logger.info('\n🔒 Activity & Security:');
        logger.info(`   GET  http://localhost:${config.port}/v2/users/activity`);
        logger.info(`   GET  http://localhost:${config.port}/v2/users/security-events`);
        logger.info(`   GET  http://localhost:${config.port}/v2/users/sessions`);
        logger.info(`   GET  http://localhost:${config.port}/v2/users/login-history`);
        logger.info(`   DEL  http://localhost:${config.port}/v2/users/sessions/:sessionToken`);
        
        logger.info('\n🎯 Onboarding:');
        logger.info(`   GET  http://localhost:${config.port}/v2/onboarding/screens`);
        logger.info(`   POST http://localhost:${config.port}/v2/onboarding/track`);
        logger.info(`   POST http://localhost:${config.port}/v2/onboarding/complete`);
        
        logger.info('\n📋 Legacy V1 Endpoints (Backward Compatibility):');
        logger.info(`   POST http://localhost:${config.port}/api/v1/auth/register`);
        logger.info(`   POST http://localhost:${config.port}/api/v1/auth/login`);
        logger.info(`   GET  http://localhost:${config.port}/api/v1/users/profile`);
        logger.info(`   Note: Most v1 endpoints temporarily disabled - use v2`);
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