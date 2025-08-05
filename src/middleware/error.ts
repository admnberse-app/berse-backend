import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import logger from '../utils/logger';
import { config } from '../config';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number = 400,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, false, 'DATABASE_ERROR', details);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error details
  const errorInfo = {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
  };

  if (err instanceof AppError) {
    errorInfo['statusCode'] = err.statusCode;
    errorInfo['code'] = err.code;
    errorInfo['isOperational'] = err.isOperational;
    errorInfo['details'] = err.details;
  }

  // Log based on error type
  if (err instanceof AppError && err.isOperational) {
    logger.warn('Operational Error:', errorInfo);
  } else {
    logger.error('System Error:', errorInfo);
  }

  // Handle specific error types
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    return sendError(res, message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = 'Validation failed';
    return sendError(res, message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.message === 'File too large') {
      message = 'File size exceeds limit';
    }
    return sendError(res, message, 400);
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      error: err.message,
    };

    if (err.code) {
      response.code = err.code;
    }

    // Include error details in development
    if (config.env === 'development' && err.details) {
      response.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  // Default error response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const message = config.env === 'production' 
    ? 'Internal server error' 
    : err.message || 'Internal server error';

  sendError(res, message, statusCode);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
  const message = `Cannot ${req.method} ${req.url}`;
  logger.warn('404 Not Found:', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  sendError(res, message, 404);
};