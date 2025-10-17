import { Router } from 'express';
import { CardGameController } from './cardgame.controller';
import { authenticateToken } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
import {
  submitFeedbackValidators,
  updateFeedbackValidators,
  addReplyValidators,
  feedbackQueryValidators,
  idParamValidators,
  topicIdParamValidators,
  userIdParamValidators,
} from './cardgame.validators';

const router = Router();

// ============================================================================
// FEEDBACK ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/cardgame/feedback:
 *   post:
 *     tags: [Card Game]
 *     summary: Submit feedback for a card game question
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicId
 *               - sessionNumber
 *               - questionId
 *               - rating
 *             properties:
 *               topicId:
 *                 type: string
 *               sessionNumber:
 *                 type: integer
 *                 minimum: 1
 *               questionId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 */
router.post(
  '/feedback',
  authenticateToken,
  submitFeedbackValidators,
  handleValidationErrors,
  CardGameController.submitFeedback
);

/**
 * @swagger
 * /v2/cardgame/feedback:
 *   get:
 *     tags: [Card Game]
 *     summary: Get all feedback with filters
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, rating, upvotes]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: questionId
 *         schema:
 *           type: string
 */
router.get(
  '/feedback',
  authenticateToken,
  feedbackQueryValidators,
  handleValidationErrors,
  CardGameController.getFeedback
);

/**
 * @swagger
 * /v2/cardgame/feedback/{id}:
 *   get:
 *     tags: [Card Game]
 *     summary: Get feedback by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/feedback/:id',
  authenticateToken,
  idParamValidators,
  handleValidationErrors,
  CardGameController.getFeedbackById
);

/**
 * @swagger
 * /v2/cardgame/feedback/{id}:
 *   patch:
 *     tags: [Card Game]
 *     summary: Update feedback
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch(
  '/feedback/:id',
  authenticateToken,
  [...idParamValidators, ...updateFeedbackValidators],
  handleValidationErrors,
  CardGameController.updateFeedback
);

/**
 * @swagger
 * /v2/cardgame/feedback/{id}:
 *   delete:
 *     tags: [Card Game]
 *     summary: Delete feedback
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete(
  '/feedback/:id',
  authenticateToken,
  idParamValidators,
  handleValidationErrors,
  CardGameController.deleteFeedback
);

// ============================================================================
// UPVOTE ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/cardgame/feedback/{id}/upvote:
 *   post:
 *     tags: [Card Game]
 *     summary: Toggle upvote on feedback
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.post(
  '/feedback/:id/upvote',
  authenticateToken,
  idParamValidators,
  handleValidationErrors,
  CardGameController.toggleUpvote
);

// ============================================================================
// REPLY ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/cardgame/feedback/{id}/replies:
 *   post:
 *     tags: [Card Game]
 *     summary: Add reply to feedback
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.post(
  '/feedback/:id/replies',
  authenticateToken,
  [...idParamValidators, ...addReplyValidators],
  handleValidationErrors,
  CardGameController.addReply
);

/**
 * @swagger
 * /v2/cardgame/replies/{id}:
 *   delete:
 *     tags: [Card Game]
 *     summary: Delete reply
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete(
  '/replies/:id',
  authenticateToken,
  idParamValidators,
  handleValidationErrors,
  CardGameController.deleteReply
);

// ============================================================================
// STATISTICS ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/cardgame/stats/topics/{topicId}:
 *   get:
 *     tags: [Card Game]
 *     summary: Get topic statistics
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/stats/topics/:topicId',
  authenticateToken,
  topicIdParamValidators,
  handleValidationErrors,
  CardGameController.getTopicStats
);

/**
 * @swagger
 * /v2/cardgame/stats/topics:
 *   get:
 *     tags: [Card Game]
 *     summary: Get all topics statistics
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/stats/topics',
  authenticateToken,
  CardGameController.getAllTopicsStats
);

/**
 * @swagger
 * /v2/cardgame/analytics/topics/{topicId}:
 *   get:
 *     tags: [Card Game]
 *     summary: Get detailed topic analytics
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/analytics/topics/:topicId',
  authenticateToken,
  topicIdParamValidators,
  handleValidationErrors,
  CardGameController.getTopicAnalytics
);

/**
 * @swagger
 * /v2/cardgame/stats/me:
 *   get:
 *     tags: [Card Game]
 *     summary: Get current user statistics
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/stats/me',
  authenticateToken,
  CardGameController.getUserStats
);

/**
 * @swagger
 * /v2/cardgame/stats/users/{userId}:
 *   get:
 *     tags: [Card Game]
 *     summary: Get user statistics
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/stats/users/:userId',
  authenticateToken,
  userIdParamValidators,
  handleValidationErrors,
  CardGameController.getUserStats
);

export default router;
