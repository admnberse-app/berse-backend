import { Router } from 'express';
import constantsController from './constants.controller';

const router = Router();

/**
 * @swagger
 * /v2/app-constants/enums:
 *   get:
 *     summary: Get all application enums
 *     description: Returns all enums used in the application to prevent hard-coding on mobile clients
 *     tags: [App Constants]
 *     responses:
 *       200:
 *         description: Enums retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Enums retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                     enums:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           description:
 *                             type: string
 *                           values:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 key:
 *                                   type: string
 *                                 value:
 *                                   type: string
 *                                 label:
 *                                   type: string
 *                                 description:
 *                                   type: string
 */
router.get('/enums', constantsController.getAllEnums.bind(constantsController));

/**
 * @swagger
 * /v2/app-constants/validation-rules:
 *   get:
 *     summary: Get validation rules
 *     description: Returns validation rules for common fields to ensure consistent validation on mobile clients
 *     tags: [App Constants]
 *     responses:
 *       200:
 *         description: Validation rules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Validation rules retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     rules:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                           type:
 *                             type: string
 *                           required:
 *                             type: boolean
 *                           minLength:
 *                             type: number
 *                           maxLength:
 *                             type: number
 *                           min:
 *                             type: number
 *                           max:
 *                             type: number
 *                           pattern:
 *                             type: string
 *                           description:
 *                             type: string
 */
router.get('/validation-rules', constantsController.getValidationRules.bind(constantsController));

/**
 * @swagger
 * /v2/app-constants/config:
 *   get:
 *     summary: Get app configuration
 *     description: Returns app configuration including features, limits, and settings
 *     tags: [App Constants]
 *     responses:
 *       200:
 *         description: App configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: App configuration retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     features:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           enabled:
 *                             type: boolean
 *                           description:
 *                             type: string
 *                           metadata:
 *                             type: object
 *                     limits:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: number
 *                           description:
 *                             type: string
 *                           unit:
 *                             type: string
 *                     settings:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           value:
 *                             oneOf:
 *                               - type: string
 *                               - type: number
 *                               - type: boolean
 *                               - type: array
 *                           type:
 *                             type: string
 *                           description:
 *                             type: string
 *                           options:
 *                             type: array
 */
router.get('/config', constantsController.getAppConfig.bind(constantsController));

/**
 * @swagger
 * /v2/app-constants/all:
 *   get:
 *     summary: Get all constants
 *     description: Returns all constants including enums, validation rules, and configuration in one request
 *     tags: [App Constants]
 *     responses:
 *       200:
 *         description: All constants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All constants retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     enums:
 *                       type: object
 *                     validationRules:
 *                       type: object
 *                     config:
 *                       type: object
 */
router.get('/all', constantsController.getAllConstants.bind(constantsController));

export default router;
