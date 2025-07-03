export const colors = {
  // Deep Green - Primary Brand Color
  deepGreen: {
    primary: '#1C5B46',
    secondary: '#4E7F6F',
    tertiary: '#80A398',
    quaternary: '#B3C8C1',
    quinary: '#E5ECEA',
  },
  
  // Muted Navy
  mutedNavy: {
    primary: '#3D4C74',
    secondary: '#687392',
    tertiary: '#939BB1',
    quaternary: '#BEC3D0',
    quinary: '#E9EBEF',
  },
  
  // Earthy Red
  earthyRed: {
    primary: '#A63B35',
    secondary: '#B96661',
    tertiary: '#CD928E',
    quaternary: '#E1BDBB',
    quinary: '#F5E9E8',
  },
  
  // Warm Cream - Background Colors
  warmCream: {
    primary: '#F9F3E3',
    secondary: '#FAF5E9',
    tertiary: '#FBF8EF',
    quaternary: '#FDFBF5',
    quinary: '#FEFDFB',
  },
  
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: '#87928F',
    darkGray: '#404040',
    lightGray: '#E2E9E7',
    200: '#E2E9E7',
    300: '#BEC3D0',
    400: '#939BB1',
    500: '#687392',
    600: '#3D4C74',
  },
  
  // Gradient
  gradient: {
    primaryToNavy: 'linear-gradient(135deg, #1C5B46 0%, #3D4C74 100%)',
    fadeToTransparent: 'linear-gradient(180deg, #F9F3E3 0%, rgba(249, 243, 227, 0) 100%)',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #1C5B46 0%, #3D4C74 100%)',
  },
  
  // Semantic colors for UI components
  primary: {
    main: '#1C5B46',
    light: '#4E7F6F',
    dark: '#0E3A2B',
  },
  
  background: {
    default: '#F9F3E3',
    paper: '#FFFFFF',
    hover: '#F0E9D8',
  },
  
  text: {
    primary: '#000000',
    secondary: '#87928F',
    disabled: '#BEC3D0',
  },
  
  divider: '#E2E9E7',
  
  common: {
    white: '#FFFFFF',
    black: '#000000',
  },
  
  error: {
    main: '#A63B35',
    light: '#E1BDBB',
  },
  
  success: {
    main: '#1C5B46',
    light: '#B3C8C1',
  },
  
  warning: {
    main: '#F5A623',
    light: '#FDD876',
  },
  
  info: {
    main: '#3D4C74',
    light: '#BEC3D0',
  },
  
  border: {
    light: '#E2E9E7',
    main: '#87928F',
  },
  
  // Legacy status for backward compatibility
  status: {
    error: '#A63B35',
    success: '#1C5B46',
    warning: '#F5A623',
    info: '#3D4C74',
  },
} as const;