export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  profession?: string;
  age?: number;
  location?: string;
  interests?: string[];
  points?: number;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  address?: string;
  hostId: string;
  hostName: string;
  hostInitials: string;
  maxParticipants: number;
  participantCount: number;
  participants?: User[];
  requirements?: string[];
  pointsReward: number;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirements: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'product' | 'experience' | 'digital';
  image?: string;
  isAvailable: boolean;
}

export interface UserStats {
  totalPoints: number;
  eventsAttended: number;
  eventsHosted: number;
  connectionsMade: number;
  level: number;
  badges: Badge[];
}