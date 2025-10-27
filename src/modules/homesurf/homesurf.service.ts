import { PrismaClient, HomeSurfBookingStatus, ReviewerRole, Prisma } from '@prisma/client';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';
import { HomeSurfNotifications } from './homesurf.notifications';
import { ProfileEnrichmentService } from '../../services/profile-enrichment.service';
import type {
  CreateHomeSurfProfileDTO,
  UpdateHomeSurfProfileDTO,
  HomeSurfProfileResponse,
  CreatePaymentOptionDTO,
  UpdatePaymentOptionDTO,
  PaymentOptionResponse,
  CreateBookingRequestDTO,
  UpdateBookingDTO,
  ApproveBookingDTO,
  RejectBookingDTO,
  CancelBookingDTO,
  HomeSurfBookingResponse,
  CreateReviewDTO,
  HomeSurfReviewResponse,
  SearchHomeSurfDTO,
  SearchHomeSurfResponse,
  HomeSurfDashboardResponse,
  ToggleHomeSurfDTO,
  CheckAvailabilityDTO,
  CheckAvailabilityResponse,
} from './homesurf.types';

const prisma = new PrismaClient();

// Trust score requirements from schema proposal
const HOMESURF_REQUIREMENTS = {
  minTrustScore: 70,
  minTrustLevel: 'trusted',
  allowedTrustLevels: ['trusted', 'verified', 'ambassador'],
};

export class HomeSurfService {
  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Check if user can enable HomeSurf based on trust score
   */
  async canEnableHomeSurf(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { trustScore: true, trustLevel: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return (
        user.trustScore >= HOMESURF_REQUIREMENTS.minTrustScore &&
        HOMESURF_REQUIREMENTS.allowedTrustLevels.includes(user.trustLevel)
      );
    } catch (error) {
      logger.error('Failed to check HomeSurf eligibility', { error, userId });
      throw error;
    }
  }

