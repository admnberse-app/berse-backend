import {
  AppConstantsResponse,
  ValidationRulesResponse,
  AppConfigResponse,
  EnumCategory,
  ValidationRule,
  FeatureConfig,
  LimitConfig,
  SettingConfig,
} from './constants.types';

/**
 * App Constants Service
 * Provides centralized access to enums, validation rules, and app configuration
 * for mobile clients to avoid hard-coding values
 */
class ConstantsService {
  private readonly version = '1.0.0';
  private readonly lastUpdated = new Date().toISOString();

  /**
   * Get all application enums
   */
  async getAllEnums(): Promise<AppConstantsResponse> {
    return {
      version: this.version,
      lastUpdated: this.lastUpdated,
      enums: {
        userRole: this.getUserRoleEnum(),
        userStatus: this.getUserStatusEnum(),
        connectionStatus: this.getConnectionStatusEnum(),
        vouchType: this.getVouchTypeEnum(),
        vouchStatus: this.getVouchStatusEnum(),
        eventType: this.getEventTypeEnum(),
        eventStatus: this.getEventStatusEnum(),
        eventParticipantStatus: this.getEventParticipantStatusEnum(),
        eventHostType: this.getEventHostTypeEnum(),
        notificationType: this.getNotificationTypeEnum(),
        paymentStatus: this.getPaymentStatusEnum(),
        transactionType: this.getTransactionTypeEnum(),
        listingStatus: this.getListingStatusEnum(),
        orderStatus: this.getOrderStatusEnum(),
        serviceType: this.getServiceTypeEnum(),
        pricingType: this.getPricingTypeEnum(),
        badgeType: this.getBadgeTypeEnum(),
        communityRole: this.getCommunityRoleEnum(),
        matchType: this.getMatchTypeEnum(),
        matchStatus: this.getMatchStatusEnum(),
        redemptionStatus: this.getRedemptionStatusEnum(),
        subscriptionStatus: this.getSubscriptionStatusEnum(),
        disputeStatus: this.getDisputeStatusEnum(),
        payoutStatus: this.getPayoutStatusEnum(),
        announcementPriority: this.getAnnouncementPriorityEnum(),
        appPlatform: this.getAppPlatformEnum(),
        legalDocumentType: this.getLegalDocumentTypeEnum(),
        maintenanceStatus: this.getMaintenanceStatusEnum(),
        eventTicketStatus: this.getEventTicketStatusEnum(),
        referralRewardStatus: this.getReferralRewardStatusEnum(),
      },
    };
  }

  /**
   * Get validation rules for common fields
   */
  async getValidationRules(): Promise<ValidationRulesResponse> {
    return {
      version: this.version,
      rules: {
        username: {
          field: 'username',
          type: 'string',
          required: false,
          minLength: 3,
          maxLength: 30,
          pattern: '^[a-zA-Z0-9_-]+$',
          description: 'Username must be 3-30 characters, alphanumeric with underscores and hyphens',
        },
        email: {
          field: 'email',
          type: 'email',
          required: true,
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Valid email address required',
        },
        phone: {
          field: 'phone',
          type: 'phone',
          required: false,
          pattern: '^\\+?[1-9]\\d{1,14}$',
          description: 'Phone number in E.164 format (e.g., +60123456789)',
        },
        password: {
          field: 'password',
          type: 'string',
          required: true,
          minLength: 8,
          maxLength: 128,
          description: 'Password must be at least 8 characters',
        },
        fullName: {
          field: 'fullName',
          type: 'string',
          required: true,
          minLength: 1,
          maxLength: 100,
          description: 'Full name is required',
        },
        displayName: {
          field: 'displayName',
          type: 'string',
          required: false,
          minLength: 1,
          maxLength: 50,
          description: 'Display name for profile',
        },
        bio: {
          field: 'bio',
          type: 'string',
          required: false,
          maxLength: 500,
          description: 'Profile bio (max 500 characters)',
        },
        shortBio: {
          field: 'shortBio',
          type: 'string',
          required: false,
          maxLength: 160,
          description: 'Short bio (max 160 characters)',
        },
        rating: {
          field: 'rating',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
          description: 'Rating must be between 1 and 5',
        },
        price: {
          field: 'price',
          type: 'number',
          required: true,
          min: 0,
          description: 'Price must be a positive number',
        },
        quantity: {
          field: 'quantity',
          type: 'number',
          required: false,
          min: 1,
          description: 'Quantity must be at least 1',
        },
      },
    };
  }

