import { body, param, query } from 'express-validator';
import { CommunityRole } from '@prisma/client';
import { validateInterests } from './community.utils';

// ============================================================================
// COMMUNITY MANAGEMENT VALIDATORS
// ============================================================================

export const createCommunityValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Community name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&'\u2019]+$/).withMessage('Name contains invalid characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('logoUrl')
    .optional()
    .trim(),

  body('coverImageUrl')
    .optional()
    .trim(),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters (DEPRECATED - use interests instead)'),

  body('interests')
    .optional()
    .isArray().withMessage('Interests must be an array')
    .custom(async (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return true; // Optional field, empty is ok
      }

      if (value.length > 10) {
        throw new Error('Cannot select more than 10 interests');
      }

      if (value.some((interest: any) => typeof interest !== 'string')) {
        throw new Error('All interests must be strings');
      }

      const validation = await validateInterests(value);
      if (!validation.isValid) {
        throw new Error(
          `Invalid interests: ${validation.invalidInterests.join(', ')}. Please use values from the profile metadata interests list.`
        );
      }
    }

  ),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('City cannot exceed 100 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Country cannot exceed 100 characters'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),

  body('requiresApproval')
    .optional()
    .isBoolean().withMessage('requiresApproval must be a boolean'),

  body('guidelines')
    .optional()
    .trim()
    .isLength({ max: 10000 }).withMessage('Guidelines cannot exceed 10000 characters'),

  body('socialLinks')
    .optional()
    .isObject().withMessage('socialLinks must be an object'),

  body('socialLinks.instagram')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('Instagram must be a valid URL');
      }
      return true;
    }),

  body('socialLinks.facebook')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('Facebook must be a valid URL');
      }
      return true;
    }),

  body('socialLinks.linkedin')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      return /^https?:\/\/.+/.test(value);
    }).withMessage('LinkedIn must be a valid URL'),

  body('socialLinks.twitter')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('Twitter must be a valid URL');
      }
      return true;
    }),

  body('socialLinks.youtube')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      return /^https?:\/\/.+/.test(value);
    }).withMessage('YouTube must be a valid URL'),

  body('socialLinks.tiktok')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      return /^https?:\/\/.+/.test(value);
    }).withMessage('TikTok must be a valid URL'),

  body('websiteUrl')
    .optional()
    .trim()
    .isURL().withMessage('Website URL must be valid'),

  body('contactEmail')
    .optional()
    .trim()
    .isEmail().withMessage('Contact email must be valid'),
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
    .matches(/^[a-zA-Z0-9\s\-&'\u2019]+$/).withMessage('Name contains invalid characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('logoUrl')
    .optional()
    .trim(),

  body('coverImageUrl')
    .optional()
    .trim(),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters (DEPRECATED - use interests instead)'),

  body('interests')
    .optional()
    .isArray().withMessage('Interests must be an array')
    .custom(async (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return true; // Optional field, empty is ok
      }

      if (value.length > 10) {
        throw new Error('Cannot select more than 10 interests');
      }

      if (value.some((interest: any) => typeof interest !== 'string')) {
        throw new Error('All interests must be strings');
      }

      const validation = await validateInterests(value);
      if (!validation.isValid) {
        throw new Error(
          `Invalid interests: ${validation.invalidInterests.join(', ')}. Please use values from the profile metadata interests list.`
        );
      }

      return true;
    }),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('City cannot exceed 100 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Country cannot exceed 100 characters'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),

  body('requiresApproval')
    .optional()
    .isBoolean().withMessage('requiresApproval must be a boolean'),

  body('guidelines')
    .optional()
    .trim()
    .isLength({ max: 10000 }).withMessage('Guidelines cannot exceed 10000 characters'),

  body('socialLinks')
    .optional()
    .isObject().withMessage('socialLinks must be an object'),

  body('socialLinks.instagram')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('Instagram must be a valid URL');
      }
      return true;
    }),

  body('socialLinks.facebook')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('Facebook must be a valid URL');
      }
      return true;
    }),

  body('socialLinks.linkedin')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      return /^https?:\/\/.+/.test(value);
    }).withMessage('LinkedIn must be a valid URL'),

  body('socialLinks.twitter')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('Twitter must be a valid URL');
      }
      return true;
    }),

  body('socialLinks.youtube')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      return /^https?:\/\/.+/.test(value);
    }).withMessage('YouTube must be a valid URL'),

  body('socialLinks.tiktok')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      return /^https?:\/\/.+/.test(value);
    }).withMessage('TikTok must be a valid URL'),

  body('websiteUrl')
    .optional()
    .trim()
    .isURL().withMessage('Website URL must be valid'),

  body('contactEmail')
    .optional()
    .trim()
    .isEmail().withMessage('Contact email must be valid'),

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
  param('communityId')
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
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters (DEPRECATED - use interests instead)'),

  query('interests')
    .optional()
    .customSanitizer((value) => {
      // Support comma-separated string or array
      if (typeof value === 'string') {
        return value.split(',').map((v: string) => v.trim()).filter(Boolean);
      }
      return value;
    })
    .isArray().withMessage('Interests must be an array or comma-separated string')
    .custom(async (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return true;
      }

      if (value.length > 5) {
        throw new Error('Cannot filter by more than 5 interests at once');
      }

      const validation = await validateInterests(value);
      if (!validation.isValid) {
        throw new Error(
          `Invalid interests: ${validation.invalidInterests.join(', ')}`
        );
      }

      return true;
    }),

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
    .customSanitizer((value) => value?.toUpperCase())
    .isIn(Object.values(CommunityRole))
    .withMessage('Invalid role. Must be one of: MEMBER, MODERATOR, ADMIN, OWNER'),
  
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

/**
 * Validators for GET /v2/communities/:communityId/events
 */
export const communityEventsQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['SOCIAL', 'SPORTS', 'TRIP', 'ILM', 'CAFE_MEETUP', 'VOLUNTEER', 'MONTHLY_EVENT', 'LOCAL_TRIP'])
    .withMessage('Invalid event type'),
  query('upcoming')
    .optional()
    .isBoolean()
    .withMessage('upcoming must be a boolean'),
  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CANCELLED'])
    .withMessage('Invalid event status'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
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
