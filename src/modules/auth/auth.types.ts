export interface RegisterRequest {
  email: string;
  phone?: string;
  password: string;
  fullName: string;
  username?: string;
  nationality?: string;
  countryOfResidence?: string;
  city?: string;
  gender?: 'male' | 'female';
  dateOfBirth?: string;
  referralCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
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
