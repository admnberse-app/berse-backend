# BerseMuka App Component Library

## Overview
This document provides implementation guidelines for all UI components in the BerseMuka App based on the Figma design system.

## Components

### 1. Button Component

#### Primary Button
```jsx
<button className="btn-primary">
  Get Started
</button>
```

**Properties:**
- Background: `#1C5B46` (Deep Green)
- Text Color: White
- Border Radius: 10px
- Padding: 16px
- Font: Poppins Medium 15px
- Hover: Background changes to `#4E7F6F`

#### Secondary Button
```jsx
<button className="btn-secondary">
  Learn More
</button>
```

**Properties:**
- Background: Transparent
- Border: 1px solid `#1C5B46`
- Text Color: `#1C5B46`
- Border Radius: 8px
- Padding: 12px 11px
- Font: Poppins Medium 13px
- Hover: Background becomes `#1C5B46`, text becomes white

### 2. Navigation Components

#### Main Navigation Bar
```jsx
<nav className="main-nav">
  <div className="nav-item active">Home</div>
  <div className="nav-item">BerseConnect</div>
  <div className="nav-item">BerseMatch</div>
  <div className="nav-item">Profile</div>
</nav>
```

**Properties:**
- Height: 103px
- Background: White with gradient overlay
- Active state: Icon and text in `#1C5B46`
- Inactive state: Icon and text in `#87928F`

#### Header Component
```jsx
<header className="app-header">
  <button className="menu-toggle">☰</button>
  <h1 className="header-title">{screenTitle}</h1>
  <button className="notification-bell">🔔</button>
</header>
```

**Properties:**
- Background: Transparent
- Title: Poppins Medium 18px, color `#1C5B46`
- Icons: 24x24px, stroke width 1.75px

### 3. Card Components

#### Basic Card
```jsx
<div className="card">
  <h3 className="card-title">Card Title</h3>
  <p className="card-content">Card content goes here</p>
</div>
```

**Properties:**
- Background: White
- Border Radius: 12px
- Padding: 24px
- Shadow: None (clean design)

#### Points Card (Gradient)
```jsx
<div className="card card-gradient">
  <div className="points-value">1,250</div>
  <div className="points-label">Total Points</div>
  <a href="#" className="points-link">See Points & Rewards →</a>
</div>
```

**Properties:**
- Background: Linear gradient from `#1C5B46` to `#3D4C74`
- Text Color: White
- Border Radius: 12px
- Padding: 22px 24px 0px

### 4. Form Components

#### Text Input
```jsx
<div className="input-group">
  <label className="input-label">Email</label>
  <input type="email" className="input-field" placeholder="Enter your email" />
</div>
```

**Properties:**
- Background: White
- Border: 1px solid `#E2E9E7`
- Border Radius: 10px
- Padding: 11.5px 13px
- Height: 40px
- Font: Poppins Medium 15px

#### Checkbox
```jsx
<label className="checkbox-container">
  <input type="checkbox" className="checkbox-input" />
  <span className="checkbox-mark"></span>
  <span className="checkbox-label">I agree to terms</span>
</label>
```

### 5. Icon Components

All icons should be:
- Size: 24x24px
- Style: Outlined
- Stroke Width: 1.75px
- Color: Context-dependent (usually `#1C5B46`)

Available icons:
- share-2
- settings
- life-buoy (help)
- calendar
- gift

### 6. Status Bar Component
```jsx
<div className="status-bar">
  <div className="status-time">3:14</div>
  <div className="status-indicators">
    <span className="signal">📶</span>
    <span className="wifi">📡</span>
    <span className="battery">🔋</span>
  </div>
</div>
```

**Properties:**
- Height: 50px
- Background: Gradient fade from `#F9F3E3` to transparent
- Font: System default

### 7. Filter Component
```jsx
<div className="filter-bar">
  <button className="filter-chip active">All</button>
  <button className="filter-chip">Nearby</button>
  <button className="filter-chip">Popular</button>
  <button className="filter-chip">New</button>
</div>
```

