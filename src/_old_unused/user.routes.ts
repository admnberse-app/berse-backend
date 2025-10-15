import { Router } from 'express';
import { body, query } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// Protected routes
router.use(authenticate);

router.get('/profile', UserController.getProfile);

router.put(
  '/profile',
  [
    body('fullName').optional().trim(),
    body('bio').optional().trim(),
    body('city').optional().trim(),
    body('interests').optional().isArray(),
    body('instagramHandle').optional().trim(),
    body('linkedinHandle').optional().trim(),
  ],
  handleValidationErrors,
  UserController.updateProfile
);

router.get(
  '/search',
  [
    query('city').optional().trim(),
    query('interest').optional().trim(),
    query('query').optional().trim(),
  ],
  handleValidationErrors,
  UserController.searchUsers
);

router.get('/:id', UserController.getUserById);

router.post('/follow/:id', UserController.followUser);

router.delete('/follow/:id', UserController.unfollowUser);

export default router;