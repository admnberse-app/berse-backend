import { NotificationService } from '../../services/notification.service';
import { NotificationType } from '@prisma/client';
import logger from '../../utils/logger';

/**
 * BerseGuide Notification Helpers
 * Sends notifications for booking lifecycle and session events
 */

export class BerseGuideNotifications {
  /**
   * Notify guide of new booking request
   */
  static async notifyGuideOfNewRequest(guideId: string, travelerName: string, bookingId: string) {
    await NotificationService.createNotification({
      userId: guideId,
      type: NotificationType.TRAVEL,
      title: 'New Tour Request',
      message: `${travelerName} has requested a tour with you`,
      actionUrl: `/berseguide/bookings/${bookingId}`,
      priority: 'high',
      relatedEntityId: bookingId,
      relatedEntityType: 'berseguide_booking',
    });
    logger.info('Sent new BerseGuide request notification', { guideId, bookingId });
  }

  /**
   * Notify traveler that booking was approved
   */
  static async notifyTravelerOfApproval(travelerId: string, guideName: string, bookingId: string) {
    await NotificationService.createNotification({
      userId: travelerId,
      type: NotificationType.TRAVEL,
      title: 'Tour Request Approved!',
      message: `${guideName} approved your tour request`,
      actionUrl: `/berseguide/bookings/${bookingId}`,
      priority: 'high',
      relatedEntityId: bookingId,
      relatedEntityType: 'berseguide_booking',
    });
    logger.info('Sent BerseGuide approval notification', { travelerId, bookingId });
  }

  /**
   * Notify traveler that booking was rejected
   */
  static async notifyTravelerOfRejection(
    travelerId: string,
    guideName: string,
    bookingId: string,
    reason?: string
  ) {
    const message = reason
      ? `${guideName} declined your tour request: ${reason}`
      : `${guideName} declined your tour request`;

    await NotificationService.createNotification({
      userId: travelerId,
      type: NotificationType.TRAVEL,
      title: 'Tour Request Declined',
      message,
      actionUrl: `/berseguide/search`,
      priority: 'normal',
      relatedEntityId: bookingId,
      relatedEntityType: 'berseguide_booking',
    });
    logger.info('Sent BerseGuide rejection notification', { travelerId, bookingId });
  }

  /**
   * Notify both parties about cancellation
   */
  static async notifyOfCancellation(
    userId: string,
    cancelledBy: string,
    bookingId: string,
    isGuide: boolean
  ) {
    const title = isGuide ? 'Traveler Cancelled Tour' : 'Guide Cancelled Tour';
    const message = isGuide
      ? 'Your traveler has cancelled the tour'
      : 'Your guide has cancelled the tour';

    await NotificationService.createNotification({
      userId,
      type: NotificationType.TRAVEL,
      title,
      message,
      actionUrl: `/berseguide/bookings/${bookingId}`,
      priority: 'high',
      relatedEntityId: bookingId,
      relatedEntityType: 'berseguide_booking',
    });
    logger.info('Sent BerseGuide cancellation notification', { userId, bookingId });
  }

  /**
   * Remind about upcoming tour (24 hours before)
   */
  static async remindAboutUpcomingTour(
    userId: string,
    otherUserName: string,
    bookingId: string,
    isGuide: boolean
  ) {
    const message = isGuide
      ? `Reminder: Your tour with ${otherUserName} is tomorrow`
      : `Reminder: Your tour with guide ${otherUserName} is tomorrow`;

    await NotificationService.createNotification({
      userId,
      type: NotificationType.REMINDER,
      title: 'Upcoming Tour Reminder',
      message,
      actionUrl: `/berseguide/bookings/${bookingId}`,
      priority: 'normal',
      relatedEntityId: bookingId,
      relatedEntityType: 'berseguide_booking',
    });
    logger.info('Sent BerseGuide tour reminder', { userId, bookingId });
  }

  /**
   * Notify traveler that session has started
   */
  static async notifyTravelerOfSessionStart(
    travelerId: string,
    guideName: string,
    sessionId: string,
    bookingId: string
  ) {
    await NotificationService.createNotification({
      userId: travelerId,
      type: NotificationType.TRAVEL,
      title: 'Tour Started',
      message: `Your tour with ${guideName} has begun!`,
      actionUrl: `/berseguide/bookings/${bookingId}`,
      priority: 'normal',
      relatedEntityId: sessionId,
      relatedEntityType: 'berseguide_session',
    });
    logger.info('Sent BerseGuide session start notification', { travelerId, sessionId });
  }