  /**
   * Get app configuration and limits
   */
  async getAppConfig(): Promise<AppConfigResponse> {
    return {
      version: this.version,
      features: {
        vouch: {
          enabled: true,
          description: 'Vouch system for trust building',
          metadata: {
            maxPrimaryVouches: 1,
            maxSecondaryVouches: 3,
            maxCommunityVouches: 2,
          },
        },
        marketplace: {
          enabled: true,
          description: 'Marketplace for buying and selling',
        },
        events: {
          enabled: true,
          description: 'Event creation and participation',
        },
        services: {
          enabled: true,
          description: 'Service bookings (guiding, hosting, etc)',
        },
        subscriptions: {
          enabled: true,
          description: 'Premium subscriptions',
        },
        gamification: {
          enabled: true,
          description: 'Points, badges, and rewards',
        },
      },
      limits: {
        maxImageUploadSize: {
          value: 5242880,
          description: 'Maximum image upload size',
          unit: 'bytes',
        },
        maxImagesPerListing: {
          value: 10,
          description: 'Maximum images per marketplace listing',
          unit: 'images',
        },
        maxEventImages: {
          value: 5,
          description: 'Maximum images per event',
          unit: 'images',
        },
        maxInterests: {
          value: 20,
          description: 'Maximum interests a user can select',
          unit: 'items',
        },
        maxLanguages: {
          value: 10,
          description: 'Maximum languages a user can specify',
          unit: 'items',
        },
        messageMaxLength: {
          value: 1000,
          description: 'Maximum message length',
          unit: 'characters',
        },
        bioMaxLength: {
          value: 500,
          description: 'Maximum bio length',
          unit: 'characters',
        },
        shortBioMaxLength: {
          value: 160,
          description: 'Maximum short bio length',
          unit: 'characters',
        },
      },
      settings: {
        defaultCurrency: {
          value: 'MYR',
          type: 'string',
          description: 'Default currency for transactions',
          options: ['MYR', 'SGD', 'USD', 'EUR', 'GBP'],
        },
        defaultTimezone: {
          value: 'Asia/Kuala_Lumpur',
          type: 'string',
          description: 'Default timezone',
        },
        defaultLanguage: {
          value: 'en',
          type: 'string',
          description: 'Default language',
          options: ['en', 'ms', 'zh', 'ta'],
        },
        supportedCountries: {
          value: ['MY', 'SG', 'ID', 'TH', 'PH', 'VN', 'BN'],
          type: 'array',
          description: 'Supported countries',
        },
        paginationDefaultLimit: {
          value: 20,
          type: 'number',
          description: 'Default pagination limit',
        },
        paginationMaxLimit: {
          value: 100,
          type: 'number',
          description: 'Maximum pagination limit',
        },
      },
    };
  }

  // Enum Helper Methods
  private getUserRoleEnum(): EnumCategory {
    return {
      category: 'User Role',
      description: 'User role types in the system',
      values: [
        { key: 'GENERAL_USER', value: 'GENERAL_USER', label: 'General User', description: 'Regular user' },
        { key: 'GUIDE', value: 'GUIDE', label: 'Guide', description: 'Certified guide' },
        { key: 'MODERATOR', value: 'MODERATOR', label: 'Moderator', description: 'Community moderator' },
        { key: 'ADMIN', value: 'ADMIN', label: 'Admin', description: 'System administrator' },
      ],
    };
  }

  private getUserStatusEnum(): EnumCategory {
    return {
      category: 'User Status',
      description: 'User account status',
      values: [
        { key: 'ACTIVE', value: 'ACTIVE', label: 'Active', description: 'Account is active' },
        { key: 'DEACTIVATED', value: 'DEACTIVATED', label: 'Deactivated', description: 'Account is deactivated' },
        { key: 'BANNED', value: 'BANNED', label: 'Banned', description: 'Account is banned' },
        { key: 'PENDING', value: 'PENDING', label: 'Pending', description: 'Account is pending verification' },
      ],
    };
  }

