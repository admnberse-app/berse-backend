/**
 * BerseMuka App Color System
 * Based on Figma design tokens
 */

export const Colors = {
  // Primary Colors - Deep Green
  deepGreen: {
    primary: '#1C5B46',
    shade1: '#4E7F6F',
    shade2: '#80A398',
    shade3: '#B3C8C1',
    shade4: '#E5ECEA',
  },
  
  // Secondary Colors - Muted Navy
  mutedNavy: {
    primary: '#3D4C74',
    shade1: '#687392',
    shade2: '#939BB1',
    shade3: '#BEC3D0',
    shade4: '#E9EBEF',
  },
  
  // Accent Colors - Earthy Red
  earthyRed: {
    primary: '#A63B35',
    shade1: '#B96661',
    shade2: '#CD928E',
    shade3: '#E1BDBB',
    shade4: '#F5E9E8',
  },
  
  // Neutral Colors - Warm Cream
  warmCream: {
    primary: '#F9F3E3',
    shade1: '#FAF5E9',
    shade2: '#FBF8EF',
    shade3: '#FDFBF5',
    shade4: '#FEFDFB',
  },
  
  // UI Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Text Colors
  text: {
    primary: '#404040',
    secondary: '#87928F',
    light: '#B0B0B0',
  },
  
  // Background Colors
  background: {
    primary: '#F9F3E3', // Warm cream primary
    secondary: '#FFFFFF',
    overlay: 'rgba(64, 64, 64, 0.6)',
    gradient: ['#1C5B46', '#3D4C74'], // Deep green to muted navy
  },
  
  // UI Elements
  ui: {
    border: '#E2E9E7',
    shadow: 'rgba(0, 0, 0, 0.1)',
    disabled: '#CCCCCC',
    error: '#A63B35',
    success: '#1C5B46',
  },
} as const;

export type ColorScheme = typeof Colors;