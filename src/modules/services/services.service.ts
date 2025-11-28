import logger from '../../utils/logger';
import { AccommodationType, PaymentType, GuideType } from '@prisma/client';
import { prisma } from '../../config/database';
import { HomeSurfService } from '../homesurf/homesurf.service';
import { BerseGuideService } from '../berseguide/berseguide.service';
import type { 
  SearchServicesDTO, 
  SearchServicesResponse,
  ServiceType,
  ServiceResults,
} from './services.types';
import type { 
  SearchHomeSurfDTO,
  HomeSurfProfileResponse,
} from '../homesurf/homesurf.types';
import type { 
  SearchBerseGuideDTO,
  BerseGuideProfileResponse,
} from '../berseguide/berseguide.types';

export class ServicesService {
  private homesurfService: HomeSurfService;
  private berseguideService: BerseGuideService;

  constructor() {
    this.homesurfService = new HomeSurfService();
    this.berseguideService = new BerseGuideService();
  }

  /**
   * Unified search across HomeSurf and BerseGuide services
   */
  async searchServices(query: SearchServicesDTO): Promise<SearchServicesResponse> {
    try {
      const {
        type = 'all',
        page = 1,
        limit = 20,
        sortBy = 'rating',
        sortOrder = 'desc',
        city,
        lat,
        lng,
        radius,
        requestingUserId,
      } = query;

      logger.info('Searching services', { type, city, page, limit });

      const results: {
        homesurf?: ServiceResults<HomeSurfProfileResponse>;
        berseguide?: ServiceResults<BerseGuideProfileResponse>;
      } = {};

      let totalItems = 0;

      // Search HomeSurf if requested
      if (type === 'all' || type === 'homesurf') {
        const homesurfResults = await this.searchHomeSurf(query);
        results.homesurf = homesurfResults;
        totalItems += homesurfResults.total;
      }

      // Search BerseGuide if requested
      if (type === 'all' || type === 'berseguide') {
        const berseguideResults = await this.searchBerseGuide(query);
        results.berseguide = berseguideResults;
        totalItems += berseguideResults.total;
      }

      // Build applied filters summary
      const appliedFilters: any = {
        type,
      };

      if (city) {
        appliedFilters.city = city;
      }

      if (lat && lng) {
        appliedFilters.location = {
          lat,
          lng,
          radius: radius || 50,
        };
      }

      if (query.checkInDate || query.checkOutDate || query.date) {
        appliedFilters.dateRange = {
          ...(query.checkInDate && { checkIn: query.checkInDate }),
          ...(query.checkOutDate && { checkOut: query.checkOutDate }),
          ...(query.date && { date: query.date }),
        };
      }

      return {
        success: true,
        data: results,
        pagination: {
          page,
          limit,
          totalItems,
        },
        appliedFilters,
      };
    } catch (error) {
      logger.error('Failed to search services', { error, query });
      throw error;
    }
  }

