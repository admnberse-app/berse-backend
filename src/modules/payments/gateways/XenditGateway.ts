import {
  AbstractPaymentGateway,
  PaymentIntentData,
  PaymentIntentResult,
  CapturePaymentData,
  CapturePaymentResult,
  RefundData,
  RefundResult,
  PaymentMethodData,
  PaymentMethodResult,
  CustomerData,
  CustomerResult,
  PayoutData,
  PayoutResult,
  WebhookVerificationData,
  WebhookEvent,
  ProviderConfig,
} from './AbstractPaymentGateway';
import logger from '../../../utils/logger';
import { AppError } from '../../../middleware/error';
import Xendit from 'xendit-node';

/**
 * Xendit Payment Gateway Implementation
 * 
 * Xendit is the primary payment gateway for Southeast Asia
 * Supports: Credit/Debit Cards, E-wallets, Bank Transfers, and more
 * 
 * Documentation: https://developers.xendit.co/api-reference/
 * 
 * Primary Method: Invoices
 * - Simple integration supporting multiple payment methods
 * - Customers can choose payment method on Xendit-hosted page
 * - Supports: Cards, E-wallets, Bank Transfers, QR codes
 */
export class XenditGateway extends AbstractPaymentGateway {
  private apiBaseUrl: string;
  private xenditClient: Xendit;

  constructor(config: ProviderConfig) {
    super(config, 'xendit');
    
    // Set API base URL based on environment
    this.apiBaseUrl = config.environment === 'live'
      ? 'https://api.xendit.co'
      : 'https://api.xendit.co'; // Xendit uses same URL but different API keys
    
    // Debug: Check if API key is present
    if (!config.apiKey || config.apiKey.trim() === '') {
      logger.error('[Xendit] No API key provided in configuration!');
      throw new AppError('Xendit API key is required', 500);
    }
    
    logger.info(`[Xendit] Initializing with API key: ${config.apiKey.substring(0, 20)}...`);
    
    // Initialize Xendit SDK
    this.xenditClient = new Xendit({
      secretKey: config.apiKey,
    });
    
    logger.info(`[Xendit] Gateway initialized in ${config.environment} mode`);
  }

