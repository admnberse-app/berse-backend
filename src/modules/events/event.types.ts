import { EventType, EventStatus, EventHostType, EventTicketStatus } from '@prisma/client';

// ============================================================================
// EVENT REQUEST TYPES
// ============================================================================

export interface CreateEventRequest {
  title: string;
  description?: string;
  type: EventType;
  date: string | Date;
  location: string;
  mapLink?: string;
  maxAttendees?: number;
  notes?: string;
  communityId?: string;
  images?: string[];
  isFree: boolean;
  price?: number;
  currency?: string;
  hostType?: EventHostType;
  status?: EventStatus;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  type?: EventType;
  date?: string | Date;
  location?: string;
  mapLink?: string;
  maxAttendees?: number;
  notes?: string;
  images?: string[];
  isFree?: boolean;
  price?: number;
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
// RSVP TYPES
// ============================================================================

export interface CreateRsvpRequest {
  eventId: string;
}

export interface RsvpResponse {
  id: string;
  eventId: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    type: EventType;
  };
  createdAt: string;
}

// ============================================================================
// ATTENDANCE TYPES
// ============================================================================

export interface CheckInRequest {
  eventId: string;
  userId?: string;
  qrCode?: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  userId: string;
  checkedInAt: Date;
  user?: {
    id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
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
  location: string;
  mapLink?: string;
  maxAttendees?: number;
  notes?: string;
  hostId: string;
  communityId?: string;
  hostType: EventHostType;
  images: string[];
  isFree: boolean;
  price?: number;
  currency: string;
  status: EventStatus;
  ticketsSold: number;
  totalRevenue?: number;
  organizerPayout?: number;
  platformFee?: number;
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
    eventRsvps: number;
    eventAttendances: number;
    eventTickets: number;
    tier: number;
  };
  ticketTiers?: TicketTierResponse[];
  userRsvp?: RsvpResponse;
  userTicket?: TicketResponse;
  hasRsvped?: boolean;
  hasTicket?: boolean;
  isOwner?: boolean;
  attendeesPreview?: Array<{
    id: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
    checkedInAt: Date;
  }>;
  rsvpsPreview?: Array<{
    id: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
    rsvpedAt: Date;
  }>;
  stats?: {
    totalAttendees: number;
    totalRsvps: number;
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
  ticketTierId?: string;
  ticketType: string;
  price: number;
  currency: string;
  status: EventTicketStatus;
  ticketNumber: string;
  quantity: number;
  purchasedAt: Date;
  checkedInAt?: Date;
  canceledAt?: Date;
  refundedAt?: Date;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  
  // Relations (optional)
  event?: EventResponse;
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
