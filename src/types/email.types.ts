export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
}

export enum EmailTemplate {
  VERIFICATION = 'verification',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGED = 'password_changed',
  EVENT_INVITATION = 'event_invitation',
  EVENT_CONFIRMATION = 'event_confirmation',
  EVENT_REMINDER = 'event_reminder',
  EVENT_CANCELLATION = 'event_cancellation',
  EVENT_UPDATE = 'event_update',
  MATCH_NOTIFICATION = 'match_notification',
  MESSAGE_NOTIFICATION = 'message_notification',
  POINTS_EARNED = 'points_earned',
  REWARD_AVAILABLE = 'reward_available',
  CAMPAIGN = 'campaign',
  NOTIFICATION = 'notification',
  // Account Management
  ACCOUNT_DEACTIVATED = 'account_deactivated',
  ACCOUNT_REACTIVATED = 'account_reactivated',
  ACCOUNT_DELETION_SCHEDULED = 'account_deletion_scheduled',
  ACCOUNT_DELETION_CANCELLED = 'account_deletion_cancelled',
  // Marketplace
  MARKETPLACE_ORDER_RECEIPT = 'marketplace_order_receipt',
  MARKETPLACE_NEW_ORDER = 'marketplace_new_order',
  MARKETPLACE_SHIPPED = 'marketplace_shipped',
  // Events/Tickets
  EVENT_TICKET_RECEIPT = 'event_ticket_receipt',
  EVENT_TICKET_CONFIRMATION = 'event_ticket_confirmation',
  EVENT_REMINDER_WITH_TICKET = 'event_reminder_with_ticket',
  // Payments
  REFUND_CONFIRMATION = 'refund_confirmation',
  PAYOUT_NOTIFICATION = 'payout_notification',
}

export enum EmailType {
  TRANSACTIONAL = 'transactional',
  MARKETING = 'marketing',
  NOTIFICATION = 'notification',
}

export interface BaseEmailData {
  userName?: string;
  userEmail?: string;
}

export interface VerificationEmailData extends BaseEmailData {
  verificationUrl: string;
  verificationCode?: string;
  expiresIn?: string;
}

export interface WelcomeEmailData extends BaseEmailData {
  userName: string;
  loginUrl?: string;
  exploreUrl?: string;
}

export interface PasswordResetEmailData extends BaseEmailData {
  resetUrl: string;
  resetCode?: string;
  expiresIn?: string;
}

export interface PasswordChangedEmailData extends BaseEmailData {
  changeDate: Date;
  ipAddress?: string;
  location?: string;
}

export interface EventEmailData extends BaseEmailData {
  eventTitle: string;
  eventDescription?: string;
  eventDate: Date | string;
  eventTime?: string;
  eventLocation: string;
  eventType?: string;
  mapLink?: string;
  hostName?: string;
  maxAttendees?: number;
  currentAttendees?: number;
  eventUrl?: string;
  rsvpUrl?: string;
  qrCode?: string;
  cancelUrl?: string;
}

export interface MatchNotificationEmailData extends BaseEmailData {
  matchedUserName: string;
  matchedUserBio?: string;
  matchedUserImage?: string;
  matchType: string;
  compatibility: number;
  viewMatchUrl: string;
}

export interface PointsEmailData extends BaseEmailData {
  pointsEarned: number;
  totalPoints: number;
  action: string;
  description?: string;
  viewPointsUrl?: string;
}

export interface RewardEmailData extends BaseEmailData {
  rewardTitle: string;
  rewardDescription: string;
  pointsRequired: number;
  userPoints: number;
  redeemUrl: string;
}

export interface CampaignEmailData extends BaseEmailData {
  subject: string;
  headline: string;
  content: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  preheader?: string;
  footerText?: string;
}

export interface NotificationEmailData extends BaseEmailData {
  subject: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export interface AccountDeactivatedEmailData extends BaseEmailData {
  userName: string;
  deactivationDate: Date;
  reason?: string;
  reactivateUrl: string;
  supportUrl?: string;
}

export interface AccountReactivatedEmailData extends BaseEmailData {
  userName: string;
  reactivationDate: Date;
  securityUrl?: string;
}

export interface AccountDeletionScheduledEmailData extends BaseEmailData {
  userName: string;
  deletionDate: Date;
  gracePeriodDays: number;
  cancelUrl: string;
  reason?: string;
  supportUrl?: string;
}

export interface AccountDeletionCancelledEmailData extends BaseEmailData {
  userName: string;
  cancellationDate: Date;
}

export interface TemplateRenderResult {
  html: string;
  text: string;
}