  private getConnectionStatusEnum(): EnumCategory {
    return {
      category: 'Connection Status',
      description: 'Status of user connections',
      values: [
        { key: 'PENDING', value: 'PENDING', label: 'Pending', description: 'Connection request pending' },
        { key: 'ACCEPTED', value: 'ACCEPTED', label: 'Accepted', description: 'Connection accepted' },
        { key: 'REJECTED', value: 'REJECTED', label: 'Rejected', description: 'Connection rejected' },
        { key: 'CANCELED', value: 'CANCELED', label: 'Canceled', description: 'Connection request canceled' },
        { key: 'REMOVED', value: 'REMOVED', label: 'Removed', description: 'Connection removed' },
      ],
    };
  }

  private getVouchTypeEnum(): EnumCategory {
    return {
      category: 'Vouch Type',
      description: 'Types of vouches in the trust system',
      values: [
        { key: 'PRIMARY', value: 'PRIMARY', label: 'Primary', description: 'Primary vouch (limited to 1)' },
        { key: 'SECONDARY', value: 'SECONDARY', label: 'Secondary', description: 'Secondary vouch (limited to 3)' },
        { key: 'COMMUNITY', value: 'COMMUNITY', label: 'Community', description: 'Community vouch (limited to 2)' },
      ],
    };
  }

  private getVouchStatusEnum(): EnumCategory {
    return {
      category: 'Vouch Status',
      description: 'Status of vouch requests',
      values: [
        { key: 'PENDING', value: 'PENDING', label: 'Pending', description: 'Vouch request pending' },
        { key: 'APPROVED', value: 'APPROVED', label: 'Approved', description: 'Vouch approved' },
        { key: 'ACTIVE', value: 'ACTIVE', label: 'Active', description: 'Vouch active and contributing to trust' },
        { key: 'REVOKED', value: 'REVOKED', label: 'Revoked', description: 'Vouch revoked' },
        { key: 'DECLINED', value: 'DECLINED', label: 'Declined', description: 'Vouch declined' },
      ],
    };
  }

  private getEventTypeEnum(): EnumCategory {
    return {
      category: 'Event Type',
      description: 'Types of events',
      values: [
        { key: 'SOCIAL', value: 'SOCIAL', label: 'Social', description: 'Social gathering' },
        { key: 'SPORTS', value: 'SPORTS', label: 'Sports', description: 'Sports activity' },
        { key: 'TRIP', value: 'TRIP', label: 'Trip', description: 'Travel trip' },
        { key: 'ILM', value: 'ILM', label: 'Knowledge', description: 'Knowledge sharing' },
        { key: 'CAFE_MEETUP', value: 'CAFE_MEETUP', label: 'Cafe Meetup', description: 'Cafe gathering' },
        { key: 'VOLUNTEER', value: 'VOLUNTEER', label: 'Volunteer', description: 'Volunteer work' },
        { key: 'MONTHLY_EVENT', value: 'MONTHLY_EVENT', label: 'Monthly Event', description: 'Monthly recurring event' },
        { key: 'LOCAL_TRIP', value: 'LOCAL_TRIP', label: 'Local Trip', description: 'Local area trip' },
      ],
    };
  }

  private getEventStatusEnum(): EnumCategory {
    return {
      category: 'Event Status',
      description: 'Status of events',
      values: [
        { key: 'DRAFT', value: 'DRAFT', label: 'Draft', description: 'Event is in draft' },
        { key: 'PUBLISHED', value: 'PUBLISHED', label: 'Published', description: 'Event is published' },
        { key: 'CANCELED', value: 'CANCELED', label: 'Canceled', description: 'Event is canceled' },
        { key: 'COMPLETED', value: 'COMPLETED', label: 'Completed', description: 'Event is completed' },
      ],
    };
  }

