import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllNotificationsAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Delete all notifications
router.delete('/', deleteAllNotifications);

export default router;