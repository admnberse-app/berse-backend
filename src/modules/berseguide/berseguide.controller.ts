import { Request, Response } from 'express';
import { BerseGuideService } from './berseguide.service';
import { AppError } from '../../middleware/error';
import logger from '../../utils/logger';
import { MetadataService } from '../../services/metadata.service';
import { prisma } from '../../config/database';
import type {
  CreateBerseGuideProfileDTO,
  UpdateBerseGuideProfileDTO,
  CreatePaymentOptionDTO,
  UpdatePaymentOptionDTO,
  CreateBookingRequestDTO,
  ApproveBookingDTO,
  RejectBookingDTO,
  CancelBookingDTO,
  CreateSessionDTO,
  UpdateSessionDTO,
  EndSessionDTO,
  CreateReviewDTO,
  SearchBerseGuideDTO,
  ToggleBerseGuideDTO,
  CheckAvailabilityDTO,
} from './berseguide.types';

const berseGuideService = new BerseGuideService();

export class BerseGuideController {
  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Get current user's BerseGuide profile
   * GET /api/v2/berseguide/profile
   */
  async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await berseGuideService.getProfile(userId, userId);

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

        const canEnable = await berseGuideService.canEnableBerseGuide(userId);
        const activeSubscription = user?.subscriptions?.[0];
        const hasActiveSubscription = activeSubscription?.status === 'ACTIVE';
        const currentTier = activeSubscription?.tiers?.tierCode || 'FREE';

        // BerseGuide requires BASIC subscription + trusted trust level (65+ score)
        const requiresSubscription = true;
        const hasRequiredSubscription = hasActiveSubscription && (currentTier === 'BASIC' || currentTier === 'PREMIUM');
        const meetsAllRequirements = canEnable && hasRequiredSubscription;

        let message = '';
        if (!canEnable) {
          message = `You need a trust score of at least 65 and trust level "trusted" to enable BerseGuide. Your current trust score: ${user?.trustScore || 0}.`;
        } else if (!hasRequiredSubscription) {
          message = 'You need a BASIC or PREMIUM subscription to create a BerseGuide profile. Upgrade your plan to get started.';
        } else {
          message = 'You can create a BerseGuide profile. Click "Create Profile" to get started.';
        }

