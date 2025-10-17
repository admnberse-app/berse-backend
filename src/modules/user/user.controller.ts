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

export class UserController {
  /**
   * Helper function to transform ugly Prisma relation names to simple readable names
   */
  private static transformUserResponse(user: any) {
    if (user && user._count) {
      const { 
        user_connections_user_connections_initiatorIdTousers,
        user_connections_user_connections_receiverIdTousers,
        referrals_referrals_referrerIdTousers,
        ...otherCounts 
      } = user._count;

      user._count = {
        ...otherCounts,
        connectionsInitiated: user_connections_user_connections_initiatorIdTousers || 0,
        connectionsReceived: user_connections_user_connections_receiverIdTousers || 0,
        referralsMade: referrals_referrals_referrerIdTousers || 0,
      };
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

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          username: true,
          role: true,
          totalPoints: true,
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
          _count: {
            select: {
              events: true,
              eventRsvps: true,
              referrals_referrals_referrerIdTousers: true,
              userBadges: true,
              user_connections_user_connections_initiatorIdTousers: true,
              user_connections_user_connections_receiverIdTousers: true,
            },
          },
          connectionStats: {
            select: {
              totalConnections: true,
              pendingRequests: true,
              averageRating: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Transform response to have cleaner count names
      const transformedUser = UserController.transformUserResponse(user);

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
      if (data.dateOfBirth !== undefined) profileUpdate.dateOfBirth = new Date(data.dateOfBirth);
      if (data.gender !== undefined) profileUpdate.gender = data.gender;
      if (data.age !== undefined) profileUpdate.age = data.age;
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

      sendSuccess(res, {
        users,
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
   * Search users
   * @route GET /v2/users/search
   */
  static async searchUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { city, interest, query, page = 1, limit = 20 }: UserSearchQuery = req.query as any;

      const where: any = {
        status: 'ACTIVE',
      };

      // Build search conditions
      if (city) {
        where.location = {
          OR: [
            { currentCity: { contains: city, mode: 'insensitive' } },
            { currentLocation: { contains: city, mode: 'insensitive' } },
          ],
        };
      }

      if (interest) {
        where.profile = {
          interests: { has: interest },
        };
      }

      if (query) {
        where.OR = [
          { fullName: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
          { profile: { bio: { contains: query, mode: 'insensitive' } } },
        ];
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
            profile: {
              select: {
                profilePicture: true,
                bio: true,
                shortBio: true,
                interests: true,
              },
            },
            location: {
              select: {
                currentCity: true,
              },
            },
          },
          skip,
          take: Number(limit),
        }),
        prisma.user.count({ where }),
      ]);

      sendSuccess(res, {
        users,
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
      const { limit = 10 } = req.query;

      const recommendations = await RecommendationsService.getRecommendations(
        currentUserId,
        Number(limit)
      );

      // Transform recommendations for response
      const transformedRecommendations = recommendations.map(rec => ({
        id: rec.userId,
        fullName: rec.user.fullName,
        username: rec.user.username,
        score: rec.score,
        reasons: rec.reasons,
        profile: {
          profilePicture: rec.user.profile?.profilePicture,
          bio: rec.user.profile?.bio,
          shortBio: rec.user.profile?.shortBio,
          interests: rec.user.profile?.interests || [],
          profession: rec.user.profile?.profession,
        },
        location: {
          currentCity: rec.user.location?.currentCity,
          originallyFrom: rec.user.location?.originallyFrom,
        },
        connectionStats: rec.user.connectionStats,
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
      const { latitude, longitude, radius = 10, page = 1, limit = 20 } = req.query;

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

      const total = nearbyUsers.length;

      sendSuccess(res, {
        users: nearbyUsers,
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
   * Get user by ID
   * @route GET /v2/users/:id
   */
  static async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          username: true,
          role: true,
          totalPoints: true,
          createdAt: true,
          profile: {
            select: {
              profilePicture: true,
              bio: true,
              interests: true,
              languages: true,
              profession: true,
            },
          },
          location: {
            select: {
              currentCity: true,
              originallyFrom: true,
            },
          },
                      _count: {
              select: {
                events: true,
                eventRsvps: true,
                userBadges: true,
                user_connections_user_connections_initiatorIdTousers: true,
                user_connections_user_connections_receiverIdTousers: true,
              },
            },
          connectionStats: {
            select: {
              totalConnections: true,
              averageRating: true,
              connectionQuality: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Transform response to have cleaner count names
      const transformedUser = UserController.transformUserResponse(user);

      sendSuccess(res, transformedUser);
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

      let profilePictureUrl;

      if (image) {
        // Handle base64 image
        profilePictureUrl = image;
      } else if (file) {
        // Handle file upload
        profilePictureUrl = `/uploads/${file.filename}`;
      } else {
        throw new AppError('No image provided', 400);
      }

      // Update user's profile picture
      await prisma.userProfile.upsert({
        where: { userId },
        update: {
          profilePicture: profilePictureUrl,
        },
        create: {
          userId,
          profilePicture: profilePictureUrl,
        } as any,
      });

      logger.info('Profile picture uploaded', { userId });
      sendSuccess(res, { profilePicture: profilePictureUrl }, 'Profile picture uploaded successfully');
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
}
