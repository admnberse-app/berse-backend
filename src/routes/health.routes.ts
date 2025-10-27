import { Router } from 'express';
import { prisma } from '../config/database';
import { config } from '../config';
import { emailService } from '../services/email.service';
import os from 'os';
import fs from 'fs';
import path from 'path';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: boolean;
    redis: boolean;
    storage: boolean;
  };
  metrics: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      loadAverage: number[];
      cores: number;
    };
  };
}

// Basic health check
router.get('/health', async (req, res) => {
  try {
    // Quick database check
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: 'Service unavailable'
    });
  }
});

// Detailed health check (protected endpoint)
router.get('/health/detailed', async (req, res): Promise<void> => {
  const startTime = Date.now();
  
  // Check authorization header for monitoring services
  const authHeader = req.headers.authorization;
  const monitoringToken = process.env.MONITORING_TOKEN;
  
  if (monitoringToken && authHeader !== `Bearer ${monitoringToken}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.env,
    services: {
      database: false,
      redis: false,
      storage: false
    },
    metrics: {
      memory: {
        used: 0,
        total: 0,
        percentage: 0
      },
      cpu: {
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      }
    }
  };
  
  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    
    health.services.database = true;
    
    if (dbLatency > 1000) {
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.database = false;
    health.status = 'unhealthy';
  }
  
  // Check Redis (if configured)
  if (config.redis.host) {
    try {
      // Add Redis health check here if Redis client is available
      health.services.redis = true;
    } catch (error) {
      health.services.redis = false;
      if (health.status === 'healthy') {
        health.status = 'degraded';
      }
    }
  }
  
  // Check storage
  try {
    const uploadDir = path.join(process.cwd(), config.upload.uploadDir);
    await fs.promises.access(uploadDir, fs.constants.W_OK);
    health.services.storage = true;
  } catch (error) {
    health.services.storage = false;
    if (health.status === 'healthy') {
      health.status = 'degraded';
    }
  }
  
  // Memory metrics
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const usedMem = totalMem - os.freemem();
  
  health.metrics.memory = {
    used: Math.round(usedMem / 1024 / 1024),
    total: Math.round(totalMem / 1024 / 1024),
    percentage: Math.round((usedMem / totalMem) * 100)
  };
  
  // Set appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503;
  
  res.status(statusCode).json({
    ...health,
    responseTime: Date.now() - startTime
  });
});

// Liveness probe for Kubernetes
router.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// Readiness probe for Kubernetes
router.get('/health/ready', async (req, res) => {
  try {
    // Check if database is ready
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString()
    });
  }
});

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      res.status(400).json({
        success: false,
        error: 'Email address is required. Provide "to" in request body.'
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email address format'
      });
      return;
    }
    
    console.log(`📧 Sending test email to: ${to}`);
    
    const result = await emailService.sendTestEmail(to);
    
    if (result) {
      res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${to}`,
        timestamp: new Date().toISOString(),
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          from: process.env.FROM_EMAIL
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send email. Check server logs for details.'
      });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test email',
      details: error.stack
    });
  }
});

export default router;