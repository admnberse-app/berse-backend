/**
 * Authentication Service
 * Handles login, register, logout, and token management
 */

import { API_CONFIG } from '../config/api.config'
import { api, tokenManager } from '../utils/api-client'
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse,
  User 
} from '../types'

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      )
      
      console.log('Auth service login response:', response)
      
      if (response.success && response.data) {
        // Store token and user data
        console.log('Storing token:', response.data.token)
        console.log('Storing user:', response.data.user)
        tokenManager.setToken(response.data.token)
        tokenManager.setUser(response.data.user)
      }
      
      return response
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'Login failed. Please check your credentials.',
      }
    }
  }
  
  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      )
      
      if (response.success && response.data) {
        // Store token and user data
        tokenManager.setToken(response.data.token)
        tokenManager.setUser(response.data.user)
      }
      
      return response
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      }
    }
  }
  
  /**
   * Logout user
   */
  async logout(): Promise<void> {
    // Clear local storage
    tokenManager.removeToken()
    tokenManager.removeUser()
    
    // Emit logout event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    
    // Optional: Call logout endpoint if backend tracks sessions
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      // Ignore logout endpoint errors
      console.error('Logout endpoint error:', error)
    }
  }
  
  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return tokenManager.getUser()
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenManager.getToken()
  }
  
  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await api.post<{ token: string }>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN
      )
      
      if (response.success && response.data) {
        tokenManager.setToken(response.data.token)
      }
      
      return response
    } catch (error) {
      return {
        success: false,
        error: 'Failed to refresh token',
      }
    }
  }
  
  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }
  
  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN')
  }
  
  /**
   * Check if user is moderator
   */
  isModerator(): boolean {
    return this.hasRole('MODERATOR')
  }
  
  /**
   * Update stored user data (useful after profile updates)
   */
  updateStoredUser(user: User): void {
    tokenManager.setUser(user)
  }
}

// Create singleton instance
const authService = new AuthService()

// Event listeners for auth state changes
// Navigation should be handled by the React app, not here
// if (typeof window !== 'undefined') {
//   window.addEventListener('auth:logout', () => {
//     // Let React Router handle navigation
//   })
// }

export default authService