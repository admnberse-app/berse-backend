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
    .trim()
    .isLength({ min: 6, max: 15 })
    .matches(/^[0-9]+$/)
    .withMessage('Phone must be 6-15 digits without country code'),
  body('dialCode')
    .optional()
    .trim()
    .matches(/^\+[0-9]{1,4}$/)
    .withMessage('Dial code must start with + and be 1-4 digits (e.g., +60, +1)'),
  
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
    .isIn(['male', 'female'])
    .withMessage('Gender must be either male or female'),
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
    .isLength({ min: 3, max: 200 })
    .withMessage('Website must be 3-200 characters'),
  
  // Personal
  body('personalityType')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Personality type must not exceed 50 characters'),
  body('interests')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (!Array.isArray(value)) {
        throw new Error('Interests must be an array');
      }
      if (value.length > 20) {
        throw new Error('Maximum 20 interests allowed');
      }
      return true;
    }),
  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be 1-50 characters'),
  body('topInterests')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (!Array.isArray(value)) {
        throw new Error('Top interests must be an array');
      }
      if (value.length > 20) {
        throw new Error('Maximum 20 interests allowed');
      }
      return true;
    }),
  body('topInterests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be 1-50 characters'),
  body('languages')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (!Array.isArray(value)) {
        throw new Error('Languages must be an array');
      }
      if (value.length > 10) {
        throw new Error('Maximum 10 languages allowed');
      }
      return true;
    }),
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
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (!Array.isArray(value)) {
        throw new Error('Bucket list must be an array');
      }
      if (value.length > 50) {
        throw new Error('Maximum 50 bucket list items allowed');
      }
      return true;
    }),
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
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (!Array.isArray(value)) {
        throw new Error('Travel history must be an array');
      }
      if (value.length > 100) {
        throw new Error('Maximum 100 travel history items allowed');
      }
      return true;
    }),
  
  // Community
  body('servicesOffered')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (!Array.isArray(value)) {
        throw new Error('Services offered must be an array');
      }
      if (value.length > 20) {
        throw new Error('Maximum 20 services allowed');
      }
      return true;
    }),
  body('communityRole')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Community role must not exceed 100 characters'),
];

export const searchUsersValidators = [
  // Text search
  query('query')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be 1-100 characters'),
  
  // Location filters
  query('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be 2-100 characters'),
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .toFloat()
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .toFloat()
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 500 })
    .toInt()
    .withMessage('Radius must be between 1 and 500 km'),
  query('nearby')
    .optional()
    .isBoolean()
    .toBoolean()
    .withMessage('Nearby must be a boolean'),
  
  // Connection filters
  query('connectionType')
    .optional()
    .isIn(['all', 'mutuals', 'suggestions', 'new'])
    .withMessage('Connection type must be: all, mutuals, suggestions, or new'),
  query('hasMutualFriends')
    .optional()
    .isBoolean()
    .toBoolean()
    .withMessage('Has mutual friends must be a boolean'),
  query('mutualFriendsMin')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage('Mutual friends min must be 1-100'),
  
  // Trust filters
  query('minTrustScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .toInt()
    .withMessage('Min trust score must be 0-100'),
  query('maxTrustScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .toInt()
    .withMessage('Max trust score must be 0-100'),
  query('trustLevel')
    .optional()
    .isIn(['starter', 'trusted', 'leader'])
    .withMessage('Trust level must be: starter, trusted, or leader'),
  
  // Activity filters
  query('minEventsAttended')
    .optional()
    .isInt({ min: 0 })
    .toInt()
    .withMessage('Min events attended must be >= 0'),
  query('hasHostedEvents')
    .optional()
    .isBoolean()
    .toBoolean()
    .withMessage('Has hosted events must be a boolean'),
  query('isVerified')
    .optional()
    .isBoolean()
    .toBoolean()
    .withMessage('Is verified must be a boolean'),
  
  // Other filters
  query('interest')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Interest must be 1-50 characters'),
  query('gender')
    .optional()
    .trim()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be: male, female, or other'),
  
  // Sorting
  query('sortBy')
    .optional()
    .isIn(['relevance', 'trustScore', 'distance', 'recentActivity', 'mutualFriends'])
    .withMessage('Sort by must be: relevance, trustScore, distance, recentActivity, or mutualFriends'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be: asc or desc'),
  
  // Exclusions
  query('excludeConnected')
    .optional()
    .isBoolean()
    .toBoolean()
    .withMessage('Exclude connected must be a boolean'),
  
  // Pagination
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