  /**
   * Search HomeSurf profiles
   */
  private async searchHomeSurf(
    query: SearchServicesDTO
  ): Promise<ServiceResults<HomeSurfProfileResponse>> {
    try {
      const homesurfQuery: SearchHomeSurfDTO = {
        query: query.query,
        city: query.city,
        checkInDate: query.checkInDate,
        checkOutDate: query.checkOutDate,
        numberOfGuests: query.numberOfGuests,
        accommodationType: query.accommodationType as AccommodationType[] | undefined,
        amenities: query.amenities,
        minRating: query.minRating,
        paymentTypes: query.paymentTypes as PaymentType[] | undefined,
        page: query.page || 1,
        limit: query.limit || 20,
        sortBy: this.mapSortBy(query.sortBy),
        sortOrder: query.sortOrder || 'desc',
        requestingUserId: query.requestingUserId,
      };

      const response = await this.homesurfService.searchProfiles(homesurfQuery);

      return {
        items: response.data,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages,
      };
    } catch (error) {
      logger.error('Failed to search HomeSurf profiles', { error });
      // Return empty results instead of throwing
      return {
        items: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Search BerseGuide profiles
   */
  private async searchBerseGuide(
    query: SearchServicesDTO
  ): Promise<ServiceResults<BerseGuideProfileResponse>> {
    try {
      const berseguideQuery: SearchBerseGuideDTO = {
        query: query.query,
        city: query.city,
        date: query.date,
        startTime: query.startTime,
        endTime: query.endTime,
        numberOfPeople: query.numberOfPeople,
        guideTypes: query.guideTypes as GuideType[] | undefined,
        languages: query.languages,
        specialties: query.specialties,
        minRating: query.minRating,
        maxHourlyRate: query.maxHourlyRate,
        paymentTypes: query.paymentTypes as PaymentType[] | undefined,
        page: query.page || 1,
        limit: query.limit || 20,
        sortBy: this.mapSortBy(query.sortBy),
        sortOrder: query.sortOrder || 'desc',
        requestingUserId: query.requestingUserId,
      };

      const response = await this.berseguideService.searchProfiles(berseguideQuery);

      return {
        items: response.data,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages,
      };
    } catch (error) {
      logger.error('Failed to search BerseGuide profiles', { error });
      // Return empty results instead of throwing
      return {
        items: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Map generic sortBy to specific service sortBy fields
   */
  private mapSortBy(sortBy?: string): 'rating' | 'createdAt' {
    switch (sortBy) {
      case 'rating':
        return 'rating';
      case 'newest':
        return 'createdAt';
      case 'nearest':
        // TODO: Implement distance-based sorting
        return 'rating';
      default:
        return 'rating';
    }
  }

  /**
   * Get metadata for service filters
   */
  async getMetadata(): Promise<any> {
    try {
      // For now, return combined metadata from both services
      // In the future, these could be fetched from the database or constants
      return {
        serviceTypes: ['all', 'homesurf', 'berseguide'],
        sortOptions: ['rating', 'newest', 'nearest'],
        homesurfTypes: [
          'PRIVATE_ROOM',
          'SHARED_ROOM',
          'COUCH',
          'OUTDOOR',
          'ENTIRE_HOME',
        ],
        berseguideTypes: [
          'CITY_TOUR',
          'FOOD_TOUR',
          'ADVENTURE',
          'CULTURAL',
          'NATURE',
          'NIGHTLIFE',
          'PHOTOGRAPHY',
          'CUSTOM',
        ],
        amenities: [
          'WIFI',
          'KITCHEN',
          'BATHROOM',
          'PARKING',
          'WORKSPACE',
          'TV',
          'WASHING_MACHINE',
          'AIR_CONDITIONING',
          'HEATING',
          'PETS_ALLOWED',
        ],
        languages: [
          'ENGLISH',
          'SPANISH',
          'FRENCH',
          'GERMAN',
          'ITALIAN',
          'PORTUGUESE',
          'CHINESE',
          'JAPANESE',
          'KOREAN',
          'THAI',
          'VIETNAMESE',
          'INDONESIAN',
          'MALAY',
        ],
        paymentTypes: [
          'MONEY',
          'SKILL_TRADE',
          'TREAT_ME',
          'BERSE_POINTS',
          'FREE',
          'NEGOTIABLE',
        ],
      };
    } catch (error) {
      logger.error('Failed to get service metadata', { error });
      throw error;
    }
  }

  /**
   * Discover services - curated and personalized sections
   * Requires authenticated user
   */
  async discoverServices(userId: string, userCity?: string): Promise<any> {
    try {
      logger.info('Discovering services', { userId, userCity });

      // Run all discovery queries in parallel
      const [
        matchingProfiles,
        topRatedHomesurf,
        topRatedBerseguide,
        recentlyActiveHomesurf,
        recentlyActiveBerseguide,
        nearbyHomesurf,
        nearbyBerseguide,
      ] = await Promise.all([
        // Matching profiles based on user interests/location
        this.getMatchingProfiles(userId),
        // Top rated services
        this.getTopRatedServices('homesurf', 6),
        this.getTopRatedServices('berseguide', 6),
        // Recently active
        this.getRecentlyActiveServices('homesurf', 6),
        this.getRecentlyActiveServices('berseguide', 6),
        // Nearby (if user has city)
        userCity ? this.getNearbyServices('homesurf', userCity, 6) : Promise.resolve([]),
        userCity ? this.getNearbyServices('berseguide', userCity, 6) : Promise.resolve([]),
      ]);

      return {
        success: true,
        data: {
          // Personalized section (always present for authenticated users)
          forYou: {
            title: 'Matches Your Profile',
            description: 'Based on your interests and preferences',
            homesurf: matchingProfiles.homesurf,
            berseguide: matchingProfiles.berseguide,
          },

          // Nearby section (only if user has location)
          ...(userCity && {
            nearby: {
              title: `Services in ${userCity}`,
              description: 'Discover local experiences',
              homesurf: nearbyHomesurf,
              berseguide: nearbyBerseguide,
            },
          }),

          // Top rated section
          topRated: {
            title: 'Highly Rated',
            description: 'Top-rated services from our community',
            homesurf: topRatedHomesurf,
            berseguide: topRatedBerseguide,
          },

          // Recently active section
          recentlyActive: {
            title: 'Recently Active',
            description: 'Fresh listings and updated profiles',
            homesurf: recentlyActiveHomesurf,
            berseguide: recentlyActiveBerseguide,
          },
        },
      };
    } catch (error) {
      logger.error('Failed to discover services', { error, userId, userCity });
      throw error;
    }
  }

  /**
   * Get profiles matching user's interests and preferences
   */
  private async getMatchingProfiles(userId: string): Promise<{
    homesurf: HomeSurfProfileResponse[];
    berseguide: BerseGuideProfileResponse[];
  }> {
    try {
      // Fetch user's profile to get interests and location
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          profile: {
            select: {
              interests: true,
            },
          },
          location: {
            select: {
              currentCity: true,
            },
          },
        },
      });

      const city = user?.location?.currentCity;

      // Search both services with user's city
      const [homesurfResults, berseguideResults] = await Promise.all([
        city
          ? this.homesurfService.searchProfiles({
              city,
              page: 1,
              limit: 6,
              sortBy: 'rating',
              sortOrder: 'desc',
              requestingUserId: userId,
            })
          : Promise.resolve({ data: [], pagination: { total: 0, page: 1, totalPages: 0, limit: 6 } }),
        city
          ? this.berseguideService.searchProfiles({
              city,
              page: 1,
              limit: 6,
              sortBy: 'rating',
              sortOrder: 'desc',
              requestingUserId: userId,
            })
          : Promise.resolve({ data: [], pagination: { total: 0, page: 1, totalPages: 0, limit: 6 } }),
      ]);

      return {
        homesurf: homesurfResults.data,
        berseguide: berseguideResults.data,
      };
    } catch (error) {
      logger.error('Failed to get matching profiles', { error, userId });
      return { homesurf: [], berseguide: [] };
    }
  }

  /**
   * Get top-rated services
   */
  private async getTopRatedServices(
    type: 'homesurf' | 'berseguide',
    limit: number = 6
  ): Promise<any[]> {
    try {
      if (type === 'homesurf') {
        const result = await this.homesurfService.searchProfiles({
          page: 1,
          limit,
          sortBy: 'rating',
          sortOrder: 'desc',
          minRating: 4.0,
        });
        return result.data;
      } else {
        const result = await this.berseguideService.searchProfiles({
          page: 1,
          limit,
          sortBy: 'rating',
          sortOrder: 'desc',
          minRating: 4.0,
        });
        return result.data;
      }
    } catch (error) {
      logger.error('Failed to get top rated services', { error, type });
      return [];
    }
  }

  /**
   * Get recently active services
   */
  private async getRecentlyActiveServices(
    type: 'homesurf' | 'berseguide',
    limit: number = 6
  ): Promise<any[]> {
    try {
      if (type === 'homesurf') {
        const result = await this.homesurfService.searchProfiles({
          page: 1,
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        return result.data;
      } else {
        const result = await this.berseguideService.searchProfiles({
          page: 1,
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        return result.data;
      }
    } catch (error) {
      logger.error('Failed to get recently active services', { error, type });
      return [];
    }
  }

  /**
   * Get nearby services based on city
   */
  private async getNearbyServices(
    type: 'homesurf' | 'berseguide',
    city: string,
    limit: number = 6
  ): Promise<any[]> {
    try {
      if (type === 'homesurf') {
        const result = await this.homesurfService.searchProfiles({
          city,
          page: 1,
          limit,
          sortBy: 'rating',
          sortOrder: 'desc',
        });
        return result.data;
      } else {
        const result = await this.berseguideService.searchProfiles({
          city,
          page: 1,
          limit,
          sortBy: 'rating',
          sortOrder: 'desc',
        });
        return result.data;
      }
    } catch (error) {
      logger.error('Failed to get nearby services', { error, type, city });
      return [];
    }
  }
}

export const servicesService = new ServicesService();
