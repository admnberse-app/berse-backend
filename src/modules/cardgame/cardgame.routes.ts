import { Router } from 'express';
import { CardGameController } from './cardgame.controller';
import { authenticateToken, authorize } from '../../middleware/auth';
import { handleValidationErrors } from '../../middleware/validation';
import {
  submitFeedbackValidators,
  updateFeedbackValidators,
  addReplyValidators,
  feedbackQueryValidators,
  idParamValidators,
  topicIdParamValidators,
  userIdParamValidators,
  questionIdParamValidators,
  createTopicValidators,
  updateTopicValidators,
  createQuestionValidators,
  updateQuestionValidators,
  startSessionValidators,
  completeSessionValidators,
  sessionQuestionsValidators,
  sessionSummaryValidators,
} from './cardgame.validators';
import { UserRole } from '@prisma/client';

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
 *     description: Submit feedback with rating and optional comment for a card game question
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicId
 *               - topicTitle
 *               - sessionNumber
 *               - questionId
 *               - questionText
 *               - rating
 *             properties:
 *               topicId:
 *                 type: string
 *                 description: Unique identifier for the topic
 *                 example: communication-skills
 *               topicTitle:
 *                 type: string
 *                 description: Display title of the topic
 *                 example: Communication Skills
 *               sessionNumber:
 *                 type: integer
 *                 minimum: 1
 *                 description: Session number (must be at least 1)
 *                 example: 1
 *               questionId:
 *                 type: string
 *                 description: Unique identifier for the question
 *                 example: q-001
 *               questionText:
 *                 type: string
 *                 description: The actual question text
 *                 example: How do you handle difficult conversations?
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5 stars
 *                 example: 5
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Optional comment about the question
 *                 example: This question really made me think!
 *               isHelpful:
 *                 type: boolean
 *                 description: Whether the question was helpful
 *                 example: true
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
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
 *       - in: query
 *         name: includeNested
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include nested replies (default true). Set to false for faster responses.
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
 *     description: |
 *       Upvote or remove upvote from feedback.
 *       Uses cached upvote counts for 100x faster performance.
 *       Calling again toggles the upvote off. Idempotent operation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Feedback ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upvote toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Upvote added
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasUpvoted:
 *                       type: boolean
 *                       description: Whether current user has upvoted this feedback
 *                       example: true
 *                     upvoteCount:
 *                       type: integer
 *                       description: Total upvote count (cached, updated atomically)
 *                       example: 1
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Feedback not found
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
 *     description: Add a text reply to a feedback entry. Field name is 'text', not 'content'.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Feedback ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Reply text (NOT 'content')
 *                 example: I totally agree with this feedback!
 *     responses:
 *       201:
 *         description: Reply added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Feedback not found
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

/**
 * @swagger
 * /v2/cardgame/replies/{id}/replies:
 *   post:
 *     tags: [Card Game]
 *     summary: Reply to another reply (nested reply)
 *     description: Add a reply to an existing reply. Maximum nesting level is 2 (cannot reply to a reply of a reply).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent reply ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Reply text
 *                 example: I agree with your perspective on this!
 *     responses:
 *       201:
 *         description: Nested reply added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Nested reply added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     parentReplyId:
 *                       type: string
 *                     text:
 *                       type: string
 *                     upvoteCount:
 *                       type: integer
 *                       description: Cached upvote count
 *                     hasUpvoted:
 *                       type: boolean
 *       400:
 *         description: Cannot reply to a nested reply (max 2 levels)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Cannot reply to a nested reply
 *                 error:
 *                   type: string
 *                   example: Maximum nesting level (2) exceeded
 *       404:
 *         description: Parent reply not found
 */
router.post(
  '/replies/:id/replies',
  authenticateToken,
  [...idParamValidators, ...addReplyValidators],
  handleValidationErrors,
  CardGameController.replyToReply
);

