import { Router } from 'express';
import { CountriesController } from './countries.controller';

const router = Router();

/**
 * @swagger
 * /v2/metadata/countries:
 *   get:
 *     summary: Get all countries
 *     description: Retrieve a list of all countries with their details (paginated)
 *     tags: [Metadata]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *         description: Page number (1-based)
 *         example: "1"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "250"
 *         description: Number of countries per page (max 250)
 *         example: "50"
 *     responses:
 *       200:
 *         description: List of countries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     countries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           code:
 *                             type: string
 *                             example: "MY"
 *                           code3:
 *                             type: string
 *                             example: "MYS"
 *                           name:
 *                             type: string
 *                             example: "Malaysia"
 *                           officialName:
 *                             type: string
 *                             example: "Malaysia"
 *                           capital:
 *                             type: string
 *                             example: "Kuala Lumpur"
 *                           region:
 *                             type: string
 *                             example: "Asia"
 *                           subregion:
 *                             type: string
 *                             example: "South-Eastern Asia"
 *                           flag:
 *                             type: string
 *                             example: "🇲🇾"
 *                           dialCode:
 *                             type: string
 *                             example: "+60"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalItems:
 *                           type: integer
 *                           example: 250
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 50
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPreviousPage:
 *                           type: boolean
 *                           example: false
 */
router.get('/countries', CountriesController.getAllCountries);

/**
 * @swagger
 * /v2/metadata/countries/search:
 *   get:
 *     summary: Search countries
 *     description: Search countries by name, code, or filter by region
 *     tags: [Metadata]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (country name or code)
 *         example: "mala"
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region
 *         example: "Asia"
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     countries:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 */
router.get('/countries/search', CountriesController.searchCountries);

/**
 * @swagger
 * /v2/metadata/countries/{code}:
 *   get:
 *     summary: Get country by code
 *     description: Get detailed information about a specific country
 *     tags: [Metadata]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: ISO 3166-1 alpha-2 country code
 *         example: "MY"
 *     responses:
 *       200:
 *         description: Country details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "MY"
 *                     name:
 *                       type: string
 *                       example: "Malaysia"
 *                     nationality:
 *                       type: string
 *                       example: "Malaysian"
 *                     capital:
 *                       type: string
 *                       example: "Kuala Lumpur"
 *                     region:
 *                       type: string
 *                       example: "Asia"
 *                     currencies:
 *                       type: object
 *                     languages:
 *                       type: object
 *                     timezones:
 *                       type: array
 *                       items:
 *                         type: string
 *                     coordinates:
 *                       type: array
 *                       items:
 *                         type: number
 *       404:
 *         description: Country not found
 */
router.get('/countries/:code', CountriesController.getCountryByCode);

/**
 * @swagger
 * /v2/metadata/regions:
 *   get:
 *     summary: Get all regions
 *     description: Get a list of all unique regions
 *     tags: [Metadata]
 *     responses:
 *       200:
 *         description: List of regions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     regions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Africa", "Americas", "Asia", "Europe", "Oceania"]
 *                     total:
 *                       type: integer
 *                       example: 5
 */
router.get('/regions', CountriesController.getRegions);

/**
 * @swagger
 * /v2/metadata/regions/{region}/countries:
 *   get:
 *     summary: Get countries by region
 *     description: Get all countries in a specific region
 *     tags: [Metadata]
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *         description: Region name
 *         example: "Asia"
 *     responses:
 *       200:
 *         description: Countries in the region
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     region:
 *                       type: string
 *                       example: "Asia"
 *                     countries:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 *       404:
 *         description: No countries found in region
 */
router.get('/regions/:region/countries', CountriesController.getCountriesByRegion);

/**
 * @swagger
 * /v2/metadata/timezones:
 *   get:
 *     summary: Get all timezones
 *     description: Get a list of all unique timezones
 *     tags: [Metadata]
 *     responses:
 *       200:
 *         description: List of timezones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     timezones:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["UTC", "Asia/Kuala_Lumpur", "America/New_York"]
 *                     total:
 *                       type: integer
 */
router.get('/timezones', CountriesController.getTimezones);

/**
 * @swagger
 * /v2/metadata/cities:
 *   get:
 *     summary: Get cities
 *     description: Get a paginated list of cities. Can be filtered by country and/or state
 *     tags: [Metadata]
 *     parameters:
 *       - in: query
 *         name: countryCode
 *         schema:
 *           type: string
 *         description: ISO 3166-1 alpha-2 country code
 *         example: "US"
 *       - in: query
 *         name: stateCode
 *         schema:
 *           type: string
 *         description: State code (requires countryCode)
 *         example: "CA"
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *         description: Page number (1-based)
 *         example: "1"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "100"
 *         description: Number of cities per page (max 500)
 *         example: "100"
 *     responses:
 *       200:
 *         description: Paginated list of cities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Los Angeles"
 *                           countryCode:
 *                             type: string
 *                             example: "US"
 *                           stateCode:
 *                             type: string
 *                             example: "CA"
 *                           latitude:
 *                             type: string
 *                             example: "34.05223"
 *                           longitude:
 *                             type: string
 *                             example: "-118.24368"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 10
 *                         totalItems:
 *                           type: integer
 *                           example: 1000
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 100
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPreviousPage:
 *                           type: boolean
 *                           example: false
 */
