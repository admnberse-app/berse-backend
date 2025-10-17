import { Router } from 'express';
import { VouchController } from './vouch.controller';
import { handleValidationErrors } from '../../../middleware/validation';
import { authenticateToken } from '../../../middleware/auth';
import {
  requestVouchValidators,
  respondToVouchRequestValidators,
  revokeVouchValidators,
  communityVouchValidators,
  vouchQueryValidators,
} from './vouch.validators';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /v2/vouches/request:
 *   post:
 *     summary: Request vouch
 *     description: Request a vouch from a connected user (PRIMARY 12pts, SECONDARY 12pts, or COMMUNITY 16pts)
 *     tags: [Connections - Vouching]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voucherId
 *               - vouchType
 *             properties:
 *               voucherId:
 *                 type: string
 *                 description: User ID to request vouch from
 *               vouchType:
 *                 type: string
 *                 enum: [PRIMARY, SECONDARY, COMMUNITY]
 *                 description: Vouch type (limits 1/3/2)
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 example: Would you vouch for me?
 *               context:
 *                 type: object
 *                 properties:
 *                   reason:
 *                     type: string
 *                   relationship:
 *                     type: string
 *     responses:
 *       201:
 *         description: Vouch request created
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
 *                     vouch:
 *                       type: object
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         description: Not connected or limit exceeded
 */
router.post(
  '/request',
  requestVouchValidators,
  handleValidationErrors,
  VouchController.requestVouch
);

/**
 * @swagger
 * /v2/vouches/{vouchId}/respond:
 *   post:
 *     summary: Respond to vouch request
 *     description: |
 *       Approve, decline, or downgrade a vouch request.
 *       
 *       **Actions:**
 *       - `approve`: Accept vouch at requested level (adds trust points)
 *       - `decline`: Reject vouch request (status becomes DECLINED, tracked for analytics)
 *       - `downgrade`: Accept at lower tier (e.g., PRIMARY → SECONDARY with reduced points)
 *       
 *       **Trust Impact:**
 *       - PRIMARY: 12 points
 *       - SECONDARY: 12 points  
 *       - COMMUNITY: 16 points
 *       - DECLINED: 0 points (no trust score impact)
 *     tags: [Connections - Vouching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vouchId
 *         required: true
 *         schema:
 *           type: string
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
 *                 enum: [approve, decline, downgrade]
 *                 description: Approve (full points), Decline (tracked, no points), or Downgrade (lower tier)
 *               downgradeTo:
 *                 type: string
 *                 enum: [PRIMARY, SECONDARY]
 *                 description: Required if action is 'downgrade'
 *               message:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Vouch request responded to
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
 *                       enum: [APPROVED, DECLINED]
 *                     trustImpact:
 *                       type: number
 *                       description: Trust points awarded (0 if declined)
 *       403:
 *         description: Not authorized to respond
 */
router.post(
  '/:vouchId/respond',
  respondToVouchRequestValidators,
  handleValidationErrors,
  VouchController.respondToVouchRequest
);

/**
 * @swagger
 * /v2/vouches/{vouchId}/revoke:
 *   post:
 *     summary: Revoke vouch
 *     description: Revoke a previously given vouch (reduces vouched user's trust score)
 *     tags: [Connections - Vouching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vouchId
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
 *                 description: Optional reason for revocation
 *     responses:
 *       200:
 *         description: Vouch revoked successfully
 *       403:
 *         description: Not authorized to revoke
 */
router.post(
  '/:vouchId/revoke',
  revokeVouchValidators,
  handleValidationErrors,
  VouchController.revokeVouch
);

/**
 * @swagger
 * /v2/vouches/community:
 *   post:
 *     summary: Community vouch
 *     description: Community admin/moderator vouches for user (COMMUNITY type, 16pts)
 *     tags: [Connections - Vouching]
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
 *               - communityId
 *             properties:
 *               userId:
 *                 type: string
 *               communityId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Community vouch created
 *       403:
 *         description: Not community admin/moderator
 */
router.post(
  '/community',
  communityVouchValidators,
  handleValidationErrors,
  VouchController.createCommunityVouch
);

/**
 * @swagger
 * /v2/vouches/auto-vouch/eligibility:
 *   get:
 *     summary: Check auto-vouch eligibility
 *     description: Check if user meets auto-vouch criteria (60+ trust score, 3+ months active, 5+ vouches)
 *     tags: [Connections - Vouching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eligibility checked
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
 *                     eligible:
 *                       type: boolean
 *                     criteria:
 *                       type: object
 *                       properties:
 *                         trustScore:
 *                           type: object
 *                         accountAge:
 *                           type: object
 *                         vouchesReceived:
 *                           type: object
 */
router.get(
  '/auto-vouch/eligibility',
  VouchController.checkAutoVouchEligibility
);

