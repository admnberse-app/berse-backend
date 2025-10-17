import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../../services/notification.service';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';

export class NotificationController {
  /**
   * @swagger
   * /v2/notifications:
   *   get:
   *     summary: Get user notifications
   *     description: Retrieve user's notifications with pagination and optional filtering
   *     tags: [Notifications]
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
   *         description: Number of notifications per page
   *       - in: query
   *         name: unreadOnly
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Filter to show only unread notifications
   *     responses:
   *       200:
   *         description: Notifications retrieved successfully
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
   *                   example: Notifications retrieved successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     notifications:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           userId:
   *                             type: string
   *                           type:
   *                             type: string
   *                             enum: [SYSTEM, EVENT, POINTS, VOUCH, MATCH, MESSAGE, SERVICE, MARKETPLACE, PAYMENT]
   *                           title:
   *                             type: string
   *                           message:
   *                             type: string
   *                           actionUrl:
   *                             type: string
   *                           metadata:
   *                             type: object
   *                           priority:
   *                             type: string
   *                             enum: [low, normal, high, urgent]
   *                           readAt:
   *                             type: string
   *                             format: date-time
   *                             nullable: true
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                     total:
   *                       type: integer
   *                       example: 45
   *                     unreadCount:
   *                       type: integer
   *                       example: 12
   *                     hasMore:
   *                       type: boolean
   *                       example: true
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     pages:
   *                       type: integer
   *                       example: 3
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *       500:
   *         description: Server error
   */
  static async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      const result = await NotificationService.getUserNotifications(userId, {
        page,
        limit,
        unreadOnly,
      });

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      logger.error('Error getting notifications:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /v2/notifications/unread-count:
   *   get:
   *     summary: Get unread notification count
   *     description: Get the count of unread notifications for the authenticated user (useful for badge display)
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Unread count retrieved successfully
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
   *                   example: Unread count retrieved successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     count:
   *                       type: integer
   *                       example: 12
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const count = await NotificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        message: 'Unread count retrieved successfully',
        data: { count },
      });
    } catch (error: any) {
      logger.error('Error getting unread count:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /v2/notifications/{notificationId}/read:
   *   put:
   *     summary: Mark notification as read
   *     description: Mark a specific notification as read
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: notificationId
   *         required: true
   *         schema:
   *           type: string
   *         description: The notification ID
   *     responses:
   *       200:
   *         description: Notification marked as read successfully
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
   *                   example: Notification marked as read
   *       400:
   *         description: Invalid notification ID
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { notificationId } = req.params;

      await NotificationService.markAsRead(notificationId, userId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error: any) {
      logger.error('Error marking notification as read:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /v2/notifications/read-all:
   *   put:
   *     summary: Mark all notifications as read
   *     description: Mark all user's notifications as read at once
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: All notifications marked as read successfully
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
   *                   example: All notifications marked as read
   *                 data:
   *                   type: object
   *                   properties:
   *                     count:
   *                       type: integer
   *                       description: Number of notifications marked as read
   *                       example: 15
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      await NotificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      logger.error('Error marking all notifications as read:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /v2/notifications/{notificationId}:
   *   delete:
   *     summary: Delete notification
   *     description: Delete a specific notification
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: notificationId
   *         required: true
   *         schema:
   *           type: string
   *         description: The notification ID
   *     responses:
   *       200:
   *         description: Notification deleted successfully
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
   *                   example: Notification deleted successfully
   *       400:
   *         description: Invalid notification ID
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { notificationId } = req.params;

      await NotificationService.deleteNotification(notificationId, userId);

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting notification:', error);
      next(error);
    }
  }

  /**
   * @swagger
   * /v2/notifications/read:
   *   delete:
   *     summary: Delete all read notifications
   *     description: Delete all notifications that have been marked as read (cleanup old notifications)
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Read notifications deleted successfully
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
   *                   example: 15 read notifications deleted
   *                 data:
   *                   type: object
   *                   properties:
   *                     deletedCount:
   *                       type: integer
   *                       example: 15
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async deleteAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const deletedCount = await NotificationService.deleteAllRead(userId);

      res.status(200).json({
        success: true,
        message: `${deletedCount} read notifications deleted`,
        data: { deletedCount },
      });
    } catch (error: any) {
      logger.error('Error deleting read notifications:', error);
      next(error);
    }
  }
}
