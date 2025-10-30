import { Router } from 'express';
import { body, query } from 'express-validator';
import { matchingController } from './matching.controller';
import { authenticate } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';

const router = Router();

/**
 * @swagger
 * /v2/matching/discover:
 *   get:
 *     summary: Get discovery users
 *     description: Get a list of users to discover based on filters and matching algorithm. Uses weighted scoring (location 30%, interests 25%, communities 20%, trust 15%, verification 10%)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: User's current latitude
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: User's current longitude
 *       - in: query
 *         name: distance
 *         schema:
 *           type: integer
 *         description: Maximum distance in km (default 50)
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *         description: Minimum age filter
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *         description: Maximum age filter
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *         description: Gender filter (male, female, other)
 *       - in: query
 *         name: interests
 *         schema:
 *           type: string
 *         description: Comma-separated interests
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City filter
 *       - in: query
 *         name: onlyVerified
 *         schema:
 *           type: boolean
 *         description: Show only verified users
 *       - in: query
 *         name: minTrustScore
 *         schema:
 *           type: number
 *         description: Minimum trust score (0-100)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Number of users to return (useful for continuous loading - fetch 1-2 users after each swipe)
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Discovery session ID (for continuation and avoiding duplicates)
 *     responses:
 *       200:
 *         description: Discovery users retrieved successfully
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DiscoveryUser'
 *                     sessionId:
 *                       type: string
 *                     hasMore:
 *                       type: boolean
 *                     filters:
 *                       type: object
 */
router.get(
  '/discover',
  authenticate,
  [
    query('latitude').optional().isFloat(),
    query('longitude').optional().isFloat(),
    query('distance').optional().isInt({ min: 1, max: 500 }),
    query('minAge').optional().isInt({ min: 18, max: 100 }),
    query('maxAge').optional().isInt({ min: 18, max: 100 }),
    query('minTrustScore').optional().isFloat({ min: 0, max: 100 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  handleValidationErrors,
  matchingController.getDiscoveryUsers
);

/**
 * @swagger
 * /v2/matching/swipe:
 *   post:
 *     summary: Record swipe action
 *     description: Record a swipe action (SKIP or INTERESTED). After 3 SKIPs, user won't be shown again.
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - action
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: ID of the user being swiped on
 *               action:
 *                 type: string
 *                 enum: [SKIP, INTERESTED]
 *                 description: Swipe action
 *               sessionId:
 *                 type: string
 *                 description: Discovery session ID (optional)
 *     responses:
 *       200:
 *         description: Swipe recorded successfully
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
 *                     success:
 *                       type: boolean
 *                     action:
 *                       type: string
 *                     alreadySwiped:
 *                       type: boolean
 *                     message:
 *                       type: string
 */
router.post(
  '/swipe',
  authenticate,
  [
    body('targetUserId').isString().notEmpty(),
    body('action').isIn(['SKIP', 'INTERESTED']),
    body('sessionId').optional().isString(),
  ],
  handleValidationErrors,
  matchingController.recordSwipe
);

/**
 * @swagger
 * /v2/matching/connection-sent:
 *   post:
 *     summary: Mark connection request as sent
 *     description: Update swipe record after user sends connection request from interested swipe
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - connectionId
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: ID of the user connection was sent to
 *               connectionId:
 *                 type: string
 *                 description: ID of the created connection request
 *     responses:
 *       200:
 *         description: Connection status updated
 */
router.post(
  '/connection-sent',
  authenticate,
  [
    body('targetUserId').isString().notEmpty(),
    body('connectionId').isString().notEmpty(),
  ],
  handleValidationErrors,
  matchingController.markConnectionSent
);

/**
 * @swagger
 * /v2/matching/stats:
 *   get:
 *     summary: Get swipe statistics
 *     description: Get user's swipe statistics including total swipes, interested, skipped, and pending interests
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     totalSwipes:
 *                       type: integer
 *                     interested:
 *                       type: integer
 *                     skipped:
 *                       type: integer
 *                     connectionsSent:
 *                       type: integer
 *                     pendingInterests:
 *                       type: integer
 *                       description: INTERESTED swipes without connection request sent yet
 */
router.get(
  '/stats',
  authenticate,
  matchingController.getSwipeStats
);

export default router;
