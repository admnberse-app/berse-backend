import type { 
  HomeSurfProfileResponse, 
  SearchHomeSurfDTO 
} from '../homesurf/homesurf.types';
import type { 
  BerseGuideProfileResponse, 
  SearchBerseGuideDTO 
} from '../berseguide/berseguide.types';

/**
 * Service types that can be searched
 */
export type ServiceType = 'all' | 'homesurf' | 'berseguide';

/**
 * Sort options for service search
 */
export type ServiceSortBy = 'rating' | 'newest' | 'nearest';

/**
 * Base service item (common fields)
 */
export interface BaseServiceItem {
  id: string;
  userId: string;
  serviceType: 'homesurf' | 'berseguide';
  title: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  isEnabled: boolean;
  createdAt: Date;
}

/**
 * Search services request DTO
 */
export interface SearchServicesDTO {
  // Filter parameters
  type?: ServiceType;
  query?: string; // Search by host name, profile name, or title
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number; // in km, default 50km
  
  // Date/time filters (applicable to both)
  checkInDate?: string; // HomeSurf specific
  checkOutDate?: string; // HomeSurf specific
  date?: string; // BerseGuide specific
  startTime?: string; // BerseGuide specific
  endTime?: string; // BerseGuide specific
  
  // Common filters
  minRating?: number;
  paymentTypes?: string[];
  
  // HomeSurf specific filters
  numberOfGuests?: number;
  accommodationType?: string[];
  amenities?: string[];
  
  // BerseGuide specific filters
  numberOfPeople?: number;
  guideTypes?: string[];
  languages?: string[];
  specialties?: string[];
  maxHourlyRate?: number;
  
  // Pagination & sorting
  page?: number;
  limit?: number;
  sortBy?: ServiceSortBy;
  sortOrder?: 'asc' | 'desc';
  
  // Internal use
  requestingUserId?: string;
}

/**
 * Paginated service results by type
 */
export interface ServiceResults<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

/**
 * Unified services search response
 */
export interface SearchServicesResponse {
  success: boolean;
  data: {
    homesurf?: ServiceResults<HomeSurfProfileResponse>;
    berseguide?: ServiceResults<BerseGuideProfileResponse>;
  };
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
  };
  appliedFilters: {
    type: ServiceType;
    city?: string;
    location?: {
      lat: number;
      lng: number;
      radius: number;
    };
    dateRange?: {
      checkIn?: string;
      checkOut?: string;
      date?: string;
    };
  };
}

/**
 * Service metadata for filters
 */
export interface ServiceMetadata {
  homesurfTypes: string[];
  berseguideTypes: string[];
  amenities: string[];
  languages: string[];
  specialties: string[];
  paymentTypes: string[];
}
