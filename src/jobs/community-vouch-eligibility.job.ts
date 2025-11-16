import logger from '../utils/logger';
import { configService } from '../modules/platform/config.service';
import prisma from '../lib/prisma';

// Define status enum until Prisma regenerates
enum VouchOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

/**
 * Community Vouch Eligibility Job
 * 
 * Automatically identifies community members eligible for automatic vouch offers 
 * using dynamic eligibility criteria from ConfigService.
 * 
 * Runs daily to create vouch offers for eligible members who haven't received one yet.
 * Offers expire after 30 days if not accepted.
 */
export class CommunityVouchEligibilityJob {
  private readonly OFFER_EXPIRY_DAYS = 30;

  /**
   * Main job execution method
   */
  async run(): Promise<void> {
    const startTime = Date.now();
    logger.info('[CommunityVouchEligibilityJob] Starting eligibility check...');

    try {
      // Load dynamic eligibility criteria
      const eligibilityCriteria = await configService.getVouchEligibilityCriteria();
      
      // Get all communities
      const communities = await prisma.community.findMany({
        select: { id: true, name: true },
      });

      let totalOffersCreated = 0;
      let totalMembersChecked = 0;

      for (const community of communities) {
        const { offersCreated, membersChecked } = await this.processCommunity(
          community.id, 
          community.name,
          eligibilityCriteria
        );
        totalOffersCreated += offersCreated;
        totalMembersChecked += membersChecked;
      }

      const duration = Date.now() - startTime;
      logger.info(`[CommunityVouchEligibilityJob] Completed successfully`, {
        duration: `${duration}ms`,
        communitiesProcessed: communities.length,
        totalMembersChecked,
        totalOffersCreated,
      });
    } catch (error) {
      logger.error('[CommunityVouchEligibilityJob] Failed to run job', { error });
      throw error;
    }
  }

