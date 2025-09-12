# Event Creation System Update

## Changes Made

### 1. Community Integration
- **Added community selection** to event creation screen
- Events must now be associated with one of two communities:
  - **Ahl 'Umran Network** - Global Islamic knowledge & spiritual development community
  - **PeaceMeal MY** - Malaysian community for sharing meals & building peace
- Community name appears as the **organization** field on event cards

### 2. UI Improvements
- **Removed preview button** from event creation screen for simpler flow
- **Fixed image cropping** aspect ratio (2.5:1) to match event card display
- Event images now display consistently between creation and listing

### 3. Event Data Structure
Events now include:
- `organization`: The community organizing the event
- `hosts`: Array of up to 5 hosts/co-hosts
- `whatsappGroup`: WhatsApp group link for the event

### 4. Participant Tracking
When users join events:
- Profile data is stored in localStorage
- Key format: `event_joins_${eventId}`
- Stores: name, email, joinedAt timestamp
- Prevents duplicate joins
- Accessible via "👥 Participants" button

### 5. Data Storage Structure

#### Event Join Data
```javascript
{
  id: 1234567890,
  name: "User Name",
  email: "user@email.com",
  joinedAt: "2025-08-16T08:00:00Z",
  eventId: "event-id",
  eventTitle: "Event Title"
}
```

#### Created Event Data
```javascript
{
  id: "unique-id",
  title: "Event Title",
  organization: "Ahl 'Umran Network", // or "PeaceMeal MY"
  hosts: ["Host 1", "Host 2", ...], // up to 5
  date: "2025-08-20",
  time: "14:00",
  location: "Kuala Lumpur",
  // ... other event fields
}
```

## How to Use

### Creating Events
1. Click the "+" button on BerseConnect screen
2. Fill in event details
3. **Select a community** (required)
4. Add up to 5 co-hosts
5. Upload and crop event image
6. Click "Create Event"

### Viewing Participants
1. Open any event on BerseConnect
2. Click "👥 Participants" button
3. View list of joined participants
4. For BerseMinton events: see payment status
5. For regular events: see join timestamps

### Storage Keys
- User created events: `userCreatedEvents`
- Event participants: `event_joins_${eventId}`
- All joins: `all_event_joins`
- BerseMinton registrations: `berseMintonRegistrations`

## Notes
- All data is stored in browser localStorage
- Data persists across sessions
- No backend required for basic functionality
- Ready for future backend integration