import { Request, Response } from 'express';
import profileMetadataService from './profile-metadata.service';
import { sendSuccess } from '../../utils/response';

/**
 * Profile Metadata Controller
 * Provides metadata lists for profile fields (interests, languages, professions, etc.)
 * Data comes from curated static lists in the service layer
 */
class ProfileMetadataController {
  /**
   * Get all profile metadata (interests, languages, professions, etc.)
   * @route GET /v2/metadata/profile
   */
  async getAllProfileMetadata(req: Request, res: Response): Promise<void> {
    const metadata = await profileMetadataService.getAllProfileMetadata();
    sendSuccess(res, metadata, 'Profile metadata retrieved successfully');
  }

  /**
   * Get interests list
   * @route GET /v2/metadata/profile/interests
   */
  async getInterests(req: Request, res: Response): Promise<void> {
    const interests = await profileMetadataService.getInterests();
    sendSuccess(res, interests, 'Interests retrieved successfully');
  }

  /**
   * Get languages list
   * @route GET /v2/metadata/profile/languages
   */
  async getLanguages(req: Request, res: Response): Promise<void> {
    const languages = await profileMetadataService.getLanguages();
    sendSuccess(res, languages, 'Languages retrieved successfully');
  }

  /**
   * Get professions list
   * @route GET /v2/metadata/profile/professions
   */
  async getProfessions(req: Request, res: Response): Promise<void> {
    const professions = await profileMetadataService.getProfessions();
    sendSuccess(res, professions, 'Professions retrieved successfully');
  }

  /**
   * Get genders list
   * @route GET /v2/metadata/profile/genders
   */
  async getGenders(req: Request, res: Response): Promise<void> {
    const genders = await profileMetadataService.getGenders();
    sendSuccess(res, genders, 'Genders retrieved successfully');
  }

  /**
   * Get travel styles list
   * @route GET /v2/metadata/profile/travel-styles
   */
  async getTravelStyles(req: Request, res: Response): Promise<void> {
    const travelStyles = await profileMetadataService.getTravelStyles();
    sendSuccess(res, travelStyles, 'Travel styles retrieved successfully');
  }

  /**
   * Get personality types list
   * @route GET /v2/metadata/profile/personality-types
   */
  async getPersonalityTypes(req: Request, res: Response): Promise<void> {
    const types = await profileMetadataService.getPersonalityTypes();
    sendSuccess(res, types, 'Personality types retrieved successfully');
  }

  /**
   * Get age ranges list
   * @route GET /v2/metadata/profile/age-ranges
   */
  async getAgeRanges(req: Request, res: Response): Promise<void> {
    const ageRanges = await profileMetadataService.getAgeRanges();
    sendSuccess(res, ageRanges, 'Age ranges retrieved successfully');
  }

  /**
   * Get profile visibility options
   * @route GET /v2/metadata/profile/visibility-options
   */
  async getProfileVisibilityOptions(req: Request, res: Response): Promise<void> {
    const options = await profileMetadataService.getProfileVisibilityOptions();
    sendSuccess(res, options, 'Profile visibility options retrieved successfully');
  }

  /**
   * Get location privacy options
   * @route GET /v2/metadata/profile/location-privacy-options
   */
  async getLocationPrivacyOptions(req: Request, res: Response): Promise<void> {
    const options = await profileMetadataService.getLocationPrivacyOptions();
    sendSuccess(res, options, 'Location privacy options retrieved successfully');
  }

  /**
   * Validate username availability
   * @route POST /v2/metadata/profile/validate-username
   */
  async validateUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
      sendSuccess(res, {
        isValid: false,
        isAvailable: false,
        errors: ['Username is required'],
        suggestions: []
      }, 'Username validation completed');
      return;
    }

    const result = await profileMetadataService.validateUsername(username.trim());
    sendSuccess(res, result, 'Username validation completed');
  }
}

export default new ProfileMetadataController();
