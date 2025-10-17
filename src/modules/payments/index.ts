// Main payments module exports
export { PaymentController } from './payment.controller';
export { PaymentService } from './payment.service';
export { paymentRoutes } from './payment.routes';

// Gateway abstraction layer exports
export {
  AbstractPaymentGateway,
  PaymentGatewayFactory,
  XenditGateway,
  StripeGateway,
} from './gateways';

export type {
  CreatePaymentIntentInput,
  ConfirmPaymentInput,
  RefundPaymentInput,
  CapturePaymentInput,
  AddPaymentMethodInput,
  UpdatePaymentMethodInput,
  PaymentTransactionQuery,
  PayoutQuery,
  PaymentTransactionResponse,
  PaymentIntentResponse,
  PaymentMethodResponse,
  PayoutResponse,
  PaginatedTransactionsResponse,
  PaginatedPayoutsResponse,
  WebhookEvent,
  WebhookVerificationResult,
  FeeCalculationInput,
  FeeCalculationResponse,
} from './payment.types';

// Gateway types
export type {
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
  ProviderConfig,
} from './gateways';
