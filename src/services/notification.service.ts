import { prisma } from '../config/database';
import { NotificationType } from '@prisma/client';
import logger from '../utils/logger';

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  relatedEntityId?: string;
  relatedEntityType?: string;
  expiresAt?: Date;
}

/**
 * Notification Service
 * Handles in-app notifications for users
 */
export class NotificationService {
  /**
   * Create a single notification
   * Automatically checks user's notification preferences before creating
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      // Check if user has this notification type enabled
      const isEnabled = await this.isNotificationTypeEnabled(data.userId, data.type);
      
      if (!isEnabled) {
        logger.info('Notification skipped - disabled by user preferences', {
          userId: data.userId,
          type: data.type,
          title: data.title,
        });
        return null;
      }

      // Check if user has push notifications enabled (master toggle)
      const prefs = await prisma.notificationPreference.findUnique({
        where: { userId: data.userId },
        select: { pushEnabled: true },
      });

      // If pushEnabled is explicitly false, skip in-app notification
      // (default to true if preference not set)
      if (prefs && prefs.pushEnabled === false) {
        logger.info('Notification skipped - push notifications disabled', {
          userId: data.userId,
          type: data.type,
        });
        return null;
      }

      return await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
          metadata: data.metadata || {},
          priority: data.priority || 'normal',
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          expiresAt: data.expiresAt,
          channels: ['in_app'], // Can be extended to include 'email', 'push', etc.
        },
      });
    } catch (error) {
      logger.error('Failed to create notification', {
        userId: data.userId,
        type: data.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw - notification failure shouldn't break the main flow
      return null;
    }
  }

  /**
   * Create bulk notifications for multiple users
   * Automatically filters out users who have disabled this notification type
   */
  static async createBulkNotifications(
    userIds: string[],
    notificationData: Omit<CreateNotificationData, 'userId'>
  ) {
    try {
      // Filter users based on their notification preferences
      const enabledUserIds: string[] = [];
      
      for (const userId of userIds) {
        const isEnabled = await this.isNotificationTypeEnabled(userId, notificationData.type);
        
        // Also check master push toggle
        const prefs = await prisma.notificationPreference.findUnique({
          where: { userId },
          select: { pushEnabled: true },
        });

        // Include user if notification type is enabled AND push is not explicitly disabled
        if (isEnabled && (prefs?.pushEnabled !== false)) {
          enabledUserIds.push(userId);
        }
      }

      if (enabledUserIds.length === 0) {
        logger.info('Bulk notification skipped - all users have disabled this notification type', {
          type: notificationData.type,
          originalCount: userIds.length,
        });
        return { count: 0 };
      }

      logger.info('Bulk notification filtered by user preferences', {
        type: notificationData.type,
        originalCount: userIds.length,
        enabledCount: enabledUserIds.length,
        skippedCount: userIds.length - enabledUserIds.length,
      });

      const notifications = enabledUserIds.map(userId => ({
        userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        actionUrl: notificationData.actionUrl,
        metadata: notificationData.metadata || {},
        priority: notificationData.priority || 'normal',
        relatedEntityId: notificationData.relatedEntityId,
        relatedEntityType: notificationData.relatedEntityType,
        expiresAt: notificationData.expiresAt,
        channels: ['in_app'],
      }));

      return await prisma.notification.createMany({
        data: notifications,
      });
    } catch (error) {
      logger.error('Failed to create bulk notifications', {
        userCount: userIds.length,
        type: notificationData.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(
    userId: string, 
    options: { 
      page?: number; 
      limit?: number; 
      unreadOnly?: boolean; 
      type?: NotificationType;
      days?: number;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;
    const days = options.days || 30; // Default to last 30 days

    const whereClause: any = { userId };
    
    // Filter by read status
    if (options.unreadOnly) {
      whereClause.readAt = null;
    }
    
    // Filter by type
    if (options.type) {
      whereClause.type = options.type;
    }
    
    // Date range filtering
    if (options.startDate && options.endDate) {
      // Custom date range
      whereClause.createdAt = {
        gte: options.startDate,
        lte: options.endDate,
      };
    } else if (days > 0) {
      // Filter by days (default 30 days, 0 or negative means all time)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      whereClause.createdAt = {
        gte: startDate,
      };
    }

    const [notifications, total, unreadCount, availableTypes] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({
        where: whereClause,
      }),
      prisma.notification.count({
        where: { userId, readAt: null },
      }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: {
          type: true,
        },
        orderBy: {
          _count: {
            type: 'desc',
          },
        },
      }),
    ]);

    // Format available types with counts
    const types = availableTypes.map(item => ({
      type: item.type,
      count: item._count.type,
    }));

    return {
      notifications,
      total,
      unreadCount,
      hasMore: offset + limit < total,
      page,
      pages: Math.ceil(total / limit),
      types,
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all user notifications as read
   */
  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    return await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  }

  /**
   * Delete all user notifications
   */
  static async deleteAllNotifications(userId: string) {
    return await prisma.notification.deleteMany({
      where: { userId },
    });
  }

  /**
   * Delete all read notifications
   */
  static async deleteAllRead(userId: string) {
    const result = await prisma.notification.deleteMany({
      where: { 
        userId,
        readAt: { not: null },
      },
    });
    return result.count;
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  // ============================================================================
  // NOTIFICATION TEMPLATES
  // ============================================================================

  /**
   * Notify user about successful registration
   */
  static async notifyRegistrationSuccess(userId: string, userName: string) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: 'Welcome to Berse! 🎉',
      message: `Hi ${userName}! Your account has been created successfully. Start exploring and connecting with the community!`,
      actionUrl: null,
      priority: 'high',
      metadata: {
        event: 'registration_success',
      },
    });
  }

