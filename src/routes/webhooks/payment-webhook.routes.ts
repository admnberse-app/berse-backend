/**
 * Payment Webhook Routes
 * Handles payment gateway webhook endpoints
 */

import { Router } from 'express';
import {
  handleXenditWebhook,
  handleStripeWebhook,
  testWebhook,
} from '../../controllers/webhooks/payment-webhook.controller';

const router = Router();

/**
 * Xendit webhook endpoint
 * Used by Xendit to send payment notifications
 */
router.post('/xendit', handleXenditWebhook);

/**
 * Stripe webhook endpoint
 * Used by Stripe to send payment notifications
 */
router.post('/stripe', handleStripeWebhook);

/**
 * Test webhook endpoint (development only)
 */
router.post('/test', testWebhook);

export default router;
