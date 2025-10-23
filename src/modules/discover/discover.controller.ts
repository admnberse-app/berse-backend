import { Request, Response } from 'express';
import { discoverService } from './discover.service';
import { DiscoverQueryParams, DiscoverContentType, DiscoverSortBy } from './discover.types';

export class DiscoverController {
  /**
   * Main discover endpoint - GET /v2/discover
   * Returns sections or search results based on query parameters
   */
  async discover(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      // Parse query parameters
      const params: DiscoverQueryParams = {
        // Location
        city: req.query.city as string,
        latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
        longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
        radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
        
        // Search
        q: req.query.q as string,
        
        // Pagination
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        
        // Filters
        category: req.query.category as string,
        contentType: req.query.contentType as DiscoverContentType,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
        priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
        freeOnly: req.query.freeOnly === 'true',
        language: req.query.language as string,
        sortBy: req.query.sortBy as DiscoverSortBy,
        tags: req.query.tags as string,
        verifiedOnly: req.query.verifiedOnly === 'true',
        availableNow: req.query.availableNow === 'true',
        trustScoreMin: req.query.trustScoreMin ? parseInt(req.query.trustScoreMin as string) : undefined,
        
        // Section control
        sections: req.query.sections as string,
        excludeSections: req.query.excludeSections as string,
        
        // Personalization
        userInterests: req.query.userInterests !== 'false', // default true
        refresh: req.query.refresh === 'true'
      };

      const result = await discoverService.discover(userId, params);

      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get trending content - GET /v2/discover/trending
   */
  async getTrending(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      const params: Partial<DiscoverQueryParams> = {
        city: req.query.city as string,
        latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
        longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        contentType: req.query.type as DiscoverContentType
      };

      const result = await discoverService.getTrending(userId, params);

      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get nearby content - GET /v2/discover/nearby
   */
  async getNearby(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      const params: Partial<DiscoverQueryParams> = {
        latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
        longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
        radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        contentType: req.query.type as DiscoverContentType
      };

      const result = await discoverService.getNearby(userId, params);

      res.json(result);
    } catch (error) {
      throw error;
    }
  }
}

export const discoverController = new DiscoverController();
