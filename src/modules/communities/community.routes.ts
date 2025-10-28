import { Router } from 'express';
import { CommunityController } from './community.controller';
import { authenticateToken } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireTrustLevel } from '../../middleware/trust-level.middleware';
import { uploadImage } from '../../middleware/upload';
import vouchOfferRoutes from './vouch-offer.routes';
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
  communityEventsQueryValidators,
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
// PUBLIC PREVIEW ROUTES (must come before authenticated routes)
// ============================================================================

/**
 * @swagger
 * /v2/communities/preview/{communityId}:
 *   get:
 *     summary: Get public community preview (for QR code scanning)
 *     description: |
 *       Public endpoint that shows community details and upcoming events.
 *       Designed for users who scan a QR code and may not have the app installed yet.
 *       No authentication required.
 *     tags: [Communities]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Community ID
 *     responses:
 *       200:
 *         description: Community preview retrieved successfully
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
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     logoUrl:
 *                       type: string
 *                     coverImageUrl:
 *                       type: string
 *                     interests:
 *                       type: array
 *                       items:
 *                         type: string
 *                     isVerified:
 *                       type: boolean
 *                     memberCount:
 *                       type: integer
 *                     upcomingEvents:
 *                       type: array
 *                       items:
 *                         type: object
 *                     downloadLinks:
 *                       type: object
 *                       properties:
 *                         ios:
 *                           type: string
 *                         android:
 *                           type: string
 *                         deepLink:
 *                           type: string
 *       404:
 *         description: Community not found
 */
router.get(
  '/preview/:communityId',
  communityIdValidator,
  handleValidationErrors,
  asyncHandler(communityController.getPublicPreview.bind(communityController))
);

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
 *                 example: "Fitness Enthusiasts KL"
 *               description:
 *                 type: string
 *                 example: "A community for fitness lovers in Kuala Lumpur"
 *               logoUrl:
 *                 type: string
 *                 description: "Community logo image URL (upload via /v2/communities/upload-logo)"
 *                 example: "https://cdn.example.com/communities/logos/abc123.jpg"
 *               coverImageUrl:
 *                 type: string
 *                 description: "Community cover/banner image URL (upload via /v2/communities/upload-cover-image)"
 *                 example: "https://cdn.example.com/communities/covers/abc123.jpg"
 *               category:
 *                 type: string
 *                 description: "DEPRECATED - Use interests instead"
 *                 example: "Sports & Fitness"
 *               interests:
 *                 type: array
 *                 description: "Array of interest values from profile metadata (max 10)"
 *                 items:
 *                   type: string
 *                 example: ["fitness", "yoga", "running"]
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
  requireTrustLevel(76, 'create communities'),
  createCommunityValidators,
  handleValidationErrors,
  asyncHandler(communityController.createCommunity.bind(communityController))
);

/**
 * @swagger
 * /v2/communities:
 *   get:
 *     summary: Get all communities with filters
 *     description: |
 *       Retrieve all communities with optional filters and pagination.
 *       
 *       **Fallback Behavior:** When filters return no results:
 *       - Shows all communities (most recent first)
 *       - Response includes `isFallback: true`
 *       - Message changes to: "No communities match your filters. Showing all communities instead."
 *     tags: [Communities]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: "Filter by category (DEPRECATED - use interests instead)"
 *       - in: query
 *         name: interests
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: "Filter by interests (comma-separated values, max 5). Example: interests=fitness,yoga"
 *         example: "fitness,yoga,running"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and description
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter verified communities
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name, memberCount]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Communities retrieved successfully (includes isFallback field when showing alternatives)
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
 *     summary: Get community details with enhanced data
 *     description: |
 *       Get comprehensive community details including:
 *       - Basic community information
 *       - Members preview (first 5 members)
 *       - Upcoming events preview (first 3 events)
 *       - User membership status (if authenticated)
 *       - Admin data (ONLY for users with ADMIN or MODERATOR role):
 *         - Pending member requests count
 *         - Pending vouch offers count
 *         - Reported content count
 *     tags: [Communities]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Community ID
 *     responses:
 *       200:
 *         description: Community details retrieved with members preview, events preview, user status, and optional admin data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 adminData:
 *                   type: object
 *                   description: Only present if user is ADMIN or MODERATOR
 *                   properties:
 *                     pendingMemberRequests:
 *                       type: number
 *                       description: Count of pending member approval requests
 *                     pendingVouchOffers:
 *                       type: number
 *                       description: Count of pending vouch offers
 *                     reportedContent:
 *                       type: number
 *                       description: Count of reported content items
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *                 description: "Community logo image URL (upload via /v2/communities/upload-logo)"
 *               coverImageUrl:
 *                 type: string
 *                 description: "Community cover/banner image URL (upload via /v2/communities/upload-cover-image)"
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
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
 * /v2/communities/{communityId}/events:
 *   get:
 *     summary: Get community events
 *     tags: [Communities]
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 */
router.get(
  '/:communityId/events',
  communityEventsQueryValidators,
  handleValidationErrors,
  asyncHandler(communityController.getCommunityEvents.bind(communityController))
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

/**
 * @swagger
 * /v2/communities/{communityId}/qr-code:
 *   get:
 *     summary: Generate QR code for community preview
 *     description: |
 *       Generate a QR code that links to the public community preview page.
 *       When scanned, users will see community details and upcoming events,
 *       with clear CTAs to download the app.
 *       
 *       Only admins and moderators can generate QR codes for their communities.
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Community ID
 *     responses:
 *       200:
 *         description: QR code generated successfully
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
 *                   example: QR code generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     communityId:
 *                       type: string
 *                     qrCodeDataUrl:
 *                       type: string
 *                       description: Base64 encoded QR code image (PNG)
 *                       example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
 *                     previewUrl:
 *                       type: string
 *                       description: Public URL to the preview page
 *                       example: https://app.berse.com/community-preview/abc123
 *                     webUrl:
 *                       type: string
 *                       description: Deep link URL for app navigation
 *                       example: https://app.berse.com/communities/abc123
 *       403:
 *         description: Insufficient permissions (must be admin or moderator)
 *       404:
 *         description: Community not found
 */
router.get(
  '/:communityId/qr-code',
  authenticateToken,
  communityIdValidator,
  handleValidationErrors,
  asyncHandler(communityController.generateQRCode.bind(communityController))
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

// Mount vouch offer routes
router.use('/', vouchOfferRoutes);

// ============================================================================
// IMAGE UPLOAD ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/communities/upload-logo:
 *   post:
 *     summary: Upload community logo image
 *     description: Upload a logo image for a community. Returns the image URL to be used in community creation/update.
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Community logo image file (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
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
 *                   example: Community logo uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     logoUrl:
 *                       type: string
 *                       example: https://cdn.example.com/communities/logos/abc123.jpg
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/upload-logo',
  authenticateToken,
  uploadImage.single('logo'),
  asyncHandler(communityController.uploadLogo.bind(communityController))
);

/**
 * @swagger
 * /v2/communities/upload-cover-image:
 *   post:
 *     summary: Upload community cover/banner image
 *     description: Upload a cover image for a community. Returns the image URL to be used in community creation/update.
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - coverImage
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Community cover/banner image file (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Cover image uploaded successfully
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
 *                   example: Community cover image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     coverImageUrl:
 *                       type: string
 *                       example: https://cdn.example.com/communities/covers/abc123.jpg
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/upload-cover-image',
  authenticateToken,
  uploadImage.single('coverImage'),
  asyncHandler(communityController.uploadCoverImage.bind(communityController))
);

export const communityRoutes = router;