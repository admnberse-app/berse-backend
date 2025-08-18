import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../../../middleware/auth';
import { asyncHandler } from '../../../utils/asyncHandler';
import { EventController } from '../../../controllers/event.controller';
import { prisma } from '../../../config/database';
import { sendSuccess } from '../../../utils/response';
import { AppError } from '../../../middleware/error';

const router = Router();

// List events
router.get('/', optionalAuth, asyncHandler(EventController.getEvents));

// Get event by ID
router.get('/:id', optionalAuth, asyncHandler(EventController.getEventById));

// Create event (protected)
router.post('/', authenticateToken, asyncHandler(EventController.createEvent));

// Update event (protected)
router.put('/:id', authenticateToken, asyncHandler(EventController.updateEvent));

// Delete event (protected)
router.delete('/:id', authenticateToken, asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user?.id!;
    const { id } = req.params;

    // Check if user is the host
    const event = await prisma.event.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.hostId !== userId) {
      throw new AppError('Unauthorized to delete this event', 403);
    }

    await prisma.event.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Event deleted successfully');
  } catch (error) {
    next(error);
  }
}));

// RSVP to event (join)
router.post('/:id/rsvp', authenticateToken, asyncHandler(EventController.rsvpEvent));

// Cancel RSVP (leave event)
router.delete('/:id/rsvp', authenticateToken, asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user?.id!;
    const { id: eventId } = req.params;

    const rsvp = await prisma.eventRSVP.findFirst({
      where: {
        userId,
        eventId,
      },
    });

    if (!rsvp) {
      throw new AppError('Not joined to this event', 400);
    }

    await prisma.eventRSVP.delete({
      where: { id: rsvp.id },
    });

    sendSuccess(res, null, 'Successfully left event');
  } catch (error) {
    next(error);
  }
}));

// Check in to event
router.post('/:id/checkin', authenticateToken, asyncHandler(EventController.checkInEvent));

export default router;