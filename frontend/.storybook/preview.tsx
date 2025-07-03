import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../src/theme';
import { GlobalStyles } from '../src/theme/GlobalStyles';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  layout: 'centered',
  backgrounds: {
    default: 'warm-cream',
    values: [
      {
        name: 'warm-cream',
        value: '#F9F3E3',
      },
      {
        name: 'white',
        value: '#FFFFFF',
      },
      {
        name: 'deep-green',
        value: '#1C5B46',
      },
    ],
  },
};

export const decorators = [
  (Story) => (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div style={{ padding: '20px', minHeight: '100px' }}>
        <Story />
      </div>
    </ThemeProvider>
  ),
];