  private getEventParticipantStatusEnum(): EnumCategory {
    return {
      category: 'Event Participant Status',
      description: 'Status of event participants',
      values: [
        { key: 'REGISTERED', value: 'REGISTERED', label: 'Registered', description: 'Participant registered' },
        { key: 'CONFIRMED', value: 'CONFIRMED', label: 'Confirmed', description: 'Participation confirmed' },
        { key: 'CHECKED_IN', value: 'CHECKED_IN', label: 'Checked In', description: 'Participant checked in' },
        { key: 'CANCELED', value: 'CANCELED', label: 'Canceled', description: 'Participation canceled' },
        { key: 'NO_SHOW', value: 'NO_SHOW', label: 'No Show', description: 'Participant did not show up' },
      ],
    };
  }

  private getEventHostTypeEnum(): EnumCategory {
    return {
      category: 'Event Host Type',
      description: 'Type of event host',
      values: [
        { key: 'PERSONAL', value: 'PERSONAL', label: 'Personal', description: 'Hosted by individual' },
        { key: 'COMMUNITY', value: 'COMMUNITY', label: 'Community', description: 'Hosted by community' },
      ],
    };
  }

  private getNotificationTypeEnum(): EnumCategory {
    return {
      category: 'Notification Type',
      description: 'Types of notifications',
      values: [
        { key: 'EVENT', value: 'EVENT', label: 'Event', description: 'Event-related notifications' },
        { key: 'MATCH', value: 'MATCH', label: 'Match', description: 'Match-related notifications' },
        { key: 'POINTS', value: 'POINTS', label: 'Points', description: 'Points and rewards' },
        { key: 'MESSAGE', value: 'MESSAGE', label: 'Message', description: 'Direct messages' },
        { key: 'SYSTEM', value: 'SYSTEM', label: 'System', description: 'System notifications' },
        { key: 'VOUCH', value: 'VOUCH', label: 'Vouch', description: 'Vouch-related notifications' },
        { key: 'SERVICE', value: 'SERVICE', label: 'Service', description: 'Service bookings' },
        { key: 'MARKETPLACE', value: 'MARKETPLACE', label: 'Marketplace', description: 'Marketplace transactions' },
        { key: 'PAYMENT', value: 'PAYMENT', label: 'Payment', description: 'Payment notifications' },
        { key: 'SOCIAL', value: 'SOCIAL', label: 'Social', description: 'Social interactions' },
        { key: 'CONNECTION', value: 'CONNECTION', label: 'Connection', description: 'Connection requests' },
        { key: 'ACHIEVEMENT', value: 'ACHIEVEMENT', label: 'Achievement', description: 'Achievement unlocked' },
        { key: 'REMINDER', value: 'REMINDER', label: 'Reminder', description: 'Reminders' },
        { key: 'COMMUNITY', value: 'COMMUNITY', label: 'Community', description: 'Community activities' },
        { key: 'TRAVEL', value: 'TRAVEL', label: 'Travel', description: 'Travel-related notifications' },
      ],
    };
  }

  private getPaymentStatusEnum(): EnumCategory {
    return {
      category: 'Payment Status',
      description: 'Status of payments',
      values: [
        { key: 'PENDING', value: 'PENDING', label: 'Pending', description: 'Payment pending' },
        { key: 'PROCESSING', value: 'PROCESSING', label: 'Processing', description: 'Payment being processed' },
        { key: 'SUCCEEDED', value: 'SUCCEEDED', label: 'Succeeded', description: 'Payment successful' },
        { key: 'FAILED', value: 'FAILED', label: 'Failed', description: 'Payment failed' },
        { key: 'CANCELED', value: 'CANCELED', label: 'Canceled', description: 'Payment canceled' },
        { key: 'REFUNDED', value: 'REFUNDED', label: 'Refunded', description: 'Payment refunded' },
        { key: 'PARTIALLY_REFUNDED', value: 'PARTIALLY_REFUNDED', label: 'Partially Refunded', description: 'Payment partially refunded' },
      ],
    };
  }

