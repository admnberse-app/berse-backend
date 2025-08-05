// Unified Services Configuration - All services consolidated to port 5173
// This configuration ensures all API calls, WebSocket connections, and services
// use the same port (5173) with internal routing through Vite proxy

export const SERVICES_CONFIG = {
  // Base configuration - everything goes through port 5173
  BASE_URL: 'http://localhost:5173',
  WS_BASE_URL: 'ws://localhost:5173',
  
  // Main API Service (consolidated from multiple ports)
  MAIN_API: {
    baseUrl: 'http://localhost:5173/api',
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
  
  // Authentication Service (formerly on port 3000/3001)
  AUTH_SERVICE: {
    baseUrl: 'http://localhost:5173/api/auth',
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
    baseUrl: 'http://localhost:5173/api/admin',
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
    baseUrl: 'http://localhost:5173/api/realtime',
    websocket: 'ws://localhost:5173/ws',
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
    baseUrl: 'http://localhost:5173/api/events',
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
    baseUrl: 'http://localhost:5173/api/users',
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
    baseUrl: 'http://localhost:5173/api/media',
    endpoints: {
      upload: '/upload',
      'upload-avatar': '/upload/avatar',
      'upload-event-image': '/upload/event',
      'generate-qr': '/qr-generate'
    }
  },
  
  // Deep Link Configuration
  DEEP_LINKS: {
    baseUrl: 'http://localhost:5173',
    event: 'http://localhost:5173/event/',
    'bersemukha-event': 'http://localhost:5173/bersemukha-event',
    auth: 'http://localhost:5173/auth/',
    register: 'http://localhost:5173/register',
    login: 'http://localhost:5173/login',
    profile: 'http://localhost:5173/profile',
    admin: 'http://localhost:5173/admin/'
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
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // If environment variable is set, use it but ensure it points to 5173
    return envUrl.replace(/localhost:\d+/, 'localhost:5173');
  }
  // Default to port 5173
  return SERVICES_CONFIG.MAIN_API.baseUrl;
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

// Export default configuration
export default SERVICES_CONFIG;