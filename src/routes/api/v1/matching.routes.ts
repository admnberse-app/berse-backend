import { Router } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { asyncHandler } from '../../../utils/asyncHandler';
import * as matchingController from '../../../controllers/matching.controller';

const router = Router();

// Get match recommendations
router.get('/recommendations', 
  authenticateToken, 
  asyncHandler(matchingController.getMatchRecommendations)
);

// Find matches based on criteria
router.post('/find', 
  authenticateToken, 
  asyncHandler(matchingController.findMatches)
);

// Get user's matches
router.get('/', 
  authenticateToken, 
  asyncHandler(matchingController.getUserMatches)
);

// Get specific match details
router.get('/:matchId', 
  authenticateToken, 
  asyncHandler(matchingController.getMatchDetails)
);

// Create a new match (send friend request)
router.post('/', 
  authenticateToken, 
  asyncHandler(matchingController.createMatch)
);

// Respond to a match request
router.put('/:matchId/respond', 
  authenticateToken, 
  asyncHandler(matchingController.respondToMatch)
);

// Friend request specific routes
router.post('/friend-request', 
  authenticateToken, 
  asyncHandler(async (req, res, next) => {
    // Set type to FRIENDSHIP for friend requests
    req.body.type = 'FRIENDSHIP';
    return matchingController.createMatch(req, res);
  })
);

export default router;