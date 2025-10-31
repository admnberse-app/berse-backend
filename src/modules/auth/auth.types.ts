export interface DeviceInfo {
  deviceId?: string;        // Unique device identifier (UUID)
  deviceName?: string;      // e.g., "John's iPhone", "Samsung Galaxy S23"
  deviceType?: 'ios' | 'android' | 'web' | 'desktop';  // Platform
  osVersion?: string;       // e.g., "iOS 17.0", "Android 14"
  appVersion?: string;      // e.g., "1.2.3"
  pushToken?: string;       // FCM/APNs token for push notifications
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  timezone?: string;
}

export interface RegisterRequest {
  email: string;
  phone?: string;
  dialCode?: string;
  password: string;
  fullName: string;
  username?: string;
  nationality?: string;
  countryOfResidence?: string;
  city?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfBirth?: string;
  referralCode?: string;
  // Optional device and location data
  deviceInfo?: DeviceInfo;
  locationInfo?: LocationInfo;
}

export interface LoginRequest {
  email: string;
  password: string;
  // Optional device and location data
  deviceInfo?: DeviceInfo;
  locationInfo?: LocationInfo;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
    role: string;
    membershipId?: string;
    referralCode: string;
    totalPoints: number;
  };
  token: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