router.get('/cities', CountriesController.getAllCities);

/**
 * @swagger
 * /v2/metadata/cities/popular:
 *   get:
 *     summary: Get popular cities
 *     description: Get popular cities based on user locations and published upcoming events. Returns top 5 cities by default, or cities based on user's location if coordinates are provided.
 *     tags: [Metadata]
 *     parameters:
 *       - in: query
 *         name: userLatitude
 *         schema:
 *           type: string
 *         description: User's current latitude for location-based results
 *         example: "3.139"
 *       - in: query
 *         name: userLongitude
 *         schema:
 *           type: string
 *         description: User's current longitude for location-based results
 *         example: "101.6869"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "5"
 *         description: Number of cities to return (max 20)
 *         example: "5"
 *       - in: query
 *         name: radius
 *         schema:
 *           type: string
 *           default: "500"
 *         description: Radius in kilometers for nearby cities (only used when location is provided)
 *         example: "500"
 *     responses:
 *       200:
 *         description: Popular cities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Kuala Lumpur"
 *                           country:
 *                             type: string
 *                             example: "MY"
 *                           userCount:
 *                             type: integer
 *                             example: 150
 *                             description: Number of users in this city
 *                           eventCount:
 *                             type: integer
 *                             example: 45
 *                             description: Number of upcoming events in this city
 *                           latitude:
 *                             type: string
 *                             example: "3.139"
 *                           longitude:
 *                             type: string
 *                             example: "101.6869"
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     criteria:
 *                       type: object
 *                       properties:
 *                         userLocationProvided:
 *                           type: boolean
 *                           example: true
 *                         radius:
 *                           type: integer
 *                           example: 500
 *                         limit:
 *                           type: integer
 *                           example: 5
 */
router.get('/cities/popular', CountriesController.getPopularCities);

/**
 * @swagger
 * /v2/metadata/countries/{countryCode}/states:
 *   get:
 *     summary: Get states by country
 *     description: Get all states/provinces for a specific country
 *     tags: [Metadata]
 *     parameters:
 *       - in: path
 *         name: countryCode
 *         required: true
 *         schema:
 *           type: string
 *         description: ISO 3166-1 alpha-2 country code
 *         example: "US"
 *     responses:
 *       200:
 *         description: States retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     countryCode:
 *                       type: string
 *                       example: "US"
 *                     states:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           code:
 *                             type: string
 *                             example: "CA"
 *                           name:
 *                             type: string
 *                             example: "California"
 *                           latitude:
 *                             type: string
 *                           longitude:
 *                             type: string
 *                     total:
 *                       type: integer
 *       404:
 *         description: No states found
 */
router.get('/countries/:countryCode/states', CountriesController.getStatesByCountry);

/**
 * @swagger
 * /v2/metadata/countries/{countryCode}/cities:
 *   get:
 *     summary: Get cities by country
 *     description: Get paginated cities for a specific country with optional search
 *     tags: [Metadata]
 *     parameters:
 *       - in: path
 *         name: countryCode
 *         required: true
 *         schema:
 *           type: string
 *         description: ISO 3166-1 alpha-2 country code
 *         example: "MY"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search cities by name
 *         example: "Kuala"
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *         description: Page number (1-based)
 *         example: "1"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "100"
 *         description: Number of cities per page (max 500)
 *         example: "100"
 *     responses:
 *       200:
 *         description: Cities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     countryCode:
 *                       type: string
 *                       example: "MY"
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Kuala Lumpur"
 *                           stateCode:
 *                             type: string
 *                             example: "14"
 *                           latitude:
 *                             type: string
 *                           longitude:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalItems:
 *                           type: integer
 *                           example: 450
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 100
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPreviousPage:
 *                           type: boolean
 *                           example: false
 *       404:
 *         description: No cities found
 */
router.get('/countries/:countryCode/cities', CountriesController.getCitiesByCountry);

/**
 * @swagger
 * /v2/metadata/countries/{countryCode}/states/{stateCode}/cities:
 *   get:
 *     summary: Get cities by state
 *     description: Get paginated cities for a specific state/province in a country with optional search
 *     tags: [Metadata]
 *     parameters:
 *       - in: path
 *         name: countryCode
 *         required: true
 *         schema:
 *           type: string
 *         description: ISO 3166-1 alpha-2 country code
 *         example: "US"
 *       - in: path
 *         name: stateCode
 *         required: true
 *         schema:
 *           type: string
 *         description: State code
 *         example: "CA"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search cities by name
 *         example: "Los"
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *         description: Page number (1-based)
 *         example: "1"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "100"
 *         description: Number of cities per page (max 500)
 *         example: "100"
 *     responses:
 *       200:
 *         description: Cities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     countryCode:
 *                       type: string
 *                       example: "US"
 *                     stateCode:
 *                       type: string
 *                       example: "CA"
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Los Angeles"
 *                           latitude:
 *                             type: string
 *                           longitude:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         totalItems:
 *                           type: integer
 *                           example: 250
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 100
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPreviousPage:
 *                           type: boolean
 *                           example: false
 *       404:
 *         description: No cities found
 */
router.get('/countries/:countryCode/states/:stateCode/cities', CountriesController.getCitiesByState);

export default router;
