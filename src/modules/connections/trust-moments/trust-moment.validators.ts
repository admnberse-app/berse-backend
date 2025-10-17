import { body, param, query } from 'express-validator';

/**
 * Create Trust Moment Validators
 */
export const createTrustMomentValidators = [
  param('connectionId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Connection ID is required'),

  body('receiverId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Receiver ID is required'),

  body('eventId')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Event ID must be a valid string'),

  body('momentType')
    .optional()
    .isString()
    .trim()
    .isIn(['event', 'travel', 'collaboration', 'service', 'general'])
    .withMessage('Moment type must be one of: event, travel, collaboration, service, general'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('feedback')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback must not exceed 1000 characters'),

  body('experienceDescription')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Experience description must not exceed 500 characters'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

/**
 * Update Trust Moment Validators
 */
export const updateTrustMomentValidators = [
  param('momentId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Moment ID is required'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('feedback')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback must not exceed 1000 characters'),

  body('experienceDescription')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Experience description must not exceed 500 characters'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

/**
 * Delete Trust Moment Validators
 */
export const deleteTrustMomentValidators = [
  param('momentId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Moment ID is required'),
];

/**
 * Get Trust Moment Validators
 */
export const getTrustMomentValidators = [
  param('momentId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Moment ID is required'),
];

/**
 * Trust Moment Query Validators
 */
export const trustMomentQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('momentType')
    .optional()
    .isString()
    .trim()
    .isIn(['event', 'travel', 'collaboration', 'service', 'general'])
    .withMessage('Moment type must be one of: event, travel, collaboration, service, general'),

  query('eventId')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Event ID must be a valid string'),

  query('minRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Minimum rating must be between 1 and 5'),

  query('maxRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Maximum rating must be between 1 and 5'),

  query('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),

  query('sortBy')
    .optional()
    .isString()
    .isIn(['createdAt', 'rating', 'trustImpact'])
    .withMessage('sortBy must be one of: createdAt, rating, trustImpact'),

  query('sortOrder')
    .optional()
    .isString()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),
];

/**
 * User ID Parameter Validator
 */
export const userIdParamValidator = [
  param('userId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('User ID is required'),
];

/**
 * Event ID Parameter Validator
 */
export const eventIdParamValidator = [
  param('eventId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Event ID is required'),
];
