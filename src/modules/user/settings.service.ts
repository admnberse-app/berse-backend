import prisma from '../../config/database';
import { UserSettings, UpdateSettingsRequest, PrivacySettings, NotificationSettings, AppPreferences, AccountSettings } from './settings.types';

class SettingsService {
  /**
   * Get user settings by aggregating from existing tables
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    const [user, privacy, preferences, notificationPrefs, security] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          phone: true,
          status: true,
        }
      }),
      prisma.userPrivacy.findUnique({ where: { userId } }),
      prisma.userPreference.findUnique({ where: { userId } }),
      prisma.notificationPreference.findUnique({ where: { userId } }),
      prisma.userSecurity.findUnique({ where: { userId } })
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    // Create defaults if not exist
    const privacySettings = privacy || await this.createDefaultPrivacy(userId);
    const preferencesData = preferences || await this.createDefaultPreferences(userId);
    const notificationData = notificationPrefs || await this.createDefaultNotifications(userId);
    const securityData = security || await this.createDefaultSecurity(userId);

    return this.formatSettings(user, privacySettings, preferencesData, notificationData, securityData);
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId: string, updates: UpdateSettingsRequest): Promise<UserSettings> {
    const updatePromises: Promise<any>[] = [];

    // Update privacy settings
    if (updates.privacy) {
      updatePromises.push(
        prisma.userPrivacy.upsert({
          where: { userId },
          create: {
            userId,
            ...updates.privacy
          },
          update: updates.privacy
        })
      );
    }

    // Update notification settings
    if (updates.notifications) {
      const { pushEnabled, emailEnabled, ...notificationTypes } = updates.notifications as any;
      
      updatePromises.push(
        prisma.notificationPreference.upsert({
          where: { userId },
          create: {
            userId,
            pushEnabled: pushEnabled ?? true,
            emailEnabled: emailEnabled ?? true,
            preferences: notificationTypes
          },
          update: {
            ...(pushEnabled !== undefined && { pushEnabled }),
            ...(emailEnabled !== undefined && { emailEnabled }),
            ...(Object.keys(notificationTypes).length > 0 && {
              preferences: notificationTypes
            })
          }
        })
      );
    }

    // Update app preferences
    if (updates.preferences) {
      updatePromises.push(
        prisma.userPreference.upsert({
          where: { userId },
          create: {
            userId,
            darkMode: updates.preferences.theme === 'dark',
            preferences: updates.preferences
          },
          update: {
            ...(updates.preferences.theme && {
              darkMode: updates.preferences.theme === 'dark'
            }),
            preferences: updates.preferences
          }
        })
      );
    }

    // Update account/security settings
    if (updates.account) {
      const securityUpdates: any = {};
      
      if (updates.account.twoFactorEnabled !== undefined) {
        securityUpdates.mfaEnabled = updates.account.twoFactorEnabled;
      }
      
      if (Object.keys(securityUpdates).length > 0) {
        updatePromises.push(
          prisma.userSecurity.upsert({
            where: { userId },
            create: {
              userId,
              ...securityUpdates
            },
            update: securityUpdates
          })
        );
      }

      // Update privacy for data consent flags
      const privacyUpdates: any = {};
      if (updates.account.allowAnalytics !== undefined) {
        privacyUpdates.consentToDataProcessing = updates.account.allowAnalytics;
      }
      if (updates.account.allowMarketing !== undefined) {
        privacyUpdates.consentToMarketing = updates.account.allowMarketing;
      }
      
      if (Object.keys(privacyUpdates).length > 0) {
        updatePromises.push(
          prisma.userPrivacy.update({
            where: { userId },
            data: privacyUpdates
          }).catch(() => {
            // If doesn't exist, create it
            return prisma.userPrivacy.create({
              data: {
                userId,
                ...privacyUpdates
              }
            });
          })
        );
      }
    }

    await Promise.all(updatePromises);

    return this.getUserSettings(userId);
  }

  /**
   * Create default privacy settings
   */
  private async createDefaultPrivacy(userId: string) {
    return await prisma.userPrivacy.create({
      data: {
        userId,
        profileVisibility: 'public',
        searchableByPhone: true,
        searchableByEmail: true,
        showLocation: true,
        locationPrecision: 'city',
        searchableByUsername: true,
        allowDirectMessages: true,
        consentToDataProcessing: true,
        consentToMarketing: false
      }
    });
  }

  /**
   * Create default preferences
   */
  private async createDefaultPreferences(userId: string) {
    return await prisma.userPreference.create({
      data: {
        userId,
        darkMode: false,
        preferences: {
          language: 'en',
          timezone: 'Asia/Kuala_Lumpur',
          theme: 'auto',
          currency: 'MYR',
          distanceUnit: 'km',
          autoPlayVideos: true,
          dataUsageMode: 'normal',
          contentLanguages: ['en'],
          showMatureContent: false
        }
      }
    });
  }

