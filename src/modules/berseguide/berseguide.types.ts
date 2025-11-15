import type {
  GuideType,
  PaymentType,
  BerseGuideBookingStatus,
  ReviewerRole,
} from '@prisma/client';

// ============================================================================
// BERSEGUIDE PROFILE DTOs
// ============================================================================

export interface CreateBerseGuideProfileDTO {
  title: string;
  bio: string;
  guideTypes: GuideType[];
  languages: string[];
  specialties: string[];
  photos?: string[];
  hourlyRate?: number;
  halfDayRate?: number;
  fullDayRate?: number;
  currency?: string;
  maxGroupSize: number;
  city: string;
  neighborhoods?: string[];
  availabilityNotes?: string;
  minimumBookingHours?: number;
  advanceNotice?: number; // hours
}

export interface UpdateBerseGuideProfileDTO {
  title?: string;
  bio?: string;
  guideTypes?: GuideType[];
  languages?: string[];
  specialties?: string[];
  photos?: string[];
  hourlyRate?: number;
  halfDayRate?: number;
  fullDayRate?: number;
  currency?: string;
  maxGroupSize?: number;
  city?: string;
  neighborhoods?: string[];
  availabilityNotes?: string;
  minimumBookingHours?: number;
  advanceNotice?: number;
}

export interface ToggleBerseGuideDTO {
  isEnabled: boolean;
}

export interface BerseGuideProfileResponse {
  userId: string;
  isEnabled: boolean;
  title: string;
  bio: string;
  guideTypes: GuideType[];
  languages: Array<{ code: string; label: string; native: string; emoji: string }>;
  specialties: string[];
  photos: string[];
  hourlyRate?: number;
  halfDayRate?: number;
  fullDayRate?: number;
  currency?: string;
  maxGroupSize: number;
  paymentOptions: PaymentOptionResponse[];
  city: string;
  neighborhoods: string[];
  availabilityNotes?: string;
  minimumBookingHours?: number;
  advanceNotice?: number;
  responseRate: number;
  averageResponseTime?: number;
  totalSessions: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
  user?: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
}

// ============================================================================
// PAYMENT OPTION DTOs
// ============================================================================

export interface CreatePaymentOptionDTO {
  paymentType: PaymentType;
  amount?: number;
  currency?: string;
  description?: string;
  isPreferred?: boolean;
}

export interface UpdatePaymentOptionDTO {
  paymentType?: PaymentType;
  amount?: number;
  currency?: string;
  description?: string;
  isPreferred?: boolean;
}

export interface PaymentOptionResponse {
  id: string;
  paymentType: PaymentType;
  amount?: number;
  currency?: string;
  description?: string;
  isPreferred: boolean;
  createdAt: Date;
}

// ============================================================================
// BOOKING DTOs
// ============================================================================

export interface CreateBookingRequestDTO {
  guideId: string;
  date: string; // ISO date string
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  numberOfPeople: number;
  selectedPaymentOptionId?: string; // Traveler selects from guide's payment options
  interests?: string[];
  specialRequests?: string;
  message?: string;
}

export interface UpdateBookingDTO {
  date?: string;
  startTime?: string;
  endTime?: string;
  numberOfPeople?: number;
  interests?: string[];
  specialRequests?: string;
}

export interface ApproveBookingDTO {
  agreedPaymentType: PaymentType;
  agreedPaymentAmount?: number;
  agreedPaymentDetails?: string;
  meetingPoint?: string;
  itinerary?: string;
}

export interface RejectBookingDTO {
  cancellationReason?: string;
}

export interface CancelBookingDTO {
  cancellationReason?: string;
}

export interface CheckAvailabilityDTO {
  guideId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  conflictingBookings?: BerseGuideBookingResponse[];
  message: string;
}

export interface BerseGuideBookingResponse {
  id: string;
  guideId: string;
  touristId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  numberOfPeople: number;
  interests: string[];
  specialRequests?: string;
  message?: string;
  status: BerseGuideBookingStatus;
  agreedPaymentType?: PaymentType;
  agreedPaymentAmount?: number;
  agreedPaymentDetails?: string;
  meetingPoint?: string;
  itinerary?: string;
  conversationId?: string;
  requestedAt: Date;
  respondedAt?: Date;
  approvedAt?: Date;
  sessionStartedAt?: Date;
  sessionEndedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  guide?: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
  tourist?: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
  berseGuide?: BerseGuideProfileResponse;
  sessions?: SessionResponse[];
}

// ============================================================================
// SESSION DTOs
// ============================================================================

export interface CreateSessionDTO {
  bookingId: string;
  notes?: string;
}

export interface UpdateSessionDTO {
  notes?: string;
  highlights?: string[];
  placesVisited?: string[];
}

export interface EndSessionDTO {
  notes?: string;
  highlights?: string[];
  placesVisited?: string[];
}

export interface SessionResponse {
  id: string;
  bookingId: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // minutes
  notes?: string;
  highlights: string[];
  placesVisited: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// REVIEW DTOs
// ============================================================================

export interface CreateReviewDTO {
  bookingId: string;
  revieweeId: string;
  reviewerRole: ReviewerRole;
  rating: number; // 1-5
  review?: string;
  knowledge?: number; // 1-5
  communication?: number; // 1-5
  friendliness?: number; // 1-5
  professionalism?: number; // 1-5
  punctuality?: number; // 1-5
  wouldRecommend?: boolean;
  photos?: string[];
  isPublic?: boolean;
}

export interface BerseGuideReviewResponse {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: ReviewerRole;
  rating: number;
  review?: string;
  knowledge?: number;
  communication?: number;
  friendliness?: number;
  professionalism?: number;
  punctuality?: number;
  wouldRecommend?: boolean;
  photos: string[];
  isPublic: boolean;
  createdAt: Date;
  reviewer?: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
  reviewee?: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
}

// ============================================================================
// SEARCH & DISCOVERY DTOs
// ============================================================================

export interface SearchBerseGuideDTO {
  city?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  numberOfPeople?: number;
  guideTypes?: GuideType[];
  languages?: string[];
  specialties?: string[];
  minRating?: number;
  maxHourlyRate?: number;
  paymentTypes?: PaymentType[];
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'hourlyRate' | 'reviewCount' | 'totalSessions' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  requestingUserId?: string; // For mutual connections/communities enrichment
}

export interface SearchBerseGuideResponse {
  data: BerseGuideProfileResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// DASHBOARD DTOs
// ============================================================================

export interface BerseGuideDashboardResponse {
  profile?: BerseGuideProfileResponse;
  stats: {
    totalSessions: number;
    pendingRequests: number;
    upcomingBookings: number;
    rating: number;
    reviewCount: number;
    responseRate: number;
  };
  recentRequests: BerseGuideBookingResponse[];
  upcomingBookings: BerseGuideBookingResponse[];
  canEnable: boolean;
  trustRequirement: {
    required: boolean;
    minTrustScore: number;
    minTrustLevel: string;
    currentTrustScore: number;
    currentTrustLevel: string;
    meetsRequirement: boolean;
  };
}
