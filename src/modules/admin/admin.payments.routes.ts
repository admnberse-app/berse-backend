import { Router } from 'express';
import adminPaymentsController from './admin.payments.controller';
import { authenticateToken } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// All admin payment routes require authentication
router.use(authenticateToken);

// ============================================================================
// PAYMENT DASHBOARD & STATISTICS
// ============================================================================

/**
 * @swagger
 * /v2/admin/payments/stats:
 *   get:
 *     summary: Get payment statistics
 *     description: Get summary statistics for payment dashboard cards (revenue, fees, pending, failed)
 *     tags: [Admin - Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Payment statistics retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get(
  '/stats',
  asyncHandler(adminPaymentsController.getPaymentStats.bind(adminPaymentsController))
);

/**
 * @swagger
 * /v2/admin/payments/methods/stats:
 *   get:
 *     summary: Get payment method statistics
 *     description: Get usage statistics for each payment method
 *     tags: [Admin - Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Payment method statistics retrieved successfully
 */
router.get(
  '/methods/stats',
  asyncHandler(adminPaymentsController.getPaymentMethodStats.bind(adminPaymentsController))
);

// ============================================================================
// PAYMENT TRANSACTIONS
// ============================================================================

/**
 * @swagger
 * /v2/admin/payments:
 *   get:
 *     summary: Get all payment transactions
 *     description: Get paginated list of all payment transactions with filtering and search
 *     tags: [Admin - Payments]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by transaction ID, user name/email
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [EVENT_TICKET, SUBSCRIPTION, MARKETPLACE_ORDER, REFUND, PAYOUT]
 *         description: Filter by transaction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, SUCCEEDED, FAILED, EXPIRED, CANCELLED]
 *         description: Filter by status
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
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *         description: Filter by payment method
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Payment transactions retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get(
  '/',
  asyncHandler(adminPaymentsController.getAllPayments.bind(adminPaymentsController))
);

/**
 * @swagger
 * /v2/admin/payments/{id}:
 *   get:
 *     summary: Get payment transaction details
 *     description: Get detailed information about a specific payment transaction
 *     tags: [Admin - Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
 *       404:
 *         description: Transaction not found
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get(
  '/:id',
  asyncHandler(adminPaymentsController.getPaymentDetails.bind(adminPaymentsController))
);

export const adminPaymentsRoutes = router;
