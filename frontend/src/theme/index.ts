import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { borders } from './borders';
import { effects } from './effects';

export const theme = {
  colors,
  typography,
  spacing,
  borders,
  effects,
  
  // Device dimensions
  device: {
    mobile: {
      width: '393px',
      height: '852px',
    },
  },
  
  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 100,
    modal: 200,
    popover: 300,
    tooltip: 400,
    navbar: 500,
    statusBar: 600,
  },
} as const;

export type Theme = typeof theme;

// Re-export individual theme parts
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { borders } from './borders';
export { effects } from './effects';