  private getTransactionTypeEnum(): EnumCategory {
    return {
      category: 'Transaction Type',
      description: 'Types of transactions',
      values: [
        { key: 'EVENT_TICKET', value: 'EVENT_TICKET', label: 'Event Ticket', description: 'Event ticket purchase' },
        { key: 'MARKETPLACE_ORDER', value: 'MARKETPLACE_ORDER', label: 'Marketplace Order', description: 'Marketplace purchase' },
        { key: 'SUBSCRIPTION', value: 'SUBSCRIPTION', label: 'Subscription', description: 'Subscription payment' },
        { key: 'DONATION', value: 'DONATION', label: 'Donation', description: 'Donation' },
        { key: 'REFUND', value: 'REFUND', label: 'Refund', description: 'Refund transaction' },
      ],
    };
  }

  private getListingStatusEnum(): EnumCategory {
    return {
      category: 'Listing Status',
      description: 'Status of marketplace listings',
      values: [
        { key: 'DRAFT', value: 'DRAFT', label: 'Draft', description: 'Listing is in draft' },
        { key: 'ACTIVE', value: 'ACTIVE', label: 'Active', description: 'Listing is active' },
        { key: 'SOLD', value: 'SOLD', label: 'Sold', description: 'Listing is sold' },
        { key: 'EXPIRED', value: 'EXPIRED', label: 'Expired', description: 'Listing expired' },
        { key: 'REMOVED', value: 'REMOVED', label: 'Removed', description: 'Listing removed' },
      ],
    };
  }

  private getOrderStatusEnum(): EnumCategory {
    return {
      category: 'Order Status',
      description: 'Status of marketplace orders',
      values: [
        { key: 'CART', value: 'CART', label: 'Cart', description: 'Item in cart' },
        { key: 'PENDING', value: 'PENDING', label: 'Pending', description: 'Order pending' },
        { key: 'CONFIRMED', value: 'CONFIRMED', label: 'Confirmed', description: 'Order confirmed' },
        { key: 'SHIPPED', value: 'SHIPPED', label: 'Shipped', description: 'Order shipped' },
        { key: 'DELIVERED', value: 'DELIVERED', label: 'Delivered', description: 'Order delivered' },
        { key: 'CANCELED', value: 'CANCELED', label: 'Canceled', description: 'Order canceled' },
        { key: 'REFUNDED', value: 'REFUNDED', label: 'Refunded', description: 'Order refunded' },
        { key: 'DISPUTED', value: 'DISPUTED', label: 'Disputed', description: 'Order disputed' },
      ],
    };
  }

  private getServiceTypeEnum(): EnumCategory {
    return {
      category: 'Service Type',
      description: 'Types of services',
      values: [
        { key: 'TUTORING', value: 'TUTORING', label: 'Tutoring', description: 'Tutoring service' },
        { key: 'CONSULTATION', value: 'CONSULTATION', label: 'Consultation', description: 'Consultation service' },
        { key: 'TRANSPORT', value: 'TRANSPORT', label: 'Transport', description: 'Transportation service' },
        { key: 'HOME_SERVICES', value: 'HOME_SERVICES', label: 'Home Services', description: 'Home services' },
        { key: 'PROFESSIONAL', value: 'PROFESSIONAL', label: 'Professional', description: 'Professional services' },
        { key: 'WELLNESS', value: 'WELLNESS', label: 'Wellness', description: 'Wellness services' },
        { key: 'OTHER', value: 'OTHER', label: 'Other', description: 'Other service' },
      ],
    };
  }

  private getPricingTypeEnum(): EnumCategory {
    return {
      category: 'Pricing Type',
      description: 'Service pricing models',
      values: [
        { key: 'PER_HOUR', value: 'PER_HOUR', label: 'Per Hour', description: 'Charged per hour' },
        { key: 'PER_DAY', value: 'PER_DAY', label: 'Per Day', description: 'Charged per day' },
        { key: 'PER_PERSON', value: 'PER_PERSON', label: 'Per Person', description: 'Charged per person' },
        { key: 'PER_SESSION', value: 'PER_SESSION', label: 'Per Session', description: 'Charged per session' },
        { key: 'FIXED', value: 'FIXED', label: 'Fixed', description: 'Fixed price' },
      ],
    };
  }

