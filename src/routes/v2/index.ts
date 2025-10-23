import { Router } from 'express';
import { authRoutes } from '../../modules/auth';
import { userRoutes } from '../../modules/user';
import { TrustScoreController } from '../../modules/user/trust-score.controller';
import { countriesRoutes, profileMetadataRoutes } from '../../modules/metadata';
import { onboardingRoutes } from '../../modules/onboarding';
import onboardingV2Routes from '../../modules/onboarding/onboarding-v2.routes';
import { eventRoutes } from '../../modules/events';
import { connectionRoutes, vouchRoutes, trustMomentRoutes } from '../../modules/connections';
import accountabilityRoutes from '../../modules/connections/accountability/accountability.routes';
import { cardGameRoutes } from '../../modules/cardgame';
import { gamificationRoutes } from '../../modules/gamification';
import { communityRoutes } from '../../modules/communities';
import vouchOfferRoutes from '../../modules/communities/vouch-offer.routes';
import notificationRoutes from '../../modules/user/notification.routes';
import marketplaceRoutes from '../../modules/marketplace/marketplace.routes';
import { paymentRoutes } from '../../modules/payments';
import { PaymentController } from '../../modules/payments/payment.controller';
import discoverRoutes from '../../modules/discover/discover.routes';
import adminRevenueRoutes from '../../modules/admin/revenue.routes';
import constantsRoutes from '../../modules/app-constants/constants.routes';
import dashboardRoutes from '../../modules/dashboard/dashboard.routes';
import { homeSurfRoutes } from '../../modules/homesurf';
import { berseGuideRoutes } from '../../modules/berseguide';
import { asyncHandler } from '../../utils/asyncHandler';
import { param } from 'express-validator';
import { handleValidationErrors } from '../../middleware/validation';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

// ============================================================================
// PUBLIC WEBHOOKS (Must be FIRST, before any auth middleware)
// ============================================================================

router.post(
  '/payments/webhooks/:provider',
  [
    param('provider')
      .trim()
      .notEmpty()
      .isIn(['xendit', 'stripe'])
  ],
  handleValidationErrors,
  asyncHandler(paymentController.handleWebhook.bind(paymentController))
);

// ============================================================================
// V2 API ROUTES
// ============================================================================

/**
 * Authentication routes
 * Base path: /v2/auth
 */
router.use('/auth', authRoutes);

/**
 * User/Profile routes
 * Base path: /v2/users
 */
router.use('/users', userRoutes);

/**
 * Metadata routes (countries, regions, timezones)
 * Base path: /v2/metadata
 */
router.use('/metadata', countriesRoutes);

/**
 * Profile Metadata routes (interests, languages, professions, etc.)
 * Base path: /v2/metadata/profile
 */
router.use('/metadata/profile', profileMetadataRoutes);

/**
 * Onboarding routes (Legacy - deprecated)
 * Base path: /v2/onboarding
 * @deprecated Use onboarding-v2 routes instead
 */
router.use('/onboarding', onboardingRoutes);

/**
 * Onboarding V2 routes (Two-Phase: App Preview + User Setup)
 * Base paths: /v2/onboarding/app-preview, /v2/onboarding/user-setup
 */
router.use('/onboarding', onboardingV2Routes);

/**
 * Event routes
 * Base path: /v2/events
 */
router.use('/events', eventRoutes);

/**
 * Connection routes
 * Base path: /v2/connections
 */
router.use('/connections', connectionRoutes);

/**
 * Community routes
 * Base path: /v2/communities
 */
router.use('/communities', communityRoutes);

/**
 * Vouch routes
 * Base path: /v2/vouches
 */
router.use('/vouches', vouchRoutes);

/**
 * Trust Moment routes
 * Base paths: /v2/connections/:connectionId/trust-moments, /v2/trust-moments, /v2/users/:userId/trust-moments, /v2/events/:eventId/trust-moments
 */
router.use('/', trustMomentRoutes);

/**
 * Accountability routes
 * Base path: /v2/accountability
 */
router.use('/accountability', accountabilityRoutes);

/**
 * Notification routes
 * Base path: /v2/notifications
 */
router.use('/notifications', notificationRoutes);

/**
 * Trust Leaderboard
 * Base path: /v2/trust/leaderboard
 */
router.get('/trust/leaderboard', authenticateToken, asyncHandler(TrustScoreController.getLeaderboard));

/**
 * Card Game routes
 * Base path: /v2/cardgame
 */
