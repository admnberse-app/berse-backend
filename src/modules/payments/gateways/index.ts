/**
 * Payment Gateway Abstraction Layer
 * 
 * This module provides a provider-agnostic interface for payment processing.
 * It allows easy switching between payment providers (Xendit, Stripe, etc.)
 * without changing business logic.
 */

export * from './AbstractPaymentGateway';
export * from './PaymentGatewayFactory';
export * from './XenditGateway';
export * from './StripeGateway';
