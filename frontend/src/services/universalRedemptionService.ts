// Universal Redemption Service - Handles ALL reward types across the platform
import { voucherService } from './voucherService';
import { updateUserPoints, getUserPoints } from '../utils/initializePoints';

export interface UniversalReward {
  id: string;
  category: string;
  icon: string;
  brand: string;
  title: string;
  description: string;
  points: number;
  value?: string;
  expiry?: string;
  isNew?: boolean;
  isExpiringSoon?: boolean;
}

export interface RedemptionResult {
  success: boolean;
  voucher?: any;
  error?: string;
  pointsDeducted?: number;
  newBalance?: number;
}

class UniversalRedemptionService {
  // Generate dynamic expiry dates based on reward value
  private getExpiryDate(points: number): Date {
    const now = new Date();
    let daysToAdd = 30; // Default 30 days
    
    if (points <= 50) {
      daysToAdd = 30; // Low-value: 30 days
    } else if (points <= 200) {
      daysToAdd = 60; // Medium-value: 60 days  
    } else {
      daysToAdd = 90; // High-value: 90 days
    }
    
    now.setDate(now.getDate() + daysToAdd);
    return now;
  }

  // Generate category-specific Terms & Conditions
  private generateTermsAndConditions(reward: UniversalReward): string[] {
    const baseTerms = [
      'Valid for one-time use only',
      'Cannot be combined with other offers',
      'Non-transferable and non-refundable',
      'Subject to availability'
    ];

    switch (reward.category) {
      case 'Transportation':
        return [
          ...baseTerms,
          'Valid for specified routes only',
          'Must be presented before boarding',
          'Not valid during peak hours (7-9 AM, 5-7 PM)',
          'Subject to transport operator terms'
        ];
      
      case 'Food & Drinks':
        return [
          ...baseTerms,
          'Valid at participating outlets only',
          'Cannot be used for delivery orders',
          'Must be consumed on premises',
          'Subject to menu availability'
        ];
      
      case 'Education':
        return [
          ...baseTerms,
          'Valid for new enrollments only',
          'Cannot be applied to ongoing courses',
          'Must present student ID if applicable',
          'Subject to course availability and schedule'
        ];
      
      case 'Travel':
        return [
          ...baseTerms,
          'Subject to seat availability',
          'Blackout dates may apply',
          'Must be booked in advance',
          'Additional fees may apply for changes'
        ];
      
      case 'Shipping':
        return [
          ...baseTerms,
          'Valid for standard shipping only',
          'Weight and size restrictions apply',
          'Excludes prohibited items',
          'Delivery timeframe not guaranteed'
        ];
      
      case 'Religious':
        return [
          ...baseTerms,
          'Valid for specified religious services only',
          'Must comply with religious guidelines',
          'Subject to availability of certified guides',
          'Additional documentation may be required'
        ];
      
      case 'ASEAN':
        return [
          ...baseTerms,
          'Valid for ASEAN destinations only',
          'Customs and duties not included',
          'Subject to international shipping regulations',
          'Delivery times may vary by destination'
        ];
      
      default:
        return baseTerms;
    }
  }

  // Validate if user can afford the reward
  canAfford(points: number): boolean {
    const currentPoints = getUserPoints();
    return currentPoints >= points;
  }

  // Get points needed message
  getPointsNeededMessage(reward: UniversalReward): string {
    const currentPoints = getUserPoints();
    const pointsNeeded = reward.points - currentPoints;
    
    return `❌ Insufficient Points\n\nYou need ${pointsNeeded} more points to redeem this reward.\n\nCurrent balance: ${currentPoints} points\nRequired: ${reward.points} points`;
  }

  // Universal redemption handler
  async redeemReward(reward: UniversalReward, userId: string): Promise<RedemptionResult> {
    console.log('🎫 Universal redemption started for:', reward.brand, reward.title);
    console.log('💰 Current points:', getUserPoints());
    console.log('🎯 Reward cost:', reward.points);
    
    try {
      const currentPoints = getUserPoints();
      
      // Validate points availability
      if (!this.canAfford(reward.points)) {
        return {
          success: false,
          error: this.getPointsNeededMessage(reward)
        };
      }

      // Deduct points
      const newPoints = currentPoints - reward.points;
      console.log('💰 Points before:', currentPoints, 'Points after:', newPoints);
      
      updateUserPoints(newPoints);
      
      // Generate voucher with dynamic properties
      const voucher = voucherService.createVoucher({
        id: reward.id,
        brand: reward.brand,
        title: reward.title,
        icon: reward.icon,
        points: reward.points,
        value: reward.value || `${reward.points} pts reward`,
        category: reward.category,
        description: reward.description,
        expiryDate: this.getExpiryDate(reward.points),
        terms: this.generateTermsAndConditions(reward)
      }, userId);
      
      console.log('🎫 Universal voucher generated:', voucher.code);
      
      return {
        success: true,
        voucher: {
          code: voucher.code,
          brand: voucher.brand,
          title: voucher.title,
          icon: voucher.icon,
          value: voucher.value,
          expiryDate: voucher.expiryDate,
          terms: voucher.terms,
          category: reward.category,
          pointsCost: reward.points
        },
        pointsDeducted: reward.points,
        newBalance: newPoints
      };
      
    } catch (error) {
      console.error('❌ Universal redemption error:', error);
      
      // Restore points if error occurred after deduction
      const currentPoints = getUserPoints();
      updateUserPoints(currentPoints + reward.points);
      
      return {
        success: false,
        error: 'Redemption failed! Your points have not been deducted. Please try again.'
      };
    }
  }

  // Convert any reward object to UniversalReward format
  normalizeReward(reward: any): UniversalReward {
    return {
      id: reward.id || `reward_${Date.now()}`,
      category: reward.category || 'General',
      icon: reward.icon || '🎁',
      brand: reward.brand || 'Unknown Brand',
      title: reward.title || 'Reward',
      description: reward.description || 'Special reward',
      points: reward.points || 0,
      value: reward.value,
      expiry: reward.expiry,
      isNew: reward.isNew || false,
      isExpiringSoon: reward.isExpiringSoon || false
    };
  }

  // Get redemption button text and style
  getButtonProps(reward: UniversalReward) {
    const canAfford = this.canAfford(reward.points);
    
    return {
      text: canAfford ? 'Redeem' : 'Not enough pts',
      disabled: !canAfford,
      style: {
        background: canAfford ? '#2D5F4F' : '#ccc',
        cursor: canAfford ? 'pointer' : 'not-allowed',
        opacity: canAfford ? 1 : 0.7
      }
    };
  }

  // Get success message for redemption
  getSuccessMessage(reward: UniversalReward, oldPoints: number, newPoints: number): string {
    return `🎉 Successfully redeemed ${reward.brand} voucher!\n\nPoints updated: ${oldPoints} → ${newPoints}\n\nVoucher automatically saved to My Vouchers!`;
  }
}

export const universalRedemptionService = new UniversalRedemptionService();