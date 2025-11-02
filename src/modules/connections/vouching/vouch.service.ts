import { prisma } from '../../../config/database';
import { AppError } from '../../../middleware/error';
import {
  RequestVouchInput,
  RespondToVouchRequestInput,
  RevokeVouchInput,
  CommunityVouchInput,
  VouchQuery,
  VouchResponse,
  PaginatedVouchesResponse,
  VouchSummary,
  VouchLimits,
  AutoVouchCheckResult,
  AutoVouchEligibility,
} from './vouch.types';
import { VouchType, VouchStatus, ConnectionStatus, CommunityRole } from '@prisma/client';
import logger from '../../../utils/logger';
import { TrustScoreService } from '../trust/trust-score.service';
import { NotificationService } from '../../../services/notification.service';
import { TrustScoreUserService } from '../../user/trust-score.service';

export class VouchService {
  
  /**
   * Format vouch response with relations
   */
  private static formatVouchResponse(vouch: any): VouchResponse {
    const voucherInfo = vouch.users_vouches_voucherIdTousers || vouch.voucher;
    const voucheeInfo = vouch.users_vouches_voucheeIdTousers || vouch.vouchee;

    return {
      id: vouch.id,
      voucherId: vouch.voucherId,
      voucheeId: vouch.voucheeId,
      vouchType: vouch.vouchType,
      weightPercentage: vouch.weightPercentage,
      message: vouch.message,
      status: vouch.status,
      isCommunityVouch: vouch.isCommunityVouch,
      communityId: vouch.communityId,
      isAutoVouched: vouch.isAutoVouched,
      requestedAt: vouch.requestedAt.toISOString(),
      approvedAt: vouch.approvedAt?.toISOString(),
      activatedAt: vouch.activatedAt?.toISOString(),
      revokedAt: vouch.revokedAt?.toISOString(),
      revokeReason: vouch.revokeReason,
      trustImpact: vouch.trustImpact,
      voucher: voucherInfo ? {
        id: voucherInfo.id,
        fullName: voucherInfo.fullName,
        username: voucherInfo.username,
        trustScore: voucherInfo.trustScore,
        trustLevel: voucherInfo.trustLevel,
      } : undefined,
      vouchee: voucheeInfo ? {
        id: voucheeInfo.id,
        fullName: voucheeInfo.fullName,
        username: voucheeInfo.username,
        trustScore: voucheeInfo.trustScore,
        trustLevel: voucheeInfo.trustLevel,
      } : undefined,
    };
  }

