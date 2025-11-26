import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticateToken } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /v2/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     description: |
 *       Get comprehensive platform-wide statistics for admin dashboard including:
 *       - Overview (total users, communities, events, listings)
 *       - User metrics (active users, new signups, role distribution)
 *       - Community metrics (active, new, public/private breakdown)
 *       - Event metrics (upcoming, past, paid/free breakdown)
 *       - Marketplace metrics (active, sold listings)
 *       - Gamification metrics (points, badges, rewards, vouches)
 *       - Engagement metrics (connections, avg participation)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard retrieved successfully
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
 *                   example: Admin dashboard retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                           example: 1250
 *                         totalCommunities:
 *                           type: integer
 *                           example: 85
 *                         totalEvents:
 *                           type: integer
 *                           example: 342
 *                         totalListings:
 *                           type: integer
 *                           example: 156
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         newLast30Days:
 *                           type: integer
 *                         newLast7Days:
 *                           type: integer
 *                         byRole:
 *                           type: object
 *                           properties:
 *                             admin:
 *                               type: integer
 *                             moderator:
 *                               type: integer
 *                             guide:
 *                               type: integer
 *                             generalUser:
 *                               type: integer
 *                     communities:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         newLast30Days:
 *                           type: integer
 *                         private:
 *                           type: integer
 *                         public:
 *                           type: integer
 *                         totalMembers:
 *                           type: integer
 *                     events:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         upcoming:
 *                           type: integer
 *                         past:
 *                           type: integer
 *                         newLast30Days:
 *                           type: integer
 *                         paid:
 *                           type: integer
 *                         free:
 *                           type: integer
 *                         totalParticipants:
 *                           type: integer
 *                     marketplace:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         sold:
 *                           type: integer
 *                         newLast30Days:
 *                           type: integer
 *                     gamification:
 *                       type: object
 *                       properties:
 *                         totalPointsDistributed:
 *                           type: integer
 *                         totalBadges:
 *                           type: integer
 *                         totalRewards:
 *                           type: integer
 *                         totalVouches:
 *                           type: integer
 *                     engagement:
 *                       type: object
 *                       properties:
 *                         totalConnections:
 *                           type: integer
 *                         avgCommunitiesPerUser:
 *                           type: string
 *                         avgEventsPerUser:
 *                           type: string
 *       403:
 *         description: Unauthorized - Admin access required
 *       401:
 *         description: Authentication required
 */
router.get('/dashboard', asyncHandler(AdminController.getDashboard));

