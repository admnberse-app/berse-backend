import { Router } from 'express';
import { GamificationController } from './gamification.controller';
import { authenticateToken } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
import { uploadImage } from '../../middleware/upload';
import { UserRole } from '@prisma/client';
import {
  getBadgeByIdValidator,
  awardBadgeValidator,
  revokeBadgeValidator,
  awardPointsValidator,
  deductPointsValidator,
  pointHistoryValidator,
  getRewardsValidator,
  createRewardValidator,
  updateRewardValidator,
  redeemRewardValidator,
  updateRedemptionStatusValidator,
  leaderboardValidator,
  userIdParamValidator,
  idParamValidator,
} from './gamification.validators';

const router = Router();

// All routes require authentication
// router.use(authenticateToken);

// ================== Dashboard ==================

/**
 * @swagger
 * /api/v2/gamification/dashboard:
 *   get:
 *     tags: [Gamification]
 *     summary: Get user's gamification dashboard
 *     description: Get complete gamification overview including points, badges, rewards, and leaderboard ranks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authenticateToken, GamificationController.getDashboard);

/**
 * @swagger
 * /api/v2/gamification/dashboard/user/{userId}:
 *   get:
 *     tags: [Gamification]
 *     summary: Get specific user's gamification dashboard (Admin)
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
 *         description: User dashboard retrieved successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  '/dashboard/user/:userId',
  authenticateToken,
  userIdParamValidator,
  handleValidationErrors,
  // authorize(UserRole.ADMIN), // Uncomment if you want admin-only access
  GamificationController.getUserDashboard
);

// ================== Badges ==================

/**
 * @swagger
 * /api/v2/gamification/badges:
 *   get:
 *     tags: [Gamification - Badges]
 *     summary: List all available badges
 *     description: Get list of all badge types with their criteria
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badges retrieved successfully
 */
router.get('/badges', authenticateToken, GamificationController.getAllBadges);

/**
 * @swagger
 * /api/v2/gamification/badges/my:
 *   get:
 *     tags: [Gamification - Badges]
 *     summary: Get my earned badges
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User badges retrieved successfully
 */
router.get('/badges/my', authenticateToken, GamificationController.getMyBadges);

/**
 * @swagger
 * /api/v2/gamification/badges/progress:
 *   get:
 *     tags: [Gamification - Badges]
 *     summary: Get badge progress for current user
 *     description: Shows progress towards earning each badge
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badge progress retrieved successfully
 */
router.get('/badges/progress', authenticateToken, GamificationController.getBadgeProgress);

/**
 * @swagger
 * /api/v2/gamification/badges/{id}:
 *   get:
 *     tags: [Gamification - Badges]
 *     summary: Get badge details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge retrieved successfully
 *       404:
 *         description: Badge not found
 */
router.get(
  '/badges/:id',
  authenticateToken,
  getBadgeByIdValidator,
  handleValidationErrors,
  GamificationController.getBadgeById
);

/**
 * @swagger
 * /api/v2/gamification/badges/user/{userId}:
 *   get:
 *     tags: [Gamification - Badges]
 *     summary: Get badges earned by specific user
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
 *         description: User badges retrieved successfully
 */
router.get(
  '/badges/user/:userId',
  authenticateToken,
  userIdParamValidator,
  handleValidationErrors,
  GamificationController.getUserBadges
);

/**
 * @swagger
 * /api/v2/gamification/badges/award:
 *   post:
 *     tags: [Gamification - Badges]
 *     summary: Manually award badge to user (Admin)
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
 *               - badgeType
 *             properties:
 *               userId:
 *                 type: string
 *               badgeType:
 *                 type: string
 *                 enum: [FIRST_FACE, CAFE_FRIEND, SUKAN_SQUAD_MVP, SOUL_NOURISHER, HELPERS_HAND, CONNECTOR, TOP_FRIEND, ICEBREAKER, CERTIFIED_HOST, STREAK_CHAMP, LOCAL_GUIDE, KIND_SOUL, KNOWLEDGE_SHARER, ALL_ROUNDER]
 *     responses:
 *       200:
 *         description: Badge awarded successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  '/badges/award',
  authenticateToken,
  awardBadgeValidator,
  handleValidationErrors,
  // authorize(UserRole.ADMIN), // Uncomment if you want admin-only access
  GamificationController.awardBadge
);

/**
 * @swagger
 * /api/v2/gamification/badges/{badgeId}/revoke/{userId}:
 *   delete:
 *     tags: [Gamification - Badges]
 *     summary: Revoke badge from user (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: badgeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Badge revoked successfully
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Badge not found
 */
