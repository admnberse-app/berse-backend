import { Router } from 'express';
import {
  findMatches,
  createMatch,
  respondToMatch,
  getUserMatches,
  getMatchRecommendations,
  getMatchDetails,
} from '../controllers/matching.controller';
import { authenticate } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { body, query } from 'express-validator';

const router = Router();

// All matching routes require authentication
router.use(authenticate);

// Find potential matches
router.post(
  '/find',
  [
    body('type').isString().notEmpty(),
    body('preferences').optional().isObject(),
  ],
  handleValidationErrors,
  findMatches
);

// Get user's matches
router.get('/', getUserMatches);

// Get match recommendations
router.get(
  '/recommendations',
  [query('type').isString().notEmpty()],
  handleValidationErrors,
  getMatchRecommendations
);

// Create a new match
router.post(
  '/',
  [
    body('receiverId').isString().notEmpty(),
    body('type').isString().notEmpty(),
    body('message').optional().isString(),
  ],
  handleValidationErrors,
  createMatch
);

// Get match details
router.get('/:matchId', getMatchDetails);

// Respond to a match (accept/reject)
router.patch(
  '/:matchId/respond',
  [body('accept').isBoolean()],
  handleValidationErrors,
  respondToMatch
);

export default router;