  private getBadgeTypeEnum(): EnumCategory {
    return {
      category: 'Badge Type',
      description: 'Achievement badges',
      values: [
        { key: 'FIRST_FACE', value: 'FIRST_FACE', label: 'First Face', description: 'First connection made' },
        { key: 'CAFE_FRIEND', value: 'CAFE_FRIEND', label: 'Cafe Friend', description: 'Attended cafe meetup' },
        { key: 'SUKAN_SQUAD_MVP', value: 'SUKAN_SQUAD_MVP', label: 'Sukan Squad MVP', description: 'Sports event MVP' },
        { key: 'SOUL_NOURISHER', value: 'SOUL_NOURISHER', label: 'Soul Nourisher', description: 'Attended spiritual events' },
        { key: 'HELPERS_HAND', value: 'HELPERS_HAND', label: "Helper's Hand", description: 'Volunteer work' },
        { key: 'CONNECTOR', value: 'CONNECTOR', label: 'Connector', description: 'Many connections' },
        { key: 'TOP_FRIEND', value: 'TOP_FRIEND', label: 'Top Friend', description: 'High trust score' },
        { key: 'ICEBREAKER', value: 'ICEBREAKER', label: 'Icebreaker', description: 'First event hosted' },
        { key: 'CERTIFIED_HOST', value: 'CERTIFIED_HOST', label: 'Certified Host', description: 'Hosted multiple events' },
        { key: 'STREAK_CHAMP', value: 'STREAK_CHAMP', label: 'Streak Champ', description: 'Activity streak' },
        { key: 'LOCAL_GUIDE', value: 'LOCAL_GUIDE', label: 'Local Guide', description: 'Certified guide' },
        { key: 'KIND_SOUL', value: 'KIND_SOUL', label: 'Kind Soul', description: 'Received many vouches' },
        { key: 'KNOWLEDGE_SHARER', value: 'KNOWLEDGE_SHARER', label: 'Knowledge Sharer', description: 'Hosted knowledge events' },
        { key: 'ALL_ROUNDER', value: 'ALL_ROUNDER', label: 'All Rounder', description: 'Participated in all event types' },
      ],
    };
  }

  private getCommunityRoleEnum(): EnumCategory {
    return {
      category: 'Community Role',
      description: 'Roles within communities',
      values: [
        { key: 'MEMBER', value: 'MEMBER', label: 'Member', description: 'Community member' },
        { key: 'MODERATOR', value: 'MODERATOR', label: 'Moderator', description: 'Community moderator' },
        { key: 'ADMIN', value: 'ADMIN', label: 'Admin', description: 'Community admin' },
        { key: 'OWNER', value: 'OWNER', label: 'Owner', description: 'Community owner' },
      ],
    };
  }

  private getMatchTypeEnum(): EnumCategory {
    return {
      category: 'Match Type',
      description: 'Types of matches for activities',
      values: [
        { key: 'SPORTS', value: 'SPORTS', label: 'Sports', description: 'Sports activity match' },
        { key: 'SOCIAL', value: 'SOCIAL', label: 'Social', description: 'Social activity match' },
        { key: 'VOLUNTEER', value: 'VOLUNTEER', label: 'Volunteer', description: 'Volunteer activity match' },
        { key: 'STUDY', value: 'STUDY', label: 'Study', description: 'Study group match' },
        { key: 'PROFESSIONAL', value: 'PROFESSIONAL', label: 'Professional', description: 'Professional networking' },
        { key: 'HOBBY', value: 'HOBBY', label: 'Hobby', description: 'Hobby-based match' },
      ],
    };
  }

  private getMatchStatusEnum(): EnumCategory {
    return {
      category: 'Match Status',
      description: 'Status of match requests',
      values: [
        { key: 'PENDING', value: 'PENDING', label: 'Pending', description: 'Match pending' },
        { key: 'ACCEPTED', value: 'ACCEPTED', label: 'Accepted', description: 'Match accepted' },
        { key: 'REJECTED', value: 'REJECTED', label: 'Rejected', description: 'Match rejected' },
        { key: 'EXPIRED', value: 'EXPIRED', label: 'Expired', description: 'Match expired' },
      ],
    };
  }

