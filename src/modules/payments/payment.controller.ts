import { Response } from 'express';
import { AuthRequest } from '../../types';
import { PaymentService } from './payment.service';
import { sendSuccess } from '../../utils/response';
import type {
  CreatePaymentIntentInput,
  ConfirmPaymentInput,
  RefundPaymentInput,
  CapturePaymentInput,
  AddPaymentMethodInput,
  UpdatePaymentMethodInput,
  PaymentTransactionQuery,
  PayoutQuery,
  WebhookEvent,
  FeeCalculationInput,
} from './payment.types';

const paymentService = new PaymentService();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and transaction management
 */

export class PaymentController {
  // ============================================================================
  // PAYMENT INTENT & TRANSACTIONS
  // ============================================================================

  /**
   * @swagger
   * /v2/payments/intent:
   *   post:
   *     summary: Create a payment intent
   *     description: Initialize a new payment and receive a checkout URL for the user to complete the payment
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *               - transactionType
   *               - referenceType
   *               - referenceId
   *             properties:
   *               amount:
   *                 type: number
   *                 minimum: 1
   *                 description: Payment amount
   *                 example: 100.00
   *               currency:
   *                 type: string
   *                 enum: [MYR, SGD, IDR, PHP, THB, VND, USD]
   *                 default: MYR
   *                 description: Currency code
   *               transactionType:
   *                 type: string
   *                 enum: [EVENT_TICKET, MARKETPLACE_ORDER, SERVICE_BOOKING, SUBSCRIPTION, DONATION, REFUND]
   *                 description: Type of transaction
   *                 example: EVENT_TICKET
   *               referenceType:
   *                 type: string
   *                 description: Reference entity type
   *                 example: event_ticket
   *               referenceId:
   *                 type: string
   *                 description: ID of referenced entity
   *                 example: evt_abc123
   *               description:
   *                 type: string
   *                 description: Payment description
   *                 example: Concert ticket - VIP Section
   *               metadata:
   *                 type: object
   *                 description: Additional metadata
   *                 example: { "eventName": "Summer Festival 2025" }
   *               providerId:
   *                 type: string
   *                 description: Specific payment provider ID (optional)
   *     responses:
   *       201:
   *         description: Payment intent created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     transactionId:
   *                       type: string
   *                     clientSecret:
   *                       type: string
   *                       description: Checkout URL to redirect user
   *                     amount:
   *                       type: number
   *                     currency:
   *                       type: string
   *                     status:
   *                       type: string
   *                       enum: [PENDING, PROCESSING, SUCCEEDED, FAILED, CANCELED]
   *                     providerId:
   *                       type: string
   *                     expiresAt:
   *                       type: string
   *                       format: date-time
   *                 message:
   *                   type: string
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   *
   * @route POST /v2/payments/intent
   * @desc Create a payment intent
   * @access Private
   */
  async createPaymentIntent(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const input: CreatePaymentIntentInput = req.body;

    const intent = await paymentService.createPaymentIntent(userId, input);
    sendSuccess(res, intent, 'Payment intent created successfully', 201);
  }

  /**
   * @swagger
   * /v2/payments/confirm:
   *   post:
   *     summary: Confirm a payment
   *     description: Manually check and update the status of a payment
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - transactionId
   *             properties:
   *               transactionId:
   *                 type: string
   *                 description: Transaction ID from payment intent
   *               gatewayTransactionId:
   *                 type: string
   *                 description: Gateway transaction ID (optional)
   *     responses:
   *       200:
   *         description: Payment confirmed successfully
   *       404:
   *         description: Transaction not found
   *       401:
   *         description: Unauthorized
   *
   * @route POST /v2/payments/confirm
   * @desc Confirm a payment
   * @access Private
   */
  async confirmPayment(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const input: ConfirmPaymentInput = req.body;

    const transaction = await paymentService.confirmPayment(userId, input);
    sendSuccess(res, transaction, 'Payment confirmed successfully');
  }

  /**
   * @swagger
   * /v2/payments/{transactionId}/capture:
   *   post:
   *     summary: Capture an authorized payment
   *     description: Capture a previously authorized payment (for two-step payment flows)
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: transactionId
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction ID to capture
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: number
   *                 description: Amount to capture (optional, defaults to full amount)
   *     responses:
   *       200:
   *         description: Payment captured successfully
   *       400:
   *         description: Invalid capture request
   *       404:
   *         description: Transaction not found
   *
   * @route POST /v2/payments/:transactionId/capture
   * @desc Capture an authorized payment
   * @access Private
   */
  async capturePayment(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { transactionId } = req.params;
    const { amount } = req.body;

    const transaction = await paymentService.capturePayment(userId, transactionId, amount);
    sendSuccess(res, transaction, 'Payment captured successfully');
  }

