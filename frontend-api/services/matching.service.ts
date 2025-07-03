/**
 * Matching Service
 * Handles user matching, connections, and social features
 */

import { api } from '../utils/api-client'
import { 
  User,
  ApiResponse
} from '../types'

interface MatchingPreferences {
  interests?: string[]
  city?: string
  ageRange?: { min: number; max: number }
  gender?: string
}

interface Match {
  user: User
  matchScore: number
  commonInterests: string[]
  mutualConnections: number
}

interface ConnectionRequest {
  id: string
  fromUserId: string
  toUserId: string
  message?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  fromUser?: User
  toUser?: User
}

class MatchingService {
  /**
   * Get potential matches based on preferences
   */
  async getPotentialMatches(preferences?: MatchingPreferences): Promise<ApiResponse<Match[]>> {
    try {
      return await api.get<Match[]>('/matching/suggestions', { params: preferences })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch matches',
      }
    }
  }
  
  /**
   * Get users with similar interests
   */
  async getSimilarUsers(limit: number = 10): Promise<ApiResponse<User[]>> {
    try {
      return await api.get<User[]>('/matching/similar', { params: { limit } })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch similar users',
      }
    }
  }
  
  /**
   * Send connection request
   */
  async sendConnectionRequest(
    userId: string, 
    message?: string
  ): Promise<ApiResponse<ConnectionRequest>> {
    try {
      return await api.post<ConnectionRequest>('/matching/connect', {
        toUserId: userId,
        message
      })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to send connection request',
      }
    }
  }
  
  /**
   * Get pending connection requests
   */
  async getPendingRequests(): Promise<ApiResponse<ConnectionRequest[]>> {
    try {
      return await api.get<ConnectionRequest[]>('/matching/requests/pending')
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch pending requests',
      }
    }
  }
  
  /**
   * Accept connection request
   */
  async acceptConnectionRequest(requestId: string): Promise<ApiResponse<void>> {
    try {
      return await api.put<void>(`/matching/requests/${requestId}/accept`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to accept request',
      }
    }
  }
  
  /**
   * Reject connection request
   */
  async rejectConnectionRequest(requestId: string): Promise<ApiResponse<void>> {
    try {
      return await api.put<void>(`/matching/requests/${requestId}/reject`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to reject request',
      }
    }
  }
  
  /**
   * Get mutual connections with a user
   */
  async getMutualConnections(userId: string): Promise<ApiResponse<User[]>> {
    try {
      return await api.get<User[]>(`/matching/mutual/${userId}`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch mutual connections',
      }
    }
  }
  
  /**
   * Get users attending the same event
   */
  async getEventAttendees(eventId: string): Promise<ApiResponse<User[]>> {
    try {
      return await api.get<User[]>(`/matching/event/${eventId}/attendees`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch event attendees',
      }
    }
  }
  
  /**
   * Get nearby users (if location sharing is enabled)
   */
  async getNearbyUsers(radius: number = 10): Promise<ApiResponse<User[]>> {
    try {
      return await api.get<User[]>('/matching/nearby', { params: { radius } })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch nearby users',
      }
    }
  }
  
  /**
   * Block a user
   */
  async blockUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await api.post<void>(`/matching/block/${userId}`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to block user',
      }
    }
  }
  
  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await api.delete<void>(`/matching/block/${userId}`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to unblock user',
      }
    }
  }
  
  /**
   * Get blocked users list
   */
  async getBlockedUsers(): Promise<ApiResponse<User[]>> {
    try {
      return await api.get<User[]>('/matching/blocked')
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch blocked users',
      }
    }
  }
  
  /**
   * Report a user
   */
  async reportUser(
    userId: string, 
    reason: string, 
    description?: string
  ): Promise<ApiResponse<void>> {
    try {
      return await api.post<void>('/matching/report', {
        reportedUserId: userId,
        reason,
        description
      })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to report user',
      }
    }
  }
  
  /**
   * Update matching preferences
   */
  async updatePreferences(preferences: MatchingPreferences): Promise<ApiResponse<void>> {
    try {
      return await api.put<void>('/matching/preferences', preferences)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update preferences',
      }
    }
  }
  
  /**
   * Get matching statistics
   */
  async getMatchingStats(): Promise<ApiResponse<{
    totalConnections: number
    pendingRequests: number
    mutualMatches: number
    profileViews: number
  }>> {
    try {
      return await api.get('/matching/stats')
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch statistics',
      }
    }
  }
}

// Create singleton instance
const matchingService = new MatchingService()

export default matchingService