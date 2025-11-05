import { Router } from 'express';
import { servicesController } from './services.controller';
import { authenticateToken } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Unified search for HomeSurf and BerseGuide services
 */

/**
 * @swagger
 * /v2/services:
 *   get:
 *     summary: Search for HomeSurf and BerseGuide services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, homesurf, berseguide]
 *           default: all
 *         description: Type of service to search
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City name to filter by
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude for location-based search
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude for location-based search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 50
 *         description: Search radius in kilometers
 *       - in: query
 *         name: checkInDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Check-in date for HomeSurf (YYYY-MM-DD)
 *       - in: query
 *         name: checkOutDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Check-out date for HomeSurf (YYYY-MM-DD)
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for BerseGuide (YYYY-MM-DD)
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *         description: Start time for BerseGuide (HH:mm)
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: string
 *         description: End time for BerseGuide (HH:mm)
 *       - in: query
 *         name: numberOfGuests
 *         schema:
 *           type: integer
 *         description: Number of guests for HomeSurf
 *       - in: query
 *         name: numberOfPeople
 *         schema:
 *           type: integer
 *         description: Number of people for BerseGuide
 *       - in: query
 *         name: accommodationType
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: HomeSurf accommodation types
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: HomeSurf amenities
 *       - in: query
 *         name: guideTypes
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: BerseGuide types
 *       - in: query
 *         name: languages
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: BerseGuide languages
 *       - in: query
 *         name: specialties
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: BerseGuide specialties
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: maxHourlyRate
 *         schema:
 *           type: number
 *         description: Maximum hourly rate for BerseGuide
 *       - in: query
 *         name: paymentTypes
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Payment types accepted
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, newest, nearest]
 *           default: rating
 *         description: Sort results by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     homesurf:
 *                       type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                         total:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *                     berseguide:
 *                       type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                         total:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                 appliedFilters:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.get(
  '/',
  authenticateToken,
  asyncHandler(servicesController.searchServices.bind(servicesController))
);

/**
 * @swagger
 * /v2/services/metadata:
 *   get:
 *     summary: Get service filter metadata
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     serviceTypes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     sortOptions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     homesurfTypes:
 *                       type: array
 *                     berseguideTypes:
 *                       type: array
 *                     amenities:
 *                       type: array
 *                     languages:
 *                       type: array
 *                     paymentTypes:
 *                       type: array
 */
router.get(
  '/metadata',
  asyncHandler(servicesController.getMetadata.bind(servicesController))
);

/**
 * @swagger
 * /v2/services/discover:
 *   get:
 *     summary: Discover curated services (HomeSurf & BerseGuide)
 *     description: Get personalized and curated service sections including matches, nearby, top-rated, and recently active. Authentication required.
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Override city for nearby services (optional, uses user's city if logged in)
 *     responses:
 *       200:
 *         description: Discovery sections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: object
 *                   properties:
 *                     forYou:
 *                       type: object
 *                       description: Personalized matches (always present for authenticated users)
 *                       properties:
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         homesurf:
 *                           type: array
 *                         berseguide:
 *                           type: array
 *                     nearby:
 *                       type: object
 *                       description: Nearby services (only if city available)
 *                       properties:
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         homesurf:
 *                           type: array
 *                         berseguide:
 *                           type: array
 *                     topRated:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         homesurf:
 *                           type: array
 *                         berseguide:
 *                           type: array
 *                     recentlyActive:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         berseguide:
 *                           type: array
 *       500:
 *         description: Server error
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get(
  '/discover',
  authenticateToken,
  asyncHandler(servicesController.discoverServices.bind(servicesController))
);

export default router;