/**
 * @swagger
 * /v2/admin/users/stats:
 *   get:
 *     summary: Get detailed user statistics
 *     description: |
 *       Get detailed user statistics including:
 *       - Distribution by role, status, and trust level
 *       - Recent signups (last 30 days)
 *       - Top users by points
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/users/stats', asyncHandler(AdminController.getUserStats));

/**
 * @swagger
 * /v2/admin/communities/stats:
 *   get:
 *     summary: Get detailed community statistics
 *     description: |
 *       Get detailed community statistics including:
 *       - Distribution by type (public/private)
 *       - Top communities by member count
 *       - Recently created communities
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Community statistics retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/communities/stats', asyncHandler(AdminController.getCommunityStats));

/**
 * @swagger
 * /v2/admin/communities:
 *   get:
 *     summary: Get paginated list of communities
 *     description: Get a paginated list of communities with search and filter capabilities
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Communities retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/communities', asyncHandler(AdminController.getCommunities));

/**
 * @swagger
 * /v2/admin/communities/{communityId}:
 *   get:
 *     summary: Get community details by ID
 *     description: Get detailed community information organized in tabs
 *     tags: [Admin]
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
 *         description: Community details retrieved successfully
 *       404:
 *         description: Community not found
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/communities/:communityId', asyncHandler(AdminController.getCommunityById));

/**
 * @swagger
 * /v2/admin/communities/{communityId}/verify:
 *   post:
 *     summary: Verify or unverify a community
 *     description: Update community verification status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
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
 *               - isVerified
 *             properties:
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Community verification status updated successfully
 *       400:
 *         description: Invalid request body
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/communities/:communityId/verify', asyncHandler(AdminController.verifyCommunity));

/**
 * @swagger
 * /v2/admin/communities/{communityId}:
 *   delete:
 *     summary: Delete a community (soft delete)
 *     description: Soft delete a community with reason
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Community deleted successfully
 *       400:
 *         description: Reason is required
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.delete('/communities/:communityId', asyncHandler(AdminController.deleteCommunity));

/**
 * @swagger
 * /v2/admin/communities/members/{memberId}/approve:
 *   post:
 *     summary: Approve or reject community join request
 *     description: Approve or reject a pending community join request
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
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
 *               - isApproved
 *             properties:
 *               isApproved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Community join request processed successfully
 *       400:
 *         description: Invalid request body
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/communities/members/:memberId/approve', asyncHandler(AdminController.approveCommunityJoinRequest));

/**
 * @swagger
 * /v2/admin/communities/{communityId}/notes:
 *   post:
 *     summary: Add admin notes to a community
 *     description: Add administrative notes to a community for internal tracking
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
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
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *                 description: Admin note to add to the community
 *                 example: "Flagged for review due to user reports"
 *     responses:
 *       200:
 *         description: Community note added successfully
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
 *                   example: Community note added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     communityId:
 *                       type: string
 *                     note:
 *                       type: string
 *                     addedBy:
 *                       type: string
 *                     addedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Note is required
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/communities/:communityId/notes', asyncHandler(AdminController.addCommunityNote));

/**
 * @swagger
 * /v2/admin/communities/{communityId}/featured:
 *   post:
 *     summary: Feature or unfeature a community
 *     description: Update community featured status to highlight it on the platform
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
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
 *               - isFeatured
 *             properties:
 *               isFeatured:
 *                 type: boolean
 *                 description: Whether the community should be featured
 *                 example: true
 *     responses:
 *       200:
 *         description: Community featured status updated successfully
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
 *                   example: Community featured successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     communityId:
 *                       type: string
 *                     isFeatured:
 *                       type: boolean
 *                     updatedBy:
 *                       type: string
 *       400:
 *         description: isFeatured must be a boolean
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/communities/:communityId/featured', asyncHandler(AdminController.updateCommunityFeatured));

/**
 * @swagger
 * /v2/admin/communities/{communityId}/send-warning:
 *   post:
 *     summary: Send warning to community creator
 *     description: Send a formal warning email to the community creator with specified reason and message
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
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
 *               - reason
 *               - message
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Short reason for the warning
 *                 example: "Inappropriate content"
 *               message:
 *                 type: string
 *                 description: Detailed warning message
 *                 example: "Your community has been flagged for containing content that violates our community guidelines. Please review and remove the inappropriate posts within 48 hours."
 *     responses:
 *       200:
 *         description: Community warning sent successfully
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
 *                   example: Community warning sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     communityId:
 *                       type: string
 *                     creatorId:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     sentAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Reason and message are required
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/communities/:communityId/send-warning', asyncHandler(AdminController.sendCommunityWarning));

/**
 * @swagger
 * /v2/admin/events/stats:
 *   get:
 *     summary: Get detailed event statistics
 *     description: |
 *       Get detailed event statistics including:
 *       - Distribution by type (paid/free)
 *       - Upcoming events
 *       - Most popular events by participant count
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event statistics retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
// Note: Event stats moved to /v2/admin/events/stats (defined in event routes section below)

/**
 * @swagger
 * /v2/admin/users:
 *   get:
 *     summary: Get paginated list of users
 *     description: Get a paginated list of users with search and filter capabilities
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or username
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, MODERATOR, GUIDE, GENERAL_USER]
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, SUSPENDED, DELETED, PENDING]
 *         description: Filter by status
 *       - in: query
 *         name: trustLevel
 *         schema:
 *           type: string
 *         description: Filter by trust level
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/users', asyncHandler(AdminController.getUsers));

/**
 * @swagger
 * /v2/admin/users/export:
 *   get:
 *     summary: Export users as Excel
 *     description: Export filtered users data as an Excel (.xlsx) file with comprehensive user information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [GENERAL_USER, ADMIN, MODERATOR, GUIDE]
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, DEACTIVATED, BANNED, PENDING]
 *         description: Filter by account status
 *       - in: query
 *         name: trustLevel
 *         schema:
 *           type: string
 *           enum: [starter, trusted, leader]
 *         description: Filter by trust level
 *       - in: query
 *         name: registrationDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users registered from this date (ISO 8601 format)
 *       - in: query
 *         name: registrationDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users registered until this date (ISO 8601 format)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10000
 *         description: Maximum number of records to export
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or username
 *     responses:
 *       200:
 *         description: Excel file generated successfully
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/users/export', asyncHandler(AdminController.exportUsers));

/**
 * @swagger
 * /v2/admin/users/pending-verification:
 *   get:
 *     summary: Get users pending verification
 *     description: Get list of users who haven't verified their email or phone
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending verification users retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/users/pending-verification', asyncHandler(AdminController.getPendingVerification));

/**
 * @swagger
 * /v2/admin/users/{userId}:
 *   get:
 *     summary: Get user details
 *     description: Get detailed information about a specific user organized in tabs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete user
 *     description: Permanently delete a user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for deletion
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: User not found
 */
