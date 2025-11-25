/**
 * Export Routes
 */

import { Router } from 'express';
import { exportController } from './export.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

/**
 * @route GET /api/v2/exports/events/:eventId/participants
 * @desc Export event participants to Excel/CSV/JSON
 * @access Private (Event host only)
 * @query format - Export format (excel, csv, json) - default: excel
 * @query status - Filter by status (REGISTERED, CONFIRMED, etc.)
 * @query hasCheckedIn - Filter by check-in status (true/false)
 * @query hasCanceled - Filter by cancellation status (true/false)
 * @query batchSize - Batch size for streaming - default: 1000
 */
router.get(
  '/events/:eventId/participants',
  authenticate,
  exportController.exportEventParticipants.bind(exportController)
);

/**
 * @route GET /api/v2/exports/users
 * @desc Export users (admin only)
 * @access Private (Admin only)
 */
router.get(
  '/users',
  authenticate,
  // adminOnly, // TODO: Add admin middleware
  exportController.exportUsers.bind(exportController)
);

/**
 * @route GET /api/v2/exports/payments
 * @desc Export payments (admin only)
 * @access Private (Admin only)
 */
router.get(
  '/payments',
  authenticate,
  // adminOnly, // TODO: Add admin middleware
  exportController.exportPayments.bind(exportController)
);

export default router;
