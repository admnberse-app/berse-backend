import { Reward, UserStats, ApiResponse } from '../types';
import { authService } from './auth.service';
import { SERVICES_CONFIG, getApiBaseUrl } from '../config/services.config';

const API_BASE_URL = getApiBaseUrl();

class RewardsService {
  async getUserStats(): Promise<UserStats> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/rewards/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      const data: ApiResponse<UserStats> = await response.json();
      return data.success ? data.data : this.getMockUserStats();
    } catch (error) {
      console.error('Get user stats error:', error);
      return this.getMockUserStats();
    }
  }

  async getAvailableRewards(): Promise<Reward[]> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/rewards`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rewards');
      }

      const data: ApiResponse<Reward[]> = await response.json();
      return data.success ? data.data : this.getMockRewards();
    } catch (error) {
      console.error('Get rewards error:', error);
      return this.getMockRewards();
    }
  }

  async redeemReward(rewardId: string): Promise<boolean> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE_URL}/rewards/${rewardId}/redeem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to redeem reward');
      }

      const data: ApiResponse<boolean> = await response.json();
      return data.success;
    } catch (error) {
      console.error('Redeem reward error:', error);
      return false;
    }
  }

  private getMockUserStats(): UserStats {
    return {
      totalPoints: 125,
      eventsAttended: 8,
      eventsHosted: 2,
      connectionsMade: 15,
      level: 3,
      badges: [
        {
          id: '1',
          name: 'Social Butterfly',
          description: 'Attended 5 events',
          icon: '🦋',
          color: '#FF6B6B',
          requirements: 'Attend 5 events',
          isUnlocked: true,
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        },
        {
          id: '2',
          name: 'Coffee Connoisseur',
          description: 'Attended 3 cafe meetups',
          icon: '☕',
          color: '#8B4513',
          requirements: 'Attend 3 cafe meetups',
          isUnlocked: true,
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        },
        {
          id: '3',
          name: 'Community Builder',
          description: 'Host your first event',
          icon: '🏗️',
          color: '#4CAF50',
          requirements: 'Host 1 event',
          isUnlocked: false,
        },
      ],
    };
  }

  private getMockRewards(): Reward[] {
    return [
      {
        id: '1',
        name: '20% Off Cafe Voucher',
        description: 'Get 20% off at participating cafes',
        pointsCost: 50,
        type: 'discount',
        image: '',
        isAvailable: true,
      },
      {
        id: '2',
        name: 'Premium Badge',
        description: 'Unlock a special premium badge for your profile',
        pointsCost: 100,
        type: 'digital',
        image: '',
        isAvailable: true,
      },
      {
        id: '3',
        name: 'Local Experience Tour',
        description: 'Join a guided tour of hidden local gems',
        pointsCost: 200,
        type: 'experience',
        image: '',
        isAvailable: true,
      },
    ];
  }
}

export const rewardsService = new RewardsService();
export default rewardsService;