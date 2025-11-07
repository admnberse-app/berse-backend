import { prisma } from '../config/database';
import logger from '../utils/logger';
import { Request } from 'express';
import crypto from 'crypto';

/**
 * Activity Types - categorized user actions
 */
export enum ActivityType {
  // Authentication
  AUTH_REGISTER = 'AUTH_REGISTER',
  AUTH_LOGIN = 'AUTH_LOGIN',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_LOGOUT_ALL = 'AUTH_LOGOUT_ALL',
  AUTH_TOKEN_REFRESH = 'AUTH_TOKEN_REFRESH',
  AUTH_PASSWORD_CHANGE = 'AUTH_PASSWORD_CHANGE',
  AUTH_PASSWORD_RESET_REQUEST = 'AUTH_PASSWORD_RESET_REQUEST',
  AUTH_PASSWORD_RESET_COMPLETE = 'AUTH_PASSWORD_RESET_COMPLETE',
  AUTH_EMAIL_VERIFY_REQUEST = 'AUTH_EMAIL_VERIFY_REQUEST',
  AUTH_EMAIL_VERIFY_COMPLETE = 'AUTH_EMAIL_VERIFY_COMPLETE',
  AUTH_MFA_ENABLE = 'AUTH_MFA_ENABLE',
  AUTH_MFA_DISABLE = 'AUTH_MFA_DISABLE',
  
  // Profile
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  PROFILE_PICTURE_UPDATE = 'PROFILE_PICTURE_UPDATE',
  PROFILE_VIEW = 'PROFILE_VIEW',
  PROFILE_DELETE = 'PROFILE_DELETE',
  
  // User
  USER_SEARCH = 'USER_SEARCH',
  USER_VIEW = 'USER_VIEW',
  USER_BLOCK = 'USER_BLOCK',
  USER_UNBLOCK = 'USER_UNBLOCK',
  USER_REPORT = 'USER_REPORT',
  
  // Connections
  CONNECTION_REQUEST_SEND = 'CONNECTION_REQUEST_SEND',
  CONNECTION_REQUEST_ACCEPT = 'CONNECTION_REQUEST_ACCEPT',
  CONNECTION_REQUEST_REJECT = 'CONNECTION_REQUEST_REJECT',
  CONNECTION_REMOVE = 'CONNECTION_REMOVE',
  CONNECTION_REVIEW = 'CONNECTION_REVIEW',
  
  // Events
  EVENT_CREATE = 'EVENT_CREATE',
  EVENT_UPDATE = 'EVENT_UPDATE',
  EVENT_DELETE = 'EVENT_DELETE',
  EVENT_VIEW = 'EVENT_VIEW',
  EVENT_RSVP = 'EVENT_RSVP',
  EVENT_CANCEL_RSVP = 'EVENT_CANCEL_RSVP',
  EVENT_CHECKIN = 'EVENT_CHECKIN',
  EVENT_TICKET_PURCHASE = 'EVENT_TICKET_PURCHASE',
  
  // Marketplace
  LISTING_CREATE = 'LISTING_CREATE',
  LISTING_UPDATE = 'LISTING_UPDATE',
  LISTING_DELETE = 'LISTING_DELETE',
  LISTING_VIEW = 'LISTING_VIEW',
  ORDER_CREATE = 'ORDER_CREATE',
  ORDER_PAYMENT_SUCCESS = 'ORDER_PAYMENT_SUCCESS',
  ORDER_PAYMENT_FAILED = 'ORDER_PAYMENT_FAILED',
  ORDER_CONFIRM = 'ORDER_CONFIRM',
  ORDER_SHIP = 'ORDER_SHIP',
  ORDER_DELIVER = 'ORDER_DELIVER',
  ORDER_CANCEL = 'ORDER_CANCEL',
  ORDER_COMPLETE = 'ORDER_COMPLETE',
  ORDER_REFUND = 'ORDER_REFUND',
  ORDER_DISPUTE = 'ORDER_DISPUTE',
  ORDER_REVIEW = 'ORDER_REVIEW',
  
  // Payments
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  PAYOUT_RECEIVED = 'PAYOUT_RECEIVED',
  PAYOUT_FAILED = 'PAYOUT_FAILED',
  
