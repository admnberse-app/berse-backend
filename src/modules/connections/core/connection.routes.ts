import { Router } from 'express';
import { ConnectionController } from './connection.controller';
import { handleValidationErrors } from '../../../middleware/validation';
import { authenticateToken } from '../../../middleware/auth';
import {
  sendConnectionRequestValidators,
  respondToConnectionRequestValidators,
  connectionIdValidator,
  updateConnectionValidators,
  blockUserValidators,
  unblockUserValidators,
  connectionQueryValidators,
  mutualConnectionsValidators,
  connectionSuggestionsValidators,
} from './connection.validators';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// ============================================================================
// CONNECTION REQUEST ROUTES
// ============================================================================

/**
 * @route POST /v2/connections/request
 * @desc Send a connection request
 * @access Private
 */
router.post(
  '/request',
  sendConnectionRequestValidators,
  handleValidationErrors,
  ConnectionController.sendConnectionRequest
);

/**
 * @route POST /v2/connections/:connectionId/respond
 * @desc Respond to a connection request (accept/reject)
 * @access Private
 */
router.post(
  '/:connectionId/respond',
  respondToConnectionRequestValidators,
  handleValidationErrors,
  ConnectionController.respondToConnectionRequest
);

/**
 * @route DELETE /v2/connections/:connectionId/withdraw
 * @desc Withdraw a pending connection request
 * @access Private
 */
router.delete(
  '/:connectionId/withdraw',
  connectionIdValidator,
  handleValidationErrors,
  ConnectionController.withdrawConnectionRequest
);

/**
 * @route DELETE /v2/connections/:connectionId
 * @desc Remove an existing connection
 * @access Private
 */
router.delete(
  '/:connectionId',
  connectionIdValidator,
  handleValidationErrors,
  ConnectionController.removeConnection
);

/**
 * @route PUT /v2/connections/:connectionId
 * @desc Update connection details
 * @access Private
 */
router.put(
  '/:connectionId',
  updateConnectionValidators,
  handleValidationErrors,
  ConnectionController.updateConnection
);

// ============================================================================
// CONNECTION RETRIEVAL ROUTES
// ============================================================================

/**
 * @route GET /v2/connections/stats
 * @desc Get connection stats (must be before /:connectionId to avoid conflict)
 * @access Private
 */
router.get(
  '/stats',
  ConnectionController.getConnectionStats
);

/**
 * @route GET /v2/connections/suggestions
 * @desc Get connection suggestions
 * @access Private
 */
router.get(
  '/suggestions',
  connectionSuggestionsValidators,
  handleValidationErrors,
  ConnectionController.getConnectionSuggestions
);

/**
 * @route GET /v2/connections/mutual/:userId
 * @desc Get mutual connections with another user
 * @access Private
 */
router.get(
  '/mutual/:userId',
  mutualConnectionsValidators,
  handleValidationErrors,
  ConnectionController.getMutualConnections
);

/**
 * @route GET /v2/connections/:connectionId
 * @desc Get a single connection by ID
 * @access Private
 */
router.get(
  '/:connectionId',
  connectionIdValidator,
  handleValidationErrors,
  ConnectionController.getConnectionById
);

/**
 * @route GET /v2/connections
 * @desc Get user's connections with filters
 * @access Private
 */
router.get(
  '/',
  connectionQueryValidators,
  handleValidationErrors,
  ConnectionController.getConnections
);

// ============================================================================
// BLOCK/UNBLOCK ROUTES
// ============================================================================

/**
 * @route POST /v2/connections/block
 * @desc Block a user
 * @access Private
 */
router.post(
  '/block',
  blockUserValidators,
  handleValidationErrors,
  ConnectionController.blockUser
);

/**
 * @route DELETE /v2/connections/block/:userId
 * @desc Unblock a user
 * @access Private
 */
router.delete(
  '/block/:userId',
  unblockUserValidators,
  handleValidationErrors,
  ConnectionController.unblockUser
);

/**
 * @route GET /v2/connections/blocked
 * @desc Get list of blocked users
 * @access Private
 */
router.get(
  '/blocked',
  ConnectionController.getBlockedUsers
);

export default router;
