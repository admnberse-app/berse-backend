import { body, param, query, ValidationChain } from 'express-validator';
import { z } from 'zod';

// Advanced Zod schemas for type-safe validation
export const userSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  fullName: z.string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, apostrophes, and hyphens'),
  phoneNumber: z.string()
    .optional()
    .refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val), 'Invalid phone number format'),
});

export const eventSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(10).max(2000).trim(),
  type: z.enum(['SOCIAL', 'SPORTS', 'TRIP', 'ILM', 'CAFE_MEETUP', 'VOLUNTEER', 'MONTHLY_EVENT', 'LOCAL_TRIP']),
  date: z.string().datetime().refine(date => new Date(date) > new Date(), 'Event date must be in the future'),
  location: z.string().min(3).max(200).trim(),
  maxAttendees: z.number().int().min(1).max(10000).optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1).max(1000).trim(),
  receiverId: z.string().uuid(),
});

// Enhanced file upload validation
export const fileUploadValidators = [
  body('filename')
    .custom((value, { req }) => {
      if (!req.file) return true; // File is optional in some cases
      
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
      const fileExtension = value.toLowerCase().substring(value.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(fileExtension)) {
        throw new Error('Invalid file type. Allowed: jpg, jpeg, png, gif, pdf, doc, docx');
      }
      
      // Check file size (5MB limit)
      if (req.file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }
      
      return true;
    }),
];

// Advanced input sanitization with context awareness
export const contextualSanitizers = {
  // For user-generated content that allows some formatting
  richText: (input: string): string => {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  },
  
  // For search queries
  searchQuery: (input: string): string => {
    return input
      .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Limit length
  },
  
  // For URLs
  url: (input: string): string => {
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      return url.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  },
};

// Rate limiting validation for sensitive operations
export const sensitiveOperationValidators = [
  body('confirmation')
    .equals('CONFIRM')
    .withMessage('Please type CONFIRM to proceed with this action'),
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password required for sensitive operations'),
];

// Geolocation validation
export const locationValidators = [
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('accuracy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Invalid location accuracy'),
];

// Advanced date/time validation
export const dateTimeValidators = [
  body('startDate')
    .isISO8601()
    .custom((value, { req }) => {
      const startDate = new Date(value);
      const endDate = new Date(req.body.endDate);
      
      if (startDate >= endDate) {
        throw new Error('Start date must be before end date');
      }
      
      if (startDate < new Date()) {
        throw new Error('Start date cannot be in the past');
      }
      
      return true;
    }),
  body('endDate')
    .isISO8601()
    .custom((value) => {
      const endDate = new Date(value);
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);
      
      if (endDate > maxFutureDate) {
        throw new Error('End date cannot be more than 2 years in the future');
      }
      
      return true;
    }),
];

// Business logic validators
export const businessRuleValidators = {
  eventCapacity: body('maxAttendees')
    .custom(async (value, { req }) => {
      if (req.body.type === 'CAFE_MEETUP' && value > 20) {
        throw new Error('Cafe meetups cannot exceed 20 attendees');
      }
      if (req.body.type === 'LOCAL_TRIP' && value > 50) {
        throw new Error('Local trips cannot exceed 50 attendees');
      }
      return true;
    }),
  
  pointsLimit: body('points')
    .custom(async (value, { req }) => {
      // Check if user has enough points for deduction
      if (value < 0) {
        // This would require database access - implement in controller
        req.validatePointsDeduction = true;
      }
      return true;
    }),
};

// Multi-step form validation
export const multiStepValidators = {
  step1: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  step2: [
    body('fullName').trim().isLength({ min: 2, max: 100 }),
    body('phoneNumber').optional().matches(/^\+?[1-9]\d{1,14}$/),
  ],
  step3: [
    body('interests').isArray({ min: 1, max: 10 }),
    body('bio').optional().trim().isLength({ max: 500 }),
  ],
};

// Dynamic validation based on user role
export const roleBasedValidators = (requiredRole: string) => [
  body('*').custom(async (value, { req }) => {
    // This would be implemented in middleware to check user role
    req.requiredRole = requiredRole;
    return true;
  }),
];

// Export Zod validation middleware
export const validateSchema = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedBody = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};