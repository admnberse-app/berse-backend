import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get user notifications (with pagination and filters)
router.get('/', NotificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark all notifications as read
router.put('/read-all', NotificationController.markAllAsRead);

// Delete all read notifications
router.delete('/read', NotificationController.deleteAllRead);

// Mark a specific notification as read
router.put('/:notificationId/read', NotificationController.markAsRead);

// Delete a specific notification
router.delete('/:notificationId', NotificationController.deleteNotification);

export default router;
