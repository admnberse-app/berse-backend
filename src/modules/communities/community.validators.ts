import { body, param, query } from 'express-validator';
import { CommunityRole } from '@prisma/client';

// ============================================================================
// COMMUNITY MANAGEMENT VALIDATORS
// ============================================================================

export const createCommunityValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Community name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&']+$/).withMessage('Name contains invalid characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  
  body('imageUrl')
    .optional()
    .trim()
    .isURL().withMessage('Invalid image URL'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters'),
];

export const updateCommunityValidators = [
  param('communityId')
    .trim()
    .notEmpty().withMessage('Community ID is required')
    .isString().withMessage('Community ID must be a string'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&']+$/).withMessage('Name contains invalid characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  
  body('imageUrl')
    .optional()
    .trim()
    .isURL().withMessage('Invalid image URL'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters'),
  
  body('isVerified')
    .optional()
    .isBoolean().withMessage('isVerified must be a boolean'),
];

export const communityIdValidator = [
  param('communityId')
    .trim()
    .notEmpty().withMessage('Community ID is required')
    .isString().withMessage('Community ID must be a string'),
];

// ============================================================================
// COMMUNITY MEMBER VALIDATORS
// ============================================================================

export const joinCommunityValidators = [
  body('communityId')
    .trim()
    .notEmpty().withMessage('Community ID is required')
    .isString().withMessage('Community ID must be a string'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
];

export const updateMemberRoleValidators = [
  param('communityId')
    .trim()
    .notEmpty().withMessage('Community ID is required'),
  
  param('userId')
    .trim()
    .notEmpty().withMessage('User ID is required'),
  
  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isIn(Object.values(CommunityRole))
    .withMessage('Invalid role'),
];

export const removeMemberValidators = [
  param('communityId')
    .trim()
    .notEmpty().withMessage('Community ID is required'),
  
  param('userId')
    .trim()
    .notEmpty().withMessage('User ID is required'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
];

export const memberActionValidators = [
  param('communityId')
    .trim()
    .notEmpty().withMessage('Community ID is required'),
  
  param('userId')
    .trim()
    .notEmpty().withMessage('User ID is required'),
];

// ============================================================================
// COMMUNITY QUERY VALIDATORS
// ============================================================================

export const communityQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query cannot exceed 100 characters'),
  
  query('isVerified')
    .optional()
    .isBoolean().withMessage('isVerified must be a boolean')
    .toBoolean(),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'name', 'memberCount'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

export const communityMemberQueryValidators = [
  param('communityId')
    .trim()
    .notEmpty().withMessage('Community ID is required'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('role')
    .optional()
    .isIn(Object.values(CommunityRole))
    .withMessage('Invalid role'),
  
  query('isApproved')
    .optional()
    .isBoolean().withMessage('isApproved must be a boolean')
    .toBoolean(),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query cannot exceed 100 characters'),
  
  query('sortBy')
    .optional()
    .isIn(['joinedAt', 'name'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// ============================================================================
// COMMUNITY INVITE VALIDATORS
// ============================================================================

export const inviteToCommunityValidators = [
  param('communityId')
    .trim()
    .notEmpty().withMessage('Community ID is required'),
  
  body('userIds')
    .isArray({ min: 1, max: 50 }).withMessage('Must provide 1-50 user IDs')
    .custom((value) => {
      if (!Array.isArray(value) || value.some(id => typeof id !== 'string' || !id.trim())) {
        throw new Error('All user IDs must be non-empty strings');
      }
      return true;
    }),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
];

export const respondToInviteValidators = [
  param('inviteId')
    .trim()
    .notEmpty().withMessage('Invite ID is required'),
  
  body('action')
    .trim()
    .notEmpty().withMessage('Action is required')
    .isIn(['accept', 'reject']).withMessage('Action must be either accept or reject'),
];
