import { EventEmitter } from 'events';
import { PointsService } from './points.service';
import { BadgeService } from './badge.service';
import logger from '../utils/logger';
import { POINT_VALUES } from '../types';

/**
 * Centralized Points Event System
 * 
 * Usage in any module:
 * ```
 * import { pointsEvents } from '../services/points-events.service';
 * 
 * // Simple event
 * pointsEvents.emit('user.registered', userId);
 * 
 * // Event with context
 * pointsEvents.emit('event.attended', userId, { eventTitle: 'My Event', eventType: 'SPORTS' });
 * ```
 */

class PointsEventService extends EventEmitter {
  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // ============================================================================
    // REGISTRATION & PROFILE EVENTS
    // ============================================================================
    
    this.on('user.registered', async (userId: string) => {
      await this.awardPoints(userId, 'REGISTER', 'Welcome to Berse!');
    });

    this.on('user.email.verified', async (userId: string) => {
      await this.awardPoints(userId, 'VERIFY_EMAIL', 'Email verified');
    });

    this.on('user.phone.verified', async (userId: string) => {
      await this.awardPoints(userId, 'VERIFY_PHONE', 'Phone verified');
    });

    this.on('user.profile.photo.uploaded', async (userId: string) => {
      await this.awardPoints(userId, 'UPLOAD_PROFILE_PHOTO', 'Profile photo uploaded');
    });

    this.on('user.profile.basic.completed', async (userId: string) => {
      await this.awardPoints(userId, 'COMPLETE_PROFILE_BASIC', 'Basic profile completed');
    });

    this.on('user.profile.full.completed', async (userId: string) => {
      await this.awardPoints(userId, 'COMPLETE_PROFILE_FULL', 'Profile 100% complete');
    });

    // ============================================================================
    // EVENT PARTICIPATION
    // ============================================================================

    this.on('event.attended', async (userId: string, data?: { eventTitle?: string; eventType?: string }) => {
      // Determine point action based on event type
      let action: keyof typeof POINT_VALUES = 'ATTEND_EVENT';
      
      if (data?.eventType) {
        switch (data.eventType) {
          case 'TRIP':
            action = 'JOIN_TRIP';
            break;
          case 'CAFE_MEETUP':
            action = 'CAFE_MEETUP';
            break;
          case 'ILM':
            action = 'ILM_EVENT';
            break;
          case 'VOLUNTEER':
            action = 'VOLUNTEER';
            break;
          default:
            action = 'ATTEND_EVENT';
        }
      }

      await this.awardPoints(
        userId,
        action,
        data?.eventTitle ? `Attended: ${data.eventTitle}` : 'Attended event'
      );
    });

    this.on('event.hosted', async (userId: string, data?: { eventTitle?: string }) => {
      await this.awardPoints(
        userId,
        'HOST_EVENT',
        data?.eventTitle ? `Hosted: ${data.eventTitle}` : 'Hosted event'
      );
    });

    this.on('event.donated', async (userId: string, data?: { amount?: number }) => {
      await this.awardPoints(
        userId,
        'DONATE',
        data?.amount ? `Donated $${data.amount}` : 'Made a donation'
      );
    });

    // ============================================================================
    // CONNECTIONS & SOCIAL
    // ============================================================================

    // NOTE: Connections removed from point system (0 points)
    // Points only awarded for vouches and trust moments

    // ============================================================================
    // VOUCHING & TRUST
    // ============================================================================

    // NOTE: Giving a vouch doesn't earn points, only receiving vouches

    this.on('vouch.received', async (userId: string, data?: { voucherName?: string }) => {
      await this.awardPoints(
        userId,
        'RECEIVE_VOUCH',
        data?.voucherName ? `Received vouch from ${data.voucherName}` : 'Received a vouch'
      );
    });

    this.on('trust-moment.created', async (userId: string, data?: { receiverName?: string }) => {
      // Points for giving the trust moment
      await this.awardPoints(
        userId,
        'GIVE_TRUST_MOMENT',
        data?.receiverName ? `Gave trust moment to ${data.receiverName}` : 'Gave trust moment'
      );
    });

    this.on('trust-moment.received', async (userId: string, data?: { giverName?: string; rating?: number }) => {
      // Only award points for positive trust moments (rating 4-5)
      if (data?.rating && data.rating >= 4) {
        await this.awardPoints(
          userId,
          'RECEIVE_POSITIVE_TRUST_MOMENT',
          data?.giverName ? `Positive trust moment from ${data.giverName}` : 'Received positive trust moment'
        );
      }
    });

    // NOTE: Negative trust moments affect TRUST SCORE, not points
    // Handled in TrustScoreService

    // ============================================================================
    // COMMUNITY
    // ============================================================================

    this.on('community.joined', async (userId: string, data?: { communityName?: string }) => {
      await this.awardPoints(
        userId,
        'JOIN_COMMUNITY',
        data?.communityName ? `Joined: ${data.communityName}` : 'Joined a community'
      );
    });