router.get('/users/:userId', asyncHandler(AdminController.getUserById));
router.delete('/users/:userId', asyncHandler(AdminController.deleteUser));

/**
 * @swagger
 * /v2/admin/users/{userId}/status:
 *   post:
 *     summary: Update user status
 *     description: Update user status to ACTIVE, DEACTIVATED, or BANNED
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, DEACTIVATED, BANNED]
 *                 description: New user status
 *               reason:
 *                 type: string
 *                 description: Reason for status change
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/users/:userId/status', asyncHandler(AdminController.updateUserStatus));

/**
 * @swagger
 * /v2/admin/users/{userId}/verify:
 *   post:
 *     summary: Verify user identity
 *     description: Verify user and update trust level
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trustLevel
 *             properties:
 *               trustLevel:
 *                 type: string
 *                 description: Trust level to assign (e.g., verified, trusted)
 *     responses:
 *       200:
 *         description: User verified successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/users/:userId/verify', asyncHandler(AdminController.verifyUserIdentity));

/**
 * @swagger
 * /v2/admin/users/{userId}/notes:
 *   post:
 *     summary: Add admin note
 *     description: Add an admin note to user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *                 description: Admin note content
 *     responses:
 *       200:
 *         description: Note added successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/users/:userId/notes', asyncHandler(AdminController.addUserNote));

/**
 * @swagger
 * /v2/admin/users/{userId}/verify-email:
 *   post:
 *     summary: Manually verify user email (emergency override)
 *     description: |
 *       Admin can manually verify a user's email address in emergency situations.
 *       This bypasses the normal email verification flow and immediately marks the email as verified.
 *       Use cases: User lost access to email, email service issues, support requests, account recovery.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Email verified successfully
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
 *                   example: Email verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     verifiedAt:
 *                       type: string
 *                       format: date-time
 *                     verifiedBy:
 *                       type: string
 *                       description: Admin ID who verified the email
 *                     alreadyVerified:
 *                       type: boolean
 *                       description: True if email was already verified
 *                     message:
 *                       type: string
 *       403:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: User not found
 */
router.post('/users/:userId/verify-email', asyncHandler(AdminController.verifyUserEmail));

/**
 * @swagger
 * /v2/admin/users/{userId}/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Reset user password to a new value
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 description: Optional note about password reset reason
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid password
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/users/:userId/reset-password', asyncHandler(AdminController.resetUserPassword));

/**
 * @swagger
 * /v2/admin/users/{userId}/role:
 *   post:
 *     summary: Update user role
 *     description: Update user role to USER, GUIDE, MODERATOR, or ADMIN
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, GUIDE, MODERATOR, ADMIN]
 *                 description: New user role
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/users/:userId/role', asyncHandler(AdminController.updateUserRole));

/**
 * @swagger
 * /v2/admin/users/{userId}/hosted-events:
 *   get:
 *     summary: Get events hosted by user
 *     description: Get paginated list of events hosted by specific user
 *     tags: [Admin]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hosted events retrieved successfully
 *       403:
 *         description: Unauthorized
 */
router.get('/users/:userId/hosted-events', asyncHandler(AdminController.getUserHostedEvents));

/**
 * @swagger
 * /v2/admin/users/{userId}/attended-events:
 *   get:
 *     summary: Get events attended by user
 *     description: Get paginated list of events attended by specific user
 *     tags: [Admin]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Attended events retrieved successfully
 *       403:
 *         description: Unauthorized
 */
router.get('/users/:userId/attended-events', asyncHandler(AdminController.getUserAttendedEvents));