router.delete(
  '/badges/:badgeId/revoke/:userId',
  authenticateToken,
  revokeBadgeValidator,
  handleValidationErrors,
  // authorize(UserRole.ADMIN), // Uncomment if you want admin-only access
  GamificationController.revokeBadge
);

// ================== Points ==================

/**
 * @swagger
 * /api/v2/gamification/points:
 *   get:
 *     tags: [Gamification - Points]
 *     summary: Get current user's points and balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Points retrieved successfully
 */
router.get('/points', authenticateToken, GamificationController.getMyPoints);

/**
 * @swagger
 * /api/v2/gamification/points/stats:
 *   get:
 *     tags: [Gamification - Points]
 *     summary: Get detailed points statistics and breakdown
 *     description: Get comprehensive points stats including lifetime earned/spent, top actions, monthly breakdown, and category analysis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed points stats retrieved successfully
 */
router.get('/points/stats', authenticateToken, GamificationController.getDetailedPointsStats);

/**
 * @swagger
 * /api/v2/gamification/points/history:
 *   get:
 *     tags: [Gamification - Points]
 *     summary: Get points history with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Points history retrieved successfully
 */
router.get(
  '/points/history',
  authenticateToken,
  pointHistoryValidator,
  handleValidationErrors,
  GamificationController.getPointsHistory
);

/**
 * @swagger
 * /api/v2/gamification/points/actions:
 *   get:
 *     tags: [Gamification - Points]
 *     summary: Get all point actions and their values
 *     description: List of all actions that can earn or lose points
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Point actions retrieved successfully
 */
router.get('/points/actions', authenticateToken, GamificationController.getPointActions);

/**
 * @swagger
 * /api/v2/gamification/points/user/{userId}:
 *   get:
 *     tags: [Gamification - Points]
 *     summary: Get specific user's points (Admin)
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
 *         description: User points retrieved successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  '/points/user/:userId',
  authenticateToken,
  userIdParamValidator,
  handleValidationErrors,
  // authorize(UserRole.ADMIN), // Uncomment if you want admin-only access
  GamificationController.getUserPoints
);

/**
 * @swagger
 * /api/v2/gamification/points/award:
 *   post:
 *     tags: [Gamification - Points]
 *     summary: Award points to user (Admin)
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
 *               - points
 *               - action
 *             properties:
 *               userId:
 *                 type: string
 *               points:
 *                 type: integer
 *                 minimum: 1
 *               action:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Points awarded successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  '/points/award',
  authenticateToken,
  awardPointsValidator,
  handleValidationErrors,
  // authorize(UserRole.ADMIN), // Uncomment if you want admin-only access
  GamificationController.awardPoints
);

/**
 * @swagger
 * /api/v2/gamification/points/deduct:
 *   post:
 *     tags: [Gamification - Points]
 *     summary: Deduct points from user (Admin)
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
 *               - points
 *               - description
 *             properties:
 *               userId:
 *                 type: string
 *               points:
 *                 type: integer
 *                 minimum: 1
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Points deducted successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  '/points/deduct',
  authenticateToken,
  deductPointsValidator,
  handleValidationErrors,
  // authorize(UserRole.ADMIN), // Uncomment if you want admin-only access
  GamificationController.deductPoints
);

// ================== Rewards ==================

/**
 * @swagger
 * /api/v2/gamification/rewards:
 *   get:
 *     tags: [Gamification - Rewards]
 *     summary: List available rewards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPoints
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxPoints
 *         schema:
 *           type: integer
 *       - in: query
 *         name: canAfford
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Rewards retrieved successfully
 */
