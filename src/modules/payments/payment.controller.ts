import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { sendSuccess } from '../../utils/response';
import type {
  CreatePaymentIntentInput,
  ConfirmPaymentInput,
  RefundPaymentInput,
  CapturePaymentInput,
  AddPaymentMethodInput,
  UpdatePaymentMethodInput,
  PaymentTransactionQuery,
  PayoutQuery,
  WebhookEvent,
  FeeCalculationInput,
} from './payment.types';

const paymentService = new PaymentService();

export class PaymentController {
  // ============================================================================
  // PAYMENT INTENT & TRANSACTIONS
  // ============================================================================

  /**
   * @route POST /v2/payments/intent
   * @desc Create a payment intent
   * @access Private
   */
  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const input: CreatePaymentIntentInput = req.body;

    const intent = await paymentService.createPaymentIntent(userId, input);
    sendSuccess(res, intent, 'Payment intent created successfully', 201);
  }

  /**
   * @route POST /v2/payments/confirm
   * @desc Confirm a payment
   * @access Private
   */
  async confirmPayment(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const input: ConfirmPaymentInput = req.body;

    const transaction = await paymentService.confirmPayment(userId, input);
    sendSuccess(res, transaction, 'Payment confirmed successfully');
  }

  /**
   * @route POST /v2/payments/:transactionId/capture
   * @desc Capture an authorized payment
   * @access Private
   */
  async capturePayment(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { transactionId } = req.params;
    const { amount } = req.body;

    const transaction = await paymentService.capturePayment(userId, transactionId, amount);
    sendSuccess(res, transaction, 'Payment captured successfully');
  }

  /**
   * @route POST /v2/payments/:transactionId/refund
   * @desc Refund a payment
   * @access Private
   */
  async refundPayment(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { transactionId } = req.params;
    const input: RefundPaymentInput = { ...req.body, transactionId };

    const transaction = await paymentService.refundPayment(userId, input);
    sendSuccess(res, transaction, 'Payment refunded successfully');
  }

  /**
   * @route GET /v2/payments/:transactionId
   * @desc Get transaction details
   * @access Private
   */
  async getTransaction(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { transactionId } = req.params;

    const transaction = await paymentService.getTransaction(transactionId, userId);
    sendSuccess(res, transaction);
  }

  /**
   * @route GET /v2/payments/transactions
   * @desc Get user's transactions with filters
   * @access Private
   */
  async getUserTransactions(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const query: PaymentTransactionQuery = req.query;

    const result = await paymentService.getUserTransactions(userId, query);
    sendSuccess(res, result);
  }

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  /**
   * @route POST /v2/payments/methods
   * @desc Add a payment method
   * @access Private
   */
  async addPaymentMethod(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const input: AddPaymentMethodInput = req.body;

    const method = await paymentService.addPaymentMethod(userId, input);
    sendSuccess(res, method, 'Payment method added successfully', 201);
  }

  /**
   * @route PUT /v2/payments/methods/:paymentMethodId
   * @desc Update a payment method
   * @access Private
   */
  async updatePaymentMethod(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { paymentMethodId } = req.params;
    const input: UpdatePaymentMethodInput = { ...req.body, paymentMethodId };

    const method = await paymentService.updatePaymentMethod(userId, input);
    sendSuccess(res, method, 'Payment method updated successfully');
  }

  /**
   * @route DELETE /v2/payments/methods/:paymentMethodId
   * @desc Delete a payment method
   * @access Private
   */
  async deletePaymentMethod(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { paymentMethodId } = req.params;

    await paymentService.deletePaymentMethod(userId, paymentMethodId);
    sendSuccess(res, null, 'Payment method deleted successfully');
  }

  /**
   * @route GET /v2/payments/methods
   * @desc Get user's payment methods
   * @access Private
   */
  async getPaymentMethods(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const methods = await paymentService.getPaymentMethods(userId);
    sendSuccess(res, methods);
  }

  // ============================================================================
  // PAYOUTS
  // ============================================================================

  /**
   * @route GET /v2/payments/payouts
   * @desc Get user's payouts
   * @access Private
   */
  async getUserPayouts(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const query: PayoutQuery = req.query;

    const result = await paymentService.getUserPayouts(userId, query);
    sendSuccess(res, result);
  }

  // ============================================================================
  // FEE CALCULATION
  // ============================================================================

  /**
   * @route POST /v2/payments/calculate-fees
   * @desc Calculate transaction fees
   * @access Public
   */
  async calculateFees(req: Request, res: Response): Promise<void> {
    const input: FeeCalculationInput = req.body;

    const fees = await paymentService.calculateFees(input);
    sendSuccess(res, fees);
  }

  // ============================================================================
  // WEBHOOKS
  // ============================================================================

  /**
   * @route POST /v2/payments/webhooks/:provider
   * @desc Handle payment provider webhooks
   * @access Public (signature verified)
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const { provider } = req.params;
    const event: WebhookEvent = {
      provider,
      ...req.body,
    };

    await paymentService.handleWebhook(event);
    sendSuccess(res, null, 'Webhook processed');
  }
}
