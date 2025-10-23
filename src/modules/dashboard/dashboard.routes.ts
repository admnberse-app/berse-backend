/**
 * Dashboard Routes
 * All endpoints for dashboard data aggregation
 */

import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticateToken } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /v2/dashboard/summary:
 *   get:
 *     summary: Get comprehensive dashboard overview
 *     description: |
 *       Returns a complete dashboard summary including:
 *       - User's basic info (name, profile picture, trust score, trust level, points, badges, vouches)
 *       - Quick stats (communities, events, listings, connections, events attended/hosted)
 *       - Alerts (pending approvals, upcoming events)
 *       - Summary breakdowns (admin/member communities, hosting/attending events, active/sold listings)
 *       - Recent activity feed (last 10 activities)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
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
 *                   example: Dashboard summary retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         displayName:
 *                           type: string
 *                         profilePicture:
 *                           type: string
 *                         trustScore:
 *                           type: number
 *                           example: 85.5
 *                         trustLevel:
 *                           type: string
 *                           example: "trusted"
 *                         totalPoints:
 *                           type: integer
 *                           example: 1250
 *                         badgesCount:
 *                           type: integer
 *                           example: 5
 *                         vouchesCount:
 *                           type: integer
 *                           example: 3
 *                     stats:
 *                       type: object
 *                       properties:
 *                         communities:
 *                           type: integer
 *                           example: 3
 *                         events:
 *                           type: integer
 *                           example: 5
 *                         listings:
 *                           type: integer
 *                           example: 2
 *                         connections:
 *                           type: integer
 *                           example: 45
 *                         eventsAttended:
 *                           type: integer
 *                           example: 12
 *                         eventsHosted:
 *                           type: integer
 *                           example: 3
 *                     alerts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [community_approvals, upcoming_events, new_messages, listing_interest]
 *                           count:
 *                             type: integer
 *                           priority:
 *                             type: string
 *                             enum: [high, medium, low]
 *                           message:
 *                             type: string
 *                     communitySummary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         admin:
 *                           type: integer
 *                         member:
 *                           type: integer
 *                     eventSummary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         hosting:
 *                           type: integer
 *                         attending:
 *                           type: integer
 *                         upcoming:
 *                           type: integer
 *                     listingSummary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         sold:
 *                           type: integer
 *                         draft:
 *                           type: integer
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                           icon:
 *                             type: string
 *                           message:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', asyncHandler(DashboardController.getSummary));

/**
 * @swagger
 * /v2/dashboard/communities:
 *   get:
 *     summary: Get user's communities with role information
 *     description: |
 *       Returns all communities the user is a member of, including:
 *       - Role (admin or member)
 *       - Pending approval count (for admins)
 *       - Member count
 *       - Community details
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of communities to return
 *     responses:
 *       200:
 *         description: Communities retrieved successfully
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
 *                   example: Communities retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     communities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           profileImage:
 *                             type: string
 *                           location:
 *                             type: string
 *                           memberCount:
 *                             type: integer
 *                           userRole:
 *                             type: string
 *                             enum: [admin, member]
 *                           pendingApprovals:
 *                             type: integer
 *                             description: Only present for admin users
 *                           isPrivate:
 *                             type: boolean
 *                           joinedAt:
 *                             type: string
 *                             format: date-time
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         admin:
 *                           type: integer
 *                         member:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/communities', asyncHandler(DashboardController.getMyCommunities));

/**
 * @swagger
 * /v2/dashboard/events:
 *   get:
 *     summary: Get user's events (hosting and attending)
 *     description: |
 *       Returns all events the user is involved with, including:
 *       - Events they are hosting
 *       - Events they are attending
 *       - RSVP status and role information
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, past, all]
 *           default: upcoming
 *         description: Filter by event status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of events to return
 *     responses:
 *       200:
 *         description: Events retrieved successfully
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
 *                   example: Events retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           startsAt:
 *                             type: string
 *                             format: date-time
 *                           endsAt:
 *                             type: string
 *                             format: date-time
 *                           location:
 *                             type: object
 *                           coverImage:
 *                             type: string
 *                           attendeeCount:
 *                             type: integer
 *                           maxAttendees:
 *                             type: integer
 *                           userRole:
 *                             type: string
 *                             enum: [host, attendee]
 *                           rsvpStatus:
 *                             type: string
 *                             enum: [going, interested, not_going]
 *                           community:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         hosting:
 *                           type: integer
 *                         attending:
 *                           type: integer
 *                         upcoming:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/events', asyncHandler(DashboardController.getMyEvents));

/**
 * @swagger
 * /v2/dashboard/listings:
 *   get:
 *     summary: Get user's marketplace listings
 *     description: |
 *       Returns all marketplace listings created by the user, including:
 *       - Listing details (title, price, images)
 *       - Status (active, sold, draft, archived)
 *       - View and message counts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, sold, draft, archived]
 *         description: Filter by listing status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of listings to return
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
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
 *                   example: Listings retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     listings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           currency:
 *                             type: string
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           location:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [active, sold, draft, archived]
 *                           viewCount:
 *                             type: integer
 *                           messageCount:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         sold:
 *                           type: integer
 *                         draft:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/listings', asyncHandler(DashboardController.getMyListings));

/**
 * @swagger
 * /v2/dashboard/activity:
 *   get:
 *     summary: Get user's recent activity feed
 *     description: |
 *       Returns recent activities related to the user, including:
 *       - Community joins (for communities they admin)
 *       - Event RSVPs (for events they host)
 *       - Listing interactions
 *       - Badge awards
 *       - Connection requests
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of activities to return
 *     responses:
 *       200:
 *         description: Activity feed retrieved successfully
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
 *                   example: Activity feed retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     activities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [community_join, community_post, event_rsvp, event_checkin, listing_comment, listing_sold, badge_earned, connection_request, vouch_received]
 *                           icon:
 *                             type: string
 *                           message:
 *                             type: string
 *                           targetName:
 *                             type: string
 *                           details:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           targetId:
 *                             type: string
 *                           targetType:
 *                             type: string
 *                             enum: [community, event, listing, user, badge]
 *                           read:
 *                             type: boolean
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/activity', asyncHandler(DashboardController.getActivity));

export default router;