  /**
   * Create default notification preferences
   */
  private async createDefaultNotifications(userId: string) {
    return await prisma.notificationPreference.create({
      data: {
        userId,
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
        timezone: 'Asia/Kuala_Lumpur',
        preferences: {
          emailDigestFrequency: 'daily',
          connections: { requests: true, accepted: true, updates: true },
          communities: { invites: true, posts: true, events: true, updates: true },
          events: { invites: true, reminders: true, updates: true, cancellations: true },
          messages: { direct: true, groups: true, mentions: true },
          trust: { vouches: true, milestones: true, badgeEarned: true },
          marketplace: { orders: true, messages: true, reviews: true },
          subscriptions: { renewals: true, upgrades: true, features: true }
        }
      }
    });
  }

  /**
   * Create default security settings
   */
  private async createDefaultSecurity(userId: string) {
    return await prisma.userSecurity.create({
      data: {
        userId,
        mfaEnabled: false
      }
    });
  }

  /**
   * Format settings for response
   */
  private formatSettings(
    user: any,
    privacy: any,
    preferences: any,
    notifications: any,
    security: any
  ): UserSettings {
    const prefsJson = preferences.preferences as any || {};
    const notifsJson = notifications.preferences as any || {};

    return {
      privacy: {
        profileVisibility: privacy.profileVisibility || 'public',
        showLocation: privacy.showLocation ?? true,
        locationPrecision: privacy.locationPrecision || 'city',
        showLastSeen: true,
        showOnlineStatus: true,
        discoverableByUsername: privacy.searchableByUsername ?? true,
        discoverableByEmail: privacy.searchableByEmail ?? true,
        discoverableByPhone: privacy.searchableByPhone ?? false,
        showTrustScore: true,
        showConnections: true,
        showCommunities: true,
        showEvents: true
      } as PrivacySettings,
      
      notifications: {
        pushEnabled: notifications.pushEnabled || true,
        emailEnabled: notifications.emailEnabled || true,
        emailDigestFrequency: notifsJson.emailDigestFrequency || 'daily',
        connections: notifsJson.connections || { requests: true, accepted: true, updates: true },
        communities: notifsJson.communities || { invites: true, posts: true, events: true, updates: true },
        events: notifsJson.events || { invites: true, reminders: true, updates: true, cancellations: true },
        messages: notifsJson.messages || { direct: true, groups: true, mentions: true },
        trust: notifsJson.trust || { vouches: true, milestones: true, badgeEarned: true },
        marketplace: notifsJson.marketplace || { orders: true, messages: true, reviews: true },
        subscriptions: notifsJson.subscriptions || { renewals: true, upgrades: true, features: true }
      } as NotificationSettings,
      
      preferences: {
        language: prefsJson.language || 'en',
        timezone: notifications.timezone || 'Asia/Kuala_Lumpur',
        theme: preferences.darkMode ? 'dark' : (prefsJson.theme || 'auto'),
        currency: prefsJson.currency || 'MYR',
        distanceUnit: prefsJson.distanceUnit || 'km',
        autoPlayVideos: prefsJson.autoPlayVideos ?? true,
        dataUsageMode: prefsJson.dataUsageMode || 'normal',
        contentLanguages: prefsJson.contentLanguages || ['en'],
        showMatureContent: prefsJson.showMatureContent || false
      } as AppPreferences,
      
      account: {
        twoFactorEnabled: security.mfaEnabled || false,
        emailVerified: !!security.emailVerifiedAt,
        phoneVerified: !!security.phoneVerifiedAt,
        lastPasswordChange: security.lastPasswordChangeAt,
        activeSessions: 0, // TODO: Count active sessions
        allowAnalytics: privacy.consentToDataProcessing ?? true,
        allowPersonalization: privacy.consentToDataProcessing ?? true,
        allowMarketing: privacy.consentToMarketing || false,
        accountStatus: user.status?.toLowerCase() || 'active',
        deactivationScheduled: privacy.deletionScheduledFor
      } as AccountSettings
    };
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(userId: string, section?: 'privacy' | 'notifications' | 'preferences' | 'account'): Promise<UserSettings> {
    if (!section) {
      // Reset all
      await Promise.all([
        prisma.userPrivacy.delete({ where: { userId } }).catch(() => {}),
        prisma.userPreference.delete({ where: { userId } }).catch(() => {}),
        prisma.notificationPreference.delete({ where: { userId } }).catch(() => {}),
      ]);
    } else if (section === 'privacy') {
      await prisma.userPrivacy.delete({ where: { userId } }).catch(() => {});
    } else if (section === 'preferences') {
      await prisma.userPreference.delete({ where: { userId } }).catch(() => {});
    } else if (section === 'notifications') {
      await prisma.notificationPreference.delete({ where: { userId } }).catch(() => {});
    }

    return this.getUserSettings(userId);
  }

  /**
   * Export user settings (for data portability)
   */
  async exportSettings(userId: string): Promise<any> {
    const settings = await this.getUserSettings(userId);
    
    return {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      settings
    };
  }
}

export default new SettingsService();
