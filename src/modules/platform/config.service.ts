import { PrismaClient } from '@prisma/client';
import {
  ConfigCategory,
  ConfigKey,
  ConfigValue,
  TrustFormulaConfig,
  TrustLevelsConfig,
  FeatureGatingConfig,
  AccountabilityConfig,
  BadgeConfig,
  TrustDecayConfig,
  VouchEligibilityConfig,
  ActivityWeightsConfig,
} from './config.types';
import { getDefaultConfigs } from './config.defaults';

const prisma = new PrismaClient();

/**
 * In-memory cache for platform configurations
 * TTL: 5 minutes
 */
interface CacheEntry<T = ConfigValue> {
  value: T;
  timestamp: number;
}

class ConfigService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get cache key for category and key combination
   */
  private getCacheKey(category: ConfigCategory | string, key: ConfigKey | string): string {
    return `${category}:${key}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }

  /**
   * Get config from cache if available and valid
   */
  private getFromCache<T = ConfigValue>(
    category: ConfigCategory | string,
    key: ConfigKey | string
  ): T | null {
    const cacheKey = this.getCacheKey(category, key);
    const entry = this.cache.get(cacheKey);

    if (entry && this.isCacheValid(entry)) {
      return entry.value as T;
    }

    return null;
  }

  /**
   * Set config in cache
   */
  private setCache(
    category: ConfigCategory | string,
    key: ConfigKey | string,
    value: ConfigValue
  ): void {
    const cacheKey = this.getCacheKey(category, key);
    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Invalidate cache for specific config or all configs
   */
  public invalidateCache(category?: ConfigCategory | string, key?: ConfigKey | string): void {
    if (category && key) {
      const cacheKey = this.getCacheKey(category, key);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get configuration value with fallback to defaults
   */
  public async getConfig<T = ConfigValue>(
    category: ConfigCategory | string,
    key: ConfigKey | string
  ): Promise<T> {
    try {
      // Check cache first
      const cachedValue = this.getFromCache<T>(category, key);
      if (cachedValue !== null) {
        return cachedValue;
      }

      // Fetch from database
      const config = await prisma.platformConfig.findUnique({
        where: {
          category_key: {
            category,
            key,
          },
        },
      });

      if (config) {
        const value = config.value as T;
        this.setCache(category, key, value as ConfigValue);
        return value;
      }

      // Fallback to default configs
      const defaults = getDefaultConfigs();
      const defaultValue = defaults[category]?.[key];
      
      if (defaultValue) {
        console.warn(
          `Config not found in database for ${category}:${key}, using default value`
        );
        return defaultValue as T;
      }

      throw new Error(`No configuration found for ${category}:${key} and no default available`);
    } catch (error) {
      console.error(`Error fetching config ${category}:${key}:`, error);
      
      // Final fallback to defaults
      const defaults = getDefaultConfigs();
      const defaultValue = defaults[category]?.[key];
      
      if (defaultValue) {
        return defaultValue as T;
      }

      throw error;
    }
  }

  /**
   * Get all configs for a specific category
   */
  public async getAllConfigs(category: ConfigCategory | string): Promise<Record<string, ConfigValue>> {
    try {
      const configs = await prisma.platformConfig.findMany({
        where: { category },
      });

      const result: Record<string, ConfigValue> = {};
      
      for (const config of configs) {
        result[config.key] = config.value as unknown as ConfigValue;
        this.setCache(category, config.key, config.value as unknown as ConfigValue);
      }

      return result;
    } catch (error) {
      console.error(`Error fetching all configs for ${category}:`, error);
      
      // Fallback to defaults
      const defaults = getDefaultConfigs();
      return defaults[category] || {};
    }
  }

  /**
   * Update configuration value (with history logging)
   */
  public async updateConfig(
    category: ConfigCategory | string,
    key: ConfigKey | string,
    newValue: ConfigValue,
    changedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      // Get current value for history
      const currentConfig = await prisma.platformConfig.findUnique({
        where: {
          category_key: {
            category,
            key,
          },
        },
      });

      if (!currentConfig) {
        throw new Error(`Config ${category}:${key} does not exist`);
      }

      // Update config
      const updated = await prisma.platformConfig.update({
        where: {
          category_key: {
            category,
            key,
          },
        },
        data: {
          value: newValue as any,
          updatedBy: changedBy,
          version: {
            increment: 1,
          },
        },
      });

      // Log to history
      await prisma.configHistory.create({
        data: {
          configId: updated.id,
          category,
          key,
          oldValue: currentConfig.value as any,
          newValue: newValue as any,
          changedBy,
          reason,
        },
      });

      // Invalidate cache
      this.invalidateCache(category, key);

      console.log(
        `Config updated: ${category}:${key} by ${changedBy} (version ${updated.version})`
      );
    } catch (error) {
      console.error(`Error updating config ${category}:${key}:`, error);
      throw error;
    }
  }

  /**
   * Get config change history
   */
  public async getConfigHistory(
    configId: string,
    limit: number = 10
  ): Promise<Array<{
    id: string;
    oldValue: ConfigValue;
    newValue: ConfigValue;
    changedBy: string;
    changedAt: Date;
    reason?: string;
  }>> {
    try {
      const history = await prisma.configHistory.findMany({
        where: { configId },
        orderBy: { changedAt: 'desc' },
        take: limit,
      });

      return history.map((entry) => ({
        id: entry.id,
        oldValue: entry.oldValue as unknown as ConfigValue,
        newValue: entry.newValue as unknown as ConfigValue,
        changedBy: entry.changedBy,
        changedAt: entry.changedAt,
        reason: entry.reason || undefined,
      }));
    } catch (error) {
      console.error(`Error fetching config history for ${configId}:`, error);
      return [];
    }
  }

  // ============================================================================
  // Convenience Methods for Specific Config Types
  // ============================================================================

  async getTrustFormula(): Promise<TrustFormulaConfig> {
    return this.getConfig<TrustFormulaConfig>(
      ConfigCategory.TRUST_FORMULA,
      ConfigKey.WEIGHTS
    );
  }

  async getTrustLevels(): Promise<TrustLevelsConfig> {
    return this.getConfig<TrustLevelsConfig>(
      ConfigCategory.TRUST_LEVELS,
      ConfigKey.LEVELS
    );
  }

  async getFeatureGating(): Promise<FeatureGatingConfig> {
    return this.getConfig<FeatureGatingConfig>(
      ConfigCategory.FEATURE_GATING,
      ConfigKey.FEATURES
    );
  }

  async getAccountabilityRules(): Promise<AccountabilityConfig> {
    return this.getConfig<AccountabilityConfig>(
      ConfigCategory.ACCOUNTABILITY_RULES,
      ConfigKey.RULES
    );
  }

  async getBadgeDefinitions(): Promise<BadgeConfig> {
    return this.getConfig<BadgeConfig>(
      ConfigCategory.BADGE_DEFINITIONS,
      ConfigKey.BADGES
    );
  }

  async getTrustDecayRules(): Promise<TrustDecayConfig> {
    return this.getConfig<TrustDecayConfig>(
      ConfigCategory.TRUST_DECAY,
      ConfigKey.DECAY_RULES
    );
  }

  async getVouchEligibilityCriteria(): Promise<VouchEligibilityConfig> {
    return this.getConfig<VouchEligibilityConfig>(
      ConfigCategory.VOUCH_ELIGIBILITY,
      ConfigKey.ELIGIBILITY_CRITERIA
    );
  }

  async getActivityWeights(): Promise<ActivityWeightsConfig> {
    return this.getConfig<ActivityWeightsConfig>(
      ConfigCategory.ACTIVITY_WEIGHTS,
      ConfigKey.ACTIVITY_POINTS
    );
  }
}

// Export singleton instance
export const configService = new ConfigService();
export default configService;
