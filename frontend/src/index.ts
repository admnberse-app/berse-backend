// Theme exports
export * from './theme';
export { GlobalStyles } from './theme/GlobalStyles';

// Component exports
export * from './components/Button';
export * from './components/StatusBar';
export * from './components/Header';
export * from './components/MainNav';
export * from './components/TextField';
export * from './components/Card';
export * from './components/Points';

// Re-export styled-components utilities for consumers
export { ThemeProvider, styled, css, createGlobalStyle } from 'styled-components';