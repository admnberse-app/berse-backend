/**
 * TypeScript type definitions for BerseMuka App API
 */

// User related types
export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  bio?: string
  profilePicture?: string
  city?: string
  instagramHandle?: string
  linkedinHandle?: string
  interests?: string[]
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  points: number
  level: number
  referralCode: string
  referredBy?: string
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

// Authentication types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phone?: string
  referralCode?: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Event types
export interface Event {
  id: string
  title: string
  description?: string
  type: EventType
  date: string
  location: string
  mapLink?: string
  coverImage?: string
  maxAttendees?: number
  notes?: string
  organizerId: string
  organizer?: User
  attendees?: EventAttendee[]
  createdAt: string
  updatedAt: string
  attendeeCount?: number
}

export enum EventType {
  SOCIAL = 'SOCIAL',
  SPORTS = 'SPORTS',
  TRIP = 'TRIP',
  ILM = 'ILM',
  CAFE_MEETUP = 'CAFE_MEETUP',
  VOLUNTEER = 'VOLUNTEER',
  MONTHLY_EVENT = 'MONTHLY_EVENT',
  LOCAL_TRIP = 'LOCAL_TRIP',
}

export interface EventAttendee {
  id: string
  userId: string
  eventId: string
  status: AttendanceStatus
  checkedIn: boolean
  user?: User
  createdAt: string
}

export enum AttendanceStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  WAITLISTED = 'WAITLISTED',
}

// Points and rewards types
export interface PointsTransaction {
  id: string
  userId: string
  points: number
  action: string
  description: string
  createdAt: string
}

export interface UserPoints {
  userId: string
  totalPoints: number
  level: number
  transactions: PointsTransaction[]
}

export interface Reward {
  id: string
  title: string
  description: string
  pointsRequired: number
  category: string
  partner: string
  quantity: number
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RewardRedemption {
  id: string
  userId: string
  rewardId: string
  status: RedemptionStatus
  notes?: string
  redeemedAt: string
  processedAt?: string
  user?: User
  reward?: Reward
}

export enum RedemptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Badge types
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  pointsRequired: number
  criteria?: any
  createdAt: string
}

export enum BadgeCategory {
  ACHIEVEMENT = 'ACHIEVEMENT',
  PARTICIPATION = 'PARTICIPATION',
  MILESTONE = 'MILESTONE',
  SPECIAL = 'SPECIAL',
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  awardedAt: string
  badge?: Badge
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Request parameter types
export interface SearchUsersParams {
  city?: string
  interest?: string
  query?: string
}

export interface GetEventsParams {
  type?: EventType
  city?: string
  upcoming?: boolean
}

export interface GetRewardsParams {
  category?: string
  minPoints?: number
  maxPoints?: number
}

// Update request types
export interface UpdateProfileRequest {
  fullName?: string
  bio?: string
  city?: string
  interests?: string[]
  instagramHandle?: string
  linkedinHandle?: string
}

export interface CreateEventRequest {
  title: string
  description?: string
  type: EventType
  date: string
  location: string
  mapLink?: string
  maxAttendees?: number
  notes?: string
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export interface CheckInRequest {
  eventId: string
  userId: string
}

export interface ManualPointsUpdateRequest {
  userId: string
  points: number
  action?: string
  description: string
}

export interface CreateRewardRequest {
  title: string
  description: string
  pointsRequired: number
  category: string
  partner: string
  quantity: number
  imageUrl?: string
}

export interface RedeemRewardRequest {
  rewardId: string
}

export interface UpdateRedemptionStatusRequest {
  status: RedemptionStatus
  notes?: string
}

// Error types
export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: any
}