/**
 * @swagger
 * /v2/cardgame/replies/{id}/upvote:
 *   post:
 *     tags: [Card Game]
 *     summary: Toggle upvote on a reply
 *     description: |
 *       Add or remove upvote on a reply (including nested replies). 
 *       Uses cached upvote counts for optimal performance. 
 *       Idempotent operation - calling twice toggles upvote on/off.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reply ID
 *     responses:
 *       200:
 *         description: Upvote toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasUpvoted:
 *                       type: boolean
 *                       description: Whether current user has upvoted this reply
 *                       example: true
 *                     upvoteCount:
 *                       type: integer
 *                       description: Total upvote count (cached, updated atomically)
 *                       example: 5
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reply not found
 */
router.post(
  '/replies/:id/upvote',
  authenticateToken,
  idParamValidators,
  handleValidationErrors,
  CardGameController.toggleReplyUpvote
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

// ============================================================================
// TOPIC ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/cardgame/topics:
 *   get:
 *     tags: [Card Game]
 *     summary: Get all topics
 *     description: Retrieve all card game topics with statistics for preview
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Return only active topics
 *       - in: query
 *         name: includeStats
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include statistics for each topic (enabled by default for preview)
 *     responses:
 *       200:
 *         description: Topics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       gradient:
 *                         type: string
 *                       totalSessions:
 *                         type: integer
 *                       isActive:
 *                         type: boolean
 *                       displayOrder:
 *                         type: integer
 *                       stats:
 *                         type: object
 *                         description: Statistics for the topic (when includeStats=true)
 *                         properties:
 *                           totalSessions:
 *                             type: integer
 *                             description: Total number of completed sessions
 *                           averageRating:
 *                             type: number
 *                             description: Average rating from all feedback
 *                           totalFeedback:
 *                             type: integer
 *                             description: Total feedback count
 */
router.get(
  '/topics',
  authenticateToken,
  CardGameController.getTopics
);

/**
 * @swagger
 * /v2/cardgame/topics/{topicId}:
 *   get:
 *     tags: [Card Game]
 *     summary: Get topic by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic retrieved successfully
 *       404:
 *         description: Topic not found
 */
router.get(
  '/topics/:topicId',
  authenticateToken,
  topicIdParamValidators,
  handleValidationErrors,
  CardGameController.getTopicById
);

/**
 * @swagger
 * /v2/cardgame/admin/topics:
 *   post:
 *     tags: [Card Game - Admin]
 *     summary: Create new topic (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - title
 *               - totalSessions
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               gradient:
 *                 type: string
 *               totalSessions:
 *                 type: integer
 *               displayOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Topic created successfully
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/admin/topics',
  authenticateToken,
  authorize(UserRole.ADMIN),
  createTopicValidators,
  handleValidationErrors,
  CardGameController.createTopic
);

/**
 * @swagger
 * /v2/cardgame/admin/topics/{id}:
 *   patch:
 *     tags: [Card Game - Admin]
 *     summary: Update topic (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               gradient:
 *                 type: string
 *               totalSessions:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Topic updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Topic not found
 */
router.patch(
  '/admin/topics/:id',
  authenticateToken,
  authorize(UserRole.ADMIN),
  [...idParamValidators, ...updateTopicValidators],
  handleValidationErrors,
  CardGameController.updateTopic
);

// ============================================================================
// QUESTION ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/cardgame/topics/{topicId}/sessions/{sessionNumber}/questions:
 *   get:
 *     tags: [Card Game]
 *     summary: Get questions for a topic session
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sessionNumber
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *       404:
 *         description: Topic not found or no questions for this session
 */
router.get(
  '/topics/:topicId/sessions/:sessionNumber/questions',
  authenticateToken,
  sessionQuestionsValidators,
  handleValidationErrors,
  CardGameController.getSessionQuestions
);

/**
 * @swagger
 * /v2/cardgame/admin/questions:
 *   post:
 *     tags: [Card Game - Admin]
 *     summary: Create new question (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicId
 *               - sessionNumber
 *               - questionOrder
 *               - questionText
 *             properties:
 *               topicId:
 *                 type: string
 *               sessionNumber:
 *                 type: integer
 *               questionOrder:
 *                 type: integer
 *               questionText:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question created successfully
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  '/admin/questions',
  authenticateToken,
  authorize(UserRole.ADMIN),
  createQuestionValidators,
  handleValidationErrors,
  CardGameController.createQuestion
);

/**
 * @swagger
 * /v2/cardgame/admin/questions/{id}:
 *   patch:
 *     tags: [Card Game - Admin]
 *     summary: Update question (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *               questionOrder:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Question not found
 */
router.patch(
  '/admin/questions/:id',
  authenticateToken,
  authorize(UserRole.ADMIN),
  [...idParamValidators, ...updateQuestionValidators],
  handleValidationErrors,
  CardGameController.updateQuestion
);

/**
 * @swagger
 * /v2/cardgame/admin/questions/{id}:
 *   delete:
 *     tags: [Card Game - Admin]
 *     summary: Delete question (Admin only) - Soft delete
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Question not found
 */
router.delete(
  '/admin/questions/:id',
  authenticateToken,
  authorize(UserRole.ADMIN),
  idParamValidators,
  handleValidationErrors,
  CardGameController.deleteQuestion
);

// ============================================================================
// SESSION ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/cardgame/sessions/start:
 *   post:
 *     tags: [Card Game]
 *     summary: Start a new session
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicId
 *               - sessionNumber
 *             properties:
 *               topicId:
 *                 type: string
 *               sessionNumber:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Session started successfully
 *       400:
 *         description: Session already started
 */
router.post(
  '/sessions/start',
  authenticateToken,
  startSessionValidators,
  handleValidationErrors,
  CardGameController.startSession
);

/**
 * @swagger
 * /v2/cardgame/sessions/{id}/complete:
 *   patch:
 *     tags: [Card Game]
 *     summary: Complete a session
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               averageRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Session completed successfully
 *       400:
 *         description: Session already completed
 *       403:
 *         description: Not your session
 *       404:
 *         description: Session not found
 */
router.patch(
  '/sessions/:id/complete',
  authenticateToken,
  [...idParamValidators, ...completeSessionValidators],
  handleValidationErrors,
  CardGameController.completeSession
);

/**
 * @swagger
 * /v2/cardgame/sessions/incomplete:
 *   get:
 *     tags: [Card Game]
 *     summary: Get incomplete sessions for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Incomplete sessions retrieved successfully
 */
router.get(
  '/sessions/incomplete',
  authenticateToken,
  CardGameController.getIncompleteSessions
);

/**
 * @swagger
 * /v2/cardgame/users/me/sessions:
 *   get:
 *     tags: [Card Game]
 *     summary: Get all sessions for current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: string
 *         description: Filter by topic ID
 *     responses:
 *       200:
 *         description: User sessions retrieved successfully
 */
router.get(
  '/users/me/sessions',
  authenticateToken,
  CardGameController.getUserSessions
);

/**
 * @swagger
 * /v2/cardgame/sessions/{id}/progress:
 *   get:
 *     tags: [Card Game]
 *     summary: Get session progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session progress retrieved successfully
 *       403:
 *         description: Not your session
 *       404:
 *         description: Session not found
 */
router.get(
  '/sessions/:id/progress',
  authenticateToken,
  idParamValidators,
  handleValidationErrors,
  CardGameController.getSessionProgress
);

/**
 * @swagger
 * /v2/cardgame/sessions/{topicId}/{sessionNumber}/summary:
 *   get:
 *     tags: [Card Game]
 *     summary: Get session summary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sessionNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session summary retrieved successfully
 *       404:
 *         description: Session not found
 */
router.get(
  '/sessions/:topicId/:sessionNumber/summary',
  authenticateToken,
  sessionSummaryValidators,
  handleValidationErrors,
  CardGameController.getSessionSummary
);

// ============================================================================
// QUESTION ROUTES
// ============================================================================

/**
 * @swagger
 * /v2/cardgame/topics/{topicId}/questions:
 *   get:
 *     tags: [Card Game]
 *     summary: Get all questions in a topic with stats
 *     description: Returns all questions in a topic across all sessions with feedback statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *         example: slowdown
 *     responses:
 *       200:
 *         description: Topic questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     topicId:
 *                       type: string
 *                     topicTitle:
 *                       type: string
 *                     totalQuestions:
 *                       type: integer
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           topicId:
 *                             type: string
 *                           sessionNumber:
 *                             type: integer
 *                           questionOrder:
 *                             type: integer
 *                           questionText:
 *                             type: string
 *                           stats:
 *                             type: object
 *                             properties:
 *                               totalFeedback:
 *                                 type: integer
 *                               averageRating:
 *                                 type: number
 *                               totalUpvotes:
 *                                 type: integer
 *                           userAnswer:
 *                             type: object
 *                             nullable: true
 *       404:
 *         description: Topic not found
 */
router.get(
  '/topics/:topicId/questions',
  authenticateToken,
  topicIdParamValidators,
  handleValidationErrors,
  CardGameController.getTopicQuestions
);

/**
 * @swagger
 * /v2/cardgame/questions/{questionId}/feedback:
 *   get:
 *     tags: [Card Game]
 *     summary: Get all feedback for a specific question
 *     description: Returns all feedback/answers for a question, sorted by upvotes by default
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [upvotes, rating, createdAt]
 *           default: upvotes
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Question feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                     meta:
 *                       type: object
 *                       properties:
 *                         questionId:
 *                           type: string
 *                         questionText:
 *                           type: string
 *                         topicId:
 *                           type: string
 *                         topicTitle:
 *                           type: string
 *                         sessionNumber:
 *                           type: integer
 *       404:
 *         description: Question not found
 */
router.get(
  '/questions/:questionId/feedback',
  authenticateToken,
  questionIdParamValidators,
  handleValidationErrors,
  CardGameController.getQuestionFeedback
);

// ============================================================================
// NEW ENHANCED ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /v2/cardgame/main-page:
 *   get:
 *     tags: [Card Game]
 *     summary: Get main page data (consolidated endpoint)
 *     description: Returns user stats, incomplete session, topics with progress, leaderboard summary, and popular questions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Main page data retrieved successfully
 */
router.get(
  '/main-page',
  authenticateToken,
  CardGameController.getMainPage
);

/**
 * @swagger
 * /v2/cardgame/leaderboard:
 *   get:
 *     tags: [Card Game]
 *     summary: Get paginated leaderboard with top 3 podium and current user position
 *     description: |
 *       Returns leaderboard in three sections:
 *       - top3: Top 3 ranked users (always shown, fixed podium positions)
 *       - others: Paginated users starting from rank 4 onwards
 *       - currentUser: Current user's position and rank
 *       
 *       Pagination applies only to the "others" section (ranks 4+).
 *       Use page/limit to navigate through users beyond the top 3.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [overall, most-sessions, most-feedback, most-replies, most-upvotes, highest-rating]
 *           default: overall
 *         description: Type of leaderboard ranking
 *       - in: query
 *         name: timePeriod
 *         schema:
 *           type: string
 *           enum: [all-time, monthly, weekly]
 *           default: all-time
 *         description: Time period filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for "others" section (ranks 4+)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page in "others" section
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     top3:
 *                       type: array
 *                       description: Top 3 users (always fixed)
 *                       items:
 *                         type: object
 *                     others:
 *                       type: array
 *                       description: Paginated users (ranks 4+)
 *                       items:
 *                         type: object
 *                     currentUser:
 *                       type: object
 *                       description: Current user's rank and position
 *                     pagination:
 *                       type: object
 *                       description: Pagination info for "others" section
 */
router.get(
  '/leaderboard',
  authenticateToken,
  CardGameController.getLeaderboard
);

/**
 * @swagger
 * /v2/cardgame/popular-questions:
 *   get:
 *     tags: [Card Game]
 *     summary: Get popular questions with engagement scoring
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [engagement, feedback, upvotes, replies, rating]
 *           default: engagement
 *       - in: query
 *         name: timePeriod
 *         schema:
 *           type: string
 *           enum: [all-time, week, month]
 *           default: all-time
 *     responses:
 *       200:
 *         description: Popular questions retrieved successfully
 */
router.get(
  '/popular-questions',
  authenticateToken,
  CardGameController.getPopularQuestions
);

/**
 * @swagger
 * /v2/cardgame/topics/{topicId}/detail:
 *   get:
 *     tags: [Card Game]
 *     summary: Get topic detail with lock/unlock logic
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sessionNumber
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Topic detail retrieved successfully
 *       404:
 *         description: Topic not found
 */
router.get(
  '/topics/:topicId/detail',
  authenticateToken,
  topicIdParamValidators,
  handleValidationErrors,
  CardGameController.getTopicDetail
);

/**
 * @swagger
 * /v2/cardgame/sessions/start-new:
 *   post:
 *     tags: [Card Game]
 *     summary: Start a new session (enhanced with timing)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicId
 *               - sessionNumber
 *             properties:
 *               topicId:
 *                 type: string
 *               sessionNumber:
 *                 type: integer
 *               deviceInfo:
 *                 type: object
 *                 properties:
 *                   platform:
 *                     type: string
 *                   os:
 *                     type: string
 *                   appVersion:
 *                     type: string
 *     responses:
 *       201:
 *         description: Session started successfully
 */
router.post(
  '/sessions/start-new',
  authenticateToken,
  CardGameController.startSessionNew
);

/**
 * @swagger
 * /v2/cardgame/sessions/{sessionId}/answers:
 *   post:
 *     tags: [Card Game]
 *     summary: Submit answer with timing data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - questionOrder
 *               - rating
 *               - timing
 *             properties:
 *               questionId:
 *                 type: string
 *               questionOrder:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               isHelpful:
 *                 type: boolean
 *               timing:
 *                 type: object
 *                 required:
 *                   - questionViewedAt
 *                   - answerStartedAt
 *                   - answerSubmittedAt
 *                   - timeSpentSeconds
 *                 properties:
 *                   questionViewedAt:
 *                     type: string
 *                     format: date-time
 *                   answerStartedAt:
 *                     type: string
 *                     format: date-time
 *                   answerSubmittedAt:
 *                     type: string
 *                     format: date-time
 *                   timeSpentSeconds:
 *                     type: integer
 *     responses:
 *       201:
 *         description: Answer submitted successfully
 */
router.post(
  '/sessions/:sessionId/answers',
  authenticateToken,
  handleValidationErrors,
  CardGameController.submitAnswer
);

/**
 * @swagger
 * /v2/cardgame/sessions/{sessionId}/complete-new:
 *   post:
 *     tags: [Card Game]
 *     summary: Complete session with summary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalDuration
 *             properties:
 *               totalDuration:
 *                 type: integer
 *               deviceInfo:
 *                 type: object
 *                 properties:
 *                   platform:
 *                     type: string
 *                   os:
 *                     type: string
 *                   appVersion:
 *                     type: string
 *     responses:
 *       200:
 *         description: Session completed with summary
 */
router.post(
  '/sessions/:sessionId/complete-new',
  authenticateToken,
  idParamValidators,
  handleValidationErrors,
  CardGameController.completeSession
);

/**
 * @swagger
 * /v2/cardgame/stats/me/detailed:
 *   get:
 *     tags: [Card Game]
 *     summary: Get detailed user statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timePeriod
 *         schema:
 *           type: string
 *           enum: [all-time, last-7-days, last-30-days, this-month]
 *           default: all-time
 *     responses:
 *       200:
 *         description: Detailed stats retrieved successfully
 */
router.get(
  '/stats/me/detailed',
  authenticateToken,
  CardGameController.getDetailedStats
);

/**
 * @swagger
 * /v2/cardgame/topics/{topicId}/sessions/{sessionNumber}/questions/{questionId}/feedback:
 *   get:
 *     summary: Get community feedback for a specific question (unlocked after session completion)
 *     tags: [Card Game]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *       - in: path
 *         name: sessionNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session number
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [upvotes, recent, rating, replies]
 *           default: recent
 *         description: Sort order
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by minimum rating
 *       - in: query
 *         name: hasComments
 *         schema:
 *           type: boolean
 *         description: Filter responses with comments only
 *     responses:
 *       200:
 *         description: Question feedback retrieved successfully
 *       403:
 *         description: Session not completed - access denied
 *       404:
 *         description: Question not found
 */
router.get(
  '/topics/:topicId/sessions/:sessionNumber/questions/:questionId/feedback',
  authenticateToken,
  CardGameController.getQuestionFeedbackBySession
);

export default router;
