import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* CSS Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Poppins font is imported in index.html */

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    
    @media (max-width: 375px) {
      font-size: 14px;
    }
    
    @media (max-width: 320px) {
      font-size: 13px;
    }
  }

  body {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.neutral.darkGray};
    background-color: ${({ theme }) => theme.colors.warmCream.primary};
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  }

  a {
    color: ${({ theme }) => theme.colors.deepGreen.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
    font-size: inherit;
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  input, textarea {
    font-family: inherit;
    font-size: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Mobile viewport */
  #root {
    min-height: 100vh;
    width: 100%;
    max-width: ${({ theme }) => theme.device.mobile.maxWidth};
    margin: 0 auto;
    position: relative;
    background-color: ${({ theme }) => theme.colors.warmCream.primary};
    
    @media (max-width: ${({ theme }) => theme.device.breakpoints.sm}) {
      max-width: 100%;
    }
  }

  /* Scanner animation */
  @keyframes scan {
    0% {
      top: 0;
    }
    50% {
      top: calc(100% - 2px);
    }
    100% {
      top: 0;
    }
  }
`;