  private getRedemptionStatusEnum(): EnumCategory {
    return {
      category: 'Redemption Status',
      description: 'Status of reward redemptions',
      values: [
        { key: 'PENDING', value: 'PENDING', label: 'Pending', description: 'Redemption pending' },
        { key: 'APPROVED', value: 'APPROVED', label: 'Approved', description: 'Redemption approved' },
        { key: 'REJECTED', value: 'REJECTED', label: 'Rejected', description: 'Redemption rejected' },
      ],
    };
  }

  private getSubscriptionStatusEnum(): EnumCategory {
    return {
      category: 'Subscription Status',
      description: 'Status of subscriptions',
      values: [
        { key: 'ACTIVE', value: 'ACTIVE', label: 'Active', description: 'Subscription active' },
        { key: 'TRIALING', value: 'TRIALING', label: 'Trialing', description: 'In trial period' },
        { key: 'PAST_DUE', value: 'PAST_DUE', label: 'Past Due', description: 'Payment past due' },
        { key: 'CANCELED', value: 'CANCELED', label: 'Canceled', description: 'Subscription canceled' },
        { key: 'EXPIRED', value: 'EXPIRED', label: 'Expired', description: 'Subscription expired' },
        { key: 'PAUSED', value: 'PAUSED', label: 'Paused', description: 'Subscription paused' },
        { key: 'INCOMPLETE', value: 'INCOMPLETE', label: 'Incomplete', description: 'Setup incomplete' },
      ],
    };
  }

  private getDisputeStatusEnum(): EnumCategory {
    return {
      category: 'Dispute Status',
      description: 'Status of disputes',
      values: [
        { key: 'OPEN', value: 'OPEN', label: 'Open', description: 'Dispute opened' },
        { key: 'UNDER_REVIEW', value: 'UNDER_REVIEW', label: 'Under Review', description: 'Dispute under review' },
        { key: 'RESOLVED', value: 'RESOLVED', label: 'Resolved', description: 'Dispute resolved' },
        { key: 'CLOSED', value: 'CLOSED', label: 'Closed', description: 'Dispute closed' },
      ],
    };
  }

  private getPayoutStatusEnum(): EnumCategory {
    return {
      category: 'Payout Status',
      description: 'Status of payouts',
      values: [
        { key: 'PENDING', value: 'PENDING', label: 'Pending', description: 'Ready for processing/release' },
        { key: 'PROCESSING', value: 'PROCESSING', label: 'Processing', description: 'Being processed by payment gateway' },
        { key: 'PAID', value: 'PAID', label: 'Paid', description: 'Successfully paid out' },
        { key: 'RELEASED', value: 'RELEASED', label: 'Released', description: 'Successfully paid out (alias)' },
        { key: 'HELD', value: 'HELD', label: 'Held', description: 'In escrow, waiting for release conditions' },
        { key: 'FROZEN', value: 'FROZEN', label: 'Frozen', description: 'Frozen due to dispute or investigation' },
        { key: 'FAILED', value: 'FAILED', label: 'Failed', description: 'Payout attempt failed' },
        { key: 'CANCELED', value: 'CANCELED', label: 'Canceled', description: 'Payout canceled (refunded to buyer)' },
      ],
    };
  }

  private getAnnouncementPriorityEnum(): EnumCategory {
    return {
      category: 'Announcement Priority',
      description: 'Priority levels for announcements',
      values: [
        { key: 'LOW', value: 'LOW', label: 'Low', description: 'Low priority' },
        { key: 'NORMAL', value: 'NORMAL', label: 'Normal', description: 'Normal priority' },
        { key: 'HIGH', value: 'HIGH', label: 'High', description: 'High priority' },
        { key: 'URGENT', value: 'URGENT', label: 'Urgent', description: 'Urgent announcement' },
      ],
    };
  }

