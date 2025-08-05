import { User, ApiResponse } from '../types';
import { authService } from './auth.service';
import { SERVICES_CONFIG, buildApiUrl } from '../config/services.config';

interface UpdateUserRequest {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profession?: string;
  age?: number;
  location?: string;
  interests?: string[];
}

class UserService {
  async updateProfile(updates: UpdateUserRequest): Promise<User> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(buildApiUrl('USER_SERVICE', '/update-profile'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data: ApiResponse<User> = await response.json();
      
      if (data.success) {
        // Update cached user data
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async uploadAvatar(file: File): Promise<string> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(buildApiUrl('MEDIA_SERVICE', '/upload-avatar'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data: ApiResponse<{ avatarUrl: string }> = await response.json();
      
      if (data.success) {
        return data.data.avatarUrl;
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  }

  async getProfile(): Promise<User | null> {
    try {
      const token = authService.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(buildApiUrl('USER_SERVICE', '/profile'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get profile');
      }

      const data: ApiResponse<User> = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Get profile error:', error);
      // Return cached user data if available
      const cachedUser = localStorage.getItem('user');
      return cachedUser ? JSON.parse(cachedUser) : null;
    }
  }

  async deleteAccount(): Promise<boolean> {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(buildApiUrl('USER_SERVICE', '/profile'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      const data: ApiResponse<boolean> = await response.json();
      
      if (data.success) {
        // Clear all local data
        authService.logout();
        return true;
      } else {
        throw new Error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      return false;
    }
  }

  // Get cached user data from localStorage
  getCachedUser(): User | null {
    try {
      const cachedUser = localStorage.getItem('user');
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch (error) {
      console.error('Get cached user error:', error);
      return null;
    }
  }
}

export const userService = new UserService();
export default userService;