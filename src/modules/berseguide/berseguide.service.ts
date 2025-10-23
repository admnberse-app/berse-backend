import { PrismaClient, BerseGuideBookingStatus, ReviewerRole, Prisma } from '@prisma/client';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';
import { BerseGuideNotifications } from './berseguide.notifications';
import type {
  CreateBerseGuideProfileDTO,
  UpdateBerseGuideProfileDTO,
  BerseGuideProfileResponse,
  CreatePaymentOptionDTO,
  UpdatePaymentOptionDTO,
  PaymentOptionResponse,
  CreateBookingRequestDTO,
  ApproveBookingDTO,
  RejectBookingDTO,
  CancelBookingDTO,
  BerseGuideBookingResponse,
  CreateSessionDTO,
  UpdateSessionDTO,
  EndSessionDTO,
  SessionResponse,
  CreateReviewDTO,
  BerseGuideReviewResponse,
  SearchBerseGuideDTO,
  SearchBerseGuideResponse,
  BerseGuideDashboardResponse,
  ToggleBerseGuideDTO,
  CheckAvailabilityDTO,
  CheckAvailabilityResponse,
} from './berseguide.types';

const prisma = new PrismaClient();

// Trust score requirements from schema proposal
const BERSEGUIDE_REQUIREMENTS = {
  minTrustScore: 65,
  minTrustLevel: 'trusted',
  allowedTrustLevels: ['trusted', 'verified', 'ambassador'],
};

export class BerseGuideService {
  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Check if user can enable BerseGuide based on trust score
   */
  async canEnableBerseGuide(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { trustScore: true, trustLevel: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return (
        user.trustScore >= BERSEGUIDE_REQUIREMENTS.minTrustScore &&
        BERSEGUIDE_REQUIREMENTS.allowedTrustLevels.includes(user.trustLevel)
      );
    } catch (error) {
      logger.error('Failed to check BerseGuide eligibility', { error, userId });
      throw error;
    }
  }

