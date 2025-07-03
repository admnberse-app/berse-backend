/**
 * BerseMuka App Typography System
 * Based on Figma design tokens
 */

export const Typography = {
  // Headings
  heading1: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: '64px',
    lineHeight: '96px',
  },
  
  heading2: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: '48px',
    lineHeight: '72px',
  },
  
  heading3: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: '32px',
    lineHeight: '48px',
  },
  
  heading4: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: '24px',
    lineHeight: '36px',
  },
  
  // Body Text
  bodyLarge: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: '18px',
    lineHeight: '25.2px',
  },
  
  bodyMedium: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: '15px',
    lineHeight: '19.5px',
  },
  
  bodySmall: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: '13px',
    lineHeight: '15.6px',
  },
  
  // Captions
  caption: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: '12px',
    lineHeight: '16px',
  },
  
  // Buttons
  button: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: '16px',
    lineHeight: '24px',
  },
  
  buttonSmall: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: '14px',
    lineHeight: '20px',
  },
} as const;

export type TypographyStyle = typeof Typography;