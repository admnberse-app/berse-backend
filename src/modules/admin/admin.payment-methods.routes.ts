import { Router } from 'express';
import paymentMethodsController from '../payments/payment-methods.controller';
import { authenticateToken } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../middleware/validation';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

// ============================================================================
// PAYMENT METHOD MANAGEMENT
// ============================================================================

/**
 * GET /admin/payment-methods
 * List all payment methods (including inactive)
 */
router.get(
  '/payment-methods',
  asyncHandler(paymentMethodsController.getAllPaymentMethods.bind(paymentMethodsController))
);

/**
 * POST /admin/payment-methods
 * Create new payment method
 */
router.post(
  '/payment-methods',
  [
    body('methodType').notEmpty().isIn(['gateway', 'manual_bank', 'manual_ewallet', 'manual_cash']),
    body('methodCode').notEmpty().trim(),
    body('methodName').notEmpty().trim(),
    body('displayName').notEmpty().trim(),
    body('category').notEmpty().trim(),
    body('availableCurrencies').optional().isArray(),
    body('accountDetails').optional().isObject(),
  ],
  handleValidationErrors,
  asyncHandler(paymentMethodsController.createPaymentMethod.bind(paymentMethodsController))
);

/**
 * PUT /admin/payment-methods/:id
 * Update payment method
 */
router.put(
  '/payment-methods/:id',
  [
    param('id').notEmpty(),
    body('methodName').optional().trim(),
    body('displayName').optional().trim(),
    body('accountDetails').optional().isObject(),
  ],
  handleValidationErrors,
  asyncHandler(paymentMethodsController.updatePaymentMethod.bind(paymentMethodsController))
);

/**
 * DELETE /admin/payment-methods/:id
 * Deactivate payment method
 */
router.delete(
  '/payment-methods/:id',
  [param('id').notEmpty()],
  handleValidationErrors,
  asyncHandler(paymentMethodsController.deletePaymentMethod.bind(paymentMethodsController))
);

export const adminPaymentRoutes = router;
