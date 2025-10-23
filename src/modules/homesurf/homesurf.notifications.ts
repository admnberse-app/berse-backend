import { NotificationService } from '../../services/notification.service';
import { NotificationType } from '@prisma/client';
import logger from '../../utils/logger';

/**
 * HomeSurf Notification Helpers
 * Sends notifications for booking lifecycle events
 */

export class HomeSurfNotifications {
  /**
   * Notify host of new booking request
   */
  static async notifyHostOfNewRequest(hostId: string, guestName: string, bookingId: string) {
    await NotificationService.createNotification({
      userId: hostId,
      type: NotificationType.TRAVEL,
      title: 'New HomeSurf Request',
      message: `${guestName} has requested to stay at your place`,
      actionUrl: `/homesurf/bookings/${bookingId}`,
      priority: 'high',
      relatedEntityId: bookingId,
      relatedEntityType: 'homesurf_booking',
    });
    logger.info('Sent new HomeSurf request notification', { hostId, bookingId });
  }

  /**
   * Notify guest that booking was approved
   */
  static async notifyGuestOfApproval(guestId: string, hostName: string, bookingId: string) {
    await NotificationService.createNotification({
      userId: guestId,
      type: NotificationType.TRAVEL,
      title: 'HomeSurf Request Approved!',
      message: `${hostName} approved your stay request`,
      actionUrl: `/homesurf/bookings/${bookingId}`,
      priority: 'high',
      relatedEntityId: bookingId,
      relatedEntityType: 'homesurf_booking',
    });
    logger.info('Sent HomeSurf approval notification', { guestId, bookingId });
  }

  /**
   * Notify guest that booking was rejected
   */
  static async notifyGuestOfRejection(guestId: string, hostName: string, bookingId: string, reason?: string) {
    const message = reason 
      ? `${hostName} declined your stay request: ${reason}`
      : `${hostName} declined your stay request`;
      
    await NotificationService.createNotification({
      userId: guestId,
      type: NotificationType.TRAVEL,
      title: 'HomeSurf Request Declined',
      message,
      actionUrl: `/homesurf/search`,
      priority: 'normal',
      relatedEntityId: bookingId,
      relatedEntityType: 'homesurf_booking',
    });
    logger.info('Sent HomeSurf rejection notification', { guestId, bookingId });
  }

  /**
   * Notify both parties about cancellation
   */
  static async notifyOfCancellation(
    userId: string,
    cancelledBy: string,
    bookingId: string,
    isHost: boolean
  ) {
    const title = isHost ? 'Guest Cancelled Stay' : 'Host Cancelled Booking';
    const message = isHost
      ? 'Your guest has cancelled their stay'
      : 'Your host has cancelled the booking';

    await NotificationService.createNotification({
      userId,
      type: NotificationType.TRAVEL,
      title,
      message,
      actionUrl: `/homesurf/bookings/${bookingId}`,
      priority: 'high',
      relatedEntityId: bookingId,
      relatedEntityType: 'homesurf_booking',
    });
    logger.info('Sent HomeSurf cancellation notification', { userId, bookingId });
  }

  /**
   * Remind guest to check in
   */
  static async remindGuestToCheckIn(guestId: string, hostName: string, bookingId: string) {
    await NotificationService.createNotification({
      userId: guestId,
      type: NotificationType.REMINDER,
      title: 'Check-in Reminder',
      message: `Don't forget to check in at ${hostName}'s place!`,
      actionUrl: `/homesurf/bookings/${bookingId}`,
      priority: 'normal',
      relatedEntityId: bookingId,
      relatedEntityType: 'homesurf_booking',
    });
    logger.info('Sent HomeSurf check-in reminder', { guestId, bookingId });
  }

  /**
   * Notify host of guest check-in
   */
  static async notifyHostOfCheckIn(hostId: string, guestName: string, bookingId: string) {
    await NotificationService.createNotification({
      userId: hostId,
      type: NotificationType.TRAVEL,
      title: 'Guest Checked In',
      message: `${guestName} has checked in`,
      actionUrl: `/homesurf/bookings/${bookingId}`,
      priority: 'normal',
      relatedEntityId: bookingId,
      relatedEntityType: 'homesurf_booking',
    });
    logger.info('Sent HomeSurf check-in notification', { hostId, bookingId });
  }

  /**
   * Notify both parties after check-out
   */
  static async notifyAfterCheckOut(hostId: string, guestId: string, bookingId: string) {
    // Notify host
    await NotificationService.createNotification({
      userId: hostId,
      type: NotificationType.TRAVEL,
      title: 'Guest Checked Out',
      message: 'Your guest has checked out. Leave a review!',
      actionUrl: `/homesurf/bookings/${bookingId}/review`,
      priority: 'normal',
      relatedEntityId: bookingId,
      relatedEntityType: 'homesurf_booking',
    });

    // Notify guest
    await NotificationService.createNotification({
      userId: guestId,
      type: NotificationType.TRAVEL,
      title: 'Stay Completed',
      message: 'Your stay is complete. Leave a review for your host!',
      actionUrl: `/homesurf/bookings/${bookingId}/review`,
      priority: 'normal',
      relatedEntityId: bookingId,
      relatedEntityType: 'homesurf_booking',
    });
    
    logger.info('Sent HomeSurf check-out notifications', { hostId, guestId, bookingId });
  }

  /**
   * Notify when review is received
   */
  static async notifyOfNewReview(userId: string, reviewerName: string, rating: number, reviewId: string) {
    await NotificationService.createNotification({
      userId,
      type: NotificationType.SOCIAL,
      title: 'New HomeSurf Review',
      message: `${reviewerName} left you a ${rating}-star review`,
      actionUrl: `/homesurf/reviews/${reviewId}`,
      priority: 'normal',
      relatedEntityId: reviewId,
      relatedEntityType: 'homesurf_review',
    });
    logger.info('Sent HomeSurf review notification', { userId, reviewId });
  }

  /**
   * Remind to leave review (sent 24 hours after check-out)
   */
  static async remindToLeaveReview(userId: string, otherUserName: string, bookingId: string, isHost: boolean) {
    const message = isHost
      ? `Don't forget to review your guest ${otherUserName}`
      : `Don't forget to review your host ${otherUserName}`;

    await NotificationService.createNotification({
      userId,
      type: NotificationType.REMINDER,
      title: 'Review Reminder',
      message,
      actionUrl: `/homesurf/bookings/${bookingId}/review`,
      priority: 'low',
      relatedEntityId: bookingId,
      relatedEntityType: 'homesurf_booking',
    });
    logger.info('Sent HomeSurf review reminder', { userId, bookingId });
  }
}