  // Points & Rewards
  POINTS_EARN = 'POINTS_EARN',
  POINTS_SPEND = 'POINTS_SPEND',
  REWARD_REDEEM = 'REWARD_REDEEM',
  
  // Notifications
  NOTIFICATION_SEND = 'NOTIFICATION_SEND',
  NOTIFICATION_READ = 'NOTIFICATION_READ',
  NOTIFICATION_DELETE = 'NOTIFICATION_DELETE',
  
  // Settings
  SETTINGS_UPDATE = 'SETTINGS_UPDATE',
  PRIVACY_SETTINGS_UPDATE = 'PRIVACY_SETTINGS_UPDATE',
  NOTIFICATION_SETTINGS_UPDATE = 'NOTIFICATION_SETTINGS_UPDATE',
  
  // Security
  SECURITY_DEVICE_REGISTER = 'SECURITY_DEVICE_REGISTER',
  SECURITY_DEVICE_REMOVE = 'SECURITY_DEVICE_REMOVE',
  SECURITY_SESSION_TERMINATE = 'SECURITY_SESSION_TERMINATE',
  SECURITY_SUSPICIOUS_LOGIN = 'SECURITY_SUSPICIOUS_LOGIN',
  SECURITY_ACCOUNT_LOCK = 'SECURITY_ACCOUNT_LOCK',
  SECURITY_ACCOUNT_UNLOCK = 'SECURITY_ACCOUNT_UNLOCK',
  
  // Admin
  ADMIN_USER_UPDATE = 'ADMIN_USER_UPDATE',
  ADMIN_USER_DELETE = 'ADMIN_USER_DELETE',
  ADMIN_USER_BAN = 'ADMIN_USER_BAN',
  ADMIN_USER_UNBAN = 'ADMIN_USER_UNBAN',
  ADMIN_CONFIG_UPDATE = 'ADMIN_CONFIG_UPDATE',
  
  // Card Game
  CARDGAME_SESSION_START = 'CARDGAME_SESSION_START',
  CARDGAME_SESSION_COMPLETE = 'CARDGAME_SESSION_COMPLETE',
  CARDGAME_FEEDBACK_SUBMIT = 'CARDGAME_FEEDBACK_SUBMIT',
  CARDGAME_FEEDBACK_UPVOTE = 'CARDGAME_FEEDBACK_UPVOTE',
  CARDGAME_REPLY_ADD = 'CARDGAME_REPLY_ADD',
  CARDGAME_REPLY_UPVOTE = 'CARDGAME_REPLY_UPVOTE',
  CARDGAME_NESTED_REPLY_ADD = 'CARDGAME_NESTED_REPLY_ADD',
}

/**
 * Security Event Severity Levels
 */
export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Activity Visibility
 */
export enum ActivityVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private',
}

interface ActivityLogOptions {
  userId: string;
  activityType: ActivityType;
  entityType?: string;
  entityId?: string;
  visibility?: ActivityVisibility;
  metadata?: Record<string, any>;
}

interface SecurityEventOptions {
  userId: string;
  eventType: string;
  severity?: SecuritySeverity;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

interface LoginAttemptOptions {
  userId?: string;
  identifier: string;
  success: boolean;
  failureReason?: string;
  ipAddress: string;
  userAgent?: string;
}

interface SessionOptions {
  userId: string;
  deviceInfo?: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  locationData?: Record<string, any>;
}

/**
 * Activity Logger Service
 * Centralized service for logging all user activities, security events, and sessions
 */
export class ActivityLoggerService {
  /**
   * Determine default visibility based on activity type
   */
  private static getDefaultVisibility(activityType: ActivityType): ActivityVisibility {
    // Public activities - shown to everyone
    const publicActivities = [
      ActivityType.EVENT_CREATE,
      ActivityType.EVENT_RSVP,
      ActivityType.CONNECTION_REQUEST_ACCEPT,
      ActivityType.PROFILE_UPDATE,
      ActivityType.PROFILE_PICTURE_UPDATE,
      ActivityType.LISTING_CREATE,
      ActivityType.POINTS_EARN,
    ];

    // Friends-only activities - shown to connections
    const friendsActivities = [
      ActivityType.EVENT_TICKET_PURCHASE,
      ActivityType.EVENT_CHECKIN,
      ActivityType.CONNECTION_REQUEST_SEND,
      ActivityType.ORDER_CREATE,
      ActivityType.ORDER_COMPLETE,
    ];

    if (publicActivities.includes(activityType)) {
      return ActivityVisibility.PUBLIC;
    } else if (friendsActivities.includes(activityType)) {
      return ActivityVisibility.FRIENDS;
    } else {
      return ActivityVisibility.PRIVATE;
    }
  }

