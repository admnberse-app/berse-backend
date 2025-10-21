import { Router } from 'express';
import profileMetadataController from './profile-metadata.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profile Metadata
 *   description: |
 *     Profile field options and metadata endpoints for user profile completion.
 *     
 *     Features:
 *     - Interests - 70+ categorized interests with emojis
 *     - Languages - 27 supported languages with native names
 *     - Professions - 50+ career categories
 *     - Travel Styles - 14 travel preference types
 *     - Personality Types - 16 MBTI types with descriptions
 *     - Privacy Options - Visibility and location sharing settings
 *     - Username Validation - Real-time validation with smart suggestions
 *     
 *     All endpoints return structured data optimized for mobile app integration.
 */

/**
 * @swagger
 * /v2/metadata/profile:
 *   get:
 *     summary: Get all profile metadata (Recommended)
 *     description: |
 *       Returns comprehensive lists of all profile field options in a single optimized call.
 *       
 *       **Use this endpoint to:**
 *       - Minimize API calls during app initialization
 *       - Cache all metadata for offline use
 *       - Populate profile forms and dropdowns
 *       
 *       **Includes:**
 *       - Interests (70+ items)
 *       - Languages (27 items)
 *       - Professions (50+ items)
 *       - Travel styles (14 items)
 *       - Personality types (16 items)
 *       - Age ranges (7 items)
 *       - Gender options (6 items)
 *       - Visibility options (3 items)
 *       - Location privacy options (3 items)
 *     tags: [Profile Metadata]
 *     responses:
 *       200:
 *         description: All profile metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile metadata retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     interests:
 *                       type: object
 *                       properties:
 *                         category:
 *                           type: string
 *                           example: "Interests"
 *                         description:
 *                           type: string
 *                           example: "User interests and hobbies"
 *                         items:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               value:
 *                                 type: string
 *                                 example: "fitness"
 *                               label:
 *                                 type: string
 *                                 example: "Fitness"
 *                               category:
 *                                 type: string
 *                                 example: "Sports & Fitness"
 *                               emoji:
 *                                 type: string
 *                                 example: "💪"
 *                     languages:
 *                       type: object
 *                       description: "Supported languages with native names and codes"
 *                     professions:
 *                       type: object
 *                       description: "Career categories and job titles"
 *                     travelStyles:
 *                       type: object
 *                       description: "Travel preference categories"
 *                     personalityTypes:
 *                       type: object
 *                       description: "MBTI personality types"
 *                     ageRanges:
 *                       type: object
 *                       description: "Age group categories"
 *                     genders:
 *                       type: object
 *                       description: "Gender identity options"
 *                     visibilityOptions:
 *                       type: object
 *                       description: "Profile visibility settings"
 *                     locationPrivacyOptions:
 *                       type: object
 *                       description: "Location sharing preferences"
 */
router.get('/', profileMetadataController.getAllProfileMetadata);

/**
 * @swagger
 * /v2/metadata/profile/interests:
 *   get:
 *     summary: Get interests list
 *     description: Returns curated list of 70+ user interests/hobbies organized by category (Sports & Fitness, Arts & Culture, Technology, etc.)
 *     tags: [Profile Metadata]
 *     responses:
 *       200:
 *         description: Interests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Interests retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                       example: "Interests"
 *                     description:
 *                       type: string
 *                       example: "User interests and hobbies"
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "fitness"
 *                           label:
 *                             type: string
 *                             example: "Fitness"
 *                           category:
 *                             type: string
 *                             example: "Sports & Fitness"
 *                           emoji:
 *                             type: string
 *                             example: "💪"
 */
router.get('/interests', profileMetadataController.getInterests);

/**
 * @swagger
 * /v2/metadata/profile/languages:
 *   get:
 *     summary: Get languages list
 *     description: Returns list of 27 supported languages with native names, codes, and flag emojis
 *     tags: [Profile Metadata]
 *     responses:
 *       200:
 *         description: Languages retrieved successfully
 */
router.get('/languages', profileMetadataController.getLanguages);

/**
 * @swagger
 * /v2/metadata/profile/professions:
 *   get:
 *     summary: Get professions list
 *     description: Returns curated list of 50+ professions/occupations organized by category (Technology, Business, Creative, etc.)
 *     tags: [Profile Metadata]
 *     responses:
 *       200:
 *         description: Professions retrieved successfully
 */
router.get('/professions', profileMetadataController.getProfessions);

/**
 * @swagger
 * /v2/metadata/profile/genders:
 *   get:
 *     summary: Get genders list
 *     description: Returns list of gender options for profile completion
 *     tags: [Profile Metadata]
 *     responses:
 *       200:
 *         description: Genders retrieved successfully
 */
router.get('/genders', profileMetadataController.getGenders);

/**
 * @swagger
 * /v2/metadata/profile/travel-styles:
 *   get:
 *     summary: Get travel styles list
 *     description: Returns list of 14 travel style preferences (Backpacker, Luxury Traveler, Cultural Explorer, etc.)
 *     tags: [Profile Metadata]
 *     responses:
 *       200:
 *         description: Travel styles retrieved successfully
 */
router.get('/travel-styles', profileMetadataController.getTravelStyles);

/**
 * @swagger
 * /v2/metadata/profile/personality-types:
 *   get:
 *     summary: Get personality types list
 *     description: Returns list of 16 MBTI personality types organized by category (Analysts, Diplomats, Sentinels, Explorers)
 *     tags: [Profile Metadata]
 *     responses:
 *       200:
 *         description: Personality types retrieved successfully
 */
