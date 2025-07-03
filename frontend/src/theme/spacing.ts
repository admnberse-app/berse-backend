export const spacing = {
  // Base spacing values from Figma
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  
  // Additional spacing for layouts
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  
  // Layout-specific spacing
  layoutPadding: {
    mobile: '20px',
    card: '24px',
  },
  
  // Gap spacing
  gap: {
    xs: '10px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  
  // Named spacing for consistency
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;