  /**
   * Process a single community to identify eligible members
   */
  private async processCommunity(
    communityId: string, 
    communityName: string,
    eligibilityCriteria: any
  ): Promise<{ offersCreated: number; membersChecked: number }> {
    logger.info(`[CommunityVouchEligibilityJob] Processing community: ${communityName} (${communityId})`);

    // Get all active members who haven't already received a pending/accepted offer
    const members = await prisma.communityMember.findMany({
      where: {
        communityId,
        isApproved: true,
        joinedAt: {
          lte: new Date(Date.now() - eligibilityCriteria.minMembershipDays * 24 * 60 * 60 * 1000),
        },
        user: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    let offersCreated = 0;

    for (const member of members) {
      try {
        // Check if member already has a pending or accepted offer
        const existingOffer = await prisma.communityVouchOffer.findFirst({
          where: {
            userId: member.userId,
            communityId,
            status: {
              in: ['PENDING', 'ACCEPTED'],
            },
          },
        });

        if (existingOffer) {
          logger.debug(`[CommunityVouchEligibilityJob] User ${member.userId} already has an offer`, {
            offerId: existingOffer.id,
            status: existingOffer.status,
          });
          continue;
        }

        // Check if member already has a community vouch
        const existingVouch = await prisma.vouch.findFirst({
          where: {
            voucheeId: member.userId,
            communityId,
            isCommunityVouch: true,
            status: {
              in: ['APPROVED', 'ACTIVE'],
            },
          },
        });

        if (existingVouch) {
          logger.debug(`[CommunityVouchEligibilityJob] User ${member.userId} already has a community vouch`);
          continue;
        }

        // Check eligibility
        const eligibility = await this.checkEligibility(
          member.userId, 
          communityId, 
          member.joinedAt,
          eligibilityCriteria
        );

        if (eligibility.isEligible) {
          await this.createVouchOffer(member.userId, communityId, eligibility, eligibilityCriteria);
          offersCreated++;

          logger.info(`[CommunityVouchEligibilityJob] Created vouch offer for ${member.user.fullName}`, {
            userId: member.userId,
            communityId,
            eventsAttended: eligibility.eventsAttended,
            membershipDays: eligibility.membershipDays,
          });
        }
      } catch (error) {
        logger.error(`[CommunityVouchEligibilityJob] Error processing member ${member.userId}`, { error });
        // Continue processing other members
      }
    }

    logger.info(`[CommunityVouchEligibilityJob] Completed community ${communityName}`, {
      membersChecked: members.length,
      offersCreated,
    });

    return { offersCreated, membersChecked: members.length };
  }

  /**
   * Check if a member meets eligibility criteria (uses dynamic config)
   */
  private async checkEligibility(
    userId: string,
    communityId: string,
    joinedAt: Date,
    eligibilityCriteria: any
  ): Promise<{
    isEligible: boolean;
    eventsAttended: number;
    membershipDays: number;
    hasNegativeFeedback: boolean;
    reason: string;
  }> {
    // Calculate membership days
    const membershipDays = Math.floor((Date.now() - joinedAt.getTime()) / (24 * 60 * 60 * 1000));

    // Count events attended in this community
    const eventsAttended = await prisma.eventParticipant.count({
      where: {
        userId,
        events: {
          communityId,
        },
        status: 'CHECKED_IN', // Using CHECKED_IN as proxy for attended
      },
    });

    // Check for negative feedback (trust moments with rating <= 2)
    let hasNegativeFeedback = false;
    if (eligibilityCriteria.requireZeroNegativeFeedback) {
      const negativeFeedbackCount = await prisma.trustMoment.count({
        where: {
          receiverId: userId,
          rating: {
            lte: 2,
          },
        },
      });
      hasNegativeFeedback = negativeFeedbackCount > 0;
    }

    // Determine eligibility
    const meetsEventRequirement = eventsAttended >= eligibilityCriteria.minEventsAttended;
    const meetsMembershipRequirement = membershipDays >= eligibilityCriteria.minMembershipDays;
    const meetsFeedbackRequirement = !hasNegativeFeedback;

    const isEligible = meetsEventRequirement && meetsMembershipRequirement && meetsFeedbackRequirement;

    let reason = '';
    if (isEligible) {
      reason = `${eventsAttended}+ events attended, ${membershipDays}+ days membership, zero negative feedback`;
    } else {
      const failReasons: string[] = [];
      if (!meetsEventRequirement) {
        failReasons.push(`only ${eventsAttended}/${eligibilityCriteria.minEventsAttended} events attended`);
      }
      if (!meetsMembershipRequirement) {
        failReasons.push(`only ${membershipDays}/${eligibilityCriteria.minMembershipDays} days membership`);
      }
      if (!meetsFeedbackRequirement) {
        failReasons.push('has negative feedback');
      }
      reason = `Ineligible: ${failReasons.join(', ')}`;
    }

    return {
      isEligible,
      eventsAttended,
      membershipDays,
      hasNegativeFeedback,
      reason,
    };
  }

  /**
   * Create a vouch offer for an eligible member
   */
  private async createVouchOffer(
    userId: string,
    communityId: string,
    eligibility: {
      eventsAttended: number;
      membershipDays: number;
      hasNegativeFeedback: boolean;
      reason: string;
    },
    eligibilityCriteria: any
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + this.OFFER_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      await prisma.communityVouchOffer.create({
      data: {
        userId,
        communityId,
        eligibilityReason: eligibility.reason,
        status: VouchOfferStatus.PENDING,
        eventsAttended: eligibility.eventsAttended,
        membershipDays: eligibility.membershipDays,
        hasNegativeFeedback: eligibility.hasNegativeFeedback,
        expiresAt,
        offerMetadata: {
          criteria: eligibilityCriteria,
          eligibilityCheckDate: new Date().toISOString(),
          autoGenerated: true,
        } as any,
      },
    });    // TODO: Send notification to user about the vouch offer
    // await NotificationService.sendVouchOfferNotification(userId, communityId);
  }

  /**
   * Expire old pending offers that have passed their expiration date
   */
  async expireOldOffers(): Promise<void> {
    logger.info('[CommunityVouchEligibilityJob] Expiring old offers...');

    try {
      const result = await prisma.communityVouchOffer.updateMany({
        where: {
          status: VouchOfferStatus.PENDING,
          expiresAt: {
            lt: new Date(),
          },
        },
        data: {
          status: VouchOfferStatus.EXPIRED,
        },
      });

      logger.info(`[CommunityVouchEligibilityJob] Expired ${result.count} old offers`);
    } catch (error) {
      logger.error('[CommunityVouchEligibilityJob] Failed to expire old offers', { error });
      throw error;
    }
  }
}

// Main execution function for cron jobs
export async function runCommunityVouchEligibilityJob(): Promise<void> {
  const job = new CommunityVouchEligibilityJob();
  await job.expireOldOffers();
  await job.run();
}

// For manual execution
if (require.main === module) {
  runCommunityVouchEligibilityJob()
    .then(() => {
      logger.info('[CommunityVouchEligibilityJob] Job completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('[CommunityVouchEligibilityJob] Job failed', { error });
      process.exit(1);
    });
}
