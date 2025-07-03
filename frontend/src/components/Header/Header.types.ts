export type HeaderState = 'Home' | 'BerseConnect' | 'BerseMatch' | 'Profile';

export interface HeaderProps {
  /** Current header state */
  state?: HeaderState;
  /** Header title */
  title?: string;
  /** Whether to show back button */
  showBackButton?: boolean;
  /** Whether to show back button (alias) */
  showBack?: boolean;
  /** Back button click handler */
  onBackClick?: () => void;
  /** Back button click handler (alias) */
  onBackPress?: () => void;
  /** Notification icon click handler */
  onNotificationClick?: () => void;
  /** Menu icon click handler */
  onMenuClick?: () => void;
  /** Whether to show notifications */
  showNotifications?: boolean;
  /** Notification count */
  notificationCount?: number;
  /** Points to display */
  points?: number;
}