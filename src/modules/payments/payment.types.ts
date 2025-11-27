import { PaymentStatus, TransactionType } from '@prisma/client';

// ============================================================================
// PAYMENT TRANSACTION TYPES
// ============================================================================

export interface CreatePaymentIntentInput {
  amount: number;
  currency?: string;
  transactionType: TransactionType;
  referenceType: string;
  referenceId: string;
  providerId?: string;
  paymentMethod?: string; // Method code like 'xendit', 'bank_maybank', etc.
  description?: string;
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentInput {
  transactionId: string;
  gatewayTransactionId: string;
  gatewayMetadata?: Record<string, any>;
}

export interface RefundPaymentInput {
  transactionId: string;
  amount?: number;
  reason: string;
}

export interface CapturePaymentInput {
  transactionId: string;
  amount?: number;
}

// ============================================================================
// PAYMENT METHOD TYPES
// ============================================================================

export interface AddPaymentMethodInput {
  provider: string;
  type: string;
  gatewayMethodId: string;
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export interface UpdatePaymentMethodInput {
  paymentMethodId: string;
  isDefault?: boolean;
}

//============================================================================
// PAYMENT QUERY TYPES
// ============================================================================

export interface PaymentTransactionQuery {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  transactionType?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  providerId?: string;
}

export interface PayoutQuery {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  recipientType?: string;
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// PAYMENT RESPONSE TYPES
// ============================================================================

export interface PaymentTransactionResponse {
  id: string;
  userId: string;
  transactionType: TransactionType;
  referenceType: string;
  referenceId: string;
  amount: number;
  currency: string;
  platformFee: number;
  gatewayFee: number;
  totalFees: number;
  netAmount: number;
  providerId: string;
  providerName?: string;
  gatewayTransactionId: string;
  status: PaymentStatus;
  failureReason?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  processedAt?: string;
  refundedAmount?: number;
  refundedAt?: string;
}

export interface PaymentIntentResponse {
  transactionId: string;
  clientSecret?: string;
  paymentUrl?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  providerId?: string;
  expiresAt?: string;
  // Manual payment fields
  requiresProof?: boolean;
  paymentMethod?: string;
  paymentInstructions?: Record<string, any>;
  uploadDeadline?: string;
  processingTime?: string;
}

export interface PaymentMethodResponse {
  id: string;
  provider: string;
  type: string;
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface PayoutResponse {
  id: string;
  paymentTransactionId: string;
  recipientId: string;
  recipientType: string;
  amount: number;
  currency: string;
  status: string;
  releaseDate?: string;
  gatewayPayoutId?: string;
  createdAt: string;
  releasedAt?: string;
}

export interface PaginatedTransactionsResponse {
  transactions: PaymentTransactionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalAmount: number;
    totalFees: number;
    totalRefunded: number;
    successCount: number;
    pendingCount: number;
    failedCount: number;
  };
}

export interface PaginatedPayoutsResponse {
  payouts: PayoutResponse[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  summary?: {
    totalAmount: number;
    pendingAmount: number;
    completedAmount: number;
  };
}

// ============================================================================
// PAYMENT WEBHOOK TYPES
// ============================================================================

export interface WebhookEvent {
  provider: string;
  eventType: string;
  eventId: string;
  data: Record<string, any>;
  timestamp: string;
  signature?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  provider: string;
  eventType: string;
  data?: Record<string, any>;
}

// ============================================================================
// FEE CALCULATION TYPES
// ============================================================================

export interface FeeCalculationInput {
  amount: number;
  transactionType: TransactionType;
  providerId: string;
}

export interface FeeCalculationResponse {
  platformFee: number;
  gatewayFee: number;
  totalFees: number;
  netAmount: number;
  feeBreakdown: {
    platformFeePercentage?: number;
    platformFeeFixed?: number;
    gatewayFeePercentage?: number;
    gatewayFeeFixed?: number;
  };
}
