import { body, param, query } from 'express-validator';
import { VouchType, VouchStatus } from '@prisma/client';

export const requestVouchValidators = [
  body('voucherId')
    .trim()
    .notEmpty().withMessage('Voucher ID is required')
    .isString().withMessage('Voucher ID must be a string'),
  
  body('vouchType')
    .notEmpty().withMessage('Vouch type is required')
    .isIn(Object.values(VouchType)).withMessage('Invalid vouch type'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
];

export const respondToVouchRequestValidators = [
  param('vouchId')
    .trim()
    .notEmpty().withMessage('Vouch ID is required')
    .isString().withMessage('Vouch ID must be a string'),
  
  body('action')
    .trim()
    .notEmpty().withMessage('Action is required')
    .isIn(['approve', 'decline', 'downgrade']).withMessage('Action must be approve, decline, or downgrade'),
  
  body('downgradeTo')
    .if(body('action').equals('downgrade'))
    .notEmpty().withMessage('downgradeTo is required when downgrading')
    .isIn(Object.values(VouchType)).withMessage('Invalid vouch type for downgrade'),
];

export const revokeVouchValidators = [
  param('vouchId')
    .trim()
    .notEmpty().withMessage('Vouch ID is required')
    .isString().withMessage('Vouch ID must be a string'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
];

export const communityVouchValidators = [
  body('userId')
    .trim()
    .notEmpty().withMessage('User ID is required')
    .isString().withMessage('User ID must be a string'),
  
  body('communityId')
    .trim()
    .notEmpty().withMessage('Community ID is required')
    .isString().withMessage('Community ID must be a string'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
];

export const vouchQueryValidators = [
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
    .isIn(Object.values(VouchStatus))
    .withMessage('Invalid vouch status'),
  
  query('vouchType')
    .optional()
    .isIn(Object.values(VouchType))
    .withMessage('Invalid vouch type'),
  
  query('isCommunityVouch')
    .optional()
    .isBoolean().withMessage('isCommunityVouch must be a boolean')
    .toBoolean(),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'approvedAt', 'trustImpact'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];
