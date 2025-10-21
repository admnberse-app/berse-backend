import { body, query, ValidationChain } from 'express-validator';

/**
 * Validators for Two-Phase Onboarding System
 */
export class OnboardingV2Validators {
  
  // ============================================================================
  // APP PREVIEW VALIDATORS (Pre-Auth)
  // ============================================================================

  static trackAppPreviewAction: ValidationChain[] = [
    body('screenId')
      .notEmpty()
      .withMessage('Screen ID is required')
      .isString()
      .withMessage('Screen ID must be a string')
      .isLength({ min: 20, max: 30 })
      .withMessage('Screen ID must be a valid CUID'),
    
    body('action')
      .notEmpty()
      .withMessage('Action is required')
      .isIn(['view', 'complete', 'skip'])
      .withMessage('Action must be one of: view, complete, skip'),
    
    body('sessionId')
      .optional()
      .isString()
      .withMessage('Session ID must be a string'),
    
    body('timeSpentSeconds')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Time spent must be a positive integer'),
    
    body('deviceInfo')
      .optional()
      .isObject()
      .withMessage('Device info must be an object'),
    
    body('appVersion')
      .optional()
      .isString()
      .withMessage('App version must be a string'),
  ];

  static linkAppPreviewToUser: ValidationChain[] = [
    body('sessionId')
      .notEmpty()
      .withMessage('Session ID is required')
      .isString()
      .withMessage('Session ID must be a string'),
  ];

  static getAppPreviewAnalytics: ValidationChain[] = [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    
    query('screenId')
      .optional()
      .isString()
      .withMessage('Screen ID must be a string')
      .isLength({ min: 20, max: 30 })
      .withMessage('Screen ID must be a valid CUID'),
  ];

  // ============================================================================
  // USER SETUP VALIDATORS (Post-Auth)
  // ============================================================================

  static trackUserSetupAction: ValidationChain[] = [
    body('screenId')
      .notEmpty()
      .withMessage('Screen ID is required')
      .isString()
      .withMessage('Screen ID must be a string')
      .isLength({ min: 20, max: 30 })
      .withMessage('Screen ID must be a valid CUID'),
    
    body('action')
      .notEmpty()
      .withMessage('Action is required')
      .isIn(['view', 'complete', 'skip'])
      .withMessage('Action must be one of: view, complete, skip'),
    
    body('timeSpentSeconds')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Time spent must be a positive integer'),
    
    body('actionsTaken')
      .optional()
      .isObject()
      .withMessage('Actions taken must be an object'),
    
    body('deviceInfo')
      .optional()
      .isObject()
      .withMessage('Device info must be an object'),
    
    body('appVersion')
      .optional()
      .isString()
      .withMessage('App version must be a string'),
  ];

  static getUserSetupAnalytics: ValidationChain[] = [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    
    query('screenId')
      .optional()
      .isString()
      .withMessage('Screen ID must be a string')
      .isLength({ min: 20, max: 30 })
      .withMessage('Screen ID must be a valid CUID'),
    
    query('screenType')
      .optional()
      .isIn(['PROFILE', 'NETWORK', 'COMMUNITY', 'PREFERENCES', 'TUTORIAL', 'VERIFICATION'])
      .withMessage('Screen type must be valid'),
  ];
}