**Properties:**
- Background: White
- Border Radius: 10px
- Active chip: Background `#1C5B46`, text white
- Inactive chip: Background transparent, text `#87928F`

### 8. Event Card Component
```jsx
<div className="event-card">
  <img src="event-image.jpg" className="event-image" />
  <div className="event-details">
    <h3 className="event-title">Community Meetup</h3>
    <p className="event-date">Dec 25, 2024</p>
    <p className="event-location">Downtown Center</p>
    <div className="event-attendees">
      <span className="attendee-count">25 attending</span>
    </div>
  </div>
</div>
```

### 9. Profile Card Component
```jsx
<div className="profile-card">
  <img src="profile.jpg" className="profile-image" />
  <h3 className="profile-name">John Doe</h3>
  <p className="profile-bio">Passionate about community building</p>
  <div className="profile-tags">
    <span className="tag">Volunteer</span>
    <span className="tag">Organizer</span>
  </div>
</div>
```

### 10. Side Menu Component
```jsx
<div className="side-menu">
  <div className="menu-header">
    <img src="profile.jpg" className="menu-profile-pic" />
    <h3 className="menu-username">John Doe</h3>
  </div>
  <nav className="menu-items">
    <a href="#" className="menu-item">
      <span className="menu-icon">📅</span>
      <span className="menu-label">Events</span>
    </a>
    <a href="#" className="menu-item">
      <span className="menu-icon">🎁</span>
      <span className="menu-label">Rewards</span>
    </a>
    <a href="#" className="menu-item">
      <span className="menu-icon">⚙️</span>
      <span className="menu-label">Settings</span>
    </a>
    <a href="#" className="menu-item">
      <span className="menu-icon">❓</span>
      <span className="menu-label">Help</span>
    </a>
  </nav>
</div>
```

**Properties:**
- Width: 80% of screen
- Background: White
- Border Radius: 16px 0px 0px 16px
- Overlay: `rgba(64, 64, 64, 0.6)`

## Layout Guidelines

### Screen Container
```jsx
<div className="screen-container">
  <StatusBar />
  <Header />
  <main className="screen-content">
    {/* Screen specific content */}
  </main>
  <Navigation />
</div>
```

### Content Spacing
- Use the spacing variables consistently:
  - Between sections: `--spacing-large` (24px)
  - Between elements: `--spacing-medium` (16px)
  - Inside components: `--spacing-small` (8px)

### Responsive Considerations
- Design is optimized for iPhone 15 Pro (393x852px)
- Safe areas:
  - Top: 50px (status bar)
  - Bottom: 103px (navigation)
- Content should be contained within these safe areas

## Animation Guidelines

### Transitions
```css
.element {
  transition: all var(--transition-normal);
}
```

- Fast transitions (150ms): Hover effects, small state changes
- Normal transitions (300ms): Most animations
- Slow transitions (500ms): Page transitions, large state changes

### Common Animations
1. **Fade In**: opacity 0 to 1
2. **Slide Up**: translateY(20px) to translateY(0)
3. **Scale**: scale(0.95) to scale(1)
4. **Spring**: Use cubic-bezier(0.68, -0.55, 0.265, 1.55)

## Accessibility

### Focus States
All interactive elements should have visible focus states:
```css
.interactive-element:focus {
  outline: 2px solid var(--color-deep-green);
  outline-offset: 2px;
}
```

### Touch Targets
- Minimum size: 44x44px
- Add padding if visual size is smaller

### Color Contrast
- Text on light backgrounds: Use `--color-dark-gray` (#404040)
- Text on dark backgrounds: Use white
- Important text on cream background: Use `--color-deep-green`

## Implementation Notes

1. **Import Design Tokens**: Always start by importing the design tokens CSS file
2. **Use CSS Variables**: Reference color and spacing values using CSS variables
3. **Component Structure**: Follow the HTML structure provided in examples
4. **Semantic HTML**: Use appropriate HTML elements for accessibility
5. **Mobile First**: Design is mobile-first, optimize for touch interactions