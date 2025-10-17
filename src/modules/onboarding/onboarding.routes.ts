import { Router } from 'express';
import { OnboardingController } from './onboarding.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

/**
 * @swagger
 * /v2/onboarding/screens:
 *   get:
 *     summary: Get onboarding screens
 *     description: Get all active onboarding screens in order for display in the app onboarding flow
 *     tags: [Onboarding]
 *     responses:
 *       200:
 *         description: Onboarding screens retrieved successfully
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
 *                             example: "2c5ca712-ec9b-49e9-a71f-a9e8c8b34a5c"
 *                           screenOrder:
 *                             type: integer
 *                             example: 1
 *                             description: Display order of the screen
 *                           title:
 *                             type: string
 *                             example: "Welcome to Berse"
 *                           subtitle:
 *                             type: string
 *                             example: "Connect with verified, trusted people"
 *                             nullable: true
 *                           description:
 *                             type: string
 *                             nullable: true
 *                           imageUrl:
 *                             type: string
 *                             format: uri
 *                             example: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
 *                             nullable: true
 *                           videoUrl:
 *                             type: string
 *                             format: uri
 *                             nullable: true
 *                           ctaText:
 *                             type: string
 *                             example: "Next"
 *                             nullable: true
 *                           ctaAction:
 *                             type: string
 *                             nullable: true
 *                           ctaUrl:
 *                             type: string
 *                             format: uri
 *                             nullable: true
 *                           backgroundColor:
 *                             type: string
 *                             example: "#FFFFFF"
 *                             nullable: true
 *                           isSkippable:
 *                             type: boolean
 *                             example: true
 *                           targetAudience:
 *                             type: string
 *                             example: "all"
 *                             description: Target audience for this screen
 *                           metadata:
 *                             type: object
 *                             nullable: true
 *                 message:
 *                   type: string
 *                   example: "Onboarding screens retrieved successfully"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 */
router.get('/screens', OnboardingController.getOnboardingScreens);

/**
 * @swagger
 * /v2/onboarding/track:
 *   post:
 *     summary: Track onboarding action
 *     description: Track user interactions with onboarding screens for analytics. Actions include view, skip, complete, and cta_click. No authentication required to support guest user tracking.
 *     tags: [Onboarding]
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
 *                 description: ID of the onboarding screen
 *                 example: "2c5ca712-ec9b-49e9-a71f-a9e8c8b34a5c"
 *               action:
 *                 type: string
 *                 enum: [view, skip, complete, cta_click]
 *                 description: Action performed by user
 *                 example: "view"
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional user ID (for authenticated users or guest tracking)
 *                 nullable: true
 *                 example: "user-uuid-here"
 *           examples:
 *             viewAction:
 *               summary: Track screen view
 *               value:
 *                 screenId: "2c5ca712-ec9b-49e9-a71f-a9e8c8b34a5c"
 *                 action: "view"
 *             skipAction:
 *               summary: Track skip action
 *               value:
 *                 screenId: "2c5ca712-ec9b-49e9-a71f-a9e8c8b34a5c"
 *                 action: "skip"
 *                 userId: "user-123"
 *             completeAction:
 *               summary: Track completion
 *               value:
 *                 screenId: "2c5ca712-ec9b-49e9-a71f-a9e8c8b34a5c"
 *                 action: "complete"
 *             ctaClickAction:
 *               summary: Track CTA click
 *               value:
 *                 screenId: "2c5ca712-ec9b-49e9-a71f-a9e8c8b34a5c"
 *                 action: "cta_click"
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Onboarding action tracked successfully"
 *       400:
 *         description: Bad request - Missing screenId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Screen ID is required"
 *       404:
 *         description: Onboarding screen not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Onboarding screen not found"
 *       500:
 *         description: Server error
 */
router.post('/track', OnboardingController.trackOnboardingView);

/**
 * @swagger
 * /v2/onboarding/complete:
 *   post:
 *     summary: Mark onboarding as completed
 *     description: Mark the entire onboarding flow as completed for the authenticated user. This will create completion records for all onboarding screens.
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
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
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Onboarding completed successfully"
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "User not authenticated"
 *       500:
 *         description: Server error
 */
router.post('/complete', authenticateToken, OnboardingController.completeOnboarding);

/**
 * @swagger
 * /v2/onboarding/status:
 *   get:
 *     summary: Get onboarding completion status
 *     description: Get the current user's onboarding progress and completion status
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status retrieved successfully
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
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     isCompleted:
 *                       type: boolean
 *                       example: false
 *                     totalScreens:
 *                       type: integer
 *                       example: 5
 *                     viewedCount:
 *                       type: integer
 *                       example: 3
 *                     completedCount:
 *                       type: integer
 *                       example: 2
 *                     skippedCount:
 *                       type: integer
 *                       example: 0
 *                     progress:
 *                       type: number
 *                       format: float
 *                       example: 40.0
 *                       description: Completion percentage
 *                     screens:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           screenId:
 *                             type: string
 *                             format: uuid
 *                           screenOrder:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           viewed:
 *                             type: boolean
 *                           viewedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           completed:
 *                             type: boolean
 *                           completedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           skipped:
 *                             type: boolean
 *                           skippedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                 message:
 *                   type: string
 *                   example: "Onboarding status retrieved successfully"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/status', authenticateToken, OnboardingController.getOnboardingStatus);

/**
 * @swagger
 * /v2/onboarding/analytics:
 *   get:
 *     summary: Get onboarding analytics (Admin)
 *     description: Get comprehensive analytics about onboarding screen performance and user completion rates. Admin only endpoint.
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter analytics from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter analytics until this date
 *       - in: query
 *         name: screenId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter analytics for specific screen
 *     responses:
 *       200:
 *         description: Onboarding analytics retrieved successfully
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
 *                     overallStats:
 *                       type: object
 *                       properties:
 *                         uniqueUsers:
 *                           type: integer
 *                           example: 1250
 *                         totalScreens:
 *                           type: integer
 *                           example: 5
 *                         usersWhoCompleted:
 *                           type: integer
 *                           example: 980
 *                         overallCompletionRate:
 *                           type: number
 *                           format: float
 *                           example: 78.4
 *                     screenStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           screenId:
 *                             type: string
 *                             format: uuid
 *                           screenTitle:
 *                             type: string
 *                             example: "Welcome to Berse"
 *                           screenOrder:
 *                             type: integer
 *                             example: 1
 *                           totalInteractions:
 *                             type: integer
 *                             example: 1500
 *                           viewedCount:
 *                             type: integer
 *                             example: 1480
 *                           completedCount:
 *                             type: integer
 *                             example: 1200
 *                           skippedCount:
 *                             type: integer
 *                             example: 150
 *                           completionRate:
 *                             type: number
 *                             format: float
 *                             example: 81.08
 *                           skipRate:
 *                             type: number
 *                             format: float
 *                             example: 10.14
 *                           avgTimeSpentSeconds:
 *                             type: number
 *                             format: float
 *                             example: 12.5
 *                 message:
 *                   type: string
 *                   example: "Onboarding analytics retrieved successfully"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/analytics', authenticateToken, OnboardingController.getOnboardingAnalytics);

export default router;