        res.json({
          success: true,
          data: {
            hasProfile: false,
            canEnable: meetsAllRequirements,
            requirements: {
              minTrustScore: 65,
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
   * Get a user's BerseGuide profile by ID
   * GET /api/v2/berseguide/profile/:userId
   */
  async getProfileById(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const viewerId = req.user?.id;

      const profile = await berseGuideService.getProfile(userId, viewerId);

      if (!profile) {
        throw new AppError('BerseGuide profile not found', 404);
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
   * Create BerseGuide profile
   * POST /api/v2/berseguide/profile
   */
  async createProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: CreateBerseGuideProfileDTO = req.body;

      // Validate required fields
      if (!data.title || !data.bio || !data.guideTypes || !data.guideTypes.length) {
        throw new AppError('Title, bio, and guide types are required', 400);
      }

      if (!data.city) {
        throw new AppError('City is required', 400);
      }

      if (!data.maxGroupSize || data.maxGroupSize < 1) {
        throw new AppError('Maximum group size must be at least 1', 400);
      }

      const profile = await berseGuideService.createProfile(userId, data);

      res.status(201).json({
        success: true,
        message: 'BerseGuide profile created successfully',
        data: profile,
      });
    } catch (error) {
      logger.error('Failed to create profile', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Update BerseGuide profile
   * PATCH /api/v2/berseguide/profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: UpdateBerseGuideProfileDTO = req.body;

      if (data.maxGroupSize !== undefined && data.maxGroupSize < 1) {
        throw new AppError('Maximum group size must be at least 1', 400);
      }

      const profile = await berseGuideService.updateProfile(userId, data);

      res.json({
        success: true,
        message: 'BerseGuide profile updated successfully',
        data: profile,
      });
    } catch (error) {
      logger.error('Failed to update profile', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Toggle BerseGuide profile on/off
   * PATCH /api/v2/berseguide/profile/toggle
   */
  async toggleProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: ToggleBerseGuideDTO = req.body;

      if (data.isEnabled === undefined) {
        throw new AppError('isEnabled field is required', 400);
      }

      const profile = await berseGuideService.toggleProfile(userId, data);

      res.json({
        success: true,
        message: `BerseGuide profile ${data.isEnabled ? 'enabled' : 'disabled'} successfully`,
        data: profile,
      });
    } catch (error) {
      logger.error('Failed to toggle profile', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Delete BerseGuide profile
   * DELETE /api/v2/berseguide/profile
   */
  async deleteProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      await berseGuideService.deleteProfile(userId);

      res.json({
        success: true,
        message: 'BerseGuide profile deleted successfully',
      });
    } catch (error) {
      logger.error('Failed to delete profile', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Check if user can enable BerseGuide
   * GET /api/v2/berseguide/eligibility
   */
  async checkEligibility(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const canEnable = await berseGuideService.canEnableBerseGuide(userId);

      res.json({
        success: true,
        data: {
          canEnable,
          requirements: {
            minTrustScore: 65,
            minTrustLevel: 'trusted',
          },
        },
      });
    } catch (error) {
      logger.error('Failed to check eligibility', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Upload BerseGuide profile photo
   * POST /api/v2/berseguide/profile/upload-photo
   */
  async uploadPhoto(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const photoUrl = await berseGuideService.uploadPhoto(userId, req.file);

      res.json({
        success: true,
        message: 'Photo uploaded successfully',
        data: { photoUrl },
      });
    } catch (error) {
      logger.error('Failed to upload photo', { error, userId: req.user?.id });
      throw error;
    }
  }

  // ============================================================================
  // PAYMENT OPTIONS
  // ============================================================================

  /**
   * Get payment options
   * GET /api/v2/berseguide/payment-options
   */
  async getPaymentOptions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const paymentOptions = await berseGuideService.getPaymentOptions(userId);

      res.json({
        success: true,
        data: paymentOptions,
      });
    } catch (error) {
      logger.error('Failed to get payment options', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Add payment option
   * POST /api/v2/berseguide/payment-options
   */
  async addPaymentOption(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: CreatePaymentOptionDTO = req.body;

      if (!data.paymentType) {
        throw new AppError('Payment type is required', 400);
      }

      const paymentOption = await berseGuideService.addPaymentOption(userId, data);

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
   * PATCH /api/v2/berseguide/payment-options/:optionId
   */
  async updatePaymentOption(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { optionId } = req.params;
      const data: UpdatePaymentOptionDTO = req.body;

      const paymentOption = await berseGuideService.updatePaymentOption(userId, optionId, data);

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
   * DELETE /api/v2/berseguide/payment-options/:optionId
   */
  async deletePaymentOption(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { optionId } = req.params;

      await berseGuideService.deletePaymentOption(userId, optionId);

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
   * Create booking request (Tourist)
   * POST /api/v2/berseguide/bookings
   */
  async createBookingRequest(req: Request, res: Response): Promise<void> {
    try {
      const touristId = req.user!.id;
      const data: CreateBookingRequestDTO = req.body;

      // Validate required fields
      if (!data.guideId || !data.date || !data.startTime || !data.endTime) {
        throw new AppError('Guide ID, date, start time, and end time are required', 400);
      }

      if (!data.numberOfPeople || data.numberOfPeople < 1) {
        throw new AppError('Number of people must be at least 1', 400);
      }

      const booking = await berseGuideService.createBookingRequest(touristId, data);

      res.status(201).json({
        success: true,
        message: 'Booking request created successfully',
        data: booking,
      });
    } catch (error) {
      logger.error('Failed to create booking request', { error, touristId: req.user?.id });
      throw error;
    }
  }

  /**
   * Check availability
   * POST /api/v2/berseguide/availability
   */
  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const data: CheckAvailabilityDTO = req.body;

      if (!data.guideId || !data.date || !data.startTime || !data.endTime) {
        throw new AppError('Guide ID, date, start time, and end time are required', 400);
      }

      const availability = await berseGuideService.checkAvailability(data);

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
   * GET /api/v2/berseguide/bookings/:bookingId
   */
  async getBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { bookingId } = req.params;

      const booking = await berseGuideService.getBooking(bookingId, userId);

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
   * Get bookings as guide
   * GET /api/v2/berseguide/bookings/guide?status=PENDING
   */
  async getBookingsAsGuide(req: Request, res: Response): Promise<void> {
    try {
      const guideId = req.user!.id;
      const { status } = req.query;

      const bookings = await berseGuideService.getBookingsAsGuide(guideId, status as any);

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      logger.error('Failed to get bookings as guide', { error, guideId: req.user?.id });
      throw error;
    }
  }

  /**
   * Get bookings as tourist
   * GET /api/v2/berseguide/bookings/tourist?status=APPROVED
   */
  async getBookingsAsTourist(req: Request, res: Response): Promise<void> {
    try {
      const touristId = req.user!.id;
      const { status } = req.query;

      const bookings = await berseGuideService.getBookingsAsTourist(touristId, status as any);

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      logger.error('Failed to get bookings as tourist', { error, touristId: req.user?.id });
      throw error;
    }
  }

  /**
   * Approve booking (Guide)
   * PATCH /api/v2/berseguide/bookings/:bookingId/approve
   */
  async approveBooking(req: Request, res: Response): Promise<void> {
    try {
      const guideId = req.user!.id;
      const { bookingId } = req.params;
      const data: ApproveBookingDTO = req.body;

      if (!data.agreedPaymentType) {
        throw new AppError('Agreed payment type is required', 400);
      }

      const booking = await berseGuideService.approveBooking(guideId, bookingId, data);

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
   * Reject booking (Guide)
   * PATCH /api/v2/berseguide/bookings/:bookingId/reject
   */
  async rejectBooking(req: Request, res: Response): Promise<void> {
    try {
      const guideId = req.user!.id;
      const { bookingId } = req.params;
      const data: RejectBookingDTO = req.body;

      const booking = await berseGuideService.rejectBooking(guideId, bookingId, data);

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
   * PATCH /api/v2/berseguide/bookings/:bookingId/cancel
   */
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { bookingId } = req.params;
      const data: CancelBookingDTO = req.body;

      const booking = await berseGuideService.cancelBooking(userId, bookingId, data);

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

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Start session (Guide)
   * POST /api/v2/berseguide/sessions/start
   */
  async startSession(req: Request, res: Response): Promise<void> {
    try {
      const guideId = req.user!.id;
      const data: CreateSessionDTO = req.body;

      if (!data.bookingId) {
        throw new AppError('Booking ID is required', 400);
      }

      const session = await berseGuideService.startSession(guideId, data);

      res.status(201).json({
        success: true,
        message: 'Session started successfully',
        data: session,
      });
    } catch (error) {
      logger.error('Failed to start session', { error, guideId: req.user?.id });
      throw error;
    }
  }

  /**
   * Update session (Guide)
   * PATCH /api/v2/berseguide/sessions/:sessionId
   */
  async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const guideId = req.user!.id;
      const { sessionId } = req.params;
      const data: UpdateSessionDTO = req.body;

      const session = await berseGuideService.updateSession(guideId, sessionId, data);

      res.json({
        success: true,
        message: 'Session updated successfully',
        data: session,
      });
    } catch (error) {
      logger.error('Failed to update session', { error, sessionId: req.params.sessionId });
      throw error;
    }
  }

  /**
   * End session (Guide)
   * POST /api/v2/berseguide/sessions/:sessionId/end
   */
  async endSession(req: Request, res: Response): Promise<void> {
    try {
      const guideId = req.user!.id;
      const { sessionId } = req.params;
      const data: EndSessionDTO = req.body;

      const session = await berseGuideService.endSession(guideId, sessionId, data);

      res.json({
        success: true,
        message: 'Session ended successfully',
        data: session,
      });
    } catch (error) {
      logger.error('Failed to end session', { error, sessionId: req.params.sessionId });
      throw error;
    }
  }

  /**
   * Get sessions for a booking
   * GET /api/v2/berseguide/bookings/:bookingId/sessions
   */
  async getSessionsForBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { bookingId } = req.params;

      const sessions = await berseGuideService.getSessionsForBooking(bookingId, userId);

      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      logger.error('Failed to get sessions for booking', { error, bookingId: req.params.bookingId });
      throw error;
    }
  }

  // ============================================================================
  // REVIEW MANAGEMENT
  // ============================================================================

  /**
   * Create review
   * POST /api/v2/berseguide/reviews
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

      const review = await berseGuideService.createReview(userId, data);

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
   * GET /api/v2/berseguide/reviews/given
   */
  async getReviewsGiven(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const reviews = await berseGuideService.getReviews(userId, 'given');

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
   * GET /api/v2/berseguide/reviews/received
   */
  async getReviewsReceived(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const reviews = await berseGuideService.getReviews(userId, 'received');

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
   * GET /api/v2/berseguide/reviews/user/:userId
   */
  async getUserReviews(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const reviews = await berseGuideService.getReviews(userId, 'received');

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
   * Get BerseGuide metadata
   * GET /api/v2/berseguide/metadata
   */
  async getMetadata(req: Request, res: Response): Promise<void> {
    try {
      const metadata = MetadataService.getServiceMetadata();

      res.json({
        success: true,
        data: {
          guideTypes: metadata.guideTypes,
          paymentTypes: metadata.paymentTypes,
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
   * Search BerseGuide profiles
   * GET /api/v2/berseguide/search?city=Berlin&date=2024-01-01&startTime=10:00
   */
  async searchProfiles(req: Request, res: Response): Promise<void> {
    try {
      const query: SearchBerseGuideDTO = {
        city: req.query.city as string,
        date: req.query.date as string,
        startTime: req.query.startTime as string,
        endTime: req.query.endTime as string,
        numberOfPeople: req.query.numberOfPeople ? Number(req.query.numberOfPeople) : undefined,
        guideTypes: req.query.guideTypes ? (req.query.guideTypes as string).split(',') as any : undefined,
        languages: req.query.languages ? (req.query.languages as string).split(',') : undefined,
        specialties: req.query.specialties ? (req.query.specialties as string).split(',') : undefined,
        minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
        maxHourlyRate: req.query.maxHourlyRate ? Number(req.query.maxHourlyRate) : undefined,
        paymentTypes: req.query.paymentTypes ? (req.query.paymentTypes as string).split(',') as any : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        sortBy: (req.query.sortBy as any) || 'rating',
        sortOrder: (req.query.sortOrder as any) || 'desc',
        requestingUserId: req.user?.id, // For mutual connections/communities
      };

      const results = await berseGuideService.searchProfiles(query);

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
   * Get my BerseGuide bookings
   * GET /api/v2/berseguide/my?filter=upcoming&status=APPROVED&role=guide
   */
  async getMyBerseGuide(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { filter, status, role } = req.query;

      const data = await berseGuideService.getMyBerseGuide(userId, {
        filter: filter as any,
        status: status as any,
        role: role as any,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      logger.error('Failed to get my BerseGuide', { error, userId: req.user?.id });
      throw error;
    }
  }

  /**
   * Get BerseGuide dashboard
   * GET /api/v2/berseguide/dashboard
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const dashboard = await berseGuideService.getDashboard(userId);

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
