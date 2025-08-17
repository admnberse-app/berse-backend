// QR Code Generation Utilities
import { Buffer } from 'buffer';

export interface UserQRData {
  id: string;
  userId: string;
  type: 'profile' | 'event_checkin' | 'voucher';
  timestamp: number;
  eventId?: string;
  voucherId?: string;
  points?: number;
}

export interface QRScanResult {
  success: boolean;
  data?: UserQRData;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    currentPoints: number;
    tier: string;
  };
  action?: {
    type: 'check_in' | 'points_award' | 'voucher_redeem';
    pointsChanged: number;
    newBalance: number;
    message: string;
  };
}

// Generate unique QR code ID for user
export const generateUserQRId = (userId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `BM-${userId}-${random}-${timestamp}`;
};

// Create QR data payload
export const createQRPayload = (data: UserQRData): string => {
  try {
    const jsonString = JSON.stringify(data);
    // Simple base64 encoding (in production, use encryption)
    const encoded = Buffer.from(jsonString).toString('base64');
    return encoded;
  } catch (error) {
    console.error('Error creating QR payload:', error);
    return '';
  }
};

// Decode QR data payload
export const decodeQRPayload = (encoded: string): UserQRData | null => {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const data = JSON.parse(decoded) as UserQRData;
    
    // Validate required fields
    if (!data.id || !data.userId || !data.type || !data.timestamp) {
      throw new Error('Invalid QR data structure');
    }
    
    // Check if QR is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - data.timestamp > maxAge) {
      throw new Error('QR code expired');
    }
    
    return data;
  } catch (error) {
    console.error('Error decoding QR payload:', error);
    return null;
  }
};

// Generate QR code data for user profile
export const generateUserProfileQR = (userId: string): string => {
  const qrData: UserQRData = {
    id: generateUserQRId(userId),
    userId,
    type: 'profile',
    timestamp: Date.now()
  };
  
  return createQRPayload(qrData);
};

// Generate QR code for event check-in
export const generateEventCheckInQR = (
  userId: string, 
  eventId: string, 
  points: number
): string => {
  const qrData: UserQRData = {
    id: generateUserQRId(userId),
    userId,
    type: 'event_checkin',
    timestamp: Date.now(),
    eventId,
    points
  };
  
  return createQRPayload(qrData);
};

// Validate QR code format
export const validateQRCode = (qrCode: string): boolean => {
  try {
    const data = decodeQRPayload(qrCode);
    return data !== null;
  } catch {
    return false;
  }
};

// Check if QR code is for event check-in
export const isEventCheckInQR = (qrData: UserQRData): boolean => {
  return qrData.type === 'event_checkin' && !!qrData.eventId;
};

// Check if user has already checked in (mock - replace with actual DB check)
export const hasUserCheckedIn = async (
  userId: string, 
  eventId: string
): Promise<boolean> => {
  // Check localStorage for now
  const checkIns = JSON.parse(localStorage.getItem('eventCheckIns') || '[]');
  return checkIns.some((c: any) => 
    c.userId === userId && c.eventId === eventId
  );
};

// Record check-in
export const recordCheckIn = async (
  userId: string,
  eventId: string,
  points: number,
  scannedBy: string
): Promise<void> => {
  const checkIns = JSON.parse(localStorage.getItem('eventCheckIns') || '[]');
  
  const checkIn = {
    id: `checkin-${Date.now()}`,
    userId,
    eventId,
    points,
    scannedBy,
    timestamp: new Date().toISOString()
  };
  
  checkIns.push(checkIn);
  localStorage.setItem('eventCheckIns', JSON.stringify(checkIns));
  
  // Update user points
  await awardPointsToUser(userId, points, 'event_attendance', eventId);
};

// Award points to user
export const awardPointsToUser = async (
  userId: string,
  points: number,
  type: string,
  referenceId?: string
): Promise<number> => {
  // Get current user data
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const currentPoints = userData.points || 0;
  const newBalance = currentPoints + points;
  
  // Update user points
  userData.points = newBalance;
  userData.totalPoints = (userData.totalPoints || 0) + points;
  localStorage.setItem('userData', JSON.stringify(userData));
  
  // Record transaction
  const transactions = JSON.parse(localStorage.getItem('pointsTransactions') || '[]');
  transactions.push({
    id: `trans-${Date.now()}`,
    userId,
    points,
    type,
    referenceId,
    timestamp: new Date().toISOString(),
    balance: newBalance
  });
  localStorage.setItem('pointsTransactions', JSON.stringify(transactions));
  
  return newBalance;
};

// Get user's current points
export const getUserPoints = (userId: string): number => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  return userData.points || 0;
};

// Calculate user tier based on points
export const calculateUserTier = (points: number): string => {
  if (points >= 2000) return 'platinum';
  if (points >= 500) return 'gold';
  if (points >= 100) return 'silver';
  return 'bronze';
};

// Format QR scan result for display
export const formatScanResult = (
  qrData: UserQRData,
  userData: any,
  pointsAwarded: number
): QRScanResult => {
  return {
    success: true,
    data: qrData,
    user: {
      id: userData.id,
      name: userData.fullName || userData.name,
      email: userData.email,
      profileImage: userData.profilePicture,
      currentPoints: getUserPoints(userData.id),
      tier: calculateUserTier(getUserPoints(userData.id))
    },
    action: {
      type: 'check_in',
      pointsChanged: pointsAwarded,
      newBalance: getUserPoints(userData.id),
      message: `Successfully checked in! +${pointsAwarded} points`
    }
  };
};