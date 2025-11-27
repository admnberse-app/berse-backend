import { Router } from 'express';
import { PaymentController } from './payment.controller';
import paymentMethodsController from './payment-methods.controller';
import { authenticateToken, optionalAuth } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
import { asyncHandler } from '../../utils/asyncHandler';
import { upload } from '../../middleware/upload';
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

// ============================================================================
// PAYMENT METHODS ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/payments/methods:
 *   get:
 *     summary: Get available payment methods
 *     description: Returns list of active payment methods (Xendit, bank transfers, e-wallets, etc.)
 *     tags: [Payment Methods]
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country code
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *         description: Filter by currency
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (bank_transfer, ewallet, online_gateway)
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 */
router.get(
  '/methods',
  asyncHandler(paymentMethodsController.getAvailablePaymentMethods.bind(paymentMethodsController))
);

/**
 * @swagger
 * /v2/payments/methods/{methodCode}:
 *   get:
 *     summary: Get payment method details
 *     description: Get full details including account information for manual payment methods
 *     tags: [Payment Methods]
 *     parameters:
 *       - in: path
 *         name: methodCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment method details retrieved
 */
router.get(
  '/methods/:methodCode',
  asyncHandler(paymentMethodsController.getPaymentMethodByCode.bind(paymentMethodsController))
);

// ============================================================================
// MANUAL PAYMENT ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/payments/{transactionId}/proof:
 *   post:
 *     summary: Upload proof of payment (for manual payments)
 *     description: Upload proof image/PDF for manual bank transfer or e-wallet payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - proof
 *             properties:
 *               proof:
 *                 type: string
 *                 format: binary
 *                 description: Payment proof image (JPG, PNG, WEBP, PDF - max 5MB)
 *               paymentDetails:
 *                 type: string
 *                 description: JSON string with payment details (reference number, bank name, etc.)
 *     responses:
 *       200:
 *         description: Proof uploaded successfully, awaiting verification
 *       400:
 *         description: Invalid file or transaction
 *       404:
 *         description: Transaction not found
 */
router.post(
  '/:transactionId/proof',
  authenticateToken,
  upload.single('proof'),
  asyncHandler(paymentController.uploadPaymentProof.bind(paymentController))
);

/**
 * @swagger
 * /v2/payments/admin/pending-verifications:
 *   get:
 *     summary: Get pending manual payment verifications (Admin only)
 *     description: Returns list of manual payments awaiting admin verification
 *     tags: [Payments, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Pending verifications retrieved successfully
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/admin/pending-verifications',
  authenticateToken,
  asyncHandler(paymentController.getPendingVerifications.bind(paymentController))
);

/**
 * @swagger
 * /v2/payments/admin/{transactionId}/verify:
 *   post:
 *     summary: Verify manual payment (Admin only)
 *     description: Approve or reject a manual payment after reviewing proof
 *     tags: [Payments, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *               notes:
 *                 type: string
 *                 description: Admin notes or rejection reason
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid action or transaction
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Transaction not found
 */
router.post(
  '/admin/:transactionId/verify',
  authenticateToken,
  asyncHandler(paymentController.verifyManualPayment.bind(paymentController))
);

export const paymentRoutes = router;
