import { Router } from 'express';
import { body } from 'express-validator';
import { EmailController } from '../../../controllers/email.controller';
import { handleValidationErrors } from '../../../middleware/validation';
import { authenticateToken } from '../../../middleware/auth';
import { asyncHandler } from '../../../utils/asyncHandler';

const router = Router();

// Validation rules
const emailValidation = [
  body('to')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),
];

const bulkEmailValidation = [
  body('recipients')
    .isArray({ min: 1 })
    .withMessage('Recipients array with at least one email is required'),
  body('recipients.*')
    .isEmail()
    .normalizeEmail()
    .withMessage('All recipients must be valid email addresses'),
];

const campaignValidation = [
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required and must be less than 200 characters'),
  body('headline')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Headline is required and must be less than 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
];

// Test email (development only)
if (process.env.NODE_ENV === 'development') {
  router.post(
    '/test',
    emailValidation,
    handleValidationErrors,
    asyncHandler(EmailController.sendTestEmail)
  );
}

// Protected routes - require authentication
router.use(authenticateToken);

// Send verification email
router.post(
  '/verification',
  body('to').isEmail().normalizeEmail(),
  body('verificationUrl').isURL(),
  handleValidationErrors,
  asyncHandler(EmailController.sendVerificationEmail)
);

// Send welcome email
router.post(
  '/welcome',
  body('to').isEmail().normalizeEmail(),
  body('userName').trim().notEmpty(),
  handleValidationErrors,
  asyncHandler(EmailController.sendWelcomeEmail)
);

// Send password reset email
router.post(
  '/password-reset',
  body('to').isEmail().normalizeEmail(),
  body('resetUrl').isURL(),
  handleValidationErrors,
  asyncHandler(EmailController.sendPasswordResetEmail)
);

// Send event email
router.post(
  '/event',
  body('to').isEmail().normalizeEmail(),
  body('type').isIn(['invitation', 'confirmation', 'reminder', 'cancellation']),
  body('eventTitle').trim().notEmpty(),
  body('eventDate').isISO8601(),
  body('eventLocation').trim().notEmpty(),
  handleValidationErrors,
  asyncHandler(EmailController.sendEventEmail)
);

// Send notification email
router.post(
  '/notification',
  body('to').isEmail().normalizeEmail(),
  body('subject').trim().notEmpty(),
  body('message').trim().notEmpty(),
  handleValidationErrors,
  asyncHandler(EmailController.sendNotificationEmail)
);

// Send campaign email (admin only - add role check if needed)
router.post(
  '/campaign',
  bulkEmailValidation,
  campaignValidation,
  handleValidationErrors,
  asyncHandler(EmailController.sendCampaignEmail)
);

// Send bulk campaign (admin only - add role check if needed)
router.post(
  '/campaign/bulk',
  bulkEmailValidation,
  campaignValidation,
  body('batchSize').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  asyncHandler(EmailController.sendBulkCampaign)
);

// Get queue status (admin only - add role check if needed)
router.get(
  '/queue/status',
  asyncHandler(EmailController.getQueueStatus)
);

// Clear queue (admin only - add role check if needed)
router.delete(
  '/queue',
  asyncHandler(EmailController.clearQueue)
);

export default router;
