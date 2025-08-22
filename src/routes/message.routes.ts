import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// All message routes require authentication
router.use(authenticateToken);

// Get inbox messages
router.get('/inbox',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('unreadOnly').optional().isBoolean(),
  handleValidationErrors,
  asyncHandler(MessageController.getInbox)
);

// Get sent messages
router.get('/sent',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  handleValidationErrors,
  asyncHandler(MessageController.getSentMessages)
);

// Get conversation with specific user
router.get('/conversation/:partnerId',
  param('partnerId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  asyncHandler(MessageController.getConversation)
);

// Send a message
router.post('/send',
  body('receiverId').isUUID().withMessage('Valid receiver ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
  handleValidationErrors,
  asyncHandler(MessageController.sendMessage)
);

// Mark message as read
router.patch('/:messageId/read',
  param('messageId').isUUID(),
  handleValidationErrors,
  asyncHandler(MessageController.markAsRead)
);

// Mark all messages as read
router.patch('/mark-all-read',
  query('senderId').optional().isUUID(),
  handleValidationErrors,
  asyncHandler(MessageController.markAllAsRead)
);

// Delete a message
router.delete('/:messageId',
  param('messageId').isUUID(),
  handleValidationErrors,
  asyncHandler(MessageController.deleteMessage)
);

// Accept friend request
router.post('/accept-friend-request',
  body('followerId').isUUID().withMessage('Valid follower ID is required'),
  handleValidationErrors,
  asyncHandler(MessageController.acceptFriendRequest)
);

// Decline friend request
router.post('/decline-friend-request',
  body('followerId').isUUID().withMessage('Valid follower ID is required'),
  handleValidationErrors,
  asyncHandler(MessageController.declineFriendRequest)
);

export default router;