import { body, param, query } from 'express-validator';
import { ConnectionStatus } from '@prisma/client';

// ============================================================================
// CONNECTION REQUEST VALIDATORS
// ============================================================================

export const sendConnectionRequestValidators = [
  body('receiverId')
    .trim()
    .notEmpty().withMessage('Receiver ID is required')
    .isString().withMessage('Receiver ID must be a string'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
  
  body('relationshipType')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Relationship type cannot exceed 50 characters'),
  
  body('relationshipCategory')
    .optional()
    .trim()
    .isIn(['professional', 'friend', 'family', 'mentor', 'travel', 'community', 'other'])
    .withMessage('Invalid relationship category'),
  
  body('howWeMet')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('How we met cannot exceed 200 characters'),
];

export const respondToConnectionRequestValidators = [
  param('connectionId')
    .trim()
    .notEmpty().withMessage('Connection ID is required')
    .isString().withMessage('Connection ID must be a string'),
  
  body('action')
    .trim()
    .notEmpty().withMessage('Action is required')
    .isIn(['accept', 'reject']).withMessage('Action must be either accept or reject'),
];

export const connectionIdValidator = [
  param('connectionId')
    .trim()
    .notEmpty().withMessage('Connection ID is required')
    .isString().withMessage('Connection ID must be a string'),
];

export const updateConnectionValidators = [
  param('connectionId')
    .trim()
    .notEmpty().withMessage('Connection ID is required')
    .isString().withMessage('Connection ID must be a string'),
  
  body('relationshipType')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Relationship type cannot exceed 50 characters'),
  
  body('relationshipCategory')
    .optional()
    .trim()
    .isIn(['professional', 'friend', 'family', 'mentor', 'travel', 'community', 'other'])
    .withMessage('Invalid relationship category'),
  
  body('howWeMet')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('How we met cannot exceed 200 characters'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('Each tag cannot exceed 30 characters'),
];

// ============================================================================
// BLOCK USER VALIDATORS
// ============================================================================

export const blockUserValidators = [
  body('userId')
    .trim()
    .notEmpty().withMessage('User ID is required')
    .isString().withMessage('User ID must be a string'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
];

export const unblockUserValidators = [
  param('userId')
    .trim()
    .notEmpty().withMessage('User ID is required')
    .isString().withMessage('User ID must be a string'),
];

// ============================================================================
// CONNECTION QUERY VALIDATORS
// ============================================================================

export const connectionQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('status')
    .optional()
    .isIn(Object.values(ConnectionStatus))
    .withMessage('Invalid connection status'),
  
  query('relationshipCategory')
    .optional()
    .trim()
    .isIn(['professional', 'friend', 'family', 'mentor', 'travel', 'community', 'other'])
    .withMessage('Invalid relationship category'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query cannot exceed 100 characters'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'connectedAt', 'trustStrength', 'interactionCount'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

export const mutualConnectionsValidators = [
  param('userId')
    .trim()
    .notEmpty().withMessage('User ID is required')
    .isString().withMessage('User ID must be a string'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
];

export const connectionSuggestionsValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
    .toInt(),
  
  query('basedOn')
    .optional()
    .isIn(['mutual_friends', 'mutual_communities', 'mutual_events', 'location', 'interests'])
    .withMessage('Invalid suggestion basis'),
];
