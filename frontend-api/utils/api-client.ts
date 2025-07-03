/**
 * Base API client with interceptors and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { API_CONFIG, HTTP_STATUS } from '../config/api.config'
import { ApiResponse, ApiError } from '../types'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management functions
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_CONFIG.AUTH_TOKEN_KEY)
    }
    return null
  },
  
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_CONFIG.AUTH_TOKEN_KEY, token)
    }
  },
  
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(API_CONFIG.AUTH_TOKEN_KEY)
    }
  },
  
  getUser: (): any => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(API_CONFIG.USER_KEY)
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        try {
          return JSON.parse(userStr)
        } catch (e) {
          console.error('Failed to parse user data:', e)
          localStorage.removeItem(API_CONFIG.USER_KEY)
          return null
        }
      }
    }
    return null
  },
  
  setUser: (user: any): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(user))
    }
  },
  
  removeUser: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(API_CONFIG.USER_KEY)
    }
  },
}

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = tokenManager.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        data: config.data,
        params: config.params,
      })
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      })
    }
    
    return response
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    
    // Handle 401 Unauthorized
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Clear auth data
      tokenManager.removeToken()
      tokenManager.removeUser()
      
      // Redirect to login if needed (you can emit an event here)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
    }
    
    // Format error response
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      code: error.code,
      details: error.response?.data,
    }
    
    // Log error in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        error: apiError,
      })
    }
    
    return Promise.reject(apiError)
  }
)

// Generic request handler
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<any>(config)
    
    // Check if the response is already wrapped in our API format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // Backend already wrapped the response, return it as-is
      return response.data as ApiResponse<T>
    }
    
    // Otherwise wrap it
    return {
      success: true,
      data: response.data as T,
    }
  } catch (error) {
    const apiError = error as ApiError
    return {
      success: false,
      error: apiError.message,
      message: apiError.message,
    }
  }
}

// Convenience methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'GET', url }),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'POST', url, data }),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'PUT', url, data }),
    
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'DELETE', url }),
    
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
}

// File upload helper
export async function uploadFile(
  url: string,
  file: File,
  fieldName: string = 'file',
  additionalData?: Record<string, any>
): Promise<ApiResponse<any>> {
  const formData = new FormData()
  formData.append(fieldName, file)
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }
  
  return apiRequest({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// Export the base client for custom use cases
export { apiClient }
export default apiClient