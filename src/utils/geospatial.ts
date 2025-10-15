/**
 * Geospatial utility functions for location-based operations
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if coordinates are within a bounding box
 * This is more efficient than calculating distance for each point
 */
export function isWithinBoundingBox(
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
  radiusKm: number
): boolean {
  // Approximate degrees per km at the given latitude
  const latDegreePerKm = 1 / 110.574;
  const lonDegreePerKm = 1 / (111.320 * Math.cos(toRadians(centerLat)));
  
  const latDelta = radiusKm * latDegreePerKm;
  const lonDelta = radiusKm * lonDegreePerKm;
  
  return (
    lat >= centerLat - latDelta &&
    lat <= centerLat + latDelta &&
    lon >= centerLon - lonDelta &&
    lon <= centerLon + lonDelta
  );
}

/**
 * Calculate bounding box for a given center point and radius
 * Useful for database queries
 */
export function calculateBoundingBox(
  centerLat: number,
  centerLon: number,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  const latDegreePerKm = 1 / 110.574;
  const lonDegreePerKm = 1 / (111.320 * Math.cos(toRadians(centerLat)));
  
  const latDelta = radiusKm * latDegreePerKm;
  const lonDelta = radiusKm * lonDegreePerKm;
  
  return {
    minLat: centerLat - latDelta,
    maxLat: centerLat + latDelta,
    minLon: centerLon - lonDelta,
    maxLon: centerLon + lonDelta,
  };
}

/**
 * Validate latitude and longitude
 */
export function validateCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}
