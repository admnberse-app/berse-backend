/**
 * Dashboard Module - Type Definitions
 * Handles all dashboard-related data aggregation and presentation
 */

export interface DashboardSummary {
  user: {
    id: string;
    firstName: string;
    lastName?: string;
    displayName?: string;
    profilePicture?: string;
    trustScore: number;
    trustLevel: string;
    totalPoints: number;
    badgesCount: number;
    vouchesCount: number;
  };
  stats: {
    communities: number;
    events: number;
    listings: number;
    connections: number;
    eventsAttended: number;
    eventsHosted: number;
  };
  // HomeSurf - Accommodation hosting feature
  homeSurf: {
    isEnabled: boolean;
    hasProfile: boolean;
    totalBookings: number;
    pendingRequests: number;
    averageRating: number | null;
    city: string | null;
    accommodationType: string | null;
  };
  // BerseGuide - Tour guide feature
  berseGuide: {
    isEnabled: boolean;
    hasProfile: boolean;
    totalBookings: number;
    totalSessions: number;
    upcomingTours: number;
    averageRating: number | null;
    city: string | null;
    guideTypes: string[];
    highlights: string[];
  };
  alerts: Alert[];
  communitySummary: {
    total: number;
    admin: number;
    member: number;
    pendingRequests: number; // Pending requests to approve (for admins)
    pendingJoinRequests: number; // User's own pending join requests
  };
  eventSummary: {
    total: number;
    hosting: number;
    attending: number;
    upcoming: number;
  };
  listingSummary: {
    total: number;
    active: number;
    sold: number;
    draft: number;
  };
  recentActivity: Activity[];
}

export interface Alert {
  type: 
    | 'community_approvals' 
    | 'community_join_pending'
    | 'event_payment_required' 
    | 'event_payment_pending_attendees'
    | 'event_upcoming' 
    | 'event_new_participants'
    | 'connection_requests' 
    | 'vouch_requests'
    | 'new_messages' 
    | 'listing_interest';
  count: number;
  priority: 'high' | 'medium' | 'low';
  message: string;
  targetId?: string;
  targetName?: string;
  targetType?: 'community' | 'event' | 'listing' | 'message' | 'connection' | 'vouch';
  actionUrl: string;  // Deep link for action
  metadata?: {
    // For events
    eventDate?: Date;
    participantCount?: number;
    unpaidCount?: number;
    maxAttendees?: number;
    daysUntilEvent?: number;
    
    // For communities (admin approvals)
    communityId?: string;
    pendingMembers?: Array<{
      userId: string;
      userName: string;
      profilePicture?: string;
      requestedAt: Date;
    }>;
    
    // For user's pending community joins
    pendingCommunities?: Array<{
      communityId: string;
      communityName: string;
      communityLogo?: string;
      requestedAt: Date;
    }>;
    
    // For connections/vouches
    requests?: Array<{
      id: string;
      fromUserId: string;
      fromUserName: string;
      fromUserProfilePicture?: string;
      requestedAt: Date;
      message?: string;
    }>;
  };
}

export interface Activity {
  id: string;
  type: 'community_join' | 'community_post' | 'event_rsvp' | 'event_checkin' | 'listing_comment' | 'listing_sold' | 'badge_earned' | 'connection_request' | 'vouch_received';
  icon: string;
  message: string;
  targetName?: string;
  details?: string;
  timestamp: Date;
  targetId?: string;
  targetType?: 'community' | 'event' | 'listing' | 'user' | 'badge';
  read: boolean;
}

export interface MyCommunity {
  id: string;
  name: string;
  slug: string;
  profileImage?: string;
  location?: string;
  memberCount: number;
  userRole: 'admin' | 'member';
  pendingApprovals?: number;
  isPrivate: boolean;
  joinedAt: Date;
  category?: string;
  isVerified?: boolean;
}

export interface MyEvent {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  location?: {
    name?: string;
    address?: string;
  };
  coverImage?: string;
  attendeeCount: number;
  maxAttendees?: number;
  userRole: 'host' | 'attendee';
  rsvpStatus: 'going' | 'interested' | 'not_going';
  community?: {
    id: string;
    name: string;
  };
  eventType?: string;
}

export interface MyListing {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  images: string[];
  location?: string;
  status: 'active' | 'sold' | 'draft' | 'archived';
  viewCount: number;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
}
