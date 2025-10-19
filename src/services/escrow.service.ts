import { PrismaClient, PayoutStatus, TransactionType } from '@prisma/client';
import logger from '../utils/logger';
import { AppError } from '../middleware/error';

const prisma = new PrismaClient();

/**
 * Escrow Service
 * Manages payment holds and releases for buyer/attendee protection
 * Applies to: Marketplace, Events, Services, etc.
 */
export class EscrowService {
  
  /**
   * Calculate hold period based on transaction type and context
   */
  private static calculateHoldPeriod(transactionType: TransactionType, metadata?: any): {
    releaseDate: Date;
    canReleaseAt: Date;
    holdReason: string;
  } {
    const now = new Date();
    let releaseDate: Date;
    let canReleaseAt: Date;
    let holdReason: string;

    switch (transactionType) {
      case TransactionType.MARKETPLACE_ORDER:
        // Hold for 7 days OR until buyer confirms delivery
        releaseDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        canReleaseAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Earliest: 3 days
        holdReason = 'awaiting_delivery';
        break;

      case TransactionType.EVENT_TICKET:
        // Hold until event date + 3 days
        const eventDate = metadata?.eventDate ? new Date(metadata.eventDate) : now;
        releaseDate = new Date(eventDate.getTime() + 3 * 24 * 60 * 60 * 1000);
        canReleaseAt = new Date(eventDate.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day after event
        holdReason = 'awaiting_event_completion';
        break;

      case TransactionType.SERVICE_BOOKING:
        // Hold until service date + 2 days
        const serviceDate = metadata?.serviceDate ? new Date(metadata.serviceDate) : now;
        releaseDate = new Date(serviceDate.getTime() + 2 * 24 * 60 * 60 * 1000);
        canReleaseAt = new Date(serviceDate.getTime() + 1 * 24 * 60 * 60 * 1000);
        holdReason = 'awaiting_service_completion';
        break;

      case TransactionType.SUBSCRIPTION:
        // Hold for 7 days (trial period)
        releaseDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        canReleaseAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        holdReason = 'subscription_trial_period';
        break;

      default:
        // Default: 24 hours hold
        releaseDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        canReleaseAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        holdReason = 'standard_verification_period';
    }

    return { releaseDate, canReleaseAt, holdReason };
  }

  /**
   * Create escrow hold when payment succeeds
   * Called from payment webhook handler
   */
  static async createPayoutHold(input: {
    transactionId: string;
    recipientId: string;
    recipientType: 'event_organizer' | 'marketplace_seller' | 'service_provider' | 'platform';
    amount: number;
    currency?: string;
    transactionType: TransactionType;
    metadata?: any;
    requiresManualReview?: boolean;
  }) {
    try {
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: input.transactionId }
      });

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      // Calculate hold period
      const holdPeriod = this.calculateHoldPeriod(input.transactionType, input.metadata);

      // Create payout distribution with HELD status
      const payout = await prisma.payoutDistribution.create({
        data: {
          paymentTransactionId: input.transactionId,
          recipientId: input.recipientId,
          recipientType: input.recipientType,
          amount: input.amount,
          currency: input.currency || 'MYR',
          status: PayoutStatus.HELD,
          releaseDate: holdPeriod.releaseDate,
          canReleaseAt: holdPeriod.canReleaseAt,
          holdReason: holdPeriod.holdReason,
          autoReleaseEnabled: true,
          requiresManualReview: input.requiresManualReview || false,
          metadata: input.metadata || {}
        }
      });

      logger.info(`[EscrowService] Created payout hold: ${payout.id}`, {
        transactionId: input.transactionId,
        recipientId: input.recipientId,
        amount: input.amount,
        releaseDate: holdPeriod.releaseDate,
        holdReason: holdPeriod.holdReason
      });

