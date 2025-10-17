import { AbstractPaymentGateway, ProviderConfig } from './AbstractPaymentGateway';
import { XenditGateway } from './XenditGateway';
import { StripeGateway } from './StripeGateway';
import { PrismaClient } from '@prisma/client';
import logger from '../../../utils/logger';
import { AppError } from '../../../middleware/error';

const prisma = new PrismaClient();

/**
 * Payment Gateway Factory
 * 
 * Responsible for:
 * - Loading provider configuration from database
 * - Instantiating the correct gateway based on provider code
 * - Caching gateway instances for performance
 * - Handling provider routing rules
 */
export class PaymentGatewayFactory {
  private static gatewayCache: Map<string, AbstractPaymentGateway> = new Map();

  /**
   * Get payment gateway instance by provider ID
   * Uses caching to avoid recreating gateway instances
   */
  static async getGatewayByProviderId(providerId: string): Promise<AbstractPaymentGateway> {
    try {
      // Check cache first
      if (this.gatewayCache.has(providerId)) {
        const cachedGateway = this.gatewayCache.get(providerId)!;
        logger.debug(`[GatewayFactory] Using cached gateway for provider: ${providerId}`);
        return cachedGateway;
      }

      // Load provider from database
      const provider = await prisma.paymentProvider.findUnique({
        where: { id: providerId },
      });

      if (!provider) {
        throw new AppError(`Payment provider not found: ${providerId}`, 404);
      }

      if (!provider.isActive) {
        throw new AppError(`Payment provider is not active: ${provider.providerName}`, 400);
      }

      // Create gateway instance
      const gateway = this.createGateway(provider.providerCode, provider.configuration as any);
      
      // Cache the instance
      this.gatewayCache.set(providerId, gateway);
      
      logger.info(`[GatewayFactory] Created and cached gateway for provider: ${provider.providerName}`);
      return gateway;
    } catch (error) {
      logger.error('[GatewayFactory] Failed to get gateway by provider ID:', error);
      throw error;
    }
  }

  /**
   * Get payment gateway instance by provider code (e.g., 'xendit', 'stripe')
   */
  static async getGatewayByProviderCode(providerCode: string): Promise<AbstractPaymentGateway> {
    try {
      // Find provider in database
      const provider = await prisma.paymentProvider.findUnique({
        where: { providerCode },
      });

      if (!provider) {
        throw new AppError(`Payment provider not found: ${providerCode}`, 404);
      }

      return this.getGatewayByProviderId(provider.id);
    } catch (error) {
      logger.error('[GatewayFactory] Failed to get gateway by provider code:', error);
      throw error;
    }
  }

  /**
   * Get default payment gateway
   * Returns the gateway marked as default in the database
   */
  static async getDefaultGateway(): Promise<AbstractPaymentGateway> {
    try {
      const provider = await prisma.paymentProvider.findFirst({
        where: {
          isDefault: true,
          isActive: true,
        },
        orderBy: {
          priorityOrder: 'asc',
        },
      });

      if (!provider) {
        throw new AppError('No default payment provider configured', 500);
      }

      return this.getGatewayByProviderId(provider.id);
    } catch (error) {
      logger.error('[GatewayFactory] Failed to get default gateway:', error);
      throw error;
    }
  }

  /**
   * Get payment gateway based on routing rules
   * This allows dynamic provider selection based on:
   * - Transaction amount
   * - Currency
   * - Country
   * - Payment method
   * - User segment
   * - etc.
   */
  static async getGatewayByRouting(context: {
    amount?: number;
    currency?: string;
    country?: string;
    paymentMethod?: string;
    userId?: string;
    eventType?: string;
  }): Promise<AbstractPaymentGateway> {
    try {
      logger.info('[GatewayFactory] Evaluating routing rules for context:', context);

      // Get all active routing rules, ordered by priority
      const routingRules = await prisma.paymentProviderRouting.findMany({
        where: { isActive: true },
        include: { provider: true },
        orderBy: { priority: 'asc' },
      });

      // Evaluate each rule
      for (const rule of routingRules) {
        if (!rule.provider.isActive) continue;

        const conditions = rule.conditions as any;
        
        // Check if context matches all conditions
        if (this.matchesConditions(context, conditions)) {
          logger.info(`[GatewayFactory] Matched routing rule: ${rule.ruleName}`);
          return this.getGatewayByProviderId(rule.providerId);
        }
      }

      // If no rules match, return default gateway
      logger.info('[GatewayFactory] No routing rules matched, using default gateway');
      return this.getDefaultGateway();
    } catch (error) {
      logger.error('[GatewayFactory] Failed to get gateway by routing:', error);
      throw error;
    }
  }