  /**
   * Get user's HomeSurf profile
   */
  async getProfile(userId: string, viewerId?: string): Promise<HomeSurfProfileResponse | null> {
    try {
      const profile = await prisma.userHomeSurf.findUnique({
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

      // Hide sensitive data if viewing someone else's profile
      const isOwner = viewerId === userId;
      
      return this.formatProfileResponse(profile, isOwner);
    } catch (error) {
      logger.error('Failed to get HomeSurf profile', { error, userId });
      throw error;
    }
  }

  /**
   * Create HomeSurf profile
   */
  async createProfile(userId: string, data: CreateHomeSurfProfileDTO): Promise<HomeSurfProfileResponse> {
    try {
      // Check if user can enable HomeSurf
      const canEnable = await this.canEnableHomeSurf(userId);
      if (!canEnable) {
        throw new AppError(
          'You do not meet the trust requirements to enable HomeSurf. Minimum trust score: 70, trust level: trusted',
          403
        );
      }

      // Check if profile already exists
      const existingProfile = await prisma.userHomeSurf.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        throw new AppError('HomeSurf profile already exists', 409);
      }

      // Create profile
      const profile = await prisma.userHomeSurf.create({
        data: {
          userId,
          title: data.title,
          description: data.description,
          accommodationType: data.accommodationType,
          maxGuests: data.maxGuests,
          amenities: data.amenities,
          houseRules: data.houseRules,
          photos: data.photos || [],
          availabilityNotes: data.availabilityNotes,
          minimumStay: data.minimumStay,
          maximumStay: data.maximumStay,
          advanceNotice: data.advanceNotice,
          city: data.city,
          neighborhood: data.neighborhood,
          address: data.address as Prisma.InputJsonValue,
          coordinates: data.coordinates as Prisma.InputJsonValue,
          isEnabled: false, // Disabled by default, user must explicitly enable
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

      logger.info('HomeSurf profile created', { userId });

      return this.formatProfileResponse(profile, true);
    } catch (error) {
      logger.error('Failed to create HomeSurf profile', { error, userId, data });
      throw error;
    }
  }

  /**
   * Update HomeSurf profile
   */
  async updateProfile(userId: string, data: UpdateHomeSurfProfileDTO): Promise<HomeSurfProfileResponse> {
    try {
      const existingProfile = await prisma.userHomeSurf.findUnique({
        where: { userId },
      });

      if (!existingProfile) {
        throw new AppError('HomeSurf profile not found', 404);
      }

      const profile = await prisma.userHomeSurf.update({
        where: { userId },
        data: {
          ...data,
          address: data.address as Prisma.InputJsonValue,
          coordinates: data.coordinates as Prisma.InputJsonValue,
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

      logger.info('HomeSurf profile updated', { userId });

      return this.formatProfileResponse(profile, true);
    } catch (error) {
      logger.error('Failed to update HomeSurf profile', { error, userId, data });
      throw error;
    }
  }

  /**
   * Toggle HomeSurf profile on/off
   */
  async toggleProfile(userId: string, data: ToggleHomeSurfDTO): Promise<HomeSurfProfileResponse> {
    try {
      // If enabling, check trust requirements
      if (data.isEnabled) {
        const canEnable = await this.canEnableHomeSurf(userId);
        if (!canEnable) {
          throw new AppError('You do not meet the trust requirements to enable HomeSurf', 403);
        }
      }

      const profile = await prisma.userHomeSurf.update({
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

      logger.info('HomeSurf profile toggled', { userId, isEnabled: data.isEnabled });

      return this.formatProfileResponse(profile, true);
    } catch (error) {
      logger.error('Failed to toggle HomeSurf profile', { error, userId, data });
      throw error;
    }
  }

  /**
   * Delete HomeSurf profile
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      // Check for active bookings
      const activeBookings = await prisma.homeSurfBooking.count({
        where: {
          hostId: userId,
          status: {
            in: ['PENDING', 'DISCUSSING', 'APPROVED', 'CHECKED_IN'],
          },
        },
      });

      if (activeBookings > 0) {
        throw new AppError('Cannot delete profile with active bookings', 400);
      }

      await prisma.userHomeSurf.delete({
        where: { userId },
      });

      logger.info('HomeSurf profile deleted', { userId });
    } catch (error) {
      logger.error('Failed to delete HomeSurf profile', { error, userId });
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
      const profile = await prisma.userHomeSurf.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new AppError('HomeSurf profile not found', 404);
      }

      // If setting as preferred, unset other preferred options
      if (data.isPreferred) {
        await prisma.homeSurfPaymentOption.updateMany({
          where: { homeSurfId: userId },
          data: { isPreferred: false },
        });
      }

      const paymentOption = await prisma.homeSurfPaymentOption.create({
        data: {
          homeSurfId: userId,
          paymentType: data.paymentType,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          isPreferred: data.isPreferred || false,
        },
      });

      logger.info('Payment option added', { userId, paymentOptionId: paymentOption.id });

      return paymentOption;
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
      const option = await prisma.homeSurfPaymentOption.findUnique({
        where: { id: optionId },
        include: { homeSurf: true },
      });

      if (!option) {
        throw new AppError('Payment option not found', 404);
      }

      if (option.homeSurf.userId !== userId) {
        throw new AppError('Unauthorized to update this payment option', 403);
      }

      // If setting as preferred, unset other preferred options
      if (data.isPreferred) {
        await prisma.homeSurfPaymentOption.updateMany({
          where: { 
            homeSurfId: userId,
            id: { not: optionId },
          },
          data: { isPreferred: false },
        });
      }

      const updatedOption = await prisma.homeSurfPaymentOption.update({
        where: { id: optionId },
        data,
      });

      logger.info('Payment option updated', { userId, optionId });

      return updatedOption;
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
      const option = await prisma.homeSurfPaymentOption.findUnique({
        where: { id: optionId },
        include: { homeSurf: true },
      });

      if (!option) {
        throw new AppError('Payment option not found', 404);
      }

      if (option.homeSurf.userId !== userId) {
        throw new AppError('Unauthorized to delete this payment option', 403);
      }

      await prisma.homeSurfPaymentOption.delete({
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
   * Create booking request (Guest)
   */
  async createBookingRequest(
    guestId: string,
    data: CreateBookingRequestDTO
  ): Promise<HomeSurfBookingResponse> {
    try {
      // Check if host profile exists and is enabled
      const hostProfile = await prisma.userHomeSurf.findUnique({
        where: { userId: data.hostId },
      });

      if (!hostProfile) {
        throw new AppError('Host profile not found', 404);
      }

      if (!hostProfile.isEnabled) {
        throw new AppError('Host is not currently accepting guests', 400);
      }

      // Check if guest is trying to book their own place
      if (guestId === data.hostId) {
        throw new AppError('You cannot book your own place', 400);
      }

      // Validate dates
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);

      if (checkIn >= checkOut) {
        throw new AppError('Check-out date must be after check-in date', 400);
      }

      if (checkIn < new Date()) {
        throw new AppError('Check-in date cannot be in the past', 400);
      }

      // Check for overlapping bookings
      const overlapping = await this.checkAvailability({
        hostId: data.hostId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
      });

      if (!overlapping.available) {
        throw new AppError('Host is not available for these dates', 409);
      }

      // Create booking
      const booking = await prisma.homeSurfBooking.create({
        data: {
          hostId: data.hostId,
          guestId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests: data.numberOfGuests,
          message: data.message,
          status: 'PENDING',
        },
        include: {
          host: {
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
          guest: {
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
          homeSurf: {
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
          },
        },
      });

      logger.info('Booking request created', { bookingId: booking.id, guestId, hostId: data.hostId });

      // Send notification to host
      await HomeSurfNotifications.notifyHostOfNewRequest(
        data.hostId,
        booking.guest.fullName,
        booking.id
      );

      return this.formatBookingResponse(booking);
    } catch (error) {
      logger.error('Failed to create booking request', { error, guestId, data });
      throw error;
    }
  }

  /**
   * Check availability for dates
   */
  async checkAvailability(data: CheckAvailabilityDTO): Promise<CheckAvailabilityResponse> {
    try {
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);

      const conflictingBookings = await prisma.homeSurfBooking.findMany({
        where: {
          hostId: data.hostId,
          status: {
            in: ['APPROVED', 'CHECKED_IN', 'DISCUSSING'],
          },
          OR: [
            {
              checkInDate: {
                lte: checkOut,
              },
              checkOutDate: {
                gte: checkIn,
              },
            },
          ],
        },
        include: {
          guest: {
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
        message: available ? 'Dates are available' : 'Host has conflicting bookings for these dates',
      };
    } catch (error) {
      logger.error('Failed to check availability', { error, data });
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId: string, userId: string): Promise<HomeSurfBookingResponse> {
    try {
      const booking = await prisma.homeSurfBooking.findUnique({
        where: { id: bookingId },
        include: {
          host: {
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
          guest: {
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
          homeSurf: {
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
          },
        },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      // Check permission
      if (booking.hostId !== userId && booking.guestId !== userId) {
        throw new AppError('Unauthorized to view this booking', 403);
      }

      return this.formatBookingResponse(booking);
    } catch (error) {
      logger.error('Failed to get booking', { error, bookingId, userId });
      throw error;
    }
  }

  /**
   * Get bookings as host
   */
  async getBookingsAsHost(
    hostId: string,
    status?: HomeSurfBookingStatus
  ): Promise<HomeSurfBookingResponse[]> {
    try {
      const bookings = await prisma.homeSurfBooking.findMany({
        where: {
          hostId,
          ...(status && { status }),
        },
        include: {
          host: {
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
          guest: {
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
      });

      return bookings.map(this.formatBookingResponse);
    } catch (error) {
      logger.error('Failed to get bookings as host', { error, hostId, status });
      throw error;
    }
  }

  /**
   * Get stays as guest
   */
  async getStaysAsGuest(
    guestId: string,
    status?: HomeSurfBookingStatus
  ): Promise<HomeSurfBookingResponse[]> {
    try {
      const bookings = await prisma.homeSurfBooking.findMany({
        where: {
          guestId,
          ...(status && { status }),
        },
        include: {
          host: {
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
          guest: {
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
          homeSurf: {
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
          },
        },
        orderBy: {
          requestedAt: 'desc',
        },
      });

      return bookings.map(this.formatBookingResponse);
    } catch (error) {
      logger.error('Failed to get stays as guest', { error, guestId, status });
      throw error;
    }
  }

  /**
   * Approve booking (Host)
   */
  async approveBooking(
    hostId: string,
    bookingId: string,
    data: ApproveBookingDTO
  ): Promise<HomeSurfBookingResponse> {
    try {
      const booking = await prisma.homeSurfBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.hostId !== hostId) {
        throw new AppError('Unauthorized to approve this booking', 403);
      }

      if (booking.status !== 'PENDING' && booking.status !== 'DISCUSSING') {
        throw new AppError('Booking cannot be approved in current status', 400);
      }

      const updatedBooking = await prisma.homeSurfBooking.update({
        where: { id: bookingId },
        data: {
          status: 'APPROVED',
          agreedPaymentType: data.agreedPaymentType,
          agreedPaymentAmount: data.agreedPaymentAmount,
          agreedPaymentDetails: data.agreedPaymentDetails,
          checkInInstructions: data.checkInInstructions,
          approvedAt: new Date(),
          respondedAt: booking.respondedAt || new Date(),
        },
        include: {
          host: {
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
          guest: {
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

      // Update host's response rate
      await this.updateHostStats(hostId);

      logger.info('Booking approved', { bookingId, hostId });

      // Send notification to guest
      await HomeSurfNotifications.notifyGuestOfApproval(
        booking.guestId,
        updatedBooking.host.fullName,
        bookingId
      );

      return this.formatBookingResponse(updatedBooking);
    } catch (error) {
      logger.error('Failed to approve booking', { error, hostId, bookingId, data });
      throw error;
    }
  }

  /**
   * Reject booking (Host)
   */
  async rejectBooking(
    hostId: string,
    bookingId: string,
    data: RejectBookingDTO
  ): Promise<HomeSurfBookingResponse> {
    try {
      const booking = await prisma.homeSurfBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.hostId !== hostId) {
        throw new AppError('Unauthorized to reject this booking', 403);
      }

      if (booking.status !== 'PENDING' && booking.status !== 'DISCUSSING') {
        throw new AppError('Booking cannot be rejected in current status', 400);
      }

      const updatedBooking = await prisma.homeSurfBooking.update({
        where: { id: bookingId },
        data: {
          status: 'REJECTED',
          cancellationReason: data.cancellationReason,
          cancelledAt: new Date(),
          respondedAt: booking.respondedAt || new Date(),
        },
        include: {
          host: {
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
          guest: {
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

      // Update host's response rate
      await this.updateHostStats(hostId);

      logger.info('Booking rejected', { bookingId, hostId });

      // Send notification to guest
      await HomeSurfNotifications.notifyGuestOfRejection(
        booking.guestId,
        updatedBooking.host.fullName,
        bookingId,
        data.cancellationReason
      );

      return this.formatBookingResponse(updatedBooking);
    } catch (error) {
      logger.error('Failed to reject booking', { error, hostId, bookingId, data });
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
  ): Promise<HomeSurfBookingResponse> {
    try {
      const booking = await prisma.homeSurfBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      const isHost = booking.hostId === userId;
      const isGuest = booking.guestId === userId;

      if (!isHost && !isGuest) {
        throw new AppError('Unauthorized to cancel this booking', 403);
      }

      const newStatus = isHost ? 'CANCELLED_BY_HOST' : 'CANCELLED_BY_GUEST';

      const updatedBooking = await prisma.homeSurfBooking.update({
        where: { id: bookingId },
        data: {
          status: newStatus,
          cancellationReason: data.cancellationReason,
          cancelledAt: new Date(),
        },
        include: {
          host: {
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
          guest: {
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

      logger.info('Booking cancelled', { bookingId, userId, cancelledBy: isHost ? 'host' : 'guest' });

      // Send notification to the other party
      const otherUserId = isHost ? booking.guestId : booking.hostId;
      await HomeSurfNotifications.notifyOfCancellation(
        otherUserId,
        isHost ? 'host' : 'guest',
        bookingId,
        isHost
      );

      return this.formatBookingResponse(updatedBooking);
    } catch (error) {
      logger.error('Failed to cancel booking', { error, userId, bookingId, data });
      throw error;
    }
  }

  /**
   * Mark guest as checked in (Host)
   */
  async checkInGuest(hostId: string, bookingId: string): Promise<HomeSurfBookingResponse> {
    try {
      const booking = await prisma.homeSurfBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.hostId !== hostId) {
        throw new AppError('Unauthorized to check in this guest', 403);
      }

      if (booking.status !== 'APPROVED') {
        throw new AppError('Booking must be approved before check-in', 400);
      }

      const updatedBooking = await prisma.homeSurfBooking.update({
        where: { id: bookingId },
        data: {
          status: 'CHECKED_IN',
          checkedInAt: new Date(),
        },
        include: {
          host: {
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
          guest: {
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

      logger.info('Guest checked in', { bookingId, hostId });

      // Send notification to host
      await HomeSurfNotifications.notifyHostOfCheckIn(
        hostId,
        updatedBooking.guest.fullName,
        bookingId
      );

      return this.formatBookingResponse(updatedBooking);
    } catch (error) {
      logger.error('Failed to check in guest', { error, hostId, bookingId });
      throw error;
    }
  }

  /**
   * Mark guest as checked out (Host)
   */
  async checkOutGuest(hostId: string, bookingId: string): Promise<HomeSurfBookingResponse> {
    try {
      const booking = await prisma.homeSurfBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.hostId !== hostId) {
        throw new AppError('Unauthorized to check out this guest', 403);
      }

      if (booking.status !== 'CHECKED_IN') {
        throw new AppError('Guest must be checked in before check-out', 400);
      }

      const updatedBooking = await prisma.homeSurfBooking.update({
        where: { id: bookingId },
        data: {
          status: 'COMPLETED',
          checkedOutAt: new Date(),
        },
        include: {
          host: {
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
          guest: {
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

      // Update host's total guests count
      await prisma.userHomeSurf.update({
        where: { userId: hostId },
        data: {
          totalGuests: {
            increment: booking.numberOfGuests,
          },
        },
      });

      logger.info('Guest checked out', { bookingId, hostId });

      // Send notification to both host and guest
      await HomeSurfNotifications.notifyAfterCheckOut(
        hostId,
        booking.guestId,
        bookingId
      );

      return this.formatBookingResponse(updatedBooking);
    } catch (error) {
      logger.error('Failed to check out guest', { error, hostId, bookingId });
      throw error;
    }
  }

  // ============================================================================
  // REVIEW MANAGEMENT
  // ============================================================================

  /**
   * Create review
   */
  async createReview(userId: string, data: CreateReviewDTO): Promise<HomeSurfReviewResponse> {
    try {
      const booking = await prisma.homeSurfBooking.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      // Check if user is involved in this booking
      if (booking.hostId !== userId && booking.guestId !== userId) {
        throw new AppError('Unauthorized to review this booking', 403);
      }

      // Check if booking is completed
      if (booking.status !== 'COMPLETED') {
        throw new AppError('Booking must be completed before reviewing', 400);
      }

      // Check if user already reviewed
      const existingReview = await prisma.homeSurfReview.findFirst({
        where: {
          bookingId: data.bookingId,
          reviewerId: userId,
        },
      });

      if (existingReview) {
        throw new AppError('You have already reviewed this booking', 409);
      }

      const review = await prisma.homeSurfReview.create({
        data: {
          bookingId: data.bookingId,
          reviewerId: userId,
          revieweeId: data.revieweeId,
          reviewerRole: data.reviewerRole,
          rating: data.rating,
          review: data.review,
          cleanliness: data.cleanliness,
          communication: data.communication,
          location: data.location,
          hospitality: data.hospitality,
          respect: data.respect,
          wouldHostAgain: data.wouldHostAgain,
          wouldStayAgain: data.wouldStayAgain,
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
          reviewee: {
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

      // Update reviewee's rating
      await this.updateHostRating(data.revieweeId);

      // Check if both reviews are done, mark booking as completed
      const reviewCount = await prisma.homeSurfReview.count({
        where: { bookingId: data.bookingId },
      });

      if (reviewCount === 2) {
        await prisma.homeSurfBooking.update({
          where: { id: data.bookingId },
          data: { completedAt: new Date() },
        });
      }

      logger.info('Review created', { reviewId: review.id, userId, bookingId: data.bookingId });

      // Send notification to reviewee
      await HomeSurfNotifications.notifyOfNewReview(
        data.revieweeId,
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
  async getReviews(userId: string, type: 'given' | 'received'): Promise<HomeSurfReviewResponse[]> {
    try {
      const reviews = await prisma.homeSurfReview.findMany({
        where: type === 'given' ? { reviewerId: userId } : { revieweeId: userId },
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
          reviewee: {
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
   * Search HomeSurf profiles
   */
  async searchProfiles(query: SearchHomeSurfDTO): Promise<SearchHomeSurfResponse> {
    try {
      const {
        city,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        accommodationType,
        amenities,
        minRating,
        paymentTypes,
        page = 1,
        limit = 20,
        sortBy = 'rating',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      const where: Prisma.UserHomeSurfWhereInput = {
        isEnabled: true,
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
        ...(numberOfGuests && { maxGuests: { gte: numberOfGuests } }),
        ...(accommodationType && { accommodationType: { in: accommodationType } }),
        ...(amenities && { amenities: { hasEvery: amenities } }),
        ...(minRating && { rating: { gte: minRating } }),
      };

      // If payment types specified, filter by payment options
      if (paymentTypes && paymentTypes.length > 0) {
        where.paymentOptions = {
          some: {
            paymentType: { in: paymentTypes },
          },
        };
      }

      // If dates specified, exclude hosts with conflicting bookings
      if (checkInDate && checkOutDate) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        where.bookings = {
          none: {
            status: { in: ['APPROVED', 'CHECKED_IN', 'DISCUSSING'] },
            OR: [
              {
                checkInDate: { lte: checkOut },
                checkOutDate: { gte: checkIn },
              },
            ],
          },
        };
      }

      const [profiles, total] = await Promise.all([
        prisma.userHomeSurf.findMany({
          where,
          include: {
            paymentOptions: true,
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                trustLevel: true,
                trustScore: true,
                createdAt: true,
                profile: {
                  select: {
                    profilePicture: true,
                    displayName: true,
                    shortBio: true,
                    profession: true,
                  },
                },
              },
            },
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.userHomeSurf.count({ where }),
      ]);

      // Enrich user profiles with comprehensive data
      const enrichedProfiles = await Promise.all(
        profiles.map(async (profile) => {
          try {
            const enrichedUser = await ProfileEnrichmentService.getEnrichedProfile(
              profile.userId,
              {
                requestingUserId: query.requestingUserId,
                includeBadges: true,
                includeVouches: true,
                includeConnectionStats: true,
              }
            );
            
            const formattedProfile = this.formatProfileResponse(profile, false);
            return {
              ...formattedProfile,
              user: enrichedUser,
            };
          } catch (error) {
            logger.error('Failed to enrich profile', { error, userId: profile.userId });
            // Fallback to basic profile if enrichment fails
            return this.formatProfileResponse(profile, false);
          }
        })
      );

      return {
        data: enrichedProfiles,
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
  async getDashboard(userId: string): Promise<HomeSurfDashboardResponse> {
    try {
      const [profile, user, pendingRequests, upcomingStays] = await Promise.all([
        this.getProfile(userId, userId),
        prisma.user.findUnique({
          where: { id: userId },
          select: { trustScore: true, trustLevel: true },
        }),
        prisma.homeSurfBooking.findMany({
          where: {
            hostId: userId,
            status: 'PENDING',
          },
          include: {
            guest: {
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
        prisma.homeSurfBooking.findMany({
          where: {
            hostId: userId,
            status: { in: ['APPROVED', 'CHECKED_IN'] },
            checkInDate: { gte: new Date() },
          },
          include: {
            guest: {
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
            checkInDate: 'asc',
          },
          take: 5,
        }),
      ]);

      const canEnable = user
        ? user.trustScore >= HOMESURF_REQUIREMENTS.minTrustScore &&
          HOMESURF_REQUIREMENTS.allowedTrustLevels.includes(user.trustLevel)
        : false;

      return {
        profile: profile || undefined,
        stats: {
          totalGuests: profile?.totalGuests || 0,
          pendingRequests: pendingRequests.length,
          upcomingStays: upcomingStays.length,
          rating: profile?.rating || 0,
          reviewCount: profile?.reviewCount || 0,
          responseRate: profile?.responseRate || 0,
        },
        recentRequests: pendingRequests.map(this.formatBookingResponse),
        upcomingStays: upcomingStays.map(this.formatBookingResponse),
        canEnable,
        trustRequirement: {
          required: true,
          minTrustScore: HOMESURF_REQUIREMENTS.minTrustScore,
          minTrustLevel: HOMESURF_REQUIREMENTS.minTrustLevel,
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
  private formatProfileResponse(profile: any, isOwner: boolean): HomeSurfProfileResponse {
    return {
      userId: profile.userId,
      isEnabled: profile.isEnabled,
      title: profile.title,
      description: profile.description,
      accommodationType: profile.accommodationType,
      maxGuests: profile.maxGuests,
      amenities: profile.amenities,
      houseRules: profile.houseRules,
      photos: profile.photos,
      paymentOptions: profile.paymentOptions || [],
      availabilityNotes: profile.availabilityNotes,
      minimumStay: profile.minimumStay,
      maximumStay: profile.maximumStay,
      advanceNotice: profile.advanceNotice,
      city: profile.city,
      neighborhood: profile.neighborhood,
      address: isOwner ? profile.address : undefined, // Hide address from non-owners
      coordinates: profile.coordinates,
      responseRate: profile.responseRate,
      averageResponseTime: profile.averageResponseTime,
      totalGuests: profile.totalGuests,
      rating: profile.rating,
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
  private formatBookingResponse(booking: any): HomeSurfBookingResponse {
    return {
      id: booking.id,
      hostId: booking.hostId,
      guestId: booking.guestId,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      numberOfGuests: booking.numberOfGuests,
      message: booking.message,
      status: booking.status,
      agreedPaymentType: booking.agreedPaymentType,
      agreedPaymentAmount: booking.agreedPaymentAmount,
      agreedPaymentDetails: booking.agreedPaymentDetails,
      specialRequests: booking.specialRequests,
      checkInInstructions: booking.checkInInstructions,
      conversationId: booking.conversationId,
      requestedAt: booking.requestedAt,
      respondedAt: booking.respondedAt,
      approvedAt: booking.approvedAt,
      checkedInAt: booking.checkedInAt,
      checkedOutAt: booking.checkedOutAt,
      completedAt: booking.completedAt,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      host: booking.host
        ? {
            id: booking.host.id,
            fullName: booking.host.fullName,
            profilePicture: booking.host.profile?.profilePicture,
          }
        : undefined,
      guest: booking.guest
        ? {
            id: booking.guest.id,
            fullName: booking.guest.fullName,
            profilePicture: booking.guest.profile?.profilePicture,
          }
        : undefined,
      homeSurf: booking.homeSurf ? this.formatProfileResponse(booking.homeSurf, false) : undefined,
    };
  }

  /**
   * Format review response
   */
  private formatReviewResponse(review: any): HomeSurfReviewResponse {
    return {
      id: review.id,
      bookingId: review.bookingId,
      reviewerId: review.reviewerId,
      revieweeId: review.revieweeId,
      reviewerRole: review.reviewerRole,
      rating: review.rating,
      review: review.review,
      cleanliness: review.cleanliness,
      communication: review.communication,
      location: review.location,
      hospitality: review.hospitality,
      respect: review.respect,
      wouldHostAgain: review.wouldHostAgain,
      wouldStayAgain: review.wouldStayAgain,
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
      reviewee: review.reviewee
        ? {
            id: review.reviewee.id,
            fullName: review.reviewee.fullName,
            profilePicture: review.reviewee.profile?.profilePicture,
          }
        : undefined,
    };
  }

  /**
   * Update host stats (response rate, average response time)
   */
  private async updateHostStats(hostId: string): Promise<void> {
    try {
      const [totalBookings, respondedBookings, responseTimes] = await Promise.all([
        prisma.homeSurfBooking.count({
          where: { hostId },
        }),
        prisma.homeSurfBooking.count({
          where: {
            hostId,
            respondedAt: { not: null },
          },
        }),
        prisma.homeSurfBooking.findMany({
          where: {
            hostId,
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

      await prisma.userHomeSurf.update({
        where: { userId: hostId },
        data: {
          responseRate,
          averageResponseTime,
        },
      });
    } catch (error) {
      logger.error('Failed to update host stats', { error, hostId });
    }
  }

  /**
   * Update host rating
   */
  private async updateHostRating(hostId: string): Promise<void> {
    try {
      const reviews = await prisma.homeSurfReview.findMany({
        where: {
          revieweeId: hostId,
          isPublic: true,
        },
        select: {
          rating: true,
        },
      });

      if (reviews.length === 0) return;

      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await prisma.userHomeSurf.update({
        where: { userId: hostId },
        data: {
          rating: avgRating,
          reviewCount: reviews.length,
        },
      });
    } catch (error) {
      logger.error('Failed to update host rating', { error, hostId });
    }
  }
}
