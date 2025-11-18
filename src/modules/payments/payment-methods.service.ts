import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';
import prisma from '../../lib/prisma';

export interface PaymentMethodResponse {
  id: string;
  methodCode: string;
  methodName: string;
  displayName: string;
  description?: string;
  category: string;
  iconUrl?: string;
  methodType: string;
  requiresProof: boolean;
  processingTime?: string;
  availableCountries: string[];
  availableCurrencies: string[];
  minAmount?: number;
  maxAmount?: number;
  // Account details included for manual methods
  accountDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    swiftCode?: string;
    branchName?: string;
    walletType?: string;
    phoneNumber?: string;
    qrCodeUrl?: string;
    instructions?: string;
    [key: string]: any;
  };
}

export interface CreatePaymentMethodInput {
  methodType: string;
  methodCode: string;
  methodName: string;
  displayName: string;
  description?: string;
  category: string;
  iconUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  isDefault?: boolean;
  availableCountries?: string[];
  availableCurrencies?: string[];
  providerId?: string;
  accountDetails?: Record<string, any>;
  requiresProof?: boolean;
  autoApprove?: boolean;
  processingTime?: string;
  feePercentage?: number;
  feeFixed?: number;
  minAmount?: number;
  maxAmount?: number;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentMethodInput {
  methodName?: string;
  displayName?: string;
  description?: string;
  category?: string;
  iconUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  isDefault?: boolean;
  availableCountries?: string[];
  availableCurrencies?: string[];
  accountDetails?: Record<string, any>;
  requiresProof?: boolean;
  autoApprove?: boolean;
  processingTime?: string;
  feePercentage?: number;
  feeFixed?: number;
  minAmount?: number;
  maxAmount?: number;
  metadata?: Record<string, any>;
}

export class PaymentMethodsService {
  /**
   * Get available payment methods (user-facing)
   * Returns only active methods, ordered by displayOrder
   */
  async getAvailablePaymentMethods(filters?: {
    country?: string;
    currency?: string;
    category?: string;
    amount?: number;
  }): Promise<PaymentMethodResponse[]> {
    try {
      logger.info('[PaymentMethodsService] Fetching available payment methods', { filters });

      const where: any = {
        isActive: true,
      };

      // Filter by category if provided
      if (filters?.category) {
        where.category = filters.category;
      }

      // Fetch all active methods
      const methods = await prisma.paymentMethodConfig.findMany({
        where,
        orderBy: [
          { displayOrder: 'asc' },
          { methodName: 'asc' },
        ],
      });

      // Filter by country/currency/amount in code (more flexible)
      let filteredMethods = methods;

      if (filters?.country) {
        filteredMethods = filteredMethods.filter(m => 
          m.availableCountries.length === 0 || 
          m.availableCountries.includes(filters.country!)
        );
      }

      if (filters?.currency) {
        filteredMethods = filteredMethods.filter(m => 
          m.availableCurrencies.includes(filters.currency!)
        );
      }

      if (filters?.amount) {
        filteredMethods = filteredMethods.filter(m => {
          if (m.minAmount && filters.amount! < m.minAmount) return false;
          if (m.maxAmount && filters.amount! > m.maxAmount) return false;
          return true;
        });
      }

      return filteredMethods.map(method => this.formatPaymentMethodResponse(method));
    } catch (error: any) {
      logger.error('[PaymentMethodsService] Error fetching payment methods:', error);
      throw new AppError('Failed to fetch payment methods', 500);
    }
  }

  /**
   * Get payment method by code
   * Returns full details including account information
   */
  async getPaymentMethodByCode(methodCode: string): Promise<PaymentMethodResponse> {
    try {
      logger.info('[PaymentMethodsService] Fetching payment method:', methodCode);

      const method = await prisma.paymentMethodConfig.findUnique({
        where: { methodCode },
      });

      if (!method) {
        throw new AppError('Payment method not found', 404);
      }

      if (!method.isActive) {
        throw new AppError('Payment method is not available', 400);
      }

      return this.formatPaymentMethodResponse(method, true);
    } catch (error: any) {
      logger.error('[PaymentMethodsService] Error fetching payment method:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch payment method details', 500);
    }
  }

  /**
   * Admin: Get all payment methods
   */
  async getAllPaymentMethods(includeInactive = false): Promise<PaymentMethodResponse[]> {
    try {
      const where = includeInactive ? {} : { isActive: true };

      const methods = await prisma.paymentMethodConfig.findMany({
        where,
        orderBy: [
          { displayOrder: 'asc' },
          { methodName: 'asc' },
        ],
        include: {
          provider: {
            select: {
              id: true,
              providerName: true,
              providerCode: true,
            },
          },
        },
      });

      return methods.map(method => this.formatPaymentMethodResponse(method, true));
    } catch (error: any) {
      logger.error('[PaymentMethodsService] Error fetching all payment methods:', error);
      throw new AppError('Failed to fetch payment methods', 500);
    }
  }

