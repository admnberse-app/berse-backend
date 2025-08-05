/**
 * Mock Authentication Service for Development
 * This service provides fake authentication while backend is being set up
 */

import { User } from '../types';

interface MockUser extends Omit<User, 'createdAt' | 'updatedAt'> {
  level: number;
  role: string;
}

interface MockAuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

// Mock users database
const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    phone: '+60123456789',
    bio: 'A test user for development',
    profession: 'Software Developer',
    age: 28,
    location: 'Kuala Lumpur, Malaysia',
    interests: ['Technology', 'Coffee', 'Travel'],
    points: 245,
    isVerified: true,
    level: 3,
    role: 'USER'
  },
  {
    id: '2', 
    email: 'admin@bersemuka.com',
    fullName: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+60987654321',
    bio: 'Administrator of BerseMuka',
    profession: 'Product Manager',
    age: 32,
    location: 'Kuala Lumpur, Malaysia',
    interests: ['Management', 'Community Building'],
    points: 1000,
    isVerified: true,
    level: 5,
    role: 'ADMIN'
  },
  {
    id: '3',
    email: 'zara@example.com', 
    fullName: 'Zara Aisha',
    firstName: 'Zara',
    lastName: 'Aisha',
    phone: '+60123456789',
    bio: 'Love meeting new people and exploring cafes',
    profession: 'Marketing Specialist',
    age: 25,
    location: 'Kuala Lumpur, Malaysia',
    interests: ['Marketing', 'Photography', 'Coffee'],
    points: 245,
    isVerified: true,
    level: 3,
    role: 'USER'
  }
];

class MockAuthService {
  private readonly TOKEN_KEY = 'bersemuka_auth_token';
  private readonly USER_KEY = 'bersemuka_user';

  private convertToUser(mockUser: MockUser): User {
    const { level, role, ...userFields } = mockUser;
    return {
      ...userFields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Mock login - accepts any email from mock users with password "password"
   */
  async login(email: string, password: string): Promise<MockAuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return {
        success: false,
        error: 'User not found. Try test@example.com or admin@bersemuka.com'
      };
    }

    if (password !== 'password') {
      return {
        success: false,
        error: 'Invalid password. Use "password" for all mock users'
      };
    }

    const token = this.generateMockToken(user);
    
    // Store in localStorage
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    const userForResponse = this.convertToUser(user);
    
    return {
      success: true,
      data: {
        user: userForResponse,
        token
      }
    };
  }

  /**
   * Mock registration
   */
  async register(email: string, password: string, fullName: string, phone?: string): Promise<MockAuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return {
        success: false,
        error: 'User already exists with this email'
      };
    }

    // Create new mock user
    const newUser: MockUser = {
      id: (mockUsers.length + 1).toString(),
      email,
      fullName,
      firstName: fullName.split(' ')[0],
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      phone,
      bio: '',
      profession: '',
      age: undefined,
      location: '',
      interests: [],
      points: 0,
      isVerified: false,
      level: 1,
      role: 'USER'
    };

    // Add to mock database
    mockUsers.push(newUser);

    const token = this.generateMockToken(newUser);
    
    // Store in localStorage
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));

    const userForResponse = this.convertToUser(newUser);
    
    return {
      success: true,
      data: {
        user: userForResponse,
        token
      }
    };
  }

  /**
   * Mock logout
   */
  async logout(): Promise<void> {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const mockUser: MockUser = JSON.parse(userStr);
        return this.convertToUser(mockUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Generate a mock JWT token
   */
  private generateMockToken(user: MockUser): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  }
}

export const mockAuthService = new MockAuthService();
export default mockAuthService;