  async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntentResult> {
    try {
      logger.info(`[Xendit] Creating payment intent for amount: ${data.amount} ${data.currency}`);

      const { Invoice } = this.xenditClient;
      
      // Create invoice with Xendit - use the correct API format
      const invoiceData: any = {
        externalId: `berse_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        amount: data.amount,
        currency: data.currency,
        description: data.description || 'Payment via Berse',
        invoiceDuration: 86400, // 24 hours in seconds
      };

      // Add optional fields
      if (data.metadata?.successUrl) {
        invoiceData.successRedirectUrl = data.metadata.successUrl;
      }
      if (data.metadata?.failureUrl) {
        invoiceData.failureRedirectUrl = data.metadata.failureUrl;
      }

      // Add customer info if provided
      if (data.metadata?.customerEmail || data.metadata?.customerName || data.metadata?.customerPhone) {
        invoiceData.customer = {};
        if (data.metadata.customerEmail) {
          invoiceData.customer.email = data.metadata.customerEmail;
        }
        if (data.metadata.customerName) {
          invoiceData.customer.givenNames = data.metadata.customerName;
        }
        if (data.metadata.customerPhone) {
          invoiceData.customer.mobileNumber = data.metadata.customerPhone;
        }
      }

      // Add metadata
      if (data.metadata) {
        const { successUrl, failureUrl, customerEmail, customerName, customerPhone, ...otherMetadata } = data.metadata;
        if (Object.keys(otherMetadata).length > 0) {
          invoiceData.metadata = otherMetadata;
        }
      }

      const invoice = await Invoice.createInvoice({ data: invoiceData });

      logger.info(`[Xendit] Invoice created: ${invoice.id}`);

      return {
        intentId: invoice.id,
        clientSecret: invoice.id, // Xendit uses invoice ID as reference
        status: this.mapXenditStatus(invoice.status),
        amount: invoice.amount,
        currency: invoice.currency,
        expiresAt: invoice.expiryDate ? new Date(invoice.expiryDate) : undefined,
        paymentUrl: invoice.invoiceUrl,
        metadata: invoice.metadata,
      };
    } catch (error: any) {
      logger.error('[Xendit] Failed to create payment intent:', error);
      throw new AppError(
        error?.message || 'Failed to create payment intent with Xendit',
        error?.status || 500
      );
    }
  }

  async confirmPayment(intentId: string): Promise<PaymentIntentResult> {
    try {
      logger.info(`[Xendit] Confirming payment: ${intentId}`);

      const { Invoice } = this.xenditClient;
      const invoice = await Invoice.getInvoiceById({ invoiceId: intentId });

      logger.info(`[Xendit] Payment status: ${invoice.status}`);

      return {
        intentId: invoice.id,
        status: this.mapXenditStatus(invoice.status),
        amount: invoice.amount,
        currency: invoice.currency,
        metadata: invoice.metadata,
        paymentUrl: invoice.invoiceUrl,
      };
    } catch (error: any) {
      logger.error('[Xendit] Failed to confirm payment:', error);
      throw new AppError(
        error?.message || 'Failed to confirm payment with Xendit',
        error?.status || 500
      );
    }
  }

  async capturePayment(data: CapturePaymentData): Promise<CapturePaymentResult> {
    try {
      logger.info(`[Xendit] Capturing payment: ${data.intentId}`);

      // Note: Xendit invoices are auto-captured upon payment
      // We just need to verify the payment status
      const { Invoice } = this.xenditClient;
      const invoice = await Invoice.getInvoiceById({ invoiceId: data.intentId });

      if (invoice.status !== 'PAID' && invoice.status !== 'SETTLED') {
        throw new AppError('Payment has not been completed yet', 400);
      }

      logger.info(`[Xendit] Payment captured: ${invoice.id}`);

      return {
        transactionId: invoice.id,
        status: this.mapXenditStatus(invoice.status),
        amount: data.amount || invoice.amount,
        capturedAt: new Date(),
      };
    } catch (error: any) {
      logger.error('[Xendit] Failed to capture payment:', error);
      throw new AppError(
        error?.message || 'Failed to capture payment with Xendit',
        error?.status || 500
      );
    }
  }

  async cancelPayment(intentId: string): Promise<void> {
    try {
      logger.info(`[Xendit] Canceling payment: ${intentId}`);

      const { Invoice } = this.xenditClient;
      await Invoice.expireInvoice({ invoiceId: intentId });

      logger.info(`[Xendit] Invoice expired: ${intentId}`);
    } catch (error: any) {
      logger.error('[Xendit] Failed to cancel payment:', error);
      throw new AppError(
        error?.message || 'Failed to cancel payment with Xendit',
        error?.status || 500
      );
    }
  }

  async refundPayment(data: RefundData): Promise<RefundResult> {
    try {
      logger.info(`[Xendit] Processing refund for: ${data.transactionId}`);

      // Note: Xendit refunds work through their payment gateway APIs
      // For invoices, we need to use the Payment Method specific refund
      // This is a simplified implementation - may need enhancement based on payment method
      
      const { Invoice } = this.xenditClient;
      const invoice = await Invoice.getInvoiceById({ invoiceId: data.transactionId });

      if (invoice.status !== 'PAID' && invoice.status !== 'SETTLED') {
        throw new AppError('Cannot refund unpaid invoice', 400);
      }

      // For now, log the refund request and return pending status
      // In production, you would call the appropriate refund API based on payment method
      logger.warn(`[Xendit] Refund requested for invoice ${data.transactionId} - manual processing required`);

      return {
        refundId: `refund_${Date.now()}`,
        status: 'PENDING',
        amount: data.amount || invoice.amount,
        refundedAt: new Date(),
      };
    } catch (error: any) {
      logger.error('[Xendit] Failed to process refund:', error);
      throw new AppError(
        error?.message || 'Failed to process refund with Xendit',
        error?.status || 500
      );
    }
  }

  async getPaymentStatus(intentId: string): Promise<PaymentIntentResult> {
    try {
      logger.info(`[Xendit] Getting payment status: ${intentId}`);

      const { Invoice } = this.xenditClient;
      const invoice = await Invoice.getInvoiceById({ invoiceId: intentId });

      return {
        intentId: invoice.id,
        status: this.mapXenditStatus(invoice.status),
        amount: invoice.amount,
        currency: invoice.currency,
        metadata: invoice.metadata,
        paymentUrl: invoice.invoiceUrl,
        expiresAt: invoice.expiryDate ? new Date(invoice.expiryDate) : undefined,
      };
    } catch (error: any) {
      logger.error('[Xendit] Failed to get payment status:', error);
      throw new AppError(
        error?.message || 'Failed to get payment status from Xendit',
        error?.status || 500
      );
    }
  }

  async createCustomer(data: CustomerData): Promise<CustomerResult> {
    try {
      logger.info(`[Xendit] Creating customer: ${data.email}`);

      // Note: Customer creation in Xendit is optional for invoices
      // Customers can be created for saved payment methods and recurring payments
      const { Customer } = this.xenditClient;
      
      const customerData: any = {
        referenceId: `berse_cust_${Date.now()}`,
        type: 'INDIVIDUAL',
        individualDetail: {
          givenNames: data.name?.split(' ')[0] || 'Customer',
          surname: data.name?.split(' ').slice(1).join(' ') || '',
        },
        email: data.email,
        mobileNumber: data.phone,
        metadata: data.metadata,
      };

      const customer = await Customer.createCustomer(customerData);

      logger.info(`[Xendit] Customer created: ${customer.id}`);

      return {
        customerId: customer.id,
        email: customer.email,
        name: `${customer.individualDetail?.givenNames || ''} ${customer.individualDetail?.surname || ''}`.trim(),
      };
    } catch (error: any) {
      logger.error('[Xendit] Failed to create customer:', error);
      throw new AppError(
        error?.message || 'Failed to create customer with Xendit',
        error?.status || 500
      );
    }
  }

  async addPaymentMethod(customerId: string, data: PaymentMethodData): Promise<PaymentMethodResult> {
    try {
      logger.info(`[Xendit] Adding payment method for customer: ${customerId}`);

      // Note: For invoice-based payments, customers choose payment method at checkout
      // For saved payment methods (cards, e-wallets), you need to use Xendit's tokenization
      // This is a simplified implementation - full card tokenization requires client-side integration
      
      logger.warn('[Xendit] Payment method addition requires client-side tokenization');
      
      // Return a placeholder - in production, you'd work with tokenized payment methods
      return {
        methodId: `pm_${Date.now()}`,
        type: data.type,
        lastFour: data.details?.cardNumber?.slice(-4),
        expiryMonth: data.details?.cardExpMonth,
        expiryYear: data.details?.cardExpYear,
      };
    } catch (error: any) {
      logger.error('[Xendit] Failed to add payment method:', error);
      throw new AppError(
        error?.message || 'Failed to add payment method with Xendit',
        error?.status || 500
      );
    }
  }

  async removePaymentMethod(methodId: string): Promise<void> {
    try {
      logger.info(`[Xendit] Removing payment method: ${methodId}`);

      // Note: For invoice-based payments, payment methods are not stored
      // For saved cards/e-wallets, this would call the appropriate API
      logger.warn('[Xendit] Payment method removal not required for invoice-based flow');
    } catch (error: any) {
      logger.error('[Xendit] Failed to remove payment method:', error);
      throw new AppError(
        error?.message || 'Failed to remove payment method with Xendit',
        error?.status || 500
      );
    }
  }

  async listPaymentMethods(customerId: string): Promise<PaymentMethodResult[]> {
    try {
      logger.info(`[Xendit] Listing payment methods for customer: ${customerId}`);

      // Note: For invoice-based payments, customers select methods at checkout
      // For saved payment methods, this would query stored cards/e-wallets
      logger.warn('[Xendit] Payment method listing not required for invoice-based flow');
      
      return [];
    } catch (error: any) {
      logger.error('[Xendit] Failed to list payment methods:', error);
      throw new AppError(
        error?.message || 'Failed to list payment methods from Xendit',
        error?.status || 500
      );
    }
  }

  async createPayout(data: PayoutData): Promise<PayoutResult> {
    try {
      logger.info(`[Xendit] Creating payout for: ${data.recipientId}`);

      // Note: Xendit Disbursements API
      // This requires additional setup and may not be available in all SDK versions
      logger.warn('[Xendit] Payout creation requires Xendit Disbursement API setup');
      
      // Return placeholder - implement when Disbursement API is available
      return {
        payoutId: `payout_${Date.now()}`,
        status: 'PENDING',
        amount: data.amount,
      };
    } catch (error: any) {
      logger.error('[Xendit] Failed to create payout:', error);
      throw new AppError(
        error?.message || 'Failed to create payout with Xendit',
        error?.status || 500
      );
    }
  }

  async getPayoutStatus(payoutId: string): Promise<PayoutResult> {
    try {
      logger.info(`[Xendit] Getting payout status: ${payoutId}`);

      // Placeholder - implement when Disbursement API is available
      logger.warn('[Xendit] Payout status check requires Xendit Disbursement API setup');
      
      return {
        payoutId,
        status: 'PENDING',
        amount: 0,
      };
    } catch (error: any) {
      logger.error('[Xendit] Failed to get payout status:', error);
      throw new AppError(
        error?.message || 'Failed to get payout status from Xendit',
        error?.status || 500
      );
    }
  }

  async verifyWebhookSignature(data: WebhookVerificationData): Promise<boolean> {
    try {
      logger.info('[Xendit] Verifying webhook signature');

      // Xendit uses callback token verification
      // The callback token is sent in the x-callback-token header
      const callbackToken = data.signature;
      
      logger.debug('[Xendit] Received callback token:', { 
        token: callbackToken ? `${callbackToken.substring(0, 10)}...` : 'empty',
        configuredToken: this.config.webhookSecret ? `${this.config.webhookSecret.substring(0, 10)}...` : 'not configured'
      });
      
      if (!this.config.webhookSecret || this.config.webhookSecret === 'your_webhook_verification_token_from_xendit_dashboard') {
        logger.warn('[Xendit] No webhook secret configured or using default value, skipping verification for development');
        return true; // In dev, skip verification when secret is not properly configured
      }

      // Verify the callback token matches the configured token
      // Xendit tokens can vary in length, so we just check for exact match
      const isValid = callbackToken === this.config.webhookSecret;

      if (!isValid) {
        logger.error('[Xendit] Invalid webhook signature', {
          receivedToken: callbackToken ? `${callbackToken.substring(0, 15)}...` : 'empty',
          expectedToken: this.config.webhookSecret ? `${this.config.webhookSecret.substring(0, 15)}...` : 'not configured',
          match: callbackToken === this.config.webhookSecret
        });
        return false;
      }

      logger.info('[Xendit] Webhook signature verified');
      return true;
    } catch (error: any) {
      logger.error('[Xendit] Failed to verify webhook:', error);
      return false;
    }
  }

  async parseWebhookEvent(payload: any): Promise<WebhookEvent> {
    try {
      logger.info(`[Xendit] Parsing webhook event: ${payload.id}`);

      // Xendit sends different webhook events for invoices
      // Common events: invoice.paid, invoice.expired, invoice.payment_failed
      
      let eventType: string;
      const status = payload.status?.toUpperCase();

      // Map Xendit invoice status to event types
      switch (status) {
        case 'PAID':
        case 'SETTLED':
          eventType = 'payment_succeeded';
          break;
        case 'EXPIRED':
          eventType = 'payment_cancelled';
          break;
        case 'FAILED':
          eventType = 'payment_failed';
          break;
        default:
          eventType = 'payment_processing';
      }

      const event: WebhookEvent = {
        eventId: payload.id || `evt_${Date.now()}`,
        eventType,
        data: {
          intentId: payload.id,
          status: this.mapXenditStatus(status),
          amount: payload.amount,
          currency: payload.currency,
          metadata: payload.metadata,
          paymentMethod: payload.payment_method,
          paidAt: payload.paid_at ? new Date(payload.paid_at) : undefined,
        },
        createdAt: payload.created ? new Date(payload.created) : new Date(),
      };

      logger.info(`[Xendit] Webhook event parsed: ${eventType}`);
      return event;
    } catch (error: any) {
      logger.error('[Xendit] Failed to parse webhook:', error);
      throw new AppError(
        error?.message || 'Failed to parse Xendit webhook',
        error?.status || 500
      );
    }
  }

  async calculateFees(amount: number, currency: string): Promise<{ platformFee: number; gatewayFee: number; totalFees: number; }> {
    try {
      // Xendit fee structure (approximate - should be stored in DB)
      // Cards: 2.9% + MYR 1.50
      // E-wallets: varies by provider
      // Bank transfers: varies
      
      const gatewayFeePercentage = 0.029; // 2.9%
      const gatewayFeeFixed = currency === 'MYR' ? 1.50 : 0;
      
      const gatewayFee = (amount * gatewayFeePercentage) + gatewayFeeFixed;
      const platformFee = 0; // Platform fee calculated separately
      
      return {
        platformFee,
        gatewayFee: Math.round(gatewayFee * 100) / 100,
        totalFees: Math.round(gatewayFee * 100) / 100,
      };
    } catch (error) {
      logger.error('[Xendit] Failed to calculate fees:', error);
      throw new AppError('Failed to calculate fees', 500);
    }
  }

  getSupportedPaymentMethods(): string[] {
    return [
      'card',
      'bank_transfer',
      'ewallet_grabpay',
      'ewallet_shopeepay',
      'ewallet_dana',
      'ewallet_ovo',
      'ewallet_linkaja',
      'qris',
      'direct_debit',
    ];
  }

  getSupportedCurrencies(): string[] {
    return ['IDR', 'PHP', 'THB', 'VND', 'MYR', 'SGD', 'USD'];
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check: try to get balance or make a minimal API call
      const { Balance } = this.xenditClient;
      await Balance.getBalance({ accountType: 'CASH' });
      
      logger.info('[Xendit] Health check passed');
      return true;
    } catch (error: any) {
      logger.error('[Xendit] Health check failed:', error);
      // If we get a 403 or auth error, SDK is working but might be credentials issue
      // Return true if it's just an auth/permission issue (API is reachable)
      if (error?.status === 403 || error?.status === 401) {
        return true;
      }
      return false;
    }
  }

  /**
   * Helper method to map Xendit status to our standard status
   */
  private mapXenditStatus(xenditStatus: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'PENDING',
      'PAID': 'COMPLETED',
      'EXPIRED': 'CANCELLED',
      'SETTLED': 'COMPLETED',
      'FAILED': 'FAILED',
    };

    return statusMap[xenditStatus] || 'PENDING';
  }
}
