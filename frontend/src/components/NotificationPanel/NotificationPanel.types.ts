export interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notificationCount?: number;
}