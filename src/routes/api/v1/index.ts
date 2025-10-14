import { Router } from 'express';
import { authRoutes } from '../../../modules/auth';
import { userRoutes } from '../../../modules/user';
// LEGACY ROUTES - COMMENTED OUT DUE TO SCHEMA COMPLIANCE ISSUES
// These routes depend on legacy controllers that need to be updated for the new Prisma schema
// TODO: Update these controllers to use proper relation includes instead of direct field access
// import eventsRouter from './events.routes';
// import communitiesRouter from './communities.routes';
// import matchingRouter from './matching.routes';
// import pushRouter from '../../push.routes';
// import cardgameRouter from './cardgame.routes';
// import messagesRouter from '../../message.routes';
// import emailRouter from './email.routes';
// import paymentsRouter from './payments.routes';
// import notificationsRouter from './notifications.routes';
// import analyticsRouter from './analytics.routes';

const router = Router();

// API v1 routes - Using new modular structure (V2 modules are schema-compliant)
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// LEGACY ROUTES TEMPORARILY DISABLED - See comment above
// router.use('/events', eventsRouter);
// router.use('/communities', communitiesRouter);
// router.use('/matching', matchingRouter);
// router.use('/matches', matchingRouter); // Alias for matching
// router.use('/push', pushRouter);
// router.use('/cardgame', cardgameRouter);
// router.use('/messages', messagesRouter);
// router.use('/email', emailRouter);
// router.use('/payments', paymentsRouter);
// router.use('/notifications', notificationsRouter);
// router.use('/analytics', analyticsRouter);

// API v1 health check
router.get('/health', (req, res) => {
  res.json({
    version: 'v1',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API v1 documentation
router.get('/docs', (req, res) => {
  res.json({
    version: 'v1',
    status: 'partial - migrating to v2',
    message: 'Most v1 endpoints are temporarily disabled. Please use v2 endpoints at /v2/*',
    availableEndpoints: {
      auth: {
        'POST /auth/register': 'Register new user',
        'POST /auth/login': 'User login',
        'POST /auth/refresh': 'Refresh access token',
        'POST /auth/logout': 'User logout',
        'POST /auth/forgot-password': 'Request password reset',
        'POST /auth/reset-password': 'Reset password',
        'POST /auth/verify-email': 'Verify email address',
        'POST /auth/resend-verification': 'Resend verification email',
      },
      users: {
        'GET /users/profile': 'Get current user profile',
        'PUT /users/profile': 'Update user profile',
        'GET /users/search': 'Search users',
        'GET /users/:id': 'Get user by ID',
        'POST /users/connection-request': 'Send connection request',
        'POST /users/accept-connection/:connectionId': 'Accept connection',
        'POST /users/reject-connection/:connectionId': 'Reject connection',
        'POST /users/cancel-connection/:connectionId': 'Cancel connection',
        'DELETE /users/remove-connection/:connectionId': 'Remove connection',
        'GET /users/connections': 'Get user connections',
      },
    },
    disabledEndpoints: {
      note: 'These endpoints are temporarily disabled due to schema updates. They will be re-enabled after migration.',
      events: 'Use v2 API when available',
      communities: 'Use v2 API when available',
      matching: 'Use v2 API when available',
      cardgame: 'Use v2 API when available',
      messages: 'Use v2 API when available',
      email: 'Use v2 API when available',
      payments: 'Use v2 API when available',
    },
    migration: {
      guide: 'See /v2/docs for new API structure',
      changes: [
        'User follow system replaced with UserConnection system',
        'Profile fields now in separate UserProfile relation',
        'Location fields now in UserLocation relation',
        'Metadata fields now in UserMetadata relation',
        'Service-related fields in UserServiceProfile relation',
      ],
    },
  });
});

export default router;