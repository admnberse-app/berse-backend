export interface Voucher {
  id: string;
  code: string;
  userId: string;
  rewardId: string;
  brand: string;
  title: string;
  icon: string;
  value: string;
  pointsCost: number;
  status: 'active' | 'used' | 'expired';
  createdAt: Date;
  expiryDate: Date;
  usedAt?: Date;
  usedLocation?: string;
  terms?: string[];
}

export interface VoucherValidation {
  isValid: boolean;
  voucher?: Voucher;
  error?: string;
  message?: string;
}

class VoucherService {
  private readonly VOUCHER_STORAGE_KEY = 'user_vouchers';
  private readonly VOUCHER_EXPIRY_DAYS = 30;

  // Generate unique voucher code
  generateVoucherCode(brand: string): string {
    const brandPrefix = brand.substring(0, 3).toUpperCase();
    const randomChars = this.generateRandomString(5);
    return `BM-${brandPrefix}-${randomChars}`;
  }

  // Generate random alphanumeric string
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create new voucher with enhanced support for universal redemption
  createVoucher(reward: {
    id: string;
    brand: string;
    title: string;
    icon: string;
    points: number;
    value?: string;
    category?: string;
    description?: string;
    expiryDate?: Date;
    terms?: string[];
  }, userId: string): Voucher {
    const code = this.generateVoucherCode(reward.brand);
    const now = new Date();
    
    // Set expiry date to 23rd August 2025 for all vouchers
    const expiryDate = new Date('2025-08-23T23:59:59');

    const voucher: Voucher = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      code,
      userId,
      rewardId: reward.id,
      brand: reward.brand,
      title: reward.title,
      icon: reward.icon,
      value: reward.value || `${reward.points} pts`,
      pointsCost: reward.points,
      status: 'active',
      createdAt: now,
      expiryDate,
      terms: reward.terms || this.getDefaultTerms(reward.brand, reward.category)
    };

    // Save to local storage
    this.saveVoucher(voucher);
    
