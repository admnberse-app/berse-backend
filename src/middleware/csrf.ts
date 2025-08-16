import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { sendError } from '../utils/response';

interface CsrfTokenStore {
  [key: string]: {
    token: string;
    timestamp: number;
  };
}

// In-memory store for CSRF tokens (use Redis in production)
const tokenStore: CsrfTokenStore = {};

// Token expiry time (15 minutes)
const TOKEN_EXPIRY = 15 * 60 * 1000;

// Generate CSRF token
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Clean expired tokens
const cleanExpiredTokens = () => {
  const now = Date.now();
  Object.keys(tokenStore).forEach(sessionId => {
    if (tokenStore[sessionId] && now - tokenStore[sessionId].timestamp > TOKEN_EXPIRY) {
      delete tokenStore[sessionId];
    }
  });
};

// Periodic cleanup
setInterval(cleanExpiredTokens, 5 * 60 * 1000); // Every 5 minutes

// CSRF token generation middleware
export const csrfTokenGenerator = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = (req as any).user?.id || (req as any).sessionID || req.ip;
  
  if (!sessionId) {
    return next();
  }

  // Generate new token
  const token = generateCsrfToken();
  
  // Store token with timestamp
  tokenStore[sessionId] = {
    token,
    timestamp: Date.now(),
  };

  // Add token to response locals
  res.locals.csrfToken = token;
  
  // Set token in response header
  res.setHeader('X-CSRF-Token', token);
  
  next();
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const sessionId = (req as any).user?.id || (req as any).sessionID || req.ip;
  
  if (!sessionId) {
    return sendError(res, 'Session required for CSRF protection', 403);
  }

  // Get token from request
  const requestToken = req.headers['x-csrf-token'] || 
                      req.body._csrf || 
                      req.query._csrf;

  if (!requestToken) {
    return sendError(res, 'CSRF token missing', 403);
  }

  // Check stored token
  const storedData = tokenStore[sessionId];
  
  if (!storedData) {
    return sendError(res, 'CSRF token not found', 403);
  }

  // Check token expiry
  if (Date.now() - storedData.timestamp > TOKEN_EXPIRY) {
    delete tokenStore[sessionId];
    return sendError(res, 'CSRF token expired', 403);
  }

  // Validate token
  if (storedData.token !== requestToken) {
    return sendError(res, 'Invalid CSRF token', 403);
  }

  // Token is valid, continue
  next();
};

// Double submit cookie CSRF protection (alternative implementation)
export const doubleSubmitCsrf = {
  generate: (_req: Request, res: Response, next: NextFunction) => {
    const token = generateCsrfToken();
    
    // Set token in cookie
    res.cookie('csrf-token', token, {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TOKEN_EXPIRY,
    });
    
    res.locals.csrfToken = token;
    next();
  },
  
  verify: (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const cookieToken = req.cookies['csrf-token'];
    const headerToken = req.headers['x-csrf-token'];
    
    if (!cookieToken || !headerToken) {
      return sendError(res, 'CSRF token missing', 403);
    }
    
    if (cookieToken !== headerToken) {
      return sendError(res, 'Invalid CSRF token', 403);
    }
    
    next();
  },
};

// CSRF token endpoint
export const csrfTokenEndpoint = (req: Request, res: Response): void => {
  const sessionId = (req as any).user?.id || (req as any).sessionID || req.ip;
  
  if (!sessionId) {
    sendError(res, 'Session required', 401);
    return;
  }

  const token = generateCsrfToken();
  
  tokenStore[sessionId] = {
    token,
    timestamp: Date.now(),
  };

  res.json({
    success: true,
    data: { csrfToken: token },
  });
};

export default {
  csrfTokenGenerator,
  csrfProtection,
  doubleSubmitCsrf,
  csrfTokenEndpoint,
};