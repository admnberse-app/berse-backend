/**
 * Subscription Module
 * Complete subscription management system with dual-gating (Subscription + Trust)
 */

// Types
export * from './subscription.types';

// Services
export { default as SubscriptionService } from './subscription.service';
export { default as AccessControlService } from './access-control/access-control.service';
export { default as SubscriptionPaymentService } from './payments/subscription-payment.service';

// Controller
export { default as SubscriptionController } from './subscription.controller';

// Routes
export { default as subscriptionRoutes } from './subscription.routes';

// Utilities
export * from './subscription.utils';

// Payment types
export type { PaymentGateway, PaymentIntent, SubscriptionPaymentData } from './payments/subscription-payment.service';
