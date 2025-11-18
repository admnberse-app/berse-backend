import { Response } from 'express';
import { AuthRequest } from '../../types';
import paymentMethodsService from './payment-methods.service';
import { sendSuccess } from '../../utils/response';

/**
 * @swagger
 * tags:
 *   name: Payment Methods
 *   description: Payment method configuration and management
 */

export class PaymentMethodsController {
  /**
   * @swagger
   * /v2/payments/methods:
   *   get:
   *     summary: Get available payment methods
   *     description: Returns list of active payment methods available for the user
   *     tags: [Payment Methods]
   *     parameters:
   *       - in: query
   *         name: country
   *         schema:
   *           type: string
   *         description: Filter by country code (e.g., MY, SG)
   *       - in: query
   *         name: currency
   *         schema:
   *           type: string
   *         description: Filter by currency (e.g., MYR, SGD)
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category (bank_transfer, ewallet, online_gateway)
   *       - in: query
   *         name: amount
   *         schema:
   *           type: number
   *         description: Filter by amount (respects min/max limits)
   *     responses:
   *       200:
   *         description: Payment methods retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       methodCode:
   *                         type: string
   *                       methodName:
   *                         type: string
   *                       displayName:
   *                         type: string
   *                       category:
   *                         type: string
   *                       requiresProof:
   *                         type: boolean
   *                       processingTime:
   *                         type: string
   */
  async getAvailablePaymentMethods(req: AuthRequest, res: Response): Promise<void> {
    const { country, currency, category, amount } = req.query;

    const methods = await paymentMethodsService.getAvailablePaymentMethods({
      country: country as string,
      currency: currency as string,
      category: category as string,
      amount: amount ? parseFloat(amount as string) : undefined,
    });

    sendSuccess(res, methods, 'Payment methods retrieved successfully');
  }

  /**
   * @swagger
   * /v2/payments/methods/{methodCode}:
   *   get:
   *     summary: Get payment method details
   *     description: Returns full details including account information for manual methods
   *     tags: [Payment Methods]
   *     parameters:
   *       - in: path
   *         name: methodCode
   *         required: true
   *         schema:
   *           type: string
   *         description: Payment method code (e.g., xendit, bank_maybank)
   *     responses:
   *       200:
   *         description: Payment method details retrieved
   *       404:
   *         description: Payment method not found
   */
  async getPaymentMethodByCode(req: AuthRequest, res: Response): Promise<void> {
    const { methodCode } = req.params;

    const method = await paymentMethodsService.getPaymentMethodByCode(methodCode);

    sendSuccess(res, method, 'Payment method details retrieved successfully');
  }

  /**
   * @swagger
   * /admin/payment-methods:
   *   get:
   *     summary: Get all payment methods (Admin)
   *     tags: [Payment Methods, Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *         description: Include inactive methods
   *     responses:
   *       200:
   *         description: All payment methods retrieved
   */
  async getAllPaymentMethods(req: AuthRequest, res: Response): Promise<void> {
    const { includeInactive } = req.query;

    const methods = await paymentMethodsService.getAllPaymentMethods(
      includeInactive === 'true'
    );

    sendSuccess(res, methods, 'Payment methods retrieved successfully');
  }

  /**
   * @swagger
   * /admin/payment-methods:
   *   post:
   *     summary: Create payment method (Admin)
   *     tags: [Payment Methods, Admin]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - methodType
   *               - methodCode
   *               - methodName
   *               - displayName
   *               - category
   *             properties:
   *               methodType:
   *                 type: string
   *                 enum: [gateway, manual_bank, manual_ewallet, manual_cash]
   *               methodCode:
   *                 type: string
   *               methodName:
   *                 type: string
   *               displayName:
   *                 type: string
   *               category:
   *                 type: string
   *               accountDetails:
   *                 type: object
   *     responses:
   *       201:
   *         description: Payment method created
   */
  async createPaymentMethod(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const input = req.body;

    const method = await paymentMethodsService.createPaymentMethod(input, userId);

    sendSuccess(res, method, 'Payment method created successfully', 201);
  }

  /**
   * @swagger
   * /admin/payment-methods/{id}:
   *   put:
   *     summary: Update payment method (Admin)
   *     tags: [Payment Methods, Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Payment method updated
   */
  async updatePaymentMethod(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;
    const input = req.body;

    const method = await paymentMethodsService.updatePaymentMethod(id, input, userId);

    sendSuccess(res, method, 'Payment method updated successfully');
  }

  /**
   * @swagger
   * /admin/payment-methods/{id}:
   *   delete:
   *     summary: Delete payment method (Admin)
   *     tags: [Payment Methods, Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Payment method deleted
   */
  async deletePaymentMethod(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;

    await paymentMethodsService.deletePaymentMethod(id, userId);

    sendSuccess(res, null, 'Payment method deleted successfully');
  }
}

export default new PaymentMethodsController();
