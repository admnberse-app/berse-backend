import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  /** Button color scheme */
  color?: 'green';
  /** Button size */
  size?: 'normal' | 'small' | 'large';
  /** Button content */
  children: ReactNode;
  /** Whether button is full width */
  fullWidth?: boolean;
  /** Whether button is loading */
  loading?: boolean;
}