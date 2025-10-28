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

export class UserController {
  /**
   * Helper function to ensure consistent response format
   * Transforms storage keys to full URLs dynamically
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
            currentScore: Math.round(user.trustScore * 10) / 10,
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
      if (data.email !== undefined) userUpdate.email = data.email;
      if (data.phone !== undefined) userUpdate.phone = data.phone;

      // Profile fields
      if (data.displayName !== undefined) profileUpdate.displayName = data.displayName;
      if (data.profilePicture !== undefined) profileUpdate.profilePicture = data.profilePicture;
      if (data.bio !== undefined) profileUpdate.bio = data.bio;
      if (data.fullBio !== undefined) profileUpdate.bio = data.fullBio;  // Alias
      if (data.shortBio !== undefined) profileUpdate.shortBio = data.shortBio;
      if (data.dateOfBirth !== undefined) {
        profileUpdate.dateOfBirth = new Date(data.dateOfBirth);
        // Auto-calculate age from date of birth
        const birthDate = new Date(data.dateOfBirth);
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
      const updatedUser = await prisma.$transaction(async (tx) => {
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

        // Fetch updated user
        return tx.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            username: true,
            role: true,
            totalPoints: true,
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
              },
            },
            location: {
              select: {
                currentCity: true,
                countryOfResidence: true,
                currentLocation: true,
                nationality: true,
                originallyFrom: true,
              },
            },
            metadata: {
              select: {
                membershipId: true,
                referralCode: true,
              },
            },
          },
        });
      });

      logger.info('User profile updated', { userId });
      sendSuccess(res, updatedUser, 'Profile updated successfully');
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
   * @route GET /v2/users/all
   */
  static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      // Sanitize pagination parameters
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * limitNum;

      // Get all users except the current user
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            id: { not: currentUserId },
            status: 'ACTIVE',
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            totalPoints: true,
            profile: {
              select: {
                profilePicture: true,
                bio: true,
                shortBio: true,
                age: true,
                profession: true,
                interests: true,
                languages: true,
                personalityType: true,
              },
            },
            location: {
              select: {
                currentCity: true,
                currentLocation: true,
                originallyFrom: true,
              },
            },
            metadata: {
              select: {
                membershipId: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.user.count({
          where: {
            id: { not: currentUserId },
            status: 'ACTIVE',
          },
        }),
      ]);

