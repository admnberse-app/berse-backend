import logger from '../../utils/logger';
import { AccommodationType, PaymentType, GuideType } from '@prisma/client';
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
}

export const servicesService = new ServicesService();
