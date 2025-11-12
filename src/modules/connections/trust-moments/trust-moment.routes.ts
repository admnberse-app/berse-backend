import { Router } from 'express';
import { TrustMomentController } from './trust-moment.controller';
import { handleValidationErrors } from '../../../middleware/validation';
import { authenticateToken } from '../../../middleware/auth';
import {
  createTrustMomentValidators,
  updateTrustMomentValidators,
  deleteTrustMomentValidators,
  getTrustMomentValidators,
  trustMomentQueryValidators,
  userIdParamValidator,
  eventIdParamValidator,
} from './trust-moment.validators';

const router = Router();

// All routes require authentication
// router.use(authenticateToken);

/**
 * @swagger
 * /v2/connections/{connectionId}/trust-moments:
 *   post:
 *     summary: Create trust moment
 *     description: Leave feedback/rating after a shared experience with a connection (event, travel, collaboration, etc.)
 *     tags: [Connections - Trust Moments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - rating
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: User ID receiving the feedback
 *               eventId:
 *                 type: string
 *                 description: Optional event ID if feedback is event-related
 *               momentType:
 *                 type: string
 *                 enum: [event, travel, collaboration, service, general]
 *                 default: general
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 (poor) to 5 (excellent)
 *               feedback:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Detailed feedback text
 *               experienceDescription:
 *                 type: string
 *                 maxLength: 500
 *                 description: Brief description of the experience
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags to categorize the moment
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the feedback is publicly visible
 *     responses:
 *       201:
 *         description: Trust moment created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post(
  '/connections/:connectionId/trust-moments',
  authenticateToken,
  createTrustMomentValidators,
  handleValidationErrors,
  TrustMomentController.createTrustMoment
);

/**
 * @swagger
 * /v2/trust-moments/{momentId}:
 *   get:
 *     summary: Get trust moment details
 *     description: Retrieve a specific trust moment by ID
 *     tags: [Connections - Trust Moments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: momentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trust moment ID
 *     responses:
 *       200:
 *         description: Trust moment retrieved successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/trust-moments/:momentId',
  authenticateToken,
  getTrustMomentValidators,
  handleValidationErrors,
  TrustMomentController.getTrustMoment
);

/**
 * @swagger
 * /v2/trust-moments/{momentId}:
 *   patch:
 *     summary: Update trust moment
 *     description: Update a trust moment you created (only the giver can edit)
 *     tags: [Connections - Trust Moments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: momentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trust moment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               feedback:
 *                 type: string
 *                 maxLength: 1000
 *               experienceDescription:
 *                 type: string
 *                 maxLength: 500
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Trust moment updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  '/trust-moments/:momentId',
  authenticateToken,
  updateTrustMomentValidators,
  handleValidationErrors,
  TrustMomentController.updateTrustMoment
);

/**
 * @swagger
 * /v2/trust-moments/{momentId}:
 *   delete:
 *     summary: Delete trust moment
 *     description: Delete a trust moment you created (only the giver can delete)
 *     tags: [Connections - Trust Moments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: momentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trust moment ID
 *     responses:
 *       200:
 *         description: Trust moment deleted successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/trust-moments/:momentId',
  authenticateToken,
  deleteTrustMomentValidators,
  handleValidationErrors,
  TrustMomentController.deleteTrustMoment
);

/**
 * @swagger
 * /v2/users/{userId}/trust-moments/received:
 *   get:
 *     summary: Get trust moments received by user
 *     description: Get all feedback/ratings received by a user (paginated)
 *     tags: [Connections - Trust Moments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: momentType
 *         schema:
 *           type: string
 *           enum: [event, travel, collaboration, service, general]
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, rating, trustImpact]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Trust moments retrieved successfully
 */
router.get(
  '/users/:userId/trust-moments/received',
  authenticateToken,
  [...userIdParamValidator, ...trustMomentQueryValidators],
  handleValidationErrors,
  TrustMomentController.getTrustMomentsReceived
);

/**
 * @swagger
 * /v2/users/{userId}/trust-moments/given:
 *   get:
 *     summary: Get trust moments given by user
 *     description: Get all feedback/ratings given by a user (paginated)
 *     tags: [Connections - Trust Moments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: momentType
 *         schema:
 *           type: string
 *           enum: [event, travel, collaboration, service, general]
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, rating, trustImpact]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Trust moments retrieved successfully
 */
router.get(
  '/users/:userId/trust-moments/given',
  authenticateToken,
  [...userIdParamValidator, ...trustMomentQueryValidators],
  handleValidationErrors,
  TrustMomentController.getTrustMomentsGiven
);

/**
 * @swagger
 * /v2/events/{eventId}/trust-moments:
 *   get:
 *     summary: Get trust moments for event
 *     description: Get all public feedback/ratings related to a specific event (paginated)
 *     tags: [Connections - Trust Moments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, rating, trustImpact]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Trust moments retrieved successfully
 */
router.get(
  '/events/:eventId/trust-moments',
  authenticateToken,
  [...eventIdParamValidator, ...trustMomentQueryValidators],
  handleValidationErrors,
  TrustMomentController.getTrustMomentsForEvent
);

/**
 * @swagger
 * /v2/users/{userId}/trust-moments/stats:
 *   get:
 *     summary: Get trust moment statistics
 *     description: Get comprehensive statistics about trust moments for a user
 *     tags: [Connections - Trust Moments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
 *                     received:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         averageRating:
 *                           type: number
 *                         ratingDistribution:
 *                           type: object
 *                         byMomentType:
 *                           type: object
 *                         topTags:
 *                           type: array
 *                         positiveCount:
 *                           type: integer
 *                         neutralCount:
 *                           type: integer
 *                         negativeCount:
 *                           type: integer
 *                     given:
 *                       type: object
 *                     trustImpact:
 *                       type: object
 */
router.get(
  '/users/:userId/trust-moments/stats',
  authenticateToken,
  userIdParamValidator,
  handleValidationErrors,
  TrustMomentController.getTrustMomentStats
);

/**
 * @swagger
 * /v2/users/{userId}/trust-moments/can-create:
 *   get:
 *     summary: Check if logged-in user can create trust moment with target user
 *     description: Checks eligibility based on shared event participation and existing trust moments
 *     tags: [Connections - Trust Moments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Target user ID to check eligibility with
 *     responses:
 *       200:
 *         description: Eligibility check completed
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
 *                     canCreate:
 *                       type: boolean
 *                       description: Whether logged-in user can create trust moment with target user
 *                     reason:
 *                       type: string
 *                       enum: [eligible, no_shared_events, no_connection, all_events_have_trust_moments, cannot_create_for_self]
 *                       description: Reason for eligibility status
 *                     sharedEvents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           location:
 *                             type: string
 *                           hasTrustMoment:
 *                             type: boolean
 *                             description: Whether trust moment already exists for this event
 *                           hasConnection:
 *                             type: boolean
 *                             description: Whether users have accepted connection
 *                     eligibleEventsCount:
 *                       type: integer
 *                       description: Number of events eligible for creating trust moment
 *                     connectionId:
 *                       type: string
 *                       description: Connection ID if connection exists
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  '/users/:userId/trust-moments/can-create',
  authenticateToken,
  userIdParamValidator,
  handleValidationErrors,
  TrustMomentController.canCreateTrustMoment
);

export default router;
