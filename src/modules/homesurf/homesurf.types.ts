import { 
  AccommodationType, 
  PaymentType, 
  HomeSurfBookingStatus, 
  ReviewerRole 
} from '@prisma/client';

// ==================== PROFILE TYPES ====================

export interface CreateHomeSurfProfileDTO {
  title: string;
  description: string;
  accommodationType: AccommodationType;
  maxGuests: number;
  amenities: string[];
  houseRules?: string;
  photos?: string[];
  availabilityNotes?: string;
  minimumStay?: number;
  maximumStay?: number;
  advanceNotice?: number;
  city: string;
  neighborhood?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface UpdateHomeSurfProfileDTO {
  title?: string;
  description?: string;
  accommodationType?: AccommodationType;
  maxGuests?: number;
  amenities?: string[];
  houseRules?: string;
  photos?: string[];
  availabilityNotes?: string;
  minimumStay?: number;
  maximumStay?: number;
  advanceNotice?: number;
  city?: string;
  neighborhood?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface HomeSurfProfileResponse {
  userId: string;
  isEnabled: boolean;
  title: string;
  description: string;
  accommodationType: AccommodationType;
  maxGuests: number;
  amenities: string[];
  houseRules?: string;
  photos: string[];
  paymentOptions: PaymentOptionResponse[];
  availabilityNotes?: string;
  minimumStay?: number;
  maximumStay?: number;
  advanceNotice?: number;
  city: string;
  neighborhood?: string;
  address?: object;
  coordinates?: object;
  responseRate: number;
  averageResponseTime?: number;
  totalGuests: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  user?: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
}

// ==================== PAYMENT OPTION TYPES ====================

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
  homeSurfId: string;
  paymentType: PaymentType;
  amount?: number;
  currency?: string;
  description?: string;
  isPreferred: boolean;
}

// ==================== BOOKING TYPES ====================

export interface CreateBookingRequestDTO {
  hostId: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  numberOfGuests: number;
  message?: string;
}

export interface UpdateBookingDTO {
  agreedPaymentType?: PaymentType;
  agreedPaymentAmount?: number;
  agreedPaymentDetails?: string;
  specialRequests?: string;
  checkInInstructions?: string;
  conversationId?: string;
}

export interface ApproveBookingDTO {
  agreedPaymentType: PaymentType;
  agreedPaymentAmount?: number;
  agreedPaymentDetails?: string;
  checkInInstructions?: string;
}

export interface RejectBookingDTO {
  cancellationReason: string;
}

export interface CancelBookingDTO {
  cancellationReason: string;
}

export interface HomeSurfBookingResponse {
  id: string;
  hostId: string;
  guestId: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  message?: string;
  status: HomeSurfBookingStatus;
  agreedPaymentType?: PaymentType;
  agreedPaymentAmount?: number;
  agreedPaymentDetails?: string;
  specialRequests?: string;
  checkInInstructions?: string;
  conversationId?: string;
  requestedAt: Date;
  respondedAt?: Date;
  approvedAt?: Date;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  host?: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
  guest?: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
  homeSurf?: HomeSurfProfileResponse;
}

// ==================== REVIEW TYPES ====================

export interface CreateReviewDTO {
  bookingId: string;
  revieweeId: string;
  reviewerRole: ReviewerRole;
  rating: number;
  review?: string;
  cleanliness?: number;
  communication?: number;
  location?: number;
  hospitality?: number;
  respect?: number;
  wouldHostAgain?: boolean;
  wouldStayAgain?: boolean;
  photos?: string[];
  isPublic?: boolean;
}

export interface HomeSurfReviewResponse {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: ReviewerRole;
  rating: number;
  review?: string;
  cleanliness?: number;
  communication?: number;
  location?: number;
  hospitality?: number;
  respect?: number;
  wouldHostAgain?: boolean;
  wouldStayAgain?: boolean;
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

// ==================== SEARCH TYPES ====================

export interface SearchHomeSurfDTO {
  city?: string;
  checkInDate?: Date | string;
  checkOutDate?: Date | string;
  numberOfGuests?: number;
  accommodationType?: AccommodationType[];
  amenities?: string[];
  minRating?: number;
  paymentTypes?: PaymentType[];
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'responseRate' | 'totalGuests' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  requestingUserId?: string; // For mutual connections/communities enrichment
}

export interface SearchHomeSurfResponse {
  data: HomeSurfProfileResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== DASHBOARD TYPES ====================

export interface HomeSurfDashboardResponse {
  profile?: HomeSurfProfileResponse;
  stats: {
    totalGuests: number;
    pendingRequests: number;
    upcomingStays: number;
    rating: number;
    reviewCount: number;
    responseRate: number;
  };
  recentRequests: HomeSurfBookingResponse[];
  upcomingStays: HomeSurfBookingResponse[];
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

// ==================== UTILITY TYPES ====================

export interface ToggleHomeSurfDTO {
  isEnabled: boolean;
}

export interface CheckAvailabilityDTO {
  hostId: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  conflictingBookings?: HomeSurfBookingResponse[];
  message?: string;
}

// ==================== STATISTICS TYPES ====================

export interface HomeSurfStatsResponse {
  totalHosts: number;
  totalBookings: number;
  totalReviews: number;
  averageRating: number;
  topCities: Array<{
    city: string;
    hostCount: number;
  }>;
  popularAmenities: Array<{
    amenity: string;
    count: number;
  }>;
}