/**
 * @swagger
 * /v2/admin/users/{userId}/payments:
 *   get:
 *     summary: Get user payment history
 *     description: Get payment history and revenue summary for specific user
 *     tags: [Admin]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *       403:
 *         description: Unauthorized
 */
router.get('/users/:userId/payments', asyncHandler(AdminController.getUserPayments));

/**
 * @swagger
 * /v2/admin/users/{userId}/reviews:
 *   get:
 *     summary: Get user reviews
 *     description: Get reviews and rating breakdown for specific user
 *     tags: [Admin]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       403:
 *         description: Unauthorized
 */
router.get('/users/:userId/reviews', asyncHandler(AdminController.getUserReviews));

/**
 * @swagger
 * /v2/admin/users/{userId}/moderation-history:
 *   get:
 *     summary: Get user moderation history
 *     description: Get all moderation actions for specific user
 *     tags: [Admin]
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
 *         description: Moderation history retrieved successfully
 *       403:
 *         description: Unauthorized
 */
router.get('/users/:userId/moderation-history', asyncHandler(AdminController.getUserModerationHistory));

/**
 * @swagger
 * /v2/admin/users/{userId}/vouches:
 *   get:
 *     summary: Get user vouches
 *     description: Get vouches given and received by specific user
 *     tags: [Admin]
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
 *         description: Vouches retrieved successfully
 *       403:
 *         description: Unauthorized
 */
router.get('/users/:userId/vouches', asyncHandler(AdminController.getUserVouches));

/**
 * @swagger
 * /v2/admin/users/{userId}/send-warning:
 *   post:
 *     summary: Send warning to user
 *     description: Send warning email to specific user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - reason
 *               - message
 *             properties:
 *               reason:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Warning sent successfully
 *       403:
 *         description: Unauthorized
 */
router.post('/users/:userId/send-warning', asyncHandler(AdminController.sendUserWarning));

/**
 * @swagger
 * /v2/admin/users/{userId}/moderation-notes:
 *   post:
 *     summary: Add moderation note
 *     description: Add admin note to user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note added successfully
 *       403:
 *         description: Unauthorized
 */
router.post('/users/:userId/moderation-notes', asyncHandler(AdminController.addModerationNote));

/**
 * @swagger
 * /v2/admin/users/{userId}/connections:
 *   get:
 *     summary: Get user connections
 *     description: Get list of user connections
 *     tags: [Admin]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Connections retrieved successfully
 *       403:
 *         description: Unauthorized
 */
router.get('/users/:userId/connections', asyncHandler(AdminController.getUserConnections));

/**
 * @swagger
 * /v2/admin/events/stats:
 *   get:
 *     summary: Get event statistics
 *     description: Get statistics for dashboard cards (total, upcoming, ongoing, completed, attendees)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalEvents:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                     changeFromLastMonth:
 *                       type: string
 *                     label:
 *                       type: string
 *                 upcoming:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                     next3Days:
 *                       type: number
 *                     label:
 *                       type: string
 *                 ongoing:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                     label:
 *                       type: string
 *                 completed:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                     label:
 *                       type: string
 *                 totalAttendees:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                     label:
 *                       type: string
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/events/stats', asyncHandler(AdminController.getEventStatistics));

/**
 * @swagger
 * /v2/admin/events:
 *   get:
 *     summary: List all events
 *     description: Get paginated list of events with filtering and sorting
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, description, or location
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SOCIAL, SPORTS, TRIP, ILM, CAFE_MEETUP, VOLUNTEER, MONTHLY_EVENT, LOCAL_TRIP]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, CANCELLED, COMPLETED]
 *       - in: query
 *         name: hostType
 *         schema:
 *           type: string
 *           enum: [PERSONAL, COMMUNITY]
 *       - in: query
 *         name: isFree
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events starting from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events ending before this date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, createdAt, title, updatedAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Events retrieved successfully
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
 *                     events:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           type:
 *                             type: string
 *                           status:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                           endDate:
 *                             type: string
 *                             format: date-time
 *                           startTime:
 *                             type: string
 *                           endTime:
 *                             type: string
 *                           location:
 *                             type: string
 *                           participants:
 *                             type: object
 *                             properties:
 *                               current:
 *                                 type: integer
 *                               max:
 *                                 type: integer
 *                               display:
 *                                 type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/events', asyncHandler(AdminController.getEvents));

/**
 * @swagger
 * /v2/admin/events/export:
 *   get:
 *     summary: Export events as CSV
 *     description: Export filtered events data as a CSV file
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: CSV file generated
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/events/export', asyncHandler(AdminController.exportEvents));

/**
 * @swagger
 * /v2/admin/events/{eventId}:
 *   get:
 *     summary: Get event details
 *     description: Get detailed information about a specific event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Event not found
 *   patch:
 *     summary: Update event
 *     description: Update event information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [SOCIAL, SPORTS, TRIP, ILM, CAFE_MEETUP, VOLUNTEER, MONTHLY_EVENT, LOCAL_TRIP]
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, CANCELLED, COMPLETED]
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               isFeatured:
 *                 type: boolean
 *               isFree:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       403:
 *         description: Unauthorized - Admin access required
 *   delete:
 *     summary: Delete event
 *     description: Soft delete an event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/events/:eventId', asyncHandler(AdminController.getEventById));
router.patch('/events/:eventId', asyncHandler(AdminController.updateEvent));
router.delete('/events/:eventId', asyncHandler(AdminController.deleteEvent));

/**
 * @swagger
 * /v2/admin/events/{eventId}/export-participants:
 *   get:
 *     summary: Export event participants to Excel
 *     description: Export detailed participant information for an event with optional status filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [REGISTERED, CONFIRMED, CHECKED_IN, CANCELED, NO_SHOW]
 *         description: Filter by participant status
 *     responses:
 *       200:
 *         description: Excel file with participant data
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Event not found
 */
