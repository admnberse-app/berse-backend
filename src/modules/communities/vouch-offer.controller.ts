import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

// Define status enum until Prisma regenerates
enum VouchOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

enum VouchType {
  COMMUNITY = 'COMMUNITY',
}

export class CommunityVouchOfferController {
  /**
   * GET /communities/:id/vouch-offers
   * List pending vouch offers for the authenticated user in a specific community
   */
  async getMyVouchOffers(req: Request, res: Response): Promise<void> {
    try {
      const { id: communityId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const offers = await prisma.communityVouchOffer.findMany({
        where: {
          userId,
          communityId,
          status: VouchOfferStatus.PENDING,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          community: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json({
        success: true,
        data: {
          offers: offers.map((offer) => ({
            id: offer.id,
            community: offer.community,
            eligibilityReason: offer.eligibilityReason,
            eventsAttended: offer.eventsAttended,
            membershipDays: offer.membershipDays,
            createdAt: offer.createdAt,
            expiresAt: offer.expiresAt,
            daysRemaining: Math.ceil((offer.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
          })),
          count: offers.length,
        },
      });
    } catch (error) {
      logger.error('[CommunityVouchOfferController] Error getting vouch offers', { error });
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }

  /**
   * POST /communities/:id/vouch-offers/:offerId/accept
   * Accept a vouch offer and create the vouch
   */
  async acceptVouchOffer(req: Request, res: Response): Promise<void> {
    try {
      const { id: communityId, offerId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Fetch the offer
      const offer = await prisma.communityVouchOffer.findUnique({
        where: { id: offerId },
        include: {
          community: {
            select: {
              id: true,
              name: true,
              createdById: true,
            },
          },
        },
      });

      if (!offer) {
        throw new AppError('Vouch offer not found', 404);
      }

      if (offer.userId !== userId) {
        throw new AppError('Not authorized to accept this offer', 403);
      }

      if (offer.communityId !== communityId) {
        throw new AppError('Offer does not match community', 400);
      }

      if (offer.status !== VouchOfferStatus.PENDING) {
        throw new AppError(`Offer is already ${offer.status.toLowerCase()}`, 400);
      }

      if (offer.expiresAt < new Date()) {
        throw new AppError('Offer has expired', 400);
      }

      // Check if user already has a community vouch
      const existingVouch = await prisma.vouch.findFirst({
        where: {
          voucheeId: userId,
          communityId,
          isCommunityVouch: true,
          status: {
            in: ['APPROVED', 'ACTIVE'],
          },
        },
      });

      if (existingVouch) {
        throw new AppError('You already have a community vouch for this community', 400);
      }

      // Create the vouch and update the offer in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the vouch
        const vouch = await tx.vouch.create({
          data: {
            voucherId: offer.community.createdById, // Community creator vouches
            voucheeId: userId,
            vouchType: VouchType.COMMUNITY as any,
            isCommunityVouch: true,
            communityId,
            status: 'APPROVED' as any,
            requiresApproval: false,
            isAutoVouched: true,
            autoVouchCriteria: {
              source: 'community_eligibility',
              eventsAttended: offer.eventsAttended,
              membershipDays: offer.membershipDays,
              offerId: offer.id,
            },
            message: `Community vouch granted based on: ${offer.eligibilityReason}`,
            approvedAt: new Date(),
          },
        });

        // Update the offer
        await tx.communityVouchOffer.update({
          where: { id: offerId },
          data: {
            status: VouchOfferStatus.ACCEPTED as any,
            acceptedAt: new Date(),
            vouchId: vouch.id,
          },
        });

        return vouch;
      });

      logger.info('[CommunityVouchOfferController] Vouch offer accepted', {
        userId,
        communityId,
        offerId,
        vouchId: result.id,
      });

      res.status(200).json({
        success: true,
        data: {
          vouch: result,
          message: 'Vouch offer accepted successfully! Your trust score will be recalculated.',
        },
      });

      // TODO: Trigger trust score recalculation
      // await TrustScoreService.recalculateUserScore(userId);

      // TODO: Send notification
      // await NotificationService.sendVouchAcceptedNotification(userId, communityId);
    } catch (error) {
      logger.error('[CommunityVouchOfferController] Error accepting vouch offer', { error });
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }

  /**
   * POST /communities/:id/vouch-offers/:offerId/reject
   * Reject a vouch offer
   */
  async rejectVouchOffer(req: Request, res: Response): Promise<void> {
    try {
      const { offerId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const offer = await prisma.communityVouchOffer.findUnique({
        where: { id: offerId },
      });

      if (!offer) {
        throw new AppError('Vouch offer not found', 404);
      }

      if (offer.userId !== userId) {
        throw new AppError('Not authorized to reject this offer', 403);
      }

      if (offer.status !== VouchOfferStatus.PENDING) {
        throw new AppError(`Offer is already ${offer.status.toLowerCase()}`, 400);
      }

      await prisma.communityVouchOffer.update({
        where: { id: offerId },
        data: {
          status: VouchOfferStatus.REJECTED as any,
          rejectedAt: new Date(),
        },
      });

      res.status(200).json({
        success: true,
        message: 'Vouch offer rejected',
      });
    } catch (error) {
      logger.error('[CommunityVouchOfferController] Error rejecting vouch offer', { error });
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }

  /**
   * GET /admin/vouch-offers
   * Admin endpoint to view all vouch offers with filters
   */
  async getAllVouchOffers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || (userRole !== 'ADMIN' && userRole !== 'MODERATOR')) {
        throw new AppError('Unauthorized - Admin access required', 403);
      }

      const {
        status,
        communityId,
        page = '1',
        limit = '20',
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (communityId) {
        where.communityId = communityId;
      }

      const [offers, total] = await Promise.all([
        prisma.communityVouchOffer.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                trustScore: true,
              },
            },
            community: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limitNum,
        }),
        prisma.communityVouchOffer.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          offers,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      logger.error('[CommunityVouchOfferController] Error getting all vouch offers', { error });
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  }
}

export const communityVouchOfferController = new CommunityVouchOfferController();
