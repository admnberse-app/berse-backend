/**
 * User Service
 * Handles user profile, search, and social features
 */

import { API_CONFIG } from '../config/api.config'
import { api, uploadFile } from '../utils/api-client'
import authService from './auth.service'
import { 
  User,
  ApiResponse,
  UpdateProfileRequest,
  SearchUsersParams
} from '../types'

class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get<User>(API_CONFIG.ENDPOINTS.USERS.PROFILE)
      
      if (response.success && response.data) {
        // Update stored user data
        authService.updateStoredUser(response.data)
      }
      
      return response
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch profile',
      }
    }
  }
  
  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    try {
      const response = await api.put<User>(
        API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE,
        data
      )
      
      if (response.success && response.data) {
        // Update stored user data
        authService.updateStoredUser(response.data)
      }
      
      return response
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update profile',
      }
    }
  }
  
  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const response = await uploadFile(
        `${API_CONFIG.ENDPOINTS.USERS.PROFILE}/picture`,
        file,
        'profilePicture'
      )
      
      if (response.success) {
        // Refresh profile to get updated data
        await this.getProfile()
      }
      
      return response
    } catch (error) {
      return {
        success: false,
        error: 'Failed to upload profile picture',
      }
    }
  }
  
  /**
   * Search users
   */
  async searchUsers(params?: SearchUsersParams): Promise<ApiResponse<User[]>> {
    try {
      return await api.get<User[]>(API_CONFIG.ENDPOINTS.USERS.SEARCH, { params })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search users',
      }
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      return await api.get<User>(API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(userId))
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch user',
      }
    }
  }
  
  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await api.post<void>(API_CONFIG.ENDPOINTS.USERS.FOLLOW(userId))
    } catch (error) {
      return {
        success: false,
        error: 'Failed to follow user',
      }
    }
  }
  
  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await api.delete<void>(API_CONFIG.ENDPOINTS.USERS.UNFOLLOW(userId))
    } catch (error) {
      return {
        success: false,
        error: 'Failed to unfollow user',
      }
    }
  }
  
  /**
   * Get user suggestions for matching
   */
  async getMatchingSuggestions(filters?: {
    city?: string
    interests?: string[]
    limit?: number
  }): Promise<ApiResponse<User[]>> {
    try {
      const params = {
        city: filters?.city,
        interest: filters?.interests?.[0], // API accepts single interest for now
        limit: filters?.limit,
      }
      
      return await api.get<User[]>('/users/suggestions', { params })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch suggestions',
      }
    }
  }
  
  /**
   * Get user's connections/followers
   */
  async getUserConnections(userId?: string): Promise<ApiResponse<{
    followers: User[]
    following: User[]
  }>> {
    try {
      const id = userId || authService.getCurrentUser()?.id
      return await api.get(`/users/${id}/connections`)
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch connections',
      }
    }
  }
  
  /**
   * Update user interests
   */
  async updateInterests(interests: string[]): Promise<ApiResponse<User>> {
    return this.updateProfile({ interests })
  }
  
  /**
   * Update user location
   */
  async updateLocation(city: string): Promise<ApiResponse<User>> {
    return this.updateProfile({ city })
  }
  
  /**
   * Validate username availability
   */
  async checkUsernameAvailability(username: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      return await api.get('/users/check-username', { 
        params: { username } 
      })
    } catch (error) {
      return {
        success: false,
        error: 'Failed to check username',
      }
    }
  }
}

// Create singleton instance
const userService = new UserService()

export default userService