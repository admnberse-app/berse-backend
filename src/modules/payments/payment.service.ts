import { PrismaClient, PaymentStatus, TransactionType } from '@prisma/client';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';
import { PaymentGatewayFactory } from './gateways/PaymentGatewayFactory';
import { NotificationService } from '../../services/notification.service';
import { ActivityLoggerService } from '../../services/activityLogger.service';
import type {
  CreatePaymentIntentInput,
  ConfirmPaymentInput,
  RefundPaymentInput,
  CapturePaymentInput,
  AddPaymentMethodInput,
  UpdatePaymentMethodInput,
  PaymentTransactionQuery,
  PayoutQuery,
  PaymentIntentResponse,
  PaymentTransactionResponse,
  PaymentMethodResponse,
  PaginatedTransactionsResponse,
  PaginatedPayoutsResponse,
  FeeCalculationInput,
  FeeCalculationResponse,
  WebhookEvent,
  WebhookVerificationResult,
} from './payment.types';

const prisma = new PrismaClient();

export class PaymentService {
  // ============================================================================
  // PAYMENT INTENT & TRANSACTION
  // ============================================================================

  /**
   * Create payment intent
   * - Calculate fees (platform + gateway)
   * - Select payment provider (routing logic)
   * - Create transaction record with PENDING status
   * - Call gateway API to create payment intent
   * - Return client secret for frontend
   */
  async createPaymentIntent(userId: string, input: CreatePaymentIntentInput): Promise<PaymentIntentResponse> {
    try {
      logger.info(`[PaymentService] Creating payment intent for user ${userId}`, { input });

      // 1. Validate user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, fullName: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // 2. Calculate fees
      const currency = input.currency || 'MYR';
      const providerId = input.providerId || (await this.selectProvider(input));
      
      const feeCalculation = await this.calculateFees({
        amount: input.amount,
        transactionType: input.transactionType,
        providerId,
      });

      // 3. Get payment gateway
      const gateway = await PaymentGatewayFactory.getGatewayByProviderId(providerId);

      // 4. Create transaction record
      const transaction = await prisma.paymentTransaction.create({
        data: {
          user: { connect: { id: userId } },
          transactionType: input.transactionType,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          amount: input.amount,
          currency,
          totalFees: feeCalculation.totalFees,
          platformFee: feeCalculation.platformFee,
          gatewayFee: feeCalculation.gatewayFee,
          netAmount: feeCalculation.netAmount,
          provider: { connect: { id: providerId } },
          gatewayTransactionId: '', // Will be updated after gateway call
          status: PaymentStatus.PENDING,
          description: input.description,
          metadata: input.metadata as any,
        },
      });

      logger.info(`[PaymentService] Created transaction record: ${transaction.id}`);

      // 5. Create payment intent through gateway
      const paymentIntent = await gateway.createPaymentIntent({
        amount: input.amount,
        currency,
        customerId: userId,
        description: input.description || `Payment for ${input.referenceType}`,
        metadata: {
          transactionId: transaction.id,
          userId,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          customerEmail: user.email,
          customerName: user.fullName || user.email,
          ...(input.metadata || {}),
        },
      });

      // 6. Update transaction with gateway details
      const updatedTransaction = await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          gatewayTransactionId: paymentIntent.intentId,
          gatewayMetadata: paymentIntent.metadata as any,
        },
      });

      logger.info(`[PaymentService] Payment intent created successfully`, {
        transactionId: transaction.id,
        gatewayTransactionId: paymentIntent.intentId,
        invoiceUrl: paymentIntent.paymentUrl,
      });

      // 7. Send notification to user
      await NotificationService.createNotification({
        userId,
        type: 'PAYMENT',
        title: 'Payment Initiated',
        message: `Your payment of ${currency} ${input.amount} has been initiated. Complete the checkout to proceed.`,
        actionUrl: `/payments/${transaction.id}`,
        priority: 'high',
        relatedEntityId: transaction.id,
        relatedEntityType: 'payment_transaction',
        metadata: {
          transactionId: transaction.id,
          amount: input.amount,
          currency,
        },
      });

      // 8. Return response
      return {
        transactionId: updatedTransaction.id,
        clientSecret: paymentIntent.paymentUrl, // For Xendit, this is the checkout URL
        amount: input.amount,
        currency,
        status: PaymentStatus.PENDING,
        providerId,
        expiresAt: paymentIntent.expiresAt?.toISOString(),
      };
    } catch (error) {
      logger.error('[PaymentService] Failed to create payment intent:', error);
      throw error instanceof AppError ? error : new AppError('Failed to create payment intent', 500);
    }
  }

  /**
   * Confirm payment
   * - Verify transaction exists and belongs to user
   * - Update transaction with gateway details
   * - Mark as PROCESSING or COMPLETED
   * - Trigger payout distribution if applicable
   * - Send confirmation notification
   */
  async confirmPayment(userId: string, input: ConfirmPaymentInput): Promise<PaymentTransactionResponse> {
    try {
      logger.info(`[PaymentService] Confirming payment for user ${userId}`, { input });

      // 1. Verify transaction exists and belongs to user
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: input.transactionId },
        include: { provider: true },
      });

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      if (transaction.userId !== userId) {
        throw new AppError('Unauthorized access to transaction', 403);
      }

      if (transaction.status !== PaymentStatus.PENDING) {
        logger.warn(`[PaymentService] Transaction already processed: ${transaction.id} (status: ${transaction.status})`);
        return this.formatTransactionResponse(transaction);
      }

      // 2. If no gatewayTransactionId provided (mobile WebView flow), return current status
      // Mobile should poll GET /v2/payments/:transactionId instead for webhook-updated status
      if (!input.gatewayTransactionId && !transaction.gatewayTransactionId) {
        logger.info(`[PaymentService] No gatewayTransactionId available, returning current status`);
        return this.formatTransactionResponse(transaction);
      }

      // 3. Get gateway and check payment status
      const gateway = await PaymentGatewayFactory.getGatewayByProviderId(transaction.providerId);
      const paymentStatus = await gateway.confirmPayment(
        input.gatewayTransactionId || transaction.gatewayTransactionId!
      );

      logger.info(`[PaymentService] Gateway payment status:`, paymentStatus);

      // 4. Update transaction based on gateway status
      let newStatus: PaymentStatus;
      if (paymentStatus.status === 'PAID' || paymentStatus.status === 'SETTLED') {
        newStatus = PaymentStatus.SUCCEEDED;
      } else if (paymentStatus.status === 'PENDING') {
        newStatus = PaymentStatus.PROCESSING;
      } else if (paymentStatus.status === 'EXPIRED') {
        newStatus = PaymentStatus.CANCELED;
      } else {
        newStatus = PaymentStatus.FAILED;
      }

      const updatedTransaction = await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          processedAt: newStatus === PaymentStatus.SUCCEEDED ? new Date() : null,
          gatewayMetadata: {
            ...(transaction.gatewayMetadata as any || {}),
            ...input.gatewayMetadata,
            confirmationData: paymentStatus,
          },
        },
        include: { provider: true },
      });

      // 5. Trigger payout distribution if payment completed
      if (newStatus === PaymentStatus.SUCCEEDED) {
        logger.info(`[PaymentService] Payment completed, distributing payouts`);
        await this.distributePayout(transaction.id).catch((error) => {
          logger.error('[PaymentService] Failed to distribute payout:', error);
          // Don't fail the confirmation if payout distribution fails
        });

        // Send success notification
        await NotificationService.createNotification({
          userId: transaction.userId,
          type: 'PAYMENT',
          title: '✅ Payment Successful',
          message: `Your payment of ${transaction.currency} ${transaction.amount} was completed successfully.`,
          actionUrl: `/payments/${transaction.id}`,
          priority: 'high',
          relatedEntityId: transaction.id,
          relatedEntityType: 'payment_transaction',
          metadata: {
            transactionId: transaction.id,
            amount: transaction.amount,
            currency: transaction.currency,
            status: 'SUCCEEDED',
          },
        });
      } else if (newStatus === PaymentStatus.FAILED) {
        // Send failure notification
        await NotificationService.createNotification({
          userId: transaction.userId,
          type: 'PAYMENT',
          title: '❌ Payment Failed',
          message: `Your payment of ${transaction.currency} ${transaction.amount} could not be processed. Please try again.`,
          actionUrl: `/payments/${transaction.id}`,
          priority: 'high',
          relatedEntityId: transaction.id,
          relatedEntityType: 'payment_transaction',
          metadata: {
            transactionId: transaction.id,
            amount: transaction.amount,
            currency: transaction.currency,
            status: 'FAILED',
          },
        });
      }

      logger.info(`[PaymentService] Payment confirmed successfully`, {
        transactionId: transaction.id,
        status: newStatus,
      });

      return this.formatTransactionResponse(updatedTransaction);
    } catch (error) {
      logger.error('[PaymentService] Failed to confirm payment:', error);
      throw error instanceof AppError ? error : new AppError('Failed to confirm payment', 500);
    }
  }

  /**
   * Capture payment (for authorized transactions)
   * - Verify transaction is AUTHORIZED
   * - Call gateway capture API
   * - Update transaction status to COMPLETED
   * - Process payout distribution
   * - Log activity
   */
  async capturePayment(userId: string, transactionId: string, amount?: number): Promise<PaymentTransactionResponse> {
    try {
      logger.info(`[PaymentService] Capturing payment for user ${userId}`, { transactionId, amount });

      // Note: Xendit invoices are auto-captured upon payment
      // This method is primarily for future gateway support (e.g., Stripe authorization flows)
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: transactionId },
        include: { provider: true },
      });

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      if (transaction.userId !== userId) {
        throw new AppError('Unauthorized access to transaction', 403);
      }

      // For Xendit, just verify the payment is completed
      const gateway = await PaymentGatewayFactory.getGatewayByProviderId(transaction.providerId);
      const paymentStatus = await gateway.confirmPayment(transaction.gatewayTransactionId!);

      if (paymentStatus.status === 'PAID' || paymentStatus.status === 'SETTLED') {
        const updatedTransaction = await prisma.paymentTransaction.update({
          where: { id: transactionId },
          data: {
            status: PaymentStatus.SUCCEEDED,
            processedAt: new Date(),
          },
          include: { provider: true },
        });

        // Trigger payout distribution
        await this.distributePayout(transactionId).catch((error) => {
          logger.error('[PaymentService] Failed to distribute payout:', error);
        });

        // Send capture notification
        await NotificationService.createNotification({
          userId: transaction.userId,
          type: 'PAYMENT',
          title: '✅ Payment Captured',
          message: `Your payment of ${transaction.currency} ${amount || transaction.amount} has been successfully captured.`,
          actionUrl: `/payments/${transactionId}`,
          priority: 'normal',
          relatedEntityId: transactionId,
          relatedEntityType: 'payment_transaction',
          metadata: {
            transactionId,
            capturedAmount: amount || transaction.amount,
          },
        });

        return this.formatTransactionResponse(updatedTransaction);
      }

      throw new AppError('Payment not yet completed', 400);
    } catch (error) {
      logger.error('[PaymentService] Failed to capture payment:', error);
      throw error instanceof AppError ? error : new AppError('Failed to capture payment', 500);
    }
  }

  /**
   * Refund payment
   * - Verify transaction is refundable (COMPLETED status)
   * - Check refund amount doesn't exceed original
   * - Call gateway refund API
   * - Update transaction refund fields
   * - Reverse payout distributions if applicable
   * - Send refund notification
   */
  async refundPayment(userId: string, input: RefundPaymentInput): Promise<PaymentTransactionResponse> {
    try {
      logger.info(`[PaymentService] Refunding payment for user ${userId}`, { input });

      const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: input.transactionId },
        include: { provider: true },
      });

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      if (transaction.userId !== userId) {
        throw new AppError('Unauthorized access to transaction', 403);
      }

      if (transaction.status !== PaymentStatus.SUCCEEDED) {
        throw new AppError('Transaction is not refundable', 400);
      }

      const refundAmount = input.amount || transaction.amount;
      const alreadyRefunded = transaction.refundedAmount || 0;

      if (refundAmount + alreadyRefunded > transaction.amount) {
        throw new AppError('Refund amount exceeds transaction amount', 400);
      }

      // Call gateway refund API
      const gateway = await PaymentGatewayFactory.getGatewayByProviderId(transaction.providerId);
      await gateway.refundPayment({
        transactionId: transaction.gatewayTransactionId!,
        amount: refundAmount,
        reason: input.reason,
      });

      // Update transaction
      const newRefundedAmount = alreadyRefunded + refundAmount;
      const newStatus = newRefundedAmount >= transaction.amount 
        ? PaymentStatus.REFUNDED 
        : PaymentStatus.PARTIALLY_REFUNDED;

      const updatedTransaction = await prisma.paymentTransaction.update({
        where: { id: input.transactionId },
        data: {
          status: newStatus,
          refundedAmount: newRefundedAmount,
          refundedAt: new Date(),
          refundReason: input.reason,
        },
        include: { provider: true },
      });

      logger.info(`[PaymentService] Payment refunded successfully`, {
        transactionId: input.transactionId,
        refundAmount,
        newStatus,
      });

      // Send refund notification
      await NotificationService.createNotification({
        userId: transaction.userId,
        type: 'PAYMENT',
        title: '💰 Refund Processed',
        message: `A refund of ${transaction.currency} ${refundAmount} has been issued. ${input.reason || ''}`,
        actionUrl: `/payments/${input.transactionId}`,
        priority: 'high',
        relatedEntityId: input.transactionId,
        relatedEntityType: 'payment_refund',
        metadata: {
          transactionId: input.transactionId,
          refundedAmount: refundAmount,
          reason: input.reason,
          status: newStatus,
        },
      });

      return this.formatTransactionResponse(updatedTransaction);
    } catch (error) {
      logger.error('[PaymentService] Failed to refund payment:', error);
      throw error instanceof AppError ? error : new AppError('Failed to refund payment', 500);
    }
  }

  /**
   * Get transaction by ID
   * - Fetch transaction with provider details
   * - Check user permission (owner or admin)
   * - Include related data (payouts, fees)
   */
  async getTransaction(transactionId: string, userId?: string): Promise<PaymentTransactionResponse> {
    try {
      logger.info(`[PaymentService] Getting transaction ${transactionId}`);

      const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: transactionId },
        include: { provider: true },
      });

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      // Check permission
      if (userId && transaction.userId !== userId) {
        throw new AppError('Unauthorized access to transaction', 403);
      }

      return this.formatTransactionResponse(transaction);
    } catch (error) {
      logger.error('[PaymentService] Failed to get transaction:', error);
      throw error instanceof AppError ? error : new AppError('Failed to retrieve transaction', 500);
    }
  }

  /**
   * Get user's transactions
   * - Filter by status, type, date range, amount
   * - Include pagination
   * - Calculate summary statistics
   * - Sort by date (newest first)
   */
  async getUserTransactions(userId: string, query: PaymentTransactionQuery): Promise<PaginatedTransactionsResponse> {
    try {
      logger.info(`[PaymentService] Getting transactions for user ${userId}`, { query });

      const page = query.page || 1;
      const limit = Math.min(query.limit || 20, 100); // Max 100 items per page
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { userId };

      if (query.status) {
        where.status = query.status;
      }

      if (query.transactionType) {
        where.transactionType = query.transactionType;
      }

      if (query.providerId) {
        where.providerId = query.providerId;
      }

      if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) {
          where.createdAt.gte = query.startDate;
        }
        if (query.endDate) {
          where.createdAt.lte = query.endDate;
        }
      }

      if (query.minAmount !== undefined || query.maxAmount !== undefined) {
        where.amount = {};
        if (query.minAmount !== undefined) {
          where.amount.gte = query.minAmount;
        }
        if (query.maxAmount !== undefined) {
          where.amount.lte = query.maxAmount;
        }
      }

      // Execute queries in parallel
      const [transactions, totalCount, summary] = await Promise.all([
        // Get paginated transactions
        prisma.paymentTransaction.findMany({
          where,
          include: { provider: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),

        // Get total count
        prisma.paymentTransaction.count({ where }),

        // Calculate summary statistics
        prisma.paymentTransaction.aggregate({
          where,
          _sum: {
            amount: true,
            platformFee: true,
            gatewayFee: true,
            refundedAmount: true,
          },
          _count: {
            _all: true,
          },
        }),
      ]);

      // Count by status
      const statusCounts = await prisma.paymentTransaction.groupBy({
        by: ['status'],
        where,
        _count: true,
      });

      const successCount = statusCounts.find((s) => s.status === PaymentStatus.SUCCEEDED)?._count || 0;
      const pendingCount = statusCounts.find((s) => s.status === PaymentStatus.PENDING)?._count || 0;
      const failedCount = statusCounts.find((s) => s.status === PaymentStatus.FAILED)?._count || 0;

      logger.info(`[PaymentService] Found ${totalCount} transactions for user ${userId}`);

      return {
        transactions: transactions.map((t) => this.formatTransactionResponse(t)),
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        summary: {
          totalAmount: summary._sum.amount || 0,
          totalFees: (summary._sum.platformFee || 0) + (summary._sum.gatewayFee || 0),
          totalRefunded: summary._sum.refundedAmount || 0,
          successCount,
          pendingCount,
          failedCount,
        },
      };
    } catch (error) {
      logger.error('[PaymentService] Failed to get user transactions:', error);
      throw error instanceof AppError ? error : new AppError('Failed to retrieve transactions', 500);
    }
  }

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  /**
   * Add payment method
   * - Validate with gateway
   * - Store tokenized method
   * - Set as default if first method
   * - Return sanitized method info
   */
  async addPaymentMethod(userId: string, input: AddPaymentMethodInput): Promise<PaymentMethodResponse> {
    try {
      logger.info(`[PaymentService] Adding payment method for user ${userId}`);

      // Check if this is the user's first payment method
      const existingMethods = await prisma.userPaymentMethod.count({
        where: { userId },
      });

      const isDefault = existingMethods === 0 || input.isDefault;

      // If setting as default, unset other defaults
      if (isDefault) {
        await prisma.userPaymentMethod.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const method = await prisma.userPaymentMethod.create({
        data: {
          users: { connect: { id: userId } },
          provider: input.provider,
          type: input.type,
          gatewayMethodId: input.gatewayMethodId,
          lastFour: input.lastFour,
          expiresAt: input.expiryMonth && input.expiryYear 
            ? new Date(input.expiryYear, input.expiryMonth - 1) 
            : undefined,
          isDefault,
        },
      });

      // Send notification
      await NotificationService.createNotification({
        userId,
        type: 'PAYMENT',
        title: '💳 Payment Method Added',
        message: `A new ${input.type} ending in ${input.lastFour} has been added to your account.`,
        actionUrl: '/settings/payment-methods',
        priority: 'normal',
        metadata: {
          methodId: method.id,
          type: input.type,
          lastFour: input.lastFour,
        },
      });

      return this.formatPaymentMethodResponse(method);
    } catch (error) {
      logger.error('[PaymentService] Failed to add payment method:', error);
      throw error instanceof AppError ? error : new AppError('Failed to add payment method', 500);
    }
  }

  /**
   * Update payment method
   * - Check ownership
   * - Update default status (unset others if setting as default)
   * - Return updated method
   */
  async updatePaymentMethod(userId: string, input: UpdatePaymentMethodInput): Promise<PaymentMethodResponse> {
    try {
      logger.info(`[PaymentService] Updating payment method ${input.paymentMethodId}`);

      const method = await prisma.userPaymentMethod.findUnique({
        where: { id: input.paymentMethodId },
      });

      if (!method) {
        throw new AppError('Payment method not found', 404);
      }

      if (method.userId !== userId) {
        throw new AppError('Unauthorized access to payment method', 403);
      }

      // If setting as default, unset other defaults
      if (input.isDefault) {
        await prisma.userPaymentMethod.updateMany({
          where: { userId, id: { not: input.paymentMethodId } },
          data: { isDefault: false },
        });
      }

      const updatedMethod = await prisma.userPaymentMethod.update({
        where: { id: input.paymentMethodId },
        data: { isDefault: input.isDefault },
      });

      return this.formatPaymentMethodResponse(updatedMethod);
    } catch (error) {
      logger.error('[PaymentService] Failed to update payment method:', error);
      throw error instanceof AppError ? error : new AppError('Failed to update payment method', 500);
    }
  }

  /**
   * Delete payment method
   * - Check ownership
   * - Prevent deletion if only method with active subscriptions
   * - Delete from gateway
   * - Delete from database
   */
  async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      logger.info(`[PaymentService] Deleting payment method ${paymentMethodId}`);

      const method = await prisma.userPaymentMethod.findUnique({
        where: { id: paymentMethodId },
      });

      if (!method) {
        throw new AppError('Payment method not found', 404);
      }

      if (method.userId !== userId) {
        throw new AppError('Unauthorized access to payment method', 403);
      }

      await prisma.userPaymentMethod.delete({
        where: { id: paymentMethodId },
      });

      logger.info(`[PaymentService] Payment method deleted successfully`);
    } catch (error) {
      logger.error('[PaymentService] Failed to delete payment method:', error);
      throw error instanceof AppError ? error : new AppError('Failed to delete payment method', 500);
    }
  }

  /**
   * Get user's payment methods
   * - Fetch all methods for user
   * - Return sanitized data (no sensitive info)
   * - Sort by default first, then by creation date
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethodResponse[]> {
    try {
      logger.info(`[PaymentService] Getting payment methods for user ${userId}`);

      const methods = await prisma.userPaymentMethod.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return methods.map((method) => this.formatPaymentMethodResponse(method));
    } catch (error) {
      logger.error('[PaymentService] Failed to get payment methods:', error);
      throw error instanceof AppError ? error : new AppError('Failed to retrieve payment methods', 500);
    }
  }

  // ============================================================================
  // PAYOUTS
  // ============================================================================

  /**
   * Get user's payouts
   * - Filter by status, date range
   * - Include pagination
   * - Calculate summary (pending, completed amounts)
   * - Include related transaction info
   */
  async getUserPayouts(userId: string, query: PayoutQuery): Promise<PaginatedPayoutsResponse> {
    try {
      logger.info(`[PaymentService] Getting payouts for user ${userId}`, { query });

      const page = query.page || 1;
      const limit = Math.min(query.limit || 20, 100);
      const skip = (page - 1) * limit;

      const where: any = { recipientId: userId };

      if (query.status) {
        where.status = query.status;
      }

      if (query.recipientType) {
        where.recipientType = query.recipientType;
      }

      if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) {
          where.createdAt.gte = query.startDate;
        }
        if (query.endDate) {
          where.createdAt.lte = query.endDate;
        }
      }

      const [payouts, totalCount, summary] = await Promise.all([
        prisma.payoutDistribution.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.payoutDistribution.count({ where }),
        prisma.payoutDistribution.aggregate({
          where,
          _sum: { amount: true },
        }),
      ]);

      const pendingAmount = await prisma.payoutDistribution.aggregate({
        where: { ...where, status: 'PENDING' },
        _sum: { amount: true },
      });

      const releasedAmount = await prisma.payoutDistribution.aggregate({
        where: { ...where, status: 'RELEASED' },
        _sum: { amount: true },
      });

      return {
        payouts: payouts.map((p) => ({
          id: p.id,
          paymentTransactionId: p.paymentTransactionId,
          recipientId: p.recipientId,
          recipientType: p.recipientType,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          releaseDate: p.releaseDate?.toISOString(),
          gatewayPayoutId: p.gatewayPayoutId,
          createdAt: p.createdAt.toISOString(),
          releasedAt: p.releasedAt?.toISOString(),
        })),
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        summary: {
          totalAmount: summary._sum.amount || 0,
          pendingAmount: pendingAmount._sum.amount || 0,
          completedAmount: releasedAmount._sum.amount || 0,
        },
      };
    } catch (error) {
      logger.error('[PaymentService] Failed to get user payouts:', error);
      throw error instanceof AppError ? error : new AppError('Failed to retrieve payouts', 500);
    }
  }

  /**
   * Process pending payouts (background job)
   * - Find payouts with release date <= now
   * - Check minimum payout threshold
   * - Call gateway payout API
   * - Update status to COMPLETED
   * - Send payout notification
   */
  async processPendingPayouts(): Promise<void> {
    try {
      logger.info('[PaymentService] Processing pending payouts');

      const pendingPayouts = await prisma.payoutDistribution.findMany({
        where: {
          status: 'PENDING',
          releaseDate: { lte: new Date() },
        },
        take: 100, // Process in batches
      });

      logger.info(`[PaymentService] Found ${pendingPayouts.length} pending payouts`);

      for (const payout of pendingPayouts) {
        try {
          // Mark as processing
          await prisma.payoutDistribution.update({
            where: { id: payout.id },
            data: { status: 'PROCESSING' },
          });

          // In a real implementation, call gateway payout API here
          // For now, just mark as released
          await prisma.payoutDistribution.update({
            where: { id: payout.id },
            data: {
              status: 'RELEASED',
              releasedAt: new Date(),
            },
          });

          logger.info(`[PaymentService] Payout processed: ${payout.id}`);
        } catch (error) {
          logger.error(`[PaymentService] Failed to process payout ${payout.id}:`, error);
          // Mark as failed
          await prisma.payoutDistribution.update({
            where: { id: payout.id },
            data: { status: 'FAILED' },
          });
        }
      }

      logger.info('[PaymentService] Finished processing pending payouts');
    } catch (error) {
      logger.error('[PaymentService] Failed to process pending payouts:', error);
      throw error instanceof AppError ? error : new AppError('Failed to process pending payouts', 500);
    }
  }

  // ============================================================================
  // FEE CALCULATION
  // ============================================================================

  /**
   * Calculate transaction fees
   * - Get platform fee config for transaction type
   * - Get gateway fee from provider
   * - Calculate platform fee (percentage + fixed)
   * - Calculate gateway fee (percentage + fixed)
   * - Return breakdown
   */
  async calculateFees(input: FeeCalculationInput): Promise<FeeCalculationResponse> {
    try {
      logger.info('[PaymentService] Calculating fees', { input });

      // 1. Get platform fee configuration
      const platformFeeConfig = await prisma.platformFeeConfig.findFirst({
        where: {
          transactionType: input.transactionType,
          isActive: true,
          effectiveFrom: { lte: new Date() },
          OR: [
            { effectiveUntil: null },
            { effectiveUntil: { gte: new Date() } },
          ],
        },
        orderBy: { priority: 'asc' },
      });

      let platformFee = 0;
      let platformFeePercentage = 0;
      let platformFeeFixed = 0;

      if (platformFeeConfig) {
        if (platformFeeConfig.feePercentage) {
          const percentageFee = (input.amount * platformFeeConfig.feePercentage) / 100;
          platformFee += percentageFee;
          platformFeePercentage = platformFeeConfig.feePercentage;
        }

        if (platformFeeConfig.feeFixed) {
          platformFee += platformFeeConfig.feeFixed;
          platformFeeFixed = platformFeeConfig.feeFixed;
        }

        // Apply min/max fee constraints
        if (platformFeeConfig.minFee && platformFee < platformFeeConfig.minFee) {
          platformFee = platformFeeConfig.minFee;
        }
        if (platformFeeConfig.maxFee && platformFee > platformFeeConfig.maxFee) {
          platformFee = platformFeeConfig.maxFee;
        }
      }

      // 2. Get gateway fees
      const providerId = input.providerId || (await this.selectProvider({ transactionType: input.transactionType, amount: input.amount } as any));
      const gateway = await PaymentGatewayFactory.getGatewayByProviderId(providerId);
      const gatewayFees = await gateway.calculateFees(input.amount, 'MYR'); // TODO: Use proper currency

      // 3. Calculate totals
      const totalFees = platformFee + gatewayFees.gatewayFee;
      const netAmount = input.amount - totalFees;

      logger.info('[PaymentService] Fees calculated', {
        amount: input.amount,
        platformFee,
        gatewayFee: gatewayFees.gatewayFee,
        totalFees,
        netAmount,
      });

      return {
        platformFee,
        gatewayFee: gatewayFees.gatewayFee,
        totalFees,
        netAmount,
        feeBreakdown: {
          platformFeePercentage,
          platformFeeFixed,
          gatewayFeePercentage: 2.9, // From Xendit: 2.9%
          gatewayFeeFixed: 1.50, // From Xendit: MYR 1.50
        },
      };
    } catch (error) {
      logger.error('[PaymentService] Failed to calculate fees:', error);
      throw error instanceof AppError ? error : new AppError('Failed to calculate fees', 500);
    }
  }

  // ============================================================================
  // WEBHOOKS
  // ============================================================================

  /**
   * Verify webhook signature
   * - Get provider webhook secret
   * - Verify signature based on provider
   * - Return verification result
   */
  async verifyWebhook(event: WebhookEvent): Promise<WebhookVerificationResult> {
    try {
      logger.info(`[PaymentService] Verifying webhook from ${event.provider}`);

      // Get provider
      const provider = await prisma.paymentProvider.findFirst({
        where: { providerCode: event.provider.toLowerCase() },
      });

      if (!provider) {
        throw new AppError(`Provider not found: ${event.provider}`, 404);
      }

      // Get gateway
      const gateway = await PaymentGatewayFactory.getGatewayByProviderId(provider.id);

      // Verify signature
      const isValid = await gateway.verifyWebhookSignature({
        signature: event.signature || '',
        payload: JSON.stringify(event.data),
      });

      return {
        isValid,
        provider: event.provider,
        eventType: event.eventType,
        data: event.data,
      };
    } catch (error) {
      logger.error('[PaymentService] Failed to verify webhook:', error);
      throw error instanceof AppError ? error : new AppError('Failed to verify webhook', 500);
    }
  }

  /**
   * Handle webhook event
   * - Verify webhook signature
   * - Parse event type
   * - Update transaction status
   * - Trigger appropriate actions (notifications, payouts, etc.)
   * - Log event
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    try {
      logger.info(`[PaymentService] Handling webhook`, { provider: event.provider, eventType: event.eventType });

      // Verify webhook
      const verification = await this.verifyWebhook(event);
      if (!verification.isValid) {
        throw new AppError('Invalid webhook signature', 401);
      }

      // Get gateway
      const provider = await prisma.paymentProvider.findFirst({
        where: { providerCode: event.provider.toLowerCase() },
      });

      if (!provider) {
        throw new AppError(`Provider not found: ${event.provider}`, 404);
      }

      const gateway = await PaymentGatewayFactory.getGatewayByProviderId(provider.id);
      const parsedEvent = await gateway.parseWebhookEvent(event.data);

      // Handle different event types
      if (parsedEvent.eventType.includes('payment') || parsedEvent.eventType.includes('invoice')) {
        await this.handlePaymentWebhook(parsedEvent);
      } else if (parsedEvent.eventType.includes('payout')) {
        await this.handlePayoutWebhook(parsedEvent);
      }

      logger.info(`[PaymentService] Webhook handled successfully`);
    } catch (error) {
      logger.error('[PaymentService] Failed to handle webhook:', error);
      throw error instanceof AppError ? error : new AppError('Failed to handle webhook', 500);
    }
  }

  /**
   * Handle payment-related webhook events
   */
  private async handlePaymentWebhook(event: any): Promise<void> {
    try {
      const invoiceId = event.data.id || event.data.invoice_id;
      if (!invoiceId) return;

      // Find transaction by gateway ID
      const transaction = await prisma.paymentTransaction.findFirst({
        where: { gatewayTransactionId: invoiceId },
      });

      if (!transaction) {
        logger.warn(`[PaymentService] Transaction not found for invoice: ${invoiceId}`);
        return;
      }

      // Update status based on event
      let newStatus: PaymentStatus | undefined;
      if (event.eventType.includes('paid') || event.eventType.includes('success')) {
        newStatus = PaymentStatus.SUCCEEDED;
      } else if (event.eventType.includes('failed')) {
        newStatus = PaymentStatus.FAILED;
      } else if (event.eventType.includes('expired')) {
        newStatus = PaymentStatus.CANCELED;
      }

      if (newStatus) {
        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: newStatus,
            processedAt: newStatus === PaymentStatus.SUCCEEDED ? new Date() : undefined,
          },
        });

        // Update marketplace order if payment succeeded
        if (newStatus === PaymentStatus.SUCCEEDED && transaction.referenceType === 'MARKETPLACE_ORDER') {
          const updatedOrder = await prisma.marketplaceOrder.update({
            where: { id: transaction.referenceId },
            data: {
              paymentStatus: PaymentStatus.SUCCEEDED,
              status: 'CONFIRMED' as any,
              confirmedAt: new Date(),
            },
            include: {
              marketplaceListings: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                  userId: true,
                }
              },
              users_marketplace_orders_buyerIdTousers: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  username: true,
                }
              },
              users_marketplace_orders_sellerIdTousers: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  username: true,
                }
              }
            }
          }).catch((error) => {
            logger.error('[PaymentService] Failed to update marketplace order:', error);
            throw error;
          });

          // Log activity and send emails after payment success
          if (updatedOrder) {
            const { storageService } = require('../services/storage.service');
            const { emailService } = require('../services/email.service');

            // Log marketplace payment success
            await ActivityLoggerService.logMarketplacePaymentSuccess(
              updatedOrder.buyerId,
              updatedOrder.id,
              transaction.id,
              updatedOrder.totalAmount
            ).catch((error) => {
              logger.error('[PaymentService] Failed to log marketplace payment:', error);
            });

            // Send order receipt to buyer
            try {
              const imageUrls = updatedOrder.marketplaceListings.images.map((key: string) =>
                key.startsWith('http') ? key : storageService.getPublicUrl(key)
              );

              await emailService.sendMarketplaceOrderReceipt({
                to: updatedOrder.users_marketplace_orders_buyerIdTousers.email,
                buyerName: updatedOrder.users_marketplace_orders_buyerIdTousers.fullName,
                orderId: updatedOrder.id,
                orderDate: updatedOrder.createdAt,
                sellerName: updatedOrder.users_marketplace_orders_sellerIdTousers.fullName,
                items: [{
                  title: updatedOrder.marketplaceListings.title,
                  quantity: updatedOrder.quantity,
                  price: updatedOrder.unitPrice,
                  currency: updatedOrder.currency,
                  subtotal: updatedOrder.subtotal,
                  imageUrl: imageUrls[0] || undefined,
                }],
                subtotal: updatedOrder.subtotal,
                platformFee: updatedOrder.platformFee,
                totalAmount: updatedOrder.totalAmount,
                currency: updatedOrder.currency,
                shippingAddress: updatedOrder.shippingAddress,
                paymentMethod: 'Card', // TODO: Get actual payment method from provider
                transactionId: transaction.id,
                paidAt: new Date(),
              });
            } catch (error) {
              logger.error('[PaymentService] Failed to send order receipt:', error);
            }

            // Send new order notification to seller
            try {
              await emailService.sendNewOrderNotificationToSeller({
                to: updatedOrder.users_marketplace_orders_sellerIdTousers.email,
                sellerName: updatedOrder.users_marketplace_orders_sellerIdTousers.fullName,
                buyerName: updatedOrder.users_marketplace_orders_buyerIdTousers.fullName,
                orderId: updatedOrder.id,
                itemTitle: updatedOrder.marketplaceListings.title,
                quantity: updatedOrder.quantity,
                totalAmount: updatedOrder.totalAmount,
                currency: updatedOrder.currency,
                orderUrl: `${process.env.APP_URL || 'https://berse.app'}/marketplace/orders/${updatedOrder.id}`,
              });
            } catch (error) {
              logger.error('[PaymentService] Failed to send seller notification:', error);
            }
          }
        }

        // Update event ticket if payment succeeded
        if (newStatus === PaymentStatus.SUCCEEDED && transaction.referenceType === 'EVENT_TICKET') {
          try {
            const updatedTicket = await prisma.eventTicket.update({
              where: { id: transaction.referenceId },
              data: {
                paymentStatus: PaymentStatus.SUCCEEDED,
                status: 'CONFIRMED' as any,
              },
              include: {
                tier: {
                  select: {
                    tierName: true,
                  }
                },
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  }
                },
                participant: {
                  select: {
                    id: true,
                    qrCode: true,
                  }
                }
              }
            });

            // Update participant status to CONFIRMED
            if (updatedTicket.participantId) {
              await prisma.eventParticipant.update({
                where: { id: updatedTicket.participantId },
                data: { status: 'CONFIRMED' as any },
              });
            }

            // Log activity and send emails after payment success
            if (updatedTicket) {
              const { storageService } = require('../services/storage.service');
              const { emailService } = require('../services/email.service');
              const QRCode = require('qrcode');

              // Fetch event details separately since include doesn't work with events relation
              const eventDetails = await prisma.event.findUnique({
                where: { id: updatedTicket.eventId },
                select: {
                  id: true,
                  title: true,
                  date: true,
                  location: true,
                  images: true,
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                    }
                  }
                }
              });

              if (!eventDetails) {
                logger.error('[PaymentService] Event not found for ticket');
                return;
              }

              // Log event ticket purchase
              await ActivityLoggerService.logEventTicketPurchase(
                updatedTicket.userId,
                updatedTicket.eventId,
                updatedTicket.id,
                1,
                updatedTicket.price
              ).catch((error) => {
                logger.error('[PaymentService] Failed to log event ticket purchase:', error);
              });

              // Generate QR code URL
              const qrToken = updatedTicket.participant?.qrCode || updatedTicket.ticketNumber;
              const checkInUrl = `${process.env.APP_URL || 'https://berse.app'}/events/${updatedTicket.eventId}/check-in/${qrToken}`;
              let qrCodeDataUrl = '';
              
              try {
                qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
                  width: 300,
                  margin: 2,
                  color: {
                    dark: '#00B14F',
                    light: '#FFFFFF'
                  }
                });
              } catch (qrError) {
                logger.error('[PaymentService] Failed to generate QR code:', qrError);
                qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInUrl)}`;
              }

              // Get event image URL
              const eventImageUrl = eventDetails.images && eventDetails.images.length > 0
                ? (eventDetails.images[0].startsWith('http') 
                    ? eventDetails.images[0] 
                    : storageService.getPublicUrl(eventDetails.images[0]))
                : undefined;

              // Send ticket receipt to attendee
              try {
                await emailService.sendEventTicketReceipt(
                  updatedTicket.user.email,
                  {
                    attendeeName: updatedTicket.attendeeName || updatedTicket.user.fullName,
                    eventTitle: eventDetails.title,
                    eventDate: eventDetails.date.toISOString(),
                    eventTime: '00:00', // Default time since startTime doesn't exist
                    eventLocation: eventDetails.location,
                    eventImage: eventImageUrl,
                    ticketTier: updatedTicket.tier?.tierName,
                    ticketId: updatedTicket.id,
                    quantity: 1,
                    price: updatedTicket.price,
                    platformFee: transaction.platformFee || 0,
                    totalAmount: transaction.amount,
                    currency: updatedTicket.currency,
                    qrCodeUrl: qrCodeDataUrl,
                    checkInCode: updatedTicket.ticketNumber,
                    hostName: eventDetails.user?.fullName || 'Event Host',
                    eventId: updatedTicket.eventId,
                    eventMapLink: `https://maps.google.com/?q=${encodeURIComponent(eventDetails.location)}`,
                  }
                );
              } catch (error) {
                logger.error('[PaymentService] Failed to send event ticket receipt:', error);
              }
            }
          } catch (error) {
            logger.error('[PaymentService] Failed to update event ticket:', error);
          }
        }

        // Trigger payout if payment succeeded
        if (newStatus === PaymentStatus.SUCCEEDED) {
          await this.distributePayout(transaction.id).catch((error) => {
            logger.error('[PaymentService] Failed to distribute payout from webhook:', error);
          });
        }
      }
    } catch (error) {
      logger.error('[PaymentService] Failed to handle payment webhook:', error);
    }
  }

  /**
   * Handle payout-related webhook events
   */
  private async handlePayoutWebhook(event: any): Promise<void> {
    try {
      logger.info(`[PaymentService] Handling payout webhook`, { event });
      // Implement payout webhook handling as needed
    } catch (error) {
      logger.error('[PaymentService] Failed to handle payout webhook:', error);
    }
  }

  // ============================================================================
  // PROVIDER MANAGEMENT
  // ============================================================================

  /**
   * Select payment provider
   * - Check provider availability
   * - Apply routing rules (currency, amount, region)
   * - Return optimal provider
   */
  private async selectProvider(input: CreatePaymentIntentInput): Promise<string> {
    try {
      logger.info('[PaymentService] Selecting payment provider', { input });

      // Use routing logic from factory
      const gateway = await PaymentGatewayFactory.getGatewayByRouting({
        amount: input.amount,
        currency: input.currency || 'MYR',
      });

      // Get provider ID from gateway (need to query database)
      const provider = await prisma.paymentProvider.findFirst({
        where: {
          isActive: true,
          isDefault: true, // For now, just return default provider
        },
      });

      if (!provider) {
        throw new AppError('No active payment provider available', 500);
      }

      logger.info(`[PaymentService] Selected provider: ${provider.providerName}`);
      return provider.id;
    } catch (error) {
      logger.error('[PaymentService] Failed to select provider:', error);
      throw error instanceof AppError ? error : new AppError('Failed to select payment provider', 500);
    }
  }

  /**
   * Get provider configuration
   * - Get provider details
   * - Decrypt credentials
   * - Return configuration object
   */
  private async getProviderConfig(providerId: string): Promise<any> {
    try {
      const provider = await prisma.paymentProvider.findUnique({
        where: { id: providerId },
      });

      if (!provider) {
        throw new AppError('Provider not found', 404);
      }

      return provider.configuration;
    } catch (error) {
      logger.error('[PaymentService] Failed to get provider config:', error);
      throw error instanceof AppError ? error : new AppError('Failed to get provider configuration', 500);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Format transaction response
   * - Map database fields to response type
   * - Include provider name
   * - Format dates
   */
  private formatTransactionResponse(transaction: any): PaymentTransactionResponse {
    return {
      id: transaction.id,
      userId: transaction.userId,
      transactionType: transaction.transactionType,
      referenceType: transaction.referenceType,
      referenceId: transaction.referenceId,
      amount: transaction.amount,
      currency: transaction.currency,
      platformFee: transaction.platformFee,
      gatewayFee: transaction.gatewayFee,
      totalFees: transaction.platformFee + transaction.gatewayFee,
      netAmount: transaction.netAmount,
      providerId: transaction.providerId,
      providerName: transaction.provider?.providerName,
      gatewayTransactionId: transaction.gatewayTransactionId || '',
      status: transaction.status,
      failureReason: transaction.failureReason,
      description: transaction.description,
      metadata: transaction.metadata as any,
      createdAt: transaction.createdAt.toISOString(),
      processedAt: transaction.processedAt?.toISOString(),
      refundedAmount: transaction.refundedAmount,
      refundedAt: transaction.refundedAt?.toISOString(),
    };
  }

  /**
   * Format payment method response
   * - Map database fields to response type
   * - Sanitize sensitive data
   */
  private formatPaymentMethodResponse(method: any): PaymentMethodResponse {
    return {
      id: method.id,
      provider: method.provider,
      type: method.type,
      lastFour: method.lastFour,
      expiryMonth: method.expiresAt ? method.expiresAt.getMonth() + 1 : undefined,
      expiryYear: method.expiresAt ? method.expiresAt.getFullYear() : undefined,
      isDefault: method.isDefault,
      createdAt: method.createdAt.toISOString(),
    };
  }

  /**
   * Distribute payout
   * - Calculate recipient amounts
   * - Create payout distribution records
   * - Set release dates
   * - Return distribution IDs
   */
  private async distributePayout(transactionId: string): Promise<void> {
    try {
      logger.info(`[PaymentService] Distributing payout for transaction: ${transactionId}`);

      const transaction = await prisma.paymentTransaction.findUnique({
        where: { id: transactionId },
        include: {
          provider: true,
        },
      });

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      // Check if payouts already created for this transaction
      const existingPayouts = await prisma.payoutDistribution.count({
        where: { paymentTransactionId: transactionId },
      });

      if (existingPayouts > 0) {
        logger.info(`[PaymentService] Payouts already exist for transaction ${transactionId}`);
        return;
      }

      // Determine recipient based on transaction type and reference
      let recipientId: string;
      let recipientType: string;
      let metadata: any = {};

      switch (transaction.transactionType) {
        case 'EVENT_TICKET':
          // Get event organizer from event
          if (transaction.referenceId) {
            const event = await prisma.event.findUnique({
              where: { id: transaction.referenceId },
              select: { hostId: true, title: true, date: true },
            });
            recipientId = event?.hostId || transaction.userId;
            recipientType = 'event_organizer';
            metadata = { eventId: transaction.referenceId, eventTitle: event?.title, eventDate: event?.date };
          } else {
            recipientId = transaction.userId;
            recipientType = 'event_organizer';
          }
          break;

        case 'MARKETPLACE_ORDER':
          // Get seller from order
          if (transaction.referenceId) {
            const order = await prisma.marketplaceOrder.findUnique({
              where: { id: transaction.referenceId },
              select: { sellerId: true },
            });
            recipientId = order?.sellerId || transaction.userId;
            recipientType = 'marketplace_seller';
            metadata = { orderId: transaction.referenceId };
          } else {
            recipientId = transaction.userId;
            recipientType = 'marketplace_seller';
          }
          break;

        case 'SERVICE_BOOKING':
          // Get service provider from booking
          if (transaction.referenceId) {
            const booking = await prisma.serviceBooking.findUnique({
              where: { id: transaction.referenceId },
              select: { providerId: true },
            });
            recipientId = booking?.providerId || transaction.userId;
            recipientType = 'service_provider';
            metadata = { bookingId: transaction.referenceId };
          } else {
            recipientId = transaction.userId;
            recipientType = 'service_provider';
          }
          break;

        default:
          recipientId = transaction.userId;
          recipientType = 'user';
      }

      // Calculate payout amounts
      const sellerPayout = transaction.amount - (transaction.platformFee || 0) - (transaction.gatewayFee || 0);
      const platformRevenue = transaction.platformFee || 0;

      // Use EscrowService for recipient payout with proper hold logic
      const { EscrowService } = await import('../../services/escrow.service');
      
      if (sellerPayout > 0) {
        await EscrowService.createPayoutHold({
          transactionId: transaction.id,
          recipientId,
          recipientType: recipientType as any,
          amount: sellerPayout,
          currency: transaction.currency,
          transactionType: transaction.transactionType,
          metadata: {
            ...metadata,
            ...((transaction.metadata as any) || {}),
          },
          requiresManualReview: false,
        });
      }

      // Create platform revenue payout (released immediately)
      if (platformRevenue > 0) {
        await prisma.payoutDistribution.create({
          data: {
            paymentTransactionId: transaction.id,
            recipientId: 'PLATFORM', // Special identifier for platform
            recipientType: 'platform',
            amount: platformRevenue,
            currency: transaction.currency,
            status: 'RELEASED', // Platform fee is collected immediately
            releaseDate: new Date(),
            canReleaseAt: new Date(),
            releasedAt: new Date(),
            holdReason: 'platform_fee_revenue',
            autoReleaseEnabled: true,
            requiresManualReview: false,
            metadata: {
              transactionType: transaction.transactionType,
              originalTransactionId: transaction.id,
              ...metadata,
            },
            notes: `Platform fee from ${transaction.transactionType}`,
          },
        });

        logger.info(`[PaymentService] Created platform revenue payout: ${platformRevenue} ${transaction.currency}`);
      }

      logger.info(`[PaymentService] Payout distribution completed for transaction ${transactionId}`);
    } catch (error) {
      logger.error('[PaymentService] Failed to distribute payout:', error);
      throw error;
    }
  }
}
