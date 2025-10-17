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
 *     description: Approve, decline, or downgrade a vouch request (approved vouches count toward trust score)
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
 *                 description: Approve (full points), Decline, or Downgrade (lower tier)
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
 *     description: Get vouches you've received with filtering
 *     tags: [Connections - Vouching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, DECLINED, REVOKED]
 *       - in: query
 *         name: vouchType
 *         schema:
 *           type: string
 *           enum: [PRIMARY, SECONDARY, COMMUNITY]
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
 *     description: Get vouches you've given with availability counts
 *     tags: [Connections - Vouching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, DECLINED, REVOKED]
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
 *     description: Get comprehensive vouch summary (received, given, trust contribution)
 *     tags: [Connections - Vouching]
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     received:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         byType:
 *                           type: object
 *                         trustPoints:
 *                           type: number
 *                     given:
 *                       type: object
 *                     pending:
 *                       type: object
 */
router.get(
  '/summary',
  VouchController.getVouchSummary
);

export default router;
