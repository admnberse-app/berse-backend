import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/error';
import { generalLimiter } from './middleware/rateLimiter';
import { securityMiddleware } from './middleware/validation';
import { csrfTokenEndpoint } from './middleware/csrf';
import logger, { stream } from './utils/logger';

// Import API routers
import apiV1Router from './routes/api/v1';

const app: Application = express();

// Trust proxy for production
if (config.isProduction) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: !config.isDevelopment,
}));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = config.cors.origin;
    if (!origin || allowedOrigins.includes(origin) || config.isDevelopment) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400, // 24 hours
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser(config.security.cookieSecret));

// Compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
}));

// Logging
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { 
    stream,
    skip: (req, res) => res.statusCode < 400
  }));
}

// Rate limiting
// app.use('/api/', generalLimiter); // TEMPORARILY DISABLED FOR TESTING

// Additional security
app.use(securityMiddleware);

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Health check endpoints (no rate limiting)
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

app.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    const { prisma } = await import('./config/database');
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'ready',
      services: {
        database: true,
        cache: true, // Add Redis check when implemented
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'not ready',
      services: {
        database: false,
        cache: false,
      }
    });
  }
});

// Static files with caching
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '30d',
  etag: true,
  lastModified: true,
}));

// API Routes with versioning
app.use('/api/v1', apiV1Router);

// CSRF token endpoint
app.get('/api/csrf-token', csrfTokenEndpoint);

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    name: 'BerseMuka API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs',
    health: '/health',
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id?: string;
      rawBody?: string;
      user?: any;
    }
  }
}

export default app;