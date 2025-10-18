// ============================================================================
// QR CODE TYPES
// ============================================================================

export type QRCodePurpose = 'CONNECT' | 'CHECKIN';

export interface QRCodeGenerateRequest {
  purpose: QRCodePurpose;
  eventId?: string; // Required when purpose is CHECKIN
}

export interface QRCodePayload {
  userId: string;
  purpose: QRCodePurpose;
  eventId?: string;
  timestamp: number;
  exp: number;
  nonce: string;
}

export interface QRCodeGenerateResponse {
  qrData: string; // Encrypted JWT token
  purpose: QRCodePurpose;
  expiresAt: string; // ISO timestamp
  expiresIn: number; // Seconds until expiration
  userId: string;
  eventId?: string;
}

export interface QRCodeScanRequest {
  qrData: string;
}

export interface QRCodeScanResponse {
  valid: boolean;
  purpose: QRCodePurpose;
  userId: string;
  user: {
    id: string;
    fullName: string;
    username?: string;
    profilePicture?: string;
    trustLevel: string;
    trustScore: number;
  };
  eventId?: string;
  message: string;
}

export interface ConnectionScanResponse extends QRCodeScanResponse {
  connectionStatus: 'none' | 'pending' | 'connected' | 'blocked';
  connectionId?: string;
}

export interface CheckinScanResponse extends QRCodeScanResponse {
  event: {
    id: string;
    title: string;
    date: string;
  };
  ticket?: {
    id: string;
    status: string;
    tierName: string;
  };
  rsvp?: {
    id: string;
    status: string;
  };
  alreadyCheckedIn: boolean;
  checkinTime?: string;
}
