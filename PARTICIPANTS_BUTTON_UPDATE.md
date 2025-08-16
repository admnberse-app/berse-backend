# Participants Button Update

## Overview
Added a unified participants viewing system for all events, including sports events like BerseMinton.

## Changes Made

### 1. Event Card Enhancement
- **Added "👥 View" button** on every event card
- Shows participant count dynamically
- Button styled with green border and hover effect
- Positioned next to share button for easy access

### 2. Unified Participants Modal
Created `UnifiedParticipants` component that handles:
- **Regular Events**: Shows simple participant list with join timestamps
- **Sports Events** (BerseMinton): Shows detailed registration info with:
  - Payment status (Confirmed/Pending)
  - Session packages purchased
  - Total revenue collected
  - Filtering by status

### 3. Real-time Participant Count
- Button shows actual participant count from localStorage
- Updates automatically when new participants join
- Separate tracking for:
  - Regular events: `event_joins_${eventId}`
  - Sports events: `berseMintonRegistrations`

## User Experience

### For Event Attendees
1. See participant count directly on event card
2. Click "👥 View" to see who's attending
3. View detailed participant list with join times

### For Sports Event Organizers  
1. See registration count on event card
2. Click to view detailed participant info
3. Filter by payment status
4. Track total revenue collected

## Button Styling
```css
- Background: Light green (#f0f9f6)
- Border: Green (#2fce98)
- Text: Green with emoji
- Hover: Inverted colors (green bg, white text)
```

## Data Structure
Participants data stored in localStorage:
- Regular events: Array of participant objects with name, email, joinedAt
- Sports events: Array of registration objects with payment details

## Benefits
✅ Unified experience across all event types
✅ Quick participant overview without opening event
✅ Detailed filtering for sports events
✅ Revenue tracking for paid events
✅ Clean, consistent UI design