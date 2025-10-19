import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticateToken, optionalAuth } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  createPaymentIntentValidators,
  confirmPaymentValidators,
  capturePaymentValidators,
  refundPaymentValidators,
  transactionIdValidator,
  addPaymentMethodValidators,
  updatePaymentMethodValidators,
  paymentMethodIdValidator,
  paymentTransactionQueryValidators,
  payoutQueryValidators,
  webhookValidators,
} from './payment.validators';

const router = Router();
const paymentController = new PaymentController();

// ============================================================================
// PAYMENT INTENT & TRANSACTION ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/payments/intent:
 *   post:
 *     summary: Create a payment intent
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
 *     responses:
 *       201:
 *         description: Payment intent created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/intent',
  authenticateToken,
  createPaymentIntentValidators,
  handleValidationErrors,
  asyncHandler(paymentController.createPaymentIntent.bind(paymentController))
);

/**
 * @swagger
 * /v2/payments/confirm:
 *   post:
 *     summary: Manually confirm a payment (Admin/Server use only)
 *     description: |
 *       Manually confirms a payment by checking status with the payment gateway.
 *       
 *       **⚠️ NOT for Mobile Apps:**
 *       Mobile apps should NOT call this endpoint. Instead, use:
 *       - GET /v2/payments/:transactionId for status polling
 *       - Webhooks automatically update transaction status
 *       
 *       **Use Cases:**
 *       - Manual payment verification by admin
 *       - Server-side payment confirmation flows
 *       - Non-hosted checkout integrations
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
 *                 description: Transaction ID to confirm
 *               gatewayTransactionId:
 *                 type: string
 *                 description: Optional gateway transaction ID (if not already stored)
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 */
router.post(
  '/confirm',
  authenticateToken,
  confirmPaymentValidators,
  handleValidationErrors,
  asyncHandler(paymentController.confirmPayment.bind(paymentController))
);

/**
 * @swagger
 * /v2/payments/{transactionId}/capture:
 *   post:
 *     summary: Capture an authorized payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment captured successfully
 */
router.post(
  '/:transactionId/capture',
  authenticateToken,
  capturePaymentValidators,
  handleValidationErrors,
  asyncHandler(paymentController.capturePayment.bind(paymentController))
);

/**
 * @swagger
 * /v2/payments/{transactionId}/refund:
 *   post:
 *     summary: Refund a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 */
router.post(
  '/:transactionId/refund',
  authenticateToken,
  refundPaymentValidators,
  handleValidationErrors,
  asyncHandler(paymentController.refundPayment.bind(paymentController))
);

/**
 * @swagger
 * /v2/payments/transactions:
 *   get:
 *     summary: Get user's transactions with filters
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 */
router.get(
  '/transactions',
  authenticateToken,
  paymentTransactionQueryValidators,
  handleValidationErrors,
  asyncHandler(paymentController.getUserTransactions.bind(paymentController))
);

/**
 * @swagger
 * /v2/payments/{transactionId}:
 *   get:
 *     summary: Get transaction details and status
 *     description: |
 *       Get detailed information about a payment transaction.
 *       
 *       **Mobile WebView Flow:**
 *       After user completes payment in WebView, poll this endpoint to check status.
 *       DO NOT use /v2/payments/confirm from mobile - that's for manual confirmation.
 *       
 *       **Polling Recommended:**
 *       - Poll every 1 second for up to 30 seconds
 *       - Stop when status is SUCCEEDED, FAILED, or CANCELED
 *       - Continue polling if status is PENDING or PROCESSING
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID from payment intent creation
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
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
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PENDING, PROCESSING, SUCCEEDED, FAILED, CANCELED]
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     platformFee:
 *                       type: number
 *                     gatewayFee:
 *                       type: number
 *                     processedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Transaction not found
 *       403:
 *         description: Unauthorized access
 */
router.get(
  '/:transactionId',
  authenticateToken,
  transactionIdValidator,
  handleValidationErrors,
  asyncHandler(paymentController.getTransaction.bind(paymentController))
);

// ============================================================================
// PAYMENT METHOD ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/payments/methods:
 *   post:
 *     summary: Add a payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Payment method added successfully
 */
router.post(
  '/methods',
  authenticateToken,
  addPaymentMethodValidators,
  handleValidationErrors,
  asyncHandler(paymentController.addPaymentMethod.bind(paymentController))
);

/**
 * @swagger
 * /v2/payments/methods:
 *   get:
 *     summary: Get user's payment methods
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 */
router.get(
  '/methods',
  authenticateToken,
  asyncHandler(paymentController.getPaymentMethods.bind(paymentController))
);

/**
 * @swagger
 * /v2/payments/methods/{paymentMethodId}:
 *   put:
 *     summary: Update a payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment method updated successfully
 */
router.put(
  '/methods/:paymentMethodId',
  authenticateToken,
  updatePaymentMethodValidators,
  handleValidationErrors,
  asyncHandler(paymentController.updatePaymentMethod.bind(paymentController))
);

/**
 * @swagger
 * /v2/payments/methods/{paymentMethodId}:
 *   delete:
 *     summary: Delete a payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment method deleted successfully
 */
router.delete(
  '/methods/:paymentMethodId',
  authenticateToken,
  paymentMethodIdValidator,
  handleValidationErrors,
  asyncHandler(paymentController.deletePaymentMethod.bind(paymentController))
);

// ============================================================================
// PAYOUT ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/payments/payouts:
 *   get:
 *     summary: Get user's payouts
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payouts retrieved successfully
 */
router.get(
  '/payouts',
  authenticateToken,
  payoutQueryValidators,
  handleValidationErrors,
  asyncHandler(paymentController.getUserPayouts.bind(paymentController))
);

// ============================================================================
// FEE CALCULATION ROUTE
// ============================================================================

router.post(
  '/calculate-fees',
  optionalAuth,
  asyncHandler(paymentController.calculateFees.bind(paymentController))
);

export const paymentRoutes = router;
