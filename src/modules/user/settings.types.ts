/**
 * User Settings Types
 * Manages user preferences, privacy, and notification settings
 */

export interface UserSettings {
  // Privacy Settings
  privacy: PrivacySettings;
  
  // Notification Settings
  notifications: NotificationSettings;
  
  // App Preferences
  preferences: AppPreferences;
  
  // Account Settings
  account: AccountSettings;
}

export interface PrivacySettings {
  // Profile Visibility
  profileVisibility: 'public' | 'connections' | 'private';
  
  // Location Privacy
  showLocation: boolean;
  locationPrecision: 'exact' | 'city' | 'country' | 'hidden';
  
  // Activity Privacy
  showLastSeen: boolean;
  showOnlineStatus: boolean;
  
  // Discovery Settings
  discoverableByUsername: boolean;
  discoverableByEmail: boolean;
  discoverableByPhone: boolean;
  
  // Content Visibility
  showTrustScore: boolean;
  showConnections: boolean;
  showCommunities: boolean;
  showEvents: boolean;
}

export interface NotificationSettings {
  // Push Notifications
  pushEnabled: boolean;
  
  // Email Notifications
  emailEnabled: boolean;
  emailDigestFrequency: 'realtime' | 'daily' | 'weekly' | 'never';
  
  // Notification Types
  connections: {
    requests: boolean;
    accepted: boolean;
    updates: boolean;
  };
  
  communities: {
    invites: boolean;
    posts: boolean;
    events: boolean;
    updates: boolean;
  };
  
  events: {
    invites: boolean;
    reminders: boolean;
    updates: boolean;
    cancellations: boolean;
  };
  
  messages: {
    direct: boolean;
    groups: boolean;
    mentions: boolean;
  };
  
  trust: {
    vouches: boolean;
    milestones: boolean;
    badgeEarned: boolean;
  };
  
  marketplace: {
    orders: boolean;
    messages: boolean;
    reviews: boolean;
  };
  
  subscriptions: {
    renewals: boolean;
    upgrades: boolean;
    features: boolean;
  };
}

export interface AppPreferences {
  // Language & Region
  language: string; // ISO 639-1 code (e.g., 'en', 'ms', 'zh')
  timezone: string; // IANA timezone (e.g., 'Asia/Kuala_Lumpur')
  
  // Display Preferences
  theme: 'light' | 'dark' | 'auto';
  currency: string; // ISO 4217 code (e.g., 'MYR', 'USD')
  distanceUnit: 'km' | 'miles';
  
  // App Behavior
  autoPlayVideos: boolean;
  dataUsageMode: 'normal' | 'saver';
  
  // Content Filters
  contentLanguages: string[]; // Preferred content languages
  showMatureContent: boolean;
}

export interface AccountSettings {
  // Security
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Login
  lastPasswordChange?: Date;
  activeSessions: number;
  
  // Data & Privacy
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  allowMarketing: boolean;
  
  // Account Status
  accountStatus: 'active' | 'suspended' | 'deactivated';
  deactivationScheduled?: Date;
}

export interface UpdateSettingsRequest {
  privacy?: Partial<PrivacySettings>;
  notifications?: Partial<NotificationSettings>;
  preferences?: Partial<AppPreferences>;
  account?: Partial<AccountSettings>;
}

export interface SettingsResponse {
  success: boolean;
  data: UserSettings;
  message?: string;
}
