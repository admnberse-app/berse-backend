/**
 * BerseMuka App Spacing System
 * Based on Figma design tokens
 */

export const Spacing = {
  thin: 1,           // 001px
  thick: 2,          // 002px
  halfSmall: 4,      // 004px
  smaller: 6,        // 006px
  small: 8,          // 008px
  halfMedium: 12,    // 012px
  medium: 16,        // 016px
  large: 24,         // 024px
  extraLarge: 32,    // 032px
  largest: 40,       // 040px
} as const;

export const BorderRadius = {
  small: 8,
  medium: 10,
  large: 12,
  extraLarge: 16,
  round: 999,
} as const;

export type SpacingType = typeof Spacing;
export type BorderRadiusType = typeof BorderRadius;