    this.on('community.post.created', async (userId: string, data?: { communityName?: string }) => {
      await this.awardPoints(
        userId,
        'POST_IN_COMMUNITY',
        data?.communityName ? `Posted in: ${data.communityName}` : 'Posted in community'
      );
    });

    this.on('community.post.reacted', async (userId: string) => {
      await this.awardPoints(
        userId,
        'REACT_TO_COMMUNITY_POST',
        'Reacted to community post'
      );
    });

    // ============================================================================
    // REFERRALS
    // ============================================================================

    this.on('referral.successful', async (userId: string, data?: { refereeName?: string }) => {
      await this.awardPoints(
        userId,
        'REFERRAL',
        data?.refereeName ? `Referred ${data.refereeName}` : 'Successful referral'
      );
    });

    // ============================================================================
    // ============================================================================
    // CARD GAME (Topic Feedback)
    // ============================================================================

    this.on('cardgame.feedback.submitted', async (userId: string, data?: { topicName?: string }) => {
      await this.awardPoints(
        userId,
        'SUBMIT_TOPIC_FEEDBACK',
        data?.topicName ? `Feedback on: ${data.topicName}` : 'Submitted topic feedback'
      );
    });

    this.on('cardgame.feedback.helpful-vote', async (userId: string) => {
      await this.awardPoints(
        userId,
        'RECEIVE_HELPFUL_VOTE',
        'Received helpful vote on feedback'
      );
    });

    this.on('cardgame.feedback.replied', async (userId: string) => {
      await this.awardPoints(
        userId,
        'REPLY_TO_FEEDBACK',
        'Replied to feedback'
      );
    });

    // ============================================================================
    // MARKETPLACE
    // ============================================================================

    this.on('marketplace.listing.created', async (userId: string, data?: { title?: string }) => {
      await this.awardPoints(
        userId,
        'CREATE_LISTING',
        data?.title ? `Listed: ${data.title}` : 'Created marketplace listing'
      );
    });

    this.on('marketplace.order.created', async (userId: string, data?: { itemTitle?: string }) => {
      await this.awardPoints(
        userId,
        'PURCHASE_ITEM',
        data?.itemTitle ? `Purchased: ${data.itemTitle}` : 'Purchased item'
      );
    });

    this.on('marketplace.order.delivered', async (userId: string, data?: { itemTitle?: string }) => {
      await this.awardPoints(
        userId,
        'SELL_ITEM',
        data?.itemTitle ? `Sold: ${data.itemTitle}` : 'Sold item'
      );
    });

    this.on('marketplace.review.created', async (userId: string) => {
      await this.awardPoints(
        userId,
        'LEAVE_REVIEW',
        'Left marketplace review'
      );
    });

    this.on('marketplace.review.received', async (userId: string, data?: { rating?: number }) => {
      // Only award points for positive reviews (4-5 stars)
      if (data?.rating && data.rating >= 4) {
        await this.awardPoints(
          userId,
          'RECEIVE_POSITIVE_REVIEW',
          `Received ${data.rating}⭐ review`
        );
      }
    });

    // ============================================================================
    // BERSEGUIDE
    // ============================================================================

    this.on('berseguide.profile.created', async (userId: string, data?: { title?: string }) => {
      await this.awardPoints(
        userId,
        'BECOME_GUIDE',
        data?.title ? `Became guide: ${data.title}` : 'Became a BerseGuide'
      );
    });

    this.on('berseguide.booking.completed', async (userId: string, data?: { bookingId?: string }) => {
      await this.awardPoints(
        userId,
        'COMPLETE_GUIDE_SESSION',
        data?.bookingId ? `Completed booking: ${data.bookingId}` : 'Completed guide session'
      );
    });

    this.on('berseguide.review.received', async (userId: string, data?: { rating?: number }) => {
      await this.awardPoints(
        userId,
        'RECEIVE_GUIDE_REVIEW',
        data?.rating ? `Received ${data.rating}⭐ guide review` : 'Received guide review'
      );
    });

    this.on('berseguide.booking.created', async (userId: string, data?: { guideId?: string }) => {
      await this.awardPoints(
        userId,
        'BOOK_GUIDE_SESSION',
        data?.guideId ? `Booked session with guide ${data.guideId}` : 'Booked guide session'
      );
    });

    // ============================================================================
    // HOMESURF
    // ============================================================================

    this.on('homesurf.profile.created', async (userId: string, data?: { city?: string }) => {
      await this.awardPoints(
        userId,
        'LIST_HOME',
        data?.city ? `Listed home in ${data.city}` : 'Listed home on HomeSurf'
      );
    });

    this.on('homesurf.booking.completed', async (userId: string, data?: { role?: 'host' | 'traveler'; travelerName?: string; hostName?: string }) => {
      if (data?.role === 'host') {
        await this.awardPoints(
          userId,
          'HOST_TRAVELER',
          data?.travelerName ? `Hosted ${data.travelerName}` : 'Hosted a traveler'
        );
      } else if (data?.role === 'traveler') {
        await this.awardPoints(
          userId,
          'STAY_AS_TRAVELER',
          data?.hostName ? `Stayed with ${data.hostName}` : 'Stayed as traveler'
        );
      }
    });

