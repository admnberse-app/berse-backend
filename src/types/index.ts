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
  JOIN_TRIP: number;
  CAFE_MEETUP: number;
  ILM_EVENT: number;
  VOLUNTEER: number;
  DONATE: number;
  
  // Connections & Social
  RECEIVE_VOUCH: number;
  GIVE_TRUST_MOMENT: number;
  RECEIVE_POSITIVE_TRUST_MOMENT: number;
  
  // Community
  JOIN_COMMUNITY: number;
  POST_IN_COMMUNITY: number;
  REACT_TO_COMMUNITY_POST: number;
  
  // Referrals
  REFERRAL: number;
  
  // Marketplace
  CREATE_LISTING: number;
  PURCHASE_ITEM: number;
  SELL_ITEM: number;
  LEAVE_REVIEW: number;
  RECEIVE_POSITIVE_REVIEW: number;
  
  // BerseGuide
  BECOME_GUIDE: number;
  COMPLETE_GUIDE_SESSION: number;
  RECEIVE_GUIDE_REVIEW: number;
  BOOK_GUIDE_SESSION: number;
  
  // HomeSurf
  LIST_HOME: number;
  HOST_TRAVELER: number;
  STAY_AS_TRAVELER: number;
  LEAVE_HOST_REVIEW: number;
  RECEIVE_HOST_REVIEW: number;
  
  // Card Game (Topic Feedback)
  SUBMIT_TOPIC_FEEDBACK: number;
  RECEIVE_HELPFUL_VOTE: number;
  REPLY_TO_FEEDBACK: number;
}

export const POINT_VALUES: PointAction = {
  // Registration & Setup
  REGISTER: 5,
  COMPLETE_PROFILE_BASIC: 2,
  COMPLETE_PROFILE_FULL: 2,
  VERIFY_EMAIL: 2,
  VERIFY_PHONE: 2,
  UPLOAD_PROFILE_PHOTO: 2,
  
  // Events
  ATTEND_EVENT: 10,
  HOST_EVENT: 15,
  JOIN_TRIP: 12,
  CAFE_MEETUP: 8,
  ILM_EVENT: 10,
  VOLUNTEER: 12,
  DONATE: 5,
  
  // Connections & Social
  RECEIVE_VOUCH: 8,
  GIVE_TRUST_MOMENT: 2,
  RECEIVE_POSITIVE_TRUST_MOMENT: 1,
  
  // Community
  JOIN_COMMUNITY: 3,
  POST_IN_COMMUNITY: 2,
  REACT_TO_COMMUNITY_POST: 1,
  
  // Referrals
  REFERRAL: 3,
  
  // Marketplace
  CREATE_LISTING: 5,
  PURCHASE_ITEM: 3,
  SELL_ITEM: 8,
  LEAVE_REVIEW: 2,
  RECEIVE_POSITIVE_REVIEW: 5,
  
  // BerseGuide
  BECOME_GUIDE: 20,
  COMPLETE_GUIDE_SESSION: 15,
  RECEIVE_GUIDE_REVIEW: 3,
  BOOK_GUIDE_SESSION: 5,
  
  // HomeSurf
  LIST_HOME: 10,
  HOST_TRAVELER: 20,
  STAY_AS_TRAVELER: 15,
  LEAVE_HOST_REVIEW: 3,
  RECEIVE_HOST_REVIEW: 5,
  
  // Card Game (Topic Feedback)
  SUBMIT_TOPIC_FEEDBACK: 3,
  RECEIVE_HELPFUL_VOTE: 1,
  REPLY_TO_FEEDBACK: 2,
  
  // NOTE: Penalties removed - they affect TRUST SCORE, not points
  // Points are only positive (for rewards/redemption)
  // Trust score penalties handled in TrustScoreService
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}