  /**
   * Log user activity
   */
  static async logActivity(options: ActivityLogOptions): Promise<void> {
    try {
      await prisma.userActivity.create({
        data: {
          id: crypto.randomUUID(),
          userId: options.userId,
          activityType: options.activityType,
          entityType: options.entityType || 'unknown',
          entityId: options.entityId || '',
          visibility: options.visibility || this.getDefaultVisibility(options.activityType),
          createdAt: new Date(),
        },
      });

      // Log to application logger as well
      logger.info('User activity logged', {
        userId: options.userId,
        activityType: options.activityType,
        entityType: options.entityType,
        entityId: options.entityId,
      });
    } catch (error) {
      logger.error('Failed to log activity', { error, options });
    }
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(options: SecurityEventOptions): Promise<void> {
    try {
      await prisma.securityEvent.create({
        data: {
          id: crypto.randomUUID(),
          userId: options.userId,
          eventType: options.eventType,
          severity: options.severity || SecuritySeverity.MEDIUM,
          description: options.description,
          metadata: options.metadata || {},
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          createdAt: new Date(),
        },
      });

      // Log critical security events to application logger
      if (options.severity === SecuritySeverity.HIGH || options.severity === SecuritySeverity.CRITICAL) {
        logger.warn('Security event detected', {
          userId: options.userId,
          eventType: options.eventType,
          severity: options.severity,
          description: options.description,
        });
      }
    } catch (error) {
      logger.error('Failed to log security event', { error, options });
    }
  }

  /**
   * Log login attempt
   */
  static async logLoginAttempt(options: LoginAttemptOptions): Promise<void> {
    try {
      await prisma.loginAttempt.create({
        data: {
          id: crypto.randomUUID(),
          userId: options.userId,
          identifier: options.identifier,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          success: options.success,
          failureReason: options.failureReason,
          attemptedAt: new Date(),
        },
      });

      // Log failed attempts at higher severity
      if (!options.success) {
        logger.warn('Failed login attempt', {
          identifier: options.identifier,
          ipAddress: options.ipAddress,
          failureReason: options.failureReason,
        });

        // Log security event for failed login attempts
        if (options.userId) {
          await this.logSecurityEvent({
            userId: options.userId,
            eventType: 'LOGIN_FAILED',
            severity: SecuritySeverity.LOW,
            description: `Failed login attempt: ${options.failureReason}`,
            metadata: {
              identifier: options.identifier,
              failureReason: options.failureReason,
            },
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
          });
        }

        // Check for suspicious activity (multiple failed attempts)
        await this.checkForSuspiciousLoginActivity(options.identifier, options.ipAddress);
      } else {
        // Log security event for successful login
        if (options.userId) {
          await this.logSecurityEvent({
            userId: options.userId,
            eventType: 'LOGIN_SUCCESS',
            severity: SecuritySeverity.LOW,
            description: 'Successful login',
            metadata: {
              identifier: options.identifier,
            },
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to log login attempt', { error, options });
    }
  }

  /**
   * Create or update user session
   */
  static async createSession(options: SessionOptions): Promise<string> {
    try {
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      await prisma.userSession.create({
        data: {
          id: crypto.randomUUID(),
          userId: options.userId,
          sessionToken,
          deviceInfo: options.deviceInfo || {},
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          locationData: options.locationData,
          isActive: true,
          lastActivityAt: new Date(),
          expiresAt,
          createdAt: new Date(),
        },
      });

      logger.info('User session created', {
        userId: options.userId,
        ipAddress: options.ipAddress,
      });

      return sessionToken;
    } catch (error) {
      logger.error('Failed to create session', { error, options });
      throw error;
    }
  }

  /**
   * Update session last activity
   */
  static async updateSessionActivity(sessionToken: string): Promise<void> {
    try {
      await prisma.userSession.updateMany({
        where: {
          sessionToken,
          isActive: true,
        },
        data: {
          lastActivityAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to update session activity', { error, sessionToken });
    }
  }

  /**
   * Terminate session
   */
  static async terminateSession(sessionToken: string, userId?: string): Promise<void> {
    try {
      const where: any = { sessionToken };
      if (userId) where.userId = userId;

      await prisma.userSession.updateMany({
        where,
        data: {
          isActive: false,
        },
      });

      logger.info('User session terminated', { sessionToken, userId });
    } catch (error) {
      logger.error('Failed to terminate session', { error, sessionToken });
    }
  }

  /**
   * Terminate all user sessions
   */
  static async terminateAllUserSessions(userId: string): Promise<void> {
    try {
      await prisma.userSession.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      logger.info('All user sessions terminated', { userId });
    } catch (error) {
      logger.error('Failed to terminate all sessions', { error, userId });
    }
  }

  /**
   * Register device
   */
  static async registerDevice(
    userId: string,
    deviceFingerprint: string,
    deviceName: string | null,
    deviceInfo: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.deviceRegistration.upsert({
        where: {
          userId_deviceFingerprint: {
            userId,
            deviceFingerprint,
          },
        },
        update: {
          deviceName,
          deviceInfo,
          lastSeenAt: new Date(),
        },
        create: {
          id: crypto.randomUUID(),
          userId,
          deviceFingerprint,
          deviceName,
          deviceInfo,
          isTrusted: false,
          lastSeenAt: new Date(),
          createdAt: new Date(),
        },
      });

      logger.info('Device registered', { userId, deviceFingerprint });
    } catch (error) {
      logger.error('Failed to register device', { error, userId });
    }
  }

  /**
   * Check for suspicious login activity
   */
  private static async checkForSuspiciousLoginActivity(
    identifier: string,
    ipAddress: string
  ): Promise<void> {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Check failed attempts from same identifier
      const recentFailedAttempts = await prisma.loginAttempt.count({
        where: {
          identifier,
          success: false,
          attemptedAt: {
            gte: fifteenMinutesAgo,
          },
        },
      });

      // If more than 3 failed attempts in 15 minutes, log security event
      if (recentFailedAttempts >= 3) {
        logger.warn('Suspicious login activity detected', {
          identifier,
          ipAddress,
          failedAttempts: recentFailedAttempts,
        });

        // Try to find the user
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }, { phone: identifier }],
          },
        });

        if (user) {
          await this.logSecurityEvent({
            userId: user.id,
            eventType: 'BRUTE_FORCE_ATTEMPT',
            severity: SecuritySeverity.HIGH,
            description: `Multiple failed login attempts detected (${recentFailedAttempts} attempts in 15 minutes)`,
            metadata: {
              identifier,
              ipAddress,
              failedAttempts: recentFailedAttempts,
            },
            ipAddress,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to check for suspicious activity', { error });
    }
  }

  /**
   * Helper method to extract request metadata
   */
  static getRequestMetadata(req: Request) {
    return {
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      deviceInfo: {
        platform: req.get('x-platform') || 'unknown',
        appVersion: req.get('x-app-version') || 'unknown',
        os: req.get('x-os') || 'unknown',
        deviceId: req.get('x-device-id') || 'unknown',
      },
    };
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      const result = await prisma.userSession.updateMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      logger.info('Expired sessions cleaned up', { count: result.count });
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', { error });
    }
  }

  /**
   * Get user activity history
   */
  static async getUserActivityHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const activities = await prisma.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return activities;
    } catch (error) {
      logger.error('Failed to get user activity history', { error, userId });
      return [];
    }
  }

  /**
   * Get user security events
   */
  static async getUserSecurityEvents(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const events = await prisma.securityEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return events;
    } catch (error) {
      logger.error('Failed to get user security events', { error, userId });
      return [];
    }
  }

  /**
   * Get user active sessions
   */
  static async getUserActiveSessions(userId: string) {
    try {
      const sessions = await prisma.userSession.findMany({
        where: {
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: { lastActivityAt: 'desc' },
      });

      return sessions;
    } catch (error) {
      logger.error('Failed to get user active sessions', { error, userId });
      return [];
    }
  }

  /**
   * Get user login history
   */
  static async getUserLoginHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const attempts = await prisma.loginAttempt.findMany({
        where: { userId },
        orderBy: { attemptedAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return attempts;
    } catch (error) {
      logger.error('Failed to get user login history', { error, userId });
      return [];
    }
  }

  /**
   * Update last seen timestamp
   */
  static async updateLastSeen(userId: string): Promise<void> {
    try {
      await prisma.userSecurity.upsert({
        where: { userId },
        update: {
          lastSeenAt: new Date(),
        },
        create: {
          userId,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        } as any,
      });
    } catch (error) {
      logger.error('Failed to update last seen', { error, userId });
    }
  }

  /**
   * Update last login timestamp and location
   */
  static async updateLastLogin(
    userId: string,
    ipAddress: string,
    location?: string
  ): Promise<void> {
    try {
      await prisma.userSecurity.upsert({
        where: { userId },
        update: {
          lastLoginAt: new Date(),
          lastLoginLocation: location || ipAddress,
        },
        create: {
          userId,
          lastLoginAt: new Date(),
          lastLoginLocation: location || ipAddress,
          updatedAt: new Date(),
        } as any,
      });
    } catch (error) {
      logger.error('Failed to update last login', { error, userId });
    }
  }

  // ============= MARKETPLACE ACTIVITY HELPERS =============

  static async logMarketplaceOrderCreated(
    userId: string,
    orderId: string,
    listingId: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.ORDER_CREATE,
      entityType: 'marketplace_order',
      entityId: orderId,
      metadata: {
        listingId,
        amount,
        ...metadata,
      },
      // Will use smart default: FRIENDS
    });
  }

  static async logMarketplacePaymentSuccess(
    userId: string,
    orderId: string,
    transactionId: string,
    amount: number
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.ORDER_PAYMENT_SUCCESS,
      entityType: 'marketplace_order',
      entityId: orderId,
      metadata: {
        transactionId,
        amount,
      },
      // Will use smart default: PRIVATE
    });
  }

