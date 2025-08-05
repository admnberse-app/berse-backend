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
  register: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<void>;
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

      // Check if user is already logged in (try both services)
      let userData = null;
      
      try {
        if (authService.isAuthenticated()) {
          userData = await authService.getCurrentUser();
        } else if (mockAuthService.isAuthenticated()) {
          userData = mockAuthService.getCurrentUser(); // This one is sync
        }
        
        if (userData) {
          console.log('Found existing user session:', userData);
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
      // Try real backend first
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        console.log('Login successful with backend, setting user:', response.data.user);
        setUser(response.data.user);
        return;
      }
    } catch (error) {
      console.warn('Backend login failed, falling back to mock service:', error);
    }

    // Fallback to mock service if backend fails
    try {
      const mockResponse = await mockAuthService.login(email, password);
      if (mockResponse.success && mockResponse.data) {
        console.log('Login successful with mock service, setting user:', mockResponse.data.user);
        setUser(mockResponse.data.user);
        return;
      } else {
        throw new Error(mockResponse.error || 'Login failed');
      }
    } catch (mockError) {
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

  const register = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    try {
      // Try real backend first
      const response = await authService.register({ email, password, fullName, phoneNumber });
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
      const mockResponse = await mockAuthService.register(email, password, fullName, phoneNumber);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};