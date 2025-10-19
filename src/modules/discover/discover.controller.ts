import { Request, Response } from 'express';
import { discoverService } from './discover.service';
import { DiscoverFeedParams, DiscoverContentType } from './discover.types';

export class DiscoverController {
  /**
   * @swagger
   * /v2/discover/feed:
   *   get:
   *     summary: Get unified discover feed with events, communities, and marketplace listings
   *     tags: [Discover]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Number of items per page
   *       - in: query
   *         name: contentType
   *         schema:
   *           type: string
   *           enum: [all, event, community, marketplace]
   *           default: all
   *         description: Filter by specific content type
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Text search across all content
   *       - in: query
   *         name: location
   *         schema:
   *           type: string
   *         description: Filter by location
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Category filter for events/marketplace
   *       - in: query
   *         name: communityType
   *         schema:
   *           type: string
   *         description: Community type filter (HOBBY, PROFESSIONAL, TRAVEL, etc.)
   *       - in: query
   *         name: fromDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Start date for events (ISO 8601 format)
   *       - in: query
   *         name: toDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: End date for events (ISO 8601 format)
   *       - in: query
   *         name: usePersonalization
   *         schema:
   *           type: boolean
   *           default: true
   *         description: Whether to apply personalized ranking
   *     responses:
   *       200:
   *         description: Discover feed retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     oneOf:
   *                       - type: object
   *                         properties:
   *                           type:
   *                             type: string
   *                             enum: [event]
   *                           sourceType:
   *                             type: string
   *                             enum: [trending, recommended, nearby, new, popular]
   *                           id:
   *                             type: string
   *                           title:
   *                             type: string
   *                           eventType:
   *                             type: string
   *                           images:
   *                             type: array
   *                             items:
   *                               type: string
   *                           date:
   *                             type: string
   *                             format: date-time
   *                           location:
   *                             type: string
   *                       - type: object
   *                         properties:
   *                           type:
   *                             type: string
   *                             enum: [community]
   *                           sourceType:
   *                             type: string
   *                             enum: [trending, recommended, nearby, new, popular]
   *                           id:
   *                             type: string
   *                           name:
   *                             type: string
   *                           communityType:
   *                             type: string
   *                           isVerified:
   *                             type: boolean
   *                       - type: object
   *                         properties:
   *                           type:
   *                             type: string
   *                             enum: [marketplace]
   *                           sourceType:
   *                             type: string
   *                             enum: [trending, recommended, nearby, new, popular]
   *                           id:
   *                             type: string
   *                           title:
   *                             type: string
   *                           category:
   *                             type: string
   *                           price:
   *                             type: number
   *                           currency:
   *                             type: string
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *                     hasMore:
   *                       type: boolean
   *                 meta:
   *                   type: object
   *                   properties:
   *                     contentTypeCounts:
   *                       type: object
   *                       properties:
   *                         events:
   *                           type: integer
   *                         communities:
   *                           type: integer
   *                         marketplace:
   *                           type: integer
   *                     personalizationApplied:
   *                       type: boolean
   *       400:
   *         description: Invalid query parameters
   */
  async getDiscoverFeed(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      // Parse query parameters
      const params: DiscoverFeedParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        contentType: (req.query.contentType as any) || 'all',
        search: req.query.search as string,
        location: req.query.location as string,
        category: req.query.category as string,
        communityType: req.query.communityType as string,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
        usePersonalization: req.query.usePersonalization !== 'false' // Default true
      };

      const result = await discoverService.getDiscoverFeed(userId, params);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      throw error;
    }
  }
}

export const discoverController = new DiscoverController();
