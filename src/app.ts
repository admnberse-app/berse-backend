import express, { Application } from 'express';
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

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import pointsRoutes from './routes/points.routes';
import rewardsRoutes from './routes/rewards.routes';
import badgeRoutes from './routes/badge.routes';
import notificationRoutes from './routes/notification.routes';
import matchingRoutes from './routes/matching.routes';

const app: Application = express();

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
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
}));

// General middleware
app.use(compression());
app.use(morgan('combined', { stream }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-cookie-secret-here'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Apply security middleware to all routes
app.use(securityMiddleware);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/matches', matchingRoutes);

// Root route
app.get('/', (_req, res) => {
  res.json({ message: 'BerseMuka API is running!' });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// CSRF token endpoint
app.get('/api/csrf-token', csrfTokenEndpoint);

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Error handling
app.use(errorHandler);

// Log application startup
logger.info('BerseMuka API initialized', {
  environment: config.env,
  cors: config.cors.origin,
});

export default app;