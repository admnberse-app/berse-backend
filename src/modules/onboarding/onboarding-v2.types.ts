/**
 * Types for Two-Phase Onboarding System
 */

/**
 * Button configuration for app preview screens
 */
export interface ButtonConfig {
  text: string;
  action: string; // "next" | "skip" | "get_started" | "sign_in" | "learn_more" | custom
  style?: 'primary' | 'secondary' | 'text' | 'outline';
  icon?: string; // Icon name (e.g., "arrow-right", "forward", "rocket")
  textColor?: string;
  backgroundColor?: string;
}

/**
 * App Preview Screen with dual button support
 */
export interface AppPreviewScreen {
  id: string;
  screenOrder: number;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  animationUrl?: string;
  iconName?: string;
  
  // Legacy single button (for backward compatibility)
  ctaText?: string;
  ctaAction?: string;
  
  // New dual button support
  primaryButton?: ButtonConfig;
  secondaryButton?: ButtonConfig;
  
  backgroundColor?: string;
  textColor?: string;
  isSkippable: boolean;
  isActive: boolean;
  metadata?: any;
}

/**
 * User Setup Screen types
 */
export enum UserSetupScreenType {
  PROFILE = 'PROFILE',
  NETWORK = 'NETWORK',
  COMMUNITY = 'COMMUNITY',
  NOTIFICATION = 'NOTIFICATION',
  TUTORIAL = 'TUTORIAL',
  VERIFICATION = 'VERIFICATION',
}

export interface UserSetupScreen {
  id: string;
  screenOrder: number;
  screenType: UserSetupScreenType;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  iconName?: string;
  ctaText?: string;
  ctaAction?: string;
  ctaUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  isRequired: boolean;
  isSkippable: boolean;
  requiredFields?: string[];
  metadata?: any;
}

/**
 * Analytics tracking types
 */
export interface TrackAppPreviewActionRequest {
  screenId: string;
  action: 'view' | 'complete' | 'skip';
  sessionId?: string;
  timeSpentSeconds?: number;
  deviceInfo?: any;
  appVersion?: string;
}

export interface TrackUserSetupActionRequest {
  screenId: string;
  action: 'view' | 'complete' | 'skip';
  timeSpentSeconds?: number;
  actionsTaken?: any;
  deviceInfo?: any;
  appVersion?: string;
}
