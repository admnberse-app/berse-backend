import { PrismaClient, SwipeAction } from '@prisma/client';
import { DiscoveryFilters, DiscoveryUser, SwipeRequest, SwipeResponse, DiscoveryResponse, SwipeStatsResponse } from './matching.types';
import { AppError } from '../../middleware/error';

const prisma = new PrismaClient();

export class MatchingService {
  private readonly DEFAULT_DISTANCE = 50; // km
  private readonly MAX_DISTANCE = 500; // km
  private readonly SKIP_THRESHOLD = 3; // After 3 skips, don't show again
  private readonly DEFAULT_BATCH_SIZE = 20;
  private readonly MIN_BATCH_SIZE = 1;
  private readonly MAX_BATCH_SIZE = 50;

  /**
   * Get discovery users based on filters and matching algorithm
   * @param limit - Number of users to return (1-50, default 20)
   * @param sessionId - Optional session ID to track already shown users and avoid duplicates
   */
  async getDiscoveryUsers(
    userId: string,
    filters: DiscoveryFilters,
    latitude?: number,
    longitude?: number,
    sessionId?: string
  ): Promise<DiscoveryResponse> {
    // Get current user data for matching
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        location: true,
        communityMembers: { where: { isApproved: true } },
      },
    });

    if (!currentUser) {
      throw new AppError('User not found', 404);
    }

    // Get users already swiped (with skip count)
    const swipedUsers = await prisma.userSwipe.findMany({
      where: { swiperId: userId },
      select: {
        swipedUserId: true,
        action: true,
        skipCount: true,
      },
    });

    // Users to exclude: already connected, pending connections (both ways), or skipped 3+ times
    const existingConnections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          { receiverId: userId },
        ],
      },
      select: { 
        initiatorId: true, 
        receiverId: true,
        status: true 
      },
    });

    // Exclude both accepted connections AND pending requests (sent or received)
    const connectedUserIds = existingConnections.map(conn =>
      conn.initiatorId === userId ? conn.receiverId : conn.initiatorId
    );

    const skipThresholdUserIds = swipedUsers
      .filter(s => s.action === SwipeAction.SKIP && s.skipCount >= this.SKIP_THRESHOLD)
      .map(s => s.swipedUserId);

    // Get users already shown in this session to avoid duplicates
    let sessionShownUserIds: string[] = [];
    if (sessionId) {
      const session = await prisma.discoverySession.findUnique({
        where: { id: sessionId },
        select: { shownUserIds: true }
      });
      sessionShownUserIds = (session?.shownUserIds as string[]) || [];
    }

    const excludeUserIds = [userId, ...connectedUserIds, ...skipThresholdUserIds, ...sessionShownUserIds];

    // Build where clause
    const where: any = {
      id: { notIn: excludeUserIds },
      status: 'ACTIVE',
    };

    // Apply filters
    if (filters.gender) {
      where.profile = { gender: filters.gender };
    }

    if (filters.minAge || filters.maxAge) {
      where.profile = {
        ...where.profile,
        age: {},
      };
      if (filters.minAge) where.profile.age.gte = filters.minAge;
      if (filters.maxAge) where.profile.age.lte = filters.maxAge;
    }

    if (filters.city) {
      where.location = { currentCity: filters.city };
    }

    if (filters.onlyVerified) {
      where.isVerified = true;
    }

    if (filters.minTrustScore) {
      where.trustScore = { gte: filters.minTrustScore };
    }

    // Determine batch size
    const batchSize = Math.min(
      Math.max(filters.limit || this.DEFAULT_BATCH_SIZE, this.MIN_BATCH_SIZE),
      this.MAX_BATCH_SIZE
    );

    // Fetch potential matches (fetch 2x for scoring/filtering)
    const users = await prisma.user.findMany({
      where,
      take: batchSize * 2,
      include: {
        profile: true,
        location: true,
        userBadges: true,
        serviceProfile: true,
        communityMembers: {
          where: { isApproved: true },
          select: { communityId: true },
        },
        connectionsInitiated: {
          where: { status: 'ACCEPTED' },
          select: { id: true },
        },
        connectionsReceived: {
          where: { status: 'ACCEPTED' },
          select: { id: true },
        },
      },
    });

    // Calculate match scores and filter by distance
    const scoredUsers = await Promise.all(
      users.map(async (user) => {
        const score = await this.calculateMatchScore(currentUser, user, filters);
        
        // Calculate distance if coordinates available
        let distanceKm: number | undefined;
        if (latitude && longitude && user.location?.latitude && user.location?.longitude) {
          distanceKm = this.calculateDistance(
            latitude,
            longitude,
            user.location.latitude,
            user.location.longitude
          );
          
          // Filter by distance
          const maxDistance = filters.distance || this.DEFAULT_DISTANCE;
          if (distanceKm > maxDistance) {
            return null;
          }
        }

        return {
          user,
          score,
          distanceKm,
        };
      })
    );

    // Filter out nulls and sort by score
    const validUsers = scoredUsers
      .filter((u): u is NonNullable<typeof u> => u !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, batchSize);

    // Transform to DiscoveryUser format
    const discoveryUsers: DiscoveryUser[] = validUsers.map(({ user, score, distanceKm }) => {
      const mutualCommunities = this.getMutualCommunities(
        currentUser.communityMembers.map(cm => cm.communityId),
        user.communityMembers.map(cm => cm.communityId)
      );

      const mutualInterests = this.getMutualInterests(
        currentUser.profile?.interests || [],
        user.profile?.interests || []
      );

      return {
        id: user.id,
        fullName: user.fullName,
        username: user.username || undefined,
        age: user.profile?.age || undefined,
        gender: user.profile?.gender || undefined,
        bio: user.profile?.bio || undefined,
        profilePicture: user.profile?.profilePicture || undefined,
        images: [],

        city: user.location?.currentCity || undefined,
        country: user.location?.countryOfResidence || undefined,
        distanceKm,

        interests: user.profile?.interests || [],
        languages: user.profile?.languages || [],
        occupation: user.profile?.occupation || undefined,
        profession: user.profile?.profession || undefined,
        travelStyles: user.profile?.travelStyle ? [user.profile.travelStyle] : [],
        personalityType: user.profile?.personalityType || undefined,
        bucketList: user.profile?.bucketList || [],
        travelBio: user.profile?.travelBio || undefined,
        website: user.profile?.website || undefined,

        isHostAvailable: user.serviceProfile?.isHostAvailable || false,
        isGuideAvailable: user.serviceProfile?.isGuideAvailable || false,
        isHostCertified: user.serviceProfile?.isHostCertified || false,

        trustScore: user.trustScore || 0,
        isVerified: user.status === 'ACTIVE',
        badgeCount: user.userBadges.length,

        connectionCount: user.connectionsInitiated.length + user.connectionsReceived.length,
        communityCount: user.communityMembers.length,

        mutualFriends: 0, // TODO: Calculate mutual friends
        mutualCommunities: mutualCommunities.length,
        mutualInterests,

        matchScore: Math.round(score),
      };
    });

    // Track newly shown user IDs
    const newlyShownUserIds = discoveryUsers.map(u => u.id);

    // Create or update session
    const session = sessionId
      ? await prisma.discoverySession.update({
          where: { id: sessionId },
          data: {
            totalShown: { increment: discoveryUsers.length },
            shownUserIds: {
              push: newlyShownUserIds
            }
          },
        })
      : await prisma.discoverySession.create({
          data: {
            userId,
            filters: filters as any,
            latitude,
            longitude,
            totalShown: discoveryUsers.length,
            shownUserIds: newlyShownUserIds
          },
        });

    return {
      users: discoveryUsers,
      sessionId: session.id,
      hasMore: users.length >= batchSize,
      filters,
    };
  }

  /**
   * Record swipe action
   */
  async recordSwipe(userId: string, request: SwipeRequest): Promise<SwipeResponse> {
    const { targetUserId, action, sessionId } = request;

    // Validate target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, fullName: true },
    });

    if (!targetUser) {
      throw new AppError('Target user not found', 404);
    }

    // Check if already swiped
    const existingSwipe = await prisma.userSwipe.findFirst({
      where: {
        swiperId: userId,
        swipedUserId: targetUserId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (action === SwipeAction.SKIP) {
      // Increment skip count
      const skipCount = existingSwipe ? existingSwipe.skipCount + 1 : 1;
      
      await prisma.userSwipe.create({
        data: {
          swiperId: userId,
          swipedUserId: targetUserId,
          action: SwipeAction.SKIP,
          skipCount,
          shownInContext: 'discover',
        },
      });

      // Update session stats
      if (sessionId) {
        await prisma.discoverySession.update({
          where: { id: sessionId },
          data: { totalSkips: { increment: 1 } },
        });
      }

      return {
        success: true,
        action: SwipeAction.SKIP,
        message: skipCount >= this.SKIP_THRESHOLD 
          ? 'User will not be shown again'
          : `Skipped (${skipCount}/${this.SKIP_THRESHOLD})`,
      };
    }

    // INTERESTED action
    if (existingSwipe && existingSwipe.action === SwipeAction.INTERESTED) {
      return {
        success: true,
        action: SwipeAction.INTERESTED,
        alreadySwiped: true,
        message: 'Already expressed interest in this user',
      };
    }

    // Create INTERESTED swipe
    await prisma.userSwipe.create({
      data: {
        swiperId: userId,
        swipedUserId: targetUserId,
        action: SwipeAction.INTERESTED,
        skipCount: 0,
        shownInContext: 'discover',
      },
    });

    // Update session stats
    if (sessionId) {
      await prisma.discoverySession.update({
        where: { id: sessionId },
        data: { totalInterested: { increment: 1 } },
      });
    }

    return {
      success: true,
      action: SwipeAction.INTERESTED,
      message: 'Interest recorded. Send a connection request to connect!',
    };
  }

  /**
   * Mark connection as sent after user sends request
   */
  async markConnectionSent(userId: string, targetUserId: string, connectionId: string): Promise<void> {
    await prisma.userSwipe.updateMany({
      where: {
        swiperId: userId,
        swipedUserId: targetUserId,
        action: SwipeAction.INTERESTED,
      },
      data: {
        connectionSent: true,
        connectionId,
      },
    });
  }

  /**
   * Get swipe statistics
   */
  async getSwipeStats(userId: string): Promise<SwipeStatsResponse> {
    const swipes = await prisma.userSwipe.groupBy({
      by: ['action'],
      where: { swiperId: userId },
      _count: true,
    });

    const interested = swipes.find(s => s.action === SwipeAction.INTERESTED)?._count || 0;
    const skipped = swipes.find(s => s.action === SwipeAction.SKIP)?._count || 0;

    const connectionsSent = await prisma.userSwipe.count({
      where: {
        swiperId: userId,
        action: SwipeAction.INTERESTED,
        connectionSent: true,
      },
    });

    return {
      totalSwipes: interested + skipped,
      interested,
      skipped,
      connectionsSent,
      pendingInterests: interested - connectionsSent,
    };
  }

  /**
   * Calculate match score between two users (0-100)
   * Weighted by priority: location > interests > communities > trust score
   */
  private async calculateMatchScore(
    currentUser: any,
    targetUser: any,
    filters: DiscoveryFilters
  ): Promise<number> {
    let score = 0;
    const weights = {
      location: 30,
      interests: 25,
      communities: 20,
      trustScore: 15,
      verification: 10,
    };

    // 1. Location proximity (30 points)
    if (currentUser.location?.currentCity && targetUser.location?.currentCity) {
      if (currentUser.location.currentCity === targetUser.location.currentCity) {
        score += weights.location;
      } else if (currentUser.location.countryOfResidence === targetUser.location.countryOfResidence) {
        score += weights.location * 0.5;
      }
    }

    // 2. Shared interests (25 points)
    const currentInterests = currentUser.profile?.interests || [];
    const targetInterests = targetUser.profile?.interests || [];
    const commonInterests = this.getMutualInterests(currentInterests, targetInterests);
    
    if (currentInterests.length > 0 && targetInterests.length > 0) {
      const interestMatch = commonInterests.length / Math.max(currentInterests.length, targetInterests.length);
      score += weights.interests * interestMatch;
    }

    // 3. Mutual communities (20 points)
    const currentCommunities = currentUser.communityMembers.map((cm: any) => cm.communityId);
    const targetCommunities = targetUser.communityMembers.map((cm: any) => cm.communityId);
    const mutualCommunities = this.getMutualCommunities(currentCommunities, targetCommunities);
    
    if (currentCommunities.length > 0 && targetCommunities.length > 0) {
      const communityMatch = mutualCommunities.length / Math.max(currentCommunities.length, targetCommunities.length);
      score += weights.communities * communityMatch;
    }

    // 4. Trust score (15 points)
    const targetTrustScore = targetUser.trustScore || 0;
    score += weights.trustScore * (targetTrustScore / 100);

    // 5. Verification status (10 points)
    if (targetUser.status === 'ACTIVE') {
      score += weights.verification;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private getMutualCommunities(communities1: string[], communities2: string[]): string[] {
    return communities1.filter(c => communities2.includes(c));
  }

  private getMutualInterests(interests1: string[], interests2: string[]): string[] {
    return interests1.filter(i => interests2.includes(i));
  }
}

export const matchingService = new MatchingService();