  /**
   * Admin: Create payment method
   */
  async createPaymentMethod(input: CreatePaymentMethodInput, adminId: string): Promise<PaymentMethodResponse> {
    try {
      logger.info('[PaymentMethodsService] Creating payment method', { input, adminId });

      // Validate method code is unique
      const existing = await prisma.paymentMethodConfig.findUnique({
        where: { methodCode: input.methodCode },
      });

      if (existing) {
        throw new AppError('Payment method with this code already exists', 400);
      }

      // If setting as default, unset other defaults in same category
      if (input.isDefault) {
        await prisma.paymentMethodConfig.updateMany({
          where: {
            category: input.category,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      const method = await prisma.paymentMethodConfig.create({
        data: {
          methodType: input.methodType,
          methodCode: input.methodCode,
          methodName: input.methodName,
          displayName: input.displayName,
          description: input.description,
          category: input.category,
          iconUrl: input.iconUrl,
          displayOrder: input.displayOrder || 0,
          isActive: input.isActive ?? true,
          isDefault: input.isDefault ?? false,
          availableCountries: input.availableCountries || [],
          availableCurrencies: input.availableCurrencies || ['MYR'],
          providerId: input.providerId,
          accountDetails: input.accountDetails as any,
          requiresProof: input.requiresProof ?? false,
          autoApprove: input.autoApprove ?? false,
          processingTime: input.processingTime,
          feePercentage: input.feePercentage,
          feeFixed: input.feeFixed,
          minAmount: input.minAmount,
          maxAmount: input.maxAmount,
          metadata: input.metadata as any,
          createdBy: adminId,
        },
      });

      logger.info('[PaymentMethodsService] Payment method created:', method.id);
      return this.formatPaymentMethodResponse(method, true);
    } catch (error: any) {
      logger.error('[PaymentMethodsService] Error creating payment method:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create payment method', 500);
    }
  }

  /**
   * Admin: Update payment method
   */
  async updatePaymentMethod(
    methodId: string,
    input: UpdatePaymentMethodInput,
    adminId: string
  ): Promise<PaymentMethodResponse> {
    try {
      logger.info('[PaymentMethodsService] Updating payment method', { methodId, input, adminId });

      const existing = await prisma.paymentMethodConfig.findUnique({
        where: { id: methodId },
      });

      if (!existing) {
        throw new AppError('Payment method not found', 404);
      }

      // If setting as default, unset other defaults in same category
      if (input.isDefault && existing.category) {
        await prisma.paymentMethodConfig.updateMany({
          where: {
            category: existing.category,
            isDefault: true,
            id: { not: methodId },
          },
          data: {
            isDefault: false,
          },
        });
      }

      const method = await prisma.paymentMethodConfig.update({
        where: { id: methodId },
        data: {
          methodName: input.methodName,
          displayName: input.displayName,
          description: input.description,
          category: input.category,
          iconUrl: input.iconUrl,
          displayOrder: input.displayOrder,
          isActive: input.isActive,
          isDefault: input.isDefault,
          availableCountries: input.availableCountries,
          availableCurrencies: input.availableCurrencies,
          accountDetails: input.accountDetails as any,
          requiresProof: input.requiresProof,
          autoApprove: input.autoApprove,
          processingTime: input.processingTime,
          feePercentage: input.feePercentage,
          feeFixed: input.feeFixed,
          minAmount: input.minAmount,
          maxAmount: input.maxAmount,
          metadata: input.metadata as any,
          updatedAt: new Date(),
        },
      });

      logger.info('[PaymentMethodsService] Payment method updated:', methodId);
      return this.formatPaymentMethodResponse(method, true);
    } catch (error: any) {
      logger.error('[PaymentMethodsService] Error updating payment method:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update payment method', 500);
    }
  }

  /**
   * Admin: Delete payment method (soft delete by setting inactive)
   */
  async deletePaymentMethod(methodId: string, adminId: string): Promise<void> {
    try {
      logger.info('[PaymentMethodsService] Deleting payment method', { methodId, adminId });

      const existing = await prisma.paymentMethodConfig.findUnique({
        where: { id: methodId },
      });

      if (!existing) {
        throw new AppError('Payment method not found', 404);
      }

      await prisma.paymentMethodConfig.update({
        where: { id: methodId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      logger.info('[PaymentMethodsService] Payment method deleted (deactivated):', methodId);
    } catch (error: any) {
      logger.error('[PaymentMethodsService] Error deleting payment method:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete payment method', 500);
    }
  }

  /**
   * Format payment method for response
   */
  private formatPaymentMethodResponse(method: any, includeAccountDetails = false): PaymentMethodResponse {
    const response: PaymentMethodResponse = {
      id: method.id,
      methodCode: method.methodCode,
      methodName: method.methodName,
      displayName: method.displayName,
      description: method.description,
      category: method.category,
      iconUrl: method.iconUrl,
      methodType: method.methodType,
      requiresProof: method.requiresProof,
      processingTime: method.processingTime,
      availableCountries: method.availableCountries,
      availableCurrencies: method.availableCurrencies,
      minAmount: method.minAmount,
      maxAmount: method.maxAmount,
    };

    // Include account details for manual payment methods
    if (includeAccountDetails && method.accountDetails) {
      response.accountDetails = method.accountDetails;
    }

    return response;
  }
}

export default new PaymentMethodsService();
