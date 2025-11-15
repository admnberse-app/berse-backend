import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';
import { UpdateProfileRequest, UserSearchQuery } from './user.types';
import logger from '../../utils/logger';
import { createId } from '@paralleldrive/cuid2';
import crypto from 'crypto';
import { ActivityLoggerService } from '../../services/activityLogger.service';
import { RecommendationsService } from '../../services/recommendations.service';
import { ConnectionStatus } from '@prisma/client';
import { calculateProfileCompletion } from '../../jobs/profileCompletionReminders';
import { filterLocationByPrivacy } from '../../utils/privacyHelper';
import { mapLanguageCodesToObjects } from '../../utils/languageMapper';
import { getProfilePictureUrl } from '../../utils/image.helpers';

export class UserController {
  /**
   * Helper function to ensure consistent response format
   * Transforms storage keys to full URLs dynamically and language codes to user-friendly labels
   */
  private static transformUserResponse(user: any) {
    if (!user) return user;

    // Transform profile picture key to full URL
    if (user.profile?.profilePicture) {
      const profilePicture = user.profile.profilePicture;
      
      // If it's already a full URL (legacy data or base64), keep it
      if (profilePicture.startsWith('http://') || 
          profilePicture.startsWith('https://') || 
          profilePicture.startsWith('data:')) {
        // Keep as is
      } else {
        // It's a storage key, generate full URL
        const { storageService } = require('../../services/storage.service');
        user.profile.profilePicture = storageService.getPublicUrl(profilePicture);
      }
    }

    // Transform language codes to user-friendly objects with labels
    if (user.profile?.languages && Array.isArray(user.profile.languages)) {
      user.profile.languages = mapLanguageCodesToObjects(user.profile.languages);
    }

    return user;
  }

