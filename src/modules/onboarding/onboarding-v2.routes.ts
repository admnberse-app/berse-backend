import { Router } from 'express';
import { OnboardingV2Controller } from './onboarding-v2.controller';
import { OnboardingV2Validators } from './onboarding-v2.validators';
import { authenticateToken } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';

const router = Router();

// ============================================================================
// APP PREVIEW ROUTES (Pre-Authentication - No Auth Required)
// ============================================================================

/**
 * @swagger
 * /v2/onboarding/app-preview/screens:
 *   get:
 *     summary: Get app preview screens (pre-auth)
 *     description: Get brief introduction screens shown before login/registration (3-4 screens). No authentication required.
 *     tags: [Onboarding V2]
 *     responses:
 *       200:
 *         description: App preview screens retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     screens:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           screenOrder:
 *                             type: integer
 *                           title:
 *                             type: string
 *                             example: "Welcome to Berse"
 *                           subtitle:
 *                             type: string
 *                             example: "Connect with verified people"
 *                           description:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 *                             format: uri
 *                           videoUrl:
 *                             type: string
 *                             format: uri
 *                           animationUrl:
 *                             type: string
 *                             format: uri
 *                           iconName:
 *                             type: string
 *                           ctaText:
 *                             type: string
 *                             example: "Next"
 *                           ctaAction:
 *                             type: string
 *                             example: "next"
 *                           backgroundColor:
 *                             type: string
 *                             example: "#FFFFFF"
 *                           textColor:
 *                             type: string
 *                             example: "#000000"
 *                           isSkippable:
 *                             type: boolean
 *                           metadata:
 *                             type: object
 */
router.get('/app-preview/screens', OnboardingV2Controller.getAppPreviewScreens);

/**
 * @swagger
 * /v2/onboarding/app-preview/track:
 *   post:
 *     summary: Track app preview action (pre-auth)
 *     description: Track anonymous user interactions with app preview screens. Session ID used for anonymous tracking.
 *     tags: [Onboarding V2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - screenId
 *               - action
 *             properties:
 *               screenId:
 *                 type: string
 *                 format: uuid
 *               action:
 *                 type: string
 *                 enum: [view, complete, skip]
 *               sessionId:
 *                 type: string
 *                 description: Optional session identifier for anonymous tracking
 *               timeSpentSeconds:
 *                 type: integer
 *               deviceInfo:
 *                 type: object
 *               appVersion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Action tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       description: Session ID for tracking
 */
router.post(
  '/app-preview/track',
  OnboardingV2Validators.trackAppPreviewAction,
  handleValidationErrors,
  OnboardingV2Controller.trackAppPreviewAction
);

/**
 * @swagger
 * /v2/onboarding/app-preview/link-user:
 *   post:
 *     summary: Link anonymous app preview analytics to user
 *     description: After registration/login, link anonymous session data to the authenticated user account
 *     tags: [Onboarding V2]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: The session ID from pre-auth tracking
 *     responses:
 *       200:
 *         description: Analytics linked successfully
 */
router.post(
  '/app-preview/link-user',
  authenticateToken,
  OnboardingV2Validators.linkAppPreviewToUser,
  handleValidationErrors,
  OnboardingV2Controller.linkAppPreviewToUser
);

/**
 * @swagger
 * /v2/onboarding/app-preview/analytics:
 *   get:
 *     summary: Get app preview analytics (admin)
 *     description: Get analytics for app preview screens including conversion rates
 *     tags: [Onboarding V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: screenId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get(
  '/app-preview/analytics',
  authenticateToken,
  OnboardingV2Validators.getAppPreviewAnalytics,
  handleValidationErrors,
  OnboardingV2Controller.getAppPreviewAnalytics
);

// ============================================================================
// USER SETUP ROUTES (Post-Authentication - Auth Required)
// ============================================================================

/**
 * @swagger
 * /v2/onboarding/user-setup/screens:
 *   get:
 *     summary: Get user setup screens (post-auth)
 *     description: Get personalized onboarding screens after registration/verification. Includes completion status for each screen.
 *     tags: [Onboarding V2]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User setup screens retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     screens:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           screenOrder:
 *                             type: integer
 *                           screenType:
 *                             type: string
 *                             enum: [PROFILE, NETWORK, COMMUNITY, PREFERENCES, TUTORIAL, VERIFICATION]
 *                           title:
 *                             type: string
 *                           isRequired:
 *                             type: boolean
 *                           isSkippable:
 *                             type: boolean
 *                           status:
 *                             type: object
 *                             properties:
 *                               viewed:
 *                                 type: boolean
 *                               completed:
 *                                 type: boolean
 *                               skipped:
 *                                 type: boolean
 */
router.get(
  '/user-setup/screens',
  authenticateToken,
  OnboardingV2Controller.getUserSetupScreens
);

/**
 * @swagger
 * /v2/onboarding/user-setup/track:
 *   post:
 *     summary: Track user setup action (post-auth)
 *     description: Track authenticated user's interactions with personalized setup screens
 *     tags: [Onboarding V2]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - screenId
 *               - action
 *             properties:
 *               screenId:
 *                 type: string
 *                 format: uuid
 *               action:
 *                 type: string
 *                 enum: [view, complete, skip]
 *               timeSpentSeconds:
 *                 type: integer
 *               actionsTaken:
 *                 type: object
 *                 description: JSON object describing specific actions taken
 *               deviceInfo:
 *                 type: object
 *               appVersion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Action tracked successfully
 */
router.post(
  '/user-setup/track',
  authenticateToken,
  OnboardingV2Validators.trackUserSetupAction,
  handleValidationErrors,
  OnboardingV2Controller.trackUserSetupAction
);

/**
 * @swagger
 * /v2/onboarding/user-setup/status:
 *   get:
 *     summary: Get user setup completion status
 *     description: Get the authenticated user's progress through personalized setup
 *     tags: [Onboarding V2]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     isCompleted:
 *                       type: boolean
 *                     totalScreens:
 *                       type: integer
 *                     requiredScreens:
 *                       type: integer
 *                     completedCount:
 *                       type: integer
 *                     requiredCompletedCount:
 *                       type: integer
 *                     progress:
 *                       type: number
 *                       description: Overall progress percentage
 *                     requiredProgress:
 *                       type: number
 *                       description: Required screens progress percentage
 */
router.get(
  '/user-setup/status',
  authenticateToken,
  OnboardingV2Controller.getUserSetupStatus
);

/**
 * @swagger
 * /v2/onboarding/user-setup/complete:
 *   post:
 *     summary: Mark user setup as completed
 *     description: Mark all setup screens as completed (requires all required screens to be done first)
 *     tags: [Onboarding V2]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User setup completed successfully
 *       400:
 *         description: Not all required screens completed
 */
router.post(
  '/user-setup/complete',
  authenticateToken,
  OnboardingV2Controller.completeUserSetup
);

/**
 * @swagger
 * /v2/onboarding/user-setup/analytics:
 *   get:
 *     summary: Get user setup analytics (admin)
 *     description: Get analytics for user setup screens including completion rates by screen type
 *     tags: [Onboarding V2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: screenId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: screenType
 *         schema:
 *           type: string
 *           enum: [PROFILE, NETWORK, COMMUNITY, PREFERENCES, TUTORIAL, VERIFICATION]
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get(
  '/user-setup/analytics',
  authenticateToken,
  OnboardingV2Validators.getUserSetupAnalytics,
  handleValidationErrors,
  OnboardingV2Controller.getUserSetupAnalytics
);

export default router;