      return payout;
    } catch (error) {
      logger.error('[EscrowService] Failed to create payout hold:', error);
      throw error instanceof AppError ? error : new AppError('Failed to create payout hold', 500);
    }
  }

  /**
   * Freeze payout when dispute is opened
   */
  static async freezePayout(payoutId: string, reason: string) {
    try {
      const payout = await prisma.payoutDistribution.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.FROZEN,
          holdReason: reason,
          releaseDate: null, // Clear release date
          autoReleaseEnabled: false,
          requiresManualReview: true,
          notes: `Frozen: ${reason} at ${new Date().toISOString()}`
        }
      });

      logger.info(`[EscrowService] Payout frozen: ${payoutId}`, { reason });

      return payout;
    } catch (error) {
      logger.error('[EscrowService] Failed to freeze payout:', error);
      throw error instanceof AppError ? error : new AppError('Failed to freeze payout', 500);
    }
  }

  /**
   * Unfreeze and schedule release after dispute resolved
   */
  static async unfreezeAndScheduleRelease(
    payoutId: string,
    resolution: 'release_to_seller' | 'refund_to_buyer' | 'partial'
  ) {
    try {
      if (resolution === 'refund_to_buyer') {
        // Cancel payout, initiate refund
        await prisma.payoutDistribution.update({
          where: { id: payoutId },
          data: {
            status: PayoutStatus.CANCELED,
            canceledAt: new Date(),
            notes: 'Dispute resolved: Full refund to buyer'
          }
        });
        return { action: 'refund_required' };
      }

      if (resolution === 'release_to_seller') {
        // Mark as pending for immediate release
        await prisma.payoutDistribution.update({
          where: { id: payoutId },
          data: {
            status: PayoutStatus.PENDING,
            releaseDate: new Date(), // Release immediately
            canReleaseAt: new Date(),
            holdReason: 'dispute_resolved_in_favor_of_seller',
            requiresManualReview: false,
            autoReleaseEnabled: true,
            notes: 'Dispute resolved: Releasing to seller'
          }
        });
        return { action: 'release_scheduled' };
      }

      // Partial refund case would require splitting amounts
      return { action: 'partial_refund_required' };
      
    } catch (error) {
      logger.error('[EscrowService] Failed to unfreeze payout:', error);
      throw error instanceof AppError ? error : new AppError('Failed to unfreeze payout', 500);
    }
  }

  /**
   * Expedite release when buyer confirms delivery/attendance
   */
  static async expediteRelease(payoutId: string, reason: string) {
    try {
      const payout = await prisma.payoutDistribution.findUnique({
        where: { id: payoutId }
      });

      if (!payout) {
        throw new AppError('Payout not found', 404);
      }

      if (payout.status === PayoutStatus.FROZEN) {
        throw new AppError('Cannot expedite frozen payout', 400);
      }

      // Check if we're past canReleaseAt
      const now = new Date();
      if (payout.canReleaseAt && payout.canReleaseAt > now) {
        throw new AppError('Cannot expedite release before minimum hold period', 400);
      }

      // Update to pending for immediate release
      const updated = await prisma.payoutDistribution.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.PENDING,
          releaseDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 day grace period
          holdReason: reason,
          notes: `Expedited: ${reason} at ${now.toISOString()}`
        }
      });

      logger.info(`[EscrowService] Payout expedited: ${payoutId}`, { reason });

      return updated;
    } catch (error) {
      logger.error('[EscrowService] Failed to expedite payout:', error);
      throw error instanceof AppError ? error : new AppError('Failed to expedite release', 500);
    }
  }

  /**
   * Get all payouts ready for release (called by cron job)
   */
  static async getPayoutsReadyForRelease() {
    try {
      const now = new Date();

      const readyPayouts = await prisma.payoutDistribution.findMany({
        where: {
          status: PayoutStatus.PENDING,
          autoReleaseEnabled: true,
          requiresManualReview: false,
          releaseDate: {
            lte: now
          }
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          paymentTransactions: {
            select: {
              id: true,
              transactionType: true,
              referenceType: true,
              referenceId: true
            }
          }
        }
      });

      logger.info(`[EscrowService] Found ${readyPayouts.length} payouts ready for release`);

      return readyPayouts;
    } catch (error) {
      logger.error('[EscrowService] Failed to get ready payouts:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get ready payouts', 500);
    }
  }

  /**
   * Mark payout as processing (called when initiating gateway payout)
   */
  static async markAsProcessing(payoutId: string) {
    try {
      const updated = await prisma.payoutDistribution.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.PROCESSING
        }
      });

      logger.info(`[EscrowService] Payout marked as processing: ${payoutId}`);

      return updated;
    } catch (error) {
      logger.error('[EscrowService] Failed to mark payout as processing:', error);
      throw error instanceof AppError ? error : new AppError('Failed to update payout status', 500);
    }
  }

  /**
   * Mark payout as released (called after successful gateway payout)
   */
  static async markAsReleased(payoutId: string, gatewayPayoutId: string) {
    try {
      const updated = await prisma.payoutDistribution.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.RELEASED,
          releasedAt: new Date(),
          gatewayPayoutId
        }
      });

      logger.info(`[EscrowService] Payout released: ${payoutId}`, { gatewayPayoutId });

      return updated;
    } catch (error) {
      logger.error('[EscrowService] Failed to mark payout as released:', error);
      throw error instanceof AppError ? error : new AppError('Failed to update payout status', 500);
    }
  }

  /**
   * Mark payout as failed
   */
  static async markAsFailed(payoutId: string, failureReason: string) {
    try {
      const updated = await prisma.payoutDistribution.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.FAILED,
          failureReason,
          // Reschedule for retry in 24 hours
          releaseDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      logger.error(`[EscrowService] Payout failed: ${payoutId}`, { failureReason });

      return updated;
    } catch (error) {
      logger.error('[EscrowService] Failed to mark payout as failed:', error);
      throw error instanceof AppError ? error : new AppError('Failed to update payout status', 500);
    }
  }

  /**
   * Get payout status for a transaction
   */
  static async getPayoutForTransaction(transactionId: string) {
    try {
      const payout = await prisma.payoutDistribution.findFirst({
        where: { paymentTransactionId: transactionId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      return payout;
    } catch (error) {
      logger.error('[EscrowService] Failed to get payout for transaction:', error);
      return null;
    }
  }
}
