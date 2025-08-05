import { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../config/services.config';

const API_BASE_URL = getApiBaseUrl();

interface CsrfHook {
  csrfToken: string | null;
  isLoading: boolean;
  error: Error | null;
  refreshToken: () => Promise<void>;
}

export const useCsrf = (): CsrfHook => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCsrfToken = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
        withCredentials: true,
      });
      
      if (response.data.success && response.data.data.csrfToken) {
        setCsrfToken(response.data.data.csrfToken);
        
        // Set default header for all axios requests
        axios.defaults.headers.common['X-CSRF-Token'] = response.data.data.csrfToken;
      }
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch CSRF token:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCsrfToken();
    
    // Refresh token every 10 minutes
    const interval = setInterval(fetchCsrfToken, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    csrfToken,
    isLoading,
    error,
    refreshToken: fetchCsrfToken,
  };
};

// Axios interceptor to automatically add CSRF token
export const setupCsrfInterceptor = () => {
  axios.interceptors.request.use(
    (config) => {
      // Get CSRF token from cookie if using double submit pattern
      const csrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='));
      
      if (csrfCookie) {
        const token = csrfCookie.split('=')[1];
        config.headers['X-CSRF-Token'] = token;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Retry on CSRF failure
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 403 && 
          error.response?.data?.error?.includes('CSRF') && 
          !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Fetch new CSRF token
          const tokenResponse = await axios.get(`${API_BASE_URL}/csrf-token`, {
            withCredentials: true,
          });
          
          if (tokenResponse.data.success) {
            const newToken = tokenResponse.data.data.csrfToken;
            axios.defaults.headers.common['X-CSRF-Token'] = newToken;
            originalRequest.headers['X-CSRF-Token'] = newToken;
            
            return axios(originalRequest);
          }
        } catch (csrfError) {
          console.error('Failed to refresh CSRF token:', csrfError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};