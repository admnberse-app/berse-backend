import axios from 'axios';

interface TokenRefreshResponse {
  success: boolean;
  data?: {
    token: string;
    user: any;
  };
  message?: string;
}

export const getApiUrl = (endpoint: string): string => {
  const isLocalhost = window.location.hostname === 'localhost';
  const baseUrl = isLocalhost ? '' : 'https://api.berse.app';
  return `${baseUrl}${endpoint}`;
};

export const getAuthToken = (): string | null => {
  // Check multiple possible token locations
  return localStorage.getItem('bersemuka_token') || 
         localStorage.getItem('auth_token') ||
         localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('bersemuka_token', token);
  localStorage.setItem('auth_token', token);
  localStorage.setItem('token', token);
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem('bersemuka_token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userProfile');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    // Decode JWT token (basic check without library)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return false; // No expiration set
    
    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    return Date.now() >= exp * 1000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if can't decode
  }
};

export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const currentToken = getAuthToken();
    if (!currentToken) return null;

    const response = await axios.post(
      getApiUrl('/api/v1/auth/refresh'),
      {},
      {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success && response.data.data?.token) {
      const newToken = response.data.data.token;
      setAuthToken(newToken);
      return newToken;
    }

    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
};

export const makeAuthenticatedRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any,
  retryOnUnauthorized: boolean = true
): Promise<any> => {
  let token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please login.');
  }

  // Check if token is expired and try to refresh
  if (isTokenExpired(token)) {
    console.log('Token expired, attempting to refresh...');
    const newToken = await refreshAuthToken();
    if (newToken) {
      token = newToken;
    } else {
      clearAuthTokens();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
  }

  try {
    const config: any = {
      method,
      url: getApiUrl(endpoint),
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    }

    const response = await axios(config);
    return response;
  } catch (error: any) {
    if (error.response?.status === 401 && retryOnUnauthorized) {
      console.log('Got 401, attempting to refresh token...');
      
      // Try to refresh token and retry once
      const newToken = await refreshAuthToken();
      if (newToken) {
        return makeAuthenticatedRequest(method, endpoint, data, false);
      }
      
      // If refresh failed, clear tokens and redirect to login
      clearAuthTokens();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    throw error;
  }
};

// Helper function to validate current session
export const validateSession = async (): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) return false;

    // Try to get user profile to validate token
    const response = await makeAuthenticatedRequest('GET', '/api/v1/users/profile');
    return response.data.success === true;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
};

// Re-login helper
export const reAuthenticate = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await axios.post(
      getApiUrl('/api/v1/auth/login'),
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success && response.data.data?.token) {
      setAuthToken(response.data.data.token);
      
      // Store user data
      if (response.data.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return true;
    }

    return false;
  } catch (error) {
    console.error('Re-authentication failed:', error);
    return false;
  }
};