/**
 * @swagger
 * /v2/vouches/received:
 *   get:
 *     summary: Get vouches received
 *     description: |
 *       Get vouches you've received with filtering options.
 *       
 *       **Status Values:**
 *       - `PENDING`: Awaiting voucher's response
 *       - `APPROVED`: Accepted and contributing to trust score
 *       - `ACTIVE`: Currently active vouch
 *       - `DECLINED`: Rejected by voucher (tracked for history)
 *       - `REVOKED`: Previously approved but later revoked
 *     tags: [Connections - Vouching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, ACTIVE, DECLINED, REVOKED]
 *         description: Filter by vouch status
 *       - in: query
 *         name: vouchType
 *         schema:
 *           type: string
 *           enum: [PRIMARY, SECONDARY, COMMUNITY]
 *         description: Filter by vouch type
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
 *     responses:
 *       200:
 *         description: Vouches retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vouches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         enum: [PENDING, APPROVED, ACTIVE, DECLINED, REVOKED]
 *                 totalCount:
 *                   type: integer
 */
router.get(
  '/received',
  vouchQueryValidators,
  handleValidationErrors,
  VouchController.getVouchesReceived
);

/**
 * @swagger
 * /v2/vouches/given:
 *   get:
 *     summary: Get vouches given
 *     description: |
 *       Get vouches you've given with availability counts.
 *       Includes both approved vouches (counting toward limits) and declined requests.
 *     tags: [Connections - Vouching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, ACTIVE, DECLINED, REVOKED]
 *         description: Filter by status (DECLINED shows requests you rejected)
 *       - in: query
 *         name: vouchType
 *         schema:
 *           type: string
 *           enum: [PRIMARY, SECONDARY, COMMUNITY]
 *     responses:
 *       200:
 *         description: Vouches retrieved
 */
router.get(
  '/given',
  vouchQueryValidators,
  handleValidationErrors,
  VouchController.getVouchesGiven
);

/**
 * @swagger
 * /v2/vouches/limits:
 *   get:
 *     summary: Get vouch limits
 *     description: Get vouch limits (1 PRIMARY, 3 SECONDARY, 2 COMMUNITY) and current usage
 *     tags: [Connections - Vouching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vouch limits retrieved
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
 *                     PRIMARY:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                           example: 1
 *                         used:
 *                           type: integer
 *                         available:
 *                           type: integer
 *                     SECONDARY:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                           example: 3
 *                         used:
 *                           type: integer
 *                         available:
 *                           type: integer
 *                     COMMUNITY:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                           example: 2
 *                         used:
 *                           type: integer
 *                         available:
 *                           type: integer
 */
router.get(
  '/limits',
  VouchController.getVouchLimits
);

/**
 * @swagger
 * /v2/vouches/summary:
 *   get:
 *     summary: Get vouch summary
 *     description: |
 *       Get comprehensive vouch summary including received vouches, given vouches, and trust contribution.
 *       
 *       **Note**: Trust score and trust level are available in the user profile endpoint (`GET /v2/users/profile`).
 *       
 *       **Trust Score Calculation** (0-100 points):
 *       - **40% from Vouches:**
 *         - Primary vouch: 30% of vouch score (12 points)
 *         - Secondary vouches: 30% of vouch score (12 points total, ~4 per vouch)
 *         - Community vouches: 40% of vouch score (16 points total, ~8 per vouch)
 *       - **30% from Activity Participation** (events, contributions)
 *       - **30% from Trust Moments** (feedback from connections)
 *       
 *       **Trust Levels:**
 *       - NEW: 0-20 points
 *       - BUILDING: 20-40 points
 *       - ESTABLISHED: 40-60 points
 *       - TRUSTED: 60-80 points
 *       - VERIFIED: 80+ points
 *     tags: [Connections - Trust]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vouch summary retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Vouch summary retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalVouchesReceived:
 *                       type: integer
 *                       description: Total approved/active vouches received
 *                       example: 4
 *                     totalVouchesGiven:
 *                       type: integer
 *                       description: Total approved/active vouches given to others
 *                       example: 3
 *                     primaryVouches:
 *                       type: integer
 *                       description: Number of primary vouches received (max 1)
 *                       example: 1
 *                     secondaryVouches:
 *                       type: integer
 *                       description: Number of secondary vouches received (max 3)
 *                       example: 2
 *                     communityVouches:
 *                       type: integer
 *                       description: Number of community vouches received (max 2)
 *                       example: 1
 *                     pendingRequests:
 *                       type: integer
 *                       description: Vouch requests awaiting your response
 *                       example: 1
 *                     activeVouches:
 *                       type: integer
 *                       description: Currently active vouches
 *                       example: 4
 *                     revokedVouches:
 *                       type: integer
 *                       description: Vouches that were revoked
 *                       example: 0
 *                     declinedVouches:
 *                       type: integer
 *                       description: Vouch requests that were declined
 *                       example: 0
 *                     availableSlots:
 *                       type: object
 *                       description: Remaining vouch slots you can receive
 *                       properties:
 *                         primary:
 *                           type: integer
 *                           example: 0
 *                         secondary:
 *                           type: integer
 *                           example: 1
 *                         community:
 *                           type: integer
 *                           example: 1
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/summary',
  VouchController.getVouchSummary
);

export default router;
