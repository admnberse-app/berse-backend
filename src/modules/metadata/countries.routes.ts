import { Router } from 'express';
import { CountriesController } from './countries.controller';

const router = Router();

/**
 * @swagger
 * /v2/metadata/countries:
 *   get:
 *     summary: Get all countries
 *     description: Retrieve a list of all countries with their details
 *     tags: [Metadata]
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
 *                     total:
 *                       type: integer
 *                       example: 250
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

export default router;
