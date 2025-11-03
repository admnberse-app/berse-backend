/**
 * Point Expiry Configuration
 * Defines rules for point expiration based on trust levels and action types
 */

export const POINT_EXPIRY_CONFIG = {
  // Standard expiry period (in months)
  STANDARD_EXPIRY_MONTHS: 12,
  
  // Trust level-based expiry benefits (in months)
  TRUST_LEVEL_EXPIRY: {
    starter: 12,   // STARTER users: 12 months
    trusted: 12,   // TRUSTED users: 12 months (same as standard)
    leader: 18,    // LEADER users: 18 months (6 month bonus)
  },
  
  // Minimum balance exemption (points below this don't expire)
  MIN_BALANCE_EXEMPTION: 100,
  
  // Warning periods (days before expiry to send notifications)
  WARNING_PERIODS: {
    FIRST_WARNING: 30,   // 30 days before expiry
    SECOND_WARNING: 7,   // 7 days before expiry
    FINAL_WARNING: 1,    // 1 day before expiry
  },
  
  // Batch processing settings for cron job
  BATCH_PROCESSING: {
    BATCH_SIZE: 5000,           // Records to process per batch
    BATCH_DELAY_MS: 100,        // Delay between batches (milliseconds)
  },
  
  // Cron schedule
  CRON_SCHEDULE: '0 3 * * *',  // Daily at 3:00 AM UTC
  
  // Special expiry rules for specific actions (optional future use)
  ACTION_EXPIRY_OVERRIDES: {
    // Example: Vouch points could last longer
    // RECEIVE_VOUCH: 24, // 24 months for vouch points
    // BECOME_GUIDE: null, // null = never expire
  },
} as const;

/**
 * Get expiry period for a user based on their trust level
 * @param trustLevel - User's trust level (starter, trusted, leader)
 * @returns Number of months until points expire
 */
export function getExpiryMonthsForTrustLevel(trustLevel: string): number {
  const level = trustLevel.toLowerCase() as keyof typeof POINT_EXPIRY_CONFIG.TRUST_LEVEL_EXPIRY;
  return POINT_EXPIRY_CONFIG.TRUST_LEVEL_EXPIRY[level] || POINT_EXPIRY_CONFIG.STANDARD_EXPIRY_MONTHS;
}

/**
 * Calculate expiry date for newly awarded points
 * @param awardedAt - Date when points were awarded
 * @param trustLevel - User's trust level
 * @param action - Optional action type (for future override rules)
 * @returns Date when points will expire
 */
export function calculateExpiryDate(
  awardedAt: Date,
  trustLevel: string,
  action?: string
): Date {
  // Check for action-specific override (future feature)
  if (action && action in POINT_EXPIRY_CONFIG.ACTION_EXPIRY_OVERRIDES) {
    const overrideMonths = POINT_EXPIRY_CONFIG.ACTION_EXPIRY_OVERRIDES[
      action as keyof typeof POINT_EXPIRY_CONFIG.ACTION_EXPIRY_OVERRIDES
    ];
    if (overrideMonths === null) {
      // Never expire - set to 100 years in future
      const neverExpire = new Date(awardedAt);
      neverExpire.setFullYear(neverExpire.getFullYear() + 100);
      return neverExpire;
    }
    if (overrideMonths) {
      const expiryDate = new Date(awardedAt);
      expiryDate.setMonth(expiryDate.getMonth() + overrideMonths);
      return expiryDate;
    }
  }
  
  // Standard expiry based on trust level
  const months = getExpiryMonthsForTrustLevel(trustLevel);
  const expiryDate = new Date(awardedAt);
  expiryDate.setMonth(expiryDate.getMonth() + months);
  return expiryDate;
}

/**
 * Check if user's total available points are below exemption threshold
 * @param availablePoints - Total available (non-expired, non-spent) points
 * @returns True if points should be exempt from expiry
 */
export function isExemptFromExpiry(availablePoints: number): boolean {
  return availablePoints < POINT_EXPIRY_CONFIG.MIN_BALANCE_EXEMPTION;
}

/**
 * Get dates for warning notifications
 * @param expiryDate - When points will expire
 * @returns Object with warning dates
 */
export function getWarningDates(expiryDate: Date) {
  const firstWarning = new Date(expiryDate);
  firstWarning.setDate(firstWarning.getDate() - POINT_EXPIRY_CONFIG.WARNING_PERIODS.FIRST_WARNING);
  
  const secondWarning = new Date(expiryDate);
  secondWarning.setDate(secondWarning.getDate() - POINT_EXPIRY_CONFIG.WARNING_PERIODS.SECOND_WARNING);
  
  const finalWarning = new Date(expiryDate);
  finalWarning.setDate(finalWarning.getDate() - POINT_EXPIRY_CONFIG.WARNING_PERIODS.FINAL_WARNING);
  
  return {
    firstWarning,   // 30 days before
    secondWarning,  // 7 days before
    finalWarning,   // 1 day before
  };
}
