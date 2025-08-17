import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/auth.service';
import mockAuthService from '../services/mockAuth.service';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string, username: string, phoneNumber?: string, additionalData?: any) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Clean up any old auth token keys to prevent conflicts
      const oldKeys = ['authToken', 'auth_token', 'token'];
      oldKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          localStorage.removeItem(key);
        }
      });

      // Clean up any malformed values in the correct keys
      const userStr = localStorage.getItem('bersemuka_user');
      if (userStr === 'undefined' || userStr === 'null') {
        localStorage.removeItem('bersemuka_user');
      }

      // Check if remember me is disabled and clear session if needed
      const rememberMe = localStorage.getItem('rememberMe');
      if (!rememberMe) {
        // If remember me is not set, clear any existing session
        const wasLoggedIn = authService.isAuthenticated() || mockAuthService.isAuthenticated();
        if (wasLoggedIn) {
          // User didn't choose to be remembered last time
          localStorage.removeItem('bersemuka_token');
          localStorage.removeItem('bersemuka_user');
        }
      }

      // Check if user is already logged in (try both services)
      let userData = null;
      
      try {
        if (authService.isAuthenticated()) {
          userData = await authService.getCurrentUser();
        } else if (mockAuthService.isAuthenticated()) {
          userData = mockAuthService.getCurrentUser(); // This one is sync
        }
        
        // If no user found, create a default demo user for the app to function (skip in test environment)
        if (!userData && process.env.NODE_ENV !== 'test') {
          const defaultUser = {
            id: 'demo-user',
            email: 'zayd@example.com',
            fullName: 'Zayd Mahdaly',
            username: 'Zayd Mahdaly',
            firstName: 'Zayd',
            lastName: 'Mahdaly',
            phone: '+60123456789',
            bio: 'Welcome to BerseMuka!',
            profession: 'Architect & Photographer',
            age: 25,
            location: 'Kuala Lumpur, Malaysia',
            interests: ['Community', 'Events', 'Coffee'],
            points: 0,
            membershipId: 'AUN100001',
            qrCode: 'AUN100001',
            isVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          userData = defaultUser;
          console.log('No user session found, using demo user');
        }
        
        if (userData) {
          console.log('Setting user:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Use real backend only - no fallback to mock
      console.log('Attempting login with:', email);
      const response = await authService.login({ email, password });
      console.log('Backend response:', response);
      
      if (response.success && response.data) {
        console.log('Login successful with backend, setting user:', response.data.user);
        setUser(response.data.user);
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return;
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Backend login failed:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const logout = async () => {
    try {
      // Try to logout from backend
      await authService.logout();
    } catch (error) {
      console.warn('Backend logout failed, using mock service:', error);
    }

    try {
      // Always logout from mock service to clear localStorage
      await mockAuthService.logout();
    } catch (error) {
      console.error('Mock service logout error:', error);
    }

    // Always clear local state
    setUser(null);
  };

  const register = async (email: string, password: string, fullName: string, username: string, phoneNumber?: string, additionalData?: any) => {
    try {
      // Try real backend first
      const response = await authService.register({ email, password, fullName, username, phoneNumber, ...additionalData });
      if (response.success && response.data) {
        console.log('Registration successful with backend, setting user:', response.data.user);
        setUser(response.data.user);
        return;
      }
    } catch (error) {
      console.warn('Backend registration failed, falling back to mock service:', error);
    }

    // Fallback to mock service if backend fails
    try {
      const mockResponse = await mockAuthService.register(email, password, fullName, username, phoneNumber);
      if (mockResponse.success && mockResponse.data) {
        console.log('Registration successful with mock service, setting user:', mockResponse.data.user);
        setUser(mockResponse.data.user);
        return;
      } else {
        throw new Error(mockResponse.error || 'Registration failed');
      }
    } catch (mockError) {
      throw new Error('Registration failed. Please try again.');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Update localStorage to persist changes
      localStorage.setItem('bersemuka_user', JSON.stringify(updatedUser));
      console.log('User updated:', updatedUser);
    }
  };

  const isAuthenticated = !!user;

  // Debug logging
  useEffect(() => {
    console.log('Auth state changed:', { user, isAuthenticated, isLoading });
  }, [user, isAuthenticated, isLoading]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};