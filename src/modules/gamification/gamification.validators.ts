import { body, param, query } from 'express-validator';
import { BadgeType, RedemptionStatus } from '@prisma/client';

// ================== Badge Validators ==================

export const getBadgeByIdValidator = [
  param('id').notEmpty().withMessage('Badge ID is required'),
];

export const awardBadgeValidator = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('badgeType')
    .notEmpty()
    .withMessage('Badge type is required')
    .isIn(Object.values(BadgeType))
    .withMessage('Invalid badge type'),
];

export const revokeBadgeValidator = [
  param('badgeId').notEmpty().withMessage('Badge ID is required'),
  param('userId').notEmpty().withMessage('User ID is required'),
];

export const createBadgeValidator = [
  body('type')
    .notEmpty()
    .withMessage('Badge type is required')
    .isIn(Object.values(BadgeType))
    .withMessage('Invalid badge type'),
  body('name').notEmpty().withMessage('Badge name is required').trim(),
  body('description').notEmpty().withMessage('Badge description is required').trim(),
  body('criteria').notEmpty().withMessage('Badge criteria is required').trim(),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
];

export const updateBadgeValidator = [
  param('id').notEmpty().withMessage('Badge ID is required'),
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('criteria').optional().trim(),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
];

// ================== Points Validators ==================

export const awardPointsValidator = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('points')
    .notEmpty()
    .withMessage('Points amount is required')
    .isInt({ min: 1 })
    .withMessage('Points must be a positive integer'),
  body('action').notEmpty().withMessage('Action is required').trim(),
  body('description').optional().trim(),
];

export const deductPointsValidator = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('points')
    .notEmpty()
    .withMessage('Points amount is required')
    .isInt({ min: 1 })
    .withMessage('Points must be a positive integer'),
  body('description').notEmpty().withMessage('Description is required').trim(),
];

export const pointHistoryValidator = [
  query('action').optional().trim(),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
];

// ================== Rewards Validators ==================

export const getRewardsValidator = [
  query('category').optional().trim(),
  query('minPoints').optional().isInt({ min: 0 }).withMessage('Minimum points must be non-negative'),
  query('maxPoints').optional().isInt({ min: 0 }).withMessage('Maximum points must be non-negative'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('canAfford').optional().isBoolean().withMessage('canAfford must be a boolean'),
];

export const createRewardValidator = [
  body('title').notEmpty().withMessage('Reward title is required').trim(),
  body('description').notEmpty().withMessage('Reward description is required').trim(),
  body('pointsRequired')
    .notEmpty()
    .withMessage('Points required is required')
    .isInt({ min: 1 })
    .withMessage('Points required must be a positive integer'),
  body('category').notEmpty().withMessage('Category is required').trim(),
  body('partner').notEmpty().withMessage('Partner is required').trim(),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be non-negative'),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
];

export const updateRewardValidator = [
  param('id').notEmpty().withMessage('Reward ID is required'),
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('pointsRequired').optional().isInt({ min: 1 }).withMessage('Points required must be a positive integer'),
  body('category').optional().trim(),
  body('partner').optional().trim(),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const redeemRewardValidator = [
  body('rewardId').notEmpty().withMessage('Reward ID is required'),
];

export const updateRedemptionStatusValidator = [
  param('id').notEmpty().withMessage('Redemption ID is required'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(RedemptionStatus))
    .withMessage('Invalid redemption status'),
  body('notes').optional().trim(),
];

// ================== Leaderboard Validators ==================

export const leaderboardValidator = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  query('timeframe')
    .optional()
    .isIn(['all', 'month', 'week', 'day'])
    .withMessage('Invalid timeframe. Must be: all, month, week, or day'),
];

// ================== Common Validators ==================

export const userIdParamValidator = [
  param('userId').notEmpty().withMessage('User ID is required'),
];

export const idParamValidator = [
  param('id').notEmpty().withMessage('ID is required'),
];
