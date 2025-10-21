import { Router } from 'express';
import profileMetadataController from './profile-metadata.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profile Metadata
 *   description: Profile field options and metadata (interests, languages, professions, etc.)
 */

/**
 * @swagger
 * /v2/metadata/profile:
 *   get:
 *     summary: Get all profile metadata
 *     description: Returns comprehensive lists of all profile field options in one call
 *     tags: [Profile Metadata]
 *     responses:
 *       200:
 *         description: All profile metadata retrieved successfully
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
 *     description: Validates username format and checks availability for uniqueness. Returns validation result with suggestions if invalid.
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
 *                   example: "Username validation completed"
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
 */
router.post('/validate-username', profileMetadataController.validateUsername);

export default router;
