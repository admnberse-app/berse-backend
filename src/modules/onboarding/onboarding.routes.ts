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

export default router;
