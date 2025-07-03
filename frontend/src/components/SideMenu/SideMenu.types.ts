export interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  badge?: number;
}