router.get(
  '/rewards',
  authenticateToken,
  getRewardsValidator,
  handleValidationErrors,
  GamificationController.getRewards
);

/**
 * @swagger
 * /api/v2/gamification/rewards/categories:
 *   get:
 *     tags: [Gamification - Rewards]
 *     summary: Get reward categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/rewards/categories', authenticateToken, GamificationController.getRewardCategories);

/**
 * @swagger
 * /api/v2/gamification/rewards/redemptions:
 *   get:
 *     tags: [Gamification - Rewards]
 *     summary: Get my redemptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Redemptions retrieved successfully
 */
router.get('/rewards/redemptions', authenticateToken, GamificationController.getMyRedemptions);

/**
 * @swagger
 * /api/v2/gamification/rewards/{id}:
 *   get:
 *     tags: [Gamification - Rewards]
 *     summary: Get reward details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reward retrieved successfully
 *       404:
 *         description: Reward not found
 */
router.get(
  '/rewards/:id',
  authenticateToken,
  idParamValidator,
  handleValidationErrors,
  GamificationController.getRewardById
);

/**
 * @swagger
 * /api/v2/gamification/rewards/upload-image:
 *   post:
 *     summary: Upload reward main image
 *     description: Upload a main/display image for a reward. Returns the image URL.
 *     tags: [Gamification - Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Reward image file (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
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
 *                     imageUrl:
 *                       type: string
 *                       example: rewards/abc123.jpg
 *       400:
 *         description: No image provided
 */
router.post(
  '/rewards/upload-image',
  authenticateToken,
  uploadImage.single('image'),
  GamificationController.uploadRewardImage
);

/**
 * @swagger
 * /api/v2/gamification/rewards/upload-voucher-image:
 *   post:
 *     summary: Upload reward voucher/QR code image
 *     description: Upload a voucher or QR code image for a reward. Returns the image URL.
 *     tags: [Gamification - Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - voucherImage
 *             properties:
 *               voucherImage:
 *                 type: string
 *                 format: binary
 *                 description: Voucher/QR code image file (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Voucher image uploaded successfully
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
 *                     voucherImageUrl:
 *                       type: string
 *                       example: rewards/vouchers/xyz789.jpg
 *       400:
 *         description: No image provided
 */
router.post(
  '/rewards/upload-voucher-image',
  authenticateToken,
  uploadImage.single('voucherImage'),
  GamificationController.uploadVoucherImage
);

/**
 * @swagger
 * /api/v2/gamification/rewards:
 *   post:
 *     tags: [Gamification - Rewards]
 *     summary: Create new reward (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - pointsRequired
 *               - category
 *               - partner
 *               - quantity
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               pointsRequired:
 *                 type: integer
 *               category:
 *                 type: string
 *               partner:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reward created successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
  '/rewards',
  authenticateToken,
  createRewardValidator,
  handleValidationErrors,
  // authorize(UserRole.ADMIN), // Uncomment if you want admin-only access
  GamificationController.createReward
);

/**
 * @swagger
 * /api/v2/gamification/rewards/{id}:
 *   put:
 *     tags: [Gamification - Rewards]
 *     summary: Update reward (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               pointsRequired:
 *                 type: integer
 *               category:
 *                 type: string
 *               partner:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               imageUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Reward updated successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.put(
  '/rewards/:id',
  authenticateToken,
  updateRewardValidator,
  handleValidationErrors,
  // authorize(UserRole.ADMIN), // Uncomment if you want admin-only access
  GamificationController.updateReward
);

/**
 * @swagger
 * /api/v2/gamification/rewards/{id}:
 *   delete:
 *     tags: [Gamification - Rewards]
 *     summary: Delete reward (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reward deleted successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete(
  '/rewards/:id',
  authenticateToken,
  idParamValidator,
  handleValidationErrors,
  // authorize(UserRole.ADMIN), // Uncomment if you want admin-only access
  GamificationController.deleteReward
);

/**
 * @swagger
 * /api/v2/gamification/rewards/redeem:
 *   post:
 *     tags: [Gamification - Rewards]
 *     summary: Redeem a reward
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rewardId
 *             properties:
 *               rewardId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reward redeemed successfully
 *       400:
 *         description: Insufficient points or reward unavailable
 */
