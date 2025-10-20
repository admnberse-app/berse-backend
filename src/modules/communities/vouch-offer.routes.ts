import { Router } from 'express';
import { communityVouchOfferController } from './vouch-offer.controller';
import { authenticateToken } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /v2/communities/{id}/vouch-offers:
 *   get:
 *     summary: Get pending vouch offers for authenticated user
 *     description: Retrieve all pending vouch offers for the authenticated user in a specific community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Community ID
 *     responses:
 *       200:
 *         description: Vouch offers retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:id/vouch-offers',
  authenticateToken,
  asyncHandler(communityVouchOfferController.getMyVouchOffers.bind(communityVouchOfferController))
);

/**
 * @swagger
 * /v2/communities/{id}/vouch-offers/{offerId}/accept:
 *   post:
 *     summary: Accept a vouch offer
 *     description: Accept a vouch offer and automatically create a community vouch
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Community ID
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vouch offer ID
 *     responses:
 *       200:
 *         description: Vouch offer accepted successfully
 *       400:
 *         description: Invalid request or offer expired
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to accept this offer
 *       404:
 *         description: Offer not found
 */
router.post(
  '/:id/vouch-offers/:offerId/accept',
  authenticateToken,
  asyncHandler(communityVouchOfferController.acceptVouchOffer.bind(communityVouchOfferController))
);

/**
 * @swagger
 * /v2/communities/{id}/vouch-offers/{offerId}/reject:
 *   post:
 *     summary: Reject a vouch offer
 *     description: Reject a pending vouch offer
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Community ID
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vouch offer ID
 *     responses:
 *       200:
 *         description: Vouch offer rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to reject this offer
 *       404:
 *         description: Offer not found
 */
router.post(
  '/:id/vouch-offers/:offerId/reject',
  authenticateToken,
  asyncHandler(communityVouchOfferController.rejectVouchOffer.bind(communityVouchOfferController))
);

/**
 * @swagger
 * /v2/admin/vouch-offers:
 *   get:
 *     summary: Get all vouch offers (Admin only)
 *     description: Admin endpoint to retrieve all vouch offers with filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, EXPIRED]
 *         description: Filter by offer status
 *       - in: query
 *         name: communityId
 *         schema:
 *           type: string
 *         description: Filter by community ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Vouch offers retrieved successfully
 *       403:
 *         description: Unauthorized - Admin access required
 */
router.get(
  '/admin/vouch-offers',
  authenticateToken,
  asyncHandler(communityVouchOfferController.getAllVouchOffers.bind(communityVouchOfferController))
);

export default router;
