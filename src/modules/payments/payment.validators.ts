import { body, param, query } from 'express-validator';
import { TransactionType, PaymentStatus } from '@prisma/client';

// ============================================================================
// PAYMENT TRANSACTION VALIDATORS
// ============================================================================

export const createPaymentIntentValidators = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
    .toFloat(),
  
  body('currency')
    .optional()
    .trim()
    .isIn(['MYR', 'USD', 'SGD']).withMessage('Invalid currency'),
  
  body('transactionType')
    .trim()
    .notEmpty().withMessage('Transaction type is required')
    .isIn(Object.values(TransactionType))
    .withMessage('Invalid transaction type'),
  
  body('referenceType')
    .trim()
    .notEmpty().withMessage('Reference type is required')
    .customSanitizer(value => value.toLowerCase())
    .isIn(['event_ticket', 'event', 'marketplace_order', 'service_booking', 'subscription', 'subscription_tier', 'homesurf', 'berseguide', 'donation'])
    .withMessage('Invalid reference type'),
  
  body('referenceId')
    .trim()
    .notEmpty().withMessage('Reference ID is required')
    .isString().withMessage('Reference ID must be a string'),
  
  body('providerId')
    .optional()
    .trim()
    .isString().withMessage('Provider ID must be a string'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  body('metadata')
    .optional()
    .isObject().withMessage('Metadata must be an object'),
];

export const confirmPaymentValidators = [
  body('transactionId')
    .trim()
    .notEmpty().withMessage('Transaction ID is required')
    .isString().withMessage('Transaction ID must be a string'),
  
  body('gatewayTransactionId')
    .optional()
    .trim()
    .isString().withMessage('Gateway transaction ID must be a string'),
  
  body('gatewayMetadata')
    .optional()
    .isObject().withMessage('Gateway metadata must be an object'),
];

export const refundPaymentValidators = [
  param('transactionId')
    .trim()
    .notEmpty().withMessage('Transaction ID is required'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
    .toFloat(),
  
  body('reason')
    .trim()
    .notEmpty().withMessage('Refund reason is required')
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
];

export const capturePaymentValidators = [
  param('transactionId')
    .trim()
    .notEmpty().withMessage('Transaction ID is required'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
    .toFloat(),
];

export const transactionIdValidator = [
  param('transactionId')
    .trim()
    .notEmpty().withMessage('Transaction ID is required')
    .isString().withMessage('Transaction ID must be a string'),
];

// ============================================================================
// PAYMENT METHOD VALIDATORS
// ============================================================================

export const addPaymentMethodValidators = [
  body('provider')
    .trim()
    .notEmpty().withMessage('Provider is required')
    .isString().withMessage('Provider must be a string'),
  
  body('type')
    .trim()
    .notEmpty().withMessage('Payment method type is required')
    .isIn(['card', 'bank_account', 'ewallet', 'crypto'])
    .withMessage('Invalid payment method type'),
  
  body('gatewayMethodId')
    .trim()
    .notEmpty().withMessage('Gateway method ID is required')
    .isString().withMessage('Gateway method ID must be a string'),
  
  body('lastFour')
    .optional()
    .trim()
    .isLength({ min: 4, max: 4 }).withMessage('Last four digits must be exactly 4 characters'),
  
  body('expiryMonth')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Expiry month must be between 1 and 12')
    .toInt(),
  
  body('expiryYear')
    .optional()
    .isInt({ min: 2024, max: 2050 }).withMessage('Invalid expiry year')
    .toInt(),
  
  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault must be a boolean')
    .toBoolean(),
];

export const updatePaymentMethodValidators = [
  param('paymentMethodId')
    .trim()
    .notEmpty().withMessage('Payment method ID is required'),
  
  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault must be a boolean')
    .toBoolean(),
];

export const paymentMethodIdValidator = [
  param('paymentMethodId')
    .trim()
    .notEmpty().withMessage('Payment method ID is required')
    .isString().withMessage('Payment method ID must be a string'),
];

// ============================================================================
// QUERY VALIDATORS
// ============================================================================

export const paymentTransactionQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('status')
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage('Invalid payment status'),
  
  query('transactionType')
    .optional()
    .isIn(Object.values(TransactionType))
    .withMessage('Invalid transaction type'),
  
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format')
    .toDate(),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format')
    .toDate(),
  
  query('minAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Min amount must be greater than or equal to 0')
    .toFloat(),
  
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Max amount must be greater than or equal to 0')
    .toFloat(),
  
  query('providerId')
    .optional()
    .trim()
    .isString().withMessage('Provider ID must be a string'),
];

export const payoutQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('status')
    .optional()
    .isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
    .withMessage('Invalid payout status'),
  
  query('recipientType')
    .optional()
    .trim()
    .isString().withMessage('Recipient type must be a string'),
  
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format')
    .toDate(),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format')
    .toDate(),
];

// ============================================================================
// WEBHOOK VALIDATORS
// ============================================================================

export const webhookValidators = [
  param('provider')
    .trim()
    .notEmpty().withMessage('Provider is required')
    .isIn(['xendit', 'stripe']).withMessage('Invalid provider'),
];
