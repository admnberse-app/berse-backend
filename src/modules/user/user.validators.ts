import { body, query } from 'express-validator';

export const updateProfileValidators = [
  // Core Info
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name must be 2-100 characters, letters only'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 2-30 characters, alphanumeric with underscores and hyphens'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  
  // Profile Info
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be 2-50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),
  body('fullBio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),
  body('shortBio')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Short bio must not exceed 160 characters'),
  
  // Demographics
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be male, female, other, or prefer_not_to_say'),
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  
  // Professional
  body('profession')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Profession must not exceed 100 characters'),
  body('occupation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occupation must not exceed 100 characters'),
  body('website')
    .optional()
    .trim()
    .isURL({ require_protocol: true })
    .withMessage('Website must be a valid URL with http:// or https://'),
  
  // Personal
  body('personalityType')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Personality type must not exceed 50 characters'),
  body('interests')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 interests allowed'),
  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be 1-50 characters'),
  body('topInterests')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 interests allowed'),
  body('topInterests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be 1-50 characters'),
  body('languages')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 languages allowed'),
  body('languages.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each language must be 2-50 characters'),
  
  // Location
  body('currentCity')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Current city must be 2-100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be 2-100 characters'),
  body('currentLocation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Current location must be 2-100 characters'),
  body('countryOfResidence')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country of residence must be 2-100 characters'),
  body('nationality')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nationality must be 2-100 characters'),
  body('originallyFrom')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Originally from must be 2-100 characters'),
  
  // Social Handles
  body('instagramHandle')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9._]+$/)
    .isLength({ min: 1, max: 30 })
    .withMessage('Instagram handle must be 1-30 characters, alphanumeric with dots and underscores'),
  body('instagram')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9._]+$/)
    .isLength({ min: 1, max: 30 })
    .withMessage('Instagram handle must be 1-30 characters, alphanumeric with dots and underscores'),
  body('linkedinHandle')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9-]+$/)
    .isLength({ min: 3, max: 100 })
    .withMessage('LinkedIn handle must be 3-100 characters, alphanumeric with hyphens'),
  body('linkedin')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9-]+$/)
    .isLength({ min: 3, max: 100 })
    .withMessage('LinkedIn handle must be 3-100 characters, alphanumeric with hyphens'),
  
  // Travel
  body('travelStyle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Travel style must not exceed 100 characters'),
  body('bucketList')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Maximum 50 bucket list items allowed'),
  body('bucketList.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each bucket list item must be 1-100 characters'),
  body('travelBio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Travel bio must not exceed 500 characters'),
  body('travelHistory')
    .optional()
    .isArray({ max: 100 })
    .withMessage('Maximum 100 travel history items allowed'),
  
  // Community
  body('servicesOffered')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 services allowed'),
  body('communityRole')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Community role must not exceed 100 characters'),
];

export const searchUsersValidators = [
  query('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be 2-100 characters'),
  query('interest')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Interest must be 1-50 characters'),
  query('query')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be 1-100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage('Limit must be between 1 and 100'),
];
