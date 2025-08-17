import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import authService from '../../services/auth.service';
import mockAuthService from '../../services/mockAuth.service';

// Mock services
vi.mock('../../services/auth.service');
vi.mock('../../services/mockAuth.service');

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with no user and loading state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      // After loading, should have no user (in test environment)
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should throw error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleError.mockRestore();
    });
  });

  describe('Login', () => {
    it('should login successfully with backend service', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        avatar: '',
        bio: '',
        profession: '',
        age: 25,
        location: '',
        interests: [],
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(authService.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          token: 'mock-token',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it.skip('should fallback to mock service when backend fails', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        avatar: '',
        bio: '',
        profession: '',
        age: 25,
        location: '',
        interests: [],
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(authService.login).mockRejectedValue(new Error('Backend error'));
      vi.mocked(mockAuthService.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          token: 'mock-token',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('should handle login failure', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));
      vi.mocked(mockAuthService.login).mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrong-password');
        })
      ).rejects.toThrow('Login failed. Please check your credentials.');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        avatar: '',
        bio: '',
        profession: '',
        age: 25,
        location: '',
        interests: [],
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Setup initial authenticated state
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(authService.logout).toHaveBeenCalled();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('Register', () => {
    it('should register successfully with backend service', async () => {
      const mockUser = {
        id: '1',
        email: 'newuser@example.com',
        fullName: 'New User',
        firstName: 'New',
        lastName: 'User',
        avatar: '',
        bio: '',
        profession: '',
        age: 25,
        location: '',
        interests: [],
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(authService.register).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          token: 'mock-token',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register(
          'newuser@example.com',
          'password',
          'New User',
          'newuser',  // username
          '1234567890'  // phoneNumber
        );
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(authService.register).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password',
        fullName: 'New User',
        username: 'newuser',
        phoneNumber: '1234567890',
      });
    });
  });

  describe('Persistence', () => {
    it('should restore session from localStorage on mount', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        avatar: '',
        bio: '',
        profession: '',
        age: 25,
        location: '',
        interests: [],
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clean up malformed localStorage values', async () => {
      localStorage.setItem('bersemuka_user', 'undefined');
      localStorage.setItem('authToken', 'old-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(localStorage.getItem('bersemuka_user')).toBeFalsy();
      expect(localStorage.getItem('authToken')).toBeFalsy();
    });
  });
});