  /**
   * @swagger
   * /v2/payments/{transactionId}/refund:
   *   post:
   *     summary: Refund a payment
   *     description: Issue a full or partial refund for a completed payment
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: transactionId
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction ID to refund
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - reason
   *             properties:
   *               amount:
   *                 type: number
   *                 description: Refund amount (omit for full refund)
   *                 example: 50.00
   *               reason:
   *                 type: string
   *                 description: Reason for refund
   *                 example: Customer requested cancellation
   *     responses:
   *       200:
   *         description: Refund processed successfully
   *       400:
   *         description: Invalid refund request
   *       404:
   *         description: Transaction not found
   *
   * @route POST /v2/payments/:transactionId/refund
   * @desc Refund a payment
   * @access Private
   */
  async refundPayment(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { transactionId } = req.params;
    const input: RefundPaymentInput = { ...req.body, transactionId };

    const transaction = await paymentService.refundPayment(userId, input);
    sendSuccess(res, transaction, 'Payment refunded successfully');
  }

  /**
   * @swagger
   * /v2/payments/{transactionId}:
   *   get:
   *     summary: Get transaction details
   *     description: Retrieve details of a specific payment transaction
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: transactionId
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction ID
   *     responses:
   *       200:
   *         description: Transaction details retrieved successfully
   *       404:
   *         description: Transaction not found
   *       403:
   *         description: Unauthorized access
   *
   * @route GET /v2/payments/:transactionId
   * @desc Get transaction details
   * @access Private
   */
  async getTransaction(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { transactionId } = req.params;

    const transaction = await paymentService.getTransaction(transactionId, userId);
    sendSuccess(res, transaction);
  }

  /**
   * @swagger
   * /v2/payments/transactions:
   *   get:
   *     summary: Get user transactions
   *     description: Retrieve paginated list of user transactions with filters and summary
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *           maximum: 100
   *         description: Items per page
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PENDING, PROCESSING, SUCCEEDED, FAILED, CANCELED, REFUNDED, PARTIALLY_REFUNDED]
   *         description: Filter by status
   *       - in: query
   *         name: transactionType
   *         schema:
   *           type: string
   *           enum: [EVENT_TICKET, MARKETPLACE_ORDER, SERVICE_BOOKING, SUBSCRIPTION, DONATION, REFUND]
   *         description: Filter by transaction type
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Start date filter
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: End date filter
   *       - in: query
   *         name: minAmount
   *         schema:
   *           type: number
   *         description: Minimum amount filter
   *       - in: query
   *         name: maxAmount
   *         schema:
   *           type: number
   *         description: Maximum amount filter
   *     responses:
   *       200:
   *         description: Transactions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     transactions:
   *                       type: array
   *                       items:
   *                         type: object
   *                     totalCount:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *                     summary:
   *                       type: object
   *                       properties:
   *                         totalAmount:
   *                           type: number
   *                         totalFees:
   *                           type: number
   *                         totalRefunded:
   *                           type: number
   *                         successCount:
   *                           type: integer
   *                         pendingCount:
   *                           type: integer
   *                         failedCount:
   *                           type: integer
   *
   * @route GET /v2/payments/transactions
   * @desc Get user's transactions with filters
   * @access Private
   */
  async getUserTransactions(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const query: PaymentTransactionQuery = req.query;

    const result = await paymentService.getUserTransactions(userId, query);
    sendSuccess(res, result);
  }

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  /**
   * @swagger
   * /v2/payments/methods:
   *   post:
   *     summary: Add a payment method
   *     description: Save a tokenized payment method for future use
   *     tags: [Payment Methods]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - provider
   *               - type
   *               - gatewayMethodId
   *             properties:
   *               provider:
   *                 type: string
   *                 description: Payment provider
   *                 example: xendit
   *               type:
   *                 type: string
   *                 description: Payment method type
   *                 example: card
   *               gatewayMethodId:
   *                 type: string
   *                 description: Gateway payment method ID
   *               lastFour:
   *                 type: string
   *                 description: Last 4 digits of card
   *                 example: "4242"
   *               expiryMonth:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 12
   *                 example: 12
   *               expiryYear:
   *                 type: integer
   *                 example: 2025
   *               isDefault:
   *                 type: boolean
   *                 default: false
   *     responses:
   *       201:
   *         description: Payment method added successfully
   *       400:
   *         description: Invalid request
   *
   * @route POST /v2/payments/methods
   * @desc Add a payment method
   * @access Private
   */
  async addPaymentMethod(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const input: AddPaymentMethodInput = req.body;

    const method = await paymentService.addPaymentMethod(userId, input);
    sendSuccess(res, method, 'Payment method added successfully', 201);
  }

  /**
   * @route PUT /v2/payments/methods/:paymentMethodId
   * @desc Update a payment method
   * @access Private
   */
  async updatePaymentMethod(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { paymentMethodId } = req.params;
    const input: UpdatePaymentMethodInput = { ...req.body, paymentMethodId };

    const method = await paymentService.updatePaymentMethod(userId, input);
    sendSuccess(res, method, 'Payment method updated successfully');
  }