  /**
   * Get current user profile
   * @route GET /v2/users/profile
   */
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      const user: any = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          username: true,
          role: true,
          totalPoints: true,
          trustScore: true,
          trustLevel: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              displayName: true,
              profilePicture: true,
              bio: true,
              shortBio: true,
              dateOfBirth: true,
              gender: true,
              age: true,
              profession: true,
              occupation: true,
              website: true,
              personalityType: true,
              interests: true,
              languages: true,
              instagramHandle: true,
              linkedinHandle: true,
              travelStyle: true,
              bucketList: true,
              travelBio: true,
              locationPrivacy: true,
            },
          },
          location: {
            select: {
              currentCity: true,
              countryOfResidence: true,
              currentLocation: true,
              nationality: true,
              originallyFrom: true,
              latitude: true,
              longitude: true,
              lastLocationUpdate: true,
            },
          },
          security: {
            select: {
              emailVerifiedAt: true,
              phoneVerifiedAt: true,
              mfaEnabled: true,
              lastLoginAt: true,
            },
          },
          metadata: {
            select: {
              membershipId: true,
              referralCode: true,
            },
          },
          homeSurf: {
            select: {
              isEnabled: true,
              title: true,
              maxGuests: true,
              responseRate: true,
              averageResponseTime: true,
              totalGuests: true,
              rating: true,
              reviewCount: true,
            },
          },
          berseGuide: {
            select: {
              isEnabled: true,
              title: true,
              description: true,
              languages: true,
              guideTypes: true,
              responseRate: true,
              averageResponseTime: true,
              totalSessions: true,
              rating: true,
              reviewCount: true,
            },
          },
          _count: {
            select: {
              events: true,
              eventParticipants: true,
              referralsAsReferrer: true,
              userBadges: true,
              connectionsInitiated: true,
              connectionsReceived: true,
              homeSurfBookingsAsHost: true,
              homeSurfBookingsAsGuest: true,
              berseGuideBookingsAsGuide: true,
              berseGuideBookingsAsTraveler: true,
            },
          },
          connectionStats: {
            select: {
              totalConnections: true,
              pendingRequests: true,
              averageRating: true,
              connectionQuality: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get trust level gating information
      const { getTrustLevelInfo, FEATURE_REQUIREMENTS } = await import('../../middleware/trust-level.middleware');
      const trustLevelInfo = await getTrustLevelInfo(user.trustScore);

      // Determine available features based on trust score
      const availableFeatures: string[] = [];
      const lockedFeatures: Array<{ feature: string; requiredScore: number }> = [];

      Object.entries(FEATURE_REQUIREMENTS).forEach(([feature, requiredScore]) => {
        if (user.trustScore >= requiredScore) {
          availableFeatures.push(feature);
        } else {
          lockedFeatures.push({ feature, requiredScore });
        }
      });

      // Transform response to unified format
      const transformedUser = {
        ...UserController.transformUserResponse(user),
        // Member since (month and year only)
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        }) : null,
        // HomeSurf status
        homeSurf: user.homeSurf || {
          isEnabled: false,
          status: 'NOT_SETUP',
        },
        // BerseGuide status
        berseGuide: user.berseGuide || {
          isEnabled: false,
          status: 'NOT_SETUP',
        },
        // Trust Level Gating Information
        trustLevelGating: {
          currentLevel: {
            name: trustLevelInfo.level,
            label: trustLevelInfo.label,
            minScore: trustLevelInfo.min,
            maxScore: trustLevelInfo.max,
            currentScore: Math.ceil(user.trustScore),
            percentage: Math.round((user.trustScore / trustLevelInfo.max) * 100),
          },
          nextLevel: trustLevelInfo.nextLevel || null,
          availableFeatures,
          lockedFeatures: lockedFeatures.slice(0, 5), // Show top 5 locked features
          totalFeaturesAvailable: availableFeatures.length,
          totalFeaturesLocked: lockedFeatures.length,
        },
        // Verification status
        verification: {
          email: !!user.security?.emailVerifiedAt,
          phone: !!user.security?.phoneVerifiedAt,
          mfa: user.security?.mfaEnabled || false,
        },
      };

      sendSuccess(res, transformedUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * @route PUT /v2/users/profile
   */
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const data: UpdateProfileRequest = req.body;

      // Separate data into different update objects
      const userUpdate: any = {};
      const profileUpdate: any = {};
      const locationUpdate: any = {};

      // Core user fields
      if (data.fullName !== undefined) userUpdate.fullName = data.fullName;
      if (data.username !== undefined) userUpdate.username = data.username;
      // Email cannot be changed through profile update - use dedicated email change flow for security
      if (data.email !== undefined) {
        throw new AppError('Email cannot be changed through profile update. Please use the email change endpoint.', 400);
      }
      
      // Handle phone and dialCode
      if (data.phone !== undefined || data.dialCode !== undefined) {
        // If both provided, store separately
        if (data.phone !== undefined) {
          userUpdate.phone = data.phone;
        }
        if (data.dialCode !== undefined) {
          userUpdate.dialCode = data.dialCode;
        }
      }

      // Profile fields
      if (data.displayName !== undefined) profileUpdate.displayName = data.displayName;
      if (data.profilePicture !== undefined) profileUpdate.profilePicture = data.profilePicture;
      if (data.bio !== undefined) profileUpdate.bio = data.bio;
      if (data.fullBio !== undefined) profileUpdate.bio = data.fullBio;  // Alias
      if (data.shortBio !== undefined) profileUpdate.shortBio = data.shortBio;
      if (data.dateOfBirth !== undefined) {
        // Parse date and strip time component (store as YYYY-MM-DD at midnight UTC)
        const birthDate = new Date(data.dateOfBirth);
        birthDate.setUTCHours(0, 0, 0, 0);
        profileUpdate.dateOfBirth = birthDate;
        
        // Auto-calculate age from date of birth
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        profileUpdate.age = age;
      }
      if (data.gender !== undefined) profileUpdate.gender = data.gender;
      // Remove manual age input - age is now auto-calculated from dateOfBirth
      if (data.profession !== undefined) profileUpdate.profession = data.profession;
      if (data.occupation !== undefined) profileUpdate.occupation = data.occupation;
      if (data.website !== undefined) profileUpdate.website = data.website;
      if (data.personalityType !== undefined) profileUpdate.personalityType = data.personalityType;
      if (data.interests !== undefined) profileUpdate.interests = data.interests;
      if (data.topInterests !== undefined) profileUpdate.interests = data.topInterests;  // Alias
      if (data.languages !== undefined) profileUpdate.languages = data.languages;
      if (data.instagramHandle !== undefined) profileUpdate.instagramHandle = data.instagramHandle;
      if (data.instagram !== undefined) profileUpdate.instagramHandle = data.instagram;  // Alias
      if (data.linkedinHandle !== undefined) profileUpdate.linkedinHandle = data.linkedinHandle;
      if (data.linkedin !== undefined) profileUpdate.linkedinHandle = data.linkedin;  // Alias
      if (data.travelStyle !== undefined) profileUpdate.travelStyle = data.travelStyle;
      if (data.bucketList !== undefined) profileUpdate.bucketList = data.bucketList;
      if (data.travelBio !== undefined) profileUpdate.travelBio = data.travelBio;
      if (data.locationPrivacy !== undefined) profileUpdate.locationPrivacy = data.locationPrivacy;

      // Location fields
      if (data.currentCity !== undefined) locationUpdate.currentCity = data.currentCity;
      if (data.city !== undefined) locationUpdate.currentCity = data.city;  // Alias
      if (data.currentLocation !== undefined) locationUpdate.currentLocation = data.currentLocation;
      if (data.countryOfResidence !== undefined) locationUpdate.countryOfResidence = data.countryOfResidence;
      if (data.nationality !== undefined) locationUpdate.nationality = data.nationality;
      if (data.originallyFrom !== undefined) locationUpdate.originallyFrom = data.originallyFrom;
      
      // Geospatial coordinates with validation
      if (data.latitude !== undefined || data.longitude !== undefined) {
        const lat = data.latitude;
        const lon = data.longitude;
        
        // Validate coordinates if provided
        if (lat !== undefined && (lat < -90 || lat > 90)) {
          throw new AppError('Latitude must be between -90 and 90', 400);
        }
        if (lon !== undefined && (lon < -180 || lon > 180)) {
          throw new AppError('Longitude must be between -180 and 180', 400);
        }
        
        if (lat !== undefined) {
          locationUpdate.latitude = lat;
          locationUpdate.lastLocationUpdate = new Date();
        }
        if (lon !== undefined) {
          locationUpdate.longitude = lon;
          locationUpdate.lastLocationUpdate = new Date();
        }
      }

      // Perform updates in transaction
      await prisma.$transaction(async (tx) => {
        // Update core user fields
        if (Object.keys(userUpdate).length > 0) {
          await tx.user.update({
            where: { id: userId },
            data: userUpdate,
          });
        }

        // Update or create profile
        if (Object.keys(profileUpdate).length > 0) {
          await tx.userProfile.upsert({
            where: { userId },
            update: profileUpdate,
            create: {
              userId,
              ...profileUpdate,
              updatedAt: new Date(),
            },
          });
        }

        // Update or create location
        if (Object.keys(locationUpdate).length > 0) {
          await tx.userLocation.upsert({
            where: { userId },
            update: locationUpdate,
            create: {
              userId,
              ...locationUpdate,
              updatedAt: new Date(),
            },
          });
        }
      });

      logger.info('User profile updated', { userId });
      
      // Return the same response format as getMyProfile
      // Reuse the getMyProfile logic to return consistent response
      req.user = { id: userId } as any;
      return UserController.getMyProfile(req, res, next);
    } catch (error) {
      logger.error('Profile update failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id 
      });
      next(error);
    }
  }

  /**
   * Get all users (for match/discovery screen)
   * Sorted by profile completion (most complete first)
   * @route GET /v2/users/all
   */
  static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      // Sanitize pagination parameters
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));

      // Get all users except the current user (without pagination initially - we'll sort by completion first)
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            id: { not: currentUserId },
            status: 'ACTIVE',
            deletedAt: null,
            // Only show users with verified emails (filters out test accounts)
            security: {
              emailVerifiedAt: { not: null },
            },
            // Only show users with public profiles or no privacy settings
            OR: [
              { privacy: { profileVisibility: { equals: 'public', mode: 'insensitive' } } },
              { privacy: { profileVisibility: { equals: 'Public', mode: 'insensitive' } } },
              { privacy: null },
            ],
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            trustScore: true,
            trustLevel: true,
            profile: {
              select: {
                profilePicture: true,
                bio: true,
                shortBio: true,
                displayName: true,
                dateOfBirth: true,
                age: true,
                gender: true,
                profession: true,
                occupation: true,
                interests: true,
                languages: true,
                personalityType: true,
                instagramHandle: true,
                linkedinHandle: true,
                website: true,
                locationPrivacy: true,
              },
            },
            location: {
              select: {
                currentCity: true,
                currentLocation: true,
                countryOfResidence: true,
                nationality: true,
                originallyFrom: true,
              },
            },
            security: {
              select: {
                emailVerifiedAt: true,
                lastSeenAt: true,
              },
            },
            metadata: {
              select: {
                membershipId: true,
              },
            },
          },
        }),
        prisma.user.count({
          where: {
            id: { not: currentUserId },
            status: 'ACTIVE',
            deletedAt: null,
            // Only show users with verified emails (filters out test accounts)
            security: {
              emailVerifiedAt: { not: null },
            },
            // Only show users with public profiles or no privacy settings
            OR: [
              { privacy: { profileVisibility: { equals: 'public', mode: 'insensitive' } } },
              { privacy: { profileVisibility: { equals: 'Public', mode: 'insensitive' } } },
              { privacy: null },
            ],
          },
        }),
      ]);

      // Calculate profile completion for each user and sort by completion percentage
      const usersWithCompletion = users.map(user => {
        // Calculate completion inline using same logic as calculateProfileCompletion
        const fields = {
          // Basic User Info (35 points)
          fullName: { value: user.fullName, weight: 5 },
          email: { value: user.email, weight: 5 },
          phone: { value: user.phone, weight: 5 },
          
          // Profile Fields from UserProfile table (40 points)
          displayName: { value: user.profile?.displayName, weight: 3 },
          profilePicture: { value: user.profile?.profilePicture, weight: 10 },
          bio: { value: user.profile?.bio, weight: 8 },
          shortBio: { value: user.profile?.shortBio, weight: 3 },
          dateOfBirth: { value: user.profile?.dateOfBirth, weight: 5 },
          gender: { value: user.profile?.gender, weight: 3 },
          profession: { value: user.profile?.profession, weight: 4 },
          occupation: { value: user.profile?.occupation, weight: 4 },
          
          // Location Info from UserLocation table (10 points)
          currentCity: { value: user.location?.currentCity, weight: 4 },
          countryOfResidence: { value: user.location?.countryOfResidence, weight: 3 },
          nationality: { value: user.location?.nationality, weight: 3 },
          
          // Social & Interests from UserProfile (15 points)
          interests: { value: user.profile?.interests && user.profile.interests.length > 0, weight: 5 },
          languages: { value: user.profile?.languages && user.profile.languages.length > 0, weight: 3 },
          personalityType: { value: user.profile?.personalityType, weight: 2 },
          instagramHandle: { value: user.profile?.instagramHandle, weight: 2 },
          linkedinHandle: { value: user.profile?.linkedinHandle, weight: 2 },
          website: { value: user.profile?.website, weight: 1 }
        };

        let totalWeight = 0;
        let completedWeight = 0;

        Object.entries(fields).forEach(([_, field]) => {
          totalWeight += field.weight;
          if (field.value) {
            completedWeight += field.weight;
          }
        });

        const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

        return {
          user,
          completionPercentage
        };
      });

      // Sort by completion percentage (highest to lowest)
      usersWithCompletion.sort((a, b) => b.completionPercentage - a.completionPercentage);

      // Apply pagination after sorting
      const skip = (pageNum - 1) * limitNum;
      const paginatedUsers = usersWithCompletion.slice(skip, skip + limitNum);

      // Transform to flat structure
      const transformedUsers = paginatedUsers.map(({ user, completionPercentage }) => {
        const filteredLocation = filterLocationByPrivacy(user.location, { locationPrivacy: user.profile?.locationPrivacy }, false);
        return {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          trustScore: Math.round((user.trustScore || 0) * 10) / 10,
          trustLevel: user.trustLevel,
          profilePicture: getProfilePictureUrl(user.profile?.profilePicture),
          bio: user.profile?.bio || user.profile?.shortBio,
          interests: user.profile?.interests || [],
          gender: user.profile?.gender,
          profession: user.profile?.profession,
          age: user.profile?.age,
          personalityType: user.profile?.personalityType,
          languages: mapLanguageCodesToObjects(user.profile?.languages || []),
          location: filteredLocation ? {
            city: filteredLocation.currentCity,
            country: filteredLocation.countryOfResidence,
          } : null,
          isVerified: !!user.security?.emailVerifiedAt,
          lastSeen: user.security?.lastSeenAt,
          membershipId: user.metadata?.membershipId,
          profileCompletion: completionPercentage, // Include completion percentage in response
        };
      });

      sendSuccess(res, {
        users: transformedUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search users with advanced filters
   * @route GET /v2/users/search
   * 
   * Privacy Features:
   * - Respects profileVisibility (public, friends, private)
   * - Username search only works if searchableByUsername = true
   * - Email search only works if searchableByEmail = true
   * - Phone search only works if searchableByPhone = true
   * - Friends-only profiles only visible to connected users
   * - Private profiles never appear in search
   */
  static async searchUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      
      const {
        query,
        city,
        interest,
        gender,
        latitude,
        longitude,
        radius,
        nearby,
        minTrustScore,
        maxTrustScore,
        trustLevel,
        minEventsAttended,
        hasHostedEvents,
        isVerified,
        excludeConnected = false,
        includeMutualConnections,
        page = 1,
        limit = 20,
      }: any = req.query;

      // Get connected user IDs first for friends-only visibility check
      let connectedUserIds: string[] = [];
      if (currentUserId) {
        const connections = await prisma.userConnection.findMany({
          where: {
            OR: [
              { initiatorId: currentUserId },
              { receiverId: currentUserId },
            ],
            status: 'ACCEPTED',
          },
          select: {
            initiatorId: true,
            receiverId: true,
          },
        });

        connectedUserIds = connections.map(c =>
          c.initiatorId === currentUserId ? c.receiverId : c.initiatorId
        );
      }

      const where: any = {
        status: 'ACTIVE',
        deletedAt: null,
        // Show all active users regardless of verification status
      };

      // Exclude current user
      if (currentUserId) {
        where.id = { not: currentUserId };
      }

      // Build privacy visibility conditions
      const privacyConditions: any[] = [];
      
      if (currentUserId && connectedUserIds.length > 0) {
        // Show public profiles OR friends-only profiles if connected OR users without privacy settings (default public)
        privacyConditions.push({ privacy: { profileVisibility: { equals: 'public', mode: 'insensitive' } } });
        privacyConditions.push({ privacy: { profileVisibility: { equals: 'Public', mode: 'insensitive' } } });
        privacyConditions.push({ privacy: null }); // Users without privacy settings are treated as public
        privacyConditions.push({
          AND: [
            {
              OR: [
                { privacy: { profileVisibility: { equals: 'friends', mode: 'insensitive' } } },
                { privacy: { profileVisibility: { equals: 'Friends', mode: 'insensitive' } } },
              ]
            },
            { id: { in: connectedUserIds } },
          ],
        });
      } else {
        // Only show public profiles or users without privacy settings if not logged in or no connections
        privacyConditions.push({ privacy: { profileVisibility: { equals: 'public', mode: 'insensitive' } } });
        privacyConditions.push({ privacy: { profileVisibility: { equals: 'Public', mode: 'insensitive' } } });
        privacyConditions.push({ privacy: null }); // Users without privacy settings are treated as public
      }

      // Text search - respects privacy settings for username/email/phone searches
      if (query) {
        const searchConditions: any[] = [
          { fullName: { contains: query, mode: 'insensitive' } },
          { profile: { displayName: { contains: query, mode: 'insensitive' } } },
        ];

        // Add username search only if user allows it OR has no privacy settings (default searchable)
        searchConditions.push({
          AND: [
            { username: { contains: query, mode: 'insensitive' } },
            {
              OR: [
                { privacy: { searchableByUsername: true } },
                { privacy: null }, // No privacy settings = searchable by default
              ],
            },
          ],
        });

        // Add email search if query looks like email AND user allows email search OR has no privacy settings
        if (query.includes('@')) {
          searchConditions.push({
            AND: [
              { email: { equals: query, mode: 'insensitive' } },
              {
                OR: [
                  { privacy: { searchableByEmail: true } },
                  { privacy: null }, // No privacy settings = searchable by default
                ],
              },
            ],
          });
        }

        // Add phone search if query looks like phone AND user allows phone search OR has no privacy settings
        // Phone patterns: starts with + or contains only digits
        if (/^[\d+\s()-]+$/.test(query)) {
          const cleanPhone = query.replace(/[\s()-]/g, ''); // Remove formatting
          searchConditions.push({
            AND: [
              { phone: { contains: cleanPhone } },
              {
                OR: [
                  { privacy: { searchableByPhone: true } },
                  { privacy: null }, // No privacy settings = searchable by default
                ],
              },
            ],
          });
        }

        // Combine privacy and search conditions
        where.AND = [
          { OR: privacyConditions },
          { OR: searchConditions },
        ];
      } else {
        // No search query - just apply privacy filter
        where.OR = privacyConditions;
      }

      // Location filters
      if (city) {
        where.location = {
          OR: [
            { currentCity: { contains: city, mode: 'insensitive' } },
            { currentLocation: { contains: city, mode: 'insensitive' } },
          ],
        };
      }

      // Profile filters
      if (interest) {
        where.profile = {
          ...where.profile,
          interests: { has: interest },
        };
      }

      if (gender) {
        where.profile = {
          ...where.profile,
          gender: gender,
        };
      }

      // Trust score filters
      if (minTrustScore !== undefined) {
        where.trustScore = { ...where.trustScore, gte: Number(minTrustScore) };
      }

      if (maxTrustScore !== undefined) {
        where.trustScore = { ...where.trustScore, lte: Number(maxTrustScore) };
      }

      if (trustLevel) {
        where.trustLevel = trustLevel;
      }

      // Email verification filter - default is verified only, allow explicit override
      if (isVerified === 'false' || isVerified === false) {
        // Remove the default verification filter if explicitly requesting unverified
        delete where.security;
      } else if (isVerified === 'true' || isVerified === true) {
        // Explicitly verified (already set by default)
        where.security = {
          emailVerifiedAt: { not: null },
        };
      }
      // Otherwise keep default (verified only)

      // Exclude connected users if requested (already fetched above)
      if (excludeConnected === 'true' || excludeConnected === true) {
        if (currentUserId && connectedUserIds.length > 0) {
          where.id = { ...where.id, notIn: connectedUserIds };
        }
      }

      // Always exclude blocked users
      if (currentUserId) {
        const blocked = await prisma.userBlock.findMany({
          where: {
            OR: [
              { blockerId: currentUserId },
              { blockedId: currentUserId },
            ],
          },
          select: {
            blockerId: true,
            blockedId: true,
          },
        });

        const blockedUserIds = blocked.map(b =>
          b.blockerId === currentUserId ? b.blockedId : b.blockerId
        );

        if (blockedUserIds.length > 0) {
          if (where.id?.notIn) {
            where.id.notIn = [...where.id.notIn, ...blockedUserIds];
          } else {
            where.id = { ...where.id, notIn: blockedUserIds };
          }
        }
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            fullName: true,
            username: true,
            role: true,
            trustScore: true,
            trustLevel: true,
            profile: {
              select: {
                profilePicture: true,
                bio: true,
                shortBio: true,
                interests: true,
                gender: true,
                profession: true,
              },
            },
            location: {
              select: {
                currentCity: true,
                countryOfResidence: true,
                latitude: true,
                longitude: true,
              },
            },
            privacy: {
              select: {
                showLocation: true,
                locationPrecision: true,
              },
            },
            security: {
              select: {
                emailVerifiedAt: true,
                lastSeenAt: true,
              },
            },
            stats: {
              select: {
                eventsHosted: true,
                eventsAttended: true,
              },
            },
          },
          orderBy: { trustScore: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.user.count({ where }),
      ]);

      // Post-query filters and enhancements
      let filteredUsers = users;

      // Filter by events attended
      if (minEventsAttended !== undefined) {
        filteredUsers = filteredUsers.filter(u => (u.stats?.eventsAttended || 0) >= Number(minEventsAttended));
      }

      if (hasHostedEvents === 'true' || hasHostedEvents === true) {
        filteredUsers = filteredUsers.filter(u => (u.stats?.eventsHosted || 0) > 0);
      }

      // Calculate distance and filter by radius
      if (latitude !== undefined && longitude !== undefined) {
        filteredUsers = filteredUsers
          .map(user => {
            if (user.location?.latitude && user.location?.longitude) {
              const distance = this.calculateDistance(
                Number(latitude),
                Number(longitude),
                user.location.latitude,
                user.location.longitude
              );
              return { ...user, distance };
            }
            return { ...user, distance: null };
          })
          .filter(user => {
            if (radius) {
              return user.distance !== null && user.distance <= Number(radius);
            }
            if (nearby === 'true' || nearby === true) {
              return user.distance !== null && user.distance <= 50; // 50km default for nearby
            }
            return true;
          }) as any;

        // Sort by distance
        filteredUsers.sort((a: any, b: any) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      }

      // Get mutual connections for each user (if explicitly requested and user is authenticated)
      let usersWithMutuals = filteredUsers;
      if (currentUserId && includeMutualConnections === 'true') {
        // Batch fetch all user IDs' connections to avoid N+1 queries
        const userIds = filteredUsers.map((u: any) => u.id);
        const mutualConnectionsMap = await RecommendationsService.getBatchMutualConnections(
          currentUserId, 
          userIds
        );
        
        usersWithMutuals = filteredUsers.map((user: any) => {
          const mutuals = mutualConnectionsMap.get(user.id) || [];
          return {
            ...user,
            mutualConnectionsCount: mutuals.length,
            mutualConnections: mutuals.slice(0, 3).map(mc => ({
              id: mc.id,
              fullName: mc.fullName,
              profilePicture: getProfilePictureUrl(mc.profile?.profilePicture),
            })),
          };
        });
      }

      // Transform response with privacy filtering
      const transformedUsers = usersWithMutuals.map((user: any) => {
        const filteredLocation = filterLocationByPrivacy(user.location, user.privacy, false);
        return {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          role: user.role,
          trustScore: user.trustScore,
          trustLevel: user.trustLevel,
          profilePicture: getProfilePictureUrl(user.profile?.profilePicture),
          bio: user.profile?.bio || user.profile?.shortBio,
          interests: user.profile?.interests || [],
          gender: user.profile?.gender,
          profession: user.profile?.profession,
          languages: mapLanguageCodesToObjects(user.profile?.languages || []),
          location: filteredLocation ? {
            city: filteredLocation.currentCity,
            country: filteredLocation.countryOfResidence,
          } : null,
          isVerified: !!user.security?.emailVerifiedAt,
          lastSeen: user.security?.lastSeenAt,
          stats: {
            hostedEvents: user.stats?.eventsHosted || 0,
            attendedEvents: user.stats?.eventsAttended || 0,
          },
          ...(user.distance !== undefined && { distance: user.distance }),
          ...(currentUserId && includeMutualConnections === 'true' && {
            mutualConnectionsCount: user.mutualConnectionsCount || 0,
            mutualConnections: user.mutualConnections || [],
          }),
        };
      });

      sendSuccess(res, {
        users: transformedUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: transformedUsers.length,
          totalPages: Math.ceil(transformedUsers.length / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @returns distance in kilometers
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  }

  /**
   * Get trending interests in the community
   * @route GET /v2/users/trending-interests
   */
  static async getTrendingInterests(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      const trendingInterests = await RecommendationsService.getTrendingInterests(Number(limit));

      sendSuccess(res, {
        interests: trendingInterests,
        total: trendingInterests.length,
      });

      logger.info('Trending interests retrieved', { count: trendingInterests.length });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get personalized user recommendations
   * @route GET /v2/users/recommendations
   */
  static async getUserRecommendations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id!;
      const { limit = 10, includeMutualConnections } = req.query;

      const recommendations = await RecommendationsService.getRecommendations(
        currentUserId,
        Number(limit)
      );

      // Get mutual connections for each recommendation (if explicitly requested)
      let recsWithMutuals = recommendations;
      if (includeMutualConnections === 'true') {
        const userIds = recommendations.map(rec => rec.userId);
        const mutualConnectionsMap = await RecommendationsService.getBatchMutualConnections(
          currentUserId,
          userIds
        );

        recsWithMutuals = recommendations.map((rec) => {
          const mutuals = mutualConnectionsMap.get(rec.userId) || [];
          return {
            ...rec,
            mutualConnectionsCount: mutuals.length,
            mutualConnections: mutuals.slice(0, 3).map(mc => ({
              id: mc.id,
              fullName: mc.fullName,
              profilePicture: getProfilePictureUrl(mc.profile?.profilePicture),
            })),
          };
        });
      }

      // Transform recommendations for response
      const transformedRecommendations = recsWithMutuals.map((rec: any) => ({
        id: rec.userId,
        fullName: rec.user.fullName,
        username: rec.user.username,
        role: rec.user.role,
        trustScore: rec.user.trustScore,
        trustLevel: rec.user.trustLevel,
        score: rec.score,
        reasons: rec.reasons,
        profilePicture: getProfilePictureUrl(rec.user.profile?.profilePicture),
        bio: rec.user.profile?.bio || rec.user.profile?.shortBio,
        interests: rec.user.profile?.interests || [],
        languages: mapLanguageCodesToObjects(rec.user.profile?.languages || []),
        profession: rec.user.profile?.profession,
        gender: rec.user.profile?.gender,
        location: {
          city: rec.user.location?.currentCity,
          country: rec.user.location?.countryOfResidence,
        },
        isVerified: !!rec.user.security?.emailVerifiedAt,
        stats: {
          totalConnections: rec.user.connectionStats?.totalConnections || 0,
          connectionQuality: rec.user.connectionStats?.connectionQuality || 0,
        },
        ...(includeMutualConnections === 'true' && {
          mutualConnectionsCount: rec.mutualConnectionsCount || 0,
          mutualConnections: rec.mutualConnections || [],
        }),
      }));

      sendSuccess(res, {
        recommendations: transformedRecommendations,
        total: transformedRecommendations.length,
      });

      logger.info('User recommendations retrieved', { 
        userId: currentUserId, 
        count: transformedRecommendations.length 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Find nearby users within a specified radius
   * @route GET /v2/users/nearby
   */
  static async findNearbyUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      const { latitude, longitude, radius = 10, page = 1, limit = 20, includeMutualConnections } = req.query;

      // Validate required parameters
      if (!latitude || !longitude) {
        throw new AppError('Latitude and longitude are required', 400);
      }

      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const radiusKm = parseFloat(radius as string);

      // Validate coordinates
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new AppError('Invalid coordinates', 400);
      }

      if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 500) {
        throw new AppError('Radius must be between 1 and 500 km', 400);
      }

      // Import geospatial utilities
      const { calculateDistance, calculateBoundingBox } = await import('../../utils/geospatial');

      // Calculate bounding box for efficient filtering
      const boundingBox = calculateBoundingBox(lat, lon, radiusKm);

      const skip = (Number(page) - 1) * Number(limit);

      // Query users within bounding box
      const users = await prisma.user.findMany({
        where: {
          id: { not: currentUserId },
          status: 'ACTIVE',
          location: {
            latitude: {
              gte: boundingBox.minLat,
              lte: boundingBox.maxLat,
            },
            longitude: {
              gte: boundingBox.minLon,
              lte: boundingBox.maxLon,
            },
          },
        },
        select: {
          id: true,
          fullName: true,
          username: true,
          profile: {
            select: {
              profilePicture: true,
              bio: true,
              shortBio: true,
              interests: true,
              profession: true,
              locationPrivacy: true,
            },
          },
          location: {
            select: {
              currentCity: true,
              currentLocation: true,
              latitude: true,
              longitude: true,
              lastLocationUpdate: true,
            },
          },
          connectionStats: {
            select: {
              totalConnections: true,
              connectionQuality: true,
            },
          },
        },
      });

      // Check if current user has accepted connections
      const connections = await prisma.userConnection.findMany({
        where: {
          OR: [
            { initiatorId: currentUserId, status: 'ACCEPTED' },
            { receiverId: currentUserId, status: 'ACCEPTED' },
          ],
        },
        select: {
          initiatorId: true,
          receiverId: true,
        },
      });

      const connectedUserIds = new Set(
        connections.map(c => c.initiatorId === currentUserId ? c.receiverId : c.initiatorId)
      );

      // Calculate distances and filter by privacy settings
      const nearbyUsers = users
        .map(user => {
          const distance = calculateDistance(
            lat,
            lon,
            user.location!.latitude!,
            user.location!.longitude!
          );

          // Check privacy settings
          const privacySetting = user.profile?.locationPrivacy || 'friends';
          const isConnected = connectedUserIds.has(user.id);
          const shouldShowLocation = 
            privacySetting === 'public' ||
            (privacySetting === 'friends' && isConnected);

          return {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            distance,
            distanceFormatted: distance < 1 
              ? `${Math.round(distance * 1000)}m` 
              : distance < 10 
                ? `${distance.toFixed(1)}km`
                : `${Math.round(distance)}km`,
            profile: {
              profilePicture: user.profile?.profilePicture,
              bio: user.profile?.bio,
              shortBio: user.profile?.shortBio,
              interests: user.profile?.interests,
              profession: user.profile?.profession,
            },
            location: shouldShowLocation ? {
              currentCity: user.location?.currentCity,
              currentLocation: user.location?.currentLocation,
              lastLocationUpdate: user.location?.lastLocationUpdate,
            } : {
              currentCity: user.location?.currentCity, // Only show city
            },
            connectionStats: user.connectionStats,
            isConnected,
          };
        })
        .filter(user => user.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(skip, skip + Number(limit));

      // Get mutual connections for each nearby user (if explicitly requested and authenticated)
      let usersWithMutuals = nearbyUsers;
      if (currentUserId && includeMutualConnections === 'true') {
        const userIds = nearbyUsers.map((u: any) => u.id);
        const mutualConnectionsMap = await RecommendationsService.getBatchMutualConnections(
          currentUserId,
          userIds
        );

        usersWithMutuals = nearbyUsers.map((user: any) => {
          const mutuals = mutualConnectionsMap.get(user.id) || [];
          return {
            ...user,
            mutualConnectionsCount: mutuals.length,
            mutualConnections: mutuals.slice(0, 3).map(mc => ({
              id: mc.id,
              fullName: mc.fullName,
              profilePicture: getProfilePictureUrl(mc.profile?.profilePicture),
            })),
          };
        });
      }

      // Transform to flat structure
      const transformedUsers = usersWithMutuals.map((user: any) => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        distance: user.distance,
        distanceFormatted: user.distanceFormatted,
        profilePicture: getProfilePictureUrl(user.profile?.profilePicture),
        bio: user.profile?.bio || user.profile?.shortBio,
        interests: user.profile?.interests || [],
        profession: user.profile?.profession,
        location: {
          city: user.location?.currentCity,
          currentLocation: user.location?.currentLocation,
          lastLocationUpdate: user.location?.lastLocationUpdate,
        },
        stats: {
          totalConnections: user.connectionStats?.totalConnections || 0,
          connectionQuality: user.connectionStats?.connectionQuality || 0,
        },
        isConnected: user.isConnected,
        ...(user.mutualConnectionsCount !== undefined && {
          mutualConnectionsCount: user.mutualConnectionsCount,
          mutualConnections: user.mutualConnections || [],
        }),
      }));

      const total = transformedUsers.length;

      sendSuccess(res, {
        users: transformedUsers,
        center: { latitude: lat, longitude: lon },
        radius: radiusKm,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });

      logger.info('Nearby users search', { userId: currentUserId, radius: radiusKm, found: total });
    } catch (error) {
      logger.error('Nearby users search failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id 
      });
      next(error);
    }
  }

  /**
   * Get current user's profile (own profile)
   * @route GET /v2/users/me
   */
  static async getMyProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      // Fetch base user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          location: true,
          privacy: true,
          security: true,
          userBadges: {
            include: {
              badges: true,
            },
            orderBy: {
              earnedAt: 'desc',
            },
          },
          homeSurf: true,
          berseGuide: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // ==================== STATISTICS ====================
      const [
        connectionsCount,
        connectionsThisMonth,
        communitiesCounts,
        eventsAttended,
        eventsHosting,
        eventsUpcoming,
        marketplaceListings,
        travelTrips,
      ] = await Promise.all([
        // Total connections
        prisma.userConnection.count({
          where: {
            OR: [
              { initiatorId: userId, status: ConnectionStatus.ACCEPTED },
              { receiverId: userId, status: ConnectionStatus.ACCEPTED },
            ],
          },
        }),
        // Connections this month
        prisma.userConnection.count({
          where: {
            OR: [
              { initiatorId: userId, status: ConnectionStatus.ACCEPTED },
              { receiverId: userId, status: ConnectionStatus.ACCEPTED },
            ],
            connectedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        }),
        // Communities grouped by role
        prisma.communityMember.groupBy({
          by: ['role'],
          where: { userId, isApproved: true },
          _count: true,
        }),
        // Events attended (checked in)
        prisma.eventParticipant.count({
          where: {
            userId,
            status: 'CHECKED_IN',
          },
        }),
        // Events hosting
        prisma.event.count({
          where: {
            hostId: userId,
            status: 'PUBLISHED',
          },
        }),
        // Events upcoming
        prisma.eventParticipant.count({
          where: {
            userId,
            status: 'REGISTERED',
            events: {
              date: { gte: new Date() },
            },
          },
        }),
        // Marketplace stats
        prisma.marketplaceListing.groupBy({
          by: ['status'],
          where: { userId },
          _count: true,
        }),
        // Travel stats
        prisma.travelTrip.findMany({
          where: { userId },
          select: {
            id: true,
            startDate: true,
            endDate: true,
          },
        }),
      ]);

      const statistics = {
        connections: {
          total: connectionsCount,
          thisMonth: connectionsThisMonth,
        },
        communities: {
          member: communitiesCounts.find(c => c.role === 'MEMBER')?._count || 0,
          moderator: communitiesCounts.find(c => c.role === 'MODERATOR')?._count || 0,
          owner: communitiesCounts.find(c => c.role === 'OWNER')?._count || 0,
        },
        events: {
          attended: eventsAttended,
          hosting: eventsHosting,
          upcoming: eventsUpcoming,
        },
        marketplace: {
          activeListings: marketplaceListings.find(l => l.status === 'ACTIVE')?._count || 0,
          soldItems: marketplaceListings.find(l => l.status === 'SOLD')?._count || 0,
          rating: 0, // TODO: Calculate from reviews
          transactions: marketplaceListings.reduce((sum, l) => sum + l._count, 0),
        },
        travel: {
          tripsCompleted: travelTrips.filter(t => t.endDate && t.endDate < new Date()).length,
          upcomingTrips: travelTrips.filter(t => t.startDate && t.startDate > new Date()).length,
        },
        cardGame: {
          played: 0, // TODO: Implement when card game stats are available
          won: 0,
          currentStreak: 0,
        },
      };

      // ==================== TRUST & REPUTATION ====================
      const [vouchesReceived, vouchesGiven, activePrimaryVouches, activeSecondaryVouches, uniqueVouchersReceived, uniqueVouchersGiven] = await Promise.all([
        prisma.vouch.count({
          where: { voucheeId: userId, status: { in: ['APPROVED', 'ACTIVE'] } },
        }),
        prisma.vouch.count({
          where: { voucherId: userId, status: { in: ['APPROVED', 'ACTIVE'] } },
        }),
        prisma.vouch.count({
          where: { voucheeId: userId, vouchType: 'PRIMARY', status: { in: ['APPROVED', 'ACTIVE'] } },
        }),
        prisma.vouch.count({
          where: { voucheeId: userId, vouchType: 'SECONDARY', status: { in: ['APPROVED', 'ACTIVE'] } },
        }),
        prisma.vouch.findMany({
          where: { voucheeId: userId, status: { in: ['APPROVED', 'ACTIVE'] } },
          select: { voucherId: true },
          distinct: ['voucherId'],
        }).then(vouches => vouches.length),
        prisma.vouch.findMany({
          where: { voucherId: userId, status: { in: ['APPROVED', 'ACTIVE'] } },
          select: { voucheeId: true },
          distinct: ['voucheeId'],
        }).then(vouches => vouches.length),
      ]);

      const uniqueVouchers = uniqueVouchersReceived + uniqueVouchersGiven;

      const badgesList = (user.userBadges || []).map(ub => ({
        id: ub.badges.id,
        name: ub.badges.name,
        description: ub.badges.description,
        imageUrl: ub.badges.imageUrl,
        earnedAt: ub.earnedAt,
      }));

      const trust = {
        score: Math.ceil(user.trustScore),
        level: user.trustLevel,
        verifications: {
          email: !!user.security?.emailVerifiedAt,
          phone: !!user.security?.phoneVerifiedAt,
          identity: false, // TODO: Implement identity verification
          background: false, // TODO: Implement background check
        },
      };

      const badges = {
        total: badgesList.length,
        list: badgesList,
      };

      const vouches = {
        total: vouchesReceived + vouchesGiven,
        received: vouchesReceived,
        given: vouchesGiven,
        activePrimary: activePrimaryVouches,
        activeSecondary: activeSecondaryVouches,
        uniqueVouchers: uniqueVouchers,
      };

      const points = {
        total: user.totalPoints,
      };

      // ==================== SERVICES SUMMARY ====================
      const services = {
        homeSurf: {
          isEnabled: user.homeSurf?.isEnabled || false,
          hasProfile: !!user.homeSurf,
        },
        berseGuide: {
          isEnabled: user.berseGuide?.isEnabled || false,
          hasProfile: !!user.berseGuide,
        },
      };

      // ==================== BUILD RESPONSE ====================
      // Parse phone number into dialCode and number
      let phoneData = null;
      if (user.phone) {
        // If dialCode is stored separately, use it
        if (user.dialCode) {
          phoneData = {
            dialCode: user.dialCode,
            number: user.phone.replace(user.dialCode, ''),
            full: user.phone,
          };
        } else {
          // Parse from full phone number
          // Try to match common dial code patterns (1-4 digits after +)
          // Prioritize shorter dial codes (most countries use 1-3 digits)
          let dialCode = null;
          let number = user.phone;
          
          // Check for +XX pattern (2 digit country codes like +60, +65, +44)
          if (user.phone.match(/^\+\d{2}\d{7,}/)) {
            dialCode = user.phone.substring(0, 3);
            number = user.phone.substring(3);
          }
          // Check for +XXX pattern (3 digit codes)
          else if (user.phone.match(/^\+\d{3}\d{6,}/)) {
            dialCode = user.phone.substring(0, 4);
            number = user.phone.substring(4);
          }
          // Check for +X pattern (1 digit codes like +1)
          else if (user.phone.match(/^\+\d{1}\d{7,}/)) {
            dialCode = user.phone.substring(0, 2);
            number = user.phone.substring(2);
          }
          
          phoneData = {
            dialCode: dialCode,
            number: number,
            full: user.phone,
          };
        }
      }

      const response = {
        profile: {
          id: user.id,
          fullName: user.fullName,
          displayName: user.profile?.displayName || null,
          username: user.username,
          email: user.email,
          phone: phoneData,
          profilePicture: getProfilePictureUrl(user.profile?.profilePicture) || null,
          bio: user.profile?.bio || null,
          shortBio: user.profile?.shortBio || null,
          location: {
            city: user.location?.currentCity || null,
            country: user.location?.countryOfResidence || null,
            coordinates: user.location?.latitude && user.location?.longitude ? {
              lat: user.location.latitude,
              lng: user.location.longitude,
            } : null,
          },
          birthDate: user.profile?.dateOfBirth || null,
          age: user.profile?.age || null,
          gender: user.profile?.gender || null,
          interests: user.profile?.interests || [],
          languages: user.profile?.languages || [],
          profession: user.profile?.profession || null,
          occupation: user.profile?.occupation || null,
          personalityType: user.profile?.personalityType || null,
          travelStyle: user.profile?.travelStyle || null,
          bucketList: user.profile?.bucketList || [],
          travelBio: user.profile?.travelBio || null,
          website: user.profile?.website || null,
          socialLinks: {
            instagram: user.profile?.instagramHandle || null,
            linkedin: user.profile?.linkedinHandle || null,
          },
          joinedAt: user.createdAt,
          lastActiveAt: user.security?.lastSeenAt || null,
        },
        services,
        trust,
        badges,
        vouches,
        points,
        statistics,
        privacy: {
          profileVisibility: user.privacy?.profileVisibility || 'public',
          allowDirectMessages: user.privacy?.allowDirectMessages ?? true,
        },
      };

      const finalResponse = UserController.transformUserResponse(response);
      sendSuccess(res, finalResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile completion status
   * @route GET /v2/users/me/completion
   */
  static async getProfileCompletion(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      
      const completion = await calculateProfileCompletion(userId);
      
      sendSuccess(res, completion, 'Profile completion calculated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (view another user's profile)
   * @route GET /v2/users/:id
   */
  static async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id;

      // Prevent using this endpoint for own profile
      if (currentUserId === id) {
        throw new AppError('Use /users/me to view your own profile', 400);
      }

      // Fetch base user data
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          location: true,
          privacy: true,
          security: true,
          userBadges: {
            include: {
              badges: true,
            },
            orderBy: {
              earnedAt: 'desc',
            },
          },
          homeSurf: true,
          berseGuide: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // ==================== SECTION 1: RELATIONSHIP STATUS ====================
      let relationship = {
        connection: {
          status: 'NONE' as 'CONNECTED' | 'PENDING' | 'BLOCKED' | 'NONE',
          details: null as any,
        },
        vouch: {
          status: 'NONE' as 'GIVEN' | 'RECEIVED' | 'MUTUAL' | 'PENDING_OFFER' | 'NONE',
          details: null as any,
        },
        trustMatch: null as any,
        mutualConnections: {
          count: 0,
          topConnections: [] as any[],
        },
      };

      if (currentUserId) {
        // Get connection status
        const { ConnectionService } = await import('../connections/core/connection.service');
        relationship.connection.status = await ConnectionService.getConnectionStatus(currentUserId, id);
        
        // Get connection details if exists
        if (relationship.connection.status === 'CONNECTED' || relationship.connection.status === 'PENDING') {
          const connection = await prisma.userConnection.findFirst({
            where: {
              OR: [
                { initiatorId: currentUserId, receiverId: id },
                { initiatorId: id, receiverId: currentUserId },
              ],
            },
            select: {
              id: true,
              status: true,
              initiatorId: true,
              receiverId: true,
              relationshipType: true,
              relationshipCategory: true,
              message: true,
              howWeMet: true,
              connectedAt: true,
              createdAt: true,
            },
          });
          
          if (connection) {
            relationship.connection.details = {
              id: connection.id,
              status: connection.status,
              isInitiator: connection.initiatorId === currentUserId,
              relationshipType: connection.relationshipType,
              relationshipCategory: connection.relationshipCategory,
              message: connection.message,
              howWeMet: connection.howWeMet,
              connectedAt: connection.connectedAt,
              requestedAt: connection.createdAt,
            };
          }
        }

        // Get vouch status - check for MUTUAL first
        const [vouchGiven, vouchReceived, vouchOffer] = await Promise.all([
          prisma.vouch.findFirst({
            where: {
              voucherId: currentUserId,
              voucheeId: id,
              status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
            },
            select: {
              id: true,
              voucherId: true,
              voucheeId: true,
              vouchType: true,
              status: true,
              message: true,
              weightPercentage: true,
              trustImpact: true,
              isCommunityVouch: true,
              communityId: true,
              isAutoVouched: true,
              autoVouchCriteria: true,
              approvedAt: true,
              activatedAt: true,
              createdAt: true,
            },
          }),
          prisma.vouch.findFirst({
            where: {
              voucherId: id,
              voucheeId: currentUserId,
              status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
            },
            select: {
              id: true,
              voucherId: true,
              voucheeId: true,
              vouchType: true,
              status: true,
              message: true,
              weightPercentage: true,
              trustImpact: true,
              isCommunityVouch: true,
              communityId: true,
              isAutoVouched: true,
              autoVouchCriteria: true,
              approvedAt: true,
              activatedAt: true,
              createdAt: true,
            },
          }),
          prisma.communityVouchOffer.findFirst({
            where: {
              userId: id,
              status: 'PENDING',
            },
            select: {
              id: true,
              communityId: true,
              eligibilityReason: true,
              createdAt: true,
              expiresAt: true,
              community: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                  coverImageUrl: true,
                },
              },
            },
          }),
        ]);

        // Determine vouch status
        if (vouchGiven && vouchReceived) {
          relationship.vouch.status = 'MUTUAL';
          relationship.vouch.details = {
            yourVouch: {
              id: vouchGiven.id,
              type: vouchGiven.vouchType,
              message: vouchGiven.message,
              weightPercentage: vouchGiven.weightPercentage,
              trustImpact: vouchGiven.trustImpact,
              isCommunityVouch: vouchGiven.isCommunityVouch,
              isAutoVouched: vouchGiven.isAutoVouched,
              isInitiator: vouchGiven.voucheeId === currentUserId,
              approvedAt: vouchGiven.approvedAt,
              activatedAt: vouchGiven.activatedAt,
              givenAt: vouchGiven.createdAt,
            },
            theirVouch: {
              id: vouchReceived.id,
              type: vouchReceived.vouchType,
              message: vouchReceived.message,
              weightPercentage: vouchReceived.weightPercentage,
              trustImpact: vouchReceived.trustImpact,
              isCommunityVouch: vouchReceived.isCommunityVouch,
              isAutoVouched: vouchReceived.isAutoVouched,
              isInitiator: vouchReceived.voucheeId === currentUserId,
              approvedAt: vouchReceived.approvedAt,
              activatedAt: vouchReceived.activatedAt,
              givenAt: vouchReceived.createdAt,
            },
          };
        } else if (vouchGiven) {
          relationship.vouch.status = 'GIVEN';
          relationship.vouch.details = {
            id: vouchGiven.id,
            type: vouchGiven.vouchType,
            status: vouchGiven.status,
            message: vouchGiven.message,
            weightPercentage: vouchGiven.weightPercentage,
            trustImpact: vouchGiven.trustImpact,
            isCommunityVouch: vouchGiven.isCommunityVouch,
            communityId: vouchGiven.communityId,
            isAutoVouched: vouchGiven.isAutoVouched,
            autoVouchCriteria: vouchGiven.autoVouchCriteria,
            isInitiator: vouchGiven.voucheeId === currentUserId,
            approvedAt: vouchGiven.approvedAt,
            activatedAt: vouchGiven.activatedAt,
            givenAt: vouchGiven.createdAt,
            direction: 'given',
          };
        } else if (vouchReceived) {
          relationship.vouch.status = 'RECEIVED';
          relationship.vouch.details = {
            id: vouchReceived.id,
            type: vouchReceived.vouchType,
            status: vouchReceived.status,
            message: vouchReceived.message,
            weightPercentage: vouchReceived.weightPercentage,
            trustImpact: vouchReceived.trustImpact,
            isCommunityVouch: vouchReceived.isCommunityVouch,
            communityId: vouchReceived.communityId,
            isAutoVouched: vouchReceived.isAutoVouched,
            autoVouchCriteria: vouchReceived.autoVouchCriteria,
            isInitiator: vouchReceived.voucheeId === currentUserId,
            approvedAt: vouchReceived.approvedAt,
            activatedAt: vouchReceived.activatedAt,
            givenAt: vouchReceived.createdAt,
            direction: 'received',
          };
        } else if (vouchOffer) {
          relationship.vouch.status = 'PENDING_OFFER';
          relationship.vouch.details = {
            id: vouchOffer.id,
            communityId: vouchOffer.communityId,
            community: vouchOffer.community,
            eligibilityReason: vouchOffer.eligibilityReason,
            expiresAt: vouchOffer.expiresAt,
            direction: 'offer',
          };
        }

        // Get trust match information
        const { getTrustLevelInfo } = await import('../../middleware/trust-level.middleware');
        const currentUserData = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: { trustScore: true, trustLevel: true },
        });

        if (currentUserData) {
          const currentUserTrustInfo = await getTrustLevelInfo(currentUserData.trustScore);
          const profileUserTrustInfo = await getTrustLevelInfo(user.trustScore);
          
          // Calculate trust level difference
          const trustLevels = ['starter', 'trusted', 'leader'];
          const currentUserLevelIndex = trustLevels.indexOf(currentUserTrustInfo.level.toLowerCase());
          const profileUserLevelIndex = trustLevels.indexOf(profileUserTrustInfo.level.toLowerCase());
          const difference = Math.abs(currentUserLevelIndex - profileUserLevelIndex);

          relationship.trustMatch = {
            compatible: difference <= 1, // Within 1 level
            currentUserLevel: currentUserTrustInfo.label,
            profileUserLevel: profileUserTrustInfo.label,
            difference,
            canVouch: currentUserData.trustScore >= 50, // Minimum trust to vouch
          };
        }

        // Get mutual connections
        const [viewerConnections, profileConnections] = await Promise.all([
          prisma.userConnection.findMany({
            where: {
              OR: [
                { initiatorId: currentUserId, status: 'ACCEPTED' },
                { receiverId: currentUserId, status: 'ACCEPTED' },
              ],
            },
            select: { initiatorId: true, receiverId: true },
          }),
          prisma.userConnection.findMany({
            where: {
              OR: [
                { initiatorId: id, status: 'ACCEPTED' },
                { receiverId: id, status: 'ACCEPTED' },
              ],
            },
            select: { initiatorId: true, receiverId: true },
          }),
        ]);

        const viewerConnectionIds = viewerConnections.map(conn => 
          conn.initiatorId === currentUserId ? conn.receiverId : conn.initiatorId
        );
        const profileConnectionIds = profileConnections.map(conn => 
          conn.initiatorId === id ? conn.receiverId : conn.initiatorId
        );

        const mutualIds = viewerConnectionIds.filter(connId => 
          profileConnectionIds.includes(connId)
        );

        relationship.mutualConnections.count = mutualIds.length;

        if (mutualIds.length > 0) {
          const mutualUsers = await prisma.user.findMany({
            where: { id: { in: mutualIds.slice(0, 5) } },
            select: {
              id: true,
              fullName: true,
              username: true,
              profile: {
                select: { profilePicture: true },
              },
            },
          });

          relationship.mutualConnections.topConnections = mutualUsers.map(u => ({
            id: u.id,
            fullName: u.fullName,
            username: u.username,
            profilePicture: getProfilePictureUrl(u.profile?.profilePicture) || null,
          }));
        }
      }

      // ==================== SECTION 2: STATISTICS ====================
      const [
        connectionsCount,
        connectionsThisMonth,
        communitiesCounts,
        eventsAttendedCount,
        eventsHostingCount,
        eventsUpcomingCount,
        marketplaceStats,
        travelStatsData,
        cardGameCount,
        vouchCounts,
      ] = await Promise.all([
        // Connections total
        prisma.userConnection.count({
          where: {
            OR: [
              { initiatorId: id, status: 'ACCEPTED' },
              { receiverId: id, status: 'ACCEPTED' },
            ],
          },
        }),
        // Connections this month
        prisma.userConnection.count({
          where: {
            OR: [
              { initiatorId: id, status: 'ACCEPTED' },
              { receiverId: id, status: 'ACCEPTED' },
            ],
            connectedAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        // Communities counts
        prisma.communityMember.groupBy({
          by: ['role'],
          where: {
            userId: id,
            isApproved: true,
          },
          _count: true,
        }),
        // Events attended
        prisma.eventParticipant.count({
          where: {
            userId: id,
            status: 'CHECKED_IN',
          },
        }),
        // Events hosting
        prisma.event.count({
          where: {
            hostId: id,
            status: 'PUBLISHED',
          },
        }),
        // Events upcoming
        prisma.eventParticipant.count({
          where: {
            userId: id,
            status: 'REGISTERED',
            events: {
              date: { gte: new Date() },
            },
          },
        }),
        // Marketplace stats
        prisma.marketplaceListing.groupBy({
          by: ['status'],
          where: { userId: id },
          _count: true,
        }),
        // Travel stats
        prisma.travelTrip.findMany({
          where: { userId: id },
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        }),
        // Card game stats - count sessions
        prisma.cardGameSession.count({
          where: { userId: id },
        }),
        // Vouch counts
        Promise.all([
          prisma.vouch.count({
            where: {
              voucheeId: id,
              status: { in: ['APPROVED', 'ACTIVE'] },
            },
          }),
          prisma.vouch.count({
            where: {
              voucherId: id,
              status: { in: ['APPROVED', 'ACTIVE'] },
            },
          }),
          prisma.vouch.count({
            where: {
              voucheeId: id,
              status: { in: ['APPROVED', 'ACTIVE'] },
              vouchType: 'PRIMARY',
            },
          }),
          prisma.vouch.count({
            where: {
              voucheeId: id,
              status: { in: ['APPROVED', 'ACTIVE'] },
              vouchType: 'SECONDARY',
            },
          }),
        ]),
      ]);

      const statistics = {
        connections: {
          total: connectionsCount,
          thisMonth: connectionsThisMonth,
        },
        communities: {
          member: communitiesCounts.find(c => c.role === 'MEMBER')?._count || 0,
          moderator: communitiesCounts.find(c => c.role === 'MODERATOR')?._count || 0,
          // founder: communitiesCounts.find(c => c.role === 'ADMIN')?._count || 0,
        },
        events: {
          attended: eventsAttendedCount,
          hosting: eventsHostingCount,
          upcoming: eventsUpcomingCount,
        },
        marketplace: {
          activeListings: marketplaceStats.find(s => s.status === 'ACTIVE')?._count || 0,
          soldItems: marketplaceStats.find(s => s.status === 'SOLD')?._count || 0,
          rating: 0, // TODO: Calculate from marketplace reviews
          transactions: marketplaceStats.reduce((sum, s) => sum + s._count, 0),
        },
        travel: {
          tripsCompleted: travelStatsData.filter(t => new Date(t.endDate) < new Date()).length,
          citiesVisited: new Set(travelStatsData.map(t => t.title)).size,
          upcomingTrips: travelStatsData.filter(t => new Date(t.startDate) > new Date()).length,
        },
        cardGame: {
          played: cardGameCount,
          won: 0, // TODO: Track wins separately
          currentStreak: 0, // TODO: Calculate streak
        },
      };

      // ==================== SECTION 3: SHARED ACTIVITIES ====================
      let sharedActivities = {
        communities: { count: 0, list: [] as any[] },
        events: { count: 0, recent: [] as any[] },
        travelTrips: { count: 0, trips: [] as any[] },
        marketplaceInteractions: {
          transactionCount: 0,
          hasOpenConversations: false,
        },
      };

      if (currentUserId) {
        // Shared communities
        const sharedCommunities = await prisma.communityMember.findMany({
          where: {
            userId: id,
            isApproved: true,
            communities: {
              communityMembers: {
                some: {
                  userId: currentUserId,
                  isApproved: true,
                },
            },
          },
        },
        include: {
          communities: {
            include: {
              communityMembers: {
                where: { userId: currentUserId },
              },
            },
          },
        },
        take: 10,
      });

      sharedActivities.communities = {
        count: sharedCommunities.length,
        list: sharedCommunities.map(cm => ({
          id: cm.communities.id,
          name: cm.communities.name,
          logo: cm.communities.logoUrl,
          memberSince: cm.joinedAt,
          roles: {
            currentUser: cm.communities.communityMembers[0]?.role || 'MEMBER',
            profileUser: cm.role,
          },
        })),
      };        // Shared events
        const sharedEvents = await prisma.eventParticipant.findMany({
          where: {
            userId: id,
            events: {
              eventParticipants: {
                some: {
                  userId: currentUserId,
                },
              },
            },
          },
          select: {
            events: {
              select: {
                id: true,
                title: true,
                date: true,
                type: true,
                eventParticipants: {
                  where: {
                    OR: [
                      { userId: currentUserId },
                      { userId: id },
                    ],
                  },
                  select: {
                    userId: true,
                    status: true,
                  },
                },
              },
            },
          },
          orderBy: {
            events: {
              date: 'desc',
            },
          },
          take: 5,
        });

        sharedActivities.events = {
          count: sharedEvents.length,
          recent: sharedEvents.map(ep => ({
            id: ep.events.id,
            title: ep.events.title,
            date: ep.events.date,
            type: ep.events.type,
            attendedTogether: ep.events.eventParticipants.every(p => p.status === 'CHECKED_IN'),
          })),
        };

        // Shared travel trips (via companions)
        const sharedTrips = await prisma.travelCompanion.findMany({
          where: {
            OR: [
              {
                userId: id,
                companionId: currentUserId,
              },
              {
                userId: currentUserId,
                companionId: id,
              },
            ],
          },
          include: {
            travelTrips: true,
          },
          take: 5,
        });

        sharedActivities.travelTrips = {
          count: sharedTrips.length,
          trips: sharedTrips.map(tc => tc.travelTrips),
        };

        // Marketplace interactions
        const marketplaceTransactions = await prisma.marketplaceOrder.count({
          where: {
            OR: [
              { buyerId: currentUserId, sellerId: id },
              { buyerId: id, sellerId: currentUserId },
            ],
          },
        });

        sharedActivities.marketplaceInteractions = {
          transactionCount: marketplaceTransactions,
          hasOpenConversations: false, // TODO: Check messages
        };
      }

      // ==================== SECTION 4: RECENT ACTIVITY ====================
      const [recentActivities, recentTrustMoments] = await Promise.all([
        prisma.userActivity.findMany({
          where: {
            userId: id,
            visibility: 'PUBLIC',
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            activityType: true,
            entityType: true,
            entityId: true,
            createdAt: true,
            visibility: true,
          },
        }),
        prisma.trustMoment.findMany({
          where: {
            receiverId: id,
            isPublic: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            momentType: true,
            experienceDescription: true,
            trustImpact: true,
            createdAt: true,
          },
        }),
      ]);

      // Fetch entity details for activities
      const activityDetails = await Promise.all(
        recentActivities.map(async (activity) => {
          let entityDetails = null;
          
          try {
            switch (activity.entityType) {
              case 'EVENT':
                const event = await prisma.event.findUnique({
                  where: { id: activity.entityId },
                  select: { id: true, title: true, type: true, date: true },
                });
                entityDetails = event ? { title: event.title, type: event.type, date: event.date } : null;
                break;
                
              case 'COMMUNITY':
                const community = await prisma.community.findUnique({
                  where: { id: activity.entityId },
                  select: { id: true, name: true, logoUrl: true },
                });
                entityDetails = community ? { name: community.name, logo: community.logoUrl } : null;
                break;
                
              case 'CONNECTION':
                const connection = await prisma.userConnection.findUnique({
                  where: { id: activity.entityId },
                  select: {
                    users_user_connections_initiatorIdTousers: { select: { id: true, fullName: true } },
                    users_user_connections_receiverIdTousers: { select: { id: true, fullName: true } },
                  },
                });
                if (connection) {
                  const otherUser = connection.users_user_connections_initiatorIdTousers.id === id
                    ? connection.users_user_connections_receiverIdTousers
                    : connection.users_user_connections_initiatorIdTousers;
                  entityDetails = { connectedWith: otherUser.fullName };
                }
                break;
                
              case 'MARKETPLACE':
                const listing = await prisma.marketplaceListing.findUnique({
                  where: { id: activity.entityId },
                  select: { 
                    id: true, 
                    title: true, 
                    type: true, 
                    category: true,
                    pricingOptions: {
                      where: { isDefault: true },
                      select: { price: true, currency: true, pricingType: true },
                      take: 1,
                    },
                  },
                });
                if (listing) {
                  const pricing = listing.pricingOptions[0];
                  entityDetails = { 
                    title: listing.title, 
                    type: listing.type,
                    category: listing.category,
                    price: pricing?.price, 
                    currency: pricing?.currency,
                    pricingType: pricing?.pricingType,
                  };
                } else {
                  entityDetails = null;
                }
                break;
                
              case 'TRAVEL':
                const trip = await prisma.travelTrip.findUnique({
                  where: { id: activity.entityId },
                  select: { id: true, title: true, countries: true, cities: true, startDate: true, endDate: true },
                });
                entityDetails = trip ? { 
                  title: trip.title, 
                  countries: trip.countries, 
                  cities: trip.cities,
                  startDate: trip.startDate, 
                  endDate: trip.endDate 
                } : null;
                break;
            }
          } catch (error) {
            // Entity might have been deleted, continue without details
          }
          
          return {
            type: activity.activityType,
            entityType: activity.entityType,
            entityDetails,
            date: activity.createdAt,
            visibility: activity.visibility,
          };
        })
      );

      const recentActivity = {
        highlights: activityDetails,
        trustMoments: recentTrustMoments.map(tm => ({
          id: tm.id,
          type: tm.momentType,
          description: tm.experienceDescription || '',
          points: tm.trustImpact,
          date: tm.createdAt,
        })),
      };

      // ==================== SECTION 5: PRIVACY & PERMISSIONS ====================
      const isConnected = relationship.connection.status === 'CONNECTED';
      const privacy = {
        profileVisibility: user.privacy?.profileVisibility || 'public',
        canMessage: isConnected || (user.privacy?.allowDirectMessages ?? true),
        canVouch: isConnected && (relationship.vouch.status === 'NONE'),
        canConnect: relationship.connection.status === 'NONE',
        showEmail: isConnected,
        showPhone: isConnected,
        allowMessagesViaPhone: user.privacy?.allowMessagesViaPhone ?? true,
        showBirthDate: false, // Never show birth date when viewing others
        showLocation: user.privacy?.showLocation ?? true,
        locationPrecision: user.privacy?.locationPrecision || 'city',
      };

      // ==================== SECTION 6: TRUST & REPUTATION ====================
      const { getTrustLevelInfo } = await import('../../middleware/trust-level.middleware');
      const trustLevelInfo = await getTrustLevelInfo(user.trustScore);

      const trust = {
        score: Math.ceil(user.trustScore),
        level: user.trustLevel,
        badges: (user.userBadges || []).map(ub => ({
          id: ub.badges.id,
          name: ub.badges.name,
          icon: ub.badges.imageUrl,
          earnedAt: ub.earnedAt,
        })),
        vouches: {
          received: vouchCounts[0],
          given: vouchCounts[1],
          activePrimary: vouchCounts[2],
          activeSecondary: vouchCounts[3],
        },
        verifications: {
          email: !!user.security?.emailVerifiedAt,
          phone: !!user.security?.phoneVerifiedAt,
          identity: false, // Not tracked in schema
          background: false, // Not tracked in schema
        },
      };

      // ==================== SECTION 7: BUILD FINAL RESPONSE ====================
      
      // ==================== SERVICES SUMMARY ====================
      const services = {
        homeSurf: {
          isEnabled: user.homeSurf?.isEnabled || false,
          hasProfile: !!user.homeSurf,
        },
        berseGuide: {
          isEnabled: user.berseGuide?.isEnabled || false,
          hasProfile: !!user.berseGuide,
        },
      };

      const response = {
        // Relationship status (always included when viewing others)
        relationship: currentUserId ? relationship : undefined,

        // Basic profile information
        profile: {
        id: user.id,
        fullName: user.fullName,
        displayName: user.profile?.displayName || null,
        username: user.username,
        email: privacy.showEmail ? user.email : null,
        phone: privacy.showPhone ? user.phone : null,
        profilePicture: getProfilePictureUrl(user.profile?.profilePicture) || null,
        bio: user.profile?.bio || null,
        shortBio: user.profile?.shortBio || null,
        location: (() => {
          const filteredLocation = filterLocationByPrivacy(user.location, user.privacy, false);
          if (!filteredLocation) return null;
          return {
            city: filteredLocation.currentCity || null,
            country: filteredLocation.countryOfResidence || null,
            coordinates: filteredLocation.latitude && filteredLocation.longitude ? {
              lat: filteredLocation.latitude,
              lng: filteredLocation.longitude,
            } : null,
          };
        })(),
        birthDate: privacy.showBirthDate ? user.profile?.dateOfBirth : null,
        age: user.profile?.age || null,
        gender: user.profile?.gender || null,
        interests: user.profile?.interests || [],
        languages: user.profile?.languages || [],
        profession: user.profile?.profession || null,
        occupation: user.profile?.occupation || null,
        personalityType: user.profile?.personalityType || null,
        travelStyle: user.profile?.travelStyle || null,
        bucketList: user.profile?.bucketList || [],
        travelBio: user.profile?.travelBio || null,
        website: user.profile?.website || null,
        socialLinks: {
          instagram: user.profile?.instagramHandle || null,
          linkedin: user.profile?.linkedinHandle || null,
        },
        joinedAt: user.createdAt,
        lastActiveAt: user.security?.lastSeenAt || null,
      },

        // Services (HomeSurf & BerseGuide)
        services,

        // Trust & reputation
        trust,

        // Activity statistics
        statistics,

        // Shared activities (always included when viewing others)
        sharedActivities: currentUserId ? sharedActivities : undefined,

        // Recent activity
        recentActivity,

        // Privacy & visibility controls
        privacy,
      };

      // Apply URL transformations
      const finalResponse = UserController.transformUserResponse(response);

      sendSuccess(res, finalResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all mutual connections between current user and another user
   * @route GET /v2/users/:userId/mutual-connections
   */
  static async getMutualConnections(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      const { userId: targetUserId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!currentUserId) {
        throw new AppError('Authentication required', 401);
      }

      if (currentUserId === targetUserId) {
        throw new AppError('Cannot get mutual connections with yourself', 400);
      }

      // Check if target user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true }
      });

      if (!targetUser) {
        throw new AppError('User not found', 404);
      }

      // Get viewing user's connections
      const viewerConnections = await prisma.userConnection.findMany({
        where: {
          OR: [
            { initiatorId: currentUserId, status: 'ACCEPTED' },
            { receiverId: currentUserId, status: 'ACCEPTED' }
          ]
        },
        select: {
          initiatorId: true,
          receiverId: true,
          connectedAt: true
        }
      });

      const viewerConnectionIds = viewerConnections.map(conn => 
        conn.initiatorId === currentUserId ? conn.receiverId : conn.initiatorId
      );

      // Get target user's connections
      const targetConnections = await prisma.userConnection.findMany({
        where: {
          OR: [
            { initiatorId: targetUserId, status: 'ACCEPTED' },
            { receiverId: targetUserId, status: 'ACCEPTED' }
          ]
        },
        select: {
          initiatorId: true,
          receiverId: true
        }
      });

      const targetConnectionIds = targetConnections.map(conn => 
        conn.initiatorId === targetUserId ? conn.receiverId : conn.initiatorId
      );

      // Find mutual connection IDs
      const mutualIds = viewerConnectionIds.filter(connId => 
        targetConnectionIds.includes(connId)
      );

      const totalMutuals = mutualIds.length;
      const skip = (page - 1) * limit;
      const paginatedMutualIds = mutualIds.slice(skip, skip + limit);

      // Fetch mutual connection details with connection date
      const mutualConnections = await prisma.user.findMany({
        where: {
          id: { in: paginatedMutualIds }
        },
        select: {
          id: true,
          fullName: true,
          username: true,
          trustScore: true,
          trustLevel: true,
          profile: {
            select: {
              profilePicture: true
            }
          },
          location: {
            select: {
              currentCity: true
            }
          }
        }
      });

      // Add connection dates
      const connectionsWithDates = mutualConnections.map(user => {
        const viewerConnection = viewerConnections.find(conn => 
          (conn.initiatorId === user.id || conn.receiverId === user.id)
        );
        
        return {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          profilePicture: getProfilePictureUrl(user.profile?.profilePicture) || null,
          trustScore: user.trustScore,
          trustLevel: user.trustLevel,
          currentCity: user.location?.currentCity || null,
          connectedSince: viewerConnection?.connectedAt || null
        };
      });

      // Transform URLs
      const transformedConnections = connectionsWithDates.map(user => 
        UserController.transformUserResponse(user)
      );

      sendSuccess(res, {
        mutualConnections: transformedConnections,
        pagination: {
          page,
          limit,
          total: totalMutuals,
          totalPages: Math.ceil(totalMutuals / limit),
          hasMore: page * limit < totalMutuals
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send connection request to a user
   * @route POST /v2/users/connections/:id/request
   */
  static async sendConnectionRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const initiatorId = req.user?.id!;
      const { id: receiverId } = req.params;
      const { message, relationshipType, relationshipCategory } = req.body;

      if (initiatorId === receiverId) {
        throw new AppError('Cannot send connection request to yourself', 400);
      }

      // Check if target user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true, status: true },
      });

      if (!targetUser) {
        throw new AppError('User not found', 404);
      }

      if (targetUser.status !== 'ACTIVE') {
        throw new AppError('Cannot send connection request to inactive user', 400);
      }

      // Check if connection already exists
      const existingConnection = await prisma.userConnection.findFirst({
        where: {
          OR: [
            { initiatorId, receiverId },
            { initiatorId: receiverId, receiverId: initiatorId },
          ],
        },
      });

      if (existingConnection) {
        if (existingConnection.status === 'PENDING') {
          throw new AppError('Connection request already pending', 400);
        }
        if (existingConnection.status === 'ACCEPTED') {
          throw new AppError('Already connected with this user', 400);
        }
        if (existingConnection.status === 'REMOVED' && existingConnection.canReconnectAt) {
          if (new Date() < existingConnection.canReconnectAt) {
            throw new AppError(`Cannot reconnect until ${existingConnection.canReconnectAt.toISOString()}`, 400);
          }
        }
      }

      // Get initiator details for notification
      const initiator = await prisma.user.findUnique({
        where: { id: initiatorId },
        select: { fullName: true, username: true },
      });

      // Create connection request and notification in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Delete any old removed connection
        if (existingConnection) {
          await tx.userConnection.delete({
            where: { id: existingConnection.id },
          });
        }

        // Create new connection request
        const connection = await tx.userConnection.create({
          data: {
            id: createId(),
            initiatorId,
            receiverId,
            status: 'PENDING',
            message: message || undefined,
            relationshipType: relationshipType || undefined,
            relationshipCategory: relationshipCategory || undefined,
          } as any,
          include: {
            users_user_connections_initiatorIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
            users_user_connections_receiverIdTousers: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            id: crypto.randomUUID(),
            userId: receiverId,
            type: 'MESSAGE',
            title: 'New Connection Request',
            message: `${initiator?.fullName || initiator?.username} wants to connect with you`,
            actionUrl: `/connections/requests`,
            metadata: {
              connectionId: connection.id,
              initiatorId,
              initiatorName: initiator?.fullName || initiator?.username,
              type: 'connection_request',
            },
          } as any,
        });

        return connection;
      });

      logger.info('Connection request sent', { initiatorId, receiverId });
      sendSuccess(res, result, 'Connection request sent successfully', 201);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Connection request already exists', 400);
      }
      next(error);
    }
  }

  /**
   * Accept connection request
   * @route POST /v2/users/connections/:id/accept
   */
  static async acceptConnectionRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { id: connectionId } = req.params;

      const connection = await prisma.userConnection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) {
        throw new AppError('Connection request not found', 404);
      }

      if (connection.receiverId !== userId) {
        throw new AppError('You can only accept requests sent to you', 403);
      }

      if (connection.status !== 'PENDING') {
        throw new AppError('Connection request is not pending', 400);
      }

      // Accept connection and create notification in transaction
      const result = await prisma.$transaction(async (tx) => {
        const updatedConnection = await tx.userConnection.update({
          where: { id: connectionId },
          data: {
            status: 'ACCEPTED',
            respondedAt: new Date(),
            connectedAt: new Date(),
          },
          include: {
            users_user_connections_initiatorIdTousers: {
              select: {
                id: true,
                fullName: true,
                profile: { select: { profilePicture: true } },
              },
            },
            users_user_connections_receiverIdTousers: {
              select: {
                id: true,
                fullName: true,
                profile: { select: { profilePicture: true } },
              },
            },
          },
        });

        // Get receiver name from the connection
        const receiverUser = await tx.user.findUnique({
          where: { id: userId },
          select: { fullName: true },
        });

        // Notify the initiator
        await tx.notification.create({
          data: {
            id: crypto.randomUUID(),
            userId: connection.initiatorId,
            type: 'MESSAGE',
            title: 'Connection Accepted',
            message: `${receiverUser?.fullName || 'Someone'} accepted your connection request`,
            actionUrl: `/profile/${userId}`,
            metadata: {
              connectionId,
              type: 'connection_accepted',
            },
          } as any,
        });

        return updatedConnection;
      });

      logger.info('Connection request accepted', { connectionId, userId });
      
      // Emit point events for both users (automatic badge checking happens via pointsEvents)
      try {
        const { pointsEvents } = await import('../../services/points-events.service');
        
        // Check if this is first connection for each user
        const [initiatorConnectionCount, receiverConnectionCount] = await Promise.all([
          prisma.userConnection.count({
            where: {
              OR: [
                { initiatorId: connection.initiatorId, status: 'ACCEPTED' },
                { receiverId: connection.initiatorId, status: 'ACCEPTED' },
              ],
            },
          }),
          prisma.userConnection.count({
            where: {
              OR: [
                { initiatorId: connection.receiverId, status: 'ACCEPTED' },
                { receiverId: connection.receiverId, status: 'ACCEPTED' },
              ],
            },
          }),
        ]);

        const receiverName = result.users_user_connections_receiverIdTousers?.fullName || 'someone';
        const initiatorName = result.users_user_connections_initiatorIdTousers?.fullName || 'someone';

        // Emit events (this will automatically trigger badge checks)
        if (initiatorConnectionCount === 1) {
          pointsEvents.trigger('connection.first.made', connection.initiatorId, { partnerName: receiverName });
        } else {
          pointsEvents.trigger('connection.made', connection.initiatorId, { partnerName: receiverName });
        }

        if (receiverConnectionCount === 1) {
          pointsEvents.trigger('connection.first.made', connection.receiverId, { partnerName: initiatorName });
        } else {
          pointsEvents.trigger('connection.received', connection.receiverId, { partnerName: initiatorName });
        }
      } catch (pointsError) {
        logger.error('Failed to emit points events after connection acceptance', { error: pointsError });
        // Don't fail the connection acceptance if points/badge events fail
      }
      
      sendSuccess(res, result, 'Connection request accepted');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject connection request
   * @route POST /v2/users/connections/:id/reject
   */
  static async rejectConnectionRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { id: connectionId } = req.params;

      const connection = await prisma.userConnection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) {
        throw new AppError('Connection request not found', 404);
      }

      if (connection.receiverId !== userId) {
        throw new AppError('You can only reject requests sent to you', 403);
      }

      if (connection.status !== 'PENDING') {
        throw new AppError('Connection request is not pending', 400);
      }

      await prisma.userConnection.update({
        where: { id: connectionId },
        data: {
          status: 'REJECTED',
          respondedAt: new Date(),
        },
      });

      logger.info('Connection request rejected', { connectionId, userId });
      sendSuccess(res, null, 'Connection request rejected');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel sent connection request
   * @route POST /v2/users/connections/:id/cancel
   */
  static async cancelConnectionRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { id: connectionId } = req.params;

      const connection = await prisma.userConnection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) {
        throw new AppError('Connection request not found', 404);
      }

      if (connection.initiatorId !== userId) {
        throw new AppError('You can only cancel requests you sent', 403);
      }

      if (connection.status !== 'PENDING') {
        throw new AppError('Can only cancel pending requests', 400);
      }

      await prisma.userConnection.update({
        where: { id: connectionId },
        data: {
          status: 'CANCELED',
          respondedAt: new Date(),
        },
      });

      logger.info('Connection request canceled', { connectionId, userId });
      sendSuccess(res, null, 'Connection request canceled');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove/Disconnect from a user
   * @route DELETE /v2/users/connections/:id
   */
  static async removeConnection(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { id: connectionId } = req.params;

      const connection = await prisma.userConnection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) {
        throw new AppError('Connection not found', 404);
      }

      // Check if user is part of the connection
      if (connection.initiatorId !== userId && connection.receiverId !== userId) {
        throw new AppError('You can only remove your own connections', 403);
      }

      // Check if connection is in a removable state
      if (connection.status !== 'ACCEPTED') {
        throw new AppError('Can only remove accepted connections', 400);
      }

      // Calculate reconnect cooldown (30 days from now)
      const canReconnectAt = new Date();
      canReconnectAt.setDate(canReconnectAt.getDate() + 30);

      await prisma.userConnection.update({
        where: { id: connectionId },
        data: {
          status: 'REMOVED',
          removedAt: new Date(),
          removedBy: userId,
          canReconnectAt,
        },
      });

      logger.info('Connection removed', { connectionId, userId });
      sendSuccess(res, { canReconnectAt }, 'Connection removed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's connections
   * @route GET /v2/users/connections
   */
  static async getConnections(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { status, page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const whereClause: any = {
        OR: [
          { initiatorId: userId },
          { receiverId: userId },
        ],
      };

      if (status) {
        whereClause.status = status;
      }

      const [connections, total] = await Promise.all([
        prisma.userConnection.findMany({
          where: whereClause,
          include: {
            users_user_connections_initiatorIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                profile: {
                  select: {
                    profilePicture: true,
                    bio: true,
                  },
                },
              },
            },
            users_user_connections_receiverIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                profile: {
                  select: {
                    profilePicture: true,
                    bio: true,
                  },
                },
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.userConnection.count({ where: whereClause }),
      ]);

      // Normalize the connection response to have friendly key names
      const normalizedConnections = connections.map((conn: any) => {
        const { 
          users_user_connections_initiatorIdTousers, 
          users_user_connections_receiverIdTousers,
          badges,
          interactionCount,
          lastInteraction,
          tags,
          trustStrength,
          ...rest 
        } = conn;
        
        return {
          ...rest,
          initiator: users_user_connections_initiatorIdTousers,
          receiver: users_user_connections_receiverIdTousers,
        };
      });

      sendSuccess(res, {
        connections: normalizedConnections,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get another user's connections (ACCEPTED only)
   * @route GET /v2/users/:userId/connections
   */
  static async getUserConnections(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id!;
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Check if user exists
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, status: true }
      });

      if (!userExists || userExists.status !== 'ACTIVE') {
        throw new AppError('User not found', 404);
      }

      const skip = (Number(page) - 1) * Number(limit);
      
      // Only return ACCEPTED connections for privacy
      const whereClause: any = {
        OR: [
          { initiatorId: userId },
          { receiverId: userId },
        ],
        status: 'ACCEPTED', // Only show accepted connections
      };

      const [connections, total] = await Promise.all([
        prisma.userConnection.findMany({
          where: whereClause,
          include: {
            users_user_connections_initiatorIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
                profile: {
                  select: {
                    profilePicture: true,
                    bio: true,
                  },
                },
              },
            },
            users_user_connections_receiverIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
                profile: {
                  select: {
                    profilePicture: true,
                    bio: true,
                  },
                },
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: {
            connectedAt: 'desc',
          },
        }),
        prisma.userConnection.count({ where: whereClause }),
      ]);

      // Get current user's connections to calculate mutual connections
      const currentUserConnections = await prisma.userConnection.findMany({
        where: {
          OR: [
            { initiatorId: currentUserId },
            { receiverId: currentUserId },
          ],
          status: 'ACCEPTED',
        },
        select: { initiatorId: true, receiverId: true },
      });

      const currentUserConnectionIds = currentUserConnections.map((conn) =>
        conn.initiatorId === currentUserId ? conn.receiverId : conn.initiatorId
      );

      // Import storage service for URL conversion
      const { storageService } = await import('../../services/storage.service');

      // Helper function to convert profile picture key to full URL
      const getProfilePictureUrl = (profilePicture: string | null): string | null => {
        if (!profilePicture) return null;
        // If already a full URL (starts with http/https or data:), return as-is
        if (profilePicture.startsWith('http://') || 
            profilePicture.startsWith('https://') || 
            profilePicture.startsWith('data:')) {
          return profilePicture;
        }
        // Convert key to full URL
        return storageService.getPublicUrl(profilePicture);
      };

      // Normalize the connection response and add mutual connections/communities
      const normalizedConnections = await Promise.all(connections.map(async (conn: any) => {
        const { 
          users_user_connections_initiatorIdTousers, 
          users_user_connections_receiverIdTousers,
          badges,
          interactionCount,
          lastInteraction,
          tags,
          trustStrength,
          ...rest 
        } = conn;

        // Determine the other user in this connection (the one who is NOT the profile owner)
        const otherUserId = conn.initiatorId === userId ? conn.receiverId : conn.initiatorId;
        const otherUser = conn.initiatorId === userId 
          ? users_user_connections_receiverIdTousers 
          : users_user_connections_initiatorIdTousers;

        // Get mutual connections and communities between current user and the other person
        let mutualConnections: any[] = [];
        let mutualCommunities: any[] = [];
        
        if (currentUserId !== userId && currentUserId !== otherUserId) {
          // Get other user's connections
          const otherUserConnections = await prisma.userConnection.findMany({
            where: {
              OR: [
                { initiatorId: otherUserId },
                { receiverId: otherUserId },
              ],
              status: 'ACCEPTED',
            },
            select: { initiatorId: true, receiverId: true },
          });

          const otherUserConnectionIds = otherUserConnections.map((c) =>
            c.initiatorId === otherUserId ? c.receiverId : c.initiatorId
          );

          // Find mutual connection IDs (excluding the target user)
          const mutualIds = currentUserConnectionIds.filter((id) =>
            otherUserConnectionIds.includes(id) && id !== userId
          );

          // Get details of mutual connections
          if (mutualIds.length > 0) {
            mutualConnections = await prisma.user.findMany({
              where: { id: { in: mutualIds } },
              select: {
                id: true,
                fullName: true,
                username: true,
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            });
          }

          // Get mutual communities
          const [currentUserCommunities, otherUserCommunities] = await Promise.all([
            prisma.communityMember.findMany({
              where: { userId: currentUserId, isApproved: true },
              select: { communityId: true },
            }),
            prisma.communityMember.findMany({
              where: { userId: otherUserId, isApproved: true },
              select: { communityId: true },
            }),
          ]);

          const currentUserCommunityIds = currentUserCommunities.map((cm) => cm.communityId);
          const otherUserCommunityIds = otherUserCommunities.map((cm) => cm.communityId);

          // Find mutual community IDs
          const mutualCommunityIds = currentUserCommunityIds.filter((id) =>
            otherUserCommunityIds.includes(id)
          );

          // Get details of mutual communities
          if (mutualCommunityIds.length > 0) {
            mutualCommunities = await prisma.community.findMany({
              where: { id: { in: mutualCommunityIds } },
              select: {
                id: true,
                name: true,
                description: true,
                logoUrl: true,
                coverImageUrl: true,
                _count: {
                  select: { communityMembers: true },
                },
              },
            });
          }
        }

        // Get trust level info for the other user
        const { getTrustLevelInfo } = await import('../../middleware/trust-level.middleware');
        const trustLevelInfo = await getTrustLevelInfo(otherUser.trustScore || 0);

        // Add mutual data to the other user object
        const otherUserWithMutuals = {
          ...otherUser,
          trustScore: Math.round((otherUser.trustScore || 0) * 10) / 10,
          trustLevel: trustLevelInfo.level,
          trustLevelLabel: trustLevelInfo.label,
          profile: otherUser.profile ? {
            ...otherUser.profile,
            profilePicture: getProfilePictureUrl(otherUser.profile.profilePicture),
          } : null,
          mutualConnections: mutualConnections.map((mc: any) => ({
            id: mc.id,
            fullName: mc.fullName,
            username: mc.username,
            profilePicture: getProfilePictureUrl(mc.profile?.profilePicture),
          })),
          mutualCommunities: mutualCommunities.map((cm: any) => ({
            id: cm.id,
            name: cm.name,
            description: cm.description,
            logoUrl: cm.logoUrl,
            coverImageUrl: cm.coverImageUrl,
            memberCount: cm._count?.communityMembers || 0,
          })),
        };

        // Convert profile picture and trust level for the profile owner user as well
        const ownerUserData = conn.initiatorId === userId 
          ? users_user_connections_initiatorIdTousers
          : users_user_connections_receiverIdTousers;
        
        const ownerTrustLevelInfo = await getTrustLevelInfo(ownerUserData.trustScore || 0);
        
        const profileOwnerUser = {
          ...ownerUserData,
          trustScore: Math.round((ownerUserData.trustScore || 0) * 10) / 10,
          trustLevel: ownerTrustLevelInfo.level,
          trustLevelLabel: ownerTrustLevelInfo.label,
          profile: ownerUserData.profile ? {
            ...ownerUserData.profile,
            profilePicture: getProfilePictureUrl(ownerUserData.profile.profilePicture),
          } : null,
        };
        
        return {
          ...rest,
          initiator: conn.initiatorId === userId 
            ? profileOwnerUser
            : otherUserWithMutuals,
          receiver: conn.receiverId === userId 
            ? profileOwnerUser
            : otherUserWithMutuals,
        };
      }));

      sendSuccess(res, {
        connections: normalizedConnections,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (admin only)
   * @route DELETE /v2/users/:id
   */
  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestingUser = req.user;
      const { id: userIdToDelete } = req.params;

      // Check if requesting user is admin
      const isAdmin = requestingUser?.email === 'zaydmahdaly@ahlumran.org' || 
                     requestingUser?.role === 'ADMIN';

      if (!isAdmin) {
        throw new AppError('Unauthorized: Admin access required', 403);
      }

      // Soft delete by updating status
      await prisma.user.update({
        where: { id: userIdToDelete },
        data: {
          status: 'DEACTIVATED',
          deletedAt: new Date(),
        },
      });

      logger.info('User deleted', { adminId: requestingUser?.id, deletedUserId: userIdToDelete });
      sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload profile picture
   * @route POST /v2/users/upload-avatar
   */
  static async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { image } = req.body; // For base64 image
      const file = req.file; // For file upload

      let profilePictureKey: string; // Store key, not URL
      let uploadedFileKey: string | undefined;
      let fullUrl: string; // For response only

      if (image) {
        // Handle base64 image (legacy support) - store as-is
        profilePictureKey = image;
        fullUrl = image;
      } else if (file) {
        // Check if storage service is configured
        const { storageService } = await import('../../services/storage.service');
        
        // If storage is not configured, convert file to base64 as fallback
        if (!storageService['isConfigured']) {
          logger.warn('Storage service not configured, falling back to base64', { userId });
          const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          profilePictureKey = base64;
          fullUrl = base64;
        } else {
          // Upload to Digital Ocean Spaces
          const uploadResult = await storageService.uploadFile(file, 'avatars', {
            optimize: true,
            isPublic: true,
            userId,
          });

          // Store only the key in database
          profilePictureKey = uploadResult.key;
          uploadedFileKey = uploadResult.key;
          fullUrl = uploadResult.url; // For response

          logger.info('Avatar uploaded to Spaces', {
            userId,
            key: uploadResult.key,
            url: uploadResult.url,
            size: uploadResult.size,
          });
        }
      } else {
        throw new AppError('No image provided', 400);
      }

      // Get current profile to check for old avatar
      const currentProfile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { profilePicture: true },
      });

      // Update user's profile picture with KEY only
      await prisma.userProfile.upsert({
        where: { userId },
        update: {
          profilePicture: profilePictureKey,
        },
        create: {
          userId,
          profilePicture: profilePictureKey,
        } as any,
      });

      // Delete old avatar from Spaces if it exists
      if (currentProfile?.profilePicture && uploadedFileKey) {
        try {
          const { storageService } = await import('../../services/storage.service');
          // Old value might be a key or a full URL (legacy data)
          const oldKey = currentProfile.profilePicture.startsWith('http://') || 
                         currentProfile.profilePicture.startsWith('https://')
            ? storageService.extractKeyFromUrl(currentProfile.profilePicture)
            : currentProfile.profilePicture;
            
          if (oldKey && !oldKey.startsWith('data:')) { // Don't try to delete base64 images
            await storageService.deleteFile(oldKey);
            logger.info('Old avatar deleted from Spaces', { userId, oldKey });
          }
        } catch (error) {
          logger.warn('Failed to delete old avatar', { userId, error });
          // Don't fail the request if old file deletion fails
        }
      }

      logger.info('Profile picture uploaded', { userId });
      // Return full URL in response for immediate use
      sendSuccess(res, { profilePicture: fullUrl }, 'Profile picture uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user activity history
   * @route GET /v2/users/activity
   */
  static async getUserActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const activities = await ActivityLoggerService.getUserActivityHistory(userId, limit, offset);
      
      const total = await prisma.userActivity.count({
        where: { userId },
      });

      sendSuccess(res, {
        activities,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      }, 'User activity retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user security events
   * @route GET /v2/users/security-events
   */
  static async getUserSecurityEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const events = await ActivityLoggerService.getUserSecurityEvents(userId, limit, offset);
      
      const total = await prisma.securityEvent.count({
        where: { userId },
      });

      sendSuccess(res, {
        events,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      }, 'Security events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user active sessions
   * @route GET /v2/users/sessions
   */
  static async getUserSessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;

      const sessions = await ActivityLoggerService.getUserActiveSessions(userId);

      sendSuccess(res, { sessions }, 'Active sessions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user login history
   * @route GET /v2/users/login-history
   */
  static async getUserLoginHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const attempts = await ActivityLoggerService.getUserLoginHistory(userId, limit, offset);
      
      const total = await prisma.loginAttempt.count({
        where: { userId },
      });

      sendSuccess(res, {
        loginHistory: attempts,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      }, 'Login history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Terminate a specific session
   * @route DELETE /v2/users/sessions/:sessionToken
   */
  static async terminateSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { sessionToken } = req.params;

      await ActivityLoggerService.terminateSession(sessionToken, userId);

      sendSuccess(res, null, 'Session terminated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all trust levels configuration
   * @route GET /v2/users/trust-levels
   */
  static async getTrustLevels(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const trustLevels = [
        {
          level: 'new',
          label: 'New',
          minScore: 0,
          maxScore: 19,
          color: '#9CA3AF',
          description: 'Just getting started',
          icon: '🌱',
          benefits: [
            'Create profile',
            'Join events',
            'Connect with others'
          ]
        },
        {
          level: 'starter',
          label: 'Starter',
          minScore: 20,
          maxScore: 39,
          color: '#60A5FA',
          description: 'Building connections',
          icon: '🌿',
          benefits: [
            'All New benefits',
            'Host small events',
            'Request vouches'
          ]
        },
        {
          level: 'growing',
          label: 'Growing',
          minScore: 40,
          maxScore: 59,
          color: '#34D399',
          description: 'Active community member',
          icon: '🌳',
          benefits: [
            'All Starter benefits',
            'Host medium events',
            'Vouch for others',
            'Access to premium events'
          ]
        },
        {
          level: 'established',
          label: 'Established',
          minScore: 60,
          maxScore: 74,
          color: '#FBBF24',
          description: 'Trusted community member',
          icon: '⭐',
          benefits: [
            'All Growing benefits',
            'Host large events',
            'Priority support',
            'Special badges'
          ]
        },
        {
          level: 'trusted',
          label: 'Trusted',
          minScore: 75,
          maxScore: 89,
          color: '#F59E0B',
          description: 'Highly trusted member',
          icon: '🏆',
          benefits: [
            'All Established benefits',
            'Featured profile',
            'Verification fast-track',
            'Community moderator eligibility'
          ]
        },
        {
          level: 'elite',
          label: 'Elite',
          minScore: 90,
          maxScore: 100,
          color: '#8B5CF6',
          description: 'Top tier community leader',
          icon: '👑',
          benefits: [
            'All Trusted benefits',
            'VIP event access',
            'Leadership opportunities',
            'Exclusive community features',
            'Revenue sharing eligibility'
          ]
        }
      ];

      sendSuccess(res, { trustLevels });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available gender options
   * @route GET /v2/users/gender-options
   */
  static async getGenderOptions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const genderOptions = [
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'NON_BINARY', label: 'Non-binary' },
        { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
        { value: 'OTHER', label: 'Other' }
      ];

      sendSuccess(res, { genderOptions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available interest categories
   * @route GET /v2/users/interest-categories
   */
  static async getInterestCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const interestCategories = [
        {
          category: 'Adventure',
          interests: ['Hiking', 'Camping', 'Rock Climbing', 'Surfing', 'Skiing', 'Scuba Diving']
        },
        {
          category: 'Arts & Culture',
          interests: ['Museums', 'Art Galleries', 'Theater', 'Music Concerts', 'Photography', 'Dance']
        },
        {
          category: 'Food & Drink',
          interests: ['Cooking', 'Fine Dining', 'Street Food', 'Wine Tasting', 'Coffee', 'Craft Beer']
        },
        {
          category: 'Sports & Fitness',
          interests: ['Running', 'Yoga', 'Gym', 'Cycling', 'Swimming', 'Martial Arts', 'Team Sports']
        },
        {
          category: 'Technology',
          interests: ['Coding', 'Gaming', 'AI/ML', 'Startups', 'Cryptocurrency', 'Web3']
        },
        {
          category: 'Social Impact',
          interests: ['Volunteering', 'Environment', 'Education', 'Community Service', 'Sustainability']
        },
        {
          category: 'Learning',
          interests: ['Languages', 'Reading', 'Writing', 'History', 'Science', 'Philosophy']
        },
        {
          category: 'Entertainment',
          interests: ['Movies', 'TV Shows', 'Anime', 'Board Games', 'Comedy', 'Podcasts']
        },
        {
          category: 'Lifestyle',
          interests: ['Fashion', 'Beauty', 'Wellness', 'Meditation', 'Personal Development', 'Travel']
        },
        {
          category: 'Business',
          interests: ['Entrepreneurship', 'Investing', 'Marketing', 'Networking', 'Real Estate']
        }
      ];

      sendSuccess(res, { interestCategories });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get communities for a specific user
   * @route GET /v2/users/:id/communities
   */
  static async getUserCommunities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id;

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, fullName: true, username: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get user's communities
      const communityMemberships = await prisma.communityMember.findMany({
        where: {
          userId: id,
          isApproved: true,
        },
        include: {
          communities: {
            include: {
              _count: {
                select: {
                  communityMembers: true,
                  events: true,
                },
              },
            },
          },
        },
        orderBy: {
          joinedAt: 'desc',
        },
      });

      // Transform communities and check if current user is also a member
      const communities = await Promise.all(
        communityMemberships.map(async (membership) => {
          const community = membership.communities;
          
          // Check if current user is also a member (for shared communities indicator)
          let isShared = false;
          let currentUserRole = null;
          
          if (currentUserId && currentUserId !== id) {
            const currentUserMembership = await prisma.communityMember.findFirst({
              where: {
                communityId: community.id,
                userId: currentUserId,
                isApproved: true,
              },
              select: { role: true },
            });
            
            if (currentUserMembership) {
              isShared = true;
              currentUserRole = currentUserMembership.role;
            }
          }

          return {
            id: community.id,
            name: community.name,
            description: community.description,
            logoUrl: community.logoUrl,
            coverImageUrl: community.coverImageUrl,
            interests: community.interests,
            isVerified: community.isVerified,
            memberCount: community._count.communityMembers,
            eventCount: community._count.events,
            userRole: membership.role,
            joinedAt: membership.joinedAt,
            // Only include these if viewing another user's communities
            ...(currentUserId !== id && {
              isShared,
              yourRole: currentUserRole,
            }),
          };
        })
      );

      // Group by role
      const grouped = {
        founded: communities.filter(c => c.userRole === 'OWNER'),
        moderating: communities.filter(c => c.userRole === 'ADMIN' || c.userRole === 'MODERATOR'),
        member: communities.filter(c => c.userRole === 'MEMBER'),
      };

      const stats = {
        total: communities.length,
        founded: grouped.founded.length,
        moderating: grouped.moderating.length,
        member: grouped.member.length,
        shared: communities.filter(c => c.isShared).length,
      };

      sendSuccess(res, {
        user: {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
        },
        stats,
        communities: {
          all: communities,
          grouped,
        },
      }, `Retrieved ${communities.length} communities for user`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get services for a specific user (HomeSurf & BerseGuide)
   * @route GET /v2/users/:id/services
   */
  static async getUserServices(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id;

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id },
        select: { 
          id: true, 
          fullName: true, 
          username: true,
          profile: {
            select: {
              profilePicture: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Fetch HomeSurf profile with stats
      const homeSurf = await prisma.userHomeSurf.findUnique({
        where: { userId: id },
        include: {
          paymentOptions: true,
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
      });

      // Fetch BerseGuide profile with stats
      const berseGuide = await prisma.userBerseGuide.findUnique({
        where: { userId: id },
        include: {
          paymentOptions: true,
          _count: {
            select: {
              bookings: true,
              reviews: true,
              sessions: true,
            },
          },
        },
      });

      // Get additional booking stats for HomeSurf
      let homeSurfStats = null;
      if (homeSurf) {
        const [completedBookings, approvedBookings, totalGuests] = await Promise.all([
          prisma.homeSurfBooking.count({
            where: {
              hostId: id,
              status: 'COMPLETED',
            },
          }),
          prisma.homeSurfBooking.count({
            where: {
              hostId: id,
              status: { in: ['APPROVED', 'CHECKED_IN'] },
            },
          }),
          prisma.homeSurfBooking.aggregate({
            where: {
              hostId: id,
              status: 'COMPLETED',
            },
            _sum: {
              numberOfGuests: true,
            },
          }),
        ]);

        homeSurfStats = {
          totalBookings: homeSurf._count.bookings,
          completedBookings,
          upcomingBookings: approvedBookings,
          totalGuests: totalGuests._sum.numberOfGuests || homeSurf.totalGuests || 0,
          rating: homeSurf.rating || 0,
          reviewCount: homeSurf._count.reviews,
          responseRate: homeSurf.responseRate || 0,
          averageResponseTime: homeSurf.averageResponseTime || null,
        };
      }

      // Get additional booking stats for BerseGuide
      let berseGuideStats = null;
      if (berseGuide) {
        const now = new Date();
        const [completedSessions, approvedBookings, upcomingSessions] = await Promise.all([
          // Completed sessions = sessions that have already occurred (date in the past)
          prisma.berseGuideSession.count({
            where: {
              guideId: id,
              date: { lt: now },
            },
          }),
          // Approved bookings = bookings that are approved or in progress
          prisma.berseGuideBooking.count({
            where: {
              guideId: id,
              status: { in: ['APPROVED', 'IN_PROGRESS'] },
            },
          }),
          // Upcoming sessions = sessions scheduled for the future
          prisma.berseGuideSession.count({
            where: {
              guideId: id,
              date: { gte: now },
            },
          }),
        ]);

        berseGuideStats = {
          totalBookings: berseGuide._count.bookings,
          totalSessions: berseGuide._count.sessions,
          completedSessions,
          upcomingSessions,
          totalToursGiven: berseGuide.totalSessions || completedSessions,
          rating: berseGuide.rating || 0,
          reviewCount: berseGuide._count.reviews,
          responseRate: berseGuide.responseRate || 0,
          averageResponseTime: berseGuide.averageResponseTime || null,
          yearsGuiding: berseGuide.yearsGuiding || null,
        };
      }

      // Check if current user has interacted with these services
      let userInteractions = null;
      if (currentUserId && currentUserId !== id) {
        const [homeSurfBooking, berseGuideBooking] = await Promise.all([
          homeSurf ? prisma.homeSurfBooking.findFirst({
            where: {
              hostId: id,
              guestId: currentUserId,
            },
            select: {
              id: true,
              status: true,
              checkInDate: true,
              checkOutDate: true,
            },
            orderBy: { requestedAt: 'desc' },
          }) : null,
          berseGuide ? prisma.berseGuideBooking.findFirst({
            where: {
              guideId: id,
              travelerId: currentUserId,
            },
            select: {
              id: true,
              status: true,
              agreedDate: true,
            },
            orderBy: { requestedAt: 'desc' },
          }) : null,
        ]);

        userInteractions = {
          homeSurf: homeSurfBooking ? {
            hasBookedBefore: true,
            lastBooking: homeSurfBooking,
          } : null,
          berseGuide: berseGuideBooking ? {
            hasBookedBefore: true,
            lastBooking: berseGuideBooking,
          } : null,
        };
      }

      // Transform HomeSurf data
      const homeSurfData = homeSurf ? {
        isEnabled: homeSurf.isEnabled,
        title: homeSurf.title,
        description: homeSurf.description,
        accommodationType: homeSurf.accommodationType,
        maxGuests: homeSurf.maxGuests,
        amenities: homeSurf.amenities,
        houseRules: homeSurf.houseRules,
        photos: homeSurf.photos,
        paymentOptions: homeSurf.paymentOptions.map(opt => ({
          id: opt.id,
          paymentType: opt.paymentType,
          amount: opt.amount,
          currency: opt.currency,
          description: opt.description,
          isPreferred: opt.isPreferred,
        })),
        availabilityNotes: homeSurf.availabilityNotes,
        minimumStay: homeSurf.minimumStay,
        maximumStay: homeSurf.maximumStay,
        advanceNotice: homeSurf.advanceNotice,
        city: homeSurf.city,
        neighborhood: homeSurf.neighborhood,
        stats: homeSurfStats,
        createdAt: homeSurf.createdAt,
        updatedAt: homeSurf.updatedAt,
        lastActiveAt: homeSurf.lastActiveAt,
      } : {
        isEnabled: false,
        profileExists: false,
        message: 'User has not set up a HomeSurf hosting profile',
      };

      // Transform BerseGuide data
      const berseGuideData = berseGuide ? {
        isEnabled: berseGuide.isEnabled,
        title: berseGuide.title,
        description: berseGuide.description,
        tagline: berseGuide.tagline,
        guideTypes: berseGuide.guideTypes,
        customTypes: berseGuide.customTypes,
        languages: berseGuide.languages,
        city: berseGuide.city,
        neighborhoods: berseGuide.neighborhoods,
        coverageRadius: berseGuide.coverageRadius,
        paymentOptions: berseGuide.paymentOptions.map(opt => ({
          id: opt.id,
          paymentType: opt.paymentType,
          amount: opt.amount,
          currency: opt.currency,
          description: opt.description,
          isPreferred: opt.isPreferred,
        })),
        availabilityNotes: berseGuide.availabilityNotes,
        typicalDuration: berseGuide.typicalDuration,
        minDuration: berseGuide.minDuration,
        maxDuration: berseGuide.maxDuration,
        maxGroupSize: berseGuide.maxGroupSize,
        advanceNotice: berseGuide.advanceNotice,
        yearsGuiding: berseGuide.yearsGuiding,
        photos: berseGuide.photos,
        highlights: berseGuide.highlights,
        sampleItinerary: berseGuide.sampleItinerary,
        stats: berseGuideStats,
        createdAt: berseGuide.createdAt,
        updatedAt: berseGuide.updatedAt,
        lastActiveAt: berseGuide.lastActiveAt,
      } : {
        isEnabled: false,
        profileExists: false,
        message: 'User has not set up a BerseGuide tour profile',
      };

      const response = {
        user: {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          profilePicture: getProfilePictureUrl(user.profile?.profilePicture),
        },
        services: {
          homeSurf: homeSurfData,
          berseGuide: berseGuideData,
        },
        summary: {
          hasHomeSurf: !!homeSurf && homeSurf.isEnabled,
          hasBerseGuide: !!berseGuide && berseGuide.isEnabled,
          activeServicesCount: [homeSurf?.isEnabled, berseGuide?.isEnabled].filter(Boolean).length,
        },
        ...(userInteractions && { userInteractions }),
      };

      const servicesCount = response.summary.activeServicesCount;
      const message = servicesCount > 0 
        ? `User has ${servicesCount} active service${servicesCount > 1 ? 's' : ''}`
        : 'User has no active services';

      sendSuccess(res, response, message);
    } catch (error) {
      next(error);
    }
  }
}
