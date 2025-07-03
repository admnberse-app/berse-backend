export const typography = {
  fontFamily: {
    primary: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  
  fontWeight: {
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  
  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '15px',
    lg: '18px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '40px',
    '4xl': '64px',
  },
  
  lineHeight: {
    tight: '1.2',
    normal: '1.3',
    relaxed: '1.4',
    loose: '1.5',
  },
  
  // Typography variants
  display: {
    fontSize: '64px',
    fontWeight: 700,
    lineHeight: '1.2',
  },
  
  heading: {
    h1: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: '1.2',
    },
    h2: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: '1.3',
    },
    h3: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '1.3',
    },
  },
  
  body: {
    large: {
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: '1.5',
    },
    medium: {
      fontSize: '15px',
      fontWeight: 400,
      lineHeight: '1.5',
    },
    small: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: '1.4',
    },
  },
} as const;