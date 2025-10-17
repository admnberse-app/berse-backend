import { Request } from 'express';
import { User, UserRole, UserStatus } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  totalPoints: number;
  serviceProfile?: {
    isHostCertified: boolean;
    isHostAvailable: boolean;
    isGuideAvailable: boolean;
  } | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface PointAction {
  // Registration & Setup
  REGISTER: number;
  COMPLETE_PROFILE_BASIC: number;
  COMPLETE_PROFILE_FULL: number;
  VERIFY_EMAIL: number;
  VERIFY_PHONE: number;
  UPLOAD_PROFILE_PHOTO: number;
  
  // Events
  ATTEND_EVENT: number;
  HOST_EVENT: number;
  RSVP_EVENT: number;
  CANCEL_RSVP: number;
  JOIN_TRIP: number;
  CAFE_MEETUP: number;
  ILM_EVENT: number;
  VOLUNTEER: number;
  DONATE: number;
  
  // Connections & Social
  FIRST_CONNECTION: number;
  MAKE_CONNECTION: number;
  RECEIVE_CONNECTION: number;
  VOUCH_SOMEONE: number;
  RECEIVE_VOUCH: number;
  GIVE_TRUST_MOMENT: number;
  RECEIVE_POSITIVE_TRUST_MOMENT: number;
  
  // Community
  JOIN_COMMUNITY: number;
  COMMUNITY_PARTICIPATION: number;
  BECOME_MODERATOR: number;
  
  // Referrals
  REFERRAL: number;
  REFEREE_SIGNUP: number;
  
  // Card Game
  SUBMIT_CARD_GAME_FEEDBACK: number;
  RECEIVE_HELPFUL_VOTE: number;
  REPLY_TO_FEEDBACK: number;
  
  // Marketplace
  FIRST_LISTING: number;
  COMPLETE_TRANSACTION: number;
  RECEIVE_POSITIVE_REVIEW: number;
  
  // Achievements
  EARN_BADGE: number;
  REACH_TRUST_MILESTONE: number;
  MAINTAIN_STREAK_WEEK: number;
  MAINTAIN_STREAK_MONTH: number;
  
  // Penalties
  RECEIVE_NEGATIVE_TRUST_MOMENT: number;
  REPORT_VALIDATED: number;
  SPAM_DETECTED: number;
}

export const POINT_VALUES: PointAction = {
  // Registration & Setup
  REGISTER: 30,
  COMPLETE_PROFILE_BASIC: 50,
  COMPLETE_PROFILE_FULL: 100,
  VERIFY_EMAIL: 20,
  VERIFY_PHONE: 20,
  UPLOAD_PROFILE_PHOTO: 10,
  
  // Events
  ATTEND_EVENT: 10,
  HOST_EVENT: 15,
  RSVP_EVENT: 2,
  CANCEL_RSVP: -2,
  JOIN_TRIP: 5,
  CAFE_MEETUP: 2,
  ILM_EVENT: 3,
  VOLUNTEER: 6,
  DONATE: 4,
  
  // Connections & Social
  FIRST_CONNECTION: 15,
  MAKE_CONNECTION: 5,
  RECEIVE_CONNECTION: 3,
  VOUCH_SOMEONE: 10,
  RECEIVE_VOUCH: 20,
  GIVE_TRUST_MOMENT: 5,
  RECEIVE_POSITIVE_TRUST_MOMENT: 10,
  
  // Community
  JOIN_COMMUNITY: 5,
  COMMUNITY_PARTICIPATION: 3,
  BECOME_MODERATOR: 50,
  
  // Referrals
  REFERRAL: 10,
  REFEREE_SIGNUP: 5,
  
  // Card Game
  SUBMIT_CARD_GAME_FEEDBACK: 5,
  RECEIVE_HELPFUL_VOTE: 2,
  REPLY_TO_FEEDBACK: 3,
  
  // Marketplace
  FIRST_LISTING: 10,
  COMPLETE_TRANSACTION: 5,
  RECEIVE_POSITIVE_REVIEW: 10,
  
  // Achievements
  EARN_BADGE: 25,
  REACH_TRUST_MILESTONE: 30,
  MAINTAIN_STREAK_WEEK: 10,
  MAINTAIN_STREAK_MONTH: 50,
  
  // Penalties (negative points)
  RECEIVE_NEGATIVE_TRUST_MOMENT: -10,
  REPORT_VALIDATED: -20,
  SPAM_DETECTED: -50,
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}