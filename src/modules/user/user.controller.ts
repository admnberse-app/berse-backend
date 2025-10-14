import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';
import { UpdateProfileRequest, UserSearchQuery } from './user.types';
import logger from '../../utils/logger';

export class UserController {
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
          _count: {
            select: {
              hostedEvents: true,
              attendedEvents: true,
              referrals: true,
              badges: true,
              connectionsInitiated: true,
              connectionsReceived: true,
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

      sendSuccess(res, user);
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

      // Location fields
      if (data.currentCity !== undefined) locationUpdate.currentCity = data.currentCity;
      if (data.city !== undefined) locationUpdate.currentCity = data.city;  // Alias
      if (data.currentLocation !== undefined) locationUpdate.currentLocation = data.currentLocation;
      if (data.countryOfResidence !== undefined) locationUpdate.countryOfResidence = data.countryOfResidence;
      if (data.nationality !== undefined) locationUpdate.nationality = data.nationality;
      if (data.originallyFrom !== undefined) locationUpdate.originallyFrom = data.originallyFrom;

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

      const skip = (Number(page) - 1) * Number(limit);

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
              hostedEvents: true,
              attendedEvents: true,
              badges: true,
              connectionsInitiated: true,
              connectionsReceived: true,
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

      sendSuccess(res, user);
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
            initiatorId,
            receiverId,
            status: 'PENDING',
            message: message || undefined,
            relationshipType: relationshipType || undefined,
            relationshipCategory: relationshipCategory || undefined,
          },
          include: {
            initiator: {
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
            receiver: {
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
          },
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
            initiator: {
              select: {
                id: true,
                fullName: true,
                profile: { select: { profilePicture: true } },
              },
            },
            receiver: {
              select: {
                id: true,
                fullName: true,
                profile: { select: { profilePicture: true } },
              },
            },
          },
        });

        // Notify the initiator
        await tx.notification.create({
          data: {
            userId: connection.initiatorId,
            type: 'MESSAGE',
            title: 'Connection Accepted',
            message: `${updatedConnection.receiver.fullName} accepted your connection request`,
            actionUrl: `/profile/${userId}`,
            metadata: {
              connectionId,
              type: 'connection_accepted',
            },
          },
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

      if (connection.initiatorId !== userId && connection.receiverId !== userId) {
        throw new AppError('You can only remove your own connections', 403);
      }

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
            initiator: {
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
            receiver: {
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
        },
      });

      logger.info('Profile picture uploaded', { userId });
      sendSuccess(res, { profilePicture: profilePictureUrl }, 'Profile picture uploaded successfully');
    } catch (error) {
      next(error);
    }
  }
}
