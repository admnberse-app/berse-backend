import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';
import { prisma } from '../config/database';
import { UserRole } from '@prisma/client';
import JwtManager from '../utils/jwt';
import { AuthenticationError, AuthorizationError } from './error';
import logger from '../utils/logger';

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    // Verify access token
    const payload = JwtManager.verifyAccessToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        totalPoints: true,
        serviceProfile: {
          select: {
            isHostCertified: true,
            isHostAvailable: true,
            isGuideAvailable: true,
          },
        },
      },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new AuthenticationError('Account is not active');
    }

    // Add user to request object
    req.user = user as any;
    next();
  } catch (error) {
    if (error.message === 'Invalid access token' || error.name === 'JsonWebTokenError') {
      logger.warn('Invalid access token used', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        url: req.url,
      });
      sendError(res, 'Invalid or expired token', 401);
    } else if (error.name === 'TokenExpiredError') {
      sendError(res, 'Token expired', 401);
    } else {
      logger.error('Authentication error', { error: error.message });
      sendError(res, 'Authentication failed', 401);
    }
  }
};

// Optional authentication - doesn't fail if no token is provided
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      // No token provided, continue without user
      return next();
    }

    // Verify access token
    const payload = JwtManager.verifyAccessToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        totalPoints: true,
        serviceProfile: {
          select: {
            isHostCertified: true,
            isHostAvailable: true,
            isGuideAvailable: true,
          },
        },
      },
    });

    if (user && user.status === 'ACTIVE') {
      req.user = user as any;
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.url,
      });
      throw new AuthorizationError('Insufficient permissions');
    }

    next();
  };
};

// Middleware to check if user is host certified
export const requireHostCertification = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (!req.user.serviceProfile?.isHostCertified) {
    throw new AuthorizationError('Host certification required');
  }

  next();
};

// Middleware to check if user owns the resource
export const requireOwnership = (userIdField: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (resourceUserId !== req.user.id && req.user.role !== UserRole.ADMIN) {
      logger.warn('Ownership check failed', {
        userId: req.user.id,
        resourceUserId,
        url: req.url,
      });
      throw new AuthorizationError('You can only access your own resources');
    }

    next();
  };
};

// Middleware to check rate limiting per user
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    
    const userRequests = requests.get(userId);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      logger.warn('User rate limit exceeded', {
        userId: req.user?.id,
        ip: req.ip,
        count: userRequests.count,
        url: req.url,
      });
      sendError(res, 'Rate limit exceeded', 429);
      return;
    }
    
    userRequests.count++;
    next();
  };
};

// Legacy middleware names for backward compatibility
export const authenticate = authenticateToken;