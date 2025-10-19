import { Router } from 'express';
import { AdminRevenueController } from './revenue.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin - Revenue
 *   description: Platform revenue tracking and analytics (Admin only)
 */

/**
 * @swagger
 * /api/admin/revenue/summary:
 *   get:
 *     summary: Get platform revenue summary
 *     tags: [Admin - Revenue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for revenue calculation
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for revenue calculation
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *           enum: [EVENT_TICKET, MARKETPLACE_ORDER, SERVICE_BOOKING, SUBSCRIPTION]
 *         description: Filter by transaction type
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *         description: Filter by currency (e.g., MYR, USD)
 *     responses:
 *       200:
 *         description: Platform revenue summary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/summary', authenticate, authorize(UserRole.ADMIN), AdminRevenueController.getRevenueSummary);

/**
 * @swagger
 * /api/admin/revenue/details:
 *   get:
 *     summary: Get detailed platform revenue breakdown
 *     tags: [Admin - Revenue]
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
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Detailed revenue breakdown
 */
router.get('/details', authenticate, authorize(UserRole.ADMIN), AdminRevenueController.getRevenueDetails);

/**
 * @swagger
 * /api/admin/revenue/analytics:
 *   get:
 *     summary: Get revenue analytics by time period
 *     tags: [Admin - Revenue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
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
 *         name: transactionType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Revenue analytics by time period
 */
router.get('/analytics', authenticate, authorize(UserRole.ADMIN), AdminRevenueController.getRevenueAnalytics);

/**
 * @swagger
 * /api/admin/revenue/pending-sync:
 *   get:
 *     summary: Check for payments missing platform payout distributions
 *     tags: [Admin - Revenue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions with missing platform payouts
 */
router.get('/pending-sync', authenticate, authorize(UserRole.ADMIN), AdminRevenueController.getPendingRevenueSync);

/**
 * @swagger
 * /api/admin/revenue/comparison:
 *   get:
 *     summary: Compare revenue between two time periods
 *     tags: [Admin - Revenue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: currentStart
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: currentEnd
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: previousStart
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: previousEnd
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Revenue comparison with growth percentages
 */
router.get('/comparison', authenticate, authorize(UserRole.ADMIN), AdminRevenueController.getRevenueComparison);

export default router;
