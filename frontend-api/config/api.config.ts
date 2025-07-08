/**
 * API Configuration for BerseMuka App
 * This file contains all the configuration needed for API communication
 */

export const API_CONFIG = {
  // Base URL for the API - update this based on your environment
  BASE_URL: (typeof window !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Authentication token key for localStorage
  AUTH_TOKEN_KEY: 'bersemuka_auth_token',
  USER_KEY: 'bersemuka_user',
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh',
    },
    
    // User management
    USERS: {
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
      SEARCH: '/users/search',
      GET_BY_ID: (id: string) => `/users/${id}`,
      FOLLOW: (id: string) => `/users/follow/${id}`,
      UNFOLLOW: (id: string) => `/users/follow/${id}`,
    },
    
    // Events
    EVENTS: {
      LIST: '/events',
      GET_BY_ID: (id: string) => `/events/${id}`,
      CREATE: '/events',
      UPDATE: (id: string) => `/events/${id}`,
      RSVP: (id: string) => `/events/${id}/rsvp`,
      CHECKIN: '/events/checkin',
    },
    
    // Points system
    POINTS: {
      GET_USER_POINTS: (id?: string) => `/points/user${id ? `/${id}` : ''}`,
      MANUAL_UPDATE: '/points/manual',
    },
    
    // Rewards
    REWARDS: {
      LIST: '/rewards',
      CREATE: '/rewards',
      REDEEM: '/rewards/redeem',
      USER_REDEMPTIONS: '/rewards/user',
      UPDATE_STATUS: (id: string) => `/rewards/${id}/status`,
    },
    
    // Badges
    BADGES: {
      LIST: '/badges',
      USER_BADGES: (id: string) => `/badges/user/${id}`,
      AWARD: '/badges/award',
    },
  },
  
  // WebSocket configuration for real-time features
  WEBSOCKET: {
    URL: (typeof window !== 'undefined' && import.meta.env?.VITE_WS_URL) || 'ws://localhost:3000',
    RECONNECT_INTERVAL: 5000,
    MAX_RECONNECT_ATTEMPTS: 5,
  },
}

// Content types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
}

// HTTP methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const

// Response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const