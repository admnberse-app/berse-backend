import { PrismaClient, CommunityRole, Prisma } from '@prisma/client';
import { AppError } from '../../middleware/error';
import { NotificationService } from '../../services/notification.service';
import logger from '../../utils/logger';
import QRCode from 'qrcode';
import type {
  CreateCommunityInput,
  UpdateCommunityInput,
  JoinCommunityInput,
  UpdateMemberRoleInput,
  RemoveMemberInput,
  CommunityQuery,
  CommunityMemberQuery,
  CommunityResponse,
  CommunityMemberResponse,
  CommunityStatsResponse,
  PaginatedCommunitiesResponse,
  PaginatedCommunityMembersResponse,
  CommunityVouchEligibilityResponse,
  UserBasicInfo,
  CommunityQRCodeResponse,
  PublicCommunityPreview,
} from './community.types';

const prisma = new PrismaClient();

export class CommunityService {
  // ============================================================================
  // COMMUNITY MANAGEMENT
  // ============================================================================

  /**
   * Create a new community
   */
  async createCommunity(userId: string, input: CreateCommunityInput): Promise<CommunityResponse> {
    try {
      // Check if community name already exists
      const existingCommunity = await prisma.community.findUnique({
        where: { name: input.name },
      });

      if (existingCommunity) {
        throw new AppError('Community name already exists', 409);
      }

      // Create community and add creator as ADMIN in a transaction
      const community = await prisma.$transaction(async (tx) => {
        // Create the community
        const newCommunity = await tx.community.create({
          data: {
            name: input.name,
            description: input.description,
            logoUrl: input.logoUrl,
            coverImageUrl: input.coverImageUrl,
            category: input.category,
            interests: input.interests || [],
            createdById: userId,
          },
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
            _count: {
              select: {
                communityMembers: true,
                events: true,
              },
            },
          },
        });

        // Add creator as ADMIN
        await tx.communityMember.create({
          data: {
            userId,
            communityId: newCommunity.id,
            role: 'ADMIN',
            isApproved: true,
          },
        });

        return newCommunity;
      });

      logger.info('Community created', { communityId: community.id, userId });

      return this.formatCommunityResponse(community, userId);
    } catch (error) {
      logger.error('Failed to create community', { error, userId, input });
      throw error;
    }
  }

  /**
   * Update community details
   */
  async updateCommunity(userId: string, input: UpdateCommunityInput): Promise<CommunityResponse> {
    try {
      const { communityId, ...updateData } = input;

      // Check if community exists
      const community = await prisma.community.findUnique({
        where: { id: communityId },
      });

      if (!community) {
        throw new AppError('Community not found', 404);
      }

      // Check permissions (admin or moderator)
      await this.checkPermission(userId, communityId, ['ADMIN', 'MODERATOR']);

      // If updating name, check uniqueness
      if (updateData.name && updateData.name !== community.name) {
        const existingCommunity = await prisma.community.findUnique({
          where: { name: updateData.name },
        });

        if (existingCommunity) {
          throw new AppError('Community name already exists', 409);
        }
      }

      // Update community
      const updatedCommunity = await prisma.community.update({
        where: { id: communityId },
        data: {
          ...updateData,
          socialLinks: updateData.socialLinks ? (updateData.socialLinks as any) : undefined,
        },
        include: {
          user: {
            include: {
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          _count: {
            select: {
              communityMembers: true,
              events: true,
            },
          },
        },
      });

      logger.info('Community updated', { communityId, userId });

      return this.formatCommunityResponse(updatedCommunity, userId);
    } catch (error) {
      logger.error('Failed to update community', { error, userId, input });
      throw error;
    }
  }

  /**
   * Delete community
   */
  async deleteCommunity(userId: string, communityId: string): Promise<void> {
    try {
      // Check if community exists
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: {
          _count: {
            select: {
              communityMembers: true,
              events: true,
            },
          },
        },
      });

      if (!community) {
        throw new AppError('Community not found', 404);
      }

      // Check admin permissions
      await this.checkPermission(userId, communityId, ['ADMIN']);

      // Delete community (cascading deletes handled by schema)
      await prisma.community.delete({
        where: { id: communityId },
      });

      logger.info('Community deleted', { communityId, userId, memberCount: community._count.communityMembers });
    } catch (error) {
      logger.error('Failed to delete community', { error, userId, communityId });
      throw error;
    }
  }

  /**
   * Get community by ID
   */
  async getCommunity(communityId: string, userId?: string): Promise<CommunityResponse> {
    try {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: {
          user: {
            include: {
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          _count: {
            select: {
              communityMembers: true,
              events: true,
            },
          },
        },
      });

      if (!community) {
        throw new AppError('Community not found', 404);
      }

      // Get member preview (first 5 members)
      const membersPreview = await prisma.communityMember.findMany({
        where: { communityId, isApproved: true },
        take: 5,
        orderBy: { joinedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustLevel: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      // Get upcoming events preview (first 3)
      const upcomingEvents = await prisma.event.findMany({
        where: {
          communityId,
          status: 'PUBLISHED',
          date: { gte: new Date() },
        },
        take: 3,
        orderBy: { date: 'asc' },
        select: {
          id: true,
          title: true,
          type: true,
          date: true,
          location: true,
          images: true,
          isFree: true,
          _count: {
            select: {
              eventParticipants: true,
            },
          },
        },
      });

      // Check user membership status
      let userMembership = null;
      let isAdmin = false;
      let isModerator = false;
      let isMember = false;

      if (userId) {
        userMembership = await prisma.communityMember.findUnique({
          where: {
            userId_communityId: {
              userId,
              communityId,
            },
          },
        });

        if (userMembership && userMembership.isApproved) {
          isMember = true;
          isAdmin = userMembership.role === 'ADMIN';
          isModerator = userMembership.role === 'MODERATOR';
        }
      }

      // Fetch detailed stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        allEvents,
        upcomingEventsCount,
        pastEventsCount,
        roleStats,
        totalVouches,
        lastEvent,
        lastMember,
        recentMembersCount,
        eventAttendanceStats,
      ] = await Promise.all([
        // Total events count
        prisma.event.count({
          where: { communityId },
        }),
        // Upcoming events
        prisma.event.count({
          where: {
            communityId,
            date: { gte: now },
            status: 'PUBLISHED',
          },
        }),
        // Past events
        prisma.event.count({
          where: {
            communityId,
            date: { lt: now },
          },
        }),
        // Admin/moderator counts
        prisma.communityMember.groupBy({
          by: ['role'],
          where: { communityId, isApproved: true },
          _count: true,
        }),
        // Total vouches given in community
        prisma.vouch.count({
          where: {
            communityId,
            isCommunityVouch: true,
            status: 'ACTIVE',
          },
        }),
        // Last event
        prisma.event.findFirst({
          where: { communityId },
          orderBy: { date: 'desc' },
          select: { date: true },
        }),
        // Last member joined
        prisma.communityMember.findFirst({
          where: { communityId, isApproved: true },
          orderBy: { joinedAt: 'desc' },
          select: { joinedAt: true },
        }),
        // Members joined in last 30 days
        prisma.communityMember.count({
          where: {
            communityId,
            isApproved: true,
            joinedAt: { gte: thirtyDaysAgo },
          },
        }),
        // Get all events with participant counts for average
        prisma.event.findMany({
          where: { communityId },
          select: {
            _count: {
              select: {
                eventParticipants: true,
              },
            },
          },
        }),
      ]);

      const adminCount = roleStats.find(r => r.role === 'ADMIN')?._count || 0;
      const moderatorCount = roleStats.find(r => r.role === 'MODERATOR')?._count || 0;

      // Calculate average event attendance from event participant counts
      const avgAttendance = eventAttendanceStats.length > 0
        ? eventAttendanceStats.reduce((sum, e) => sum + e._count.eventParticipants, 0) / eventAttendanceStats.length
        : 0;

      const formattedCommunity = this.formatCommunityResponse(community, userId);

      const response: CommunityResponse = {
        ...formattedCommunity,
        requiresApproval: community.requiresApproval,
        guidelines: community.guidelines || undefined,
        socialLinks: community.socialLinks as any || undefined,
        websiteUrl: community.websiteUrl || undefined,
        contactEmail: community.contactEmail || undefined,
        location: {
          city: community.city || undefined,
          country: community.country || undefined,
          latitude: community.latitude || undefined,
          longitude: community.longitude || undefined,
        },
        membersPreview: membersPreview.map(m => ({
          id: m.user.id,
          fullName: m.user.fullName,
          username: m.user.username,
          profilePicture: m.user.profile?.profilePicture,
          trustLevel: m.user.trustLevel || 'starter',
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
        })),
        upcomingEventsPreview: upcomingEvents.map(e => ({
          id: e.id,
          title: e.title,
          type: e.type,
          date: e.date.toISOString(),
          location: e.location,
          images: e.images,
          isFree: e.isFree,
          rsvpCount: e._count.eventParticipants,
        })),
        userStatus: {
          isMember,
          isAdmin,
          isModerator,
          isPending: userMembership?.isApproved === false,
          role: userMembership?.role,
          joinedAt: userMembership?.joinedAt?.toISOString(),
        },
        stats: {
          totalEvents: allEvents,
          upcomingEvents: upcomingEventsCount,
          pastEvents: pastEventsCount,
          adminCount,
          moderatorCount,
          totalVouchesGiven: totalVouches,
          lastEventDate: lastEvent?.date?.toISOString(),
          lastMemberJoinDate: lastMember?.joinedAt?.toISOString(),
          memberGrowthLast30Days: recentMembersCount,
          averageEventAttendance: Math.round(avgAttendance),
        },
      };

      // Only fetch and include admin data for admins/moderators
      if (isAdmin || isModerator) {
        const [pendingMembers, pendingVouches] = await Promise.all([
          prisma.communityMember.count({
            where: { communityId, isApproved: false },
          }),
          prisma.communityVouchOffer.count({
            where: { communityId, status: 'PENDING' },
          }),
        ]);

        response.adminData = {
          pendingMemberRequests: pendingMembers,
          pendingVouchOffers: pendingVouches,
          reportedContent: 0, // TODO: Implement when content reporting is added
        };
      }

      return response;
    } catch (error) {
      logger.error('Failed to get community', { error, communityId });
      throw error;
    }
  }

  /**
   * Get communities with filters
   */
  async getCommunities(query: CommunityQuery): Promise<PaginatedCommunitiesResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        interests,
        search,
        isVerified,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.CommunityWhereInput = {};

      // Filter by interests (preferred over category)
      if (interests && interests.length > 0) {
        where.interests = {
          hasSome: interests, // Matches if community has ANY of the specified interests
        };
      } else if (category) {
        // Fallback to category for backward compatibility
        where.category = category;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (isVerified !== undefined) {
        where.isVerified = isVerified;
      }

      // Build order by
      let orderBy: Prisma.CommunityOrderByWithRelationInput = {};
      if (sortBy === 'memberCount') {
        orderBy = { communityMembers: { _count: sortOrder } };
      } else {
        orderBy = { [sortBy]: sortOrder };
      }

      // Get communities and total count
      const [communities, totalCount] = await Promise.all([
        prisma.community.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
            _count: {
              select: {
                communityMembers: true,
                events: true,
              },
            },
          },
        }),
        prisma.community.count({ where }),
      ]);

      let isFallback = false;
      let resultCommunities = communities;

      // If no results and filters were applied, show fallback (all communities)
      if (communities.length === 0 && (category || search || isVerified !== undefined)) {
        logger.info('No communities found with filters, fetching fallback communities');
        
        const fallbackCommunities = await prisma.community.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
            _count: {
              select: {
                communityMembers: true,
                events: true,
              },
            },
          },
        });

        resultCommunities = fallbackCommunities;
        isFallback = fallbackCommunities.length > 0;
      }

      const totalPages = Math.ceil((isFallback ? resultCommunities.length : totalCount) / limit);

      return {
        communities: resultCommunities.map(c => this.formatCommunityResponse(c)),
        totalCount: isFallback ? resultCommunities.length : totalCount,
        page,
        limit,
        totalPages,
        ...(isFallback && { isFallback: true }),
      };
    } catch (error) {
      logger.error('Failed to get communities', { error, query });
      throw error;
    }
  }

  /**
   * Get communities user is member of
   */
  async getMyCommunities(userId: string, query: CommunityQuery): Promise<PaginatedCommunitiesResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        interests,
        search,
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.CommunityWhereInput = {
        communityMembers: {
          some: {
            userId,
            isApproved: true,
          },
        },
      };

      // Filter by interests (preferred over category)
      if (interests && interests.length > 0) {
        where.interests = {
          hasSome: interests,
        };
      } else if (category) {
        // Fallback to category for backward compatibility
        where.category = category;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get communities and total count
      const [communities, totalCount] = await Promise.all([
        prisma.community.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
            communityMembers: {
              where: { userId },
              select: {
                role: true,
                isApproved: true,
              },
            },
            _count: {
              select: {
                communityMembers: true,
                events: true,
              },
            },
          },
        }),
        prisma.community.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        communities: communities.map(c => this.formatCommunityResponse(c, userId)),
        totalCount,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Failed to get my communities', { error, userId, query });
      throw error;
    }
  }

  // ============================================================================
  // COMMUNITY MEMBERSHIP
  // ============================================================================

  /**
   * Join a community
   */
  async joinCommunity(userId: string, input: JoinCommunityInput): Promise<CommunityMemberResponse> {
    try {
      const { communityId } = input;

      // Check if community exists
      const community = await prisma.community.findUnique({
        where: { id: communityId },
      });

      if (!community) {
        throw new AppError('Community not found', 404);
      }

      // Check if already a member
      const existingMember = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
      });

      if (existingMember) {
        throw new AppError('Already a member or request pending', 409);
      }

      // Create membership record (pending approval)
      const member = await prisma.communityMember.create({
        data: {
          userId,
          communityId,
          role: 'MEMBER',
          isApproved: false,
        },
        include: {
          user: {
            include: {
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      logger.info('Community join request sent', { communityId, userId });

      return this.formatMemberResponse(member);
    } catch (error) {
      logger.error('Failed to join community', { error, userId, input });
      throw error;
    }
  }

  /**
   * Leave a community
   */
  async leaveCommunity(userId: string, communityId: string): Promise<void> {
    try {
      // Check if member exists
      const member = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
      });

      if (!member) {
        throw new AppError('Not a member of this community', 404);
      }

      // Prevent last admin from leaving
      if (member.role === 'ADMIN') {
        const isLast = await this.isLastAdmin(userId, communityId);
        if (isLast) {
          throw new AppError('Cannot leave as the last admin. Transfer admin role first or delete the community.', 400);
        }
      }

      // Delete membership record
      await prisma.communityMember.delete({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
      });

      // Update user stats (only if member was approved)
      if (member.isApproved) {
        try {
          const { UserStatService } = await import('../user/user-stat.service');
          await UserStatService.decrementCommunitiesJoined(userId);
          logger.info(`Decremented communitiesJoined for user ${userId}`);
        } catch (error) {
          logger.error('Failed to update user stat for community leave:', error);
        }
      }

      logger.info('User left community', { communityId, userId });
    } catch (error) {
      logger.error('Failed to leave community', { error, userId, communityId });
      throw error;
    }
  }

  /**
   * Approve member join request
   */
  async approveMember(adminUserId: string, communityId: string, userId: string): Promise<CommunityMemberResponse> {
    try {
      // Check admin/moderator permissions
      await this.checkPermission(adminUserId, communityId, ['ADMIN', 'MODERATOR']);

      // Get member
      const member = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
      });

      if (!member) {
        throw new AppError('Member not found', 404);
      }

      if (member.isApproved) {
        throw new AppError('Member already approved', 400);
      }

      // Update approval status
      const updatedMember = await prisma.communityMember.update({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
        data: {
          isApproved: true,
        },
        include: {
          user: {
            include: {
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      // Update user stats
      try {
        const { UserStatService } = await import('../user/user-stat.service');
        await UserStatService.incrementCommunitiesJoined(userId);
        logger.info(`Incremented communitiesJoined for user ${userId}`);
      } catch (error) {
        logger.error('Failed to update user stat for community join:', error);
      }

      // Get community for notification
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        select: { name: true },
      });

      // Notify user of approval
      if (community) {
        NotificationService.notifyCommunityJoinApproved(
          userId,
          communityId,
          community.name
        ).catch(err => logger.error('Failed to send join approval notification:', err));
      }

      logger.info('Member approved', { communityId, userId, adminUserId });

      return this.formatMemberResponse(updatedMember);
    } catch (error) {
      logger.error('Failed to approve member', { error, adminUserId, communityId, userId });
      throw error;
    }
  }

  /**
   * Reject member join request
   */
  async rejectMember(adminUserId: string, communityId: string, userId: string, reason?: string): Promise<void> {
    try {
      // Check admin/moderator permissions
      await this.checkPermission(adminUserId, communityId, ['ADMIN', 'MODERATOR']);

      // Get member
      const member = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
      });

      if (!member) {
        throw new AppError('Member not found', 404);
      }

      if (member.isApproved) {
        throw new AppError('Cannot reject an approved member. Use remove instead.', 400);
      }

      // Delete membership record
      await prisma.communityMember.delete({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
      });

      // Get community for notification
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        select: { name: true },
      });

      // Notify user of rejection
      if (community) {
        NotificationService.notifyCommunityJoinRejected(
          userId,
          communityId,
          community.name,
          reason
        ).catch(err => logger.error('Failed to send join rejection notification:', err));
      }

      logger.info('Member rejected', { communityId, userId, adminUserId, reason });
    } catch (error) {
      logger.error('Failed to reject member', { error, adminUserId, communityId, userId });
      throw error;
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(adminUserId: string, input: UpdateMemberRoleInput): Promise<CommunityMemberResponse> {
    try {
      const { communityId, userId, role } = input;

      // Check admin permissions (only admins can change roles)
      await this.checkPermission(adminUserId, communityId, ['ADMIN']);

      // Get member
      const member = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
      });

      if (!member) {
        throw new AppError('Member not found', 404);
      }

      if (!member.isApproved) {
        throw new AppError('Member must be approved before role change', 400);
      }

      // If demoting from admin, check if last admin
      if (member.role === 'ADMIN' && role !== 'ADMIN') {
        const isLast = await this.isLastAdmin(userId, communityId);
        if (isLast) {
          throw new AppError('Cannot demote the last admin', 400);
        }
      }

      // Update role
      const updatedMember = await prisma.communityMember.update({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
        data: {
          role,
        },
        include: {
          user: {
            include: {
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      // Get community for notification
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        select: { name: true },
      });

      if (community) {
        // Notify based on role change
        if (role === 'ADMIN') {
          NotificationService.notifyCommunityPromotedToOwner(
            userId,
            communityId,
            community.name
          ).catch(err => logger.error('Failed to send promotion to admin notification:', err));
        } else if (role === 'MODERATOR' && member.role === 'MEMBER') {
          NotificationService.notifyCommunityPromotedToModerator(
            userId,
            communityId,
            community.name
          ).catch(err => logger.error('Failed to send promotion to moderator notification:', err));
        } else if (role === 'MEMBER' && (member.role === 'ADMIN' || member.role === 'MODERATOR')) {
          NotificationService.notifyCommunityDemoted(
            userId,
            community.name,
            communityId
          ).catch(err => logger.error('Failed to send demotion notification:', err));
        }
      }

      logger.info('Member role updated', { communityId, userId, adminUserId, newRole: role });

      return this.formatMemberResponse(updatedMember);
    } catch (error) {
      logger.error('Failed to update member role', { error, adminUserId, input });
      throw error;
    }
  }

  /**
   * Remove member from community
   */
  async removeMember(adminUserId: string, input: RemoveMemberInput): Promise<void> {
    try {
      const { communityId, userId, reason } = input;

      // Check admin/moderator permissions
      await this.checkPermission(adminUserId, communityId, ['ADMIN', 'MODERATOR']);

      // Get member
      const member = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
      });

      if (!member) {
        throw new AppError('Member not found', 404);
      }

      // Prevent removing last admin
      if (member.role === 'ADMIN') {
        const isLast = await this.isLastAdmin(userId, communityId);
        if (isLast) {
          throw new AppError('Cannot remove the last admin', 400);
        }
      }

      // Delete membership record
      await prisma.communityMember.delete({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
      });

      // Get community for notification
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        select: { name: true },
      });

      // Notify user of removal
      if (community) {
        NotificationService.notifyCommunityRemoved(
          userId,
          communityId,
          community.name,
          reason
        ).catch(err => logger.error('Failed to send community removal notification:', err));
      }

      logger.info('Member removed', { communityId, userId, adminUserId, reason });
    } catch (error) {
      logger.error('Failed to remove member', { error, adminUserId, input });
      throw error;
    }
  }

  /**
   * Get community members
   */
  async getCommunityMembers(
    communityId: string,
    query: CommunityMemberQuery
  ): Promise<PaginatedCommunityMembersResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        isApproved,
        search,
        sortBy = 'joinedAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.CommunityMemberWhereInput = {
        communityId,
      };

      if (role) {
        where.role = role;
      }

      if (isApproved !== undefined) {
        where.isApproved = isApproved;
      }

      if (search) {
        where.user = {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      // Build order by
      let orderBy: Prisma.CommunityMemberOrderByWithRelationInput = {};
      if (sortBy === 'name') {
        orderBy = { user: { fullName: sortOrder } };
      } else {
        orderBy = { [sortBy]: sortOrder };
      }

      // Get members and total count
      const [members, totalCount] = await Promise.all([
        prisma.communityMember.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
        }),
        prisma.communityMember.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        members: members.map(m => this.formatMemberResponse(m)),
        totalCount,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Failed to get community members', { error, communityId, query });
      throw error;
    }
  }

  /**
   * Get community events
   */
  async getCommunityEvents(communityId: string, query: any = {}) {
    try {
      // Check if community exists
      const community = await prisma.community.findUnique({
        where: { id: communityId },
      });

      if (!community) {
        throw new AppError('Community not found', 404);
      }

      // Parse pagination
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        communityId,
      };

      // Filter by event type
      if (query.type) {
        where.type = query.type;
      }

      // Filter by status (default to PUBLISHED for public access)
      if (query.status) {
        where.status = query.status;
      } else {
        where.status = 'PUBLISHED';
      }

      // Filter upcoming events
      if (query.upcoming === 'true' || query.upcoming === true) {
        where.date = { gte: new Date() };
      }

      // Search in title or description
      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      // Fetch events and count
      const [events, totalCount] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { date: 'asc' },
          include: {
            user: {
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
            _count: {
              select: {
                eventParticipants: true,
              },
            },
          },
        }),
        prisma.event.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        events: events.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          type: event.type,
          date: event.date.toISOString(),
          location: event.location,
          city: event.city,
          country: event.country,
          latitude: event.latitude,
          longitude: event.longitude,
          mapLink: event.mapLink,
          maxAttendees: event.maxAttendees,
          images: event.images,
          isFree: event.isFree,
          status: event.status,
          currency: event.currency,
          hostType: event.hostType,
          attendeeCount: event._count.eventParticipants,
          host: {
            id: event.user.id,
            fullName: event.user.fullName,
            username: event.user.username,
            profilePicture: event.user.profile?.profilePicture,
          },
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
        })),
        totalCount,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Failed to get community events', { error, communityId, query });
      throw error;
    }
  }

  /**
   * Get community statistics
   */
  async getCommunityStats(communityId: string): Promise<CommunityStatsResponse> {
    try {
      // Check if community exists
      const community = await prisma.community.findUnique({
        where: { id: communityId },
      });

      if (!community) {
        throw new AppError('Community not found', 404);
      }

      // Get member counts by role
      const [totalMembers, adminCount, moderatorCount, memberCount, pendingApprovals] = await Promise.all([
        prisma.communityMember.count({
          where: { communityId, isApproved: true },
        }),
        prisma.communityMember.count({
          where: { communityId, role: 'ADMIN', isApproved: true },
        }),
        prisma.communityMember.count({
          where: { communityId, role: 'MODERATOR', isApproved: true },
        }),
        prisma.communityMember.count({
          where: { communityId, role: 'MEMBER', isApproved: true },
        }),
        prisma.communityMember.count({
          where: { communityId, isApproved: false },
        }),
      ]);

      // Get event counts
      const [totalEvents, activeEvents] = await Promise.all([
        prisma.event.count({
          where: { communityId },
        }),
        prisma.event.count({
          where: {
            communityId,
            date: { gte: new Date() },
          },
        }),
      ]);

      // Get vouch count
      const totalVouches = await prisma.vouch.count({
        where: {
          communityId,
          isCommunityVouch: true,
          status: 'ACTIVE',
        },
      });

      return {
        totalMembers,
        adminCount,
        moderatorCount,
        memberCount,
        pendingApprovals,
        totalEvents,
        activeEvents,
        totalVouches,
      };
    } catch (error) {
      logger.error('Failed to get community stats', { error, communityId });
      throw error;
    }
  }

  // ============================================================================
  // COMMUNITY VOUCHING
  // ============================================================================

  /**
   * Check if member is eligible for auto-vouch
   */
  async checkAutoVouchEligibility(
    userId: string,
    communityId: string
  ): Promise<CommunityVouchEligibilityResponse> {
    try {
      // Check if member exists and is approved
      const member = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
      });

      if (!member || !member.isApproved) {
        return {
          isEligible: false,
          reason: 'Not an approved member of this community',
          criteria: {
            eventsAttended: 0,
            requiredEvents: 5,
            membershipDays: 0,
            requiredDays: 90,
            hasNegativeFeedback: false,
            currentVouches: 0,
            maxVouches: 2,
          },
        };
      }

      // Calculate membership days
      const membershipDays = Math.floor(
        (new Date().getTime() - member.joinedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Count events RSVP'd in this community
      const eventsAttended = await prisma.eventParticipant.count({
        where: {
          userId,
          events: {
            communityId,
          },
        },
      });

      // Count current community vouches
      const currentVouches = await prisma.vouch.count({
        where: {
          voucheeId: userId,
          isCommunityVouch: true,
          status: 'ACTIVE',
        },
      });

      // Check for negative feedback
      const hasNegativeFeedback = false;

      const requiredEvents = 5;
      const requiredDays = 90;
      const maxVouches = 2;

      const isEligible =
        eventsAttended >= requiredEvents &&
        membershipDays >= requiredDays &&
        !hasNegativeFeedback &&
        currentVouches < maxVouches;

      return {
        isEligible,
        reason: isEligible
          ? 'Member meets all auto-vouch criteria'
          : `Member does not meet criteria: ${eventsAttended < requiredEvents ? 'Not enough events attended. ' : ''}${membershipDays < requiredDays ? 'Membership too recent. ' : ''}${currentVouches >= maxVouches ? 'Max community vouches reached. ' : ''}`,
        criteria: {
          eventsAttended,
          requiredEvents,
          membershipDays,
          requiredDays,
          hasNegativeFeedback,
          currentVouches,
          maxVouches,
        },
      };
    } catch (error) {
      logger.error('Failed to check auto-vouch eligibility', { error, userId, communityId });
      throw error;
    }
  }

  /**
   * Admin vouch for member on behalf of community
   */
  async vouchForMember(adminUserId: string, communityId: string, userId: string): Promise<void> {
    try {
      // Check admin permissions
      await this.checkPermission(adminUserId, communityId, ['ADMIN']);

      // Check if member exists and is approved
      const member = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId,
          },
        },
      });

      if (!member || !member.isApproved) {
        throw new AppError('Member not found or not approved', 404);
      }

      // Check vouch limits (max 2 community vouches)
      const existingVouches = await prisma.vouch.count({
        where: {
          voucheeId: userId,
          isCommunityVouch: true,
          status: 'ACTIVE',
        },
      });

      if (existingVouches >= 2) {
        throw new AppError('User already has maximum community vouches (2)', 400);
      }

      // Check if community already vouched for this user
      const existingCommunityVouch = await prisma.vouch.findFirst({
        where: {
          voucheeId: userId,
          communityId,
          isCommunityVouch: true,
          status: 'ACTIVE',
        },
      });

      if (existingCommunityVouch) {
        throw new AppError('Community has already vouched for this user', 409);
      }

      // Create vouch record
      await prisma.vouch.create({
        data: {
          voucherId: adminUserId,
          voucheeId: userId,
          vouchType: 'COMMUNITY',
          weightPercentage: 0.2,
          isCommunityVouch: true,
          communityId,
          vouchedByAdminId: adminUserId,
          status: 'ACTIVE',
          requiresApproval: false,
          approvedAt: new Date(),
          activatedAt: new Date(),
        },
      });

      logger.info('Community vouch granted', { communityId, userId, adminUserId });
    } catch (error) {
      logger.error('Failed to vouch for member', { error, adminUserId, communityId, userId });
      throw error;
    }
  }

  /**
   * Revoke community vouch
   */
  async revokeVouch(adminUserId: string, communityId: string, userId: string, reason?: string): Promise<void> {
    try {
      // Check admin permissions
      await this.checkPermission(adminUserId, communityId, ['ADMIN']);

      // Find the vouch
      const vouch = await prisma.vouch.findFirst({
        where: {
          voucheeId: userId,
          communityId,
          isCommunityVouch: true,
          status: 'ACTIVE',
        },
      });

      if (!vouch) {
        throw new AppError('Community vouch not found', 404);
      }

      // Update vouch status to REVOKED
      await prisma.vouch.update({
        where: { id: vouch.id },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revokeReason: reason,
        },
      });

      logger.info('Community vouch revoked', { communityId, userId, adminUserId, reason });
    } catch (error) {
      logger.error('Failed to revoke vouch', { error, adminUserId, communityId, userId });
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Check if user has permission in community
   */
  private async checkPermission(
    userId: string,
    communityId: string,
    requiredRoles: CommunityRole[]
  ): Promise<void> {
    const member = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });

    if (!member || !member.isApproved) {
      throw new AppError('Not a member of this community', 403);
    }

    if (!requiredRoles.includes(member.role)) {
      throw new AppError('Insufficient permissions', 403);
    }
  }

  /**
   * Check if user is last admin
   */
  private async isLastAdmin(userId: string, communityId: string): Promise<boolean> {
    const adminCount = await prisma.communityMember.count({
      where: {
        communityId,
        role: 'ADMIN',
        isApproved: true,
      },
    });

    return adminCount === 1;
  }

  /**
   * Format community response
   */
  private formatCommunityResponse(community: any, userId?: string): CommunityResponse {
    // Get user's role if they are a member
    let role: CommunityRole | undefined;
    let isApproved: boolean | undefined;

    if (userId && community.communityMembers) {
      const userMembership = Array.isArray(community.communityMembers)
        ? community.communityMembers.find((m: any) => m.userId === userId)
        : community.communityMembers;
      
      if (userMembership) {
        role = userMembership.role;
        isApproved = userMembership.isApproved;
      }
    }

    const userBasic: UserBasicInfo = {
      id: community.user.id,
      fullName: community.user.fullName,
      username: community.user.username || undefined,
      profilePicture: community.user.userProfiles?.profilePicture || undefined,
      trustLevel: community.user.trustLevel || 'starter',
    };

    return {
      id: community.id,
      name: community.name,
      description: community.description,
      logoUrl: community.logoUrl,
      coverImageUrl: community.coverImageUrl,
      category: community.category,
      interests: community.interests || [],
      isVerified: community.isVerified,
      requiresApproval: community.requiresApproval ?? true,
      guidelines: community.guidelines || undefined,
      socialLinks: community.socialLinks || undefined,
      websiteUrl: community.websiteUrl || undefined,
      contactEmail: community.contactEmail || undefined,
      location: {
        city: community.city || undefined,
        country: community.country || undefined,
        latitude: community.latitude || undefined,
        longitude: community.longitude || undefined,
      },
      createdAt: community.createdAt.toISOString(),
      updatedAt: community.updatedAt.toISOString(),
      creator: userBasic,
      memberCount: community._count?.communityMembers || 0,
      eventCount: community._count?.events || 0,
      role,
      isApproved,
    };
  }

  /**
   * Format member response
   */
  private formatMemberResponse(member: any): CommunityMemberResponse {
    const userBasic: UserBasicInfo = {
      id: member.user.id,
      fullName: member.user.fullName,
      username: member.user.username || undefined,
      profilePicture: member.user.profile?.profilePicture || undefined,
      trustLevel: member.user.trustLevel || 'starter',
    };

    return {
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
      isApproved: member.isApproved,
      user: userBasic,
    };
  }

  // ============================================================================
  // COMMUNITY DISCOVERY
  // ============================================================================

  /**
   * Get trending communities (by member count and recent activity)
   */
  async getTrendingCommunities(userId?: string, limit: number = 10): Promise<CommunityResponse[]> {
    try {
      const communities = await prisma.community.findMany({
        where: {
          isVerified: true, // Only show verified communities in trending
        },
        take: limit,
        orderBy: [
          { communityMembers: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
        include: {
          user: {
            include: {
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          communityMembers: userId
            ? {
                where: { userId },
                select: {
                  role: true,
                  isApproved: true,
                },
              }
            : false,
          _count: {
            select: {
              communityMembers: true,
              events: true,
            },
          },
        },
      });

      return communities.map(c => this.formatCommunityResponse(c, userId));
    } catch (error) {
      logger.error('Failed to get trending communities', { error, userId, limit });
      throw error;
    }
  }

  /**
   * Get newly created communities
   */
  async getNewCommunities(userId?: string, limit: number = 10): Promise<CommunityResponse[]> {
    try {
      // Get communities created in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const communities = await prisma.community.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            include: {
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          communityMembers: userId
            ? {
                where: { userId },
                select: {
                  role: true,
                  isApproved: true,
                },
              }
            : false,
          _count: {
            select: {
              communityMembers: true,
              events: true,
            },
          },
        },
      });

      return communities.map(c => this.formatCommunityResponse(c, userId));
    } catch (error) {
      logger.error('Failed to get new communities', { error, userId, limit });
      throw error;
    }
  }

  /**
   * Get recommended communities based on user interests and connections
   */
  async getRecommendedCommunities(userId: string, limit: number = 10): Promise<CommunityResponse[]> {
    try {
      // Get user's profile to check interests
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { interests: true },
      });

      // Get communities user is already a member of
      const existingMemberships = await prisma.communityMember.findMany({
        where: { userId },
        select: { communityId: true },
      });

      const existingCommunityIds = existingMemberships.map(m => m.communityId);

      // Get communities user's connections are in
      const connectionCommunities = await prisma.communityMember.findMany({
        where: {
          isApproved: true,
          communityId: {
            notIn: existingCommunityIds,
          },
          OR: [
            {
              user: {
                connectionsInitiated: {
                  some: {
                    receiverId: userId,
                    status: 'ACCEPTED',
                  },
                },
              },
            },
            {
              user: {
                connectionsReceived: {
                  some: {
                    initiatorId: userId,
                    status: 'ACCEPTED',
                  },
                },
              },
            },
          ],
        },
        select: {
          communityId: true,
        },
        distinct: ['communityId'],
        take: 5,
      });

      const connectionCommunityIds = connectionCommunities.map(c => c.communityId);

      // Build recommendation query
      const whereClause: Prisma.CommunityWhereInput = {
        id: {
          notIn: existingCommunityIds,
        },
      };

      // If user has interests, prioritize communities with matching categories
      if (userProfile?.interests && userProfile.interests.length > 0) {
        whereClause.OR = [
          {
            category: {
              in: userProfile.interests,
            },
          },
          {
            id: {
              in: connectionCommunityIds,
            },
          },
        ];
      } else if (connectionCommunityIds.length > 0) {
        whereClause.id = {
          in: connectionCommunityIds,
        };
      }

      const communities = await prisma.community.findMany({
        where: whereClause,
        take: limit,
        orderBy: [
          { isVerified: 'desc' },
          { communityMembers: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
        include: {
          user: {
            include: {
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          communityMembers: {
            where: { userId },
            select: {
              role: true,
              isApproved: true,
            },
          },
          _count: {
            select: {
              communityMembers: true,
              events: true,
            },
          },
        },
      });

      return communities.map(c => this.formatCommunityResponse(c, userId));
    } catch (error) {
      logger.error('Failed to get recommended communities', { error, userId, limit });
      throw error;
    }
  }

  /**
   * Get communities by interest (using interests array)
   */
  async getCommunitiesByInterest(
    interest: string,
    userId?: string,
    limit: number = 20
  ): Promise<CommunityResponse[]> {
    try {
      const communities = await prisma.community.findMany({
        where: {
          interests: {
            has: interest, // Exact match for the interest value
          },
        },
        take: limit,
        orderBy: [
          { isVerified: 'desc' },
          { communityMembers: { _count: 'desc' } },
        ],
        include: {
          user: {
            include: {
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          communityMembers: userId
            ? {
                where: { userId },
                select: {
                  role: true,
                  isApproved: true,
                },
              }
            : false,
          _count: {
            select: {
              communityMembers: true,
              events: true,
            },
          },
        },
      });

      return communities.map(c => this.formatCommunityResponse(c, userId));
    } catch (error) {
      logger.error('Failed to get communities by interest', { error, interest, userId, limit });
      throw error;
    }
  }

  /**
   * Get suggested communities for user (combines multiple signals)
   */
  async getSuggestedCommunities(userId: string, limit: number = 10): Promise<CommunityResponse[]> {
    try {
      // Get multiple recommendation sources in parallel
      const [trending, recommended, newCommunities] = await Promise.all([
        this.getTrendingCommunities(userId, 3),
        this.getRecommendedCommunities(userId, 5),
        this.getNewCommunities(userId, 2),
      ]);

      // Combine and deduplicate
      const seen = new Set<string>();
      const combined: CommunityResponse[] = [];

      // Prioritize recommended, then trending, then new
      for (const community of [...recommended, ...trending, ...newCommunities]) {
        if (!seen.has(community.id) && combined.length < limit) {
          seen.add(community.id);
          combined.push(community);
        }
      }

      return combined;
    } catch (error) {
      logger.error('Failed to get suggested communities', { error, userId, limit });
      throw error;
    }
  }

  /**
   * Get communities user's friends are in
   */
  async getCommunitiesFromConnections(userId: string, limit: number = 10): Promise<CommunityResponse[]> {
    try {
      // Get user's connections
      const connections = await prisma.userConnection.findMany({
        where: {
          OR: [
            { initiatorId: userId, status: 'ACCEPTED' },
            { receiverId: userId, status: 'ACCEPTED' },
          ],
        },
        select: {
          initiatorId: true,
          receiverId: true,
        },
      });

      const connectionUserIds = connections.map(c =>
        c.initiatorId === userId ? c.receiverId : c.initiatorId
      );

      if (connectionUserIds.length === 0) {
        return [];
      }

      // Get communities user is already in
      const existingMemberships = await prisma.communityMember.findMany({
        where: { userId },
        select: { communityId: true },
      });

      const existingCommunityIds = existingMemberships.map(m => m.communityId);

      // Get communities where connections are members
      const communitiesWithConnections = await prisma.community.findMany({
        where: {
          id: {
            notIn: existingCommunityIds,
          },
          communityMembers: {
            some: {
              userId: {
                in: connectionUserIds,
              },
              isApproved: true,
            },
          },
        },
        take: limit,
        orderBy: {
          communityMembers: { _count: 'desc' },
        },
        include: {
          user: {
            include: {
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          communityMembers: {
            where: {
              userId: {
                in: [...connectionUserIds, userId],
              },
              isApproved: true,
            },
            include: {
              user: {
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
            },
          },
          _count: {
            select: {
              communityMembers: true,
              events: true,
            },
          },
        },
      });

      return communitiesWithConnections.map(c => this.formatCommunityResponse(c, userId));
    } catch (error) {
      logger.error('Failed to get communities from connections', { error, userId, limit });
      throw error;
    }
  }

  // ============================================================================
  // QR CODE & PUBLIC PREVIEW
  // ============================================================================

  /**
   * Generate QR code for community preview page
   */
  async generateCommunityQRCode(userId: string, communityId: string): Promise<CommunityQRCodeResponse> {
    try {
      // Check if community exists
      const community = await prisma.community.findUnique({
        where: { id: communityId },
      });

      if (!community) {
        throw new AppError('Community not found', 404);
      }

      // Check admin/moderator permissions
      await this.checkPermission(userId, communityId, ['ADMIN', 'MODERATOR']);

      // Construct the public preview URL
      const baseUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'https://app.berse.com';
      const previewUrl = `${baseUrl}/community-preview/${communityId}`;
      
      // Deep link URL that works for both web and app
      const webUrl = `${baseUrl}/communities/${communityId}`;

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(previewUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      logger.info('QR code generated for community', { communityId, userId });

      return {
        communityId,
        qrCodeDataUrl,
        previewUrl,
        webUrl,
      };
    } catch (error) {
      logger.error('Failed to generate QR code', { error, userId, communityId });
      throw error;
    }
  }

  /**
   * Get public community preview (no auth required)
   * This is what users see when they scan the QR code
   */
  async getPublicCommunityPreview(communityId: string): Promise<PublicCommunityPreview> {
    try {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: {
          _count: {
            select: {
              communityMembers: true,
            },
          },
        },
      });

      if (!community) {
        throw new AppError('Community not found', 404);
      }

      // Get upcoming events (next 10)
      const upcomingEvents = await prisma.event.findMany({
        where: {
          communityId,
          status: 'PUBLISHED',
          date: { gte: new Date() },
        },
        take: 10,
        orderBy: { date: 'asc' },
        select: {
          id: true,
          title: true,
          type: true,
          date: true,
          location: true,
          images: true,
          isFree: true,
          _count: {
            select: {
              eventParticipants: true,
            },
          },
        },
      });

      // App download links
      const baseUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'https://app.berse.com';
      const downloadLinks = {
        ios: process.env.IOS_APP_STORE_URL || 'https://apps.apple.com/app/berse',
        android: process.env.ANDROID_PLAY_STORE_URL || 'https://play.google.com/store/apps/details?id=com.berse.app',
        deepLink: `${baseUrl}/communities/${communityId}`,
      };

      logger.info('Public community preview accessed', { communityId });

      return {
        id: community.id,
        name: community.name,
        description: community.description || undefined,
        logoUrl: community.logoUrl || undefined,
        coverImageUrl: community.coverImageUrl || undefined,
        interests: community.interests || [],
        isVerified: community.isVerified,
        memberCount: community._count.communityMembers,
        upcomingEvents: upcomingEvents.map(e => ({
          id: e.id,
          title: e.title,
          type: e.type,
          date: e.date.toISOString(),
          location: e.location,
          images: e.images,
          isFree: e.isFree,
        })),
        downloadLinks,
      };
    } catch (error) {
      logger.error('Failed to get public community preview', { error, communityId });
      throw error;
    }
  }
}
