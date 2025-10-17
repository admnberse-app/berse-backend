import { Router } from 'express';
import { CommunityController } from './community.controller';
import { authenticateToken } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  createCommunityValidators,
  updateCommunityValidators,
  communityIdValidator,
  joinCommunityValidators,
  updateMemberRoleValidators,
  removeMemberValidators,
  memberActionValidators,
  communityQueryValidators,
  communityMemberQueryValidators,
  inviteToCommunityValidators,
  respondToInviteValidators,
} from './community.validators';

const router = Router();
const communityController = new CommunityController();

/**
 * @swagger
 * tags:
 *   name: Communities
 *   description: Community management and membership endpoints
 */

// ============================================================================
// COMMUNITY MANAGEMENT ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/communities:
 *   post:
 *     summary: Create a new community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Community created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticateToken,
  createCommunityValidators,
  handleValidationErrors,
  asyncHandler(communityController.createCommunity.bind(communityController))
);

/**
 * @swagger
 * /v2/communities:
 *   get:
 *     summary: Get all communities with filters
 *     tags: [Communities]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Communities retrieved successfully
 */
router.get(
  '/',
  communityQueryValidators,
  handleValidationErrors,
  asyncHandler(communityController.getCommunities.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/my:
 *   get:
 *     summary: Get communities user is member of
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My communities retrieved successfully
 */
router.get(
  '/my',
  authenticateToken,
  communityQueryValidators,
  handleValidationErrors,
  asyncHandler(communityController.getMyCommunities.bind(communityController))
);

// ============================================================================
// COMMUNITY DISCOVERY ROUTES (must come before /:communityId)
// ============================================================================

/**
 * @swagger
 * /v2/communities/discovery/trending:
 *   get:
 *     summary: Get trending communities
 *     description: Get communities sorted by member count and recent activity
 *     tags: [Communities]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Trending communities retrieved
 */
router.get(
  '/discovery/trending',
  asyncHandler(communityController.getTrendingCommunities.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/discovery/new:
 *   get:
 *     summary: Get newly created communities
 *     tags: [Communities]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: New communities retrieved
 */
router.get(
  '/discovery/new',
  asyncHandler(communityController.getNewCommunities.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/discovery/recommended:
 *   get:
 *     summary: Get recommended communities
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recommended communities retrieved
 */
router.get(
  '/discovery/recommended',
  authenticateToken,
  asyncHandler(communityController.getRecommendedCommunities.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/discovery/by-interest:
 *   get:
 *     summary: Get communities by interest
 *     tags: [Communities]
 *     parameters:
 *       - in: query
 *         name: interest
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Communities by interest retrieved
 */
router.get(
  '/discovery/by-interest',
  asyncHandler(communityController.getCommunitiesByInterest.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/discovery/suggested:
 *   get:
 *     summary: Get personalized suggestions
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Suggested communities retrieved
 */
router.get(
  '/discovery/suggested',
  authenticateToken,
  asyncHandler(communityController.getSuggestedCommunities.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/discovery/from-connections:
 *   get:
 *     summary: Get communities from connections
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Communities from connections retrieved
 */
router.get(
  '/discovery/from-connections',
  authenticateToken,
  asyncHandler(communityController.getCommunitiesFromConnections.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}:
 *   get:
 *     summary: Get community details
 *     tags: [Communities]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Community retrieved successfully
 *       404:
 *         description: Community not found
 */
router.get(
  '/:communityId',
  communityIdValidator,
  handleValidationErrors,
  asyncHandler(communityController.getCommunity.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}:
 *   put:
 *     summary: Update community details
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Community updated successfully
 *       403:
 *         description: Insufficient permissions
 */
router.put(
  '/:communityId',
  authenticateToken,
  updateCommunityValidators,
  handleValidationErrors,
  asyncHandler(communityController.updateCommunity.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}:
 *   delete:
 *     summary: Delete a community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Community deleted successfully
 *       403:
 *         description: Insufficient permissions
 */
router.delete(
  '/:communityId',
  authenticateToken,
  communityIdValidator,
  handleValidationErrors,
  asyncHandler(communityController.deleteCommunity.bind(communityController))
);

// ============================================================================
// COMMUNITY MEMBERSHIP ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/communities/{communityId}/join:
 *   post:
 *     summary: Join a community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Join request sent successfully
 */
router.post(
  '/:communityId/join',
  authenticateToken,
  joinCommunityValidators,
  handleValidationErrors,
  asyncHandler(communityController.joinCommunity.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}/leave:
 *   delete:
 *     summary: Leave a community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Left community successfully
 */
router.delete(
  '/:communityId/leave',
  authenticateToken,
  communityIdValidator,
  handleValidationErrors,
  asyncHandler(communityController.leaveCommunity.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}/members:
 *   get:
 *     summary: Get community members
 *     tags: [Communities]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 */
router.get(
  '/:communityId/members',
  communityMemberQueryValidators,
  handleValidationErrors,
  asyncHandler(communityController.getCommunityMembers.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}/members/{userId}/approve:
 *   post:
 *     summary: Approve member join request
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member approved successfully
 */
router.post(
  '/:communityId/members/:userId/approve',
  authenticateToken,
  memberActionValidators,
  handleValidationErrors,
  asyncHandler(communityController.approveMember.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}/members/{userId}/reject:
 *   post:
 *     summary: Reject member join request
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member rejected
 */
router.post(
  '/:communityId/members/:userId/reject',
  authenticateToken,
  memberActionValidators,
  handleValidationErrors,
  asyncHandler(communityController.rejectMember.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}/members/{userId}/role:
 *   put:
 *     summary: Update member role
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member role updated successfully
 */
router.put(
  '/:communityId/members/:userId/role',
  authenticateToken,
  updateMemberRoleValidators,
  handleValidationErrors,
  asyncHandler(communityController.updateMemberRole.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}/members/{userId}:
 *   delete:
 *     summary: Remove member from community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member removed successfully
 */
router.delete(
  '/:communityId/members/:userId',
  authenticateToken,
  removeMemberValidators,
  handleValidationErrors,
  asyncHandler(communityController.removeMember.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}/stats:
 *   get:
 *     summary: Get community statistics
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 */
router.get(
  '/:communityId/stats',
  authenticateToken,
  communityIdValidator,
  handleValidationErrors,
  asyncHandler(communityController.getCommunityStats.bind(communityController))
);

// ============================================================================
// COMMUNITY VOUCHING ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/communities/{communityId}/members/{userId}/vouch-eligibility:
 *   get:
 *     summary: Check auto-vouch eligibility
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eligibility check complete
 */
router.get(
  '/:communityId/members/:userId/vouch-eligibility',
  authenticateToken,
  memberActionValidators,
  handleValidationErrors,
  asyncHandler(communityController.checkAutoVouchEligibility.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}/members/{userId}/vouch:
 *   post:
 *     summary: Vouch for member on behalf of community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Community vouch granted
 */
router.post(
  '/:communityId/members/:userId/vouch',
  authenticateToken,
  memberActionValidators,
  handleValidationErrors,
  asyncHandler(communityController.vouchForMember.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/{communityId}/members/{userId}/vouch:
 *   delete:
 *     summary: Revoke community vouch
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Community vouch revoked
 */
router.delete(
  '/:communityId/members/:userId/vouch',
  authenticateToken,
  memberActionValidators,
  handleValidationErrors,
  asyncHandler(communityController.revokeVouch.bind(communityController))
);

export const communityRoutes = router;
