import { Router } from 'express';
import { body, query } from 'express-validator';
import { RewardsController } from '../controllers/rewards.controller';
import { authenticate, authorize } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { UserRole } from '@prisma/client';

const router = Router();

// Protected routes
router.use(authenticate);

router.get(
  '/',
  [
    query('category').optional().trim(),
    query('minPoints').optional().isInt({ min: 0 }),
    query('maxPoints').optional().isInt({ min: 0 }),
  ],
  handleValidationErrors,
  RewardsController.getRewards
);

router.post(
  '/',
  authorize(UserRole.ADMIN),
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('pointsRequired').isInt({ min: 1 }),
    body('category').notEmpty().trim(),
    body('partner').notEmpty().trim(),
    body('quantity').isInt({ min: 0 }),
    body('imageUrl').optional().isURL(),
  ],
  handleValidationErrors,
  RewardsController.createReward
);

router.post(
  '/redeem',
  [
    body('rewardId').notEmpty(),
  ],
  handleValidationErrors,
  RewardsController.redeemReward
);

router.get('/user', RewardsController.getUserRedemptions);

router.put(
  '/:id/status',
  authorize(UserRole.ADMIN),
  [
    body('status').isIn(['PENDING', 'APPROVED', 'REJECTED']),
    body('notes').optional().trim(),
  ],
  handleValidationErrors,
  RewardsController.updateRedemptionStatus
);

export default router;