import { ReactNode } from 'react';

export interface CardProps {
  /** Card content */
  children?: ReactNode;
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card description */
  description?: string;
  /** Card action component */
  action?: ReactNode;
  /** Card variant */
  variant?: 'default' | 'gradient';
  /** Whether card is clickable */
  clickable?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Padding size */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Whether to show shadow */
  shadow?: boolean;
  /** Style prop for custom styles */
  style?: React.CSSProperties;
}