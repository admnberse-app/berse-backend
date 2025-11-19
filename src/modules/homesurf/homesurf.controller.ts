import { Request, Response } from 'express';
import { HomeSurfService } from './homesurf.service';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';
import { MetadataService } from '../../services/metadata.service';
import { prisma } from '../../config/database';
import type {
  CreateHomeSurfProfileDTO,
  UpdateHomeSurfProfileDTO,
  CreatePaymentOptionDTO,
  UpdatePaymentOptionDTO,
  CreateBookingRequestDTO,
  UpdateBookingDTO,
  ApproveBookingDTO,
  RejectBookingDTO,
  CancelBookingDTO,
  CreateReviewDTO,
  SearchHomeSurfDTO,
  ToggleHomeSurfDTO,
  CheckAvailabilityDTO,
} from './homesurf.types';

const homeSurfService = new HomeSurfService();

export class HomeSurfController {
  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Get current user's HomeSurf profile
   * GET /api/v2/homesurf/profile
   */
  async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await homeSurfService.getProfile(userId, userId);

      // If no profile exists, return requirements and feature gating info
      if (!profile) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { 
            trustScore: true, 
            trustLevel: true,
            subscriptions: {
              select: {
                status: true,
                tiers: {
                  select: {
                    tierCode: true,
                    tierName: true,
                  }
                }
              },
              where: {
                status: 'ACTIVE'
              },
              take: 1
            }
          },
        });

        const canEnable = await homeSurfService.canEnableHomeSurf(userId);
        const activeSubscription = user?.subscriptions?.[0];
        const hasActiveSubscription = activeSubscription?.status === 'ACTIVE';
        const currentTier = activeSubscription?.tiers?.tierCode || 'FREE';

        // HomeSurf requires BASIC subscription + trusted trust level (70+ score)
        const requiresSubscription = true;
        const hasRequiredSubscription = hasActiveSubscription && (currentTier === 'BASIC' || currentTier === 'PREMIUM');
        const meetsAllRequirements = canEnable && hasRequiredSubscription;

        let message = '';
        if (!canEnable) {
          message = `You need a trust score of at least 70 and trust level "trusted" to enable HomeSurf. Your current trust score: ${user?.trustScore || 0}.`;
        } else if (!hasRequiredSubscription) {
          message = 'You need a BASIC or PREMIUM subscription to create a HomeSurf profile. Upgrade your plan to get started.';
        } else {
          message = 'You can create a HomeSurf profile. Click "Create Profile" to get started.';
        }

        res.json({
          success: true,
          data: {
            hasProfile: false,
            canEnable: meetsAllRequirements,
            requirements: {
              minTrustScore: 70,
              minTrustLevel: 'trusted',
              subscriptionRequired: requiresSubscription,
              minSubscriptionTier: 'BASIC',
            },
            currentStatus: {
              trustScore: user?.trustScore || 0,
              trustLevel: user?.trustLevel || 'starter',
              meetsTrustRequirements: canEnable,
              subscriptionTier: currentTier,
              subscriptionStatus: activeSubscription?.status || null,
              meetsSubscriptionRequirements: hasRequiredSubscription,
              meetsAllRequirements,
            },
            message,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      logger.error('Failed to get my profile', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Get a user's HomeSurf profile by ID
   * GET /api/v2/homesurf/profile/:userId
   */
  async getProfileById(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const viewerId = req.user?.id;

      const profile = await homeSurfService.getProfile(userId, viewerId);

      if (!profile) {
        throw new AppError('HomeSurf profile not found', 404);
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      logger.error('Failed to get profile by ID', { error, userId: req.params.userId });
      throw error;
    }
  }

  /**
   * Create HomeSurf profile
   * POST /api/v2/homesurf/profile
   */
  async createProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: CreateHomeSurfProfileDTO = req.body;

      // Validate required fields
      if (!data.title || !data.description || !data.accommodationType) {
        throw new AppError('Title, description, and accommodation type are required', 400);
      }

      if (!data.city || !data.coordinates) {
        throw new AppError('City and coordinates are required', 400);
      }

      if (data.maxGuests && data.maxGuests < 1) {
        throw new AppError('Maximum guests must be at least 1', 400);
      }

      const profile = await homeSurfService.createProfile(userId, data);

      res.status(201).json({
        success: true,
        message: 'HomeSurf profile created successfully',
        data: profile,
      });
    } catch (error) {
      logger.error('Failed to create profile', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Update HomeSurf profile
   * PATCH /api/v2/homesurf/profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: UpdateHomeSurfProfileDTO = req.body;

      if (data.maxGuests !== undefined && data.maxGuests < 1) {
        throw new AppError('Maximum guests must be at least 1', 400);
      }

      const profile = await homeSurfService.updateProfile(userId, data);

      res.json({
        success: true,
        message: 'HomeSurf profile updated successfully',
        data: profile,
      });
    } catch (error) {
      logger.error('Failed to update profile', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Toggle HomeSurf profile on/off
   * PATCH /api/v2/homesurf/profile/toggle
   */
  async toggleProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: ToggleHomeSurfDTO = req.body;

      if (data.isEnabled === undefined) {
        throw new AppError('isEnabled field is required', 400);
      }

      const profile = await homeSurfService.toggleProfile(userId, data);

      res.json({
        success: true,
        message: `HomeSurf profile ${data.isEnabled ? 'enabled' : 'disabled'} successfully`,
        data: profile,
      });
    } catch (error) {
      logger.error('Failed to toggle profile', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Delete HomeSurf profile
   * DELETE /api/v2/homesurf/profile
   */
  async deleteProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      await homeSurfService.deleteProfile(userId);

      res.json({
        success: true,
        message: 'HomeSurf profile deleted successfully',
      });
    } catch (error) {
      logger.error('Failed to delete profile', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Check if user can enable HomeSurf
   * GET /api/v2/homesurf/eligibility
   */
  async checkEligibility(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const canEnable = await homeSurfService.canEnableHomeSurf(userId);

      res.json({
        success: true,
        data: {
          canEnable,
          requirements: {
            minTrustScore: 70,
            minTrustLevel: 'trusted',
          },
        },
      });
    } catch (error) {
      logger.error('Failed to check eligibility', { error, userId: req.user?.id });
      throw error;
    }
  }

  // ============================================================================
  // PAYMENT OPTIONS
  // ============================================================================

  /**
   * Add payment option
   * POST /api/v2/homesurf/payment-options
   */
  async addPaymentOption(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: CreatePaymentOptionDTO = req.body;

      if (!data.paymentType) {
        throw new AppError('Payment type is required', 400);
      }

      const paymentOption = await homeSurfService.addPaymentOption(userId, data);

      res.status(201).json({
        success: true,
        message: 'Payment option added successfully',
        data: paymentOption,
      });
    } catch (error) {
      logger.error('Failed to add payment option', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Update payment option
   * PATCH /api/v2/homesurf/payment-options/:optionId
   */
  async updatePaymentOption(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { optionId } = req.params;
      const data: UpdatePaymentOptionDTO = req.body;

      const paymentOption = await homeSurfService.updatePaymentOption(userId, optionId, data);

      res.json({
        success: true,
        message: 'Payment option updated successfully',
        data: paymentOption,
      });
    } catch (error) {
      logger.error('Failed to update payment option', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Delete payment option
   * DELETE /api/v2/homesurf/payment-options/:optionId
   */
  async deletePaymentOption(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { optionId } = req.params;

      await homeSurfService.deletePaymentOption(userId, optionId);

      res.json({
        success: true,
        message: 'Payment option deleted successfully',
      });
    } catch (error) {
      logger.error('Failed to delete payment option', { error, userId: req.user?.id });
      throw error;
    }
  }

  // ============================================================================
  // BOOKING MANAGEMENT
  // ============================================================================

  /**
   * Create booking request (Guest)
   * POST /api/v2/homesurf/bookings
   */
  async createBookingRequest(req: Request, res: Response): Promise<void> {
    try {
      const guestId = req.user!.id;
      const data: CreateBookingRequestDTO = req.body;

      // Validate required fields
      if (!data.hostId || !data.checkInDate || !data.checkOutDate) {
        throw new AppError('Host ID, check-in date, and check-out date are required', 400);
      }

      if (!data.numberOfGuests || data.numberOfGuests < 1) {
        throw new AppError('Number of guests must be at least 1', 400);
      }

      const booking = await homeSurfService.createBookingRequest(guestId, data);

      res.status(201).json({
        success: true,
        message: 'Booking request created successfully',
        data: booking,
      });
    } catch (error) {
      logger.error('Failed to create booking request', { error, guestId: req.user?.id });
      throw error;
    }
  }

  /**
   * Check availability
   * POST /api/v2/homesurf/availability
   */
  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const data: CheckAvailabilityDTO = req.body;

      if (!data.hostId || !data.checkInDate || !data.checkOutDate) {
        throw new AppError('Host ID, check-in date, and check-out date are required', 400);
      }

      const availability = await homeSurfService.checkAvailability(data);

      res.json({
        success: true,
        data: availability,
      });
    } catch (error) {
      logger.error('Failed to check availability', { error });
      throw error;
    }
  }

  /**
   * Get booking by ID
   * GET /api/v2/homesurf/bookings/:bookingId
   */
  async getBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { bookingId } = req.params;

      const booking = await homeSurfService.getBooking(bookingId, userId);

      res.json({
        success: true,
        data: booking,
      });
    } catch (error) {
      logger.error('Failed to get booking', { error, bookingId: req.params.bookingId });
      throw error;
    }
  }

  /**
   * Get bookings as host
   * GET /api/v2/homesurf/bookings/host?status=PENDING
   */
  async getBookingsAsHost(req: Request, res: Response): Promise<void> {
    try {
      const hostId = req.user!.id;
      const { status } = req.query;

      const bookings = await homeSurfService.getBookingsAsHost(
        hostId,
        status as any
      );

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      logger.error('Failed to get bookings as host', { error, hostId: req.user?.id });
      throw error;
    }
  }

  /**
   * Get stays as guest
   * GET /api/v2/homesurf/stays?status=APPROVED
   */
  async getStaysAsGuest(req: Request, res: Response): Promise<void> {
    try {
      const guestId = req.user!.id;
      const { status } = req.query;

      const stays = await homeSurfService.getStaysAsGuest(
        guestId,
        status as any
      );

      res.json({
        success: true,
        data: stays,
      });
    } catch (error) {
      logger.error('Failed to get stays as guest', { error, guestId: req.user?.id });
      throw error;
    }
  }

  /**
   * Approve booking (Host)
   * PATCH /api/v2/homesurf/bookings/:bookingId/approve
   */
  async approveBooking(req: Request, res: Response): Promise<void> {
    try {
      const hostId = req.user!.id;
      const { bookingId } = req.params;
      const data: ApproveBookingDTO = req.body;

      if (!data.agreedPaymentType) {
        throw new AppError('Agreed payment type is required', 400);
      }

      const booking = await homeSurfService.approveBooking(hostId, bookingId, data);

      res.json({
        success: true,
        message: 'Booking approved successfully',
        data: booking,
      });
    } catch (error) {
      logger.error('Failed to approve booking', { error, bookingId: req.params.bookingId });
      throw error;
    }
  }

  /**
   * Reject booking (Host)
   * PATCH /api/v2/homesurf/bookings/:bookingId/reject
   */
  async rejectBooking(req: Request, res: Response): Promise<void> {
    try {
      const hostId = req.user!.id;
      const { bookingId } = req.params;
      const data: RejectBookingDTO = req.body;

      const booking = await homeSurfService.rejectBooking(hostId, bookingId, data);

      res.json({
        success: true,
        message: 'Booking rejected successfully',
        data: booking,
      });
    } catch (error) {
      logger.error('Failed to reject booking', { error, bookingId: req.params.bookingId });
      throw error;
    }
  }

  /**
   * Cancel booking
   * PATCH /api/v2/homesurf/bookings/:bookingId/cancel
   */
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { bookingId } = req.params;
      const data: CancelBookingDTO = req.body;

      const booking = await homeSurfService.cancelBooking(userId, bookingId, data);

      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
      });
    } catch (error) {
      logger.error('Failed to cancel booking', { error, bookingId: req.params.bookingId });
      throw error;
    }
  }

  /**
   * Check in guest (Host)
   * PATCH /api/v2/homesurf/bookings/:bookingId/check-in
   */
  async checkInGuest(req: Request, res: Response): Promise<void> {
    try {
      const hostId = req.user!.id;
      const { bookingId } = req.params;

      const booking = await homeSurfService.checkInGuest(hostId, bookingId);

      res.json({
        success: true,
        message: 'Guest checked in successfully',
        data: booking,
      });
    } catch (error) {
      logger.error('Failed to check in guest', { error, bookingId: req.params.bookingId });
      throw error;
    }
  }

  /**
   * Check out guest (Host)
   * PATCH /api/v2/homesurf/bookings/:bookingId/check-out
   */
  async checkOutGuest(req: Request, res: Response): Promise<void> {
    try {
      const hostId = req.user!.id;
      const { bookingId } = req.params;

      const booking = await homeSurfService.checkOutGuest(hostId, bookingId);

      res.json({
        success: true,
        message: 'Guest checked out successfully',
        data: booking,
      });
    } catch (error) {
      logger.error('Failed to check out guest', { error, bookingId: req.params.bookingId });
      throw error;
    }
  }

  // ============================================================================
  // REVIEW MANAGEMENT
  // ============================================================================

  /**
   * Create review
   * POST /api/v2/homesurf/reviews
   */
  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: CreateReviewDTO = req.body;

      // Validate required fields
      if (!data.bookingId || !data.revieweeId || !data.reviewerRole) {
        throw new AppError('Booking ID, reviewee ID, and reviewer role are required', 400);
      }

      if (!data.rating || data.rating < 1 || data.rating > 5) {
        throw new AppError('Rating must be between 1 and 5', 400);
      }

      const review = await homeSurfService.createReview(userId, data);

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review,
      });
    } catch (error) {
      logger.error('Failed to create review', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Get reviews given by user
   * GET /api/v2/homesurf/reviews/given
   */
  async getReviewsGiven(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const reviews = await homeSurfService.getReviews(userId, 'given');

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      logger.error('Failed to get reviews given', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Get reviews received by user
   * GET /api/v2/homesurf/reviews/received
   */
  async getReviewsReceived(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const reviews = await homeSurfService.getReviews(userId, 'received');

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      logger.error('Failed to get reviews received', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Get reviews for a specific user (public)
   * GET /api/v2/homesurf/reviews/user/:userId
   */
  async getUserReviews(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const reviews = await homeSurfService.getReviews(userId, 'received');

      // Filter to only public reviews
      const publicReviews = reviews.filter((r) => r.isPublic);

      res.json({
        success: true,
        data: publicReviews,
      });
    } catch (error) {
      logger.error('Failed to get user reviews', { error, userId: req.params.userId });
      throw error;
    }
  }

  // ============================================================================
  // METADATA
  // ============================================================================

  /**
   * Get HomeSurf metadata
   * GET /api/v2/homesurf/metadata
   */
  async getMetadata(req: Request, res: Response): Promise<void> {
    try {
      const metadata = MetadataService.getServiceMetadata();

      res.json({
        success: true,
        data: {
          accommodationTypes: metadata.accommodationTypes,
          paymentTypes: metadata.paymentTypes,
          commonAmenities: metadata.commonAmenities,
          commonLanguages: metadata.commonLanguages,
          popularCities: metadata.popularCities,
          trustLevels: MetadataService.getTrustLevels(),
          activityLevels: MetadataService.getActivityLevels(),
        },
      });
    } catch (error) {
      logger.error('Failed to get metadata', { error });
      throw error;
    }
  }

  // ============================================================================
  // SEARCH & DISCOVERY
  // ============================================================================

  /**
   * Search HomeSurf profiles
   * GET /api/v2/homesurf/search?city=Berlin&checkInDate=2024-01-01&checkOutDate=2024-01-05
   */
  async searchProfiles(req: Request, res: Response): Promise<void> {
    try {
      const query: SearchHomeSurfDTO = {
        city: req.query.city as string,
        checkInDate: req.query.checkInDate as string,
        checkOutDate: req.query.checkOutDate as string,
        numberOfGuests: req.query.numberOfGuests ? Number(req.query.numberOfGuests) : undefined,
        accommodationType: req.query.accommodationType
          ? (req.query.accommodationType as string).split(',') as any
          : undefined,
        amenities: req.query.amenities
          ? (req.query.amenities as string).split(',')
          : undefined,
        minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
        paymentTypes: req.query.paymentTypes
          ? (req.query.paymentTypes as string).split(',') as any
          : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        sortBy: (req.query.sortBy as any) || 'rating',
        sortOrder: (req.query.sortOrder as any) || 'desc',
        requestingUserId: req.user?.id, // For mutual connections/communities
      };

      const results = await homeSurfService.searchProfiles(query);

      res.json({
        success: true,
        data: results.data,
        pagination: results.pagination,
        ...(results.meta && { meta: results.meta }),
      });
    } catch (error) {
      logger.error('Failed to search profiles', { error, query: req.query });
      throw error;
    }
  }

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  /**
   * Get my HomeSurf bookings and stays
   * GET /api/v2/homesurf/my?filter=upcoming&status=APPROVED&role=host
   */
  async getMyHomeSurf(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { filter, status, role } = req.query;

      const data = await homeSurfService.getMyHomeSurf(userId, {
        filter: filter as any,
        status: status as any,
        role: role as any,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      logger.error('Failed to get my HomeSurf', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Get HomeSurf dashboard
   * GET /api/v2/homesurf/dashboard
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const dashboard = await homeSurfService.getDashboard(userId);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      logger.error('Failed to get dashboard', { error, userId: req.user?.id });
      throw error;
    }
  }
}
