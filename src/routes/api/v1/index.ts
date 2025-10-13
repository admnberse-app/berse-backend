import { Router } from 'express';
import authRouter from './auth.routes';
import usersRouter from './users.routes';
import eventsRouter from './events.routes';
import communitiesRouter from './communities.routes';
import matchingRouter from './matching.routes';
import pushRouter from '../../push.routes';
import cardgameRouter from './cardgame.routes';
import messagesRouter from '../../message.routes';
import emailRouter from './email.routes';
// import paymentsRouter from './payments.routes';
// import notificationsRouter from './notifications.routes';
// import analyticsRouter from './analytics.routes';

const router = Router();

// API v1 routes
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/events', eventsRouter);
router.use('/communities', communitiesRouter);
router.use('/matching', matchingRouter);
router.use('/matches', matchingRouter); // Alias for matching
router.use('/push', pushRouter);
router.use('/cardgame', cardgameRouter);
router.use('/messages', messagesRouter);
router.use('/email', emailRouter);
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
    endpoints: {
      auth: {
        'POST /auth/register': 'Register new user',
        'POST /auth/login': 'User login',
        'POST /auth/refresh': 'Refresh access token',
        'POST /auth/logout': 'User logout',
        'POST /auth/forgot-password': 'Request password reset',
        'POST /auth/reset-password': 'Reset password',
        'POST /auth/verify-email': 'Verify email address',
      },
      users: {
        'GET /users/profile': 'Get user profile',
        'PUT /users/profile': 'Update user profile',
        'GET /users/search': 'Search users',
        'POST /users/follow/:id': 'Follow user',
        'DELETE /users/follow/:id': 'Unfollow user',
        'GET /users/:id': 'Get user by ID',
      },
      events: {
        'GET /events': 'List events',
        'POST /events': 'Create event',
        'GET /events/:id': 'Get event details',
        'PUT /events/:id': 'Update event',
        'DELETE /events/:id': 'Delete event',
        'POST /events/:id/join': 'Join event',
        'POST /events/:id/leave': 'Leave event',
      },
      communities: {
        'GET /communities': 'List all communities',
        'GET /communities/search': 'Search communities',
        'GET /communities/my': 'Get user communities',
        'POST /communities': 'Create new community',
        'POST /communities/:id/join': 'Join community',
      },
      matching: {
        'GET /matching': 'Get user matches',
        'POST /matching': 'Create match request',
        'GET /matching/:matchId': 'Get match details',
        'PUT /matching/:matchId/respond': 'Respond to match request',
        'POST /matching/find': 'Find matches',
        'GET /matching/recommendations': 'Get match recommendations',
        'POST /matching/friend-request': 'Send friend request',
      },
      cardgame: {
        'POST /cardgame/feedback': 'Submit feedback for a question',
        'GET /cardgame/feedback': 'Get user feedback',
        'GET /cardgame/feedback/topic/:topicId': 'Get topic feedback',
        'GET /cardgame/stats': 'Get topic statistics',
        'DELETE /cardgame/feedback/:feedbackId': 'Delete feedback',
      },
      email: {
        'POST /email/test': 'Send test email (dev only)',
        'POST /email/verification': 'Send verification email',
        'POST /email/welcome': 'Send welcome email',
        'POST /email/password-reset': 'Send password reset email',
        'POST /email/event': 'Send event email',
        'POST /email/notification': 'Send notification email',
        'POST /email/campaign': 'Send campaign email',
        'POST /email/campaign/bulk': 'Send bulk campaign',
        'GET /email/queue/status': 'Get email queue status',
        'DELETE /email/queue': 'Clear email queue',
      },
      payments: {
        'POST /payments/process': 'Process payment',
        'POST /payments/refund': 'Process refund',
        'GET /payments/history': 'Payment history',
        'POST /payments/webhook': 'Payment webhook',
      },
    },
  });
});

export default router;