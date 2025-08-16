import { Router } from 'express';
import { communityController } from '../../../controllers/community.controller';
import { authenticateToken } from '../../../middleware/auth';
import { asyncHandler } from '../../../utils/asyncHandler';

const router = Router();

// Public routes
router.get('/search', asyncHandler(communityController.searchCommunities));
router.get('/', asyncHandler(communityController.getAllCommunities));

// Protected routes
router.use(authenticateToken);
router.post('/', asyncHandler(communityController.createCommunity));
router.post('/:communityId/join', asyncHandler(communityController.joinCommunity));
router.get('/my', asyncHandler(communityController.getUserCommunities));

export default router;