      // Transform to flat structure
      const transformedUsers = users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        totalPoints: user.totalPoints,
        profilePicture: user.profile?.profilePicture,
        bio: user.profile?.bio || user.profile?.shortBio,
        interests: user.profile?.interests || [],
        profession: user.profile?.profession,
        age: user.profile?.age,
        personalityType: user.profile?.personalityType,
        languages: user.profile?.languages || [],
        location: {
          city: user.location?.currentCity,
          currentLocation: user.location?.currentLocation,
          originallyFrom: user.location?.originallyFrom,
        },
        membershipId: user.metadata?.membershipId,
      }));

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

      const where: any = {
        status: 'ACTIVE',
        deletedAt: null,
      };

      // Exclude current user
      if (currentUserId) {
        where.id = { not: currentUserId };
      }

      // Text search
      if (query) {
        where.OR = [
          { fullName: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
          { profile: { bio: { contains: query, mode: 'insensitive' } } },
        ];
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

      // Email verification filter
      if (isVerified === 'true' || isVerified === true) {
        where.security = {
          emailVerifiedAt: { not: null },
        };
      }

      // Exclude connected users if requested
      if (excludeConnected === 'true' || excludeConnected === true) {
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

          const connectedUserIds = connections.map(c =>
            c.initiatorId === currentUserId ? c.receiverId : c.initiatorId
          );

          if (connectedUserIds.length > 0) {
            where.id = { ...where.id, notIn: connectedUserIds };
          }
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
              profilePicture: mc.profile?.profilePicture,
            })),
          };
        });
      }

      // Transform response
      const transformedUsers = usersWithMutuals.map((user: any) => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        trustScore: user.trustScore,
        trustLevel: user.trustLevel,
        profilePicture: user.profile?.profilePicture,
        bio: user.profile?.bio || user.profile?.shortBio,
        interests: user.profile?.interests || [],
        gender: user.profile?.gender,
        profession: user.profile?.profession,
        location: {
          city: user.location?.currentCity,
          country: user.location?.countryOfResidence,
        },
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
      }));

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
              profilePicture: mc.profile?.profilePicture,
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
        profilePicture: rec.user.profile?.profilePicture,
        bio: rec.user.profile?.bio || rec.user.profile?.shortBio,
        interests: rec.user.profile?.interests || [],
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
              profilePicture: mc.profile?.profilePicture,
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
        profilePicture: user.profile?.profilePicture,
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
      const [vouchesReceived, vouchesGiven, activePrimaryVouches, activeSecondaryVouches] = await Promise.all([
        prisma.vouch.count({
          where: { voucheeId: userId, status: { in: ['APPROVED', 'ACTIVE'] } },
        }),
        prisma.vouch.count({
          where: { voucherId: userId, status: { in: ['APPROVED', 'ACTIVE'] } },
        }),
        prisma.vouch.count({
          where: { voucheeId: userId, vouchType: 'PRIMARY', status: 'ACTIVE' },
        }),
        prisma.vouch.count({
          where: { voucheeId: userId, vouchType: 'SECONDARY', status: 'ACTIVE' },
        }),
      ]);

      const trust = {
        score: user.trustScore,
        level: user.trustLevel,
        badges: (user.userBadges || []).map(ub => ({
          id: ub.badges.id,
          name: ub.badges.name,
          description: ub.badges.description,
          imageUrl: ub.badges.imageUrl,
          earnedAt: ub.earnedAt,
        })),
        vouches: {
          received: vouchesReceived,
          given: vouchesGiven,
          activePrimary: activePrimaryVouches,
          activeSecondary: activeSecondaryVouches,
        },
        verifications: {
          email: !!user.security?.emailVerifiedAt,
          phone: !!user.security?.phoneVerifiedAt,
          identity: false, // TODO: Implement identity verification
          background: false, // TODO: Implement background check
        },
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
          profilePicture: user.profile?.profilePicture || null,
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
              status: { in: ['APPROVED', 'ACTIVE'] },
            },
            select: {
              id: true,
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
              status: { in: ['APPROVED', 'ACTIVE'] },
            },
            select: {
              id: true,
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
            profilePicture: u.profile?.profilePicture || null,
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

      const recentActivity = {
        highlights: recentActivities.map(activity => ({
          type: activity.activityType,
          title: activity.activityType, // Use activityType as title
          date: activity.createdAt,
          visibility: activity.visibility,
        })),
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
        showBirthDate: false, // Never show birth date when viewing others
        showLocation: true, // Always show location
      };

      // ==================== SECTION 6: TRUST & REPUTATION ====================
      const { getTrustLevelInfo } = await import('../../middleware/trust-level.middleware');
      const trustLevelInfo = await getTrustLevelInfo(user.trustScore);

      const trust = {
        score: Math.round(user.trustScore * 10) / 10,
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
        profilePicture: user.profile?.profilePicture || null,
        bio: user.profile?.bio || null,
        shortBio: user.profile?.shortBio || null,
        location: privacy.showLocation ? {
          city: user.location?.currentCity || null,
          country: user.location?.countryOfResidence || null,
          coordinates: user.location?.latitude && user.location?.longitude ? {
            lat: user.location.latitude,
            lng: user.location.longitude,
          } : null,
        } : null,
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
          profilePicture: user.profile?.profilePicture || null,
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

      sendSuccess(res, {
        connections,
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
        // Upload to Digital Ocean Spaces
        const { storageService } = await import('../../services/storage.service');
        
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
}
