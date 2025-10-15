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
      // Use cache-aside pattern with 1 day TTL
      const cacheKey = 'metadata:countries:all';
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      // Fetch all countries with required fields
      const countries = await getCountries({
        fields: ['name', 'cca2', 'cca3', 'capital', 'region', 'subregion', 'currencies', 'languages', 'flag', 'idd']
      });
      
      if (!countries) {
        throw new AppError('Failed to fetch countries data', 500);
      }

      // Transform data for frontend
      const transformedCountries = countries.map(country => ({
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
        total: transformedCountries.length,
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
      const { q, region } = req.query;
      
      // Check cache for search results
      const cacheKey = `metadata:countries:search:${q || 'all'}:${region || 'all'}`;
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

      const transformedCountries = countries.map(country => ({
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

      sendSuccess(res, {
        countries: transformedCountries,
        total: transformedCountries.length,
      });
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

      const transformedCountries = countries.map(country => ({
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
        total: transformedCountries.length,
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
      const { countryCode, stateCode, limit = '100' } = req.query;

      // Check cache
      const cacheKey = `metadata:cities:${countryCode || 'all'}:${stateCode || 'all'}:${limit}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      let cities;

      if (countryCode && stateCode) {
        // Get cities for specific country and state
        cities = City.getCitiesOfState(countryCode as string, stateCode as string);
      } else if (countryCode) {
        // Get cities for specific country
        cities = City.getCitiesOfCountry(countryCode as string);
      } else {
        // Get all cities (this will be large, so we limit it)
        cities = City.getAllCities().slice(0, parseInt(limit as string));
      }

      if (!cities) {
        throw new AppError('Failed to fetch cities data', 500);
      }

      const transformedCities = cities.map(city => ({
        name: city.name,
        countryCode: city.countryCode,
        stateCode: city.stateCode,
        latitude: city.latitude,
        longitude: city.longitude,
      }));

      const responseData = {
        cities: transformedCities,
        total: transformedCities.length,
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
      const { limit = '1000', search } = req.query;

      // Check cache
      const cacheKey = `metadata:cities:country:${countryCode.toUpperCase()}:${search || 'all'}:${limit}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      let cities = City.getCitiesOfCountry(countryCode.toUpperCase());

      if (!cities || cities.length === 0) {
        throw new AppError(`No cities found for country code '${countryCode}'`, 404);
      }

      // Apply search filter if provided
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        cities = cities.filter(city => 
          city.name.toLowerCase().includes(searchLower)
        );
      }

      // Limit results
      const limitNum = parseInt(limit as string);
      cities = cities.slice(0, limitNum);

      const transformedCities = cities.map(city => ({
        name: city.name,
        stateCode: city.stateCode,
        latitude: city.latitude,
        longitude: city.longitude,
      }));

      const responseData = {
        countryCode: countryCode.toUpperCase(),
        cities: transformedCities,
        total: transformedCities.length,
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
      const { search } = req.query;

      // Check cache
      const cacheKey = `metadata:cities:state:${countryCode.toUpperCase()}:${stateCode.toUpperCase()}:${search || 'all'}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      let cities = City.getCitiesOfState(countryCode.toUpperCase(), stateCode.toUpperCase());

      if (!cities || cities.length === 0) {
        throw new AppError(`No cities found for state '${stateCode}' in country '${countryCode}'`, 404);
      }

      // Apply search filter if provided
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        cities = cities.filter(city => 
          city.name.toLowerCase().includes(searchLower)
        );
      }

      const transformedCities = cities.map(city => ({
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
      }));

      const responseData = {
        countryCode: countryCode.toUpperCase(),
        stateCode: stateCode.toUpperCase(),
        cities: transformedCities,
        total: transformedCities.length,
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

      // Check cache
      const cacheKey = `metadata:states:country:${countryCode.toUpperCase()}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        sendSuccess(res, cachedData);
        return;
      }

      const states = State.getStatesOfCountry(countryCode.toUpperCase());

      if (!states || states.length === 0) {
        throw new AppError(`No states found for country code '${countryCode}'`, 404);
      }

      const transformedStates = states.map(state => ({
        code: state.isoCode,
        name: state.name,
        latitude: state.latitude,
        longitude: state.longitude,
      }));

      const responseData = {
        countryCode: countryCode.toUpperCase(),
        states: transformedStates,
        total: transformedStates.length,
      };

      // Cache for 1 day
      await cache.set(cacheKey, responseData, CacheTTL.DAY);

      sendSuccess(res, responseData);
    } catch (error) {
      next(error);
    }
  }
}
