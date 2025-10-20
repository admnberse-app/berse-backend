/**
 * Subscription Payment Service
 * Handles payment gateway integration for subscriptions (Xendit & Stripe)
 */

import { prisma } from '../../config/database';
import { SubscriptionTier, BillingCycle } from '../../types/subscription.types';

// Payment gateway types
export enum PaymentGateway {
  XENDIT = 'XENDIT',
  STRIPE = 'STRIPE',
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  gatewayId: string;
  gateway: PaymentGateway;
  metadata?: Record<string, any>;
}

export interface SubscriptionPaymentData {
  userId: string;
  tierCode: SubscriptionTier;
  billingCycle: BillingCycle;
  gateway: PaymentGateway;
  returnUrl?: string;
  cancelUrl?: string;
}

class SubscriptionPaymentService {
  /**
   * Create payment intent for subscription
   */
  async createSubscriptionPayment(data: SubscriptionPaymentData): Promise<PaymentIntent> {
    try {
      // Get tier details
      const tier = await prisma.subscriptionTier.findUnique({
        where: { tierCode: data.tierCode },
      });

      if (!tier) {
        throw new Error('Subscription tier not found');
      }

      // Calculate amount based on billing cycle
      const amount = tier.price;

      // Route to appropriate gateway
      switch (data.gateway) {
        case PaymentGateway.XENDIT:
          return await this.createXenditPayment(data, amount, tier);
        case PaymentGateway.STRIPE:
          return await this.createStripePayment(data, amount, tier);
        default:
          throw new Error('Unsupported payment gateway');
      }
    } catch (error: any) {
      console.error('Create subscription payment error:', error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Handle payment webhook (gateway agnostic)
   */
  async handlePaymentWebhook(
    gateway: PaymentGateway,
    payload: any,
    signature?: string
  ): Promise<void> {
    try {
      switch (gateway) {
        case PaymentGateway.XENDIT:
          await this.handleXenditWebhook(payload, signature);
          break;
        case PaymentGateway.STRIPE:
          await this.handleStripeWebhook(payload, signature);
          break;
        default:
          throw new Error('Unsupported payment gateway');
      }
    } catch (error: any) {
      console.error('Handle payment webhook error:', error);
      throw new Error(`Webhook handling failed: ${error.message}`);
    }
  }

  /**
   * Cancel subscription payment
   */
  async cancelSubscriptionPayment(subscriptionId: string): Promise<boolean> {
    try {
      const subscription = await prisma.userSubscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription || !subscription.gatewaySubscriptionId) {
        throw new Error('Subscription or gateway ID not found');
      }

      // Cancel at payment gateway
      const gateway = subscription.paymentProviderId as PaymentGateway;
      
      switch (gateway) {
        case PaymentGateway.XENDIT:
          await this.cancelXenditSubscription(subscription.gatewaySubscriptionId);
          break;
        case PaymentGateway.STRIPE:
          await this.cancelStripeSubscription(subscription.gatewaySubscriptionId);
          break;
      }

      return true;
    } catch (error: any) {
      console.error('Cancel subscription payment error:', error);
      throw new Error(`Failed to cancel payment: ${error.message}`);
    }
  }

  // ========================================================================
  // XENDIT INTEGRATION
  // ========================================================================

  private async createXenditPayment(
    data: SubscriptionPaymentData,
    amount: number,
    tier: any
  ): Promise<PaymentIntent> {
    // TODO: Implement Xendit integration
    // const Xendit = require('xendit-node');
    // const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });

    console.log('[XENDIT] Creating payment for', data.tierCode, 'Amount:', amount);

    // Mock implementation - replace with actual Xendit API call
    const mockXenditInvoice = {
      id: `xendit_inv_${Date.now()}`,
      amount,
      currency: 'IDR',
      status: 'PENDING',
      invoice_url: `https://checkout.xendit.co/web/mock_${Date.now()}`,
    };

    // Store payment record
    await prisma.subscriptionPayment.create({
      data: {
        userId: data.userId,
        subscriptionId: '', // Will be set after subscription creation
        amount,
        currency: 'MYR',
        billingPeriodStart: new Date(),
        billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        dueDate: new Date(),
        status: 'PENDING',
        gatewayInvoiceId: mockXenditInvoice.id,
      },
    });

    return {
      id: mockXenditInvoice.id,
      amount,
      currency: 'MYR',
      status: 'pending',
      gatewayId: mockXenditInvoice.id,
      gateway: PaymentGateway.XENDIT,
      metadata: {
        checkoutUrl: mockXenditInvoice.invoice_url,
      },
    };
  }

  private async handleXenditWebhook(payload: any, signature?: string): Promise<void> {
    // TODO: Verify webhook signature
    // const isValid = this.verifyXenditSignature(payload, signature);
    // if (!isValid) throw new Error('Invalid webhook signature');

    console.log('[XENDIT] Webhook received:', payload);

    // Handle different event types
    switch (payload.status) {
      case 'PAID':
        await this.handleSuccessfulPayment(payload, PaymentGateway.XENDIT);
        break;
      case 'EXPIRED':
      case 'FAILED':
        await this.handleFailedPayment(payload, PaymentGateway.XENDIT);
        break;
      default:
        console.log('[XENDIT] Unhandled status:', payload.status);
    }
  }

  private async cancelXenditSubscription(gatewayId: string): Promise<void> {
    // TODO: Implement Xendit subscription cancellation
    console.log('[XENDIT] Canceling subscription:', gatewayId);
  }

  // ========================================================================
  // STRIPE INTEGRATION
  // ========================================================================

  private async createStripePayment(
    data: SubscriptionPaymentData,
    amount: number,
    tier: any
  ): Promise<PaymentIntent> {
    // TODO: Implement Stripe integration
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    console.log('[STRIPE] Creating payment for', data.tierCode, 'Amount:', amount);

    // Mock implementation - replace with actual Stripe API call
    const mockStripeSession = {
      id: `stripe_cs_${Date.now()}`,
      amount_total: amount * 100, // Stripe uses cents
      currency: 'myr',
      status: 'open',
      url: `https://checkout.stripe.com/mock_${Date.now()}`,
    };

    // Store payment record
    await prisma.subscriptionPayment.create({
      data: {
        userId: data.userId,
        subscriptionId: '', // Will be set after subscription creation
        amount,
        currency: 'MYR',
        billingPeriodStart: new Date(),
        billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        dueDate: new Date(),
        status: 'PENDING',
        gatewayInvoiceId: mockStripeSession.id,
      },
    });

    return {
      id: mockStripeSession.id,
      amount,
      currency: 'MYR',
      status: 'pending',
      gatewayId: mockStripeSession.id,
      gateway: PaymentGateway.STRIPE,
      metadata: {
        checkoutUrl: mockStripeSession.url,
      },
    };
  }

  private async handleStripeWebhook(payload: any, signature?: string): Promise<void> {
    // TODO: Verify webhook signature
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);

    console.log('[STRIPE] Webhook received:', payload);

    // Handle different event types
    switch (payload.type) {
      case 'checkout.session.completed':
        await this.handleSuccessfulPayment(payload.data.object, PaymentGateway.STRIPE);
        break;
      case 'invoice.payment_failed':
        await this.handleFailedPayment(payload.data.object, PaymentGateway.STRIPE);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(payload.data.object);
        break;
      default:
        console.log('[STRIPE] Unhandled event type:', payload.type);
    }
  }

  private async cancelStripeSubscription(gatewayId: string): Promise<void> {
    // TODO: Implement Stripe subscription cancellation
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // await stripe.subscriptions.del(gatewayId);
    
    console.log('[STRIPE] Canceling subscription:', gatewayId);
  }

  // ========================================================================
  // SHARED HANDLERS
  // ========================================================================

  private async handleSuccessfulPayment(paymentData: any, gateway: PaymentGateway): Promise<void> {
    console.log(`[${gateway}] Payment successful:`, paymentData);

    // Update payment record
    const payment = await prisma.subscriptionPayment.findFirst({
      where: { gatewayInvoiceId: paymentData.id },
    });

    if (!payment) {
      console.error('Payment record not found:', paymentData.id);
      return;
    }

    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID' as any,
        paidAt: new Date(),
      },
    });

    // Activate subscription
    if (payment.subscriptionId) {
      await prisma.userSubscription.update({
        where: { id: payment.subscriptionId },
        data: { status: 'ACTIVE' },
      });
    }
  }

  private async handleFailedPayment(paymentData: any, gateway: PaymentGateway): Promise<void> {
    console.log(`[${gateway}] Payment failed:`, paymentData);

    // Update payment record
    const payment = await prisma.subscriptionPayment.findFirst({
      where: { gatewayInvoiceId: paymentData.id },
    });

    if (!payment) {
      console.error('Payment record not found:', paymentData.id);
      return;
    }

    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        failureReason: paymentData.failure_reason || 'Payment failed',
      },
    });

    // Update subscription status
    if (payment.subscriptionId) {
      await prisma.userSubscription.update({
        where: { id: payment.subscriptionId },
        data: { status: 'PAST_DUE' },
      });
    }
  }

  private async handleSubscriptionCanceled(subscriptionData: any): Promise<void> {
    console.log('[SUBSCRIPTION] Canceled:', subscriptionData);

    // Find and update subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: { gatewaySubscriptionId: subscriptionData.id },
    });

    if (subscription) {
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
        },
      });
    }
  }
}

export default new SubscriptionPaymentService();
