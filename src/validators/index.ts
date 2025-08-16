import { body, param, query } from 'express-validator';

// Common validators
export const emailValidator = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Valid email is required');

export const passwordValidator = body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character');

export const phoneValidator = body('phoneNumber')
  .optional()
  .matches(/^\+?[1-9]\d{1,14}$/)
  .withMessage('Valid phone number is required');

export const uuidValidator = (field: string) => 
  param(field).isUUID().withMessage(`Valid ${field} is required`);

export const paginationValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

// Auth validators
export const loginValidators = [
  emailValidator,
  body('password').notEmpty().withMessage('Password is required'),
];

export const registerValidators = [
  emailValidator,
  passwordValidator,
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name must be 2-100 characters, letters only'),
  body('username')
    .trim()
    .isLength({ min: 2, max: 30 })
    .matches(/^[a-zA-Z0-9\s_-]+$/)
    .withMessage('Username must be 2-30 characters, alphanumeric with spaces, underscores and hyphens allowed'),
  body('nationality')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nationality must be 2-50 characters'),
  body('countryOfResidence')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country of residence must be 2-50 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be 2-50 characters'),
  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Gender must be either male or female'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  phoneValidator,
];

// User validators
export const updateProfileValidators = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .escape(),
  body('profession')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .escape(),
  body('interests')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 interests allowed'),
  body('interests.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape(),
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 }),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .escape(),
];

// Event validators
export const createEventValidators = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape()
    .withMessage('Title must be 3-200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .escape()
    .withMessage('Description must be 10-2000 characters'),
  body('type')
    .isIn(['General', 'Sports', 'Entertainment', 'Travel', 'Food', 'Education', 'Music', 'Art', 'Tech', 'Business', 'Other'])
    .withMessage('Invalid event type'),
  body('date')
    .isISO8601()
    .isAfter()
    .withMessage('Event date must be in the future'),
  body('time')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Valid time format required (HH:MM)'),
  body('location')
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape(),
  body('capacity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacity must be between 1 and 10000'),
  body('isPublic')
    .optional()
    .isBoolean(),
];

export const updateEventValidators = [
  ...createEventValidators.map(validator => validator.optional()),
];

// Points validators
export const manualPointsValidators = [
  body('userId').isUUID(),
  body('points')
    .isInt({ min: -1000, max: 1000 })
    .withMessage('Points must be between -1000 and 1000'),
  body('type')
    .isIn(['register', 'attendEvent', 'hostEvent', 'referral', 'joinTrip', 'cafeMeetup', 'ilmEvent', 'volunteer', 'donate', 'manual'])
    .withMessage('Invalid point type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .escape(),
];

// Rewards validators
export const createRewardValidators = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .escape(),
  body('pointsCost')
    .isInt({ min: 1, max: 100000 }),
  body('category')
    .isIn(['Food', 'Fashion', 'Tech', 'Travel', 'Entertainment', 'Other']),
  body('quantity')
    .optional()
    .isInt({ min: 0 }),
  body('expiresAt')
    .optional()
    .isISO8601()
    .isAfter(),
];

export const redeemRewardValidators = [
  body('rewardId').isUUID(),
];

// Notification validators
export const markNotificationReadValidators = [
  body('notificationIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('Provide 1-100 notification IDs'),
  body('notificationIds.*').isUUID(),
];

// Matching validators
export const updatePreferencesValidators = [
  body('ageRange')
    .optional()
    .isObject(),
  body('ageRange.min')
    .optional()
    .isInt({ min: 13, max: 120 }),
  body('ageRange.max')
    .optional()
    .isInt({ min: 13, max: 120 }),
  body('interests')
    .optional()
    .isArray({ max: 20 }),
  body('interests.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape(),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .escape(),
  body('maxDistance')
    .optional()
    .isInt({ min: 1, max: 1000 }),
];

// Sanitization helpers
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};