  private getAppPlatformEnum(): EnumCategory {
    return {
      category: 'App Platform',
      description: 'Supported app platforms',
      values: [
        { key: 'IOS', value: 'IOS', label: 'iOS', description: 'iOS platform' },
        { key: 'ANDROID', value: 'ANDROID', label: 'Android', description: 'Android platform' },
        { key: 'WEB', value: 'WEB', label: 'Web', description: 'Web platform' },
      ],
    };
  }

  private getLegalDocumentTypeEnum(): EnumCategory {
    return {
      category: 'Legal Document Type',
      description: 'Types of legal documents',
      values: [
        { key: 'TOS', value: 'TOS', label: 'Terms of Service', description: 'Terms of Service' },
        { key: 'PRIVACY_POLICY', value: 'PRIVACY_POLICY', label: 'Privacy Policy', description: 'Privacy Policy' },
        { key: 'EULA', value: 'EULA', label: 'EULA', description: 'End User License Agreement' },
        { key: 'COOKIE_POLICY', value: 'COOKIE_POLICY', label: 'Cookie Policy', description: 'Cookie Policy' },
        { key: 'COMMUNITY_GUIDELINES', value: 'COMMUNITY_GUIDELINES', label: 'Community Guidelines', description: 'Community Guidelines' },
        { key: 'REFUND_POLICY', value: 'REFUND_POLICY', label: 'Refund Policy', description: 'Refund Policy' },
        { key: 'ACCEPTABLE_USE', value: 'ACCEPTABLE_USE', label: 'Acceptable Use', description: 'Acceptable Use Policy' },
      ],
    };
  }

  private getMaintenanceStatusEnum(): EnumCategory {
    return {
      category: 'Maintenance Status',
      description: 'Status of maintenance schedules',
      values: [
        { key: 'SCHEDULED', value: 'SCHEDULED', label: 'Scheduled', description: 'Maintenance scheduled' },
        { key: 'IN_PROGRESS', value: 'IN_PROGRESS', label: 'In Progress', description: 'Maintenance in progress' },
        { key: 'COMPLETED', value: 'COMPLETED', label: 'Completed', description: 'Maintenance completed' },
        { key: 'CANCELLED', value: 'CANCELLED', label: 'Cancelled', description: 'Maintenance cancelled' },
        { key: 'DELAYED', value: 'DELAYED', label: 'Delayed', description: 'Maintenance delayed' },
      ],
    };
  }

  private getEventTicketStatusEnum(): EnumCategory {
    return {
      category: 'Event Ticket Status',
      description: 'Status of event tickets',
      values: [
        { key: 'PENDING', value: 'PENDING', label: 'Pending', description: 'Ticket pending' },
        { key: 'CONFIRMED', value: 'CONFIRMED', label: 'Confirmed', description: 'Ticket confirmed' },
        { key: 'CHECKED_IN', value: 'CHECKED_IN', label: 'Checked In', description: 'Ticket used for check-in' },
        { key: 'CANCELED', value: 'CANCELED', label: 'Canceled', description: 'Ticket canceled' },
        { key: 'REFUNDED', value: 'REFUNDED', label: 'Refunded', description: 'Ticket refunded' },
        { key: 'EXPIRED', value: 'EXPIRED', label: 'Expired', description: 'Ticket expired' },
      ],
    };
  }

  private getReferralRewardStatusEnum(): EnumCategory {
    return {
      category: 'Referral Reward Status',
      description: 'Status of referral rewards',
      values: [
        { key: 'PENDING', value: 'PENDING', label: 'Pending', description: 'Reward pending' },
        { key: 'APPROVED', value: 'APPROVED', label: 'Approved', description: 'Reward approved' },
        { key: 'AWARDED', value: 'AWARDED', label: 'Awarded', description: 'Reward awarded' },
        { key: 'CLAIMED', value: 'CLAIMED', label: 'Claimed', description: 'Reward claimed' },
        { key: 'EXPIRED', value: 'EXPIRED', label: 'Expired', description: 'Reward expired' },
        { key: 'CANCELED', value: 'CANCELED', label: 'Canceled', description: 'Reward canceled' },
      ],
    };
  }
}

export default new ConstantsService();
