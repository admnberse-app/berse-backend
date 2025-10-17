import { body, param, query } from 'express-validator';

// ============================================================================
// FEEDBACK VALIDATORS
// ============================================================================

export const submitFeedbackValidators = [
  body('topicId')
    .trim()
    .notEmpty().withMessage('Topic ID is required'),
  
  body('sessionNumber')
    .isInt({ min: 1 }).withMessage('Session number must be at least 1'),
  
  body('questionId')
    .trim()
    .notEmpty().withMessage('Question ID is required'),
  
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment must not exceed 1000 characters'),
];

export const updateFeedbackValidators = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment must not exceed 1000 characters'),
];

// ============================================================================
// REPLY VALIDATORS
// ============================================================================

export const addReplyValidators = [
  body('text')
    .trim()
    .notEmpty().withMessage('Reply text is required')
    .isLength({ min: 1, max: 500 }).withMessage('Reply text must be between 1 and 500 characters'),
];

// ============================================================================
// QUERY VALIDATORS
// ============================================================================

export const feedbackQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be at least 1'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'rating', 'upvotes']).withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  
  query('topicId')
    .optional()
    .trim(),
  
  query('userId')
    .optional()
    .trim(),
  
  query('sessionNumber')
    .optional()
    .isInt({ min: 1 }).withMessage('Session number must be at least 1'),
  
  query('questionId')
    .optional()
    .trim(),
  
  query('minRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Min rating must be between 1 and 5'),
  
  query('maxRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Max rating must be between 1 and 5'),
  
  query('hasComments')
    .optional()
    .isBoolean().withMessage('Has comments must be a boolean'),
  
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
];

// ============================================================================
// ID VALIDATORS
// ============================================================================

export const idParamValidators = [
  param('id')
    .trim()
    .notEmpty().withMessage('ID is required'),
];

export const topicIdParamValidators = [
  param('topicId')
    .trim()
    .notEmpty().withMessage('Topic ID is required'),
];

export const userIdParamValidators = [
  param('userId')
    .optional()
    .trim(),
];
