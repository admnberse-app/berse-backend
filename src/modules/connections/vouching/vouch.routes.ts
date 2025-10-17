import { Router } from 'express';
import { VouchController } from './vouch.controller';
import { handleValidationErrors } from '../../../middleware/validation';
import { authenticateToken } from '../../../middleware/auth';
import {
  requestVouchValidators,
  respondToVouchRequestValidators,
  revokeVouchValidators,
  communityVouchValidators,
  vouchQueryValidators,
} from './vouch.validators';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route POST /v2/vouches/request
 * @desc Request a vouch from another user
 * @access Private
 */
router.post(
  '/request',
  requestVouchValidators,
  handleValidationErrors,
  VouchController.requestVouch
);

/**
 * @route POST /v2/vouches/:vouchId/respond
 * @desc Respond to a vouch request (approve/decline/downgrade)
 * @access Private
 */
router.post(
  '/:vouchId/respond',
  respondToVouchRequestValidators,
  handleValidationErrors,
  VouchController.respondToVouchRequest
);

/**
 * @route POST /v2/vouches/:vouchId/revoke
 * @desc Revoke an existing vouch
 * @access Private
 */
router.post(
  '/:vouchId/revoke',
  revokeVouchValidators,
  handleValidationErrors,
  VouchController.revokeVouch
);

/**
 * @route POST /v2/vouches/community
 * @desc Community admin vouches for a user
 * @access Private (Admin/Moderator)
 */
router.post(
  '/community',
  communityVouchValidators,
  handleValidationErrors,
  VouchController.createCommunityVouch
);

/**
 * @route GET /v2/vouches/auto-vouch/eligibility
 * @desc Check auto-vouch eligibility for communities
 * @access Private
 */
router.get(
  '/auto-vouch/eligibility',
  VouchController.checkAutoVouchEligibility
);

/**
 * @route GET /v2/vouches/received
 * @desc Get vouches received by user
 * @access Private
 */
router.get(
  '/received',
  vouchQueryValidators,
  handleValidationErrors,
  VouchController.getVouchesReceived
);

/**
 * @route GET /v2/vouches/given
 * @desc Get vouches given by user
 * @access Private
 */
router.get(
  '/given',
  vouchQueryValidators,
  handleValidationErrors,
  VouchController.getVouchesGiven
);

/**
 * @route GET /v2/vouches/limits
 * @desc Get vouch limits and availability
 * @access Private
 */
router.get(
  '/limits',
  VouchController.getVouchLimits
);

/**
 * @route GET /v2/vouches/summary
 * @desc Get vouch summary statistics
 * @access Private
 */
router.get(
  '/summary',
  VouchController.getVouchSummary
);

export default router;
