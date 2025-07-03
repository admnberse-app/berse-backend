# BerseMuka App Design System

## Color Palette

### Primary Colors
- **Deep Green**: `#1C5B46` - Primary brand color used for buttons, headers, and key UI elements
  - Tint 1: `#4E7F6F`
  - Tint 2: `#80A398`
  - Tint 3: `#B3C8C1`
  - Tint 4: `#E5ECEA`

### Secondary Colors
- **Muted Navy**: `#3D4C74` - Secondary color for accents and contrast
  - Tint 1: `#687392`
  - Tint 2: `#939BB1`
  - Tint 3: `#BEC3D0`
  - Tint 4: `#E9EBEF`

### Accent Colors
- **Earthy Red**: `#A63B35` - Used for highlights and special elements
  - Tint 1: `#B96661`
  - Tint 2: `#CD928E`
  - Tint 3: `#E1BDBB`
  - Tint 4: `#F5E9E8`

### Neutral Colors
- **Warm Cream**: `#F9F3E3` - Main background color
  - Tint 1: `#FAF5E9`
  - Tint 2: `#FBF8EF`
  - Tint 3: `#FDFBF5`
  - Tint 4: `#FEFDFB`
- **White**: `#FFFFFF` - Card backgrounds and content areas
- **Gray**: `#87928F` - Muted text and secondary elements
- **Dark Gray**: `#404040` - Primary text color

### Special Gradients
- **Points/Rewards Gradient**: Linear gradient from `#1C5B46` to `#3D4C74`

## Typography

### Font Family
- **Primary Font**: Poppins (Google Fonts)
  - Weights: 500 (Medium), 700 (Bold)

### Font Sizes
- **Display**: 64px (Bold) - Major headings
- **Heading**: 18px (Medium) - Section headers
- **Body**: 15px (Medium) - Primary content
- **Small**: 13px (Medium) - Secondary text and labels

### Line Heights
- Display: 1.5em
- Heading: 1.4em
- Body: 1.3em
- Small: 1.2em

## Components

### Buttons
**Variants:**
- Primary/Secondary
- Green color scheme
- Normal/Small sizes

**Styles:**
- Primary Button:
  - Background: `#1C5B46`
  - Text: White
  - Border Radius: 10px
  - Padding: 16px

- Secondary Button:
  - Background: Transparent
  - Border: 1px solid `#1C5B46`
  - Text: `#1C5B46`
  - Border Radius: 8px
  - Padding: 12px 11px

### Navigation
**Main Navigation Bar:**
- Height: 103px
- Background: White with gradient overlay
- States: Home, BerseConnect, BerseMatch, Profile

**Header Component:**
- Height: Varies by content
- Background: Transparent
- States: Home, BerseConnect, BerseMatch, Profile

### Cards and Containers
- Background: White (`#FFFFFF`)
- Border Radius: 12px
- Padding: 24px
- Shadow: None (clean design)

### Status Bar
- iPhone 16 style
- Light mode
- Height: 50px

## Screens

### 1. Splash Screen
- Background: `#F9F3E3`
- Logo centered
- Primary CTA button
- "New user? Create Account" link

### 2. Login Screen
- Background: `#F9F3E3`
- Input fields with white background
- Primary login button
- Social login options

### 3. Register Screen
- Background: `#F9F3E3`
- Multiple input fields
- Terms acceptance checkbox
- Primary register button

### 4. Dashboard (Home)
- Background: `#F9F3E3`
- Points/rewards card with gradient
- Events carousel
- Match suggestions section
- "Explore Community" link

### 5. BerseConnect
- Background: `#F9F3E3`
- Filter component
- Search field
- Event listings
- Grid/list view toggle

### 6. BerseMatch
- Background: `#F9F3E3`
- Profile cards layout
- Swipe interaction ready
- Filter options

### 7. Profile
- Background: `#F9F3E3`
- Profile details section
- Points and achievements
- Settings access

## Layout Guidelines

### Screen Dimensions
- Width: 393px (iPhone 15 Pro)
- Safe area considerations for status bar and navigation

### Spacing System
- 1px: Thin lines
- 2px: Thick lines
- 4px: Half-small spacing
- 6px: Smaller spacing
- 8px: Small spacing
- 12px: Half-medium spacing
- 16px: Medium spacing
- 24px: Large spacing
- 32px: Extra-large spacing
- 40px: Largest spacing

### Border Radius
- Small: 8px
- Medium: 10px
- Large: 12px
- Extra Large: 16px
- Full: 30px (for major containers)

## Visual Elements

### Decorative Elements
- Elliptical background shapes with opacity 0.45
- Gradient overlays for depth
- Clean, minimalist aesthetic

### Icons
- Style: Outlined
- Stroke Width: 1.75px
- Color: Matches context (usually `#1C5B46`)
- Size: 24x24px standard

## Animation Guidelines
- Smooth transitions between screens
- Subtle fade-ins for content loading
- Spring animations for interactive elements
- 300ms standard duration for most transitions

## Accessibility
- High contrast between text and backgrounds
- Minimum touch target size: 44x44px
- Clear visual hierarchy
- Consistent navigation patterns