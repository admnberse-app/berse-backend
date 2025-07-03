import { Router } from 'express';
import { body, query } from 'express-validator';
import { EventController } from '../controllers/event.controller';
import { authenticate, authorize } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get(
  '/',
  [
    query('type').optional().isIn(['SOCIAL', 'SPORTS', 'TRIP', 'ILM', 'CAFE_MEETUP', 'VOLUNTEER', 'MONTHLY_EVENT', 'LOCAL_TRIP']),
    query('city').optional().trim(),
    query('upcoming').optional().isBoolean(),
  ],
  handleValidationErrors,
  EventController.getEvents
);

router.get('/:id', EventController.getEventById);

// Protected routes
router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.MODERATOR),
  [
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('type').isIn(['SOCIAL', 'SPORTS', 'TRIP', 'ILM', 'CAFE_MEETUP', 'VOLUNTEER', 'MONTHLY_EVENT', 'LOCAL_TRIP']),
    body('date').isISO8601(),
    body('location').notEmpty().trim(),
    body('mapLink').optional().isURL(),
    body('maxAttendees').optional().isInt({ min: 1 }),
    body('notes').optional().trim(),
  ],
  handleValidationErrors,
  EventController.createEvent
);

router.put(
  '/:id',
  [
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('type').optional().isIn(['SOCIAL', 'SPORTS', 'TRIP', 'ILM', 'CAFE_MEETUP', 'VOLUNTEER', 'MONTHLY_EVENT', 'LOCAL_TRIP']),
    body('date').optional().isISO8601(),
    body('location').optional().trim(),
    body('mapLink').optional().isURL(),
    body('maxAttendees').optional().isInt({ min: 1 }),
    body('notes').optional().trim(),
  ],
  handleValidationErrors,
  EventController.updateEvent
);

router.post('/:id/rsvp', EventController.rsvpEvent);

router.post(
  '/checkin',
  [
    body('eventId').notEmpty(),
    body('userId').notEmpty(),
  ],
  handleValidationErrors,
  EventController.checkInEvent
);

export default router;