  /**
   * Create gateway instance based on provider code
   */
  private static createGateway(providerCode: string, configuration: ProviderConfig): AbstractPaymentGateway {
    const normalizedCode = providerCode.toLowerCase();

    switch (normalizedCode) {
      case 'xendit':
        return new XenditGateway(configuration);
      
      case 'stripe':
        return new StripeGateway(configuration);
      
      // Add more providers here as needed:
      // case 'paypal':
      //   return new PayPalGateway(configuration);
      // case 'razorpay':
      //   return new RazorpayGateway(configuration);
      
      default:
        throw new AppError(`Unsupported payment provider: ${providerCode}`, 400);
    }
  }

  /**
   * Check if context matches routing rule conditions
   */
  private static matchesConditions(context: any, conditions: any): boolean {
    if (!conditions || typeof conditions !== 'object') {
      return false;
    }

    // Check each condition
    for (const [key, value] of Object.entries(conditions)) {
      const contextValue = context[key];

      if (contextValue === undefined) {
        continue; // Skip if context doesn't have this field
      }

      // Handle different condition types
      if (typeof value === 'object' && value !== null) {
        // Range conditions: { min: 100, max: 1000 }
        if ('min' in value && contextValue < value.min) return false;
        if ('max' in value && contextValue > value.max) return false;
        
        // Array conditions: { in: ['USD', 'EUR'] }
        if ('in' in value && Array.isArray(value.in)) {
          if (!value.in.includes(contextValue)) return false;
        }
        
        // Regex conditions: { regex: '^MY' }
        if ('regex' in value && typeof value.regex === 'string') {
          const regex = new RegExp(value.regex);
          if (!regex.test(String(contextValue))) return false;
        }
      } else {
        // Direct equality check
        if (contextValue !== value) return false;
      }
    }

    return true;
  }

  /**
   * Clear gateway cache
   * Useful when provider configuration changes
   */
  static clearCache(providerId?: string): void {
    if (providerId) {
      this.gatewayCache.delete(providerId);
      logger.info(`[GatewayFactory] Cleared cache for provider: ${providerId}`);
    } else {
      this.gatewayCache.clear();
      logger.info('[GatewayFactory] Cleared all gateway cache');
    }
  }

  /**
   * Get all active payment providers
   */
  static async getAllActiveProviders(): Promise<Array<{
    id: string;
    name: string;
    code: string;
    type: string;
    supportedCurrencies: string[];
    supportedCountries: string[];
  }>> {
    try {
      const providers = await prisma.paymentProvider.findMany({
        where: { isActive: true },
        orderBy: { priorityOrder: 'asc' },
        select: {
          id: true,
          providerName: true,
          providerCode: true,
          providerType: true,
          supportedCurrencies: true,
          supportedCountries: true,
        },
      });

      return providers.map(p => ({
        id: p.id,
        name: p.providerName,
        code: p.providerCode,
        type: p.providerType,
        supportedCurrencies: p.supportedCurrencies,
        supportedCountries: p.supportedCountries,
      }));
    } catch (error) {
      logger.error('[GatewayFactory] Failed to get active providers:', error);
      throw new AppError('Failed to retrieve active payment providers', 500);
    }
  }

  /**
   * Validate that a provider supports the requested operation
   */
  static async validateProviderSupport(
    providerId: string,
    currency: string,
    country?: string
  ): Promise<boolean> {
    try {
      const provider = await prisma.paymentProvider.findUnique({
        where: { id: providerId },
      });

      if (!provider || !provider.isActive) {
        return false;
      }

      // Check currency support
      if (!provider.supportedCurrencies.includes(currency)) {
        logger.warn(`[GatewayFactory] Provider ${provider.providerName} does not support currency: ${currency}`);
        return false;
      }

      // Check country support (if provided)
      if (country && provider.supportedCountries.length > 0) {
        if (!provider.supportedCountries.includes(country)) {
          logger.warn(`[GatewayFactory] Provider ${provider.providerName} does not support country: ${country}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('[GatewayFactory] Failed to validate provider support:', error);
      return false;
    }
  }
}