router.get('/events/:eventId/export-participants', asyncHandler(AdminController.exportEventParticipants));

/**
 * @swagger
 * /v2/admin/events/{eventId}/cancel:
 *   post:
 *     summary: Cancel event
 *     description: Cancel an event and notify participants
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
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
 *     responses:
 *       200:
 *         description: Event canceled successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/events/:eventId/cancel', asyncHandler(AdminController.cancelEvent));

/**
 * @swagger
 * /v2/admin/events/{eventId}/publish:
 *   post:
 *     summary: Publish event
 *     description: Publish a draft event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event published successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/events/:eventId/publish', asyncHandler(AdminController.publishEvent));

/**
 * @swagger
 * /v2/admin/events/{eventId}/notes:
 *   post:
 *     summary: Add admin notes to an event
 *     description: Add administrative notes to an event for internal tracking
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
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
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *                 description: Admin note to add to the event
 *     responses:
 *       200:
 *         description: Event note added successfully
 *       400:
 *         description: Note is required
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/events/:eventId/notes', asyncHandler(AdminController.addEventNote));

/**
 * @swagger
 * /v2/admin/events/{eventId}/featured:
 *   post:
 *     summary: Feature or unfeature an event
 *     description: Update event featured status to highlight it on the platform
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
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
 *               - isFeatured
 *             properties:
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Event featured status updated successfully
 *       400:
 *         description: isFeatured must be a boolean
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/events/:eventId/featured', asyncHandler(AdminController.updateEventFeatured));

/**
 * @swagger
 * /v2/admin/events/{eventId}/send-warning:
 *   post:
 *     summary: Send warning to event host
 *     description: Send a formal warning email to the event host
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
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
 *               - reason
 *               - message
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Short reason for the warning
 *               message:
 *                 type: string
 *                 description: Detailed warning message
 *     responses:
 *       200:
 *         description: Event warning sent successfully
 *       400:
 *         description: Reason and message are required
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.post('/events/:eventId/send-warning', asyncHandler(AdminController.sendEventWarning));

/**
 * @swagger
 * /v2/admin/events/{eventId}/participants:
 *   get:
 *     summary: Get event participants
 *     description: Get paginated list of event participants
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [REGISTERED, CONFIRMED, CHECKED_IN, CANCELED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Participants retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get('/events/:eventId/participants', asyncHandler(AdminController.getEventParticipants));

// ============================================================================
// PAYMENT METHODS MANAGEMENT
// ============================================================================
/**
 * @swagger
 * /v2/admin/payment-methods:
 *   get:
 *     summary: Get all payment methods (Admin)
 *     description: Retrieve all payment methods including inactive ones. Admin only.
 *     tags: [Admin - Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
import { adminPaymentRoutes } from './admin.payment-methods.routes';
import { adminPaymentsRoutes } from './admin.payments.routes';

router.use('/payment-methods', adminPaymentRoutes);
router.use('/payments', adminPaymentsRoutes);

export default router;
