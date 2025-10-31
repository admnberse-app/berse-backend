import { body } from 'express-validator';

export const registerValidators = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  body('fullName')
    .trim()
    .isLength({ min: 5, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name must be 5-100 characters, letters only'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 2-30 characters, alphanumeric with underscores and hyphens'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 6, max: 15 })
    .matches(/^[0-9]+$/)
    .withMessage('Phone must be 6-15 digits without country code'),
  body('dialCode')
    .optional()
    .trim()
    .matches(/^\+[0-9]{1,4}$/)
    .withMessage('Dial code must start with + and be 1-4 digits (e.g., +60, +1)'),
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
    .trim()
    .customSanitizer((value) => value?.toLowerCase())
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be male, female, other, or prefer_not_to_say'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('referralCode')
    .optional()
    .trim()
    .isLength({ min: 7, max: 7 })
    .matches(/^[A-Z]{3}\d{4}$/)
    .withMessage('Referral code must be 7 characters (3 letters + 4 numbers, e.g., ABC1234)'),
];
export const loginValidators = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const changePasswordValidators = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from current password'),
];

export const forgotPasswordValidators = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
];
export const resetPasswordValidators = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
];

export const deactivateAccountValidators = [
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be 3-500 characters if provided'),
];

export const requestAccountDeletionValidators = [
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deletion'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be 3-500 characters if provided'),
];

export const reactivateAccountValidators = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];
