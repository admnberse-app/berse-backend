import { User, AuthResponse, LoginRequest, RegisterRequest, ApiResponse } from '../types';

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('bersemuka_token');
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Direct URL to avoid buildApiUrl issues
      const loginUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? '/api/v1/auth/login'
        : 'https://api.berse.app/api/v1/auth/login';
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: AuthResponse = await response.json();
      
      if (data.success) {
        this.token = data.data.token;
        localStorage.setItem('bersemuka_token', this.token);
        localStorage.setItem('bersemuka_user', JSON.stringify(data.data.user));
        return data;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Direct URL to avoid buildApiUrl issues
      const registerUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? '/api/v1/auth/register'
        : 'https://api.berse.app/api/v1/auth/register';
      
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data: AuthResponse = await response.json();
      
      if (data.success) {
        this.token = data.data.token;
        localStorage.setItem('bersemuka_token', this.token);
        localStorage.setItem('bersemuka_user', JSON.stringify(data.data.user));
        return data;
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    try {
      // Direct URL to avoid buildApiUrl issues
      const meUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? '/api/auth/me'
        : 'https://api.berse.app/api/auth/me';
      
      const response = await fetch(meUrl, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      const data: ApiResponse<User> = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('bersemuka_token');
    localStorage.removeItem('bersemuka_user');
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getToken(): string | null {
    return this.token;
  }

  // Mock auth methods for development
  async mockLogin(email: string): Promise<AuthResponse> {
    const mockUser: User = {
      id: '1',
      email: email,
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      avatar: '',
      bio: 'A test user for development',
      profession: 'Developer',
      age: 25,
      location: 'Kuala Lumpur, Malaysia',
      interests: ['Technology', 'Coffee', 'Travel'],
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const authResponse: AuthResponse = {
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token-' + Date.now(),
      },
    };

    this.token = authResponse.data.token;
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('user', JSON.stringify(mockUser));

    return authResponse;
  }
}

export const authService = new AuthService();
export default authService;