/**
 * Payment Webhook Controller
 * Handles incoming webhooks from payment gateways (Xendit & Stripe)
 */

import { Request, Response, RequestHandler } from 'express';
import subscriptionPaymentService from '../../services/payments/subscription-payment.service';
import { PaymentGateway } from '../../services/payments/subscription-payment.service';

/**
 * Handle Xendit webhook
 * POST /api/webhooks/payment/xendit
 */
export const handleXenditWebhook: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers['x-callback-token'] as string;
    const payload = req.body;

    console.log('[XENDIT WEBHOOK] Received webhook');

    // Verify Xendit callback token
    if (signature !== process.env.XENDIT_WEBHOOK_TOKEN) {
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    // Process webhook
    await subscriptionPaymentService.handlePaymentWebhook(
      PaymentGateway.XENDIT,
      payload,
      signature
    );

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Xendit webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Handle Stripe webhook
 * POST /api/webhooks/payment/stripe
 */
export const handleStripeWebhook: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.body;

    console.log('[STRIPE WEBHOOK] Received webhook');

    // Process webhook (signature verification happens in service)
    await subscriptionPaymentService.handlePaymentWebhook(
      PaymentGateway.STRIPE,
      payload,
      signature
    );

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Test webhook endpoint (development only)
 * POST /api/webhooks/payment/test
 */
export const testWebhook: RequestHandler = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  try {
    const { gateway, eventType, mockData } = req.body;

    console.log('[TEST WEBHOOK]', gateway, eventType);

    // Simulate webhook processing
    await subscriptionPaymentService.handlePaymentWebhook(
      gateway,
      mockData || { type: eventType, data: { object: {} } }
    );

    res.status(200).json({
      success: true,
      message: `Test webhook processed for ${gateway}`,
    });
  } catch (error: any) {
    console.error('Test webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};
