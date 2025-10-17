/**
 * Abstract Payment Gateway Interface
 * 
 * This defines the contract that all payment gateway providers must implement.
 * Each provider (Xendit, Stripe, PayPal, etc.) will have its own implementation.
 */

export interface PaymentIntentData {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  customerId?: string;
  paymentMethodId?: string;
}

export interface PaymentIntentResult {
  intentId: string;
  clientSecret?: string;
  status: string;
  amount: number;
  currency: string;
  expiresAt?: Date;
  paymentUrl?: string;
  metadata?: Record<string, any>;
}

export interface CapturePaymentData {
  intentId: string;
  amount?: number;
}

export interface CapturePaymentResult {
  transactionId: string;
  status: string;
  amount: number;
  capturedAt: Date;
}

export interface RefundData {
  transactionId: string;
  amount?: number;
  reason: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  refundId: string;
  status: string;
  amount: number;
  refundedAt: Date;
}

export interface PaymentMethodData {
  customerId?: string;
  type: 'card' | 'bank_account' | 'ewallet' | 'crypto';
  details: {
    // Card details
    cardNumber?: string;
    cardExpMonth?: number;
    cardExpYear?: number;
    cardCvv?: string;
    // Bank account details
    accountNumber?: string;
    bankCode?: string;
    accountHolderName?: string;
    // E-wallet details
    ewalletType?: string;
    phoneNumber?: string;
    // Crypto details
    walletAddress?: string;
    network?: string;
  };
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
}

export interface PaymentMethodResult {
  methodId: string;
  type: string;
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  ewalletType?: string;
}

export interface CustomerData {
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface CustomerResult {
  customerId: string;
  email: string;
  name: string;
}

export interface PayoutData {
  recipientId: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PayoutResult {
  payoutId: string;
  status: string;
  amount: number;
  estimatedArrival?: Date;
}

export interface WebhookVerificationData {
  signature: string;
  payload: string | Buffer;
  headers?: Record<string, string>;
}

export interface WebhookEvent {
  eventType: string;
  eventId: string;
  data: any;
  createdAt: Date;
}

export interface ProviderConfig {
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  environment: 'test' | 'live';
  apiVersion?: string;
  timeout?: number;
  retryAttempts?: number;
  [key: string]: any; // Allow provider-specific config
}

/**
 * Abstract Payment Gateway
 * All payment providers must extend this class
 */
export abstract class AbstractPaymentGateway {
  protected config: ProviderConfig;
  protected providerName: string;

  constructor(config: ProviderConfig, providerName: string) {
    this.config = config;
    this.providerName = providerName;
  }

  /**
   * Create a payment intent
   * This initializes a payment and returns data needed by the client
   */
  abstract createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntentResult>;

  /**
   * Confirm a payment
   * Called after client-side payment is completed
   */
  abstract confirmPayment(intentId: string): Promise<PaymentIntentResult>;

  /**
   * Capture an authorized payment
   * For two-step payment flows (authorize then capture)
   */
  abstract capturePayment(data: CapturePaymentData): Promise<CapturePaymentResult>;

  /**
   * Cancel/void a payment intent
   * Before it's captured or confirmed
   */
  abstract cancelPayment(intentId: string): Promise<void>;

  /**
   * Refund a completed payment
   * Can be full or partial refund
   */
  abstract refundPayment(data: RefundData): Promise<RefundResult>;

  /**
   * Get payment status
   * Retrieve current status of a payment
   */
  abstract getPaymentStatus(intentId: string): Promise<PaymentIntentResult>;

  /**
   * Create a customer
   * Store customer information in the gateway
   */
  abstract createCustomer(data: CustomerData): Promise<CustomerResult>;

  /**
   * Add payment method to customer
   * Tokenize and store payment method
   */
  abstract addPaymentMethod(customerId: string, data: PaymentMethodData): Promise<PaymentMethodResult>;

  /**
   * Remove payment method
   * Delete stored payment method
   */
  abstract removePaymentMethod(methodId: string): Promise<void>;

  /**
   * List customer payment methods
   * Get all stored payment methods for a customer
   */
  abstract listPaymentMethods(customerId: string): Promise<PaymentMethodResult[]>;

  /**
   * Create a payout
   * Transfer funds to recipient
   */
  abstract createPayout(data: PayoutData): Promise<PayoutResult>;

  /**
   * Get payout status
   * Check status of a payout
   */
  abstract getPayoutStatus(payoutId: string): Promise<PayoutResult>;

  /**
   * Verify webhook signature
   * Validate that webhook came from the payment provider
   */
  abstract verifyWebhookSignature(data: WebhookVerificationData): Promise<boolean>;

  /**
   * Parse webhook event
   * Convert provider-specific webhook to standard format
   */
  abstract parseWebhookEvent(payload: any): Promise<WebhookEvent>;

  /**
   * Calculate fees
   * Get provider's fee structure for a transaction
   */
  abstract calculateFees(amount: number, currency: string): Promise<{
    platformFee: number;
    gatewayFee: number;
    totalFees: number;
  }>;

  /**
   * Get supported payment methods
   * Return list of payment methods this provider supports
   */
  abstract getSupportedPaymentMethods(): string[];

  /**
   * Get supported currencies
   * Return list of currencies this provider supports
   */
  abstract getSupportedCurrencies(): string[];

  /**
   * Health check
   * Verify provider API is accessible
   */
  abstract healthCheck(): Promise<boolean>;

  /**
   * Get provider name
   */
  getProviderName(): string {
    return this.providerName;
  }

  /**
   * Get provider configuration (sanitized)
   */
  getConfig(): Partial<ProviderConfig> {
    return {
      environment: this.config.environment,
      apiVersion: this.config.apiVersion,
      timeout: this.config.timeout,
    };
  }
}