  /**
   * @route DELETE /v2/payments/methods/:paymentMethodId
   * @desc Delete a payment method
   * @access Private
   */
  async deletePaymentMethod(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { paymentMethodId } = req.params;

    await paymentService.deletePaymentMethod(userId, paymentMethodId);
    sendSuccess(res, null, 'Payment method deleted successfully');
  }

  /**
   * @swagger
   * /v2/payments/methods:
   *   get:
   *     summary: Get user's payment methods
   *     description: Retrieve list of saved payment methods for the authenticated user
   *     tags: [Payment Methods]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Payment methods retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       type:
   *                         type: string
   *                       lastFour:
   *                         type: string
   *                       expiryMonth:
   *                         type: integer
   *                       expiryYear:
   *                         type: integer
   *                       isDefault:
   *                         type: boolean
   *
   * @route GET /v2/payments/methods
   * @desc Get user's payment methods
   * @access Private
   */
  async getPaymentMethods(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;

    const methods = await paymentService.getPaymentMethods(userId);
    sendSuccess(res, methods);
  }

  // ============================================================================
  // PAYOUTS
  // ============================================================================

  /**
   * @swagger
   * /v2/payments/payouts:
   *   get:
   *     summary: Get user's payouts
   *     description: Retrieve paginated list of payout distributions with filters
   *     tags: [Payouts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PENDING, PROCESSING, RELEASED, HELD, FAILED, CANCELED]
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *     responses:
   *       200:
   *         description: Payouts retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     payouts:
   *                       type: array
   *                     totalCount:
   *                       type: integer
   *                     summary:
   *                       type: object
   *
   * @route GET /v2/payments/payouts
   * @desc Get user's payouts
   * @access Private
   */
  async getUserPayouts(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const query: PayoutQuery = req.query;

    const result = await paymentService.getUserPayouts(userId, query);
    sendSuccess(res, result);
  }

  // ============================================================================
  // FEE CALCULATION
  // ============================================================================

  /**
   * @swagger
   * /v2/payments/calculate-fees:
   *   post:
   *     summary: Calculate transaction fees
   *     description: Calculate platform and gateway fees before creating a payment (public endpoint)
   *     tags: [Payments]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *               - transactionType
   *             properties:
   *               amount:
   *                 type: number
   *                 description: Payment amount
   *                 example: 100.00
   *               transactionType:
   *                 type: string
   *                 enum: [EVENT_TICKET, MARKETPLACE_ORDER, SERVICE_BOOKING, SUBSCRIPTION, DONATION]
   *                 example: EVENT_TICKET
   *               providerId:
   *                 type: string
   *                 description: Specific payment provider ID (optional)
   *     responses:
   *       200:
   *         description: Fees calculated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     platformFee:
   *                       type: number
   *                     gatewayFee:
   *                       type: number
   *                     totalFees:
   *                       type: number
   *                     netAmount:
   *                       type: number
   *                     feeBreakdown:
   *                       type: object
   *
   * @route POST /v2/payments/calculate-fees
   * @desc Calculate transaction fees
   * @access Public
   */
  async calculateFees(req: AuthRequest, res: Response): Promise<void> {
    const input: FeeCalculationInput = req.body;

    const fees = await paymentService.calculateFees(input);
    sendSuccess(res, fees);
  }

  // ============================================================================
  // WEBHOOKS
  // ============================================================================

  /**
   * @swagger
   * /v2/payments/webhooks/{provider}:
   *   post:
   *     summary: Handle payment provider webhooks
   *     description: Process webhook events from payment providers (signature verified)
   *     tags: [Webhooks]
   *     parameters:
   *       - in: path
   *         name: provider
   *         required: true
   *         schema:
   *           type: string
   *         description: Payment provider name (e.g., xendit)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             description: Webhook event payload from payment provider
   *     responses:
   *       200:
   *         description: Webhook processed successfully
   *       400:
   *         description: Invalid webhook signature or payload
  /**
   * @route POST /v2/payments/webhooks/:provider
   * @desc Handle payment provider webhooks
   * @access Public (signature verified)
   */
  async handleWebhook(req: AuthRequest, res: Response): Promise<void> {
    const { provider } = req.params;
    
    // Extract webhook signature from headers
    // Xendit: x-callback-token
    // Stripe: stripe-signature
    const signature = req.headers['x-callback-token'] || req.headers['stripe-signature'] || '';
    
    const event: WebhookEvent = {
      provider,
      signature: signature as string,
      eventType: req.body.event_type || req.body.type || 'unknown',
      eventId: req.body.id || req.body.event_id || `evt_${Date.now()}`,
      timestamp: req.body.created || req.body.timestamp || new Date().toISOString(),
      data: req.body,
    };

    await paymentService.handleWebhook(event);
    sendSuccess(res, null, 'Webhook processed');
  }
}
