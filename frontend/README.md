# BerseMuka App UI Component Library

A comprehensive React component library built with TypeScript and styled-components for the BerseMuka App. This library implements a pixel-perfect design system based on the Figma designs.

## 🎨 Design System

### Colors
- **Deep Green** (Primary): `#1C5B46` and variants
- **Muted Navy**: `#3D4C74` and variants  
- **Earthy Red**: `#A63B35` and variants
- **Warm Cream** (Background): `#F9F3E3` and variants
- **Neutral**: White, black, grays

### Typography
- **Font**: Poppins
- **Weights**: 400, 500, 600, 700
- **Sizes**: 12px to 64px

### Spacing
Consistent spacing scale from 1px to 40px

## 📦 Components

### Button
Primary action component with variants:
- **Variants**: Primary, Secondary
- **Sizes**: Normal, Small
- **States**: Default, Hover, Active, Disabled, Loading

```tsx
<Button variant="primary" size="normal" fullWidth>
  Login
</Button>
```

### StatusBar
iOS-style status bar for mobile app header:
```tsx
<StatusBar time="3:14 PM" darkMode={false} />
```

### Header
App header with navigation states:
- **States**: Home, BerseConnect, BerseMatch, Profile
```tsx
<Header 
  state="Home"
  onMenuClick={handleMenu}
  onNotificationClick={handleNotifications}
/>
```

### MainNav
Bottom navigation with 4 tabs:
```tsx
<MainNav 
  activeTab="Home"
  onTabClick={handleTabChange}
/>
```

### TextField
Form input component with validation:
```tsx
<TextField
  label="Email"
  type="email"
  required
  error="Please enter a valid email"
  fullWidth
/>
```

### Card
Flexible container component:
```tsx
<Card variant="default" clickable onClick={handleClick}>
  {/* Card content */}
</Card>
```

### Points
Points display with optional rewards link:
```tsx
<Points 
  points={2450}
  size="large"
  showCard
  showRewardsLink
/>
```

## 🚀 Getting Started

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
# Run Storybook
npm run storybook

# Build library
npm run build

# Type checking
npm run typecheck
```

### Usage in Your App

```tsx
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme, GlobalStyles, Button, Card } from 'bersemuka-ui';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Card>
        <h1>Welcome to BerseMuka</h1>
        <Button variant="primary">Get Started</Button>
      </Card>
    </ThemeProvider>
  );
}
```

## 📱 Mobile-First Design

All components are designed for mobile devices with a viewport of 393x852px (iPhone 16 dimensions). The design system ensures consistent spacing, typography, and interactions across all components.

## 🎯 Key Features

- **TypeScript Support**: Full type safety and IntelliSense
- **Styled Components**: CSS-in-JS with theme support
- **Storybook Integration**: Interactive component documentation
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized bundle size and lazy loading

## 📚 Storybook

View all components and their variations in Storybook:
```bash
npm run storybook
```

Storybook provides:
- Interactive component playground
- Props documentation
- Usage examples
- Design system tokens

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── Button/
│   │   ├── StatusBar/
│   │   ├── Header/
│   │   ├── MainNav/
│   │   ├── TextField/
│   │   ├── Card/
│   │   └── Points/
│   ├── theme/           # Design system tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── borders.ts
│   │   ├── effects.ts
│   │   └── index.ts
│   └── index.ts         # Main exports
├── .storybook/          # Storybook configuration
└── package.json
```

## 🔧 Development Guidelines

1. **Component Structure**: Each component has its own folder with:
   - `Component.tsx` - Implementation
   - `Component.types.ts` - TypeScript interfaces
   - `Component.stories.tsx` - Storybook stories
   - `index.ts` - Exports

2. **Styling**: Use styled-components with theme tokens
3. **Props**: Document all props with JSDoc comments
4. **Testing**: Write stories for all component states
5. **Accessibility**: Include ARIA labels and keyboard support

## 📝 License

Internal use only for BerseMuka App.