import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { sendError } from '../utils/response';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : undefined,
      message: error.msg,
    }));

    const errorMessage = formattedErrors
      .map(err => err.field ? `${err.field}: ${err.message}` : err.message)
      .join(', ');

    sendError(res, errorMessage, 400);
    return;
  }
  
  next();
};

// XSS Prevention middleware
export const xssProtection = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Sanitize common fields susceptible to XSS
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  
  if (req.query) {
    const sanitizedQuery = sanitizeValue(req.query);
    Object.keys(sanitizedQuery).forEach(key => {
      (req.query as any)[key] = sanitizedQuery[key];
    });
  }
  
  next();
};

// SQL Injection Prevention (for raw queries if any)
export const sqlInjectionProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const suspiciousPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b).*(\b(from|where|table)\b)/gi,
    /(--|\/\*|\*\/|xp_|sp_|0x[0-9a-f]+)/gi,
    /(\bor\b.*=.*\bor\b|\band\b.*=.*\band\b)/gi,
    /(';|";|`|\\x[0-9a-f]{2}|\\u[0-9a-f]{4})/gi,
  ];

  const checkForInjection = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(value));
  };

  const validateObject = (obj: any): boolean => {
    for (const key in obj) {
      const value = obj[key];
      if (checkForInjection(value)) return true;
      if (Array.isArray(value)) {
        if (value.some(checkForInjection)) return true;
      } else if (typeof value === 'object' && value !== null) {
        if (validateObject(value)) return true;
      }
    }
    return false;
  };

  if (validateObject(req.body) || validateObject(req.query) || validateObject(req.params)) {
    sendError(res, 'Invalid input detected', 400);
    return;
  }

  next();
};

// Request size limit
export const requestSizeLimit = (limit: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.headers['content-length'];
    if (contentLength) {
      const bytes = parseInt(contentLength);
      const maxBytes = parseSize(limit);
      if (bytes > maxBytes) {
        sendError(res, 'Request entity too large', 413);
        return;
      }
    }
    next();
  };
};

// Helper to parse size strings
const parseSize = (size: string): number => {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };
  
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB
  
  const num = parseInt(match[1]);
  const unit = match[2] || 'b';
  return num * units[unit];
};

// Content type validation
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.headers['content-type'];
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      sendError(res, 'Invalid content type', 415);
      return;
    }
    next();
  };
};

// Combine all security validations
export const securityMiddleware = [
  xssProtection,
  sqlInjectionProtection,
  requestSizeLimit('10mb'),
];