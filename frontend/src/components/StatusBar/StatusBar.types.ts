export interface StatusBarProps {
  /** Current time to display */
  time?: string;
  /** Whether to show dark mode */
  darkMode?: boolean;
  /** Whether to show the notch */
  showNotch?: boolean;
  /** Whether to show background */
  showBackground?: boolean;
  /** iPhone model */
  iPhoneModel?: '16' | '15' | '14';
}