  static async logMarketplaceOrderShipped(
    sellerId: string,
    orderId: string,
    trackingNumber?: string
  ): Promise<void> {
    await this.logActivity({
      userId: sellerId,
      activityType: ActivityType.ORDER_SHIP,
      entityType: 'marketplace_order',
      entityId: orderId,
      metadata: { trackingNumber },
      // Will use smart default: PRIVATE
    });
  }

  static async logMarketplaceOrderCancelled(
    userId: string,
    orderId: string,
    reason?: string
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.ORDER_CANCEL,
      entityType: 'marketplace_order',
      entityId: orderId,
      metadata: { reason },
      // Will use smart default: PRIVATE
    });
  }

  // ============= EVENT TICKET ACTIVITY HELPERS =============

  static async logEventTicketPurchase(
    userId: string,
    eventId: string,
    ticketId: string,
    quantity: number,
    amount: number
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.EVENT_TICKET_PURCHASE,
      entityType: 'event_ticket',
      entityId: ticketId,
      metadata: {
        eventId,
        quantity,
        amount,
      },
      // Will use smart default: FRIENDS
    });
  }

  static async logEventCheckIn(
    userId: string,
    eventId: string,
    ticketId: string
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.EVENT_CHECKIN,
      entityType: 'event',
      entityId: eventId,
      metadata: { ticketId },
      // Will use smart default: FRIENDS
    });
  }

  // ============= PAYMENT ACTIVITY HELPERS =============

  static async logPayoutReceived(
    userId: string,
    payoutId: string,
    amount: number,
    sourceType: 'event' | 'marketplace',
    sourceId: string
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.PAYOUT_RECEIVED,
      entityType: 'payout',
      entityId: payoutId,
      metadata: {
        amount,
        sourceType,
        sourceId,
      },
      // Will use smart default: PRIVATE
    });
  }

  static async logRefundProcessed(
    userId: string,
    refundId: string,
    orderId: string,
    amount: number
  ): Promise<void> {
    await this.logActivity({
      userId,
      activityType: ActivityType.ORDER_REFUND,
      entityType: 'refund',
      entityId: refundId,
      metadata: {
        orderId,
        amount,
      },
      // Will use smart default: PRIVATE
    });
  }
}
