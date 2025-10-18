import { Request, Response, NextFunction } from 'express';
import { getCountries, getCountryByCode } from '@yusifaliyevpro/countries';
import { City, Country as CSCCountry, State } from 'country-state-city';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';
import { cache, CacheTTL } from '../../config/cache';

export class CountriesController {
  /**
   * Get all countries
   * @route GET /v2/metadata/countries
   */
  static async getAllCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        page = '1', 
        limit = '250' // Default to all countries, but allow pagination if needed
      } = req.query;

      // Validate and set pagination parameters
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(Math.max(1, parseInt(limit as string)), 250); // Max 250 countries
      const offset = (pageNum - 1) * limitNum;

      // Use cache-aside pattern with 1 day TTL
      const cacheKey = `metadata:countries:all:${page}:${limit}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      // Fetch all countries with required fields
      const allCountries = await getCountries({
        fields: ['name', 'cca2', 'cca3', 'capital', 'region', 'subregion', 'currencies', 'languages', 'flag', 'idd']
      });
      
      if (!allCountries) {
        throw new AppError('Failed to fetch countries data', 500);
      }

      // Sort countries alphabetically by name
      const sortedCountries = allCountries.sort((a, b) => {
        const nameA = a.name?.common || '';
        const nameB = b.name?.common || '';
        return nameA.localeCompare(nameB);
      });

      // Calculate total and apply pagination
      const totalCountries = sortedCountries.length;
      const paginatedCountries = sortedCountries.slice(offset, offset + limitNum);
      const totalPages = Math.ceil(totalCountries / limitNum);

      // Transform data for frontend
      const transformedCountries = paginatedCountries.map(country => ({
        code: country.cca2,
        code3: country.cca3,
        name: country.name?.common || '',
        officialName: country.name?.official || '',
        capital: Array.isArray(country.capital) ? country.capital[0] : country.capital,
        region: country.region,
        subregion: country.subregion,
        currencies: country.currencies,
        languages: country.languages,
        flag: country.flag,
        dialCode: country.idd?.root && country.idd?.suffixes ? 
          `${country.idd.root}${country.idd.suffixes[0] || ''}` : '',
      }));

      const responseData = {
        countries: transformedCountries,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCountries,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      };

      // Cache for 1 day
      await cache.set(cacheKey, responseData, CacheTTL.DAY);

      sendSuccess(res, responseData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get country by code
   * @route GET /v2/metadata/countries/:code
   */
  static async getCountryByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      
      // Check cache first
      const cacheKey = `metadata:country:${code.toUpperCase()}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      const country = await getCountryByCode({
        code: code.toUpperCase() as any,
        fields: ['name', 'cca2', 'cca3', 'capital', 'region', 'subregion', 'currencies', 'languages', 'flag', 'idd', 'timezones', 'latlng', 'demonyms']
      });
      
      if (!country) {
        throw new AppError(`Country with code '${code}' not found`, 404);
      }

      const transformedCountry = {
        code: country.cca2,
        code3: country.cca3,
        name: country.name?.common || '',
        officialName: country.name?.official || '',
        nativeName: country.name?.nativeName,
        capital: Array.isArray(country.capital) ? country.capital[0] : country.capital,
        region: country.region,
        subregion: country.subregion,
        currencies: country.currencies,
        languages: country.languages,
        flag: country.flag,
        dialCode: country.idd?.root && country.idd?.suffixes ? 
          `${country.idd.root}${country.idd.suffixes[0] || ''}` : '',
        timezones: country.timezones,
        coordinates: country.latlng,
        nationality: country.demonyms?.eng?.m || country.demonyms?.eng?.f || '',
      };

      // Cache for 1 day
      await cache.set(cacheKey, transformedCountry, CacheTTL.DAY);

      sendSuccess(res, transformedCountry);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search countries
   * @route GET /v2/metadata/countries/search
   */
  static async searchCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, region, page = '1', limit = '250' } = req.query;
      
      // Validate and set pagination parameters
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(Math.max(1, parseInt(limit as string)), 250);
      const offset = (pageNum - 1) * limitNum;
      
      // Check cache for search results
      const cacheKey = `metadata:countries:search:${q || 'all'}:${region || 'all'}:${page}:${limit}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      // Fetch all countries first
      let countries = await getCountries({
        fields: ['name', 'cca2', 'cca3', 'capital', 'region', 'subregion', 'flag', 'idd']
      });

      if (!countries) {
        throw new AppError('Failed to fetch countries data', 500);
      }

      // Filter by search query (name or code)
      if (q && typeof q === 'string') {
        const searchLower = q.toLowerCase();
        countries = countries.filter(country => 
          country.name?.common?.toLowerCase().includes(searchLower) ||
          country.name?.official?.toLowerCase().includes(searchLower) ||
          country.cca2?.toLowerCase().includes(searchLower) ||
          country.cca3?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by region
      if (region && typeof region === 'string') {
        countries = countries.filter(country => 
          country.region?.toLowerCase() === region.toLowerCase()
        );
      }

      // Sort countries alphabetically by name
      countries.sort((a, b) => {
        const nameA = a.name?.common || '';
        const nameB = b.name?.common || '';
        return nameA.localeCompare(nameB);
      });

      // Calculate total and apply pagination
      const totalCountries = countries.length;
      const paginatedCountries = countries.slice(offset, offset + limitNum);
      const totalPages = Math.ceil(totalCountries / limitNum);

      const transformedCountries = paginatedCountries.map(country => ({
        code: country.cca2,
        code3: country.cca3,
        name: country.name?.common || '',
        officialName: country.name?.official || '',
        capital: Array.isArray(country.capital) ? country.capital[0] : country.capital,
        region: country.region,
        subregion: country.subregion,
        flag: country.flag,
        dialCode: country.idd?.root && country.idd?.suffixes ? 
          `${country.idd.root}${country.idd.suffixes[0] || ''}` : '',
      }));

      const responseData = {
        countries: transformedCountries,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCountries,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      };

      // Cache for 1 day
      await cache.set(cacheKey, responseData, CacheTTL.DAY);

      sendSuccess(res, responseData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all regions
   * @route GET /v2/metadata/regions
   */
  static async getRegions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check cache
      const cacheKey = 'metadata:regions:all';
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      const countries = await getCountries({
        fields: ['region']
      });

      if (!countries) {
        throw new AppError('Failed to fetch countries data', 500);
      }
      
      // Get unique regions
      const regions = [...new Set(countries.map(c => c.region))].filter(Boolean).sort();

      const responseData = {
        regions,
        total: regions.length,
      };

      // Cache for 1 day
      await cache.set(cacheKey, responseData, CacheTTL.DAY);

      sendSuccess(res, responseData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all timezones
   * @route GET /v2/metadata/timezones
   */
  static async getTimezones(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const countries = await getCountries({
        fields: ['timezones']
      });

      if (!countries) {
        throw new AppError('Failed to fetch countries data', 500);
      }
      
      // Get all unique timezones
      const timezones = [...new Set(countries.flatMap(c => c.timezones || []))].filter(Boolean).sort();

      sendSuccess(res, {
        timezones,
        total: timezones.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get countries by region
   * @route GET /v2/metadata/regions/:region/countries
   */
  static async getCountriesByRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { region } = req.params;
      const { page = '1', limit = '250' } = req.query;
      
      // Validate and set pagination parameters
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(Math.max(1, parseInt(limit as string)), 250);
      const offset = (pageNum - 1) * limitNum;
      
      const allCountries = await getCountries({
        fields: ['name', 'cca2', 'capital', 'region', 'flag', 'idd']
      });

      if (!allCountries) {
        throw new AppError('Failed to fetch countries data', 500);
      }

      const countries = allCountries.filter(
        c => c.region?.toLowerCase() === region.toLowerCase()
      );

      if (countries.length === 0) {
        throw new AppError(`No countries found in region '${region}'`, 404);
      }

      // Sort countries alphabetically by name
      countries.sort((a, b) => {
        const nameA = a.name?.common || '';
        const nameB = b.name?.common || '';
        return nameA.localeCompare(nameB);
      });

      // Calculate total and apply pagination
      const totalCountries = countries.length;
      const paginatedCountries = countries.slice(offset, offset + limitNum);
      const totalPages = Math.ceil(totalCountries / limitNum);

      const transformedCountries = paginatedCountries.map(country => ({
        code: country.cca2,
        name: country.name?.common || '',
        capital: Array.isArray(country.capital) ? country.capital[0] : country.capital,
        flag: country.flag,
        dialCode: country.idd?.root && country.idd?.suffixes ? 
          `${country.idd.root}${country.idd.suffixes[0] || ''}` : '',
      }));

      sendSuccess(res, {
        region,
        countries: transformedCountries,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCountries,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all cities
   * @route GET /v2/metadata/cities
   */
  static async getAllCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        countryCode, 
        stateCode, 
        page = '1', 
        limit = '100' 
      } = req.query;

      // Validate and set pagination parameters
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(Math.max(1, parseInt(limit as string)), 500); // Max 500 items per page
      const offset = (pageNum - 1) * limitNum;

      // Check cache
      const cacheKey = `metadata:cities:${countryCode || 'all'}:${stateCode || 'all'}:${page}:${limit}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      let allCities;

      if (countryCode && stateCode) {
        // Get cities for specific country and state
        allCities = City.getCitiesOfState(countryCode as string, stateCode as string);
      } else if (countryCode) {
        // Get cities for specific country
        allCities = City.getCitiesOfCountry(countryCode as string);
      } else {
        // Get all cities (this will be large, so we need pagination)
        allCities = City.getAllCities();
      }

      if (!allCities) {
        throw new AppError('Failed to fetch cities data', 500);
      }

      // Calculate total and apply pagination
      const totalCities = allCities.length;
      const paginatedCities = allCities.slice(offset, offset + limitNum);
      const totalPages = Math.ceil(totalCities / limitNum);

      const transformedCities = paginatedCities.map(city => ({
        name: city.name,
        countryCode: city.countryCode,
        stateCode: city.stateCode,
        latitude: city.latitude,
        longitude: city.longitude,
      }));

      const responseData = {
        cities: transformedCities,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCities,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      };

      // Cache for 1 day
      await cache.set(cacheKey, responseData, CacheTTL.DAY);

      sendSuccess(res, responseData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cities by country
   * @route GET /v2/metadata/countries/:countryCode/cities
   */
  static async getCitiesByCountry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { countryCode } = req.params;
      const { 
        page = '1', 
        limit = '100', 
        search 
      } = req.query;

      // Validate and set pagination parameters
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(Math.max(1, parseInt(limit as string)), 500); // Max 500 items per page
      const offset = (pageNum - 1) * limitNum;

      // Check cache
      const cacheKey = `metadata:cities:country:${countryCode.toUpperCase()}:${search || 'all'}:${page}:${limit}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      let allCities = City.getCitiesOfCountry(countryCode.toUpperCase());

      if (!allCities || allCities.length === 0) {
        throw new AppError(`No cities found for country code '${countryCode}'`, 404);
      }

      // Apply search filter if provided
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        allCities = allCities.filter(city => 
          city.name.toLowerCase().includes(searchLower)
        );
      }

      // Calculate total and apply pagination
      const totalCities = allCities.length;
      const paginatedCities = allCities.slice(offset, offset + limitNum);
      const totalPages = Math.ceil(totalCities / limitNum);

      const transformedCities = paginatedCities.map(city => ({
        name: city.name,
        stateCode: city.stateCode,
        latitude: city.latitude,
        longitude: city.longitude,
      }));

      const responseData = {
        countryCode: countryCode.toUpperCase(),
        cities: transformedCities,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCities,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      };

      // Cache for 1 day
      await cache.set(cacheKey, responseData, CacheTTL.DAY);

      sendSuccess(res, responseData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cities by state
   * @route GET /v2/metadata/countries/:countryCode/states/:stateCode/cities
   */
  static async getCitiesByState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { countryCode, stateCode } = req.params;
      const { 
        page = '1', 
        limit = '100', 
        search 
      } = req.query;

      // Validate and set pagination parameters
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(Math.max(1, parseInt(limit as string)), 500); // Max 500 items per page
      const offset = (pageNum - 1) * limitNum;

      // Check cache
      const cacheKey = `metadata:cities:state:${countryCode.toUpperCase()}:${stateCode.toUpperCase()}:${search || 'all'}:${page}:${limit}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      let allCities = City.getCitiesOfState(countryCode.toUpperCase(), stateCode.toUpperCase());

      if (!allCities || allCities.length === 0) {
        throw new AppError(`No cities found for state '${stateCode}' in country '${countryCode}'`, 404);
      }

      // Apply search filter if provided
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        allCities = allCities.filter(city => 
          city.name.toLowerCase().includes(searchLower)
        );
      }

      // Calculate total and apply pagination
      const totalCities = allCities.length;
      const paginatedCities = allCities.slice(offset, offset + limitNum);
      const totalPages = Math.ceil(totalCities / limitNum);

      const transformedCities = paginatedCities.map(city => ({
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
      }));

      const responseData = {
        countryCode: countryCode.toUpperCase(),
        stateCode: stateCode.toUpperCase(),
        cities: transformedCities,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCities,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      };

      // Cache for 1 day
      await cache.set(cacheKey, responseData, CacheTTL.DAY);

      sendSuccess(res, responseData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get states by country
   * @route GET /v2/metadata/countries/:countryCode/states
   */
  static async getStatesByCountry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { countryCode } = req.params;
      const { page = '1', limit = '100' } = req.query;

      // Validate and set pagination parameters
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(Math.max(1, parseInt(limit as string)), 500); // Max 500 items per page
      const offset = (pageNum - 1) * limitNum;

      // Check cache
      const cacheKey = `metadata:states:country:${countryCode.toUpperCase()}:${page}:${limit}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      const states = State.getStatesOfCountry(countryCode.toUpperCase());

      if (!states || states.length === 0) {
        throw new AppError(`No states found for country code '${countryCode}'`, 404);
      }

      const totalStates = states.length;
      const paginatedStates = states.slice(offset, offset + limitNum);
      const totalPages = Math.ceil(totalStates / limitNum);

      const transformedStates = paginatedStates.map(state => ({
        code: state.isoCode,
        name: state.name,
        latitude: state.latitude,
        longitude: state.longitude,
      }));

      const responseData = {
        countryCode: countryCode.toUpperCase(),
        states: transformedStates,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalStates,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      };

      // Cache for 1 day
      await cache.set(cacheKey, responseData, CacheTTL.DAY);

      sendSuccess(res, responseData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular cities based on user locations and events
   * @route GET /v2/metadata/cities/popular
   */
  static async getPopularCities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        userLatitude, 
        userLongitude,
        limit = '5',
        radius = '500' // radius in km for nearby cities
      } = req.query;

      const limitNum = Math.min(Math.max(1, parseInt(limit as string)), 20);
      const radiusKm = parseInt(radius as string);

      // Check cache
      const cacheKey = `metadata:cities:popular:${userLatitude || 'none'}:${userLongitude || 'none'}:${limitNum}:${radiusKm}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      // Import prisma here to avoid circular dependencies
      const { prisma } = await import('../../config/database');

      // Get cities from user locations
      const userLocations = await prisma.userLocation.findMany({
        where: {
          currentCity: {
            not: null,
          },
          countryOfResidence: {
            not: null,
          },
        },
        select: {
          currentCity: true,
          countryOfResidence: true,
        },
      });

      // Get cities from events
      const events = await prisma.event.findMany({
        where: {
          location: {
            not: null,
          },
          status: 'PUBLISHED',
          date: {
            gte: new Date(),
          },
        },
        select: {
          location: true,
        },
      });

      // Manually aggregate user location cities
      const userLocationCountMap = new Map<string, { city: string; country: string; count: number }>();
      userLocations.forEach(loc => {
        if (loc.currentCity && loc.countryOfResidence) {
          const key = `${loc.currentCity.toLowerCase()}|${loc.countryOfResidence}`;
          const existing = userLocationCountMap.get(key);
          if (existing) {
            existing.count++;
          } else {
            userLocationCountMap.set(key, {
              city: loc.currentCity,
              country: loc.countryOfResidence,
              count: 1,
            });
          }
        }
      });

      // Sort and take top 20
      const userLocationCities = Array.from(userLocationCountMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
        .map(item => ({
          currentCity: item.city,
          countryOfResidence: item.country,
          _count: { userId: item.count },
        }));

      // Manually aggregate event cities
      const eventLocationCountMap = new Map<string, { location: string; count: number }>();
      events.forEach(event => {
        if (event.location) {
          const key = event.location.toLowerCase();
          const existing = eventLocationCountMap.get(key);
          if (existing) {
            existing.count++;
          } else {
            eventLocationCountMap.set(key, {
              location: event.location,
              count: 1,
            });
          }
        }
      });

      // Sort and take top 20
      const eventCities = Array.from(eventLocationCountMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
        .map(item => ({
          location: item.location,
          _count: { id: item.count },
        }));

      // Create a scoring system: combine user locations and events
      const cityScores = new Map<string, { 
        city: string; 
        country: string; 
        userCount: number; 
        eventCount: number; 
        score: number;
        latitude?: string;
        longitude?: string;
      }>();

      // Process user location cities
      userLocationCities.forEach(item => {
        if (item.currentCity && item.countryOfResidence) {
          const key = `${item.currentCity.toLowerCase()}|${item.countryOfResidence}`;
          cityScores.set(key, {
            city: item.currentCity,
            country: item.countryOfResidence,
            userCount: item._count.userId,
            eventCount: 0,
            score: item._count.userId * 2, // Weight user locations higher
          });
        }
      });

      // Process event cities
      eventCities.forEach(item => {
        if (item.location) {
          // Try to extract city name from location string
          const cityName = item.location.split(',')[0].trim();
          
          // Try to match with existing cities or add as new
          let matched = false;
          for (const [key, data] of cityScores.entries()) {
            if (data.city.toLowerCase() === cityName.toLowerCase()) {
              data.eventCount += item._count.id;
              data.score += item._count.id * 1.5; // Weight events moderately
              matched = true;
              break;
            }
          }
          
          if (!matched) {
            // Add as new city (we'll try to find country later)
            const tempKey = `${cityName.toLowerCase()}|unknown`;
            if (!cityScores.has(tempKey)) {
              cityScores.set(tempKey, {
                city: cityName,
                country: 'Unknown',
                userCount: 0,
                eventCount: item._count.id,
                score: item._count.id * 1.5,
              });
            } else {
              const existing = cityScores.get(tempKey)!;
              existing.eventCount += item._count.id;
              existing.score += item._count.id * 1.5;
            }
          }
        }
      });

      // Convert to array and sort by score
      let popularCities = Array.from(cityScores.values())
        .sort((a, b) => b.score - a.score);

      // If user location is provided, calculate distances and adjust scores
      if (userLatitude && userLongitude) {
        const userLat = parseFloat(userLatitude as string);
        const userLon = parseFloat(userLongitude as string);

        // Get all cities to find coordinates
        const allCities = City.getAllCities();
        
        // Add coordinates and calculate distances
        popularCities = popularCities.map(cityData => {
          // Find matching city in the database
          const matchingCity = allCities.find(c => 
            c.name.toLowerCase() === cityData.city.toLowerCase()
          );

          if (matchingCity && matchingCity.latitude && matchingCity.longitude) {
            const cityLat = parseFloat(matchingCity.latitude);
            const cityLon = parseFloat(matchingCity.longitude);
            
            // Calculate distance using Haversine formula
            const R = 6371; // Earth's radius in km
            const dLat = (cityLat - userLat) * Math.PI / 180;
            const dLon = (cityLon - userLon) * Math.PI / 180;
            const a = 
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(cityLat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            // Boost score for nearby cities
            if (distance <= radiusKm) {
              const proximityBonus = (1 - (distance / radiusKm)) * 100;
              cityData.score += proximityBonus;
            }

            cityData.latitude = matchingCity.latitude;
            cityData.longitude = matchingCity.longitude;
          }

          return cityData;
        }).sort((a, b) => b.score - a.score);
      }

      // If we have less than the requested limit, add top cities globally
      if (popularCities.length < limitNum) {
        const topGlobalCities = [
          { city: 'Kuala Lumpur', country: 'MY' },
          { city: 'Singapore', country: 'SG' },
          { city: 'Jakarta', country: 'ID' },
          { city: 'Bangkok', country: 'TH' },
          { city: 'Manila', country: 'PH' },
        ];

        const existingCityNames = new Set(popularCities.map(c => c.city.toLowerCase()));
        
        for (const globalCity of topGlobalCities) {
          if (popularCities.length >= limitNum) break;
          
          if (!existingCityNames.has(globalCity.city.toLowerCase())) {
            const allCities = City.getAllCities();
            const cityInfo = allCities.find(c => 
              c.name.toLowerCase() === globalCity.city.toLowerCase() &&
              c.countryCode === globalCity.country
            );

            popularCities.push({
              city: globalCity.city,
              country: globalCity.country,
              userCount: 0,
              eventCount: 0,
              score: 0,
              latitude: cityInfo?.latitude,
              longitude: cityInfo?.longitude,
            });
          }
        }
      }

      // Take top cities based on limit
      const finalCities = popularCities.slice(0, limitNum);

      // Transform for response
      const transformedCities = finalCities.map(cityData => ({
        name: cityData.city,
        country: cityData.country,
        userCount: cityData.userCount,
        eventCount: cityData.eventCount,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
      }));

      const responseData = {
        cities: transformedCities,
        total: transformedCities.length,
        criteria: {
          userLocationProvided: !!(userLatitude && userLongitude),
          radius: radiusKm,
          limit: limitNum,
        },
      };

      // Cache for 1 hour (shorter TTL as this data changes more frequently)
      await cache.set(cacheKey, responseData, 3600);

      sendSuccess(res, responseData);
    } catch (error) {
      next(error);
    }
  }
}
