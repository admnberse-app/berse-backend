import { EventType, EventStatus, EventHostType, EventTicketStatus, EventParticipantStatus, PaymentStatus } from '@prisma/client';

// ============================================================================
// EVENT REQUEST TYPES
// ============================================================================

export interface CreateEventRequest {
  title: string;
  description?: string;
  type: EventType;
  date?: string | Date; // Legacy field for backward compatibility (optional)
  startDate?: string | Date; // New field: event start date
  endDate?: string | Date; // New field: event end date
  startTime?: string; // New field: event start time (HH:mm format)
  endTime?: string; // New field: event end time (HH:mm format)
  location: string;
  mapLink?: string;
  maxAttendees?: number;
  notes?: string;
  communityId?: string;
  images?: string[];
  isFree: boolean;
  currency?: string;
  hostType?: EventHostType;
  status?: EventStatus;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  type?: EventType;
  date?: string | Date; // Legacy field for backward compatibility
  startDate?: string | Date; // New field: event start date
  endDate?: string | Date; // New field: event end date
  startTime?: string; // New field: event start time (HH:mm format)
  endTime?: string; // New field: event end time (HH:mm format)
  location?: string;
  mapLink?: string;
  maxAttendees?: number;
  notes?: string;
  images?: string[];
  isFree?: boolean;
  currency?: string;
  status?: EventStatus;
}

export interface EventFilters {
  type?: EventType;
  status?: EventStatus;
  hostType?: EventHostType;
  isFree?: boolean;
  startDate?: string | Date;
  endDate?: string | Date;
  location?: string;
  communityId?: string;
  hostId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface EventQuery {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'createdAt' | 'price' | 'title';
  sortOrder?: 'asc' | 'desc';
  filters?: EventFilters;
}

// ============================================================================
// TICKET TIER TYPES
// ============================================================================

export interface CreateTicketTierRequest {
  eventId: string;
  tierName: string;
  description?: string;
  price: number;
  currency?: string;
  totalQuantity?: number;
  minPurchase?: number;
  maxPurchase?: number;
  availableFrom?: string | Date;
  availableUntil?: string | Date;
  displayOrder?: number;
}

export interface UpdateTicketTierRequest {
  tierName?: string;
  description?: string;
  price?: number;
  currency?: string;
  totalQuantity?: number;
  minPurchase?: number;
  maxPurchase?: number;
  availableFrom?: string | Date;
  availableUntil?: string | Date;
  displayOrder?: number;
  isActive?: boolean;
}

// ============================================================================
// TICKET PURCHASE TYPES
// ============================================================================

export interface PurchaseTicketRequest {
  eventId: string;
  ticketTierId?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
}

export interface TicketFilters {
  eventId?: string;
  userId?: string;
  status?: EventTicketStatus;
  purchasedFrom?: string | Date;
  purchasedTo?: string | Date;
}

// ============================================================================
// PARTICIPANT TYPES (Replaces RSVP + Attendance)
// ============================================================================

export interface CreateParticipantRequest {
  eventId: string;
}

export interface ParticipantResponse {
  id: string;
  userId: string;
  eventId: string;
  status: EventParticipantStatus;
  qrCode: string;
  checkedInAt?: Date;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  event?: {
    id: string;
    title: string;
    date: Date;
    location: string;
    type: EventType;
  };
  user?: {
    id: string;
    fullName: string;
    username?: string;
    email: string;
    profilePicture?: string;
  };
}

// ============================================================================
// CHECK-IN TYPES
// ============================================================================

export interface CheckInRequest {
  eventId: string;
  userId?: string;
  qrCode?: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface EventResponse {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  date: Date;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  location: string;
  mapLink?: string;
  maxAttendees?: number;
  notes?: string;
  hostId: string;
  communityId?: string;
  hostType: EventHostType;
  images: string[];
  isFree: boolean;
  currency: string;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
    label: string; // e.g., "Starting from RM 50" or "RM 50 - RM 200"
  };
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (optional)
  host?: {
    id: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
  };
  community?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  _count?: {
    eventParticipants: number;
    eventTickets: number;
    tier: number;
  };
  ticketTiers?: TicketTierResponse[];
  userParticipant?: ParticipantResponse;
  userTicket?: TicketResponse;
  hasTicket?: boolean;
  isOwner?: boolean;
  attendeesPreview?: Array<{
    id: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
    checkedInAt: Date;
  }>;
  participantsPreview?: Array<{
    id: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
    createdAt: Date;
    status: EventParticipantStatus;
  }>;
  stats?: {
    totalParticipants: number;
    totalCheckedIn: number;
    totalTicketsSold: number;
    totalTicketTiers: number;
    attendanceRate: number;
  };
}

export interface TicketTierResponse {
  id: string;
  eventId: string;
  tierName: string;
  description?: string;
  price: number;
  currency: string;
  totalQuantity?: number;
  soldQuantity: number;
  minPurchase: number;
  maxPurchase: number;
  availableFrom?: Date;
  availableUntil?: Date;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  availableQuantity?: number;
  isAvailable?: boolean;
}

export interface TicketResponse {
  id: string;
  eventId: string;
  userId: string;
  participantId: string;
  ticketTierId?: string;
  ticketType: string;
  price: number;
  currency: string;
  status: EventTicketStatus;
  paymentStatus: PaymentStatus;
  ticketNumber: string;
  purchasedAt: Date;
  canceledAt?: Date;
  refundedAt?: Date;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  
  // Fee calculations (available on purchase)
  platformFee?: number;
  gatewayFee?: number;
  totalFees?: number;
  netAmount?: number;
  
  // Relations (optional)
  event?: EventResponse;
  participant?: ParticipantResponse;
  tier?: TicketTierResponse;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface EventStatsResponse {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalAttendees: number;
  averageRating?: number;
  popularEventTypes: {
    type: EventType;
    count: number;
  }[];
}

export interface EventAnalyticsResponse {
  eventId: string;
  views: number;
  rsvpCount: number;
  attendanceCount: number;
  ticketsSold: number;
  revenue: number;
  conversionRate: number;
  checkInRate: number;
  popularTicketTier?: string;
  revenueByTier: {
    tierName: string;
    revenue: number;
    ticketsSold: number;
  }[];
}
