import { Router } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { asyncHandler } from '../../../utils/asyncHandler';
import { CardGameController } from '../../../controllers/cardgame.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Submit feedback for a question
router.post('/feedback', asyncHandler(CardGameController.submitFeedback));

// Get all feedback for current user
router.get('/feedback', asyncHandler(CardGameController.getUserFeedback));

// Get feedback for a specific topic for current user
router.get('/feedback/topic/:topicId', asyncHandler(CardGameController.getTopicFeedback));

// Get statistics for all topics (public)
router.get('/stats', asyncHandler(CardGameController.getTopicStats));

// Delete specific feedback
router.delete('/feedback/:feedbackId', asyncHandler(CardGameController.deleteFeedback));

export default router;