  /**
   * Request a vouch from another user
   */
  static async requestVouch(
    voucheeId: string,
    data: RequestVouchInput
  ): Promise<VouchResponse> {
    try {
      const { voucherId, vouchType, message } = data;

      // 1. Validate voucher exists and is not blocked
      const voucher = await prisma.user.findUnique({
        where: { id: voucherId },
        select: { id: true, status: true },
      });

      if (!voucher) {
        throw new AppError('Voucher not found', 404);
      }

      if (voucher.status !== 'ACTIVE') {
        throw new AppError('This user cannot vouch at this time', 400);
      }

      // Check if blocked
      const isBlocked = await prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: voucheeId, blockedId: voucherId },
            { blockerId: voucherId, blockedId: voucheeId },
          ],
        },
      });

      if (isBlocked) {
        throw new AppError('Cannot request vouch from this user', 403);
      }

      // 2. Check if voucher is a connection (must be ACCEPTED)
      const connection = await prisma.userConnection.findFirst({
        where: {
          OR: [
            { initiatorId: voucheeId, receiverId: voucherId, status: ConnectionStatus.ACCEPTED },
            { initiatorId: voucherId, receiverId: voucheeId, status: ConnectionStatus.ACCEPTED },
          ],
        },
      });

      if (!connection) {
        throw new AppError('You must be connected to request a vouch', 400);
      }

      // 3. Check if vouchee has reached limit for this type
      const config = await prisma.vouchConfig.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      const maxLimits = {
        [VouchType.PRIMARY]: config?.maxPrimaryVouches || 1,
        [VouchType.SECONDARY]: config?.maxSecondaryVouches || 3,
        [VouchType.COMMUNITY]: config?.maxCommunityVouches || 2,
      };

      const currentCount = await prisma.vouch.count({
        where: {
          voucheeId,
          vouchType,
          status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] },
        },
      });

      if (currentCount >= maxLimits[vouchType]) {
        throw new AppError(`Maximum ${vouchType.toLowerCase()} vouches reached`, 400);
      }

      // 4. Check if request already exists
      const existingRequest = await prisma.vouch.findFirst({
        where: {
          voucherId,
          voucheeId,
          vouchType,
          status: { in: [VouchStatus.PENDING, VouchStatus.APPROVED, VouchStatus.ACTIVE] },
        },
      });

      if (existingRequest) {
        throw new AppError('Vouch request already exists', 400);
      }

      // 5. Get weight percentage from config
      const weights = {
        [VouchType.PRIMARY]: config?.primaryVouchWeight || 30.0,
        [VouchType.SECONDARY]: config?.secondaryVouchWeight || 30.0,
        [VouchType.COMMUNITY]: config?.communityVouchWeight || 40.0,
      };

      // 6. Create vouch request
      const vouch = await prisma.vouch.create({
        data: {
          voucherId,
          voucheeId,
          vouchType,
          weightPercentage: weights[vouchType],
          message,
          status: VouchStatus.PENDING,
          isCommunityVouch: false,
          isAutoVouched: false,
          requestedAt: new Date(),
        },
        include: {
          users_vouches_voucherIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
            },
          },
          users_vouches_voucheeIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
            },
          },
        },
      });

      logger.info(`Vouch request created: ${vouch.id} (${vouchType})`);

      // Send notification to voucher
      const voucheeUser = vouch.users_vouches_voucheeIdTousers;
      if (voucheeUser) {
        await NotificationService.createNotification({
          userId: voucherId,
          type: 'VOUCH',
          title: 'Vouch Request Received',
          message: `${voucheeUser.fullName || voucheeUser.username} is requesting a ${vouchType.toLowerCase()} vouch from you`,
          actionUrl: `/vouches`,
          priority: 'normal',
          relatedEntityId: vouch.id,
          relatedEntityType: 'vouch_request',
          metadata: {
            vouchId: vouch.id,
            vouchType,
            voucheeId,
          },
        });
      }

      return this.formatVouchResponse(vouch);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error requesting vouch:', error);
      throw new AppError('Failed to request vouch', 500);
    }
  }

  /**
   * Respond to a vouch request (approve/decline/downgrade)
   */
  static async respondToVouchRequest(
    voucherId: string,
    data: RespondToVouchRequestInput
  ): Promise<VouchResponse> {
    try {
      const { vouchId, action, downgradeTo } = data;

      // 1. Get vouch and validate voucher is the one responding
      const vouch = await prisma.vouch.findUnique({
        where: { id: vouchId },
        include: {
          users_vouches_voucherIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
            },
          },
          users_vouches_voucheeIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
            },
          },
        },
      });

      if (!vouch) {
        throw new AppError('Vouch request not found', 404);
      }

      if (vouch.voucherId !== voucherId) {
        throw new AppError('You are not authorized to respond to this vouch request', 403);
      }

      // 2. Validate status is PENDING
      if (vouch.status !== VouchStatus.PENDING) {
        throw new AppError('This vouch request has already been processed', 400);
      }

      let updatedVouch;
      const voucherName = vouch.users_vouches_voucherIdTousers.fullName;

      if (action === 'approve') {
        // 3. Approve vouch
        const config = await prisma.vouchConfig.findFirst({
          orderBy: { createdAt: 'desc' },
        });

        const weights = {
          [VouchType.PRIMARY]: config?.primaryVouchWeight || 30.0,
          [VouchType.SECONDARY]: config?.secondaryVouchWeight || 30.0,
          [VouchType.COMMUNITY]: config?.communityVouchWeight || 40.0,
        };

        // Calculate trust impact based on vouch type weight and total vouch contribution (40%)
        const trustImpact = (weights[vouch.vouchType] * 0.4) / 100 * 100;

        updatedVouch = await prisma.vouch.update({
          where: { id: vouchId },
          data: {
            status: VouchStatus.ACTIVE,
            approvedAt: new Date(),
            activatedAt: new Date(),
            trustImpact,
          },
          include: {
            users_vouches_voucherIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
            users_vouches_voucheeIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
          },
        });

        // Update trust score
        const previousScore = await prisma.user.findUnique({
          where: { id: vouch.voucheeId },
          select: { trustScore: true },
        }).then(u => u?.trustScore || 0);

        await TrustScoreService.triggerTrustScoreUpdate(
          vouch.voucheeId,
          `Vouch approved by ${voucherName}`
        );

        // Get new score and record history
        const newScore = await prisma.user.findUnique({
          where: { id: vouch.voucheeId },
          select: { trustScore: true },
        }).then(u => u?.trustScore || 0);

        await TrustScoreUserService.recordScoreChange(
          vouch.voucheeId,
          newScore,
          previousScore,
          `${vouch.vouchType} vouch approved by ${voucherName}`,
          'vouches',
          'vouch',
          vouchId
        ).catch(err => logger.error('Failed to record score change:', err));

        // Update user stats
        try {
          const { UserStatService } = await import('../../user/user-stat.service');
          await UserStatService.incrementVouchesReceived(vouch.voucheeId);
          await UserStatService.incrementVouchesGiven(voucherId);
          logger.info(`Updated vouch stats for vouchee ${vouch.voucheeId} and voucher ${voucherId}`);
        } catch (error) {
          logger.error('Failed to update user stats for vouch approval:', error);
        }

        // Send notification to vouchee
        await NotificationService.notifyVouchReceived(
          vouch.voucheeId,
          voucherName,
          voucherId,
          vouch.vouchType
        );

        // Send approval notification to vouchee
        NotificationService.notifyVouchApproved(
          vouch.voucheeId,
          voucherName,
          voucherId,
          vouch.vouchType
        ).catch(err => logger.error('Failed to send vouch approval notification:', err));

        // Send activation notification
        NotificationService.notifyVouchActivated(
          vouch.voucheeId,
          voucherName,
          voucherId,
          vouch.vouchType
        ).catch(err => logger.error('Failed to send vouch activation notification:', err));

        logger.info(`Vouch approved: ${vouchId} (${vouch.vouchType})`);
      } else if (action === 'downgrade') {
        // 4. Downgrade vouch type
        if (!downgradeTo) {
          throw new AppError('downgradeTo is required when downgrading', 400);
        }

        if (vouch.vouchType === VouchType.PRIMARY && downgradeTo !== VouchType.SECONDARY) {
          throw new AppError('PRIMARY vouch can only be downgraded to SECONDARY', 400);
        }

        if (vouch.vouchType === VouchType.SECONDARY) {
          throw new AppError('SECONDARY vouch cannot be downgraded further', 400);
        }

        const config = await prisma.vouchConfig.findFirst({
          orderBy: { createdAt: 'desc' },
        });

        const weights = {
          [VouchType.PRIMARY]: config?.primaryVouchWeight || 30.0,
          [VouchType.SECONDARY]: config?.secondaryVouchWeight || 30.0,
          [VouchType.COMMUNITY]: config?.communityVouchWeight || 40.0,
        };

        const trustImpact = (weights[downgradeTo] * 0.4) / 100 * 100;

        updatedVouch = await prisma.vouch.update({
          where: { id: vouchId },
          data: {
            vouchType: downgradeTo,
            weightPercentage: weights[downgradeTo],
            status: VouchStatus.APPROVED,
            approvedAt: new Date(),
            activatedAt: new Date(),
            trustImpact,
          },
          include: {
            users_vouches_voucherIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
            users_vouches_voucheeIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
          },
        });

        await TrustScoreService.triggerTrustScoreUpdate(
          vouch.voucheeId,
          `Vouch downgraded to ${downgradeTo} by ${voucherName}`
        );

        logger.info(`Vouch downgraded: ${vouchId} (${vouch.vouchType} -> ${downgradeTo})`);
      } else if (action === 'decline') {
        // 5. Decline vouch - update to DECLINED status
        updatedVouch = await prisma.vouch.update({
          where: { id: vouchId },
          data: {
            status: VouchStatus.DECLINED,
            approvedAt: new Date(), // Store when it was declined
          },
          include: {
            users_vouches_voucherIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
            users_vouches_voucheeIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
          },
        });

        // Notify vouchee of rejection
        NotificationService.notifyVouchRejected(
          vouch.voucheeId,
          vouchId,
          voucherName,
          vouch.vouchType
        ).catch(err => logger.error('Failed to send vouch rejection notification:', err));

        logger.info(`Vouch declined: ${vouchId}`);
      } else {
        throw new AppError('Invalid action', 400);
      }

      // TODO: Send notification to vouchee

      return this.formatVouchResponse(updatedVouch);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error responding to vouch request:', error);
      throw new AppError('Failed to respond to vouch request', 500);
    }
  }

  /**
   * Revoke an existing vouch
   */
  static async revokeVouch(
    voucherId: string,
    data: RevokeVouchInput
  ): Promise<void> {
    try {
      const { vouchId, reason } = data;

      // 1. Get vouch and validate voucher owns it
      const vouch = await prisma.vouch.findUnique({
        where: { id: vouchId },
        include: {
          users_vouches_voucherIdTousers: {
            select: { fullName: true },
          },
        },
      });

      if (!vouch) {
        throw new AppError('Vouch not found', 404);
      }

      if (vouch.voucherId !== voucherId) {
        throw new AppError('You are not authorized to revoke this vouch', 403);
      }

      // 2. Validate status is APPROVED or ACTIVE
      if (vouch.status !== VouchStatus.APPROVED && vouch.status !== VouchStatus.ACTIVE) {
        throw new AppError('Only approved or active vouches can be revoked', 400);
      }

      // 3. Update status to REVOKED
      await prisma.vouch.update({
        where: { id: vouchId },
        data: {
          status: VouchStatus.REVOKED,
          revokedAt: new Date(),
          revokeReason: reason,
        },
      });

      // 4. Recalculate vouchee's trust score
      const previousScore = await prisma.user.findUnique({
        where: { id: vouch.voucheeId },
        select: { trustScore: true },
      }).then(u => u?.trustScore || 0);

      await TrustScoreService.triggerTrustScoreUpdate(
        vouch.voucheeId,
        `Vouch revoked by ${vouch.users_vouches_voucherIdTousers.fullName}`
      );

      // Get new score and record history
      const newScore = await prisma.user.findUnique({
        where: { id: vouch.voucheeId },
        select: { trustScore: true },
      }).then(u => u?.trustScore || 0);

      await TrustScoreUserService.recordScoreChange(
        vouch.voucheeId,
        newScore,
        previousScore,
        `${vouch.vouchType} vouch revoked by ${vouch.users_vouches_voucherIdTousers.fullName}`,
        'vouches',
        'vouch',
        vouchId,
        { reason }
      ).catch(err => logger.error('Failed to record score change:', err));

      // Update user stats
      try {
        const { UserStatService } = await import('../../user/user-stat.service');
        await UserStatService.decrementVouchesReceived(vouch.voucheeId);
        await UserStatService.decrementVouchesGiven(voucherId);
        logger.info(`Decremented vouch stats for vouchee ${vouch.voucheeId} and voucher ${voucherId}`);
      } catch (error) {
        logger.error('Failed to update user stats for vouch revocation:', error);
      }

      // Notify vouchee of revocation
      NotificationService.notifyVouchRevoked(
        vouch.voucheeId,
        vouch.users_vouches_voucherIdTousers.fullName,
        vouchId,
        reason
      ).catch(err => logger.error('Failed to send vouch revocation notification:', err));

      logger.info(`Vouch revoked: ${vouchId}`);

      // Trigger accountability chain for vouch revocation (negative impact)
      try {
        const { AccountabilityService } = await import('../accountability/accountability.service');
        const revokeImpact = -(previousScore - newScore); // Calculate the negative impact
        
        await AccountabilityService.recordAccountabilityEvent(
          vouch.voucheeId,
          'NEGATIVE' as any,
          revokeImpact,
          `Vouch revoked: ${reason || 'No reason provided'}`,
          'vouch_revocation',
          vouchId,
          {
            vouchType: vouch.vouchType,
            voucherId,
            voucherName: vouch.users_vouches_voucherIdTousers.fullName,
            reason,
          }
        );
        
        logger.info(`Triggered accountability chain for vouch revocation ${vouchId}`);
      } catch (error) {
        logger.error('Failed to trigger accountability chain for vouch revocation:', error);
      }

      // TODO: Send notification to vouchee
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error revoking vouch:', error);
      throw new AppError('Failed to revoke vouch', 500);
    }
  }

  /**
   * Withdraw a pending vouch request
   */
  static async withdrawVouchRequest(userId: string, vouchId: string): Promise<void> {
    try {
      // 1. Find the vouch and verify it exists
      const vouch = await prisma.vouch.findUnique({
        where: { id: vouchId },
        include: {
          users_vouches_voucherIdTousers: {
            select: { id: true, fullName: true },
          },
          users_vouches_voucheeIdTousers: {
            select: { id: true, fullName: true },
          },
        },
      });

      if (!vouch) {
        throw new AppError('Vouch request not found', 404);
      }

      // 2. Verify the user is the voucher (sender)
      if (vouch.voucherId !== userId) {
        throw new AppError('You can only withdraw your own vouch requests', 403);
      }

      // 3. Verify the vouch is still pending
      if (vouch.status !== VouchStatus.PENDING) {
        throw new AppError('Only pending vouch requests can be withdrawn', 400);
      }

      // 4. Delete the vouch request
      await prisma.vouch.delete({
        where: { id: vouchId },
      });

      // 5. Send notification to vouchee
      try {
        await NotificationService.notifyVouchWithdrawn(
          vouch.voucheeId,
          userId,
          vouch.users_vouches_voucherIdTousers.fullName
        );
      } catch (error) {
        logger.error('Failed to send vouch withdrawal notification:', error);
      }

      logger.info(`Vouch request ${vouchId} withdrawn by ${userId}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error withdrawing vouch request:', error);
      throw new AppError('Failed to withdraw vouch request', 500);
    }
  }

  /**
   * Community admin vouches for a user
   */
  static async createCommunityVouch(
    adminId: string,
    data: CommunityVouchInput
  ): Promise<VouchResponse> {
    try {
      const { userId, communityId, message } = data;

      // 1. Validate admin has permission in community
      const membership = await prisma.communityMember.findFirst({
        where: {
          userId: adminId,
          communityId,
          role: { in: [CommunityRole.OWNER, CommunityRole.MODERATOR, CommunityRole.ADMIN] },
        },
      });

      if (!membership) {
        throw new AppError('You do not have permission to vouch for this community', 403);
      }

      // 2. Check community vouch limits for user (max 2)
      const config = await prisma.vouchConfig.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      const currentCount = await prisma.vouch.count({
        where: {
          voucheeId: userId,
          vouchType: VouchType.COMMUNITY,
          status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] },
        },
      });

      const maxLimit = config?.maxCommunityVouches || 2;
      if (currentCount >= maxLimit) {
        throw new AppError('Maximum community vouches reached', 400);
      }

      // 3. Create vouch
      const weight = config?.communityVouchWeight || 40.0;
      const trustImpact = (weight * 0.4) / 100 * 100;

      const vouch = await prisma.vouch.create({
        data: {
          voucherId: adminId,
          voucheeId: userId,
          vouchType: VouchType.COMMUNITY,
          weightPercentage: weight,
          message,
          status: VouchStatus.APPROVED,
          approvedAt: new Date(),
          activatedAt: new Date(),
          isCommunityVouch: true,
          communityId,
          vouchedByAdminId: adminId,
          isAutoVouched: false,
          requestedAt: new Date(),
          trustImpact,
        },
        include: {
          users_vouches_voucherIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
            },
          },
          users_vouches_voucheeIdTousers: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
            },
          },
        },
      });

      // 4. Update user's trust score
      const previousScore = await prisma.user.findUnique({
        where: { id: userId },
        select: { trustScore: true },
      }).then(u => u?.trustScore || 0);

      await TrustScoreService.triggerTrustScoreUpdate(
        userId,
        'Community vouch received'
      );

      // Get new score and record history
      const newScore = await prisma.user.findUnique({
        where: { id: userId },
        select: { trustScore: true },
      }).then(u => u?.trustScore || 0);

      const community = await prisma.community.findUnique({
        where: { id: communityId },
        select: { name: true },
      });

      await TrustScoreUserService.recordScoreChange(
        userId,
        newScore,
        previousScore,
        `Community vouch received from ${community?.name || 'community'}`,
        'vouches',
        'community_vouch',
        vouch.id,
        { communityId }
      ).catch(err => logger.error('Failed to record score change:', err));

      logger.info(`Community vouch created: ${vouch.id} for user ${userId}`);

      // TODO: Send notification to user

      return this.formatVouchResponse(vouch);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error creating community vouch:', error);
      throw new AppError('Failed to create community vouch', 500);
    }
  }

  /**
   * Check auto-vouch eligibility for a user
   */
  static async checkAutoVouchEligibility(userId: string): Promise<AutoVouchCheckResult> {
    try {
      const config = await prisma.vouchConfig.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      const minEvents = config?.autoVouchMinEvents || 5;
      const minDays = config?.autoVouchMinMemberDays || 90;

      // Get communities user is a member of
      const memberships = await prisma.communityMember.findMany({
        where: { userId, isApproved: true },
        include: {
          communities: {
            select: { id: true, name: true },
          },
        },
      });

      const eligible: AutoVouchEligibility[] = [];
      const notEligible: AutoVouchEligibility[] = [];

      for (const membership of memberships) {
        // Calculate days as member
        const joinedDate = membership.joinedAt;
        const daysSinceJoined = Math.floor(
          (Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Count events attended in this community
        const eventsAttended = await prisma.eventParticipant.count({
          where: {
            userId,
            checkedInAt: { not: null },
            events: {
              communityId: membership.communityId,
            },
          },
        });

        // Check for negative feedback (simplified - check if user has low trust score)
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { trustScore: true },
        });
        const hasNegativeFeedback = (user?.trustScore || 0) < 40;

        const criteria = {
          minEvents,
          currentEvents: eventsAttended,
          minMemberDays: minDays,
          currentMemberDays: daysSinceJoined,
          requireZeroNegativity: true,
          hasNegativeFeedback,
        };

        const missingRequirements: string[] = [];
        if (eventsAttended < minEvents) {
          missingRequirements.push(`Need ${minEvents - eventsAttended} more event(s)`);
        }
        if (daysSinceJoined < minDays) {
          missingRequirements.push(`Need ${minDays - daysSinceJoined} more day(s)`);
        }
        if (hasNegativeFeedback) {
          missingRequirements.push('Trust score too low');
        }

        const result: AutoVouchEligibility = {
          isEligible: missingRequirements.length === 0,
          communityId: membership.communityId,
          communityName: membership.communities.name,
          criteria,
          missingRequirements,
        };

        if (result.isEligible) {
          eligible.push(result);
        } else {
          notEligible.push(result);
        }
      }

      return { eligible, notEligible };
    } catch (error) {
      logger.error('Error checking auto-vouch eligibility:', error);
      throw new AppError('Failed to check auto-vouch eligibility', 500);
    }
  }

  /**
   * Process auto-vouches for eligible users (background job)
   */
  static async processAutoVouches(): Promise<number> {
    try {
      // TODO: Implementation for background job
      // This should be called by a cron job/background job
      logger.info('Auto-vouch processing not yet implemented');
      return 0;
    } catch (error) {
      logger.error('Error processing auto-vouches:', error);
      return 0;
    }
  }

  /**
   * Get vouches received by user
   */
  static async getVouchesReceived(
    userId: string,
    query: VouchQuery
  ): Promise<PaginatedVouchesResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        vouchType,
        isCommunityVouch,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const where: any = { voucheeId: userId };
      if (status) where.status = status;
      if (vouchType) where.vouchType = vouchType;
      if (isCommunityVouch !== undefined) where.isCommunityVouch = isCommunityVouch;

      const [vouches, totalCount] = await Promise.all([
        prisma.vouch.findMany({
          where,
          include: {
            users_vouches_voucherIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.vouch.count({ where }),
      ]);

      return {
        vouches: vouches.map(v => this.formatVouchResponse(v)),
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      logger.error('Error getting vouches received:', error);
      throw new AppError('Failed to get vouches received', 500);
    }
  }

  /**
   * Get vouches given by user
   */
  static async getVouchesGiven(
    userId: string,
    query: VouchQuery
  ): Promise<PaginatedVouchesResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        vouchType,
        isCommunityVouch,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const where: any = { voucherId: userId };
      if (status) where.status = status;
      if (vouchType) where.vouchType = vouchType;
      if (isCommunityVouch !== undefined) where.isCommunityVouch = isCommunityVouch;

      const [vouches, totalCount] = await Promise.all([
        prisma.vouch.findMany({
          where,
          include: {
            users_vouches_voucheeIdTousers: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.vouch.count({ where }),
      ]);

      return {
        vouches: vouches.map(v => this.formatVouchResponse(v)),
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      logger.error('Error getting vouches given:', error);
      throw new AppError('Failed to get vouches given', 500);
    }
  }

  /**
   * Get vouch limits and availability for user
   */
  static async getVouchLimits(userId: string): Promise<VouchLimits> {
    try {
      const config = await prisma.vouchConfig.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      const maxLimits = {
        PRIMARY: config?.maxPrimaryVouches || 1,
        SECONDARY: config?.maxSecondaryVouches || 3,
        COMMUNITY: config?.maxCommunityVouches || 2,
      };

      // Count current vouches by type
      const [primaryCount, secondaryCount, communityCount] = await Promise.all([
        prisma.vouch.count({
          where: {
            voucherId: userId,
            vouchType: VouchType.PRIMARY,
            status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] },
          },
        }),
        prisma.vouch.count({
          where: {
            voucherId: userId,
            vouchType: VouchType.SECONDARY,
            status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] },
          },
        }),
        prisma.vouch.count({
          where: {
            voucherId: userId,
            vouchType: VouchType.COMMUNITY,
            status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] },
          },
        }),
      ]);

      return {
        maxPrimaryVouches: maxLimits.PRIMARY,
        maxSecondaryVouches: maxLimits.SECONDARY,
        maxCommunityVouches: maxLimits.COMMUNITY,
        currentPrimaryVouches: primaryCount,
        currentSecondaryVouches: secondaryCount,
        currentCommunityVouches: communityCount,
        canAddPrimary: primaryCount < maxLimits.PRIMARY,
        canAddSecondary: secondaryCount < maxLimits.SECONDARY,
        canAddCommunity: communityCount < maxLimits.COMMUNITY,
      };
    } catch (error) {
      logger.error('Error getting vouch limits:', error);
      throw new AppError('Failed to get vouch limits', 500);
    }
  }

  /**
   * Get vouch summary for user
   */
  static async getVouchSummary(userId: string): Promise<VouchSummary> {
    try {
      const [
        vouchesReceived,
        vouchesGiven,
        pendingRequests,
        primary,
        secondary,
        community,
        active,
        revoked,
        declined,
      ] = await Promise.all([
        prisma.vouch.count({
          where: { voucheeId: userId, status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] } },
        }),
        prisma.vouch.count({
          where: { voucherId: userId, status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] } },
        }),
        prisma.vouch.count({
          where: { voucheeId: userId, status: VouchStatus.PENDING },
        }),
        prisma.vouch.count({
          where: { voucheeId: userId, vouchType: VouchType.PRIMARY, status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] } },
        }),
        prisma.vouch.count({
          where: { voucheeId: userId, vouchType: VouchType.SECONDARY, status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] } },
        }),
        prisma.vouch.count({
          where: { voucheeId: userId, vouchType: VouchType.COMMUNITY, status: { in: [VouchStatus.APPROVED, VouchStatus.ACTIVE] } },
        }),
        prisma.vouch.count({
          where: { voucheeId: userId, status: VouchStatus.ACTIVE },
        }),
        prisma.vouch.count({
          where: { voucheeId: userId, status: VouchStatus.REVOKED },
        }),
        prisma.vouch.count({
          where: { voucheeId: userId, status: VouchStatus.DECLINED },
        }),
      ]);

      const config = await prisma.vouchConfig.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      const maxLimits = {
        PRIMARY: config?.maxPrimaryVouches || 1,
        SECONDARY: config?.maxSecondaryVouches || 3,
        COMMUNITY: config?.maxCommunityVouches || 2,
      };

      return {
        totalVouchesReceived: vouchesReceived,
        totalVouchesGiven: vouchesGiven,
        primaryVouches: primary,
        secondaryVouches: secondary,
        communityVouches: community,
        pendingRequests,
        activeVouches: active,
        revokedVouches: revoked,
        declinedVouches: declined,
        availableSlots: {
          primary: maxLimits.PRIMARY - primary,
          secondary: maxLimits.SECONDARY - secondary,
          community: maxLimits.COMMUNITY - community,
        },
      };
    } catch (error) {
      logger.error('Error getting vouch summary:', error);
      throw new AppError('Failed to get vouch summary', 500);
    }
  }
}
