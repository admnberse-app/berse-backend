import { Request, Response } from 'express';
import constantsService from './constants.service';
import { sendSuccess } from '../../utils/response';

/**
 * App Constants Controller
 * Handles requests for app enums, validation rules, and configuration
 */
class ConstantsController {
  /**
   * Get all application enums
   * @route GET /v2/app-constants/enums
   */
  async getAllEnums(req: Request, res: Response): Promise<void> {
    const enums = await constantsService.getAllEnums();
    sendSuccess(res, enums, 'Enums retrieved successfully');
  }

  /**
   * Get validation rules
   * @route GET /v2/app-constants/validation-rules
   */
  async getValidationRules(req: Request, res: Response): Promise<void> {
    const rules = await constantsService.getValidationRules();
    sendSuccess(res, rules, 'Validation rules retrieved successfully');
  }

  /**
   * Get app configuration
   * @route GET /v2/app-constants/config
   */
  async getAppConfig(req: Request, res: Response): Promise<void> {
    const config = await constantsService.getAppConfig();
    sendSuccess(res, config, 'App configuration retrieved successfully');
  }

  /**
   * Get all constants (enums + validation rules + config)
   * @route GET /v2/app-constants/all
   */
  async getAllConstants(req: Request, res: Response): Promise<void> {
    const [enums, validationRules, config] = await Promise.all([
      constantsService.getAllEnums(),
      constantsService.getValidationRules(),
      constantsService.getAppConfig(),
    ]);

    sendSuccess(
      res,
      {
        enums,
        validationRules,
        config,
      },
      'All constants retrieved successfully'
    );
  }
}

export default new ConstantsController();