router.post(
  '/rewards/redeem',
  authenticateToken,
  redeemRewardValidator,
  handleValidationErrors,
  GamificationController.redeemReward
);

/**
 * @swagger
 * /api/v2/gamification/rewards/redemptions/{id}:
 *   get:
 *     tags: [Gamification - Rewards]
 *     summary: Get redemption details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Redemption retrieved successfully
 *       404:
 *         description: Redemption not found
 */
router.get(
  '/rewards/redemptions/:id',
  authenticateToken,
  idParamValidator,
  handleValidationErrors,
  GamificationController.getRedemptionById
);

/**
 * @swagger
 * /api/v2/gamification/rewards/redemptions/{id}:
 *   put:
 *     tags: [Gamification - Rewards]
 *     summary: Update redemption status (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Redemption status updated successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.put(
  '/rewards/redemptions/:id',
  authenticateToken,
  updateRedemptionStatusValidator,
  handleValidationErrors,
  // authorize(UserRole.ADMIN), // Uncomment if you want admin-only access
  GamificationController.updateRedemptionStatus
);

// ================== Leaderboards ==================

/**
 * @swagger
 * /api/v2/gamification/leaderboard/points:
 *   get:
 *     tags: [Gamification - Leaderboards]
 *     summary: Get points leaderboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get(
  '/leaderboard/points',
  authenticateToken,
  leaderboardValidator,
  handleValidationErrors,
  GamificationController.getPointsLeaderboard
);

/**
 * @swagger
 * /api/v2/gamification/leaderboard/trust:
 *   get:
 *     tags: [Gamification - Leaderboards]
 *     summary: Get trust score leaderboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get(
  '/leaderboard/trust',
  authenticateToken,
  leaderboardValidator,
  handleValidationErrors,
  GamificationController.getTrustScoreLeaderboard
);

/**
 * @swagger
 * /api/v2/gamification/leaderboard/badges:
 *   get:
 *     tags: [Gamification - Leaderboards]
 *     summary: Get badges leaderboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get(
  '/leaderboard/badges',
  authenticateToken,
  leaderboardValidator,
  handleValidationErrors,
  GamificationController.getBadgesLeaderboard
);

/**
 * @swagger
 * /api/v2/gamification/leaderboard/events:
 *   get:
 *     tags: [Gamification - Leaderboards]
 *     summary: Get events attended leaderboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get(
  '/leaderboard/events',
  authenticateToken,
  leaderboardValidator,
  handleValidationErrors,
  GamificationController.getEventsLeaderboard
);

/**
 * @swagger
 * /api/v2/gamification/leaderboard/connections:
 *   get:
 *     tags: [Gamification - Leaderboards]
 *     summary: Get connections leaderboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get(
  '/leaderboard/connections',
  authenticateToken,
  leaderboardValidator,
  handleValidationErrors,
  GamificationController.getConnectionsLeaderboard
);

/**
 * @swagger
 * /api/v2/gamification/leaderboard/referrals:
 *   get:
 *     tags: [Gamification - Leaderboards]
 *     summary: Get referrals leaderboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get(
  '/leaderboard/referrals',
  authenticateToken,
  leaderboardValidator,
  handleValidationErrors,
  GamificationController.getReferralsLeaderboard
);

// ================== Platform Statistics ==================

/**
 * @swagger
 * /api/v2/gamification/stats:
 *   get:
 *     tags: [Gamification]
 *     summary: Get platform-wide gamification statistics (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics retrieved successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  '/stats',
  authenticateToken,
  // authorize(UserRole.ADMIN), // Uncomment if you want admin-only access
  GamificationController.getPlatformStats
);

export default router;
