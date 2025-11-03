import { storageService } from '../services/storage.service';

/**
 * Transform a profile picture path to a full CDN URL
 * @param profilePicturePath - The path/key stored in the database
 * @returns Full CDN URL or null if no picture
 */
export function getProfilePictureUrl(profilePicturePath: string | null | undefined): string | null {
  if (!profilePicturePath) {
    return null;
  }

  // Already a full URL - return as is
  if (
    profilePicturePath.startsWith('http://') ||
    profilePicturePath.startsWith('https://') ||
    profilePicturePath.startsWith('data:')
  ) {
    return profilePicturePath;
  }

  // Transform path to full CDN URL
  return storageService.getPublicUrl(profilePicturePath);
}

/**
 * Transform profile picture in a user object
 * @param user - User object with profile.profilePicture
 * @returns User object with transformed profilePicture URL
 */
export function transformUserProfilePicture<T extends { profile?: { profilePicture?: string | null } | null }>(
  user: T
): T {
  if (!user?.profile?.profilePicture) {
    return user;
  }

  return {
    ...user,
    profile: {
      ...user.profile,
      profilePicture: getProfilePictureUrl(user.profile.profilePicture),
    },
  };
}

/**
 * Transform an image path/key to a full CDN URL
 * @param imagePath - The path/key stored in the database
 * @returns Full CDN URL or null if no image
 */
export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) {
    return null;
  }

  // Already a full URL - return as is
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath;
  }

  // Transform path to full CDN URL
  return storageService.getPublicUrl(imagePath);
}

/**
 * Transform multiple image paths to full CDN URLs
 * @param imagePaths - Array of paths/keys
 * @returns Array of full CDN URLs
 */
export function getImageUrls(imagePaths: (string | null | undefined)[]): (string | null)[] {
  return imagePaths.map(path => getImageUrl(path));
}
