import { Response } from 'express';
import notificationService from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await notificationService.getUserNotifications(userId, limit, offset);

    sendSuccess(res, result, 'Notifications retrieved successfully');
  } catch (error) {
    console.error('Get notifications error:', error);
    sendError(res, 'Failed to retrieve notifications');
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    await notificationService.markAsRead(notificationId, userId);

    sendSuccess(res, null, 'Notification marked as read');
  } catch (error) {
    console.error('Mark notification as read error:', error);
    sendError(res, 'Failed to mark notification as read');
  }
};

export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    await notificationService.markAllAsRead(userId);

    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    sendError(res, 'Failed to mark all notifications as read');
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    await notificationService.deleteNotification(notificationId, userId);

    sendSuccess(res, null, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    sendError(res, 'Failed to delete notification');
  }
};

export const deleteAllNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    await notificationService.deleteAllNotifications(userId);

    sendSuccess(res, null, 'All notifications deleted successfully');
  } catch (error) {
    console.error('Delete all notifications error:', error);
    sendError(res, 'Failed to delete all notifications');
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await notificationService.getUserNotifications(userId, 0, 0);

    sendSuccess(res, {
      unreadCount: result.unreadCount,
    }, 'Unread count retrieved successfully');
  } catch (error) {
    console.error('Get unread count error:', error);
    sendError(res, 'Failed to get unread count');
  }
};