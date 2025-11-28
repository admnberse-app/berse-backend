import { Request, Response } from 'express';
import { servicesService } from './services.service';
import type { SearchServicesDTO } from './services.types';
import logger from '../../utils/logger';
import { prisma } from '../../config/database';

export class ServicesController {
  /**
   * GET /v2/services
   * Unified search for HomeSurf and BerseGuide services
   */
  async searchServices(req: Request, res: Response): Promise<void> {
    try {
      const {
        type,
        query,
        city,
        lat,
        lng,
        radius,
        checkInDate,
        checkOutDate,
        date,
        startTime,
        endTime,
        numberOfGuests,
        numberOfPeople,
        accommodationType,
        amenities,
        guideTypes,
        languages,
        specialties,
        minRating,
        maxHourlyRate,
        paymentTypes,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      // Build search query
      const searchQuery: SearchServicesDTO = {
        type: (type as any) || 'all',
        ...(query && { query: query as string }),
        ...(city && { city: city as string }),
        ...(lat && lng && {
          lat: parseFloat(lat as string),
          lng: parseFloat(lng as string),
        }),
        ...(radius && { radius: parseFloat(radius as string) }),
        ...(checkInDate && { checkInDate: checkInDate as string }),
        ...(checkOutDate && { checkOutDate: checkOutDate as string }),
        ...(date && { date: date as string }),
        ...(startTime && { startTime: startTime as string }),
        ...(endTime && { endTime: endTime as string }),
        ...(numberOfGuests && { numberOfGuests: parseInt(numberOfGuests as string) }),
        ...(numberOfPeople && { numberOfPeople: parseInt(numberOfPeople as string) }),
        ...(accommodationType && {
          accommodationType: Array.isArray(accommodationType)
            ? accommodationType as string[]
            : [accommodationType as string],
        }),
        ...(amenities && {
          amenities: Array.isArray(amenities)
            ? amenities as string[]
            : [amenities as string],
        }),
        ...(guideTypes && {
          guideTypes: Array.isArray(guideTypes)
            ? guideTypes as string[]
            : [guideTypes as string],
        }),
        ...(languages && {
          languages: Array.isArray(languages)
            ? languages as string[]
            : [languages as string],
        }),
        ...(specialties && {
          specialties: Array.isArray(specialties)
            ? specialties as string[]
            : [specialties as string],
        }),
        ...(minRating && { minRating: parseFloat(minRating as string) }),
        ...(maxHourlyRate && { maxHourlyRate: parseFloat(maxHourlyRate as string) }),
        ...(paymentTypes && {
          paymentTypes: Array.isArray(paymentTypes)
            ? paymentTypes as string[]
            : [paymentTypes as string],
        }),
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        sortBy: (sortBy as any) || 'rating',
        sortOrder: (sortOrder as any) || 'desc',
        requestingUserId: (req as any).userId, // From optionalAuth middleware
      };

      const result = await servicesService.searchServices(searchQuery);

      res.json(result);
    } catch (error) {
      logger.error('Error searching services', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to search services',
      });
    }
  }

  /**
   * GET /v2/services/metadata
   * Get filter options and metadata
   */
  async getMetadata(req: Request, res: Response): Promise<void> {
    try {
      const metadata = await servicesService.getMetadata();

      res.json({
        success: true,
        data: metadata,
      });
    } catch (error) {
      logger.error('Error fetching service metadata', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch metadata',
      });
    }
  }

  /**
   * GET /v2/services/discover
   * Get curated and personalized service discovery sections
   * Requires authentication
   */
  async discoverServices(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id; // From authenticateToken middleware
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const { city } = req.query;

      // Get user's city if not provided in query
      let userCity = city as string | undefined;

      if (!userCity) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            location: {
              select: {
                currentCity: true,
              },
            },
          },
        });
        userCity = user?.location?.currentCity || undefined;
      }

      const result = await servicesService.discoverServices(userId, userCity);

      res.json(result);
    } catch (error) {
      logger.error('Error discovering services', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to discover services',
      });
    }
  }
}

export const servicesController = new ServicesController();
