import { Router } from 'express';
import { accountabilityController } from './accountability.controller';
import { authenticate } from '../../../middleware/auth';

const router = Router();

/**
 * @swagger
 * /accountability/history:
 *   get:
 *     tags: [Accountability]
 *     summary: Get accountability history for authenticated user
 *     description: |
 *       Retrieve accountability logs where the authenticated user is the vouchee.
 *       Shows how the user's behavior has affected their vouchers' trust scores.
 *       Formula: Negative behavior = 40% penalty to vouchers, Positive behavior = 20% reward to vouchers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of logs per page
 *       - in: query
 *         name: impactType
 *         schema:
 *           type: string
 *           enum: [POSITIVE, NEGATIVE, NEUTRAL]
 *         description: Filter by impact type
 *     responses:
 *       200:
 *         description: Accountability history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/history',
  authenticate,
  accountabilityController.getAccountabilityHistory.bind(accountabilityController)
);

/**
 * @swagger
 * /accountability/impact:
 *   get:
 *     tags: [Accountability]
 *     summary: Get accountability impact summary for authenticated user
 *     description: |
 *       Get summary of how vouchees' behavior has affected the authenticated user's trust score.
 *       Shows total impact, breakdown by vouchee, and recent accountability events.
 *       User must be a voucher to have accountability impacts.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accountability impact summary retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/impact',
  authenticate,
  accountabilityController.getAccountabilityImpact.bind(accountabilityController)
);

/**
 * @swagger
 * /accountability/process/{logId}:
 *   post:
 *     tags: [Accountability]
 *     summary: Process a specific accountability log (admin only)
 *     description: Manually trigger processing of an accountability log to apply trust score impact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *         description: Accountability log ID
 *     responses:
 *       200:
 *         description: Log processed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Log not found
 */
router.post(
  '/process/:logId',
  authenticate,
  accountabilityController.processAccountabilityLog.bind(accountabilityController)
);

/**
 * @swagger
 * /accountability/process-all:
 *   post:
 *     tags: [Accountability]
 *     summary: Process all unprocessed accountability logs (admin only)
 *     description: Batch process all pending accountability logs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logs processed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post(
  '/process-all',
  authenticate,
  accountabilityController.processAllUnprocessedLogs.bind(accountabilityController)
);

export default router;
