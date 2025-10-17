import { Router } from 'express';
import { ConnectionController } from './connection.controller';
import { handleValidationErrors } from '../../../middleware/validation';
import { authenticateToken } from '../../../middleware/auth';
import {
  sendConnectionRequestValidators,
  respondToConnectionRequestValidators,
  connectionIdValidator,
  updateConnectionValidators,
  blockUserValidators,
  unblockUserValidators,
  connectionQueryValidators,
  mutualConnectionsValidators,
  connectionSuggestionsValidators,
} from './connection.validators';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// ============================================================================
// CONNECTION REQUEST ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/connections/request:
 *   post:
 *     summary: Send connection request
 *     description: Send a connection request to another user. Symmetric connection model - both users must agree.
 *     tags: [Connections]
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
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: User ID to connect with
 *                 example: cm123abc456def789
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional personal message
 *                 example: Hi! Met you at the Tech Meetup yesterday
 *               relationshipType:
 *                 type: string
 *                 enum: [friend, professional, family, mentor, travel, community]
 *                 description: Type of relationship
 *                 example: friend
 *               relationshipDetails:
 *                 type: object
 *                 description: Additional context
 *                 properties:
 *                   howWeMet:
 *                     type: string
 *                   mutualInterests:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Connection request sent successfully
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
 *                   example: Connection request sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: PENDING
 *                     initiatorId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/request',
  sendConnectionRequestValidators,
  handleValidationErrors,
  ConnectionController.sendConnectionRequest
);

/**
 * @swagger
 * /v2/connections/{connectionId}/respond:
 *   post:
 *     summary: Respond to connection request
 *     description: Accept or reject a pending connection request
 *     tags: [Connections]
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
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *                 example: accept
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 example: Great to connect with you!
 *     responses:
 *       200:
 *         description: Response recorded successfully
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:connectionId/respond',
  respondToConnectionRequestValidators,
  handleValidationErrors,
  ConnectionController.respondToConnectionRequest
);

/**
 * @swagger
 * /v2/connections/{connectionId}/withdraw:
 *   delete:
 *     summary: Withdraw connection request
 *     description: Cancel a pending connection request you sent
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request withdrawn successfully
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:connectionId/withdraw',
  connectionIdValidator,
  handleValidationErrors,
  ConnectionController.withdrawConnectionRequest
);

/**
 * @swagger
 * /v2/connections/{connectionId}:
 *   delete:
 *     summary: Remove connection
 *     description: Remove an existing connection (30-day cooldown before reconnection)
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: No longer interested
 *     responses:
 *       200:
 *         description: Connection removed successfully
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
 *                     status:
 *                       type: string
 *                       example: REMOVED
 *                     cooldownUntil:
 *                       type: string
 *                       format: date-time
 */
router.delete(
  '/:connectionId',
  connectionIdValidator,
  handleValidationErrors,
  ConnectionController.removeConnection
);

/**
 * @swagger
 * /v2/connections/{connectionId}:
 *   put:
 *     summary: Update connection
 *     description: Update connection details (relationship type, tags, notes)
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               relationshipType:
 *                 type: string
 *                 enum: [friend, professional, family, mentor, travel, community]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [colleague, mentor, tech]
 *               howWeMet:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connection updated successfully
 */
router.put(
  '/:connectionId',
  updateConnectionValidators,
  handleValidationErrors,
  ConnectionController.updateConnection
);

// ============================================================================
// CONNECTION RETRIEVAL ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/connections/stats:
 *   get:
 *     summary: Get connection statistics
 *     description: Get aggregated statistics about your connections
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection statistics retrieved successfully
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
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     byStatus:
 *                       type: object
 *                       properties:
 *                         PENDING:
 *                           type: integer
 *                         ACCEPTED:
 *                           type: integer
 *                     byRelationshipType:
 *                       type: object
 *                     averageTrustScore:
 *                       type: number
 */
router.get(
  '/stats',
  ConnectionController.getConnectionStats
);

/**
 * @swagger
 * /v2/connections/suggestions:
 *   get:
 *     summary: Get connection suggestions
 *     description: Get personalized connection suggestions based on mutual connections, interests, and communities
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Maximum number of suggestions
 *       - in: query
 *         name: basedOn
 *         schema:
 *           type: string
 *           enum: [mutual, interests, communities, location]
 *         description: Algorithm focus
 *     responses:
 *       200:
 *         description: Suggestions retrieved successfully
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
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                           score:
 *                             type: number
 *                           reasons:
 *                             type: array
 *                             items:
 *                               type: string
 *                           mutualConnections:
 *                             type: integer
 */
router.get(
  '/suggestions',
  connectionSuggestionsValidators,
  handleValidationErrors,
  ConnectionController.getConnectionSuggestions
);

/**
 * @swagger
 * /v2/connections/mutual/{userId}:
 *   get:
 *     summary: Get mutual connections
 *     description: Get mutual connections between you and another user
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to check mutual connections with
 *     responses:
 *       200:
 *         description: Mutual connections retrieved
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
 *                     count:
 *                       type: integer
 *                     mutualConnections:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get(
  '/mutual/:userId',
  mutualConnectionsValidators,
  handleValidationErrors,
  ConnectionController.getMutualConnections
);

/**
 * @swagger
 * /v2/connections/{connectionId}:
 *   get:
 *     summary: Get connection by ID
 *     description: Get details of a specific connection
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:connectionId',
  connectionIdValidator,
  handleValidationErrors,
  ConnectionController.getConnectionById
);

/**
 * @swagger
 * /v2/connections:
 *   get:
 *     summary: Get connections
 *     description: Get user's connections with advanced filtering and pagination
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, CANCELED, REMOVED]
 *         description: Filter by connection status
 *       - in: query
 *         name: relationshipType
 *         schema:
 *           type: string
 *           enum: [friend, professional, family, mentor, travel, community]
 *         description: Filter by relationship type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or username
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [connectedAt, name, trustScore]
 *           default: connectedAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Connections retrieved successfully
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
 *                     connections:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get(
  '/',
  connectionQueryValidators,
  handleValidationErrors,
  ConnectionController.getConnections
);

// ============================================================================
// BLOCK/UNBLOCK ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/connections/block:
 *   post:
 *     summary: Block user
 *     description: Block a user (prevents all interactions)
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               reason:
 *                 type: string
 *                 example: Inappropriate behavior
 *               details:
 *                 type: string
 *     responses:
 *       201:
 *         description: User blocked successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  '/block',
  blockUserValidators,
  handleValidationErrors,
  ConnectionController.blockUser
);

/**
 * @swagger
 * /v2/connections/block/{userId}:
 *   delete:
 *     summary: Unblock user
 *     description: Unblock a previously blocked user
 *     tags: [Connections]
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
 *         description: User unblocked successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/block/:userId',
  unblockUserValidators,
  handleValidationErrors,
  ConnectionController.unblockUser
);

/**
 * @swagger
 * /v2/connections/blocked:
 *   get:
 *     summary: Get blocked users
 *     description: Get list of users you've blocked
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blocked users retrieved successfully
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
 *                     blockedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 */
router.get(
  '/blocked',
  ConnectionController.getBlockedUsers
);

export default router;