  /**
   * Notify both parties that session ended
   */
  static async notifyOfSessionEnd(
    guideId: string,
    travelerId: string,
    sessionId: string,
    bookingId: string
  ) {
    // Notify guide
    await NotificationService.createNotification({
      userId: guideId,
      type: NotificationType.TRAVEL,
      title: 'Tour Completed',
      message: 'Your tour session has ended. Leave a review!',
      actionUrl: `/berseguide/bookings/${bookingId}/review`,
      priority: 'normal',
      relatedEntityId: sessionId,
      relatedEntityType: 'berseguide_session',
    });

    // Notify traveler
    await NotificationService.createNotification({
      userId: travelerId,
      type: NotificationType.TRAVEL,
      title: 'Tour Completed',
      message: 'Your tour has ended. Leave a review for your guide!',
      actionUrl: `/berseguide/bookings/${bookingId}/review`,
      priority: 'normal',
      relatedEntityId: sessionId,
      relatedEntityType: 'berseguide_session',
    });

    logger.info('Sent BerseGuide session end notifications', { guideId, travelerId, sessionId });
  }

  /**
   * Notify traveler of session update with photos
   */
  static async notifyOfSessionUpdate(
    travelerId: string,
    guideName: string,
    sessionId: string,
    updateType: 'photos' | 'locations' | 'notes'
  ) {
    const messages = {
      photos: `${guideName} added photos to your tour`,
      locations: `${guideName} updated tour locations`,
      notes: `${guideName} added notes to your tour`,
    };

    await NotificationService.createNotification({
      userId: travelerId,
      type: NotificationType.TRAVEL,
      title: 'Tour Update',
      message: messages[updateType],
      actionUrl: `/berseguide/sessions/${sessionId}`,
      priority: 'low',
      relatedEntityId: sessionId,
      relatedEntityType: 'berseguide_session',
    });
    logger.info('Sent BerseGuide session update notification', { travelerId, sessionId, updateType });
  }

  /**
   * Notify when review is received
   */
  static async notifyOfNewReview(
    userId: string,
    reviewerName: string,
    rating: number,
    reviewId: string
  ) {
    await NotificationService.createNotification({
      userId,
      type: NotificationType.SOCIAL,
      title: 'New BerseGuide Review',
      message: `${reviewerName} left you a ${rating}-star review`,
      actionUrl: `/berseguide/reviews/${reviewId}`,
      priority: 'normal',
      relatedEntityId: reviewId,
      relatedEntityType: 'berseguide_review',
    });
    logger.info('Sent BerseGuide review notification', { userId, reviewId });
  }

  /**
   * Remind to leave review (sent 24 hours after tour)
   */
  static async remindToLeaveReview(
    userId: string,
    otherUserName: string,
    bookingId: string,
    isGuide: boolean
  ) {
    const message = isGuide
      ? `Don't forget to review your traveler ${otherUserName}`
      : `Don't forget to review your guide ${otherUserName}`;

    await NotificationService.createNotification({
      userId,
      type: NotificationType.REMINDER,
      title: 'Review Reminder',
      message,
      actionUrl: `/berseguide/bookings/${bookingId}/review`,
      priority: 'low',
      relatedEntityId: bookingId,
      relatedEntityType: 'berseguide_booking',
    });
    logger.info('Sent BerseGuide review reminder', { userId, bookingId });
  }

  /**
   * Notify guide of high demand (when multiple requests received)
   */
  static async notifyOfHighDemand(guideId: string, requestCount: number) {
    await NotificationService.createNotification({
      userId: guideId,
      type: NotificationType.ACHIEVEMENT,
      title: 'Popular Guide!',
      message: `You have ${requestCount} pending tour requests`,
      actionUrl: `/berseguide/bookings/guide?status=PENDING`,
      priority: 'normal',
      relatedEntityType: 'berseguide_booking',
    });
    logger.info('Sent BerseGuide high demand notification', { guideId, requestCount });
  }
}
