import { Router } from 'express';
import { BadgeController } from '../controllers/badge.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected routes
router.use(authenticate);

// Get current user's badges
router.get('/user', BadgeController.getUserBadges);
// Get specific user's badges
router.get('/user/:id', BadgeController.getUserBadges);

export default router;