router.get('/personality-types', profileMetadataController.getPersonalityTypes);

/**
 * @swagger
 * /v2/metadata/profile/age-ranges:
 *   get:
 *     summary: Get age ranges list
 *     description: Returns list of age range options for profile filtering and matching (18-24, 25-34, etc.)
 *     tags: [Profile Metadata]
 *     responses:
 *       200:
 *         description: Age ranges retrieved successfully
 */
router.get('/age-ranges', profileMetadataController.getAgeRanges);

/**
 * @swagger
 * /v2/metadata/profile/visibility-options:
 *   get:
 *     summary: Get profile visibility options
 *     description: Returns list of privacy settings for profile visibility (public, friends, private)
 *     tags: [Profile Metadata]
 *     responses:
 *       200:
 *         description: Profile visibility options retrieved successfully
 */
router.get('/visibility-options', profileMetadataController.getProfileVisibilityOptions);

/**
 * @swagger
 * /v2/metadata/profile/location-privacy-options:
 *   get:
 *     summary: Get location privacy options
 *     description: Returns list of privacy settings for location sharing (public, friends, private)
 *     tags: [Profile Metadata]
 *     responses:
 *       200:
 *         description: Location privacy options retrieved successfully
 */
router.get('/location-privacy-options', profileMetadataController.getLocationPrivacyOptions);

/**
 * @swagger
 * /v2/metadata/profile/validate-username:
 *   post:
 *     summary: Validate username availability
 *     description: |
 *       Validates username format and checks database availability with user-friendly responses.
 *       
 *       Validation Rules - Length 3-30 characters, Letters numbers underscores and dashes only, Reserved words blocked, Database availability check
 *       
 *       Response Features - User-friendly messages for mobile apps, Smart suggestions when username is unavailable, Context-specific error messages
 *     tags: [Profile Metadata]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username to validate
 *                 example: "john_doe123"
 *     responses:
 *       200:
 *         description: Username validation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "\"john_doe123\" is available and ready to use!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                       example: true
 *                     isAvailable:
 *                       type: boolean
 *                       example: true
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["john_doe123", "john_doe2024", "john_doe_official"]
 *                     message:
 *                       type: string
 *                       description: Technical message for developers
 *                       example: "Great! This username is available"
 *                     userFriendlyMessage:
 *                       type: string
 *                       description: User-friendly message for mobile UI display
 *                       example: "\"john_doe123\" is available and ready to use!"
 *             examples:
 *               available:
 *                 summary: "✅ Username Available"
 *                 value:
 *                   success: true
 *                   message: "\"testuser123\" is available and ready to use!"
 *                   data:
 *                     isValid: true
 *                     isAvailable: true
 *                     errors: []
 *                     suggestions: []
 *                     message: "Great! This username is available"
 *                     userFriendlyMessage: "\"testuser123\" is available and ready to use!"
 *               taken:
 *                 summary: "❌ Username Taken"
 *                 value:
 *                   success: true
 *                   message: "\"davidtech\" is already taken. Try one of these suggestions instead."
 *                   data:
 *                     isValid: true
 *                     isAvailable: false
 *                     errors: []
 *                     suggestions: ["davidtech123", "davidtech2024", "davidtech99", "davidtech007", "davidtech_official"]
 *                     message: "This username is already taken"
 *                     userFriendlyMessage: "\"davidtech\" is already taken. Try one of these suggestions instead."
 *               invalid_short:
 *                 summary: "⚠️ Too Short"
 *                 value:
 *                   success: true
 *                   message: "Username must be at least 3 characters long."
 *                   data:
 *                     isValid: false
 *                     isAvailable: false
 *                     errors: ["Username must be at least 3 characters long"]
 *                     suggestions: ["user123", "user2024", "user_official"]
 *                     message: "Please fix the issues below and try again"
 *                     userFriendlyMessage: "Username must be at least 3 characters long."
 *               invalid_format:
 *                 summary: "⚠️ Invalid Characters"
 *                 value:
 *                   success: true
 *                   message: "Username can only contain letters, numbers, underscores, and dashes."
 *                   data:
 *                     isValid: false
 *                     isAvailable: false
 *                     errors: ["Username can only contain letters, numbers, underscores, and dashes"]
 *                     suggestions: ["user_name", "username123", "user-name"]
 *                     message: "Please fix the issues below and try again"
 *                     userFriendlyMessage: "Username can only contain letters, numbers, underscores, and dashes."
 *               reserved:
 *                 summary: "🔒 Reserved Username"
 *                 value:
 *                   success: true
 *                   message: "This username is reserved and cannot be used."
 *                   data:
 *                     isValid: false
 *                     isAvailable: false
 *                     errors: ["This username is reserved and cannot be used"]
 *                     suggestions: ["admin123", "admin2024", "admin_user"]
 *                     message: "Please fix the issues below and try again"
 *                     userFriendlyMessage: "This username is reserved and cannot be used."
 *       400:
 *         description: Bad request - missing or invalid username
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Please enter a username"
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                       example: false
 *                     isAvailable:
 *                       type: boolean
 *                       example: false
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Username is required"]
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     message:
 *                       type: string
 *                       example: "Username is required"
 *                     userFriendlyMessage:
 *                       type: string
 *                       example: "Please enter a username to check availability."
 */
router.post('/validate-username', profileMetadataController.validateUsername);

export default router;
