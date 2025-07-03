export type NavTab = 'Home' | 'BerseConnect' | 'BerseMatch' | 'Profile' | 'home' | 'connect' | 'match' | 'profile';

export interface MainNavProps {
  /** Currently active tab */
  activeTab?: NavTab | string;
  /** Tab click handler */
  onTabClick?: (tab: NavTab) => void;
  /** Tab press handler (alias) */
  onTabPress?: (tab: string) => void;
}