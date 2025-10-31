/**
 * Privacy Helper Utilities
 * Functions to filter user data based on privacy settings
 */

interface LocationData {
  currentCity?: string | null;
  currentLocation?: string | null;
  countryOfResidence?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: any;
}

interface PrivacySettings {
  showLocation?: boolean;
  locationPrecision?: string;
  [key: string]: any;
}

/**
 * Filter location data based on user's privacy settings
 * @param location - User's location data
 * @param privacy - User's privacy settings
 * @param isOwnProfile - Whether this is the user's own profile (skip filtering)
 * @returns Filtered location data
 */
export function filterLocationByPrivacy(
  location: LocationData | null | undefined,
  privacy: PrivacySettings | null | undefined,
  isOwnProfile: boolean = false
): LocationData | null {
  // If it's the user's own profile, show everything
  if (isOwnProfile) {
    return location || null;
  }

  // If no location data or no privacy settings, return null
  if (!location || !privacy) {
    return null;
  }

  // If user has disabled location sharing completely
  if (privacy.showLocation === false) {
    return null;
  }

  // Filter based on location precision
  const precision = privacy.locationPrecision || 'city';
  
  switch (precision) {
    case 'hidden':
      return null;
      
    case 'country':
      // Only show country
      return {
        countryOfResidence: location.countryOfResidence,
      };
      
    case 'city':
      // Show city and country, but not exact coordinates
      return {
        currentCity: location.currentCity,
        currentLocation: location.currentLocation,
        countryOfResidence: location.countryOfResidence,
      };
      
    case 'exact':
      // Show everything including coordinates
      return location;
      
    default:
      // Default to city level for unknown precision values
      return {
        currentCity: location.currentCity,
        currentLocation: location.currentLocation,
        countryOfResidence: location.countryOfResidence,
      };
  }
}

/**
 * Filter multiple users' location data based on their privacy settings
 * @param users - Array of users with location and privacy data
 * @param currentUserId - ID of the viewing user (to determine if it's their own profile)
 * @returns Users with filtered location data
 */
export function filterUsersLocationByPrivacy<T extends {
  id: string;
  location?: LocationData | null;
  privacy?: PrivacySettings | null;
}>(users: T[], currentUserId?: string): T[] {
  return users.map(user => ({
    ...user,
    location: filterLocationByPrivacy(
      user.location,
      user.privacy,
      user.id === currentUserId
    ),
  }));
}

/**
 * Check if user's location should be visible based on privacy settings
 * @param privacy - User's privacy settings
 * @returns Boolean indicating if location should be shown
 */
export function shouldShowLocation(privacy: PrivacySettings | null | undefined): boolean {
  if (!privacy) return true; // Default to showing if no privacy settings
  
  if (privacy.showLocation === false) return false;
  if (privacy.locationPrecision === 'hidden') return false;
  
  return true;
}

/**
 * Get the appropriate distance/proximity text based on privacy settings
 * @param actualDistance - The actual calculated distance
 * @param privacy - User's privacy settings
 * @returns Filtered distance string or null
 */
export function filterDistanceByPrivacy(
  actualDistance: number | null | undefined,
  privacy: PrivacySettings | null | undefined
): string | null {
  if (!actualDistance || !shouldShowLocation(privacy)) {
    return null;
  }

  const precision = privacy?.locationPrecision || 'city';
  
  switch (precision) {
    case 'hidden':
      return null;
      
    case 'country':
      // Show only if in same country (no specific distance)
      return 'Same country';
      
    case 'city':
      // Show city-level proximity (rounded)
      if (actualDistance < 50) return 'Nearby';
      if (actualDistance < 100) return 'Same city';
      return 'Same region';
      
    case 'exact':
      // Show exact distance
      if (actualDistance < 1) return `${Math.round(actualDistance * 1000)}m away`;
      return `${actualDistance.toFixed(1)}km away`;
      
    default:
      return 'Nearby';
  }
}