router.use('/cardgame', cardGameRoutes);

/**
 * Gamification routes
 * Base path: /v2/gamification
 */
router.use('/gamification', gamificationRoutes);

/**
 * Marketplace routes
 * Base path: /v2/marketplace
 */
router.use('/marketplace', marketplaceRoutes);

/**
 * Payment routes
 * Base path: /v2/payments
 */
router.use('/payments', paymentRoutes);

/**
 * Discover routes (Unified explore/discover feed)
 * Base path: /v2/discover
 */
router.use('/discover', discoverRoutes);

/**
 * Dashboard routes (User's personalized dashboard)
 * Base path: /v2/dashboard
 */
router.use('/dashboard', dashboardRoutes);

/**
 * App Constants routes (Enums, validation rules, config)
 * Base path: /v2/app-constants
 */
router.use('/app-constants', constantsRoutes);

/**
 * Admin Revenue routes
 * Base path: /v2/admin/revenue
 */
router.use('/admin/revenue', adminRevenueRoutes);

/**
 * Admin Vouch Offer routes
 * Base path: /v2/admin/vouch-offers
 */
router.use('/admin', vouchOfferRoutes);

/**
 * HomeSurf routes (Accommodation hosting)
 * Base path: /v2/homesurf
 */
router.use('/homesurf', homeSurfRoutes);

/**
 * BerseGuide routes (Local tour guide)
 * Base path: /v2/berseguide
 */
router.use('/berseguide', berseGuideRoutes);

// ============================================================================
// API HEALTH & DOCUMENTATION
// ============================================================================

/**
 * @swagger
 * /v2/health:
 *   get:
 *     summary: API health check
 *     description: Check the health status of the API v2 and get available endpoints
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy and operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   example: v2
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-15T10:30:00.000Z
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                       example: /v2/auth
 *                     users:
 *                       type: string
 *                       example: /v2/users
 */
router.get('/health', (req, res) => {
  res.json({
    version: 'v2',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/v2/auth',
      users: '/v2/users',
      metadata: '/v2/metadata',
      events: '/v2/events',
      connections: '/v2/connections',
      communities: '/v2/communities',
      vouches: '/v2/vouches',
      trustMoments: '/v2/connections/:connectionId/trust-moments, /v2/trust-moments, /v2/users/:userId/trust-moments, /v2/events/:eventId/trust-moments',
      notifications: '/v2/notifications',
      cardgame: '/v2/cardgame',
      gamification: '/v2/gamification',
      marketplace: '/v2/marketplace',
      payments: '/v2/payments',
      discover: '/v2/discover',
      dashboard: '/v2/dashboard',
      appConstants: '/v2/app-constants',
      homesurf: '/v2/homesurf',
      berseguide: '/v2/berseguide',
    },
  });
});

/**
 * @swagger
 * /v2/docs:
 *   get:
 *     summary: API v2 documentation
 *     description: Get comprehensive API v2 documentation including all available endpoints and authentication details
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API documentation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   example: v2
 *                 title:
 *                   type: string
 *                   example: Berse Platform API v2
 *                 description:
 *                   type: string
 *                   example: Modern, modular API for the Berse platform
 *                 baseUrl:
 *                   type: string
 *                   example: https://api.berse-app.com
 *                 documentation:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                     users:
 *                       type: string
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: object
 *                     users:
 *                       type: object
 *                 authentication:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: Bearer Token
 *                     header:
 *                       type: string
 *                       example: "Authorization: Bearer <token>"
 *                     refreshToken:
 *                       type: string
 *                       example: "Stored in httpOnly cookie or sent in request body"
 *                 rateLimit:
 *                   type: object
 *                   properties:
 *                     general:
 *                       type: string
 *                       example: "100 requests per 15 minutes"
 *                     auth:
 *                       type: string
 *                       example: "20 requests per 15 minutes"
 *                     login:
 *                       type: string
 *                       example: "5 attempts per 15 minutes"
 *                     register:
 *                       type: string
 *                       example: "3 attempts per hour"
 */
