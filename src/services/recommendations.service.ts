import { prisma } from '../config/database';

export interface RecommendationScore {
  userId: string;
  score: number;
  reasons: string[];
  user: any;
}

export class RecommendationsService {
  /**
   * Get personalized user recommendations based on interests, location, and connections
   */
  static async getRecommendations(
    currentUserId: string,
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    // Get current user's profile data
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        profile: true,
        location: true,
      },
    });

    if (!currentUser) {
      return [];
    }

    // Get existing connections to exclude
    const existingConnections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { initiatorId: currentUserId },
          { receiverId: currentUserId },
        ],
        status: { in: ['ACCEPTED', 'PENDING'] },
      },
      select: {
        initiatorId: true,
        receiverId: true,
      },
    });

    const connectedUserIds = new Set(
      existingConnections.map(c => 
        c.initiatorId === currentUserId ? c.receiverId : c.initiatorId
      )
    );

    // Get potential users to recommend (exclude self and existing connections)
    const excludeIds = [currentUserId, ...Array.from(connectedUserIds)];
    
    const potentialUsers = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        status: 'ACTIVE',
      },
      include: {
        profile: true,
        location: true,
        connectionStats: true,
        _count: {
          select: {
            connectionsInitiated: true,
            connectionsReceived: true,
          },
        },
      },
      take: 100, // Get more users than needed for better scoring
    });

    // Calculate recommendation scores
    const recommendations = potentialUsers.map(user => {
      const score = this.calculateRecommendationScore(currentUser, user);
      return {
        userId: user.id,
        score: score.score,
        reasons: score.reasons,
        user,
      };
    });

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Calculate recommendation score for a user
   */
  private static calculateRecommendationScore(
    currentUser: any,
    targetUser: any
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    const currentInterests = currentUser.profile?.interests || [];
    const targetInterests = targetUser.profile?.interests || [];

    // 1. Common Interests Score (0-40 points)
    if (currentInterests.length > 0 && targetInterests.length > 0) {
      const commonInterests = currentInterests.filter((interest: string) =>
        targetInterests.includes(interest)
      );
      
      if (commonInterests.length > 0) {
        const interestScore = Math.min(commonInterests.length * 8, 40);
        score += interestScore;
        reasons.push(`${commonInterests.length} shared interest${commonInterests.length > 1 ? 's' : ''}: ${commonInterests.slice(0, 2).join(', ')}`);
      }
    }

    // 2. Location Proximity Score (0-25 points)
    if (currentUser.location?.currentCity && targetUser.location?.currentCity) {
      if (currentUser.location.currentCity.toLowerCase() === targetUser.location.currentCity.toLowerCase()) {
        score += 25;
        reasons.push(`Both in ${currentUser.location.currentCity}`);
      } else {
        // Same country/region gets partial points
        if (currentUser.location.countryOfResidence === targetUser.location.countryOfResidence) {
          score += 10;
          reasons.push(`Same country: ${currentUser.location.countryOfResidence}`);
        }
      }
    }

    // 3. Professional Similarity Score (0-15 points)
    if (currentUser.profile?.profession && targetUser.profile?.profession) {
      const currentProf = currentUser.profile.profession.toLowerCase();
      const targetProf = targetUser.profile.profession.toLowerCase();
      
      if (currentProf === targetProf) {
        score += 15;
        reasons.push(`Same profession: ${targetUser.profile.profession}`);
      } else if (this.isSimilarProfession(currentProf, targetProf)) {
        score += 8;
        reasons.push(`Similar profession: ${targetUser.profile.profession}`);
      }
    }

    // 4. Profile Completeness Score (0-10 points)
    const completeness = this.calculateProfileCompleteness(targetUser);
    if (completeness > 0.7) {
      score += 10;
      reasons.push('Complete profile');
    } else if (completeness > 0.5) {
      score += 5;
    }

    // 5. Activity Level Score (0-10 points)
    const totalConnections = (targetUser._count?.connectionsInitiated || 0) + 
                           (targetUser._count?.connectionsReceived || 0);
    
    if (totalConnections > 5) {
      score += 10;
      reasons.push('Active community member');
    } else if (totalConnections > 0) {
      score += 5;
      reasons.push('Getting started in community');
    }

    // 6. Diversity Bonus (0-5 points) - Encourage diverse connections
    if (currentUser.profile?.personalityType && targetUser.profile?.personalityType) {
      if (currentUser.profile.personalityType !== targetUser.profile.personalityType) {
        score += 3;
        reasons.push('Complementary personality');
      }
    }

    // 7. New User Bonus (0-5 points) - Help new users get connections
    const userAge = Date.now() - new Date(targetUser.createdAt).getTime();
    const daysSinceJoined = userAge / (1000 * 60 * 60 * 24);
    
    if (daysSinceJoined < 30) {
      score += 5;
      reasons.push('New to Berse');
    }

    return { score: Math.round(score), reasons };
  }

  /**
   * Calculate profile completeness percentage
   */
  private static calculateProfileCompleteness(user: any): number {
    const fields = [
      user.profile?.bio,
      user.profile?.profession,
      user.profile?.interests?.length > 0,
      user.location?.currentCity,
      user.profile?.profilePicture,
      user.profile?.languages?.length > 0,
    ];

    const filledFields = fields.filter(Boolean).length;
    return filledFields / fields.length;
  }

  /**
   * Check if two professions are similar
   */
  private static isSimilarProfession(prof1: string, prof2: string): boolean {
    const techProfessions = ['developer', 'engineer', 'programmer', 'software', 'tech', 'data', 'analyst'];
    const businessProfessions = ['manager', 'director', 'consultant', 'analyst', 'marketing', 'sales'];
    const creativeProfessions = ['designer', 'artist', 'photographer', 'writer', 'creative'];

    const categories = [techProfessions, businessProfessions, creativeProfessions];

    for (const category of categories) {
      const prof1InCategory = category.some(keyword => prof1.includes(keyword));
      const prof2InCategory = category.some(keyword => prof2.includes(keyword));
      
      if (prof1InCategory && prof2InCategory) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get mutual connections between two users
   */
  static async getMutualConnections(userId1: string, userId2: string): Promise<any[]> {
    const user1Connections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { initiatorId: userId1, status: 'ACCEPTED' },
          { receiverId: userId1, status: 'ACCEPTED' },
        ],
      },
      select: {
        initiatorId: true,
        receiverId: true,
      },
    });

    const user2Connections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { initiatorId: userId2, status: 'ACCEPTED' },
          { receiverId: userId2, status: 'ACCEPTED' },
        ],
      },
      select: {
        initiatorId: true,
        receiverId: true,
      },
    });

    const user1ConnectedIds = new Set(
      user1Connections.map(c => c.initiatorId === userId1 ? c.receiverId : c.initiatorId)
    );

    const user2ConnectedIds = user2Connections
      .map(c => c.initiatorId === userId2 ? c.receiverId : c.initiatorId)
      .filter(id => user1ConnectedIds.has(id));

    // Get mutual connection details
    const mutualConnections = await prisma.user.findMany({
      where: {
        id: { in: user2ConnectedIds },
      },
      select: {
        id: true,
        fullName: true,
        profile: {
          select: {
            profilePicture: true,
          },
        },
      },
    });

    return mutualConnections;
  }

  /**
   * Batch get mutual connections for multiple users (optimized to avoid N+1 queries)
   */
  static async getBatchMutualConnections(
    currentUserId: string, 
    targetUserIds: string[]
  ): Promise<Map<string, any[]>> {
    if (targetUserIds.length === 0) {
      return new Map();
    }

    // Get current user's connections once
    const currentUserConnections = await prisma.userConnection.findMany({
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

    const currentUserConnectedIds = new Set(
      currentUserConnections.map(c => 
        c.initiatorId === currentUserId ? c.receiverId : c.initiatorId
      )
    );

    // Get all target users' connections in one query
    const allTargetConnections = await prisma.userConnection.findMany({
      where: {
        OR: [
          { initiatorId: { in: targetUserIds }, status: 'ACCEPTED' },
          { receiverId: { in: targetUserIds }, status: 'ACCEPTED' },
        ],
      },
      select: {
        initiatorId: true,
        receiverId: true,
      },
    });

    // Build a map of userId -> their connection IDs
    const connectionMap = new Map<string, Set<string>>();
    targetUserIds.forEach(userId => connectionMap.set(userId, new Set()));

    allTargetConnections.forEach(conn => {
      targetUserIds.forEach(userId => {
        if (conn.initiatorId === userId) {
          connectionMap.get(userId)!.add(conn.receiverId);
        } else if (conn.receiverId === userId) {
          connectionMap.get(userId)!.add(conn.initiatorId);
        }
      });
    });

    // Find mutual connection IDs for each target user
    const mutualIdsMap = new Map<string, string[]>();
    connectionMap.forEach((connIds, userId) => {
      const mutualIds = Array.from(connIds).filter(id => currentUserConnectedIds.has(id));
      mutualIdsMap.set(userId, mutualIds);
    });

    // Get all unique mutual connection user details in one query
    const allMutualIds = new Set<string>();
    mutualIdsMap.forEach(ids => ids.forEach(id => allMutualIds.add(id)));

    const mutualUsers = await prisma.user.findMany({
      where: {
        id: { in: Array.from(allMutualIds) },
      },
      select: {
        id: true,
        fullName: true,
        profile: {
          select: {
            profilePicture: true,
          },
        },
      },
    });

    // Create a map of userId -> user details for quick lookup
    const userDetailsMap = new Map(mutualUsers.map(u => [u.id, u]));

    // Build final result map
    const resultMap = new Map<string, any[]>();
    mutualIdsMap.forEach((mutualIds, targetUserId) => {
      const mutualDetails = mutualIds
        .map(id => userDetailsMap.get(id))
        .filter(u => u !== undefined);
      resultMap.set(targetUserId, mutualDetails);
    });

    return resultMap;
  }

  /**
   * Get trending interests based on user activity
   */
  static async getTrendingInterests(limit: number = 10): Promise<{ interest: string; count: number }[]> {
    // Get all user interests
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        profile: {
          select: {
            interests: true,
          },
        },
      },
    });

    // Count interest frequencies
    const interestCounts: { [key: string]: number } = {};
    
    users.forEach(user => {
      user.profile?.interests?.forEach((interest: string) => {
        interestCounts[interest] = (interestCounts[interest] || 0) + 1;
      });
    });

    // Sort and return top interests
    return Object.entries(interestCounts)
      .map(([interest, count]) => ({ interest, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}