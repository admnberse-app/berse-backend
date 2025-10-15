import { prisma } from '../config/database';
import { MatchType, MatchStatus, User } from '@prisma/client';
import notificationService from './notification.service';

interface MatchCriteria {
  type: MatchType;
  userId: string;
  preferences?: {
    location?: string;
    availability?: any;
    ageRange?: { min: number; max: number };
  };
}

interface MatchCandidate extends User {
  compatibilityScore: number;
  commonInterests: string[];
  matchReason: string;
}

class MatchingService {
  private readonly MATCH_EXPIRY_DAYS = 7;
  private readonly MIN_COMPATIBILITY_SCORE = 0.5;

  async findMatches(criteria: MatchCriteria): Promise<MatchCandidate[]> {
    const user = await prisma.user.findUnique({
      where: { id: criteria.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get potential candidates (exclude self and already matched users)
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { senderId: criteria.userId },
          { receiverId: criteria.userId },
        ],
        type: criteria.type,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      select: { senderId: true, receiverId: true },
    });

    const excludedUserIds = new Set([criteria.userId]);
    existingMatches.forEach(match => {
      excludedUserIds.add(match.senderId);
      excludedUserIds.add(match.receiverId);
    });

    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedUserIds) },
        city: criteria.preferences?.location || user.city,
      },
    });

    // Calculate compatibility for each candidate
    const matchedCandidates = candidates
      .map(candidate => {
        const { score, commonInterests, reason } = this.calculateCompatibility(
          user,
          candidate,
          criteria.type
        );

        return {
          ...candidate,
          compatibilityScore: score,
          commonInterests,
          matchReason: reason,
        };
      })
      .filter(candidate => candidate.compatibilityScore >= this.MIN_COMPATIBILITY_SCORE)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10); // Return top 10 matches

    return matchedCandidates;
  }

  private calculateCompatibility(
    user: User,
    candidate: User,
    matchType: MatchType
  ): { score: number; commonInterests: string[]; reason: string } {
    let score = 0;
    const factors: string[] = [];
    
    // Calculate common interests
    const userInterests = new Set(user.interests);
    const candidateInterests = new Set(candidate.interests);
    const commonInterests = Array.from(userInterests).filter(interest => 
      candidateInterests.has(interest)
    );

    // Interest compatibility (40% weight)
    const interestScore = commonInterests.length > 0 
      ? Math.min(commonInterests.length / 3, 1) * 0.4 
      : 0;
    score += interestScore;
    if (commonInterests.length > 0) {
      factors.push(`${commonInterests.length} common interests`);
    }

    // Location compatibility (20% weight)
    if (user.city === candidate.city) {
      score += 0.2;
      factors.push('Same city');
    }

    // Activity level compatibility (20% weight)
    const userActivity = user.totalPoints;
    const candidateActivity = candidate.totalPoints;
    const activityDiff = Math.abs(userActivity - candidateActivity);
    const activityScore = Math.max(0, 1 - (activityDiff / 1000)) * 0.2;
    score += activityScore;
    if (activityScore > 0.1) {
      factors.push('Similar activity level');
    }

    // Match type specific scoring (20% weight)
    switch (matchType) {
      case 'SPORTS':
        if (commonInterests.some(i => i.toLowerCase().includes('sport') || 
            i.toLowerCase().includes('fitness'))) {
          score += 0.2;
          factors.push('Sports enthusiast');
        }
        break;
      case 'VOLUNTEER':
        if (candidate.role === 'GUIDE' || candidate.isHostCertified) {
          score += 0.2;
          factors.push('Active volunteer');
        }
        break;
      case 'PROFESSIONAL':
        if (candidate.linkedinHandle) {
          score += 0.1;
          factors.push('Professional profile');
        }
        break;
      case 'STUDY':
        // Could add education-based matching if we had that data
        score += 0.1;
        break;
    }

    const reason = factors.length > 0 
      ? `Matched based on: ${factors.join(', ')}`
      : 'Potential match based on profile';

    return { score, commonInterests, reason };
  }

  async createMatch(
    senderId: string,
    receiverId: string,
    type: MatchType,
    message?: string
  ) {
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

    if (!sender || !receiver) {
      throw new Error('User not found');
    }

    // Check if match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { senderId, receiverId, type },
          { senderId: receiverId, receiverId: senderId, type },
        ],
      },
    });

    if (existingMatch) {
      throw new Error('Match already exists');
    }

    // Calculate compatibility
    const { score, commonInterests, reason } = this.calculateCompatibility(
      sender,
      receiver,
      type
    );

    // Create match
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.MATCH_EXPIRY_DAYS);

    const match = await prisma.match.create({
      data: {
        senderId,
        receiverId,
        type,
        compatibility: score,
        reason,
        interests: commonInterests,
        message,
        expiresAt,
      },
    });

    // Notify receiver
    await notificationService.notifyMatchRequest(
      receiverId,
      sender.fullName,
      type.toLowerCase()
    );

    return match;
  }

  async respondToMatch(matchId: string, userId: string, accept: boolean) {
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!match) {
      throw new Error('Match not found or already responded');
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: accept ? 'ACCEPTED' : 'REJECTED',
      },
    });

    if (accept) {
      // Notify sender that match was accepted
      await notificationService.createNotification({
        userId: match.senderId,
        type: 'MATCH',
        title: 'Match Accepted!',
        message: `${match.receiver.fullName} accepted your ${match.type.toLowerCase()} match`,
        actionUrl: `/match/${matchId}`,
      });
    }

    return updatedMatch;
  }

  async getUserMatches(userId: string, status?: MatchStatus) {
    const where = {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
      ...(status && { status }),
    };

    const matches = await prisma.match.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
            city: true,
            interests: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
            city: true,
            interests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform matches to always show the other user
    return matches.map(match => ({
      ...match,
      otherUser: match.senderId === userId ? match.receiver : match.sender,
      isReceived: match.receiverId === userId,
    }));
  }

  async getMatchRecommendations(userId: string, type: MatchType) {
    const candidates = await this.findMatches({ userId, type });
    
    // Auto-create matches for top candidates
    const recommendations = await Promise.all(
      candidates.slice(0, 3).map(async candidate => {
        try {
          const match = await this.createMatch(
            userId,
            candidate.id,
            type,
            `Hi! We have ${candidate.commonInterests.length} interests in common.`
          );
          return {
            ...match,
            candidate: {
              id: candidate.id,
              fullName: candidate.fullName,
              profilePicture: candidate.profilePicture,
              city: candidate.city,
              interests: candidate.interests,
            },
          };
        } catch (error) {
          // Match might already exist
          return null;
        }
      })
    );

    return recommendations.filter(r => r !== null);
  }

  async cleanupExpiredMatches() {
    const expiredMatches = await prisma.match.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: new Date() },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    return expiredMatches.count;
  }
}

export default new MatchingService();