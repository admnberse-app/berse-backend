import { Request, Response, NextFunction } from 'express';
import { getCountries, getCountryByCode } from '@yusifaliyevpro/countries';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/error';

export class CountriesController {
  /**
   * Get all countries
   * @route GET /v2/metadata/countries
   */
  static async getAllCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
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

      sendSuccess(res, {
        countries: transformedCountries,
        total: transformedCountries.length,
      });
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
      const countries = await getCountries({
        fields: ['region']
      });

      if (!countries) {
        throw new AppError('Failed to fetch countries data', 500);
      }
      
      // Get unique regions
      const regions = [...new Set(countries.map(c => c.region))].filter(Boolean).sort();

      sendSuccess(res, {
        regions,
        total: regions.length,
      });
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
}