    this.on('homesurf.review.created', async (userId: string) => {
      await this.awardPoints(
        userId,
        'LEAVE_HOST_REVIEW',
        'Left host review'
      );
    });

    this.on('homesurf.review.received', async (userId: string, data?: { rating?: number }) => {
      await this.awardPoints(
        userId,
        'RECEIVE_HOST_REVIEW',
        data?.rating ? `Received ${data.rating}⭐ host review` : 'Received host review'
      );
    });

    // ============================================================================
    // NOTE: Penalties (negative trust moments, reports, spam) affect TRUST SCORE,
    // not points. Points are only for positive rewards/redemption.
    // Trust score changes are handled in TrustScoreService.
    // ============================================================================
  }

  /**
   * Award points with error handling and logging
   */
  private async awardPoints(
    userId: string,
    action: keyof typeof POINT_VALUES,
    description?: string
  ): Promise<void> {
    try {
      await PointsService.awardPoints(userId, action, description);
      const points = POINT_VALUES[action];
      logger.info(`✅ Points awarded: ${points} points for ${action}`, {
        userId,
        action,
        points,
        description,
      });
      
      // Automatically check and award badges after any point-earning activity
      try {
        await BadgeService.checkAndAwardBadges(userId);
      } catch (badgeError) {
        logger.error(`❌ Failed to check badges after ${action}`, {
          userId,
          action,
          error: badgeError instanceof Error ? badgeError.message : 'Unknown error',
        });
        // Don't throw - badge checks should not break the main flow
      }
    } catch (error) {
      logger.error(`❌ Failed to award points for ${action}`, {
        userId,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw - point awards should not break the main flow
    }
  }

  /**
   * Emit a point-earning event
   * 
   * @example
   * pointsEvents.trigger('event.attended', userId, { eventTitle: 'My Event', eventType: 'SPORTS' });
   */
  trigger(event: string, userId: string, data?: any) {
    this.emit(event, userId, data);
  }
}

// Singleton instance
export const pointsEvents = new PointsEventService();

// Export event names for type safety
export const PointsEventNames = {
  // Registration & Profile
  USER_REGISTERED: 'user.registered',
  EMAIL_VERIFIED: 'user.email.verified',
  PHONE_VERIFIED: 'user.phone.verified',
  PROFILE_PHOTO_UPLOADED: 'user.profile.photo.uploaded',
  PROFILE_BASIC_COMPLETED: 'user.profile.basic.completed',
  PROFILE_FULL_COMPLETED: 'user.profile.full.completed',

  // Events
  EVENT_ATTENDED: 'event.attended',
  EVENT_HOSTED: 'event.hosted',
  EVENT_DONATED: 'event.donated',

  // Vouching & Trust
  VOUCH_RECEIVED: 'vouch.received',
  TRUST_MOMENT_CREATED: 'trust-moment.created',
  TRUST_MOMENT_RECEIVED: 'trust-moment.received',

  // Community
  COMMUNITY_JOINED: 'community.joined',
  COMMUNITY_POST_CREATED: 'community.post.created',
  COMMUNITY_POST_REACTED: 'community.post.reacted',

  // Referrals
  REFERRAL_SUCCESSFUL: 'referral.successful',

  // Card Game
  CARDGAME_FEEDBACK_SUBMITTED: 'cardgame.feedback.submitted',
  CARDGAME_FEEDBACK_HELPFUL_VOTE: 'cardgame.feedback.helpful-vote',
  CARDGAME_FEEDBACK_REPLIED: 'cardgame.feedback.replied',

  // Marketplace
  MARKETPLACE_LISTING_CREATED: 'marketplace.listing.created',
  MARKETPLACE_ORDER_CREATED: 'marketplace.order.created',
  MARKETPLACE_ORDER_DELIVERED: 'marketplace.order.delivered',
  MARKETPLACE_REVIEW_CREATED: 'marketplace.review.created',
  MARKETPLACE_REVIEW_RECEIVED: 'marketplace.review.received',

  // BerseGuide
  BERSEGUIDE_PROFILE_CREATED: 'berseguide.profile.created',
  BERSEGUIDE_BOOKING_COMPLETED: 'berseguide.booking.completed',
  BERSEGUIDE_REVIEW_RECEIVED: 'berseguide.review.received',
  BERSEGUIDE_BOOKING_CREATED: 'berseguide.booking.created',

  // HomeSurf
  HOMESURF_PROFILE_CREATED: 'homesurf.profile.created',
  HOMESURF_BOOKING_COMPLETED: 'homesurf.booking.completed',
  HOMESURF_REVIEW_CREATED: 'homesurf.review.created',
  HOMESURF_REVIEW_RECEIVED: 'homesurf.review.received',

  // NOTE: No penalty events - penalties affect trust score, not points
} as const;

export type PointsEventName = typeof PointsEventNames[keyof typeof PointsEventNames];