    return voucher;
  }

  // Get default terms for brand and category
  private getDefaultTerms(brand: string, category?: string): string[] {
    const baseTerms = [
      'Valid at all participating outlets',
      'Cannot be combined with other offers',
      'No cash value or change given',
      'One-time use only',
      'Subject to availability'
    ];

    // Add category-specific terms if provided
    if (category) {
      switch (category) {
        case 'Transportation':
          return [
            ...baseTerms,
            'Valid for specified routes only',
            'Must be presented before boarding',
            'Subject to transport operator terms'
          ];
        case 'Food & Drinks':
          return [
            ...baseTerms,
            'Cannot be used for delivery orders',
            'Must be consumed on premises',
            'Subject to menu availability'
          ];
        case 'Education':
          return [
            ...baseTerms,
            'Valid for new enrollments only',
            'Must present student ID if applicable',
            'Subject to course availability'
          ];
        default:
          return baseTerms;
      }
    }

    return baseTerms;
  }

  // Save voucher to local storage
  private saveVoucher(voucher: Voucher): void {
    const vouchers = this.getAllVouchers();
    vouchers.push(voucher);
    localStorage.setItem(this.VOUCHER_STORAGE_KEY, JSON.stringify(vouchers));
  }

  // Get all vouchers from local storage
  getAllVouchers(): Voucher[] {
    const stored = localStorage.getItem(this.VOUCHER_STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const vouchers = JSON.parse(stored);
      // Convert date strings back to Date objects
      return vouchers.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt),
        expiryDate: new Date(v.expiryDate),
        usedAt: v.usedAt ? new Date(v.usedAt) : undefined
      }));
    } catch {
      return [];
    }
  }

  // Get user's vouchers
  getUserVouchers(userId: string): {
    active: Voucher[];
    used: Voucher[];
    expired: Voucher[];
  } {
    const allVouchers = this.getAllVouchers();
    const userVouchers = allVouchers.filter(v => v.userId === userId);
    
    // Update expired vouchers
    const now = new Date();
    userVouchers.forEach(voucher => {
      if (voucher.status === 'active' && voucher.expiryDate < now) {
        voucher.status = 'expired';
      }
    });

    // Save updated vouchers
    localStorage.setItem(this.VOUCHER_STORAGE_KEY, JSON.stringify(allVouchers));

    return {
      active: userVouchers.filter(v => v.status === 'active'),
      used: userVouchers.filter(v => v.status === 'used'),
      expired: userVouchers.filter(v => v.status === 'expired')
    };
  }

  // Validate voucher
  validateVoucher(code: string): VoucherValidation {
    const vouchers = this.getAllVouchers();
    const voucher = vouchers.find(v => v.code === code);

    if (!voucher) {
      return {
        isValid: false,
        error: 'INVALID_CODE',
        message: 'Invalid voucher code'
      };
    }

    if (voucher.status === 'used') {
      return {
        isValid: false,
        voucher,
        error: 'ALREADY_USED',
        message: `Already used on ${voucher.usedAt?.toLocaleDateString()} at ${voucher.usedLocation || 'Unknown location'}`
      };
    }

    // Check if today is exactly 23rd August 2025
    const today = new Date();
    const validDate = new Date('2025-08-23');
    const isValidDay = today.getFullYear() === validDate.getFullYear() &&
                      today.getMonth() === validDate.getMonth() &&
                      today.getDate() === validDate.getDate();

    if (!isValidDay) {
      return {
        isValid: false,
        voucher,
        error: 'NOT_VALID_DATE',
        message: 'Voucher is only valid on 23rd August 2025'
      };
    }

    if (voucher.status === 'expired' || voucher.expiryDate < new Date()) {
      return {
        isValid: false,
        voucher,
        error: 'EXPIRED',
        message: `Expired on ${voucher.expiryDate.toLocaleDateString()}`
      };
    }

    return {
      isValid: true,
      voucher,
      message: 'Valid voucher - Redeemable today only!'
    };
  }

  // Redeem voucher
  redeemVoucher(code: string, location?: string): VoucherValidation {
    const validation = this.validateVoucher(code);
    
    if (!validation.isValid) {
      return validation;
    }

    const vouchers = this.getAllVouchers();
    const voucherIndex = vouchers.findIndex(v => v.code === code);
    
    if (voucherIndex !== -1) {
      vouchers[voucherIndex].status = 'used';
      vouchers[voucherIndex].usedAt = new Date();
      vouchers[voucherIndex].usedLocation = location || 'Unknown location';
      
      localStorage.setItem(this.VOUCHER_STORAGE_KEY, JSON.stringify(vouchers));
      
      return {
        isValid: true,
        voucher: vouchers[voucherIndex],
        message: 'Voucher redeemed successfully'
      };
    }

    return {
      isValid: false,
      error: 'REDEEM_ERROR',
      message: 'Failed to redeem voucher'
    };
  }

  // Get voucher statistics
  getVoucherStats(userId: string): {
    totalRedeemed: number;
    totalSaved: number;
    activeCount: number;
    monthlyRedemptions: number;
  } {
    const userVouchers = this.getUserVouchers(userId);
    const allUserVouchers = [
      ...userVouchers.active,
      ...userVouchers.used,
      ...userVouchers.expired
    ];

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyRedemptions = allUserVouchers.filter(v => 
      v.createdAt >= monthStart
    ).length;

    const totalSaved = userVouchers.used.reduce((sum, v) => {
      // Extract numeric value from string like "RM 10" or "10 pts"
      const match = v.value.match(/\d+/);
      return sum + (match ? parseInt(match[0]) : 0);
    }, 0);

    return {
      totalRedeemed: userVouchers.used.length,
      totalSaved,
      activeCount: userVouchers.active.length,
      monthlyRedemptions
    };
  }

  // Check for expiring vouchers
  getExpiringVouchers(userId: string, daysThreshold: number = 3): Voucher[] {
    const { active } = this.getUserVouchers(userId);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);

    return active.filter(v => v.expiryDate <= threshold);
  }

  // Clear all vouchers (for testing)
  clearAllVouchers(): void {
    localStorage.removeItem(this.VOUCHER_STORAGE_KEY);
  }
}

// Export singleton instance
export const voucherService = new VoucherService();