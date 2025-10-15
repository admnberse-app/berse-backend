import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { handleValidationErrors } from '../middleware/validation';
import { loginValidators, registerValidators } from '../validators';
import { authLimiter, loginLimiter, registerLimiter } from '../middleware/rateLimiter';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply auth rate limiter to all auth routes
// router.use(authLimiter); // TEMPORARILY DISABLED FOR TESTING

// Public routes
router.post(
  '/register',
  // registerLimiter, // TEMPORARILY DISABLED FOR TESTING
  registerValidators,
  handleValidationErrors,
  AuthController.register
);

router.post(
  '/login',
  // loginLimiter, // TEMPORARILY DISABLED FOR TESTING
  loginValidators,
  handleValidationErrors,
  AuthController.login
);

router.post(
  '/refresh-token',
  handleValidationErrors,
  AuthController.refreshToken
);

router.post(
  '/logout',
  AuthController.logout
);

// Protected routes
router.get(
  '/me',
  authenticateToken,
  AuthController.me
);

router.post(
  '/logout-all',
  authenticateToken,
  AuthController.logoutAll
);

router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  ],
  handleValidationErrors,
  AuthController.changePassword
);

export default router;