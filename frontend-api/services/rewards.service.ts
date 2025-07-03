/**
 * Rewards Service
 * Handles rewards listing, redemption, and management
 */

import { API_CONFIG } from '../config/api.config'
import { api } from '../utils/api-client'
import { 
  Reward,
  RewardRedemption,
  ApiResponse,
  GetRewardsParams,
  CreateRewardRequest,
  RedeemRewardRequest,
  UpdateRedemptionStatusRequest
} from '../types'

class RewardsService {
  /**
   * Get list of available rewards
   */
  async getRewards(params?: GetRewardsParams): Promise<ApiResponse<Reward[]>> {
    try {
      return await api.get<Reward[]>(API_CONFIG.ENDPOINTS.REWARDS.LIST, { params })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch rewards',
      }
    }
  }
  
  /**
   * Get rewards by category
   */
  async getRewardsByCategory(category: string): Promise<ApiResponse<Reward[]>> {
    return this.getRewards({ category })
  }
  
  /**
   * Get rewards within points range
   */
  async getAffordableRewards(userPoints: number): Promise<ApiResponse<Reward[]>> {
    return this.getRewards({ maxPoints: userPoints })
  }
  
  /**
   * Create new reward (Admin only)
   */
  async createReward(rewardData: CreateRewardRequest): Promise<ApiResponse<Reward>> {
    try {
      return await api.post<Reward>(
        API_CONFIG.ENDPOINTS.REWARDS.CREATE,
        rewardData
      )
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create reward',
      }
    }
  }
  
  /**
   * Redeem a reward
   */
  async redeemReward(rewardId: string): Promise<ApiResponse<RewardRedemption>> {
    try {
      const data: RedeemRewardRequest = { rewardId }
      return await api.post<RewardRedemption>(
        API_CONFIG.ENDPOINTS.REWARDS.REDEEM,
        data
      )
    } catch (error) {
      return {
        success: false,
        error: 'Failed to redeem reward. Please check your points balance.',
      }
    }
  }
  
  /**
   * Get user's redemption history
   */
  async getUserRedemptions(): Promise<ApiResponse<RewardRedemption[]>> {
    try {
      return await api.get<RewardRedemption[]>(
        API_CONFIG.ENDPOINTS.REWARDS.USER_REDEMPTIONS
      )
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch redemption history',
      }
    }
  }
  
  /**
   * Update redemption status (Admin only)
   */
  async updateRedemptionStatus(
    redemptionId: string, 
    data: UpdateRedemptionStatusRequest
  ): Promise<ApiResponse<RewardRedemption>> {
    try {
      return await api.put<RewardRedemption>(
        API_CONFIG.ENDPOINTS.REWARDS.UPDATE_STATUS(redemptionId),
        data
      )
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update redemption status',
      }
    }
  }
  
  /**
   * Get reward details by ID
   */
  async getRewardById(rewardId: string): Promise<ApiResponse<Reward>> {
    try {
      return await api.get<Reward>(`/rewards/${rewardId}`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch reward details',
      }
    }
  }
  
  /**
   * Update reward (Admin only)
   */
  async updateReward(
    rewardId: string, 
    rewardData: Partial<CreateRewardRequest>
  ): Promise<ApiResponse<Reward>> {
    try {
      return await api.put<Reward>(`/rewards/${rewardId}`, rewardData)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update reward',
      }
    }
  }
  
  /**
   * Delete reward (Admin only)
   */
  async deleteReward(rewardId: string): Promise<ApiResponse<void>> {
    try {
      return await api.delete<void>(`/rewards/${rewardId}`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete reward',
      }
    }
  }
  
  /**
   * Get reward categories
   */
  async getRewardCategories(): Promise<ApiResponse<string[]>> {
    try {
      return await api.get<string[]>('/rewards/categories')
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch categories',
      }
    }
  }
  
  /**
   * Get partner list
   */
  async getPartners(): Promise<ApiResponse<string[]>> {
    try {
      return await api.get<string[]>('/rewards/partners')
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch partners',
      }
    }
  }
  
  /**
   * Check if user can redeem a specific reward
   */
  async canRedeemReward(rewardId: string): Promise<ApiResponse<{
    canRedeem: boolean
    reason?: string
  }>> {
    try {
      return await api.get(`/rewards/${rewardId}/can-redeem`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to check redemption eligibility',
      }
    }
  }
  
  /**
   * Get pending redemptions (Admin only)
   */
  async getPendingRedemptions(): Promise<ApiResponse<RewardRedemption[]>> {
    try {
      return await api.get<RewardRedemption[]>('/rewards/redemptions/pending')
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch pending redemptions',
      }
    }
  }
}

// Create singleton instance
const rewardsService = new RewardsService()

export default rewardsService