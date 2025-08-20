// Unified Services Configuration - All services consolidated to port 5173
// This configuration ensures all API calls, WebSocket connections, and services
// use the same port (5173) with internal routing through Vite proxy

// Determine if we're in production based on the hostname
const isProduction = window.location.hostname === 'berse.app' || 
                     window.location.hostname === 'www.berse.app' ||
                     window.location.hostname.includes('netlify.app');

// Use production API if deployed, otherwise use environment variable or empty for proxy
const API_URL = isProduction 
  ? 'https://api.berse.app' 
  : (import.meta.env.VITE_API_URL || '');

const WS_URL = isProduction
  ? 'wss://api.berse.app'
  : 'ws://localhost:3000';

export const SERVICES_CONFIG = {
  // Base configuration - automatically switch between production and development
  BASE_URL: API_URL,
  WS_BASE_URL: WS_URL,
  
  // Main API Service (consolidated from multiple ports)
  MAIN_API: {
    baseUrl: API_URL ? `${API_URL}/api` : '/api',
    endpoints: {
      // User management
      auth: '/auth',
      users: '/users',
      profile: '/profile',
      
      // Events
      events: '/events',
      eventDetails: '/events',
      eventRegistration: '/events/register',
      
      // Communities  
      communities: '/communities',
      
      // Points & Rewards
      points: '/points',
      rewards: '/rewards',
      vouchers: '/vouchers',
      
      // Notifications
      notifications: '/notifications',
      
      // Matching system
      matching: '/matching',
      matches: '/matches'
    }
  },
  
  // Authentication Service
  AUTH_SERVICE: {
    get baseUrl() {
      // For localhost, use relative URL that Vite proxy will handle
      if (!API_URL || API_URL === '') {
        return '/api/v1/auth';  // Vite proxy will handle this
      }
      return `${API_URL}/api/v1/auth`;
    },
    endpoints: {
      login: '/login',
      register: '/register',
      refresh: '/refresh',
      logout: '/logout',
      verify: '/verify',
      'forgot-password': '/forgot-password',
      'reset-password': '/reset-password',
      'change-password': '/change-password'
    }
  },
  
  // Admin Service (formerly on port 8080)
  ADMIN_SERVICE: {
    baseUrl: API_URL ? `${API_URL}/api/admin` : '/api/admin',
    endpoints: {
      dashboard: '/dashboard',
      events: '/events',
      'events/create': '/events/create',
      'events/manage': '/events/manage',
      'events/analytics': '/events/analytics',
      users: '/users',
      communities: '/communities',
      'bersemukha-management': '/bersemukha-management',
      analytics: '/analytics',
      reports: '/reports'
    }
  },
  
  // Real-time Service (formerly on port 4000)
  REALTIME_SERVICE: {
    baseUrl: API_URL ? `${API_URL}/api/realtime` : '/api/realtime',
    websocket: WS_URL,
    endpoints: {
      'websocket-auth': '/ws-auth',
      'live-events': '/live-events',
      'live-matching': '/live-matching',
      'live-chat': '/live-chat',
      notifications: '/notifications'
    }
  },
  
  // Event Management Service
  EVENT_SERVICE: {
    baseUrl: API_URL ? `${API_URL}/api/events` : '/api/events',
    endpoints: {
      list: '/',
      create: '/create',
      details: '/:id',
      register: '/:id/register',
      checkin: '/:id/checkin',
      feedback: '/:id/feedback',
      'qr-generate': '/:id/qr',
      'chat-group': '/:id/chat',
      'manage': '/:id/manage',
      'bersemukha': '/:id/bersemukha'
    }
  },
  
  // User Service
  USER_SERVICE: {
    baseUrl: API_URL ? `${API_URL}/api/users` : '/api/users',
    endpoints: {
      profile: '/profile',
      'update-profile': '/profile/update',
      'upload-avatar': '/profile/avatar',
      preferences: '/preferences',
      'my-events': '/my-events',
      'my-communities': '/my-communities',
      'my-matches': '/my-matches'
    }
  },
  
  // Upload & Media Service
  MEDIA_SERVICE: {
    baseUrl: API_URL ? `${API_URL}/api/media` : '/api/media',
    endpoints: {
      upload: '/upload',
      'upload-avatar': '/upload/avatar',
      'upload-event-image': '/upload/event',
      'generate-qr': '/qr-generate'
    }
  },
  
  // Deep Link Configuration
  DEEP_LINKS: {
    baseUrl: isProduction ? 'https://berse.app' : 'http://localhost:5173',
    event: isProduction ? 'https://berse.app/event/' : 'http://localhost:5173/event/',
    'bersemukha-event': isProduction ? 'https://berse.app/bersemukha-event' : 'http://localhost:5173/bersemukha-event',
    auth: isProduction ? 'https://berse.app/auth/' : 'http://localhost:5173/auth/',
    register: isProduction ? 'https://berse.app/register' : 'http://localhost:5173/register',
    login: isProduction ? 'https://berse.app/login' : 'http://localhost:5173/login',
    profile: isProduction ? 'https://berse.app/profile' : 'http://localhost:5173/profile',
    admin: isProduction ? 'https://berse.app/admin/' : 'http://localhost:5173/admin/'
  }
};

// Helper functions for building URLs
export const buildApiUrl = (service: keyof typeof SERVICES_CONFIG, endpoint: string) => {
  const serviceConfig = SERVICES_CONFIG[service] as any;
  if (!serviceConfig?.baseUrl) {
    throw new Error(`Service ${service} not found in configuration`);
  }
  return `${serviceConfig.baseUrl}${endpoint}`;
};

export const buildWebSocketUrl = (path: string = '') => {
  return `${SERVICES_CONFIG.REALTIME_SERVICE.websocket}${path}`;
};

export const buildDeepLink = (type: keyof typeof SERVICES_CONFIG.DEEP_LINKS, id?: string) => {
  const baseUrl = SERVICES_CONFIG.DEEP_LINKS[type];
  return id ? `${baseUrl}${id}` : baseUrl;
};

// QR Code URL Generator
export const generateQRCodeUrl = (path: string) => {
  return `${SERVICES_CONFIG.BASE_URL}${path}`;
};

// Environment-based configuration
export const getApiBaseUrl = () => {
  // For production, use the correct API URL
  if (window.location.hostname === 'bersemuka.netlify.app' || 
      window.location.hostname === 'bersemuka.app' || 
      window.location.hostname === 'berse.app') {
    return 'https://api.berse.app';
  }
  
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Use environment variable as-is
    return envUrl;
  }
  // For localhost, return empty string to use relative URLs with Vite proxy
  return '';
};

export const getWebSocketUrl = () => {
  const envWsUrl = import.meta.env.VITE_WS_URL;
  if (envWsUrl) {
    // If environment variable is set, use it but ensure it points to 5173
    return envWsUrl.replace(/localhost:\d+/, 'localhost:5173');
  }
  // Default to port 5173
  return SERVICES_CONFIG.REALTIME_SERVICE.websocket;
};

// Export API_BASE_URL for backward compatibility
export const API_BASE_URL = SERVICES_CONFIG.BASE_URL;

// Export default configuration
export default SERVICES_CONFIG;