  /**
   * Get user's BerseGuide profile
   */
  async getProfile(userId: string, viewerId?: string): Promise<BerseGuideProfileResponse | null> {
    try {
      const profile = await prisma.userBerseGuide.findUnique({
        where: { userId },
        include: {
          paymentOptions: true,
          user: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      if (!profile) {
        return null;
      }

      const isOwner = viewerId === userId;
      
      return this.formatProfileResponse(profile, isOwner);
    } catch (error) {
      logger.error('Failed to get BerseGuide profile', { error, userId });
      throw error;
    }
  }

  /**
   * Create BerseGuide profile
   */
  async createProfile(userId: string, data: CreateBerseGuideProfileDTO): Promise<BerseGuideProfileResponse> {
    try {
      // Check if user can enable BerseGuide
      const canEnable = await this.canEnableBerseGuide(userId);
      if (!canEnable) {
        throw new AppError(
          'You do not meet the trust requirements to enable BerseGuide. Minimum trust score: 65, trust level: trusted',
          403
        );
      }

      // Check if profile already exists
      const existingProfile = await prisma.userBerseGuide.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        throw new AppError('BerseGuide profile already exists', 409);
      }

      // Create profile
      const profile = await prisma.userBerseGuide.create({
        data: {
          userId,
          title: data.title,
          description: data.bio,
          guideTypes: data.guideTypes,
          customTypes: data.specialties || [],
          languages: data.languages,
          city: data.city,
          neighborhoods: data.neighborhoods || [],
          maxGroupSize: data.maxGroupSize,
          advanceNotice: data.advanceNotice,
          photos: data.photos || [],
          availabilityNotes: data.availabilityNotes,
          isEnabled: false, // Disabled by default
        },
        include: {
          paymentOptions: true,
          user: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      logger.info('BerseGuide profile created', { userId });

      return this.formatProfileResponse(profile, true);
    } catch (error) {
      logger.error('Failed to create BerseGuide profile', { error, userId, data });
      throw error;
    }
  }

  /**
   * Update BerseGuide profile
   */
  async updateProfile(userId: string, data: UpdateBerseGuideProfileDTO): Promise<BerseGuideProfileResponse> {
    try {
      const existingProfile = await prisma.userBerseGuide.findUnique({
        where: { userId },
      });

      if (!existingProfile) {
        throw new AppError('BerseGuide profile not found', 404);
      }

      const profile = await prisma.userBerseGuide.update({
        where: { userId },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.bio && { description: data.bio }),
          ...(data.guideTypes && { guideTypes: data.guideTypes }),
          ...(data.languages && { languages: data.languages }),
          ...(data.specialties && { customTypes: data.specialties }),
          ...(data.city && { city: data.city }),
          ...(data.neighborhoods && { neighborhoods: data.neighborhoods }),
          ...(data.maxGroupSize && { maxGroupSize: data.maxGroupSize }),
          ...(data.availabilityNotes !== undefined && { availabilityNotes: data.availabilityNotes }),
          ...(data.advanceNotice !== undefined && { advanceNotice: data.advanceNotice }),
          ...(data.photos && { photos: data.photos }),
          lastActiveAt: new Date(),
        },
        include: {
          paymentOptions: true,
          user: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      logger.info('BerseGuide profile updated', { userId });

      return this.formatProfileResponse(profile, true);
    } catch (error) {
      logger.error('Failed to update BerseGuide profile', { error, userId, data });
      throw error;
    }
  }

  /**
   * Toggle BerseGuide profile on/off
   */
  async toggleProfile(userId: string, data: ToggleBerseGuideDTO): Promise<BerseGuideProfileResponse> {
    try {
      // If enabling, check trust requirements
      if (data.isEnabled) {
        const canEnable = await this.canEnableBerseGuide(userId);
        if (!canEnable) {
          throw new AppError('You do not meet the trust requirements to enable BerseGuide', 403);
        }
      }

      const profile = await prisma.userBerseGuide.update({
        where: { userId },
        data: {
          isEnabled: data.isEnabled,
          lastActiveAt: new Date(),
        },
        include: {
          paymentOptions: true,
          user: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      logger.info('BerseGuide profile toggled', { userId, isEnabled: data.isEnabled });

      return this.formatProfileResponse(profile, true);
    } catch (error) {
      logger.error('Failed to toggle BerseGuide profile', { error, userId, data });
      throw error;
    }
  }

  /**
   * Delete BerseGuide profile
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      // Check for active bookings
      const activeBookings = await prisma.berseGuideBooking.count({
        where: {
          guideId: userId,
          status: {
            in: ['PENDING', 'DISCUSSING', 'APPROVED', 'IN_PROGRESS'],
          },
        },
      });

      if (activeBookings > 0) {
        throw new AppError('Cannot delete profile with active bookings', 400);
      }

      await prisma.userBerseGuide.delete({
        where: { userId },
      });

      logger.info('BerseGuide profile deleted', { userId });
    } catch (error) {
      logger.error('Failed to delete BerseGuide profile', { error, userId });
      throw error;
    }
  }

  // ============================================================================
  // PAYMENT OPTIONS MANAGEMENT
  // ============================================================================

  /**
   * Add payment option
   */
  async addPaymentOption(userId: string, data: CreatePaymentOptionDTO): Promise<PaymentOptionResponse> {
    try {
      const profile = await prisma.userBerseGuide.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new AppError('BerseGuide profile not found', 404);
      }

      // If setting as preferred, unset other preferred options
      if (data.isPreferred) {
        await prisma.berseGuidePaymentOption.updateMany({
          where: { berseGuideId: userId },
          data: { isPreferred: false },
        });
      }

      const paymentOption = await prisma.berseGuidePaymentOption.create({
        data: {
          berseGuideId: userId,
          paymentType: data.paymentType,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          isPreferred: data.isPreferred || false,
        },
      });

      logger.info('Payment option added', { userId, paymentOptionId: paymentOption.id });

      return {
        ...paymentOption,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error('Failed to add payment option', { error, userId, data });
      throw error;
    }
  }

  /**
   * Update payment option
   */
  async updatePaymentOption(
    userId: string,
    optionId: string,
    data: UpdatePaymentOptionDTO
  ): Promise<PaymentOptionResponse> {
    try {
      const option = await prisma.berseGuidePaymentOption.findUnique({
        where: { id: optionId },
        include: { berseGuide: true },
      });

      if (!option) {
        throw new AppError('Payment option not found', 404);
      }

      if (option.berseGuide.userId !== userId) {
        throw new AppError('Unauthorized to update this payment option', 403);
      }

      // If setting as preferred, unset other preferred options
      if (data.isPreferred) {
        await prisma.berseGuidePaymentOption.updateMany({
          where: { 
            berseGuideId: userId,
            id: { not: optionId },
          },
          data: { isPreferred: false },
        });
      }

      const updatedOption = await prisma.berseGuidePaymentOption.update({
        where: { id: optionId },
        data,
      });

      logger.info('Payment option updated', { userId, optionId });

      return {
        ...updatedOption,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error('Failed to update payment option', { error, userId, optionId, data });
      throw error;
    }
  }

  /**
   * Delete payment option
   */
  async deletePaymentOption(userId: string, optionId: string): Promise<void> {
    try {
      const option = await prisma.berseGuidePaymentOption.findUnique({
        where: { id: optionId },
        include: { berseGuide: true },
      });

      if (!option) {
        throw new AppError('Payment option not found', 404);
      }

      if (option.berseGuide.userId !== userId) {
        throw new AppError('Unauthorized to delete this payment option', 403);
      }

      await prisma.berseGuidePaymentOption.delete({
        where: { id: optionId },
      });

      logger.info('Payment option deleted', { userId, optionId });
    } catch (error) {
      logger.error('Failed to delete payment option', { error, userId, optionId });
      throw error;
    }
  }

  // ============================================================================
  // BOOKING MANAGEMENT
  // ============================================================================

  /**
   * Create booking request (Tourist)
   */
  async createBookingRequest(
    travelerId: string,
    data: CreateBookingRequestDTO
  ): Promise<BerseGuideBookingResponse> {
    try {
      // Check if guide profile exists and is enabled
      const guideProfile = await prisma.userBerseGuide.findUnique({
        where: { userId: data.guideId },
      });

      if (!guideProfile) {
        throw new AppError('Guide profile not found', 404);
      }

      if (!guideProfile.isEnabled) {
        throw new AppError('Guide is not currently accepting bookings', 400);
      }

      // Check if tourist is trying to book themselves
      if (travelerId === data.guideId) {
        throw new AppError('You cannot book yourself as a guide', 400);
      }

      // Validate dates and times
      const preferredDate = data.date ? new Date(data.date) : undefined;

      if (preferredDate && preferredDate < new Date()) {
        throw new AppError('Booking date cannot be in the past', 400);
      }

      if (data.numberOfPeople < 1 || data.numberOfPeople > guideProfile.maxGroupSize) {
        throw new AppError(`Group size must be between 1 and ${guideProfile.maxGroupSize}`, 400);
      }

      // Create booking
      const booking = await prisma.berseGuideBooking.create({
        data: {
          guideId: data.guideId,
          travelerId,
          preferredDate,
          numberOfPeople: data.numberOfPeople,
          interests: data.interests || [],
          specificRequests: data.specialRequests,
          message: data.message,
          status: 'PENDING',
        },
        include: {
          guide: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          traveler: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      logger.info('Booking request created', { bookingId: booking.id, travelerId, guideId: data.guideId });

      // Send notification to guide
      await BerseGuideNotifications.notifyGuideOfNewRequest(
        data.guideId,
        booking.traveler.fullName,
        booking.id
      );

      return this.formatBookingResponse(booking);
    } catch (error) {
      logger.error('Failed to create booking request', { error, travelerId, data });
      throw error;
    }
  }

  /**
   * Check availability for time slot
   */
  async checkAvailability(data: CheckAvailabilityDTO): Promise<CheckAvailabilityResponse> {
    try {
      const date = new Date(data.date);

      const conflictingBookings = await prisma.berseGuideBooking.findMany({
        where: {
          guideId: data.guideId,
          agreedDate: date,
          status: {
            in: ['APPROVED', 'IN_PROGRESS', 'DISCUSSING'],
          },
        },
        include: {
          traveler: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      const available = conflictingBookings.length === 0;

      return {
        available,
        conflictingBookings: available ? undefined : conflictingBookings.map(this.formatBookingResponse),
        message: available ? 'Time slot is available' : 'Guide has conflicting bookings for this time',
      };
    } catch (error) {
      logger.error('Failed to check availability', { error, data });
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId: string, userId: string): Promise<BerseGuideBookingResponse> {
    try {
      const booking = await prisma.berseGuideBooking.findUnique({
        where: { id: bookingId },
        include: {
          guide: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          traveler: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          session: true,
        },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      // Check permission
      if (booking.guideId !== userId && booking.travelerId !== userId) {
        throw new AppError('Unauthorized to view this booking', 403);
      }

      return this.formatBookingResponse(booking);
    } catch (error) {
      logger.error('Failed to get booking', { error, bookingId, userId });
      throw error;
    }
  }

  /**
   * Get bookings as guide
   */
  async getBookingsAsGuide(
    guideId: string,
    status?: BerseGuideBookingStatus
  ): Promise<BerseGuideBookingResponse[]> {
    try {
      const bookings = await prisma.berseGuideBooking.findMany({
        where: {
          guideId,
          ...(status && { status }),
        },
        include: {
          guide: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          traveler: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          session: true,
        },
        orderBy: {
          requestedAt: 'desc',
        },
      });

      return bookings.map(this.formatBookingResponse);
    } catch (error) {
      logger.error('Failed to get bookings as guide', { error, guideId, status });
      throw error;
    }
  }

  /**
   * Get bookings as tourist
   */
  async getBookingsAsTourist(
    travelerId: string,
    status?: BerseGuideBookingStatus
  ): Promise<BerseGuideBookingResponse[]> {
    try {
      const bookings = await prisma.berseGuideBooking.findMany({
        where: {
          travelerId,
          ...(status && { status }),
        },
        include: {
          guide: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          traveler: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          session: true,
        },
        orderBy: {
          requestedAt: 'desc',
        },
      });

      return bookings.map(this.formatBookingResponse);
    } catch (error) {
      logger.error('Failed to get bookings as tourist', { error, travelerId, status });
      throw error;
    }
  }

  /**
   * Approve booking (Guide)
   */
  async approveBooking(
    guideId: string,
    bookingId: string,
    data: ApproveBookingDTO
  ): Promise<BerseGuideBookingResponse> {
    try {
      const booking = await prisma.berseGuideBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.guideId !== guideId) {
        throw new AppError('Unauthorized to approve this booking', 403);
      }

      if (booking.status !== 'PENDING' && booking.status !== 'DISCUSSING') {
        throw new AppError('Booking cannot be approved in current status', 400);
      }

      const updatedBooking = await prisma.berseGuideBooking.update({
        where: { id: bookingId },
        data: {
          status: 'APPROVED',
          agreedPaymentType: data.agreedPaymentType,
          agreedPaymentAmount: data.agreedPaymentAmount,
          agreedPaymentDetails: data.agreedPaymentDetails,
          meetingPoint: data.meetingPoint,
          itinerary: data.itinerary,
          approvedAt: new Date(),
          respondedAt: booking.respondedAt || new Date(),
        },
        include: {
          guide: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          traveler: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      // Update guide's response rate
      await this.updateGuideStats(guideId);

      logger.info('Booking approved', { bookingId, guideId });

      // Send notification to traveler
      await BerseGuideNotifications.notifyTravelerOfApproval(
        booking.travelerId,
        updatedBooking.guide.fullName,
        bookingId
      );

      return this.formatBookingResponse(updatedBooking);
    } catch (error) {
      logger.error('Failed to approve booking', { error, guideId, bookingId, data });
      throw error;
    }
  }

  /**
   * Reject booking (Guide)
   */
  async rejectBooking(
    guideId: string,
    bookingId: string,
    data: RejectBookingDTO
  ): Promise<BerseGuideBookingResponse> {
    try {
      const booking = await prisma.berseGuideBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.guideId !== guideId) {
        throw new AppError('Unauthorized to reject this booking', 403);
      }

      if (booking.status !== 'PENDING' && booking.status !== 'DISCUSSING') {
        throw new AppError('Booking cannot be rejected in current status', 400);
      }

      const updatedBooking = await prisma.berseGuideBooking.update({
        where: { id: bookingId },
        data: {
          status: 'REJECTED',
          cancellationReason: data.cancellationReason,
          cancelledAt: new Date(),
          respondedAt: booking.respondedAt || new Date(),
        },
        include: {
          guide: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          traveler: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      // Update guide's response rate
      await this.updateGuideStats(guideId);

      logger.info('Booking rejected', { bookingId, guideId });

      // Send notification to traveler
      await BerseGuideNotifications.notifyTravelerOfRejection(
        booking.travelerId,
        updatedBooking.guide.fullName,
        bookingId,
        data.cancellationReason
      );

      return this.formatBookingResponse(updatedBooking);
    } catch (error) {
      logger.error('Failed to reject booking', { error, guideId, bookingId, data });
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(
    userId: string,
    bookingId: string,
    data: CancelBookingDTO
  ): Promise<BerseGuideBookingResponse> {
    try {
      const booking = await prisma.berseGuideBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      const isGuide = booking.guideId === userId;
      const isTraveler = booking.travelerId === userId;

      if (!isGuide && !isTraveler) {
        throw new AppError('Unauthorized to cancel this booking', 403);
      }

      const newStatus = isGuide ? 'CANCELLED_BY_GUIDE' : 'CANCELLED_BY_TRAVELER';

      const updatedBooking = await prisma.berseGuideBooking.update({
        where: { id: bookingId },
        data: {
          status: newStatus,
          cancellationReason: data.cancellationReason,
          cancelledAt: new Date(),
        },
        include: {
          guide: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          traveler: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      logger.info('Booking cancelled', { bookingId, userId, cancelledBy: isGuide ? 'guide' : 'traveler' });

      // Send notification to the other party
      const otherUserId = isGuide ? booking.travelerId : booking.guideId;
      await BerseGuideNotifications.notifyOfCancellation(
        otherUserId,
        isGuide ? 'guide' : 'traveler',
        bookingId,
        isGuide
      );

      return this.formatBookingResponse(updatedBooking);
    } catch (error) {
      logger.error('Failed to cancel booking', { error, userId, bookingId, data });
      throw error;
    }
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Start session (Guide)
   */
  async startSession(guideId: string, data: CreateSessionDTO): Promise<SessionResponse> {
    try {
      const booking = await prisma.berseGuideBooking.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.guideId !== guideId) {
        throw new AppError('Unauthorized to start session for this booking', 403);
      }

      if (booking.status !== 'APPROVED') {
        throw new AppError('Booking must be approved before starting session', 400);
      }

      // Check if there's already an active session
      const activeSession = await prisma.berseGuideSession.findFirst({
        where: {
          bookingId: data.bookingId,
          endTime: null,
        },
      });

      if (activeSession) {
        throw new AppError('An active session already exists for this booking', 400);
      }

      const session = await prisma.berseGuideSession.create({
        data: {
          bookingId: data.bookingId,
          guideId: booking.guideId,
          travelerId: booking.travelerId,
          date: booking.agreedDate || new Date(),
          startTime: new Date(),
          notes: data.notes,
          locationsCovered: [],
        },
      });

      // Update booking status
      await prisma.berseGuideBooking.update({
        where: { id: data.bookingId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });

      logger.info('Session started', { sessionId: session.id, bookingId: data.bookingId, guideId });

      // Get guide info for notification
      const guide = await prisma.user.findUnique({
        where: { id: guideId },
        select: { fullName: true },
      });

      // Send notification to traveler
      if (guide) {
        await BerseGuideNotifications.notifyTravelerOfSessionStart(
          booking.travelerId,
          guide.fullName,
          session.id,
          data.bookingId
        );
      }

      return this.formatSessionResponse(session);
    } catch (error) {
      logger.error('Failed to start session', { error, guideId, data });
      throw error;
    }
  }

  /**
   * Update session (Guide)
   */
  async updateSession(
    guideId: string,
    sessionId: string,
    data: UpdateSessionDTO
  ): Promise<SessionResponse> {
    try {
      const session = await prisma.berseGuideSession.findUnique({
        where: { id: sessionId },
        include: {
          booking: true,
        },
      });

      if (!session) {
        throw new AppError('Session not found', 404);
      }

      if (session.booking.guideId !== guideId) {
        throw new AppError('Unauthorized to update this session', 403);
      }

      if (session.endTime) {
        throw new AppError('Cannot update ended session', 400);
      }

      const updatedSession = await prisma.berseGuideSession.update({
        where: { id: sessionId },
        data,
      });

      logger.info('Session updated', { sessionId, guideId });

      // Send notification to traveler if places or notes are added
      if (data.placesVisited || data.highlights || data.notes) {
        const guide = await prisma.user.findUnique({
          where: { id: guideId },
          select: { fullName: true },
        });

        if (guide) {
          const updateType = data.placesVisited ? 'locations' : data.highlights ? 'photos' : 'notes';
          await BerseGuideNotifications.notifyOfSessionUpdate(
            session.travelerId,
            guide.fullName,
            sessionId,
            updateType
          );
        }
      }

      return this.formatSessionResponse(updatedSession);
    } catch (error) {
      logger.error('Failed to update session', { error, guideId, sessionId, data });
      throw error;
    }
  }

  /**
   * End session (Guide)
   */
  async endSession(guideId: string, sessionId: string, data: EndSessionDTO): Promise<SessionResponse> {
    try {
      const session = await prisma.berseGuideSession.findUnique({
        where: { id: sessionId },
        include: {
          booking: true,
        },
      });

      if (!session) {
        throw new AppError('Session not found', 404);
      }

      if (session.booking.guideId !== guideId) {
        throw new AppError('Unauthorized to end this session', 403);
      }

      if (session.endTime) {
        throw new AppError('Session already ended', 400);
      }

      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / (1000 * 60));

      const updatedSession = await prisma.berseGuideSession.update({
        where: { id: sessionId },
        data: {
          endTime,
          actualDuration: duration,
          notes: data.notes || session.notes,
          locationsCovered: data.placesVisited || session.locationsCovered,
        },
      });

      // Update booking status to completed
      await prisma.berseGuideBooking.update({
        where: { id: session.bookingId },
        data: {
          status: 'COMPLETED',
          completedAt: endTime,
        },
      });

      // Update guide's total sessions count
      await prisma.userBerseGuide.update({
        where: { userId: guideId },
        data: {
          totalSessions: {
            increment: 1,
          },
        },
      });

      logger.info('Session ended', { sessionId, bookingId: session.bookingId, guideId, duration });

      // Send notification to both guide and traveler
      await BerseGuideNotifications.notifyOfSessionEnd(
        session.guideId,
        session.travelerId,
        sessionId,
        session.bookingId
      );

      return this.formatSessionResponse(updatedSession);
    } catch (error) {
      logger.error('Failed to end session', { error, guideId, sessionId, data });
      throw error;
    }
  }

  /**
   * Get sessions for a booking
   */
  async getSessionsForBooking(bookingId: string, userId: string): Promise<SessionResponse[]> {
    try {
      const booking = await prisma.berseGuideBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.guideId !== userId && booking.travelerId !== userId) {
        throw new AppError('Unauthorized to view sessions for this booking', 403);
      }

      const sessions = await prisma.berseGuideSession.findMany({
        where: { bookingId },
        orderBy: { startTime: 'desc' },
      });

      return sessions.map(this.formatSessionResponse);
    } catch (error) {
      logger.error('Failed to get sessions for booking', { error, bookingId, userId });
      throw error;
    }
  }

  // ============================================================================
  // REVIEW MANAGEMENT
  // ============================================================================

  /**
   * Create review
   */
  async createReview(userId: string, data: CreateReviewDTO): Promise<BerseGuideReviewResponse> {
    try {
      const booking = await prisma.berseGuideBooking.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      // Check if user is involved in this booking
      if (booking.guideId !== userId && booking.travelerId !== userId) {
        throw new AppError('Unauthorized to review this booking', 403);
      }

      // Check if booking is completed
      if (booking.status !== 'COMPLETED') {
        throw new AppError('Booking must be completed before reviewing', 400);
      }

      // Check if user already reviewed
      const existingReview = await prisma.berseGuideReview.findFirst({
        where: {
          bookingId: data.bookingId,
          travelerId: userId,
        },
      });

      if (existingReview) {
        throw new AppError('You have already reviewed this booking', 409);
      }

      const review = await prisma.berseGuideReview.create({
        data: {
          bookingId: data.bookingId,
          guideId: data.revieweeId,
          travelerId: userId,
          rating: data.rating,
          review: data.review,
          knowledge: data.knowledge,
          communication: data.communication,
          friendliness: data.friendliness,
          value: data.professionalism,
          wouldRecommend: data.wouldRecommend,
          highlights: data.photos || [],
          photos: data.photos || [],
          isPublic: data.isPublic !== undefined ? data.isPublic : true,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          guide: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      // Update guide's rating
      await this.updateGuideRating(data.revieweeId);

      logger.info('Review created', { reviewId: review.id, userId, bookingId: data.bookingId });

      // Send notification to reviewee
      const revieweeId = booking.guideId === userId ? booking.travelerId : booking.guideId;
      await BerseGuideNotifications.notifyOfNewReview(
        revieweeId,
        review.reviewer.fullName,
        data.rating,
        review.id
      );

      return this.formatReviewResponse(review);
    } catch (error) {
      logger.error('Failed to create review', { error, userId, data });
      throw error;
    }
  }

  /**
   * Get reviews for a user
   */
  async getReviews(userId: string, type: 'given' | 'received'): Promise<BerseGuideReviewResponse[]> {
    try {
      const reviews = await prisma.berseGuideReview.findMany({
        where: type === 'given' ? { travelerId: userId } : { guideId: userId },
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          guide: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reviews.map(this.formatReviewResponse);
    } catch (error) {
      logger.error('Failed to get reviews', { error, userId, type });
      throw error;
    }
  }

  // ============================================================================
  // SEARCH & DISCOVERY
  // ============================================================================

  /**
   * Search BerseGuide profiles
   */
  async searchProfiles(query: SearchBerseGuideDTO): Promise<SearchBerseGuideResponse> {
    try {
      const {
        city,
        date,
        startTime,
        endTime,
        numberOfPeople,
        guideTypes,
        languages,
        specialties,
        minRating,
        maxHourlyRate,
        paymentTypes,
        page = 1,
        limit = 20,
        sortBy = 'rating',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      const where: any = {
        isEnabled: true,
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
        ...(numberOfPeople && { maxGroupSize: { gte: numberOfPeople } }),
        ...(guideTypes && { guideTypes: { hasSome: guideTypes } }),
        ...(languages && { languages: { hasSome: languages } }),
        ...(specialties && { specialties: { hasSome: specialties } }),
        ...(minRating && { rating: { gte: minRating } }),
        ...(maxHourlyRate && { hourlyRate: { lte: maxHourlyRate } }),
      };

      // If payment types specified, filter by payment options
      if (paymentTypes && paymentTypes.length > 0) {
        where.paymentOptions = {
          some: {
            paymentType: { in: paymentTypes },
          },
        };
      }

      // If date specified, exclude guides with conflicting bookings
      if (date) {
        const bookingDate = new Date(date);

        where.bookings = {
          none: {
            agreedDate: bookingDate,
            status: { in: ['APPROVED', 'IN_PROGRESS', 'DISCUSSING'] },
          },
        };
      }

      const [profiles, total] = await Promise.all([
        prisma.userBerseGuide.findMany({
          where,
          include: {
            paymentOptions: true,
            user: {
              select: {
                id: true,
                fullName: true,
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.userBerseGuide.count({ where }),
      ]);

      return {
        data: profiles.map((profile) => this.formatProfileResponse(profile, false)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to search profiles', { error, query });
      throw error;
    }
  }

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  /**
   * Get dashboard data
   */
  async getDashboard(userId: string): Promise<BerseGuideDashboardResponse> {
    try {
      const [profile, user, pendingRequests, upcomingBookings] = await Promise.all([
        this.getProfile(userId, userId),
        prisma.user.findUnique({
          where: { id: userId },
          select: { trustScore: true, trustLevel: true },
        }),
        prisma.berseGuideBooking.findMany({
          where: {
            guideId: userId,
            status: 'PENDING',
          },
          include: {
            traveler: {
              select: {
                id: true,
                fullName: true,
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
          orderBy: {
            requestedAt: 'desc',
          },
          take: 5,
        }),
        prisma.berseGuideBooking.findMany({
          where: {
            guideId: userId,
            status: { in: ['APPROVED', 'IN_PROGRESS'] },
            agreedDate: { gte: new Date() },
          },
          include: {
            traveler: {
              select: {
                id: true,
                fullName: true,
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
          orderBy: {
            agreedDate: 'asc',
          },
          take: 5,
        }),
      ]);

      const canEnable = user
        ? user.trustScore >= BERSEGUIDE_REQUIREMENTS.minTrustScore &&
          BERSEGUIDE_REQUIREMENTS.allowedTrustLevels.includes(user.trustLevel)
        : false;

      return {
        profile: profile || undefined,
        stats: {
          totalSessions: profile?.totalSessions || 0,
          pendingRequests: pendingRequests.length,
          upcomingBookings: upcomingBookings.length,
          rating: profile?.rating || 0,
          reviewCount: profile?.reviewCount || 0,
          responseRate: profile?.responseRate || 0,
        },
        recentRequests: pendingRequests.map(this.formatBookingResponse),
        upcomingBookings: upcomingBookings.map(this.formatBookingResponse),
        canEnable,
        trustRequirement: {
          required: true,
          minTrustScore: BERSEGUIDE_REQUIREMENTS.minTrustScore,
          minTrustLevel: BERSEGUIDE_REQUIREMENTS.minTrustLevel,
          currentTrustScore: user?.trustScore || 0,
          currentTrustLevel: user?.trustLevel || 'starter',
          meetsRequirement: canEnable,
        },
      };
    } catch (error) {
      logger.error('Failed to get dashboard', { error, userId });
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Format profile response
   */
  private formatProfileResponse(profile: any, isOwner: boolean): BerseGuideProfileResponse {
    return {
      userId: profile.userId,
      isEnabled: profile.isEnabled,
      title: profile.title,
      bio: profile.description,
      guideTypes: profile.guideTypes,
      languages: profile.languages,
      specialties: profile.customTypes || [],
      photos: profile.photos,
      hourlyRate: undefined, // Not in schema
      halfDayRate: undefined, // Not in schema
      fullDayRate: undefined, // Not in schema
      currency: undefined, // Not in schema
      maxGroupSize: profile.maxGroupSize,
      paymentOptions: profile.paymentOptions || [],
      city: profile.city,
      neighborhoods: profile.neighborhoods,
      availabilityNotes: profile.availabilityNotes,
      minimumBookingHours: undefined, // Not in schema
      advanceNotice: profile.advanceNotice,
      responseRate: profile.responseRate || 0,
      averageResponseTime: profile.averageResponseTime,
      totalSessions: profile.totalSessions,
      rating: profile.rating || 0,
      reviewCount: profile.reviewCount,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      lastActiveAt: profile.lastActiveAt,
      user: profile.user
        ? {
            id: profile.user.id,
            fullName: profile.user.fullName,
            profilePicture: profile.user.profile?.profilePicture,
          }
        : undefined,
    };
  }

  /**
   * Format booking response
   */
  private formatBookingResponse(booking: any): BerseGuideBookingResponse {
    return {
      id: booking.id,
      guideId: booking.guideId,
      touristId: booking.travelerId,
      date: booking.preferredDate || booking.agreedDate,
      startTime: booking.agreedTime,
      endTime: booking.agreedTime,
      numberOfPeople: booking.numberOfPeople,
      interests: booking.interests,
      specialRequests: booking.specificRequests,
      message: booking.message,
      status: booking.status,
      agreedPaymentType: booking.agreedPaymentType,
      agreedPaymentAmount: booking.agreedPaymentAmount,
      agreedPaymentDetails: booking.agreedPaymentDetails,
      meetingPoint: booking.meetingPoint,
      itinerary: booking.itinerary,
      conversationId: booking.conversationId,
      requestedAt: booking.requestedAt,
      respondedAt: booking.respondedAt,
      approvedAt: booking.approvedAt,
      sessionStartedAt: booking.startedAt,
      sessionEndedAt: booking.completedAt,
      completedAt: booking.completedAt,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      guide: booking.guide
        ? {
            id: booking.guide.id,
            fullName: booking.guide.fullName,
            profilePicture: booking.guide.profile?.profilePicture,
          }
        : undefined,
      tourist: booking.traveler
        ? {
            id: booking.traveler.id,
            fullName: booking.traveler.fullName,
            profilePicture: booking.traveler.profile?.profilePicture,
          }
        : undefined,
      sessions: booking.session ? [this.formatSessionResponse(booking.session)] : undefined,
    };
  }

  /**
   * Format session response
   */
  private formatSessionResponse(session: any): SessionResponse {
    return {
      id: session.id,
      bookingId: session.bookingId,
      startedAt: session.startTime,
      endedAt: session.endTime,
      duration: session.actualDuration,
      notes: session.notes,
      highlights: session.locationsCovered,
      placesVisited: session.locationsCovered,
      createdAt: session.createdAt,
      updatedAt: session.createdAt,
    };
  }

  /**
   * Format review response
   */
  private formatReviewResponse(review: any): BerseGuideReviewResponse {
    return {
      id: review.id,
      bookingId: review.bookingId,
      reviewerId: review.travelerId,
      revieweeId: review.guideId,
      reviewerRole: 'TRAVELER' as ReviewerRole,
      rating: review.rating,
      review: review.review,
      knowledge: review.knowledge,
      communication: review.communication,
      friendliness: review.friendliness,
      professionalism: review.value,
      punctuality: review.value,
      wouldRecommend: review.wouldRecommend,
      photos: review.photos,
      isPublic: review.isPublic,
      createdAt: review.createdAt,
      reviewer: review.reviewer
        ? {
            id: review.reviewer.id,
            fullName: review.reviewer.fullName,
            profilePicture: review.reviewer.profile?.profilePicture,
          }
        : undefined,
      reviewee: review.guide
        ? {
            id: review.guide.id,
            fullName: review.guide.fullName,
            profilePicture: review.guide.profile?.profilePicture,
          }
        : undefined,
    };
  }

  /**
   * Update guide stats (response rate, average response time)
   */
  private async updateGuideStats(guideId: string): Promise<void> {
    try {
      const [totalBookings, respondedBookings, responseTimes] = await Promise.all([
        prisma.berseGuideBooking.count({
          where: { guideId },
        }),
        prisma.berseGuideBooking.count({
          where: {
            guideId,
            respondedAt: { not: null },
          },
        }),
        prisma.berseGuideBooking.findMany({
          where: {
            guideId,
            respondedAt: { not: null },
          },
          select: {
            requestedAt: true,
            respondedAt: true,
          },
        }),
      ]);

      const responseRate = totalBookings > 0 ? (respondedBookings / totalBookings) * 100 : 0;

      // Calculate average response time in hours
      let averageResponseTime = 0;
      if (responseTimes.length > 0) {
        const totalHours = responseTimes.reduce((sum, booking) => {
          const hours =
            (booking.respondedAt!.getTime() - booking.requestedAt.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);
        averageResponseTime = Math.round(totalHours / responseTimes.length);
      }

      await prisma.userBerseGuide.update({
        where: { userId: guideId },
        data: {
          responseRate,
          averageResponseTime,
        },
      });
    } catch (error) {
      logger.error('Failed to update guide stats', { error, guideId });
    }
  }

  /**
   * Update guide rating
   */
  private async updateGuideRating(guideId: string): Promise<void> {
    try {
      const reviews = await prisma.berseGuideReview.findMany({
        where: {
          guideId: guideId,
          isPublic: true,
        },
        select: {
          rating: true,
        },
      });

      if (reviews.length === 0) return;

      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await prisma.userBerseGuide.update({
        where: { userId: guideId },
        data: {
          rating: avgRating,
          reviewCount: reviews.length,
        },
      });
    } catch (error) {
      logger.error('Failed to update guide rating', { error, guideId });
    }
  }
}
