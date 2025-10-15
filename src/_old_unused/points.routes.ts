import { Router } from 'express';
import { body } from 'express-validator';
import { PointsController } from '../controllers/points.controller';
import { authenticate, authorize } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { UserRole } from '@prisma/client';

const router = Router();

// Protected routes
router.use(authenticate);

// Get current user's points
router.get('/user', PointsController.getUserPoints);
// Get specific user's points
router.get('/user/:id', PointsController.getUserPoints);

router.put(
  '/manual',
  authorize(UserRole.ADMIN),
  [
    body('userId').notEmpty(),
    body('points').isInt(),
    body('action').optional().trim(),
    body('description').notEmpty().trim(),
  ],
  handleValidationErrors,
  PointsController.manualPointsUpdate
);

export default router;