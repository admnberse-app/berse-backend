import { prisma } from '../config/database';
import { NotificationType } from '@prisma/client';

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}

class NotificationService {
  async createNotification(data: CreateNotificationData) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        metadata: data.metadata,
      },
    });
  }

  async createBulkNotifications(userIds: string[], notificationData: Omit<CreateNotificationData, 'userId'>) {
    const notifications = userIds.map(userId => ({
      userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      actionUrl: notificationData.actionUrl,
      metadata: notificationData.metadata,
    }));

    return prisma.notification.createMany({
      data: notifications,
    });
  }

  async getUserNotifications(userId: string, limit = 20, offset = 0) {
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      total,
      unreadCount,
      hasMore: offset + limit < total,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  }

  async deleteAllNotifications(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  }

  async notifyMatchRequest(userId: string, senderName: string, matchType: string) {
    return this.createNotification({
      userId,
      type: 'MATCH',
      title: 'New Match Request!',
      message: `${senderName} wants to connect with you for ${matchType}`,
      actionUrl: '/match',
    });
  }

  async notifyFriendRequest(userId: string, senderName: string) {
    return this.createNotification({
      userId,
      type: 'MATCH',
      title: 'New Friend Request!',
      message: `${senderName} sent you a friend request`,
      actionUrl: '/match',
    });
  }

  // Notification creation helpers
  async notifyEventCreated(eventId: string, hostName: string, eventTitle: string) {
    const followers = await prisma.follow.findMany({
      where: { followingId: eventId },
      select: { followerId: true },
    });

    const userIds = followers.map(f => f.followerId);
    
    if (userIds.length > 0) {
      await this.createBulkNotifications(userIds, {
        type: 'EVENT',
        title: 'New Event',
        message: `${hostName} created a new event: ${eventTitle}`,
        actionUrl: `/events/${eventId}`,
      });
    }
  }

  async notifyMatchCreated(userId: string, matchedUserName: string, matchType: string) {
    await this.createNotification({
      userId,
      type: 'MATCH',
      title: 'New Match!',
      message: `You matched with ${matchedUserName} for ${matchType}`,
      actionUrl: '/match',
    });
  }

  async notifyPointsEarned(userId: string, points: number, reason: string) {
    await this.createNotification({
      userId,
      type: 'POINTS',
      title: 'Points Earned!',
      message: `You earned ${points} points for ${reason}`,
      actionUrl: '/rewards',
    });
  }

  async notifyNewMessage(receiverId: string, senderName: string, messagePreview: string) {
    await this.createNotification({
      userId: receiverId,
      type: 'MESSAGE',
      title: `Message from ${senderName}`,
      message: messagePreview.substring(0, 100),
      actionUrl: '/messages',
    });
  }

  async notifySystemUpdate(userIds: string[], title: string, message: string) {
    await this.createBulkNotifications(userIds, {
      type: 'SYSTEM',
      title,
      message,
    });
  }
}

export default new NotificationService();