import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthController } from '../../../controllers/auth.controller';
import { handleValidationErrors } from '../../../middleware/validation';
import { authLimiter, loginLimiter, registerLimiter } from '../../../middleware/rateLimiter';
import { authenticateToken, optionalAuth } from '../../../middleware/auth';
import { asyncHandler } from '../../../utils/asyncHandler';

const router = Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from current password'),
];

// Public routes
router.post('/register',
  // registerLimiter, // TEMPORARILY DISABLED FOR TESTING
  registerValidation,
  handleValidationErrors,
  asyncHandler(AuthController.register)
);

router.post('/login',
  // loginLimiter, // TEMPORARILY DISABLED FOR TESTING
  loginValidation,
  handleValidationErrors,
  asyncHandler(AuthController.login)
);

router.post('/refresh-token',
  // authLimiter, // DISABLED FOR DEVELOPMENT
  asyncHandler(AuthController.refreshToken)
);

router.post('/forgot-password',
  // authLimiter, // DISABLED FOR DEVELOPMENT
  forgotPasswordValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    // TODO: Implement forgot password
    res.json({ message: 'Password reset email sent' });
  })
);

router.post('/reset-password',
  // authLimiter, // DISABLED FOR DEVELOPMENT
  resetPasswordValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    // TODO: Implement reset password
    res.json({ message: 'Password reset successful' });
  })
);

router.post('/verify-email',
  // authLimiter, // DISABLED FOR DEVELOPMENT
  body('token').notEmpty(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    // TODO: Implement email verification
    res.json({ message: 'Email verified successfully' });
  })
);

// Protected routes
router.post('/logout',
  authenticateToken,
  asyncHandler(AuthController.logout)
);

router.post('/logout-all',
  authenticateToken,
  asyncHandler(AuthController.logoutAll)
);

router.get('/me',
  authenticateToken,
  asyncHandler(AuthController.me)
);

router.post('/change-password',
  authenticateToken,
  changePasswordValidation,
  handleValidationErrors,
  asyncHandler(AuthController.changePassword)
);

// Two-factor authentication
router.post('/2fa/enable',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // TODO: Implement 2FA enable
    res.json({ message: '2FA enabled', qrCode: 'base64_qr_code' });
  })
);

router.post('/2fa/disable',
  authenticateToken,
  body('code').isLength({ min: 6, max: 6 }),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    // TODO: Implement 2FA disable
    res.json({ message: '2FA disabled' });
  })
);

router.post('/2fa/verify',
  // authLimiter, // DISABLED FOR DEVELOPMENT
  body('code').isLength({ min: 6, max: 6 }),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    // TODO: Implement 2FA verification
    res.json({ message: '2FA verified', token: 'jwt_token' });
  })
);

export default router;