  /**
   * Notify user to verify their email
   */
  static async notifyEmailVerificationRequired(userId: string, userName: string) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: '📧 Verify Your Email',
      message: `Hi ${userName}! Please verify your email address to unlock all features. Check your inbox for the verification link.`,
      actionUrl: null,
      priority: 'high',
      metadata: {
        event: 'email_verification_required',
        reminder: true,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  /**
   * Notify user about successful email verification
   */
  static async notifyEmailVerified(userId: string, userName: string) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: '✅ Email Verified!',
      message: `Great news ${userName}! Your email has been verified. You now have full access to all features.`,
      actionUrl: null,
      priority: 'normal',
      metadata: {
        event: 'email_verified',
      },
    });
  }

  /**
   * Notify user about connection request received
   */
  static async notifyConnectionRequest(userId: string, senderName: string, senderId: string) {
    return await this.createNotification({
      userId,
      type: 'CONNECTION',
      title: 'New Connection Request',
      message: `${senderName} wants to connect with you!`,
      actionUrl: `/users/${senderId}`,
      priority: 'normal',
      relatedEntityId: senderId,
      relatedEntityType: 'connection_request',
      metadata: {
        event: 'connection_request',
        senderId,
        senderName,
      },
    });
  }

  /**
   * Notify user about connection request accepted
   */
  static async notifyConnectionAccepted(userId: string, accepterName: string, accepterId: string) {
    return await this.createNotification({
      userId,
      type: 'CONNECTION',
      title: 'Connection Accepted! 🤝',
      message: `${accepterName} accepted your connection request!`,
      actionUrl: `/users/${accepterId}`,
      priority: 'normal',
      relatedEntityId: accepterId,
      relatedEntityType: 'connection_accepted',
      metadata: {
        event: 'connection_accepted',
        accepterId,
        accepterName,
      },
    });
  }

  /**
   * Notify user about new event
   */
  static async notifyNewEvent(userId: string, eventTitle: string, eventId: string, hostName: string) {
    return await this.createNotification({
      userId,
      type: 'EVENT',
      title: 'New Event Available',
      message: `${hostName} created: ${eventTitle}`,
      actionUrl: `/events/${eventId}`,
      priority: 'normal',
      relatedEntityId: eventId,
      relatedEntityType: 'event',
      metadata: {
        event: 'new_event',
        eventId,
        eventTitle,
        hostName,
      },
    });
  }

  /**
   * Notify user about points earned
   */
  static async notifyPointsEarned(userId: string, points: number, reason: string) {
    return await this.createNotification({
      userId,
      type: 'POINTS',
      title: 'Points Earned! 🎁',
      message: `You earned ${points} points for ${reason}`,
      actionUrl: '/rewards',
      priority: 'low',
      metadata: {
        event: 'points_earned',
        points,
        reason,
      },
    });
  }

  /**
   * Notify user about vouch received
   */
  static async notifyVouchReceived(userId: string, voucherName: string, voucherId: string, vouchType: string) {
    return await this.createNotification({
      userId,
      type: 'VOUCH',
      title: 'New Vouch Received! ⭐',
      message: `${voucherName} vouched for you as a ${vouchType}`,
      actionUrl: `/users/${voucherId}`,
      priority: 'normal',
      relatedEntityId: voucherId,
      relatedEntityType: 'vouch',
      metadata: {
        event: 'vouch_received',
        voucherId,
        voucherName,
        vouchType,
      },
    });
  }

  /**
   * Notify user about withdrawn vouch request
   */
  static async notifyVouchWithdrawn(userId: string, voucherId: string, voucherName: string) {
    return await this.createNotification({
      userId,
      type: 'VOUCH',
      title: 'Vouch Request Withdrawn',
      message: `${voucherName} withdrew their vouch request`,
      actionUrl: `/users/${voucherId}`,
      priority: 'low',
      relatedEntityId: voucherId,
      relatedEntityType: 'vouch',
      metadata: {
        event: 'vouch_withdrawn',
        voucherId,
        voucherName,
      },
    });
  }

  /**
   * Notify user about password change
   */
  static async notifyPasswordChanged(userId: string, userName: string) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: '🔒 Password Changed',
      message: `Hi ${userName}, your password was recently changed. If this wasn't you, please contact support immediately.`,
      actionUrl: null,
      priority: 'high',
      metadata: {
        event: 'password_changed',
        security: true,
      },
    });
  }

  /**
   * Notify user about suspicious login attempt
   */
  static async notifySecurityAlert(userId: string, message: string, details?: any) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: '⚠️ Security Alert',
      message,
      actionUrl: null,
      priority: 'urgent',
      metadata: {
        event: 'security_alert',
        security: true,
        details,
      },
    });
  }

  /**
   * Notify user when someone uses their referral code
   */
  static async notifyReferralUsed(
    referrerId: string,
    refereeName: string,
    refereeId: string,
    referralCode: string
  ) {
    return await this.createNotification({
      userId: referrerId,
      type: 'SOCIAL',
      title: '🎉 Someone Used Your Referral Code!',
      message: `${refereeName} just joined using your referral code "${referralCode}". You've earned referral points!`,
      actionUrl: `/users/${refereeId}`,
      priority: 'normal',
      metadata: {
        event: 'referral_used',
        refereeId,
        refereeName,
        referralCode,
      },
    });
  }

  /**
   * Send system announcement to all users
   */
  static async sendSystemAnnouncement(
    title: string,
    message: string,
    actionUrl: string | null = null,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ) {
    // Get all active users
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    });

    const userIds = users.map(u => u.id);

    return await this.createBulkNotifications(userIds, {
      type: 'SYSTEM',
      title,
      message,
      actionUrl,
      priority,
      metadata: {
        event: 'system_announcement',
        broadcast: true,
      },
    });
  }

  // ============================================================================
  // MARKETPLACE NOTIFICATIONS
  // ============================================================================

  /**
   * Notify seller about new order
   */
  static async notifyNewOrder(
    sellerId: string,
    buyerName: string,
    listingTitle: string,
    orderId: string,
    totalAmount: number,
    currency: string
  ) {
    return await this.createNotification({
      userId: sellerId,
      type: 'MARKETPLACE',
      title: '🛍️ New Order Received!',
      message: `${buyerName} just ordered "${listingTitle}" for ${currency} ${totalAmount.toFixed(2)}`,
      actionUrl: `/marketplace/orders/${orderId}`,
      priority: 'high',
      relatedEntityId: orderId,
      relatedEntityType: 'marketplace_order',
      metadata: {
        event: 'marketplace_new_order',
        orderId,
        buyerName,
        listingTitle,
        totalAmount,
        currency,
      },
    });
  }

  /**
   * Notify buyer about order confirmation (payment success)
   */
  static async notifyOrderConfirmed(
    buyerId: string,
    listingTitle: string,
    orderId: string,
    sellerName: string
  ) {
    return await this.createNotification({
      userId: buyerId,
      type: 'MARKETPLACE',
      title: '✅ Order Confirmed!',
      message: `Your payment for "${listingTitle}" has been confirmed. ${sellerName} will prepare your order for shipment.`,
      actionUrl: `/marketplace/orders/${orderId}`,
      priority: 'high',
      relatedEntityId: orderId,
      relatedEntityType: 'marketplace_order',
      metadata: {
        event: 'marketplace_order_confirmed',
        orderId,
        listingTitle,
        sellerName,
      },
    });
  }

  /**
   * Notify buyer about order shipped
   */
  static async notifyOrderShipped(
    buyerId: string,
    listingTitle: string,
    orderId: string,
    trackingNumber?: string
  ) {
    const message = trackingNumber
      ? `Your order "${listingTitle}" has been shipped! Tracking: ${trackingNumber}`
      : `Your order "${listingTitle}" has been shipped!`;

    return await this.createNotification({
      userId: buyerId,
      type: 'MARKETPLACE',
      title: '📦 Order Shipped!',
      message,
      actionUrl: `/marketplace/orders/${orderId}`,
      priority: 'normal',
      relatedEntityId: orderId,
      relatedEntityType: 'marketplace_order',
      metadata: {
        event: 'marketplace_order_shipped',
        orderId,
        listingTitle,
        trackingNumber,
      },
    });
  }

  /**
   * Notify buyer about order delivered
   */
  static async notifyOrderDelivered(
    buyerId: string,
    listingTitle: string,
    orderId: string
  ) {
    return await this.createNotification({
      userId: buyerId,
      type: 'MARKETPLACE',
      title: '🎉 Order Delivered!',
      message: `Your order "${listingTitle}" has been delivered! Please leave a review if you're satisfied.`,
      actionUrl: `/marketplace/orders/${orderId}`,
      priority: 'normal',
      relatedEntityId: orderId,
      relatedEntityType: 'marketplace_order',
      metadata: {
        event: 'marketplace_order_delivered',
        orderId,
        listingTitle,
        canReview: true,
      },
    });
  }

  /**
   * Notify about order cancellation
   */
  static async notifyOrderCanceled(
    userId: string,
    listingTitle: string,
    orderId: string,
    canceledBy: 'buyer' | 'seller',
    reason?: string
  ) {
    const message = reason
      ? `Order "${listingTitle}" has been canceled by ${canceledBy}. Reason: ${reason}`
      : `Order "${listingTitle}" has been canceled by ${canceledBy}.`;

    return await this.createNotification({
      userId,
      type: 'MARKETPLACE',
      title: '❌ Order Canceled',
      message,
      actionUrl: `/marketplace/orders/${orderId}`,
      priority: 'high',
      relatedEntityId: orderId,
      relatedEntityType: 'marketplace_order',
      metadata: {
        event: 'marketplace_order_canceled',
        orderId,
        listingTitle,
        canceledBy,
        reason,
      },
    });
  }

  /**
   * Notify seller about new review received
   */
  static async notifyNewReview(
    sellerId: string,
    reviewerName: string,
    listingTitle: string,
    rating: number,
    reviewId: string
  ) {
    const stars = '⭐'.repeat(rating);
    return await this.createNotification({
      userId: sellerId,
      type: 'MARKETPLACE',
      title: '⭐ New Review Received!',
      message: `${reviewerName} left a ${rating}-star review ${stars} for "${listingTitle}"`,
      actionUrl: `/marketplace/reviews/${reviewId}`,
      priority: 'normal',
      relatedEntityId: reviewId,
      relatedEntityType: 'marketplace_review',
      metadata: {
        event: 'marketplace_new_review',
        reviewId,
        reviewerName,
        listingTitle,
        rating,
      },
    });
  }

  /**
   * Notify about item added to cart (seller notification for interest)
   */
  static async notifyItemAddedToCart(
    sellerId: string,
    listingTitle: string,
    listingId: string
  ) {
    return await this.createNotification({
      userId: sellerId,
      type: 'MARKETPLACE',
      title: '🛒 Someone Added Your Item to Cart',
      message: `"${listingTitle}" was added to a buyer's cart!`,
      actionUrl: `/marketplace/listings/${listingId}`,
      priority: 'low',
      relatedEntityId: listingId,
      relatedEntityType: 'marketplace_listing',
      metadata: {
        event: 'marketplace_item_added_to_cart',
        listingId,
        listingTitle,
      },
    });
  }

  /**
   * Notify seller about listing sold out
   */
  static async notifyListingSoldOut(
    sellerId: string,
    listingTitle: string,
    listingId: string
  ) {
    return await this.createNotification({
      userId: sellerId,
      type: 'MARKETPLACE',
      title: '🎊 Listing Sold Out!',
      message: `Congratulations! "${listingTitle}" is now sold out.`,
      actionUrl: `/marketplace/listings/${listingId}`,
      priority: 'normal',
      relatedEntityId: listingId,
      relatedEntityType: 'marketplace_listing',
      metadata: {
        event: 'marketplace_listing_sold_out',
        listingId,
        listingTitle,
      },
    });
  }

  /**
   * Notify about new dispute created
   */
  static async notifyDisputeCreated(
    userId: string,
    orderId: string,
    listingTitle: string,
    disputeId: string,
    isInitiator: boolean
  ) {
    const message = isInitiator
      ? `Your dispute for order "${listingTitle}" has been created. We'll review it shortly.`
      : `A dispute has been opened for order "${listingTitle}". Please respond.`;

    return await this.createNotification({
      userId,
      type: 'MARKETPLACE',
      title: isInitiator ? '📋 Dispute Created' : '⚠️ Dispute Opened',
      message,
      actionUrl: `/marketplace/disputes/${disputeId}`,
      priority: 'high',
      relatedEntityId: disputeId,
      relatedEntityType: 'marketplace_dispute',
      metadata: {
        event: 'marketplace_dispute_created',
        disputeId,
        orderId,
        listingTitle,
        isInitiator,
      },
    });
  }

  /**
   * Notify about dispute resolution
   */
  static async notifyDisputeResolved(
    userId: string,
    orderId: string,
    listingTitle: string,
    disputeId: string,
    resolution: string
  ) {
    return await this.createNotification({
      userId,
      type: 'MARKETPLACE',
      title: '✅ Dispute Resolved',
      message: `The dispute for "${listingTitle}" has been resolved. Resolution: ${resolution}`,
      actionUrl: `/marketplace/disputes/${disputeId}`,
      priority: 'high',
      relatedEntityId: disputeId,
      relatedEntityType: 'marketplace_dispute',
      metadata: {
        event: 'marketplace_dispute_resolved',
        disputeId,
        orderId,
        listingTitle,
        resolution,
      },
    });
  }

  /**
   * Notify about payment received (seller)
   */
  static async notifyPaymentReceived(
    sellerId: string,
    amount: number,
    currency: string,
    orderId: string,
    listingTitle: string
  ) {
    return await this.createNotification({
      userId: sellerId,
      type: 'PAYMENT',
      title: '💰 Payment Received!',
      message: `You've received ${currency} ${amount.toFixed(2)} for "${listingTitle}"`,
      actionUrl: `/marketplace/orders/${orderId}`,
      priority: 'high',
      relatedEntityId: orderId,
      relatedEntityType: 'marketplace_order',
      metadata: {
        event: 'marketplace_payment_received',
        orderId,
        listingTitle,
        amount,
        currency,
      },
    });
  }

  /**
   * Notify buyer about payment failed
   */
  static async notifyPaymentFailed(
    buyerId: string,
    listingTitle: string,
    orderId: string,
    reason?: string
  ) {
    const message = reason
      ? `Payment for "${listingTitle}" failed: ${reason}. Please try again.`
      : `Payment for "${listingTitle}" failed. Please try again.`;

    return await this.createNotification({
      userId: buyerId,
      type: 'PAYMENT',
      title: '❌ Payment Failed',
      message,
      actionUrl: `/marketplace/orders/${orderId}`,
      priority: 'urgent',
      relatedEntityId: orderId,
      relatedEntityType: 'marketplace_order',
      metadata: {
        event: 'marketplace_payment_failed',
        orderId,
        listingTitle,
        reason,
      },
    });
  }

  /**
   * Notify about low stock (seller)
   */
  static async notifyLowStock(
    sellerId: string,
    listingTitle: string,
    listingId: string,
    remainingQuantity: number
  ) {
    return await this.createNotification({
      userId: sellerId,
      type: 'MARKETPLACE',
      title: '⚠️ Low Stock Alert',
      message: `"${listingTitle}" is running low. Only ${remainingQuantity} left in stock.`,
      actionUrl: `/marketplace/listings/${listingId}`,
      priority: 'normal',
      relatedEntityId: listingId,
      relatedEntityType: 'marketplace_listing',
      metadata: {
        event: 'marketplace_low_stock',
        listingId,
        listingTitle,
        remainingQuantity,
      },
    });
  }

  // ============================================================================
  // CARD GAME NOTIFICATIONS
  // ============================================================================

  /**
   * Notify user when someone replies to their card game feedback
   */
  static async notifyCardGameReply(
    feedbackOwnerId: string,
    replierName: string,
    replierId: string,
    replyText: string,
    feedbackId: string,
    topicTitle: string
  ) {
    // Don't notify if user replies to their own feedback
    if (feedbackOwnerId === replierId) {
      return null;
    }

    const truncatedText = replyText.length > 100 
      ? replyText.substring(0, 100) + '...' 
      : replyText;

    return await this.createNotification({
      userId: feedbackOwnerId,
      type: 'SOCIAL',
      title: '💬 New Reply to Your Card Game Answer',
      message: `${replierName} replied to your answer in "${topicTitle}": "${truncatedText}"`,
      actionUrl: `/cardgame/feedback/${feedbackId}`,
      priority: 'normal',
      relatedEntityId: feedbackId,
      relatedEntityType: 'cardgame_feedback',
      metadata: {
        event: 'cardgame_reply_received',
        feedbackId,
        replierId,
        replierName,
        topicTitle,
        replyPreview: truncatedText,
      },
    });
  }

  /**
   * Notify user when someone replies to their reply (nested reply)
   */
  static async notifyCardGameNestedReply(
    parentReplyOwnerId: string,
    replierName: string,
    replierId: string,
    replyText: string,
    parentReplyId: string,
    feedbackId: string,
    topicTitle: string
  ) {
    // Don't notify if user replies to their own reply
    if (parentReplyOwnerId === replierId) {
      return null;
    }

    const truncatedText = replyText.length > 100 
      ? replyText.substring(0, 100) + '...' 
      : replyText;

    return await this.createNotification({
      userId: parentReplyOwnerId,
      type: 'SOCIAL',
      title: '💬 New Reply to Your Comment',
      message: `${replierName} replied to your comment in "${topicTitle}": "${truncatedText}"`,
      actionUrl: `/cardgame/feedback/${feedbackId}`,
      priority: 'normal',
      relatedEntityId: parentReplyId,
      relatedEntityType: 'cardgame_reply',
      metadata: {
        event: 'cardgame_nested_reply_received',
        feedbackId,
        parentReplyId,
        replierId,
        replierName,
        topicTitle,
        replyPreview: truncatedText,
      },
    });
  }

  /**
   * Notify user when someone upvotes their card game reply
   */
  static async notifyCardGameReplyUpvote(
    replyOwnerId: string,
    upvoterName: string,
    upvoterId: string,
    replyId: string,
    feedbackId: string,
    currentUpvoteCount: number,
    topicTitle: string
  ) {
    // Don't notify if user upvotes their own reply
    if (replyOwnerId === upvoterId) {
      return null;
    }

    return await this.createNotification({
      userId: replyOwnerId,
      type: 'ACHIEVEMENT',
      title: '👍 Your Card Game Reply Was Upvoted!',
      message: `${upvoterName} upvoted your reply in "${topicTitle}" (${currentUpvoteCount} upvotes)`,
      actionUrl: `/cardgame/feedback/${feedbackId}`,
      priority: 'low',
      relatedEntityId: replyId,
      relatedEntityType: 'cardgame_reply',
      metadata: {
        event: 'cardgame_reply_upvoted',
        replyId,
        feedbackId,
        upvoterId,
        upvoterName,
        topicTitle,
        upvoteCount: currentUpvoteCount,
      },
    });
  }

  /**
   * Notify user when their card game reply reaches upvote milestones
   */
  static async notifyCardGameReplyMilestone(
    replyOwnerId: string,
    replyId: string,
    feedbackId: string,
    milestone: number,
    topicTitle: string,
    replyText: string
  ) {
    const truncatedText = replyText.length > 100 
      ? replyText.substring(0, 100) + '...' 
      : replyText;

    return await this.createNotification({
      userId: replyOwnerId,
      type: 'ACHIEVEMENT',
      title: `🎉 ${milestone} Upvotes Milestone!`,
      message: `Your reply in "${topicTitle}" reached ${milestone} upvotes! "${truncatedText}"`,
      actionUrl: `/cardgame/feedback/${feedbackId}`,
      priority: 'normal',
      relatedEntityId: replyId,
      relatedEntityType: 'cardgame_reply',
      metadata: {
        event: 'cardgame_reply_milestone',
        replyId,
        feedbackId,
        topicTitle,
        milestone,
        replyPreview: truncatedText,
      },
    });
  }

  /**
   * Notify user when they complete a card game session
   */
  static async notifyCardGameSessionComplete(
    userId: string,
    topicTitle: string,
    topicId: string,
    sessionNumber: number,
    totalSessions: number,
    averageRating: number
  ) {
    const isLastSession = sessionNumber === totalSessions;
    const title = isLastSession 
      ? '🎊 Topic Completed!' 
      : '✅ Session Completed!';
    
    const message = isLastSession
      ? `Congratulations! You completed all sessions of "${topicTitle}" with an average rating of ${averageRating.toFixed(1)} stars! 🌟`
      : `Great work! You completed session ${sessionNumber} of "${topicTitle}" with an average rating of ${averageRating.toFixed(1)} stars!`;

    return await this.createNotification({
      userId,
      type: 'ACHIEVEMENT',
      title,
      message,
      actionUrl: `/cardgame/topics/${topicId}`,
      priority: 'normal',
      relatedEntityId: topicId,
      relatedEntityType: 'cardgame_topic',
      metadata: {
        event: 'cardgame_session_completed',
        topicId,
        topicTitle,
        sessionNumber,
        totalSessions,
        averageRating,
        isTopicComplete: isLastSession,
      },
    });
  }

  /**
   * Notify user when their card game feedback receives many upvotes
   */
  static async notifyCardGameFeedbackPopular(
    feedbackOwnerId: string,
    feedbackId: string,
    topicTitle: string,
    upvoteCount: number,
    questionText: string
  ) {
    const truncatedQuestion = questionText.length > 80 
      ? questionText.substring(0, 80) + '...' 
      : questionText;

    return await this.createNotification({
      userId: feedbackOwnerId,
      type: 'ACHIEVEMENT',
      title: '🔥 Your Answer is Popular!',
      message: `Your answer to "${truncatedQuestion}" in "${topicTitle}" has ${upvoteCount} upvotes!`,
      actionUrl: `/cardgame/feedback/${feedbackId}`,
      priority: 'normal',
      relatedEntityId: feedbackId,
      relatedEntityType: 'cardgame_feedback',
      metadata: {
        event: 'cardgame_feedback_popular',
        feedbackId,
        topicTitle,
        upvoteCount,
        questionPreview: truncatedQuestion,
      },
    });
  }

  // ============================================================================
  // CONNECTION NOTIFICATIONS (EXTENDED)
  // ============================================================================

  /**
   * Notify user when their connection request is rejected
   */
  static async notifyConnectionRejected(userId: string, rejecterName: string, rejecterId: string) {
    return await this.createNotification({
      userId,
      type: 'CONNECTION',
      title: 'Connection Request Declined',
      message: `${rejecterName} declined your connection request.`,
      actionUrl: `/users/${rejecterId}`,
      priority: 'low',
      relatedEntityId: rejecterId,
      relatedEntityType: 'connection_rejected',
      metadata: {
        event: 'connection_rejected',
        rejecterId,
        rejecterName,
      },
    });
  }

  /**
   * Notify user when someone cancels their connection request
   */
  static async notifyConnectionRequestCanceled(
    userId: string,
    senderName: string,
    senderId: string
  ) {
    return await this.createNotification({
      userId,
      type: 'CONNECTION',
      title: 'Connection Request Canceled',
      message: `${senderName} canceled their connection request.`,
      actionUrl: `/users/${senderId}`,
      priority: 'low',
      relatedEntityId: senderId,
      relatedEntityType: 'connection_request_canceled',
      metadata: {
        event: 'connection_request_canceled',
        senderId,
        senderName,
      },
    });
  }

  /**
   * Notify user when a connection removes them
   */
  static async notifyConnectionRemoved(userId: string, removerName: string, removerId: string) {
    return await this.createNotification({
      userId,
      type: 'CONNECTION',
      title: 'Connection Removed',
      message: `${removerName} removed you from their connections.`,
      actionUrl: '/connections',
      priority: 'normal',
      relatedEntityId: removerId,
      relatedEntityType: 'connection_removed',
      metadata: {
        event: 'connection_removed',
        removerId,
        removerName,
      },
    });
  }

  /**
   * Notify user when they can reconnect with someone (after cooldown)
   */
  static async notifyReconnectionAvailable(
    userId: string,
    otherUserName: string,
    otherUserId: string
  ) {
    return await this.createNotification({
      userId,
      type: 'CONNECTION',
      title: 'Reconnection Available',
      message: `You can now reconnect with ${otherUserName}!`,
      actionUrl: `/users/${otherUserId}`,
      priority: 'low',
      relatedEntityId: otherUserId,
      relatedEntityType: 'reconnection_available',
      metadata: {
        event: 'reconnection_available',
        otherUserId,
        otherUserName,
      },
    });
  }

  // ============================================================================
  // EVENT NOTIFICATIONS (EXTENDED)
  // ============================================================================

  /**
   * Notify user when their event registration is confirmed
   */
  static async notifyEventRegistrationConfirmed(
    userId: string,
    eventTitle: string,
    eventId: string,
    eventDate: Date
  ) {
    return await this.createNotification({
      userId,
      type: 'EVENT',
      title: '✅ Event Registration Confirmed',
      message: `You're registered for "${eventTitle}" on ${eventDate.toLocaleDateString()}!`,
      actionUrl: `/events/${eventId}`,
      priority: 'high',
      relatedEntityId: eventId,
      relatedEntityType: 'event',
      metadata: {
        event: 'event_registration_confirmed',
        eventId,
        eventTitle,
        eventDate: eventDate.toISOString(),
      },
    });
  }

  /**
   * Notify user 24 hours before event
   */
  static async notifyEventReminder24h(
    userId: string,
    eventTitle: string,
    eventId: string,
    eventDate: Date
  ) {
    return await this.createNotification({
      userId,
      type: 'REMINDER',
      title: '📅 Event Tomorrow',
      message: `"${eventTitle}" starts in 24 hours! Don't forget to prepare.`,
      actionUrl: `/events/${eventId}`,
      priority: 'high',
      relatedEntityId: eventId,
      relatedEntityType: 'event',
      metadata: {
        event: 'event_reminder_24h',
        eventId,
        eventTitle,
        eventDate: eventDate.toISOString(),
      },
    });
  }

  /**
   * Notify user 1 hour before event
   */
  static async notifyEventReminder1h(
    userId: string,
    eventTitle: string,
    eventId: string,
    eventLocation?: string
  ) {
    const message = eventLocation
      ? `"${eventTitle}" starts in 1 hour at ${eventLocation}!`
      : `"${eventTitle}" starts in 1 hour!`;

    return await this.createNotification({
      userId,
      type: 'REMINDER',
      title: '⏰ Event Starting Soon',
      message,
      actionUrl: `/events/${eventId}`,
      priority: 'urgent',
      relatedEntityId: eventId,
      relatedEntityType: 'event',
      metadata: {
        event: 'event_reminder_1h',
        eventId,
        eventTitle,
        eventLocation,
      },
    });
  }

  /**
   * Notify user when event is canceled
   */
  static async notifyEventCanceled(
    userId: string,
    eventTitle: string,
    eventId: string,
    reason?: string
  ) {
    const message = reason
      ? `"${eventTitle}" has been canceled. Reason: ${reason}`
      : `"${eventTitle}" has been canceled by the host.`;

    return await this.createNotification({
      userId,
      type: 'EVENT',
      title: '❌ Event Canceled',
      message,
      actionUrl: `/events/${eventId}`,
      priority: 'urgent',
      relatedEntityId: eventId,
      relatedEntityType: 'event',
      metadata: {
        event: 'event_canceled',
        eventId,
        eventTitle,
        reason,
      },
    });
  }

  /**
   * Notify user when event date/time changes
   */
  static async notifyEventDateChanged(
    userId: string,
    eventTitle: string,
    eventId: string,
    oldDate: Date,
    newDate: Date
  ) {
    return await this.createNotification({
      userId,
      type: 'EVENT',
      title: '📆 Event Date Changed',
      message: `"${eventTitle}" has been rescheduled from ${oldDate.toLocaleString()} to ${newDate.toLocaleString()}.`,
      actionUrl: `/events/${eventId}`,
      priority: 'high',
      relatedEntityId: eventId,
      relatedEntityType: 'event',
      metadata: {
        event: 'event_date_changed',
        eventId,
        eventTitle,
        oldDate: oldDate.toISOString(),
        newDate: newDate.toISOString(),
      },
    });
  }

  /**
   * Notify user when they successfully check in to event
   */
  static async notifyEventCheckedIn(
    userId: string,
    eventTitle: string,
    eventId: string
  ) {
    return await this.createNotification({
      userId,
      type: 'EVENT',
      title: '✅ Checked In Successfully',
      message: `You're checked in to "${eventTitle}"! Enjoy the event!`,
      actionUrl: `/events/${eventId}`,
      priority: 'normal',
      relatedEntityId: eventId,
      relatedEntityType: 'event',
      metadata: {
        event: 'event_checked_in',
        eventId,
        eventTitle,
      },
    });
  }

  // ============================================================================
  // COMMUNITY NOTIFICATIONS
  // ============================================================================

  /**
   * Notify user when community join request is approved
   */
  static async notifyCommunityJoinApproved(
    userId: string,
    communityName: string,
    communityId: string
  ) {
    return await this.createNotification({
      userId,
      type: 'COMMUNITY',
      title: '🎉 Community Join Approved',
      message: `Welcome to ${communityName}! Your membership has been approved.`,
      actionUrl: `/communities/${communityId}`,
      priority: 'high',
      relatedEntityId: communityId,
      relatedEntityType: 'community',
      metadata: {
        event: 'community_join_approved',
        communityId,
        communityName,
      },
    });
  }

  /**
   * Notify user when community join request is rejected
   */
  static async notifyCommunityJoinRejected(
    userId: string,
    communityName: string,
    communityId: string,
    reason?: string
  ) {
    const message = reason
      ? `Your request to join ${communityName} was declined. Reason: ${reason}`
      : `Your request to join ${communityName} was declined.`;

    return await this.createNotification({
      userId,
      type: 'COMMUNITY',
      title: 'Community Join Request Declined',
      message,
      actionUrl: `/communities/${communityId}`,
      priority: 'normal',
      relatedEntityId: communityId,
      relatedEntityType: 'community',
      metadata: {
        event: 'community_join_rejected',
        communityId,
        communityName,
        reason,
      },
    });
  }

  /**
   * Notify user when promoted to moderator
   */
  static async notifyCommunityPromotedToModerator(
    userId: string,
    communityName: string,
    communityId: string
  ) {
    return await this.createNotification({
      userId,
      type: 'COMMUNITY',
      title: '⭐ Promoted to Moderator',
      message: `Congratulations! You've been promoted to moderator in ${communityName}.`,
      actionUrl: `/communities/${communityId}`,
      priority: 'high',
      relatedEntityId: communityId,
      relatedEntityType: 'community',
      metadata: {
        event: 'community_promoted_moderator',
        communityId,
        communityName,
      },
    });
  }

  /**
   * Notify user when promoted to owner
   */
  static async notifyCommunityPromotedToOwner(
    userId: string,
    communityName: string,
    communityId: string
  ) {
    return await this.createNotification({
      userId,
      type: 'COMMUNITY',
      title: '👑 Promoted to Owner',
      message: `Congratulations! You're now an owner of ${communityName}!`,
      actionUrl: `/communities/${communityId}`,
      priority: 'high',
      relatedEntityId: communityId,
      relatedEntityType: 'community',
      metadata: {
        event: 'community_promoted_owner',
        communityId,
        communityName,
      },
    });
  }

  /**
   * Notify user when demoted from moderator
   */
  static async notifyCommunityDemoted(
    userId: string,
    communityName: string,
    communityId: string
  ) {
    return await this.createNotification({
      userId,
      type: 'COMMUNITY',
      title: 'Role Changed',
      message: `You're no longer a moderator in ${communityName}.`,
      actionUrl: `/communities/${communityId}`,
      priority: 'normal',
      relatedEntityId: communityId,
      relatedEntityType: 'community',
      metadata: {
        event: 'community_demoted',
        communityId,
        communityName,
      },
    });
  }

  /**
   * Notify user when removed from community
   */
  static async notifyCommunityRemoved(
    userId: string,
    communityName: string,
    communityId: string,
    reason?: string
  ) {
    const message = reason
      ? `You've been removed from ${communityName}. Reason: ${reason}`
      : `You've been removed from ${communityName}.`;

    return await this.createNotification({
      userId,
      type: 'COMMUNITY',
      title: 'Removed from Community',
      message,
      actionUrl: '/communities',
      priority: 'high',
      relatedEntityId: communityId,
      relatedEntityType: 'community',
      metadata: {
        event: 'community_removed',
        communityId,
        communityName,
        reason,
      },
    });
  }

  /**
   * Notify community admins when new member joins
   */
  static async notifyCommunityNewMember(
    userId: string,
    communityName: string,
    communityId: string,
    newMemberName: string,
    newMemberId: string
  ) {
    return await this.createNotification({
      userId,
      type: 'COMMUNITY',
      title: '👋 New Member Joined',
      message: `${newMemberName} just joined ${communityName}!`,
      actionUrl: `/communities/${communityId}/members`,
      priority: 'low',
      relatedEntityId: communityId,
      relatedEntityType: 'community',
      metadata: {
        event: 'community_new_member',
        communityId,
        communityName,
        newMemberId,
        newMemberName,
      },
    });
  }

  // ============================================================================
  // VOUCH NOTIFICATIONS
  // ============================================================================

  /**
   * Notify user when vouch request is approved
   */
  static async notifyVouchApproved(
    userId: string,
    voucherName: string,
    voucherId: string,
    vouchType: string
  ) {
    return await this.createNotification({
      userId,
      type: 'VOUCH',
      title: '✅ Vouch Approved',
      message: `Your ${vouchType} vouch from ${voucherName} has been approved!`,
      actionUrl: `/users/${voucherId}`,
      priority: 'high',
      relatedEntityId: voucherId,
      relatedEntityType: 'vouch',
      metadata: {
        event: 'vouch_approved',
        voucherId,
        voucherName,
        vouchType,
      },
    });
  }

  /**
   * Notify user when vouch request is rejected
   */
  static async notifyVouchRejected(
    userId: string,
    voucherName: string,
    voucherId: string,
    reason?: string
  ) {
    const message = reason
      ? `Your vouch from ${voucherName} was not approved. Reason: ${reason}`
      : `Your vouch from ${voucherName} was not approved.`;

    return await this.createNotification({
      userId,
      type: 'VOUCH',
      title: 'Vouch Not Approved',
      message,
      actionUrl: `/users/${voucherId}`,
      priority: 'normal',
      relatedEntityId: voucherId,
      relatedEntityType: 'vouch',
      metadata: {
        event: 'vouch_rejected',
        voucherId,
        voucherName,
        reason,
      },
    });
  }

  /**
   * Notify user when vouch is activated
   */
  static async notifyVouchActivated(
    userId: string,
    voucherName: string,
    voucherId: string,
    vouchType: string
  ) {
    return await this.createNotification({
      userId,
      type: 'VOUCH',
      title: '⭐ Vouch Activated',
      message: `Your ${vouchType} vouch from ${voucherName} is now active!`,
      actionUrl: `/users/${voucherId}`,
      priority: 'normal',
      relatedEntityId: voucherId,
      relatedEntityType: 'vouch',
      metadata: {
        event: 'vouch_activated',
        voucherId,
        voucherName,
        vouchType,
      },
    });
  }

  /**
   * Notify user when vouch is revoked
   */
  static async notifyVouchRevoked(
    userId: string,
    voucherName: string,
    voucherId: string,
    reason?: string
  ) {
    const message = reason
      ? `Your vouch from ${voucherName} has been revoked. Reason: ${reason}`
      : `Your vouch from ${voucherName} has been revoked.`;

    return await this.createNotification({
      userId,
      type: 'VOUCH',
      title: '⚠️ Vouch Revoked',
      message,
      actionUrl: `/users/${voucherId}`,
      priority: 'urgent',
      relatedEntityId: voucherId,
      relatedEntityType: 'vouch',
      metadata: {
        event: 'vouch_revoked',
        voucherId,
        voucherName,
        reason,
      },
    });
  }

  // ============================================================================
  // POINTS & ACHIEVEMENTS NOTIFICATIONS
  // ============================================================================

  /**
   * Notify user when reaching points milestone
   */
  static async notifyPointsMilestone(
    userId: string,
    milestone: number,
    totalPoints: number
  ) {
    return await this.createNotification({
      userId,
      type: 'ACHIEVEMENT',
      title: `🎉 ${milestone} Points Milestone!`,
      message: `Congratulations! You've reached ${milestone} points! Total: ${totalPoints}`,
      actionUrl: '/rewards',
      priority: 'normal',
      relatedEntityId: userId,
      relatedEntityType: 'points_milestone',
      metadata: {
        event: 'points_milestone',
        milestone,
        totalPoints,
      },
    });
  }

  /**
   * Notify user when earning a badge
   */
  static async notifyBadgeEarned(
    userId: string,
    badgeName: string,
    badgeId: string,
    badgeDescription: string,
    badgeImageUrl?: string
  ) {
    return await this.createNotification({
      userId,
      type: 'ACHIEVEMENT',
      title: `🏆 Badge Earned: ${badgeName}`,
      message: badgeDescription,
      actionUrl: `/users/me/badges`,
      priority: 'normal',
      relatedEntityId: badgeId,
      relatedEntityType: 'badge',
      metadata: {
        event: 'badge_earned',
        badgeId,
        badgeName,
        badgeDescription,
        badgeImageUrl,
      },
    });
  }

  /**
   * Notify user when upgrading badge tier
   */
  static async notifyBadgeTierUpgraded(
    userId: string,
    badgeName: string,
    badgeId: string,
    newTier: string
  ) {
    return await this.createNotification({
      userId,
      type: 'ACHIEVEMENT',
      title: `⬆️ Badge Upgraded: ${badgeName}`,
      message: `Your ${badgeName} badge has been upgraded to ${newTier} tier!`,
      actionUrl: `/users/me/badges`,
      priority: 'normal',
      relatedEntityId: badgeId,
      relatedEntityType: 'badge',
      metadata: {
        event: 'badge_tier_upgraded',
        badgeId,
        badgeName,
        newTier,
      },
    });
  }

  // ============================================================================
  // NOTIFICATION PREFERENCES
  // ============================================================================

  /**
   * Get user's notification preferences
   * Returns which notification types are enabled/disabled
   */
  static async getNotificationPreferences(userId: string): Promise<Record<string, boolean>> {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    // Default: all notifications enabled
    const defaultPreferences = {
      EVENT: true,
      MATCH: true,
      POINTS: true,
      MESSAGE: true,
      SYSTEM: true,
      VOUCH: true,
      SERVICE: true,
      MARKETPLACE: true,
      PAYMENT: true,
      SOCIAL: true,
      CONNECTION: true,
      ACHIEVEMENT: true,
      REMINDER: true,
      COMMUNITY: true,
      TRAVEL: true,
    };

    if (!prefs?.preferences || typeof prefs.preferences !== 'object') {
      return defaultPreferences;
    }

    // Merge with defaults to ensure all types are present
    return {
      ...defaultPreferences,
      ...(prefs.preferences as Record<string, boolean>),
    };
  }

  /**
   * Update user's notification preferences
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: Record<string, boolean>
  ): Promise<Record<string, boolean>> {
    // Get current preferences
    const current = await this.getNotificationPreferences(userId);

    // Merge with new preferences
    const updated = {
      ...current,
      ...preferences,
    };

    // Update in database (upsert to create if doesn't exist)
    await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        preferences: updated as any,
      },
      update: {
        preferences: updated as any,
      },
    });

    return updated;
  }

  /**
   * Check if user has a specific notification type enabled
   */
  static async isNotificationTypeEnabled(
    userId: string,
    notificationType: string
  ): Promise<boolean> {
    const preferences = await this.getNotificationPreferences(userId);
    return preferences[notificationType] !== false; // Default to true if not set
  }

  // ============================================================================
  // SUBSCRIPTION NOTIFICATIONS
  // ============================================================================

  /**
   * Notify user when subscription is activated
   */
  static async notifySubscriptionActivated(
    userId: string,
    tierName: string,
    expiresAt: Date
  ) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: '🎉 Subscription Activated',
      message: `Your ${tierName} subscription is now active! Enjoy your benefits until ${expiresAt.toLocaleDateString()}.`,
      actionUrl: null,
      priority: 'high',
      relatedEntityType: 'subscription',
      metadata: {
        event: 'subscription_activated',
        tierName,
        expiresAt: expiresAt.toISOString(),
      },
    });
  }

  /**
   * Notify user when subscription is canceled
   */
  static async notifySubscriptionCanceled(
    userId: string,
    tierName: string,
    endsAt: Date
  ) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: 'Subscription Canceled',
      message: `Your ${tierName} subscription has been canceled. You'll have access until ${endsAt.toLocaleDateString()}.`,
      actionUrl: null,
      priority: 'normal',
      relatedEntityType: 'subscription',
      metadata: {
        event: 'subscription_canceled',
        tierName,
        endsAt: endsAt.toISOString(),
      },
    });
  }

  /**
   * Notify user when subscription is expiring soon (7 days before)
   */
  static async notifySubscriptionExpiringSoon(
    userId: string,
    tierName: string,
    expiresAt: Date,
    daysLeft: number
  ) {
    return await this.createNotification({
      userId,
      type: 'REMINDER',
      title: '⏰ Subscription Expiring Soon',
      message: `Your ${tierName} subscription expires in ${daysLeft} days. Renew now to keep your benefits!`,
      actionUrl: '/subscription',
      priority: 'high',
      relatedEntityType: 'subscription',
      metadata: {
        event: 'subscription_expiring_soon',
        tierName,
        expiresAt: expiresAt.toISOString(),
        daysLeft,
      },
    });
  }

  /**
   * Notify user when subscription has expired
   */
  static async notifySubscriptionExpired(
    userId: string,
    tierName: string
  ) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: 'Subscription Expired',
      message: `Your ${tierName} subscription has expired. Renew to continue enjoying premium benefits.`,
      actionUrl: null,
      priority: 'high',
      relatedEntityType: 'subscription',
      metadata: {
        event: 'subscription_expired',
        tierName,
      },
    });
  }

  /**
   * Notify user when subscription is renewed
   */
  static async notifySubscriptionRenewed(
    userId: string,
    tierName: string,
    expiresAt: Date
  ) {
    return await this.createNotification({
      userId,
      type: 'SYSTEM',
      title: '✅ Subscription Renewed',
      message: `Your ${tierName} subscription has been renewed! Valid until ${expiresAt.toLocaleDateString()}.`,
      actionUrl: null,
      priority: 'normal',
      relatedEntityType: 'subscription',
      metadata: {
        event: 'subscription_renewed',
        tierName,
        expiresAt: expiresAt.toISOString(),
      },
    });
  }
}