router.get('/docs', (req, res) => {
  res.json({
    version: 'v2',
    title: 'Berse Platform API v2',
    description: 'Modern, modular API for the Berse platform',
    baseUrl: 'https://api.berse-app.com',
    documentation: {
      auth: 'See /docs/api-v2/AUTH_API.md',
      users: 'See /docs/api-v2/USER_API.md',
      gamification: 'See /docs/api-v2/GAMIFICATION_API.md',
    },
    endpoints: {
      auth: {
        'POST /v2/auth/register': 'Register new user',
        'POST /v2/auth/login': 'User login',
        'POST /v2/auth/refresh-token': 'Refresh access token',
        'POST /v2/auth/logout': 'User logout',
        'POST /v2/auth/logout-all': 'Logout from all devices',
        'GET /v2/auth/me': 'Get current user profile',
        'POST /v2/auth/change-password': 'Change password',
        'POST /v2/auth/forgot-password': 'Request password reset',
        'POST /v2/auth/reset-password': 'Reset password with token',
      },
      users: {
        'GET /v2/users/profile': 'Get user profile',
        'PUT /v2/users/profile': 'Update user profile',
        'GET /v2/users/all': 'Get all users (discovery)',
        'GET /v2/users/search': 'Search users',
        'GET /v2/users/:id': 'Get user by ID',
        'POST /v2/users/follow/:id': 'Follow user / Send friend request',
        'DELETE /v2/users/follow/:id': 'Unfollow user',
        'POST /v2/users/upload-avatar': 'Upload profile picture',
        'DELETE /v2/users/:id': 'Delete user (admin only)',
      },
      events: {
        'GET /v2/events': 'Get all events with filters',
        'GET /v2/events/:id': 'Get event by ID',
        'POST /v2/events': 'Create new event (auth required)',
        'PUT /v2/events/:id': 'Update event (auth required)',
        'DELETE /v2/events/:id': 'Delete event (auth required)',
        'GET /v2/events/:id/ticket-tiers': 'Get ticket tiers for event',
        'POST /v2/events/ticket-tiers': 'Create ticket tier (auth required)',
        'PUT /v2/events/ticket-tiers/:id': 'Update ticket tier (auth required)',
        'POST /v2/events/tickets/purchase': 'Purchase ticket (auth required)',
        'GET /v2/events/me/tickets': 'Get my tickets (auth required)',
        'POST /v2/events/:id/register': 'Register for event (auth required)',
        'DELETE /v2/events/:id/register': 'Cancel registration (auth required)',
        'GET /v2/events/me/registrations': 'Get my registrations (auth required)',
        'POST /v2/events/:id/check-in': 'Check-in attendee (auth required)',
        'GET /v2/events/:id/attendees': 'Get event attendees (auth required)',
        'GET /v2/events/calendar/today': 'Get today events',
        'GET /v2/events/calendar/week': 'Get week schedule',
        'GET /v2/events/calendar/month': 'Get month events with date grouping',
        'GET /v2/events/calendar/counts': 'Get event counts for date range',
      },
      connections: {
        'POST /v2/connections/request': 'Send connection request (auth required)',
        'POST /v2/connections/:connectionId/respond': 'Accept/reject connection request (auth required)',
        'DELETE /v2/connections/:connectionId/withdraw': 'Withdraw connection request (auth required)',
        'DELETE /v2/connections/:connectionId': 'Remove connection (auth required)',
        'PUT /v2/connections/:connectionId': 'Update connection details (auth required)',
        'GET /v2/connections': 'Get connections with filters (auth required)',
        'GET /v2/connections/:connectionId': 'Get connection by ID (auth required)',
        'GET /v2/connections/stats': 'Get connection statistics (auth required)',
        'GET /v2/connections/mutual/:userId': 'Get mutual connections (auth required)',
        'GET /v2/connections/suggestions': 'Get connection suggestions (auth required)',
        'POST /v2/connections/block': 'Block a user (auth required)',
        'DELETE /v2/connections/block/:userId': 'Unblock a user (auth required)',
        'GET /v2/connections/blocked': 'Get blocked users list (auth required)',
      },
      communities: {
        'POST /v2/communities': 'Create new community (auth required)',
        'GET /v2/communities': 'Get all communities with filters',
        'GET /v2/communities/my': 'Get my communities (auth required)',
        'GET /v2/communities/:communityId': 'Get community details',
        'PUT /v2/communities/:communityId': 'Update community (auth required)',
        'DELETE /v2/communities/:communityId': 'Delete community (auth required)',
        'POST /v2/communities/:communityId/join': 'Join community (auth required)',
        'DELETE /v2/communities/:communityId/leave': 'Leave community (auth required)',
        'GET /v2/communities/:communityId/members': 'Get community members',
        'POST /v2/communities/:communityId/members/:userId/approve': 'Approve member (auth required)',
        'POST /v2/communities/:communityId/members/:userId/reject': 'Reject member (auth required)',
        'PUT /v2/communities/:communityId/members/:userId/role': 'Update member role (auth required)',
        'DELETE /v2/communities/:communityId/members/:userId': 'Remove member (auth required)',
        'GET /v2/communities/:communityId/stats': 'Get community stats (auth required)',
        'GET /v2/communities/:communityId/members/:userId/vouch-eligibility': 'Check vouch eligibility (auth required)',
        'POST /v2/communities/:communityId/members/:userId/vouch': 'Grant community vouch (auth required)',
        'DELETE /v2/communities/:communityId/members/:userId/vouch': 'Revoke community vouch (auth required)',
        'GET /v2/communities/discovery/trending': 'Get trending communities by member count',
        'GET /v2/communities/discovery/new': 'Get newly created communities (last 30 days)',
        'GET /v2/communities/discovery/recommended': 'Get personalized recommendations (auth required)',
        'GET /v2/communities/discovery/by-interest': 'Get communities by interest/category',
        'GET /v2/communities/discovery/suggested': 'Get combined suggestions (auth required)',
        'GET /v2/communities/discovery/from-connections': 'Get communities from friends (auth required)',
      },
      vouches: {
        'POST /v2/vouches/request': 'Request vouch from connection (auth required)',
        'POST /v2/vouches/:vouchId/respond': 'Approve/decline vouch request (auth required)',
        'POST /v2/vouches/:vouchId/revoke': 'Revoke vouch (auth required)',
        'POST /v2/vouches/community': 'Community admin vouch (auth required)',
        'GET /v2/vouches/auto-vouch/eligibility': 'Check auto-vouch eligibility (auth required)',
        'GET /v2/vouches/received': 'Get vouches received (auth required)',
        'GET /v2/vouches/given': 'Get vouches given (auth required)',
        'GET /v2/vouches/limits': 'Get vouch limits (auth required)',
        'GET /v2/vouches/summary': 'Get vouch summary (auth required)',
      },
      trustMoments: {
        'POST /v2/connections/:connectionId/trust-moments': 'Create trust moment feedback (auth required)',
        'GET /v2/trust-moments/:momentId': 'Get trust moment by ID (auth required)',
        'PATCH /v2/trust-moments/:momentId': 'Update trust moment (auth required)',
        'DELETE /v2/trust-moments/:momentId': 'Delete trust moment (auth required)',
        'GET /v2/users/:userId/trust-moments/received': 'Get feedback received by user (auth required)',
        'GET /v2/users/:userId/trust-moments/given': 'Get feedback given by user (auth required)',
        'GET /v2/events/:eventId/trust-moments': 'Get feedback for event (auth required)',
        'GET /v2/users/:userId/trust-moments/stats': 'Get trust moment statistics (auth required)',
      },
      notifications: {
        'GET /v2/notifications': 'Get user notifications with pagination (auth required)',
        'GET /v2/notifications/unread-count': 'Get unread notification count (auth required)',
        'PUT /v2/notifications/read-all': 'Mark all notifications as read (auth required)',
        'PUT /v2/notifications/:notificationId/read': 'Mark specific notification as read (auth required)',
        'DELETE /v2/notifications/read': 'Delete all read notifications (auth required)',
        'DELETE /v2/notifications/:notificationId': 'Delete specific notification (auth required)',
      },
      cardgame: {
        'POST /v2/cardgame/feedback': 'Submit feedback for card game question (auth required)',
        'GET /v2/cardgame/feedback': 'Get all feedback with filters (auth required)',
        'GET /v2/cardgame/feedback/:id': 'Get feedback by ID (auth required)',
        'PATCH /v2/cardgame/feedback/:id': 'Update feedback (auth required)',
        'DELETE /v2/cardgame/feedback/:id': 'Delete feedback (auth required)',
        'POST /v2/cardgame/feedback/:id/upvote': 'Toggle upvote on feedback (auth required)',
        'POST /v2/cardgame/feedback/:id/replies': 'Add reply to feedback (auth required)',
        'DELETE /v2/cardgame/replies/:id': 'Delete reply (auth required)',
        'GET /v2/cardgame/stats/topics/:topicId': 'Get topic statistics (auth required)',
        'GET /v2/cardgame/stats/topics': 'Get all topics statistics (auth required)',
        'GET /v2/cardgame/analytics/topics/:topicId': 'Get detailed topic analytics (auth required)',
        'GET /v2/cardgame/stats/me': 'Get current user statistics (auth required)',
        'GET /v2/cardgame/stats/users/:userId': 'Get user statistics (auth required)',
      },
      gamification: {
        'GET /v2/gamification/dashboard': 'Get gamification dashboard (auth required)',
        'GET /v2/gamification/badges': 'Get all badges (auth required)',
        'GET /v2/gamification/badges/my': 'Get my badges (auth required)',
        'GET /v2/gamification/badges/progress': 'Get badge progress (auth required)',
        'GET /v2/gamification/points': 'Get my points balance (auth required)',
        'GET /v2/gamification/points/history': 'Get points history (auth required)',
        'GET /v2/gamification/points/actions': 'Get point actions list (auth required)',
        'GET /v2/gamification/rewards': 'Get rewards catalog (auth required)',
        'POST /v2/gamification/rewards/redeem': 'Redeem reward (auth required)',
        'GET /v2/gamification/rewards/redemptions': 'Get my redemptions (auth required)',
        'GET /v2/gamification/leaderboard/points': 'Get points leaderboard (auth required)',
        'GET /v2/gamification/leaderboard/trust': 'Get trust score leaderboard (auth required)',
        'GET /v2/gamification/leaderboard/badges': 'Get badges leaderboard (auth required)',
        'GET /v2/gamification/leaderboard/events': 'Get events leaderboard (auth required)',
        'GET /v2/gamification/leaderboard/connections': 'Get connections leaderboard (auth required)',
        'GET /v2/gamification/leaderboard/referrals': 'Get referrals leaderboard (auth required)',
      },
      payments: {
        'POST /v2/payments/intent': 'Create payment intent (auth required)',
        'POST /v2/payments/confirm': 'Confirm payment (auth required)',
        'POST /v2/payments/:transactionId/capture': 'Capture authorized payment (auth required)',
        'POST /v2/payments/:transactionId/refund': 'Refund payment (auth required)',
        'GET /v2/payments/transactions': 'Get user transactions with filters (auth required)',
        'GET /v2/payments/:transactionId': 'Get transaction details (auth required)',
        'POST /v2/payments/methods': 'Add payment method (auth required)',
        'GET /v2/payments/methods': 'Get user payment methods (auth required)',
        'PUT /v2/payments/methods/:paymentMethodId': 'Update payment method (auth required)',
        'DELETE /v2/payments/methods/:paymentMethodId': 'Delete payment method (auth required)',
        'GET /v2/payments/payouts': 'Get user payouts (auth required)',
        'POST /v2/payments/calculate-fees': 'Calculate transaction fees',
        'POST /v2/payments/webhooks/:provider': 'Handle payment provider webhooks',
      },
      discover: {
        'GET /v2/discover': 'Get discover feed with sections or search results (personalized when authenticated)',
        'GET /v2/discover/trending': 'Get trending content',
        'GET /v2/discover/nearby': 'Get nearby content (requires location)',
      },
      dashboard: {
        'GET /v2/dashboard/summary': 'Get comprehensive dashboard overview (auth required)',
        'GET /v2/dashboard/communities': 'Get user\'s communities with role info (auth required)',
        'GET /v2/dashboard/events': 'Get user\'s events - hosting and attending (auth required)',
        'GET /v2/dashboard/listings': 'Get user\'s marketplace listings (auth required)',
        'GET /v2/dashboard/activity': 'Get user\'s recent activity feed (auth required)',
      },
      appConstants: {
        'GET /v2/app-constants/enums': 'Get all application enums',
        'GET /v2/app-constants/validation-rules': 'Get validation rules for fields',
        'GET /v2/app-constants/config': 'Get app configuration and limits',
        'GET /v2/app-constants/all': 'Get all constants (enums + validation + config)',
      },
      homesurf: {
        'GET /v2/homesurf/profile': 'Get my HomeSurf profile (auth required)',
        'GET /v2/homesurf/profile/:userId': 'Get HomeSurf profile by ID',
        'POST /v2/homesurf/profile': 'Create HomeSurf profile (auth required)',
        'PATCH /v2/homesurf/profile': 'Update HomeSurf profile (auth required)',
        'PATCH /v2/homesurf/profile/toggle': 'Toggle profile on/off (auth required)',
        'DELETE /v2/homesurf/profile': 'Delete profile (auth required)',
        'GET /v2/homesurf/eligibility': 'Check eligibility (auth required)',
        'POST /v2/homesurf/payment-options': 'Add payment option (auth required)',
        'PATCH /v2/homesurf/payment-options/:optionId': 'Update payment option (auth required)',
        'DELETE /v2/homesurf/payment-options/:optionId': 'Delete payment option (auth required)',
        'POST /v2/homesurf/bookings': 'Create booking request (auth required)',
        'POST /v2/homesurf/availability': 'Check availability',
        'GET /v2/homesurf/bookings/:bookingId': 'Get booking details (auth required)',
        'GET /v2/homesurf/bookings/host': 'Get bookings as host (auth required)',
        'GET /v2/homesurf/bookings/guest': 'Get stays as guest (auth required)',
        'PATCH /v2/homesurf/bookings/:bookingId/approve': 'Approve booking (auth required)',
        'PATCH /v2/homesurf/bookings/:bookingId/reject': 'Reject booking (auth required)',
        'PATCH /v2/homesurf/bookings/:bookingId/cancel': 'Cancel booking (auth required)',
        'POST /v2/homesurf/bookings/:bookingId/check-in': 'Check-in guest (auth required)',
        'POST /v2/homesurf/bookings/:bookingId/check-out': 'Check-out guest (auth required)',
        'POST /v2/homesurf/reviews': 'Create review (auth required)',
        'GET /v2/homesurf/reviews/given': 'Get reviews given (auth required)',
        'GET /v2/homesurf/reviews/received': 'Get reviews received (auth required)',
        'GET /v2/homesurf/reviews/user/:userId': 'Get public reviews for user',
        'GET /v2/homesurf/search': 'Search HomeSurf profiles',
        'GET /v2/homesurf/dashboard': 'Get HomeSurf dashboard (auth required)',
      },
      berseguide: {
        'GET /v2/berseguide/profile': 'Get my BerseGuide profile (auth required)',
        'GET /v2/berseguide/profile/:userId': 'Get BerseGuide profile by ID',
        'POST /v2/berseguide/profile': 'Create BerseGuide profile (auth required)',
        'PATCH /v2/berseguide/profile': 'Update BerseGuide profile (auth required)',
        'PATCH /v2/berseguide/profile/toggle': 'Toggle profile on/off (auth required)',
        'DELETE /v2/berseguide/profile': 'Delete profile (auth required)',
        'GET /v2/berseguide/eligibility': 'Check eligibility (auth required)',
        'POST /v2/berseguide/payment-options': 'Add payment option (auth required)',
        'PATCH /v2/berseguide/payment-options/:optionId': 'Update payment option (auth required)',
        'DELETE /v2/berseguide/payment-options/:optionId': 'Delete payment option (auth required)',
        'POST /v2/berseguide/bookings': 'Create booking request (auth required)',
        'POST /v2/berseguide/availability': 'Check availability',
        'GET /v2/berseguide/bookings/:bookingId': 'Get booking details (auth required)',
        'GET /v2/berseguide/bookings/guide': 'Get bookings as guide (auth required)',
        'GET /v2/berseguide/bookings/tourist': 'Get bookings as tourist (auth required)',
        'PATCH /v2/berseguide/bookings/:bookingId/approve': 'Approve booking (auth required)',
        'PATCH /v2/berseguide/bookings/:bookingId/reject': 'Reject booking (auth required)',
        'PATCH /v2/berseguide/bookings/:bookingId/cancel': 'Cancel booking (auth required)',
        'POST /v2/berseguide/sessions/start': 'Start session (auth required)',
        'PATCH /v2/berseguide/sessions/:sessionId': 'Update session (auth required)',
        'POST /v2/berseguide/sessions/:sessionId/end': 'End session (auth required)',
        'GET /v2/berseguide/bookings/:bookingId/sessions': 'Get sessions for booking (auth required)',
        'POST /v2/berseguide/reviews': 'Create review (auth required)',
        'GET /v2/berseguide/reviews/given': 'Get reviews given (auth required)',
        'GET /v2/berseguide/reviews/received': 'Get reviews received (auth required)',
        'GET /v2/berseguide/reviews/user/:userId': 'Get public reviews for user',
        'GET /v2/berseguide/search': 'Search BerseGuide profiles',
        'GET /v2/berseguide/dashboard': 'Get BerseGuide dashboard (auth required)',
      },
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      refreshToken: 'Stored in httpOnly cookie or sent in request body',
    },
    rateLimit: {
      general: '100 requests per 15 minutes',
      auth: '20 requests per 15 minutes',
      login: '5 attempts per 15 minutes',
      register: '3 attempts per hour',
    },
  });
});

export default router;
