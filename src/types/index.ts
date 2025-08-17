import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface PointAction {
  REGISTER: number;
  ATTEND_EVENT: number;
  HOST_EVENT: number;
  REFERRAL: number;
  JOIN_TRIP: number;
  CAFE_MEETUP: number;
  ILM_EVENT: number;
  VOLUNTEER: number;
  DONATE: number;
}

export const POINT_VALUES: PointAction = {
  REGISTER: 30,    // Welcome bonus for new users
  ATTEND_EVENT: 10,
  HOST_EVENT: 15,
  REFERRAL: 10,    // Increased referral bonus
  JOIN_TRIP: 5,
  CAFE_MEETUP: 2,
  ILM_EVENT: 3,
  VOLUNTEER: 6,
  DONATE: 4
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}