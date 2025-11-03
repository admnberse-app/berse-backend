import { prisma } from '../config/database';
import logger from './logger';

/**
 * Ensure all required user records exist
 * Creates missing records with sensible defaults
 * Called during login to maintain data integrity
 */
export async function ensureUserRecords(userId: string): Promise<void> {
  try {
    // 1. Ensure UserSecurity record exists
    const security = await prisma.userSecurity.findUnique({
      where: { userId },
    });

    if (!security) {
      await prisma.userSecurity.create({
        data: {
          userId,
          emailVerifiedAt: null,
          phoneVerifiedAt: null,
          lastLoginAt: new Date(),
          passwordVersion: 1,
          mfaEnabled: false,
        },
      });
      logger.info('Created missing UserSecurity record', { userId });
    }

    // 2. Ensure UserPrivacy record exists
    const privacy = await prisma.userPrivacy.findUnique({
      where: { userId },
    });

    if (!privacy) {
      await prisma.userPrivacy.create({
        data: {
          userId,
          profileVisibility: 'public',
          searchableByPhone: true,
          searchableByEmail: true,
          showLocation: true,
          locationPrecision: 'city',
          searchableByUsername: true,
          allowDirectMessages: true,
          allowMessagesViaPhone: true,
          consentToDataProcessing: true,
          consentToMarketing: false,
        },
      });
      logger.info('Created missing UserPrivacy record', { userId });
    }

    // 3. Ensure UserProfile record exists
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      await prisma.userProfile.create({
        data: {
          userId,
          displayName: null,
          profilePicture: null,
          bio: null,
          shortBio: null,
          dateOfBirth: null,
          gender: null,
          interests: [],
          languages: [],
          occupation: null,
          website: null,
          locationPrivacy: 'friends',
        },
      });
      logger.info('Created missing UserProfile record', { userId });
    }

    // 4. Ensure UserLocation record exists
    const location = await prisma.userLocation.findUnique({
      where: { userId },
    });

    if (!location) {
      await prisma.userLocation.create({
        data: {
          userId,
          currentCity: null,
          countryOfResidence: null,
          currentLocation: null,
          nationality: null,
          originallyFrom: null,
          timezone: 'Asia/Kuala_Lumpur',
          preferredLanguage: 'en',
          currency: 'MYR',
          latitude: null,
          longitude: null,
        },
      });
      logger.info('Created missing UserLocation record', { userId });
    }

    // 5. Ensure NotificationPreference record exists
    const notifPrefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!notifPrefs) {
      await prisma.notificationPreference.create({
        data: {
          userId,
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
          preferences: {},
          timezone: 'Asia/Kuala_Lumpur',
        },
      });
      logger.info('Created missing NotificationPreference record', { userId });
    }

    logger.info('All required user records verified/created', { userId });
  } catch (error) {
    logger.error('Error ensuring user records', { userId, error });
    // Don't throw - let login continue even if some records fail to create
  }
}
