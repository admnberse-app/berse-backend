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
import { VouchType, VouchStatus, Prisma, ConnectionStatus, CommunityRole } from '@prisma/client';
import logger from '../../../utils/logger';
import { TrustScoreService } from '../trust/trust-score.service';

export class VouchService {
  
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
          voucher: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
            },
          },
          vouchee: {
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

      // TODO: Send notification to voucher

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
          voucher: {
            select: {
              id: true,
              fullName: true,
              username: true,
              trustScore: true,
              trustLevel: true,
            },
          },
          vouchee: {
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
        const trustImpact = (weights[vouch.vouchType] * 0.4) / 100 * 100; // Simplified

        updatedVouch = await prisma.vouch.update({
          where: { id: vouchId },
          data: {
            status: VouchStatus.APPROVED,
            approvedAt: new Date(),
            activatedAt: new Date(),
            trustImpact,
          },
          include: {
            voucher: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
            vouchee: {
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
        await TrustScoreService.triggerTrustScoreUpdate(
          vouch.voucheeId,
          `Vouch approved by ${vouch.voucher.fullName}`
        );

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
            voucher: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
            vouchee: {
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
          `Vouch downgraded to ${downgradeTo} by ${vouch.voucher.fullName}`
        );

        logger.info(`Vouch downgraded: ${vouchId} (${vouch.vouchType} -> ${downgradeTo})`);
      } else if (action === 'decline') {
        // 5. Decline vouch - update to DECLINED
        updatedVouch = await prisma.vouch.update({
          where: { id: vouchId },
          data: {
            status: VouchStatus.DECLINED,
            approvedAt: new Date(), // Store when it was declined
          },
          include: {
            voucher: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustScore: true,
                trustLevel: true,
              },
            },
            vouchee: {
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
      // TODO: Implementation
      // 1. Get vouch and validate voucher owns it
      // 2. Validate status is APPROVED or ACTIVE
      // 3. Update status to REVOKED, set revokedAt and revokeReason
      // 4. Recalculate vouchee's trust score (call TrustService)
      // 5. Send notification to vouchee
      
      throw new AppError('Revoke vouch feature coming soon', 501);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error revoking vouch:', error);
      throw new AppError('Failed to revoke vouch', 500);
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
      // TODO: Implementation
      // 1. Validate admin has permission (ADMIN/OWNER/MODERATOR) in community
      // 2. Check community vouch limits for user (max 2)
      // 3. Create vouch with isCommunityVouch=true, status=APPROVED
      // 4. Set communityId and vouchedByAdminId
      // 5. Update user's trust score
      // 6. Send notification to user
      // 7. Return formatted response
      
      throw new AppError('Community vouch feature coming soon', 501);
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
      // TODO: Implementation
      // 1. Get all communities user is member of
      // 2. Get vouch config for auto-vouch criteria
      // 3. For each community, check:
      //    - Events attended (>= 5)
      //    - Member duration (>= 90 days)
      //    - No negative feedback
      // 4. Return eligible and not eligible communities
      
      throw new AppError('Auto-vouch eligibility check coming soon', 501);
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
      // TODO: Implementation
      // This should be called by a cron job/background job
      // 1. Get vouch config
      // 2. Find users eligible for auto-vouch in each community
      // 3. Create pending auto-vouches (user must accept)
      // 4. Send notifications
      // 5. Return count of vouches created
      
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
      // TODO: Implementation
      // 1. Query vouches where voucheeId = userId
      // 2. Apply filters (status, vouchType, isCommunityVouch)
      // 3. Paginate results
      // 4. Include voucher/community info
      // 5. Calculate summary stats
      // 6. Return formatted response
      
      throw new AppError('Get vouches received feature coming soon', 501);
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
      // TODO: Implementation
      // Similar to getVouchesReceived but where voucherId = userId
      
      throw new AppError('Get vouches given feature coming soon', 501);
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
      // TODO: Implementation
      // 1. Get vouch config
      // 2. Count current vouches by type (APPROVED or ACTIVE status)
      // 3. Calculate available slots
      // 4. Return limits info
      
      throw new AppError('Get vouch limits feature coming soon', 501);
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
      // TODO: Implementation
      // Aggregate vouch statistics for dashboard
      
      throw new AppError('Get vouch summary feature coming soon', 501);
    } catch (error) {
      logger.error('Error getting vouch summary:', error);
      throw new AppError('Failed to get vouch summary', 500);
    }
  }
}
