import { body, param, query } from 'express-validator';

// ============================================================================
// TOPIC VALIDATORS
// ============================================================================

export const createTopicValidators = [
  body('id')
    .trim()
    .notEmpty().withMessage('Topic ID is required')
    .isLength({ min: 2, max: 50 }).withMessage('Topic ID must be between 2 and 50 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Topic ID must contain only lowercase letters, numbers, and hyphens'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  body('gradient')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Gradient must not exceed 200 characters'),
  
  body('totalSessions')
    .isInt({ min: 1, max: 20 }).withMessage('Total sessions must be between 1 and 20'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
];

export const updateTopicValidators = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  body('gradient')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Gradient must not exceed 200 characters'),
  
  body('totalSessions')
    .optional()
    .isInt({ min: 1, max: 20 }).withMessage('Total sessions must be between 1 and 20'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
];

// ============================================================================
// QUESTION VALIDATORS
// ============================================================================

export const createQuestionValidators = [
  body('topicId')
    .trim()
    .notEmpty().withMessage('Topic ID is required'),
  
  body('sessionNumber')
    .isInt({ min: 1, max: 20 }).withMessage('Session number must be between 1 and 20'),
  
  body('questionOrder')
    .isInt({ min: 1, max: 50 }).withMessage('Question order must be between 1 and 50'),
  
  body('questionText')
    .trim()
    .notEmpty().withMessage('Question text is required')
    .isLength({ min: 10, max: 500 }).withMessage('Question text must be between 10 and 500 characters'),
];

export const updateQuestionValidators = [
  body('questionText')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 }).withMessage('Question text must be between 10 and 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

// ============================================================================
// SESSION VALIDATORS
// ============================================================================

export const startSessionValidators = [
  body('topicId')
    .trim()
    .notEmpty().withMessage('Topic ID is required'),
  
  body('sessionNumber')
    .isInt({ min: 1, max: 20 }).withMessage('Session number must be between 1 and 20'),
  
  body('totalQuestions')
    .isInt({ min: 1, max: 50 }).withMessage('Total questions must be between 1 and 50'),
];

export const completeSessionValidators = [
  body('averageRating')
    .optional()
    .isFloat({ min: 1, max: 5 }).withMessage('Average rating must be between 1 and 5'),
];

export const sessionQueryValidators = [
  param('topicId')
    .trim()
    .notEmpty().withMessage('Topic ID is required'),
  
  param('sessionNumber')
    .isInt({ min: 1 }).withMessage('Session number must be at least 1'),
];

export const sessionQuestionsValidators = [
  param('topicId')
    .trim()
    .notEmpty().withMessage('Topic ID is required'),
  
  param('sessionNumber')
    .isInt({ min: 1 }).withMessage('Session number must be at least 1'),
];

export const sessionSummaryValidators = [
  param('topicId')
    .trim()
    .notEmpty().withMessage('Topic ID is required'),
  
  param('sessionNumber')
    .isInt({ min: 1 }).withMessage('Session number must be at least 1'),
];

// ============================================================================
// FEEDBACK VALIDATORS
// ============================================================================

export const submitFeedbackValidators = [
  body('topicId')
    .trim()
    .notEmpty().withMessage('Topic ID is required'),
  
  body('topicTitle')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Topic title must not exceed 100 characters'),
  
  body('sessionNumber')
    .isInt({ min: 1 }).withMessage('Session number must be at least 1'),
  
  body('questionId')
    .trim()
    .notEmpty().withMessage('Question ID is required'),
  
  body('questionText')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Question text must not exceed 500 characters'),
  
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment must not exceed 1000 characters'),
  
  body('isHelpful')
    .optional()
    .isBoolean().withMessage('isHelpful must be a boolean'),
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

export const questionIdParamValidators = [
  param('questionId')
    .trim()
    .notEmpty().withMessage('Question ID is required'),
];
