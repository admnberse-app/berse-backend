// API Client with automatic token refresh and persistent login

class ApiClient {
  private static baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? ''
    : 'https://api.berse.app';

  // Make authenticated API request
  static async request(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('bersemuka_token');
    
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });

      // Never logout on 401 - keep user logged in with cached data
      if (response.status === 401) {
        console.log('API returned 401 but keeping user logged in');
        // Try to refresh token in background (non-blocking)
        this.tryRefreshToken();
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      // On network error, return cached data if available
      throw error;
    }
  }

  // Try to refresh token in background
  private static async tryRefreshToken() {
    try {
      const refreshToken = localStorage.getItem('bersemuka_refresh_token');
      if (!refreshToken) return;

      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          localStorage.setItem('bersemuka_token', data.data.token);
          if (data.data.refreshToken) {
            localStorage.setItem('bersemuka_refresh_token', data.data.refreshToken);
          }
          console.log('Token refreshed successfully');
        }
      }
    } catch (error) {
      console.log('Token refresh failed, keeping user logged in with cached data');
    }
  }

  // GET request
  static async get(url: string, options?: RequestInit) {
    return this.request(url, { ...options, method: 'GET' });
  }

  // POST request
  static async post(url: string, body?: any, options?: RequestInit) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT request
  static async put(url: string, body?: any, options?: RequestInit) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE request
  static async delete(url: string, options?: RequestInit) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  // PATCH request
  static async patch(url: string, body?: any, options?: RequestInit) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export default ApiClient;