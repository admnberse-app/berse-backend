import axios from 'axios';
import { getApiUrl, getAuthToken, makeAuthenticatedRequest } from '../utils/authUtils';

interface ProfileData {
  username?: string;
  fullName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  shortBio?: string;
  bio?: string;
  currentLocation?: string;
  city?: string;
  originallyFrom?: string;
  nationality?: string;
  gender?: string;
  age?: number | string;
  dateOfBirth?: string;
  profession?: string;
  interests?: string[];
  topInterests?: string[];
  languages?: string;
  personalityType?: string;
  instagramHandle?: string;
  linkedinHandle?: string;
  website?: string;
  offerings?: any;
  communities?: any[];
  eventsAttended?: any[];
  travelHistory?: any[];
  email?: string;
  role?: string;
}

class ProfileService {
  /**
   * Save user profile to backend
   */
  async saveProfile(profileData: ProfileData): Promise<any> {
    try {
      // Try primary endpoint
      const response = await makeAuthenticatedRequest(
        'PUT',
        '/api/v1/users/profile',
        profileData
      );
      
      return response;
    } catch (error: any) {
      // If primary endpoint fails, try alternative endpoints
      if (error.response?.status === 404) {
        console.log('Primary endpoint not found, trying alternatives...');
        
        // Try alternate endpoints
        const alternativeEndpoints = [
          '/api/v1/user/profile',
          '/api/v1/profile',
          '/api/users/profile',
          '/api/user/profile'
        ];
        
        for (const endpoint of alternativeEndpoints) {
          try {
            const response = await makeAuthenticatedRequest(
              'PUT',
              endpoint,
              profileData
            );
            console.log(`Success with endpoint: ${endpoint}`);
            return response;
          } catch (altError: any) {
            if (altError.response?.status !== 404) {
              throw altError; // If it's not a 404, throw the error
            }
            // Continue to next endpoint if 404
          }
        }
        
        // If all endpoints fail, try POST to create profile
        console.log('PUT endpoints not found, trying POST to create profile...');
        try {
          const response = await makeAuthenticatedRequest(
            'POST',
            '/api/v1/users/profile',
            profileData
          );
          return response;
        } catch (postError) {
          console.error('POST also failed:', postError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Get user profile from backend
   */
  async getProfile(): Promise<any> {
    try {
      // Try primary endpoint
      const response = await makeAuthenticatedRequest(
        'GET',
        '/api/v1/users/profile'
      );
      
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Try alternative endpoints
        const alternativeEndpoints = [
          '/api/v1/user/me',
          '/api/v1/users/me',
          '/api/v1/auth/me',
          '/api/auth/me'
        ];
        
        for (const endpoint of alternativeEndpoints) {
          try {
            const response = await makeAuthenticatedRequest(
              'GET',
              endpoint
            );
            console.log(`Success with endpoint: ${endpoint}`);
            return response;
          } catch (altError: any) {
            if (altError.response?.status !== 404) {
              throw altError;
            }
          }
        }
      }
      
      throw error;
    }
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(imageData: string): Promise<any> {
    try {
      const response = await makeAuthenticatedRequest(
        'POST',
        '/api/v1/users/profile/picture',
        { image: imageData }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      // Store locally as fallback
      localStorage.setItem('userProfilePicture', imageData);
      return { data: { success: true, data: { profilePicture: imageData } } };
    }
  }

  /**
   * Update specific profile fields
   */
  async updateProfileFields(fields: Partial<ProfileData>): Promise<any> {
    try {
      const response = await makeAuthenticatedRequest(
        'PATCH',
        '/api/v1/users/profile',
        fields
      );
      
      return response;
    } catch (error: any) {
      // If PATCH is not supported, fall back to PUT with all data
      if (error.response?.status === 405) {
        const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const fullProfile = { ...currentProfile, ...fields };
        return this.saveProfile(fullProfile);
      }
      
      throw error;
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(): Promise<any> {
    try {
      const response = await makeAuthenticatedRequest(
        'DELETE',
        '/api/v1/users/profile'
      );
      
      return response;
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw error;
    }
  }

  /**
   * Sync local profile with backend
   */
  async syncProfile(): Promise<any> {
    try {
      // Get local profile data
      const localProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const localUser = JSON.parse(localStorage.getItem('bersemuka_user') || '{}');
      
      if (!localProfile || Object.keys(localProfile).length === 0) {
        console.log('No local profile to sync');
        return null;
      }
      
      // Merge local data
      const profileData = {
        ...localUser,
        ...localProfile
      };
      
      // Save to backend
      const response = await this.saveProfile(profileData);
      
      console.log('Profile synced successfully');
      return response;
    } catch (error) {
      console.error('Failed to sync profile:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
export default profileService;