# Events API Documentation

## Overview
The Events API provides comprehensive endpoints for managing events, ticket sales, RSVPs, and attendance tracking. It supports both free and paid events with multi-tier ticket pricing, QR code-based check-ins, and real-time capacity management.

**Base URL:**
- **Production:** `https://api.berse-app.com/v2/events`
- **Development:** `http://localhost:3001/v2/events`

**Authentication:** Bearer token required for most endpoints

---

## Table of Contents
1. [Event Management](#event-management)
   - [Create Event](#create-event)
   - [Upload Event Image](#upload-event-image)
   - [Get Events (List)](#get-events-list)
   - [Get Event Details](#get-event-details)
   - [Update Event](#update-event)
   - [Delete Event](#delete-event)
   - [Get Event Types](#get-event-types)
2. [Ticket Tiers](#ticket-tiers)
   - [Create Ticket Tier](#create-ticket-tier)
   - [Get Ticket Tiers](#get-ticket-tiers)
   - [Update Ticket Tier](#update-ticket-tier)
3. [Ticket Purchase](#ticket-purchase)
   - [Purchase Ticket](#purchase-ticket)
   - [Get My Tickets](#get-my-tickets)
4. [Event Registration](#event-registration)
   - [Register for Event](#register-for-event)
   - [Cancel Registration](#cancel-registration)
   - [Get My Registrations](#get-my-registrations)
   - [Generate Participant QR Code](#generate-participant-qr-code)
5. [Attendance](#attendance)
   - [Check-In Attendee](#check-in-attendee)
   - [Get Event Attendees](#get-event-attendees)
6. [Event Discovery](#event-discovery)
   - [Get Trending Events](#get-trending-events)
   - [Get Nearby Events](#get-nearby-events)
   - [Get Recommended Events](#get-recommended-events)
   - [Get Events by Host](#get-events-by-host)
   - [Get My Community Events](#get-my-community-events)
   - [Get User Attended Events](#get-user-attended-events)
7. [Calendar Views](#calendar-views)
   - [Get Today's Events](#get-todays-events)
   - [Get Week Schedule](#get-week-schedule)
   - [Get Month Events](#get-month-events)
   - [Get Calendar Counts](#get-calendar-counts)
8. [Enums & Types](#enums--types)
9. [Error Codes](#error-codes)
10. [Examples](#examples)

---

## Event Management

### Create Event

Create a new event (free or paid).

**Endpoint:** `POST /v2/events`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Bersemuka Summer Meetup 2025",
  "description": "Join us for an amazing community gathering!",
  "type": "SOCIAL",
  "date": "2025-08-15T10:00:00Z",
  "location": "KLCC Convention Center, Kuala Lumpur",
  "mapLink": "https://maps.google.com/?q=KLCC",
  "maxAttendees": 200,
  "notes": "Bring your ID for check-in",
  "images": [
    "https://cdn.berse.com/events/summer-2025.jpg"
  ],
  "isFree": true,
  "currency": "MYR",
  "status": "DRAFT",
  "hostType": "PERSONAL",
  "communityId": "cm123456789"
}
```

**Field Validations:**
- `title` (required): 3-200 characters
- `description` (optional): Max 5000 characters
- `type` (required): See [EventType enum](#eventtype)
- `date` (required): Must be in the future
- `location` (required): 3-500 characters
- `mapLink` (optional): Valid URL
- `maxAttendees` (optional): Positive integer
- `isFree` (required): Boolean
- `currency` (optional): Default "MYR" (used for ticket tier pricing)
- `status` (optional): See [EventStatus enum](#eventstatus), default "DRAFT"
  - **Important:** Paid events (`isFree: false`) cannot be created with `status: PUBLISHED`. Create as DRAFT first, add ticket tiers, then publish.
- `hostType` (required): See [EventHostType enum](#eventhosttype)
- `communityId` (optional): Required if hostType is "COMMUNITY"
- `images` (optional): Array of image URLs (upload images first using [Upload Event Image](#upload-event-image) endpoint)

**Image Upload Workflow:**
1. First, upload your image using `POST /v2/events/upload-image` (see below)
2. Get the returned `imageUrl` from the upload response
3. Include the `imageUrl` in the `images` array when creating the event

**Pricing Model & Publishing Workflow:**
- **Free events:** Set `isFree: true`. Can publish immediately.
- **Paid events:**
  1. Create event with `isFree: false` and `status: DRAFT`
  2. Create ticket tiers using `POST /v2/events/ticket-tiers` (at least one required)
  3. Update event status to `PUBLISHED` using `PUT /v2/events/:id`
  
**Important:** Paid events cannot be published without at least one active ticket tier. This ensures all paid events have a clear pricing structure.

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Event created successfully",
  "data": {
    "id": "evt_cm123456789",
    "title": "Bersemuka Summer Meetup 2025",
    "description": "Join us for an amazing community gathering!",
    "type": "SOCIAL",
    "date": "2025-08-15T10:00:00.000Z",
    "location": "KLCC Convention Center, Kuala Lumpur",
    "mapLink": "https://maps.google.com/?q=KLCC",
    "maxAttendees": 200,
    "notes": "Bring your ID for check-in",
    "images": ["https://cdn.berse.com/events/summer-2025.jpg"],
    "isFree": true,
    "currency": "MYR",
    "status": "DRAFT",
    "hostType": "PERSONAL",
    "hostId": "usr_cm987654321",
    "host": {
      "id": "usr_cm987654321",
      "displayName": "John Doe",
      "profilePicture": "https://cdn.berse.com/users/john.jpg"
    },
    "communityId": "cm123456789",
    "community": {
      "id": "cm123456789",
      "name": "Bersemuka Malaysia",
      "imageUrl": "https://cdn.berse.com/communities/bm.jpg"
    },
    "attendeeCount": 0,
    "userRsvp": null,
    "userTicket": null,
    "createdAt": "2025-10-16T10:00:00.000Z",
    "updatedAt": "2025-10-16T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not authorized to create event in community

---

### Upload Event Image

Upload an image file for use in event creation or updates. Returns a CDN URL to include in the `images` array.

**Endpoint:** `POST /v2/events/upload-image`

**Authentication:** Required

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `image` field containing the image file

**Supported Formats:**
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

**File Size Limit:** 5MB

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Event image uploaded successfully",
  "data": {
    "imageUrl": "https://cdn.berse.com/events/abc123xyz.jpg"
  }
}
```

**Error Responses:**
- `400 Bad Request` - No file provided, invalid file type, or file too large
- `401 Unauthorized` - Invalid or missing token

**Example (cURL):**
```bash
# Upload image
curl -X POST https://api.berse-app.com/v2/events/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/event-photo.jpg"

# Response:
# {
#   "success": true,
#   "data": {
#     "imageUrl": "https://cdn.berse.com/events/cm12345.jpg"
#   }
# }

# Use the URL in event creation
curl -X POST https://api.berse-app.com/v2/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Event",
    "type": "SOCIAL",
    "date": "2025-12-01T10:00:00Z",
    "location": "Kuala Lumpur",
    "isFree": true,
    "hostType": "PERSONAL",
    "images": ["https://cdn.berse.com/events/cm12345.jpg"]
  }'
```

**Example (JavaScript):**
```javascript
// Upload image
const formData = new FormData();
formData.append('image', imageFile); // imageFile from file input

const uploadResponse = await fetch('https://api.berse-app.com/v2/events/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});

const { data } = await uploadResponse.json();
const imageUrl = data.imageUrl;

// Create event with uploaded image
const eventResponse = await fetch('https://api.berse-app.com/v2/events', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Event',
    type: 'SOCIAL',
    date: '2025-12-01T10:00:00Z',
    location: 'Kuala Lumpur',
    isFree: true,
    hostType: 'PERSONAL',
    images: [imageUrl]
  })
});
```

**Notes:**
- Images are automatically optimized for web delivery
- Uploaded images are stored on CDN for fast global access
- Image URLs are permanent and don't expire
- You can upload multiple images and use them in the `images` array (currently supporting 1 image, up to 10 planned)

---

### Get Events (List)

Get a paginated, filterable list of events. **When no events match the applied filters, the API automatically returns alternative upcoming published events as a fallback.**

**Endpoint:** `GET /v2/events`

**Authentication:** Optional (public endpoint, but shows user-specific data if authenticated)

**Note:** The list endpoint returns basic event data. Use `GET /v2/events/:id` for detailed event information including `isOwner`, `hasRsvped`, and `hasTicket` flags.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-based) |
| `limit` | number | No | 20 | Items per page (max: 100) |
| `sortBy` | string | No | date | Sort field: `date`, `createdAt`, `title` (Note: `price` sorting removed - use ticket tier filtering instead) |
| `sortOrder` | string | No | asc | Sort order: `asc`, `desc` |
| `type` | EventType | No | - | Filter by event type |
| `status` | EventStatus | No | - | Filter by status |
| `hostType` | EventHostType | No | - | Filter by host type |
| `isFree` | boolean | No | - | Filter free/paid events |
| `startDate` | ISO date | No | - | Filter events from this date |
| `endDate` | ISO date | No | - | Filter events until this date |
| `location` | string | No | - | Search by location (partial match) |
| `search` | string | No | - | Search in title and description |
| `communityId` | string | No | - | Filter by community |
| `hostId` | string | No | - | Filter by host user |

**Fallback Behavior:**
- When user's exact filters return no results, the API shows any upcoming published events as fallback
- Fallback applies only these base filters: `status=PUBLISHED` and `date>=today`
- All user filters (type, location, price, etc.) are removed in fallback
- Response includes `isFallback: true` and message changes to: **"No events match your filters. Showing upcoming events instead."**
- This ensures users are clearly informed when their filters don't match, while still seeing available events

**Examples:**
```
GET /v2/events?page=1&limit=20&type=SOCIAL&isFree=true
GET /v2/events?location=Kuala%20Lumpur&startDate=2025-08-01
GET /v2/events?search=summer&sortBy=date&sortOrder=asc
GET /v2/events?communityId=cm123456789&status=PUBLISHED
```

**Response (Normal):** `200 OK`
```json
{
  "status": "success",
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "id": "evt_cm123456789",
        "title": "Bersemuka Summer Meetup 2025",
        "description": "Join us for an amazing community gathering!",
        "type": "SOCIAL",
        "date": "2025-08-15T10:00:00.000Z",
        "location": "KLCC Convention Center, Kuala Lumpur",
        "images": ["https://cdn.berse.com/events/summer-2025.jpg"],
        "isFree": true,
        "currency": "MYR",
        "status": "PUBLISHED",
        "hostType": "PERSONAL",
        "attendeeCount": 45,
        "maxAttendees": 200,
        "host": {
          "id": "usr_cm987654321",
          "displayName": "John Doe",
          "profilePicture": "https://cdn.berse.com/users/john.jpg"
        },
        "community": {
          "id": "cm123456789",
          "name": "Bersemuka Malaysia"
        },
        "userRsvp": {
          "id": "rsvp_123",
          "createdAt": "2025-10-16T10:00:00.000Z"
        },
        "createdAt": "2025-10-16T10:00:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

**Response (Fallback):** `200 OK`
```json
{
  "status": "success",
  "message": "No events match your filters. Showing upcoming events instead.",
  "data": {
    "events": [
      {
        "id": "evt_cm999888777",
        "title": "Community Gathering",
        "description": "An upcoming event",
        "type": "SOCIAL",
        "date": "2025-10-20T10:00:00.000Z",
        "location": "Petaling Jaya",
        "isFree": true,
        "currency": "MYR",
        "status": "PUBLISHED",
        "hostType": "PERSONAL",
        "attendeeCount": 12,
        "maxAttendees": 50,
        "host": {
          "id": "usr_cm111222333",
          "displayName": "Jane Smith",
          "profilePicture": "https://cdn.berse.com/users/jane.jpg"
        },
        "createdAt": "2025-10-15T10:00:00.000Z"
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 20,
    "isFallback": true
  }
}
```

**Mobile UI Handling:**
- Check for `isFallback: true` in the response
- Display the message from the API: **"No events match your filters. Showing upcoming events instead."**
- Consider showing a banner or alert to make it clear these are alternative events, not exact matches
- Fallback shows any upcoming published events (all user filters removed)

---

### Get Event Details

Get detailed information about a specific event.

**Endpoint:** `GET /v2/events/:id`

**Authentication:** Optional (public endpoint, but shows user-specific data if authenticated)

**Path Parameters:**
- `id` (required): Event ID

**Response Fields:**
- **Basic Event Info:** title, description, type, date, location, pricing, status, etc.
- **Host & Community:** Full host and community details with images
- **Ticket Tiers:** All active ticket tiers with availability status
- **User-Specific Fields (when authenticated):**
  - `userParticipant` - User's EventParticipant record if registered
  - `userTicket` - User's ticket details if purchased
  - `hasTicket` - Boolean indicating if user has purchased a ticket
  - `isOwner` - Boolean indicating if authenticated user is the event creator
- **Participants Preview:** Recent participants with profile info and status
- **Attendees Preview:** Checked-in attendees with timestamps
- **Event Statistics:**
  - `totalParticipants` - Total registered participants (all statuses)
  - `totalCheckedIn` - Number of checked-in participants
  - `totalTicketsSold` - Number of tickets sold
  - `totalTicketTiers` - Number of ticket tiers
  - `attendanceRate` - Percentage of participants who checked in (0-100)

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Event retrieved successfully",
  "data": {
    "id": "evt_cm123456789",
    "title": "Bersemuka Summer Meetup 2025",
    "description": "Join us for an amazing community gathering! This is a full-day event with networking, workshops, and entertainment.",
    "type": "SOCIAL",
    "date": "2025-08-15T10:00:00.000Z",
    "location": "KLCC Convention Center, Kuala Lumpur",
    "mapLink": "https://maps.google.com/?q=KLCC",
    "maxAttendees": 200,
    "notes": "Bring your ID for check-in. Lunch will be provided.",
    "images": [
      "https://cdn.berse.com/events/summer-2025-1.jpg",
      "https://cdn.berse.com/events/summer-2025-2.jpg"
    ],
    "isFree": false,
    "currency": "MYR",
    "status": "PUBLISHED",
    "hostType": "COMMUNITY",
    "hostId": "usr_cm987654321",
    "host": {
      "id": "usr_cm987654321",
      "displayName": "John Doe",
      "profilePicture": "https://cdn.berse.com/users/john.jpg"
    },
    "communityId": "cm123456789",
    "community": {
      "id": "cm123456789",
      "name": "Bersemuka Malaysia",
      "imageUrl": "https://cdn.berse.com/communities/bm.jpg",
      "isVerified": true
    },
    "attendeeCount": 45,
    "ticketTiers": [
      {
        "id": "tier_123",
        "tierName": "Early Bird",
        "description": "Limited early bird pricing",
        "price": 35,
        "currency": "MYR",
        "totalQuantity": 50,
        "soldQuantity": 50,
        "availableQuantity": 0,
        "minPurchase": 1,
        "maxPurchase": 5,
        "availableFrom": "2025-07-01T00:00:00.000Z",
        "availableUntil": "2025-07-31T23:59:59.000Z",
        "isActive": false,
        "displayOrder": 1
      },
      {
        "id": "tier_124",
        "tierName": "General Admission",
        "description": "Standard ticket",
        "price": 50,
        "currency": "MYR",
        "totalQuantity": 150,
        "soldQuantity": 38,
        "availableQuantity": 112,
        "minPurchase": 1,
        "maxPurchase": 10,
        "availableFrom": "2025-07-01T00:00:00.000Z",
        "availableUntil": "2025-08-15T10:00:00.000Z",
        "isActive": true,
        "displayOrder": 2
      }
    ],
    "userParticipant": {
      "id": "cmgxe29zb0017cppi6ob1106q",
      "status": "REGISTERED",
      "createdAt": "2025-10-19T07:00:00.000Z",
      "checkedInAt": null
    },
    "userTicket": null,
    "hasTicket": false,
    "isOwner": false,
    "attendeesPreview": [
      {
        "id": "usr_abc123",
        "fullName": "Jane Smith",
        "username": "janesmith",
        "profilePicture": "https://cdn.berse.com/users/jane.jpg",
        "checkedInAt": "2025-08-15T10:30:00.000Z"
      }
    ],
    "participantsPreview": [
      {
        "id": "usr_def456",
        "fullName": "Bob Johnson",
        "username": "bjohnson",
        "profilePicture": "https://cdn.berse.com/users/bob.jpg",
        "createdAt": "2025-08-14T15:20:00.000Z",
        "status": "REGISTERED"
      }
    ],
    "stats": {
      "totalParticipants": 30,
      "totalCheckedIn": 20,
      "totalTicketsSold": 38,
      "totalTicketTiers": 2,
      "attendanceRate": 67
    },
    "createdAt": "2025-10-16T10:00:00.000Z",
    "updatedAt": "2025-10-16T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - Event not found

**Related Endpoints:**
- For full attendees list: `GET /v2/events/:id/attendees` (requires authentication and ownership)
- For full RSVP list: View through the attendees endpoint which includes all RSVPs

---

### Update Event

Update an existing event.

**Endpoint:** `PUT /v2/events/:id`

**Authentication:** Required (must be event host or admin)

**Publishing Paid Events:**
To publish a paid event (set status to `PUBLISHED`), the event must have at least one active ticket tier. Create ticket tiers using `POST /v2/events/ticket-tiers` before publishing.

**Validation:** The API will return a 400 error if you attempt to publish a paid event without ticket tiers.

**Path Parameters:**
- `id` (required): Event ID

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Event Title",
  "description": "Updated description",
  "date": "2025-08-20T10:00:00Z",
  "location": "New Location",
  "maxAttendees": 250,
  "status": "PUBLISHED",
  "images": ["https://cdn.berse.com/events/updated.jpg"]
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Event updated successfully",
  "data": {
    "id": "evt_cm123456789",
    "title": "Updated Event Title",
    // ... full event object
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not authorized to update this event
- `404 Not Found` - Event not found

---

### Delete Event

Delete an event (soft delete - sets status to CANCELED).

**Endpoint:** `DELETE /v2/events/:id`

**Authentication:** Required (must be event host or admin)

**Path Parameters:**
- `id` (required): Event ID

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Event deleted successfully",
  "data": null
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not authorized to delete this event
- `404 Not Found` - Event not found

---

### Get Event Types

Get all available event types for filtering and categorization.

**Endpoint:** `GET /v2/events/types`

**Authentication:** Not required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Event types retrieved successfully",
  "data": [
    {
      "value": "SOCIAL",
      "label": "Social"
    },
    {
      "value": "SPORTS",
      "label": "Sports"
    },
    {
      "value": "TRIP",
      "label": "Trip"
    },
    {
      "value": "ILM",
      "label": "Ilm"
    },
    {
      "value": "CAFE_MEETUP",
      "label": "Cafe Meetup"
    },
    {
      "value": "VOLUNTEER",
      "label": "Volunteer"
    },
    {
      "value": "MONTHLY_EVENT",
      "label": "Monthly Event"
    },
    {
      "value": "LOCAL_TRIP",
      "label": "Local Trip"
    }
  ]
}
```

**Use Cases:**
- Populate event type dropdowns in UI
- Filter events by type
- Display event categories

**Available Types:**
| Value | Label | Description |
|-------|-------|-------------|
| `SOCIAL` | Social | Social gatherings and meetups |
| `SPORTS` | Sports | Sports activities and competitions |
| `TRIP` | Trip | Travel and trips |
| `ILM` | Ilm | Knowledge and learning sessions |
| `CAFE_MEETUP` | Cafe Meetup | Casual cafe meetups |
| `VOLUNTEER` | Volunteer | Volunteer and community service |
| `MONTHLY_EVENT` | Monthly Event | Monthly recurring events |
| `LOCAL_TRIP` | Local Trip | Local excursions and day trips |

**Example:**
```javascript
// Get event types for dropdown
const response = await fetch('https://api.berse-app.com/v2/events/types');
const { data: eventTypes } = await response.json();

// Use in UI
eventTypes.forEach(type => {
  console.log(`${type.label}: ${type.value}`);
});
// Output:
// Social: SOCIAL
// Sports: SPORTS
// Trip: TRIP
// Ilm: ILM
// Cafe Meetup: CAFE_MEETUP
// Volunteer: VOLUNTEER
// Monthly Event: MONTHLY_EVENT
// Local Trip: LOCAL_TRIP
```

---

## Ticket Tiers

### Create Ticket Tier

Create a pricing tier for a paid event.

**Endpoint:** `POST /v2/events/ticket-tiers`

**Authentication:** Required (must be event host)

**Request Body:**
```json
{
  "eventId": "evt_cm123456789",
  "tierName": "VIP Access",
  "description": "Includes backstage access and merchandise",
  "price": 150,
  "currency": "MYR",
  "totalQuantity": 25,
  "minPurchase": 1,
  "maxPurchase": 4,
  "availableFrom": "2025-07-01T00:00:00Z",
  "availableUntil": "2025-08-15T10:00:00Z",
  "displayOrder": 3,
  "isActive": true
}
```

**Field Validations:**
- `eventId` (required): Valid event ID
- `tierName` (required): 2-100 characters
- `description` (optional): Max 500 characters
- `price` (required): >= 0
- `currency` (optional): Default "MYR"
- `totalQuantity` (optional): Positive integer (null = unlimited)
- `minPurchase` (optional): Default 1
- `maxPurchase` (optional): Default 10
- `availableFrom` (optional): ISO date
- `availableUntil` (optional): ISO date
- `displayOrder` (optional): Default 0
- `isActive` (optional): Default true

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Ticket tier created successfully",
  "data": {
    "id": "tier_125",
    "eventId": "evt_cm123456789",
    "tierName": "VIP Access",
    "description": "Includes backstage access and merchandise",
    "price": 150,
    "currency": "MYR",
    "totalQuantity": 25,
    "soldQuantity": 0,
    "availableQuantity": 25,
    "minPurchase": 1,
    "maxPurchase": 4,
    "availableFrom": "2025-07-01T00:00:00.000Z",
    "availableUntil": "2025-08-15T10:00:00.000Z",
    "displayOrder": 3,
    "isActive": true,
    "createdAt": "2025-10-16T10:00:00.000Z",
    "updatedAt": "2025-10-16T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `403 Forbidden` - Not authorized to create tier for this event
- `404 Not Found` - Event not found

---

### Get Ticket Tiers

Get all ticket tiers for an event.

**Endpoint:** `GET /v2/events/:id/ticket-tiers`

**Authentication:** Optional (public endpoint)

**Path Parameters:**
- `id` (required): Event ID

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Ticket tiers retrieved successfully",
  "data": [
    {
      "id": "tier_123",
      "eventId": "evt_cm123456789",
      "tierName": "Early Bird",
      "description": "Limited early bird pricing",
      "price": 35,
      "currency": "MYR",
      "totalQuantity": 50,
      "soldQuantity": 50,
      "availableQuantity": 0,
      "minPurchase": 1,
      "maxPurchase": 5,
      "availableFrom": "2025-07-01T00:00:00.000Z",
      "availableUntil": "2025-07-31T23:59:59.000Z",
      "isActive": false,
      "displayOrder": 1
    },
    {
      "id": "tier_124",
      "tierName": "General Admission",
      "price": 50,
      "availableQuantity": 112,
      "isActive": true,
      "displayOrder": 2
    }
  ]
}
```

---

### Update Ticket Tier

Update an existing ticket tier.

**Endpoint:** `PUT /v2/events/ticket-tiers/:id`

**Authentication:** Required (must be event host)

**Path Parameters:**
- `id` (required): Ticket tier ID

**Request Body:** (all fields optional)
```json
{
  "tierName": "Updated Tier Name",
  "price": 45,
  "totalQuantity": 60,
  "isActive": false
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Ticket tier updated successfully",
  "data": {
    "id": "tier_124",
    "tierName": "Updated Tier Name",
    // ... full tier object
  }
}
```

---

## Ticket Purchase

### Purchase Ticket

Purchase a single ticket for a paid event. Each purchase is for one attendee only.

**Endpoint:** `POST /v2/events/tickets/purchase`

**Authentication:** Required

**Request Body:**
```json
{
  "eventId": "evt_cm123456789",
  "ticketTierId": "tier_124",
  "attendeeName": "John Doe",
  "attendeeEmail": "john@example.com",
  "attendeePhone": "+60123456789"
}
```

**Field Validations:**
- `eventId` (required): Valid event ID
- `ticketTierId` (optional): If not provided, uses event's base price
- `attendeeName` (optional): 2-200 characters
- `attendeeEmail` (optional): Valid email format
- `attendeePhone` (optional): Valid phone format

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Ticket purchased successfully",
  "data": {
    "id": "tkt_789",
    "eventId": "evt_cm123456789",
    "userId": "usr_cm987654321",
    "ticketTierId": "tier_124",
    "ticketType": "GENERAL",
    "price": 50,
    "currency": "MYR",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "ticketNumber": "TKT-1729080000000-B7E2",
    "quantity": 1,
    "purchasedAt": "2025-10-16T10:00:00.000Z",
    "attendeeName": "John Doe",
    "attendeeEmail": "john@example.com",
    "attendeePhone": "+60123456789",
    "event": {
      "id": "evt_cm123456789",
      "title": "Bersemuka Summer Meetup 2025",
      "date": "2025-08-15T10:00:00.000Z",
      "location": "KLCC Convention Center, Kuala Lumpur"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors, insufficient capacity, tier not available
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Event or tier not found

**Notes:**
- Each purchase is for **one ticket only**. To buy multiple tickets, make separate purchase requests
- This is a simplified implementation. In production, integrate with payment gateways (Stripe, PayPal, etc.)
- Payment status should be updated via webhooks after successful payment
- Consider implementing payment timeout and ticket reservation systems

---

### Get My Tickets

Get all tickets purchased by the authenticated user.

**Endpoint:** `GET /v2/events/me/tickets`

**Authentication:** Required

**Query Parameters:**
- `eventId` (optional): Filter tickets by specific event

**Examples:**
```
GET /v2/events/me/tickets
GET /v2/events/me/tickets?eventId=evt_cm123456789
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Tickets retrieved successfully",
  "data": [
    {
      "id": "tkt_789",
      "eventId": "evt_cm123456789",
      "ticketNumber": "TKT-1729080000000-B7E2",
      "ticketType": "GENERAL",
      "price": 50,
      "currency": "MYR",
      "status": "ACTIVE",
      "paymentStatus": "COMPLETED",
      "quantity": 1,
      "purchasedAt": "2025-10-16T10:00:00.000Z",
      "checkedInAt": null,
      "event": {
        "id": "evt_cm123456789",
        "title": "Bersemuka Summer Meetup 2025",
        "date": "2025-08-15T10:00:00.000Z",
        "location": "KLCC Convention Center, Kuala Lumpur",
        "images": ["https://cdn.berse.com/events/summer-2025.jpg"]
      }
    }
  ]
}
```

---

## Event Registration

Event registration uses the `EventParticipant` model for unified participant tracking with status management. All participants (whether from free registration or paid ticket purchase) are tracked in this model.

### Register for Event

Register for a free event. Creates an `EventParticipant` record with `status=REGISTERED`.

**Endpoint:** `POST /v2/events/:id/register`

**Authentication:** Required

**Path Parameters:**
- `id` (required): Event ID

**Request Body:** None required

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Successfully registered for event",
  "data": {
    "id": "cmgxe29zb0017cppi6ob1106q",
    "userId": "e790aa8d-fe54-45b0-ad34-44f1913657cf",
    "eventId": "cmgxe29nb0013cppi177xt4vo",
    "status": "REGISTERED",
    "qrCode": "a1b2c3d4e5f6...",
    "checkedInAt": null,
    "canceledAt": null,
    "createdAt": "2025-10-19T07:00:00.000Z",
    "updatedAt": "2025-10-19T07:00:00.000Z",
    "event": {
      "id": "cmgxe29nb0013cppi177xt4vo",
      "title": "Free Tech Meetup",
      "date": "2025-11-15T18:00:00.000Z",
      "location": "Downtown Tech Hub",
      "type": "SOCIAL"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Already registered, event is paid, event at capacity, event not published
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Event not found

**Notes:**
- Only available for free events (where `isFree: true`)
- For paid events, use the [Purchase Ticket](#purchase-ticket) endpoint
- QR code token is included in response but QR image is generated on-demand via [Generate Participant QR Code](#generate-participant-qr-code)
- Participant status can be: `REGISTERED`, `CONFIRMED`, `CHECKED_IN`, `CANCELED`, `NO_SHOW`

---

### Cancel Registration

Cancel event registration. Updates `EventParticipant` status to `CANCELED` (soft delete preserves history).

**Endpoint:** `DELETE /v2/events/:id/register`

**Authentication:** Required

**Path Parameters:**
- `id` (required): Event ID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Registration cancelled successfully",
  "data": null
}
```

**Error Responses:**
- `404 Not Found` - Event or registration not found
- `401 Unauthorized` - Invalid or missing token

**Implementation Details:**
- Sets `EventParticipant.status` to `CANCELED`
- Sets `EventParticipant.canceledAt` to current timestamp
- Record is preserved (not deleted) for:
  - Registration history tracking
  - Cancellation rate analytics
  - Re-registration with history
  - User behavior analysis

---

### Get My Registrations

Get all event registrations (EventParticipant records) for the authenticated user.

**Endpoint:** `GET /v2/events/me/registrations`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Registrations retrieved successfully",
  "data": [
    {
      "id": "cmgxe29zb0017cppi6ob1106q",
      "userId": "e790aa8d-fe54-45b0-ad34-44f1913657cf",
      "eventId": "cmgxe29nb0013cppi177xt4vo",
      "status": "REGISTERED",
      "qrCode": "a1b2c3d4e5f6...",
      "checkedInAt": null,
      "canceledAt": null,
      "createdAt": "2025-10-19T07:00:00.000Z",
      "updatedAt": "2025-10-19T07:00:00.000Z",
      "event": {
        "id": "cmgxe29nb0013cppi177xt4vo",
        "title": "Free Tech Meetup",
        "date": "2025-11-15T18:00:00.000Z",
        "location": "Downtown Tech Hub",
        "type": "SOCIAL",
        "images": []
      }
    },
    {
      "id": "cmgxe2a1c001acppi8xz9y2b3",
      "userId": "e790aa8d-fe54-45b0-ad34-44f1913657cf",
      "eventId": "cmgxe2a0x0018cppid4k8l1m5",
      "status": "CHECKED_IN",
      "qrCode": "x9y8z7w6v5u4...",
      "checkedInAt": "2025-10-18T09:15:00.000Z",
      "canceledAt": null,
      "createdAt": "2025-10-17T14:00:00.000Z",
      "updatedAt": "2025-10-18T09:15:00.000Z",
      "event": {
        "id": "cmgxe2a0x0018cppid4k8l1m5",
        "title": "Morning Coffee Chat",
        "date": "2025-10-18T09:00:00.000Z",
        "location": "Cafe Lumiere",
        "type": "CAFE_MEETUP"
      }
    }
  ]
}
```

**Filtering:**
- Returns all registrations regardless of status
- Includes REGISTERED, CHECKED_IN, CANCELED, etc.
- Ordered by creation date (newest first)

---

### Generate Participant QR Code

Generate a secure QR code for event check-in. The QR code contains a JWT token with participant and event information.

**Endpoint:** `GET /v2/events/participants/:participantId/qr-code`

**Authentication:** Required

**Path Parameters:**
- `participantId` (required): EventParticipant ID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

**Error Responses:**
- `404 Not Found` - Participant record not found
- `403 Forbidden` - QR code belongs to different user
- `401 Unauthorized` - Invalid or missing token

**QR Code Details:**
- Format: Data URL (Base64-encoded PNG image)
- Contains: JWT token with participant ID, event ID, user ID, and secure token
- Token includes:
  - `type`: "EVENT_CHECKIN"
  - `participantId`: EventParticipant ID
  - `eventId`: Event ID
  - `userId`: User ID
  - `token`: Secure random token from `EventParticipant.qrCode` field
  - `iat`: Issued at timestamp
  - `iss`: "bersemuka-api"
  - `aud`: "bersemuka-checkin"

**Usage:**
- QR code can be scanned at event check-in
- Token is verified server-side during check-in
- Prevents QR code reuse or forgery
      "event": {
        "id": "evt_cm234567890",
        "title": "Community Hike",
        "date": "2025-09-01T07:00:00.000Z",
        "location": "Bukit Tabur",
        "type": "TRIP"
      }
    }
  ]
}
```

**Participant Status Values:**
- `REGISTERED` - Initial registration, not yet checked in
- `WAITLISTED` - On waiting list (if event at capacity)
- `CONFIRMED` - Registration confirmed (for paid events after payment)
- `CHECKED_IN` - Attended the event
- `CANCELED` - Registration cancelled by user

**Additional Fields:**
- `qrCode`: Secure token for QR code generation (use with [Generate QR Code](#generate-qr-code) endpoint)
- `checkedInAt`: Timestamp when user checked in (null if not attended)
- `canceledAt`: Timestamp when registration was cancelled (null if active)

---


---

## Attendance

Check-in tracking updates `EventParticipant.checkedInAt` and sets `status=CHECKED_IN`.

### Check-In Attendee

Check in a participant at the event (via user ID or QR code scan). Updates their EventParticipant record.

**Endpoint:** `POST /v2/events/:id/check-in`

**Authentication:** Required (typically event staff or host)

**Path Parameters:**
- `id` (required): Event ID

**Request Body:**
```json
{
  "userId": "e790aa8d-fe54-45b0-ad34-44f1913657cf"
}
```

**OR**

```json
{
  "qrCode": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Field Validations:**
- Must provide either `userId` or `qrCode` (not both)
- If using QR code: Must be valid JWT token from [Generate QR Code](#generate-qr-code) endpoint

**Database Changes:**
- **Before:** Created `EventAttendance` record
- **Now:** Updates `EventParticipant`:
  - `checkedInAt`: Current timestamp
  - `status`: CHECKED_IN
  - No separate attendance table needed

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Participant checked in successfully",
  "data": {
    "id": "participant_123",
    "eventId": "evt_cm123456789",
    "userId": "usr_cm987654321",
    "checkedInAt": "2025-08-15T10:15:00.000Z",
    "status": "CHECKED_IN",
    "user": {
      "id": "usr_cm987654321",
      "fullName": "John Doe",
      "email": "john@example.com",
      "profilePicture": "https://cdn.berse.com/users/john.jpg"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - User ID or QR code required, invalid QR code, already checked in, QR code for different event
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Event not found, participant record/ticket not found

**Check-In Flow:**
1. Event staff scans attendee's QR code or enters user ID
2. System verifies QR code JWT signature and expiration (if QR method)
3. System validates EventParticipant or EventTicket exists for this event
4. System checks participant not already checked in (`checkedInAt` is null)
5. System updates EventParticipant: `checkedInAt = now()`, `status = CHECKED_IN`
6. System triggers trust score update for the user (event attendance component)
7. Returns confirmation with participant details

**Automatic Trust Score Update:**
After successful check-in, the attendee's trust score is automatically recalculated to include their event attendance in the activity component (30% of total trust score). This happens asynchronously and doesn't block the check-in response.

---

### Get Event Attendees

Get list of all participants who have checked in to an event (EventParticipant records where `checkedInAt IS NOT NULL`).

**Endpoint:** `GET /v2/events/:id/attendees`

**Authentication:** Required (must be event host or admin)

**Path Parameters:**
- `id` (required): Event ID

**Database Changes:**
- **Before:** Queried `EventAttendance` table
- **Now:** Queries `EventParticipant` WHERE `checkedInAt IS NOT NULL`
- Returns same data structure for compatibility

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Checked-in participants retrieved successfully",
  "data": [
    {
      "id": "participant_123",
      "eventId": "evt_cm123456789",
      "userId": "usr_cm987654321",
      "checkedInAt": "2025-08-15T10:15:00.000Z",
      "status": "CHECKED_IN",
      "user": {
        "id": "usr_cm987654321",
        "fullName": "John Doe",
        "email": "john@example.com",
        "profilePicture": "https://cdn.berse.com/users/john.jpg"
      }
    },
    {
      "id": "participant_124",
      "eventId": "evt_cm123456789",
      "userId": "usr_cm876543210",
      "checkedInAt": "2025-08-15T10:20:00.000Z",
      "status": "CHECKED_IN",
      "user": {
        "id": "usr_cm876543210",
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "profilePicture": "https://cdn.berse.com/users/jane.jpg"
      }
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Not authorized to view attendees
- `404 Not Found` - Event not found

**Additional Information:**
- Results sorted by `checkedInAt` descending (most recent first)
- Only shows participants who actually checked in (not just registered)
- Use `GET /v2/events/:id` to see all registrations (participantsPreview field)
- For analytics, compare `totalParticipants` vs `totalCheckedIn` in event stats

---

## Event Discovery

The Discovery API helps users find events that are relevant to them through various intelligent methods.

### Get Trending Events

Get currently trending events based on engagement metrics, recency, and capacity.

**Endpoint:** `GET /v2/events/discovery/trending`

**Authentication:** Optional (provides better results when authenticated)

**Query Parameters:**
- `limit` (optional): Number of events to return (1-100, default: 20)

**Trending Algorithm:**
Events are ranked by a trending score calculated as:
```
trendingScore = (totalEngagement × recencyBonus) + (capacityBonus × 10)

Where:
- totalEngagement = rsvpCount + ticketsSold
- recencyBonus = 1.5 (if created within last 7 days), otherwise 1.0
- capacityBonus = (engagement / maxAttendees) × 0.5 (capped at 0.5 if no limit)
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Trending events retrieved successfully",
  "data": [
    {
      "id": "evt_cm123456789",
      "title": "Tech Conference 2025",
      "description": "Annual tech conference...",
      "type": "CONFERENCE",
      "date": "2025-09-20T09:00:00.000Z",
      "location": "Kuala Lumpur Convention Centre",
      "maxAttendees": 500,
      "isFree": false,
      "price": 299,
      "currency": "MYR",
      "status": "PUBLISHED",
      "images": ["https://cdn.berse.com/events/tech-conf.jpg"],
      "_count": {
        "rsvps": 234,
        "tickets": 156,
        "attendees": 0
      },
      "host": {
        "id": "usr_cm987654321",
        "displayName": "Tech Community KL"
      }
    }
  ]
}
```

**Use Cases:**
- Home page featured events
- Discover page main content
- "What's Hot" sections

---

### Get Nearby Events

Find events near a specific location.

**Endpoint:** `GET /v2/events/discovery/nearby`

**Authentication:** Optional

**Query Parameters:**
- `latitude` (required): Latitude coordinate (-90 to 90)
- `longitude` (required): Longitude coordinate (-180 to 180)
- `radius` (optional): Search radius in kilometers (1-500, default: 50)
- `limit` (optional): Number of events to return (1-100, default: 20)

**Note:** Current implementation uses text-based location matching. Full geospatial search with coordinates will be implemented in a future update.

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Nearby events retrieved successfully",
  "data": [
    {
      "id": "evt_cm234567890",
      "title": "Kuala Lumpur Food Festival",
      "location": "KLCC Park, Kuala Lumpur",
      "date": "2025-08-25T11:00:00.000Z",
      "type": "SOCIAL",
      "isFree": true,
      "maxAttendees": 1000,
      "_count": {
        "rsvps": 456,
        "tickets": 0,
        "attendees": 0
      }
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid coordinates or radius

**Use Cases:**
- Location-based event discovery
- "Events Near Me" features
- Map-based event browsing

---

### Get Recommended Events

Get personalized event recommendations based on user's history and preferences.

**Endpoint:** `GET /v2/events/discovery/recommended`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of events to return (1-100, default: 20)

**Recommendation Algorithm:**
1. Analyze user's RSVP/ticket purchase history
2. Identify preferred event types
3. Include events from user's communities
4. Prioritize upcoming events
5. Exclude events user is hosting
6. Return sorted by date and creation time

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Recommended events retrieved successfully",
  "data": [
    {
      "id": "evt_cm345678901",
      "title": "Startup Networking Night",
      "type": "SOCIAL",
      "date": "2025-08-30T18:00:00.000Z",
      "location": "Bangsar Village II, KL",
      "isFree": true,
      "community": {
        "id": "com_cm111222333",
        "name": "KL Startup Community"
      },
      "_count": {
        "rsvps": 78,
        "tickets": 0,
        "attendees": 0
      }
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

**Use Cases:**
- Personalized "For You" feed
- Email recommendations
- Push notification suggestions

---

### Get Events by Host

Get all events organized by a specific host/organizer.

**Endpoint:** `GET /v2/events/discovery/host/:hostId`

**Authentication:** Optional

**Path Parameters:**
- `hostId` (required): ID of the host/organizer

**Query Parameters:**
- `limit` (optional): Number of events to return (1-100, default: 20)

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Host events retrieved successfully",
  "data": [
    {
      "id": "evt_cm456789012",
      "title": "Monthly Tech Talks - July",
      "type": "WORKSHOP",
      "date": "2025-07-15T19:00:00.000Z",
      "status": "PUBLISHED",
      "host": {
        "id": "usr_cm987654321",
        "displayName": "Tech Community KL",
        "profilePicture": "https://cdn.berse.com/users/tech-kl.jpg"
      }
    },
    {
      "id": "evt_cm456789013",
      "title": "Monthly Tech Talks - August",
      "type": "WORKSHOP",
      "date": "2025-08-15T19:00:00.000Z",
      "status": "PUBLISHED",
      "host": {
        "id": "usr_cm987654321",
        "displayName": "Tech Community KL",
        "profilePicture": "https://cdn.berse.com/users/tech-kl.jpg"
      }
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Host not found

**Use Cases:**
- Host/organizer profile pages
- "More events by this organizer"
- Following specific organizers

---

### Get My Community Events

Get events from all communities the authenticated user belongs to.

**Endpoint:** `GET /v2/events/discovery/my-communities`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of events to return (1-100, default: 20)

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Community events retrieved successfully",
  "data": [
    {
      "id": "evt_cm567890123",
      "title": "Badminton Tournament 2025",
      "type": "SPORTS",
      "date": "2025-09-05T08:00:00.000Z",
      "location": "Stadium Badminton Cheras",
      "isFree": false,
      "price": 50,
      "currency": "MYR",
      "community": {
        "id": "com_cm222333444",
        "name": "Berseminton KL"
      },
      "_count": {
        "rsvps": 0,
        "tickets": 23,
        "attendees": 0
      }
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

**Use Cases:**
- Community member dashboard
- "Events from your communities" feed
- Community engagement features

---

### Get User Attended Events

Get events that a specific user has attended (checked in to). Useful for displaying on user profiles.

**Endpoint:** `GET /v2/events/discovery/user/:userId/attended`

**Authentication:** Optional

**Path Parameters:**
- `userId` (required): ID of the user

**Query Parameters:**
- `limit` (optional): Number of events to return (1-100, default: 20)
- `startDate` (optional): Filter events from this date (ISO 8601 format)
- `endDate` (optional): Filter events until this date (ISO 8601 format)

**Default Behavior:**
- If no date range specified, shows events from last 6 months
- Sorted by date (most recent first)
- Only includes events user actually attended (checked in)

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "User attended events retrieved successfully",
  "data": [
    {
      "id": "evt_cm678901234",
      "title": "Tech Meetup July 2025",
      "type": "SOCIAL",
      "date": "2025-07-20T18:00:00.000Z",
      "location": "Tech Hub KL",
      "isFree": true,
      "host": {
        "id": "usr_cm111222333",
        "displayName": "KL Tech Community"
      },
      "checkedInAt": "2025-07-20T18:15:00.000Z",
      "_count": {
        "rsvps": 45,
        "tickets": 0,
        "attendees": 38
      }
    },
    {
      "id": "evt_cm789012345",
      "title": "Badminton Tournament",
      "type": "SPORTS",
      "date": "2025-06-15T08:00:00.000Z",
      "location": "Stadium Cheras",
      "isFree": false,
      "price": 50,
      "currency": "MYR",
      "checkedInAt": "2025-06-15T08:10:00.000Z"
    }
  ]
}
```

**Performance Features:**
- Optimized query with single database call
- Default 6-month window to limit data size
- Indexed on attendance records for fast retrieval
- Includes check-in timestamp for each event

**Use Cases:**
- User profile "Events Attended" section
- Activity history display
- Social proof ("John attended 12 events")
- Event recommendations based on history

**Privacy Notes:**
- Public endpoint - anyone can see attended events
- Consider adding privacy settings in future
- Only shows events user actually checked in to (not just RSVP'd)

---

## Calendar Views

The Calendar Views endpoints provide optimized access to events for calendar-style displays, daily schedules, and weekly planners. These endpoints are designed for performance and user experience when building event calendars.

### Get Today's Events

Get all published events happening today with sorting and filtering options.

**Endpoint:** `GET /v2/events/calendar/today`

**Authentication:** Not required

**Query Parameters:**
- `type` (optional): Filter by event type (see [EventType enum](#eventtype))
- `sortBy` (optional): Sort field - `date`, `title`, or `popularity` (default: `date`)
- `sortOrder` (optional): Sort order - `asc` or `desc` (default: `asc`)
- `timezone` (optional): Timezone for date calculation (default: `UTC`)
  - Examples: `Asia/Kuala_Lumpur`, `America/New_York`, `Europe/London`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Today events retrieved successfully",
  "data": {
    "events": [
      {
        "id": "evt_cm123456789",
        "title": "Morning Badminton Session",
        "description": "Weekly badminton game for beginners",
        "type": "SPORTS",
        "date": "2025-10-17T08:00:00.000Z",
        "location": "Badminton Arena KL",
        "mapLink": "https://maps.google.com/?q=Badminton+Arena+KL",
        "maxAttendees": 20,
        "isFree": true,
        "status": "PUBLISHED",
        "host": {
          "id": "usr_cm987654321",
          "displayName": "Ahmad Ali",
          "profilePicture": "https://cdn.berse.com/profiles/ahmad.jpg"
        },
        "rsvpCount": 15,
        "attendanceCount": 0,
        "ticketCount": 0
      },
      {
        "id": "evt_cm234567890",
        "title": "Tech Talk: AI in 2025",
        "type": "WORKSHOP",
        "date": "2025-10-17T19:00:00.000Z",
        "location": "KLCC Convention Center",
        "isFree": false,
        "price": 50,
        "currency": "MYR",
        "host": {
          "id": "usr_cm888999000",
          "displayName": "TechHub KL"
        },
        "rsvpCount": 45,
        "ticketCount": 12
      }
    ],
    "count": 2
  }
}
```

**Features:**
- Only returns `PUBLISHED` events (no drafts or cancelled)
- Filters events to today's date based on specified timezone
- Sorting by `popularity` uses RSVP + attendance + ticket counts
- Optimized queries with count aggregations

**Use Cases:**
- "What's happening today" dashboard widget
- Daily event digest emails
- Homepage "Today's Events" section
- Quick calendar overview

---

### Get Week Schedule

Get events for the next 7 days, grouped by date with day names and timezone support.

**Endpoint:** `GET /v2/events/calendar/week`

**Authentication:** Not required

**Query Parameters:**
- `type` (optional): Filter by event type (see [EventType enum](#eventtype))
- `timezone` (optional): Timezone for date calculation (default: `UTC`)
  - Examples: `Asia/Kuala_Lumpur`, `America/New_York`, `Europe/London`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Week schedule retrieved successfully",
  "data": {
    "2025-10-17": {
      "dayName": "Friday",
      "dayOfWeek": 5,
      "date": "2025-10-17",
      "events": [
        {
          "id": "evt_cm123456789",
          "title": "Morning Badminton Session",
          "type": "SPORTS",
          "date": "2025-10-17T08:00:00.000Z",
          "location": "Badminton Arena KL",
          "isFree": true,
          "host": {
            "id": "usr_cm987654321",
            "displayName": "Ahmad Ali"
          },
          "rsvpCount": 15
        },
        {
          "id": "evt_cm234567890",
          "title": "Tech Talk: AI in 2025",
          "type": "WORKSHOP",
          "date": "2025-10-17T19:00:00.000Z",
          "location": "KLCC Convention Center",
          "isFree": false,
          "price": 50,
          "currency": "MYR"
        }
      ]
    },
    "2025-10-18": {
      "dayName": "Saturday",
      "dayOfWeek": 6,
      "date": "2025-10-18",
      "events": [
        {
          "id": "evt_cm345678901",
          "title": "Community Cleanup",
          "type": "VOLUNTEER",
          "date": "2025-10-18T09:00:00.000Z",
          "location": "Taman Tun Dr Ismail",
          "isFree": true,
          "rsvpCount": 32
        }
      ]
    },
    "2025-10-20": {
      "dayName": "Monday",
      "dayOfWeek": 1,
      "date": "2025-10-20",
      "events": [
        {
          "id": "evt_cm456789012",
          "title": "Cafe Meetup",
          "type": "CAFE_MEETUP",
          "date": "2025-10-20T15:00:00.000Z",
          "location": "Kopikku Cafe Bangsar",
          "isFree": true
        }
      ]
    }
  }
}
```

**Response Structure:**
- Object keyed by date (YYYY-MM-DD format)
- Each date includes:
  - `dayName`: Full day name (Monday, Tuesday, etc.)
  - `dayOfWeek`: Day number (0=Sunday, 1=Monday, ..., 6=Saturday)
  - `date`: ISO date string (YYYY-MM-DD)
  - `events`: Array of events for that date

**Features:**
- Returns next 7 days starting from today
- Events grouped by date for easy display
- Only includes `PUBLISHED` events
- Empty dates won't appear in response
- Events sorted chronologically within each day

**Use Cases:**
- Weekly calendar view
- "This Week's Events" page
- Event planning dashboard
- Mobile app weekly schedule

**Frontend Integration Example:**
```typescript
// Easy iteration for calendar display
Object.entries(weekSchedule).forEach(([date, dayData]) => {
  console.log(`${dayData.dayName}, ${date}: ${dayData.events.length} events`);
  dayData.events.forEach(event => {
    // Render event card
  });
});
```

---

### Get Month Events

Get all published events for a specific month, grouped by date. Returns complete event details with counts.

**Endpoint:** `GET /v2/events/calendar/month`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `year` (required): Year (e.g., 2025)
- `month` (required): Month (1-12)
- `type` (optional): Filter by event type (see [EventType enum](#eventtype))
- `timezone` (optional): Timezone for date calculations (default: UTC)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Month events retrieved successfully",
  "data": {
    "events": [
      {
        "id": "evt123",
        "title": "Community Badminton Session",
        "description": "Weekly badminton for all levels",
        "type": "BADMINTON",
        "date": "2025-11-05T10:00:00.000Z",
        "location": "Sports Complex",
        "mapLink": "https://maps.google.com/...",
        "images": ["https://..."],
        "isFree": true,
        "price": null,
        "maxAttendees": 20,
        "ticketsSold": 0,
        "status": "PUBLISHED",
        "hostId": "user123",
        "communityId": "comm456",
        "user": {
          "id": "user123",
          "fullName": "Sarah Ahmad",
          "username": "sarah_a"
        }
      }
    ],
    "eventsByDate": {
      "2025-11-01": [
        { "id": "evt456", "title": "Workshop", ... }
      ],
      "2025-11-05": [
        { "id": "evt123", "title": "Badminton", ... }
      ],
      "2025-11-15": [
        { "id": "evt789", "title": "Networking", ... },
        { "id": "evt790", "title": "Social", ... }
      ]
    },
    "counts": {
      "2025-11-01": 1,
      "2025-11-05": 1,
      "2025-11-15": 2
    },
    "month": 11,
    "year": 2025,
    "totalEvents": 4
  }
}
```

**Response Structure:**
- `events`: Array of all events in the month (sorted by date)
- `eventsByDate`: Events grouped by date (YYYY-MM-DD) for easy calendar rendering
- `counts`: Event count per date
- `month`, `year`: Requested month/year
- `totalEvents`: Total number of events

**Performance Features:**
- ✅ Cached for 10 minutes (per month, type filter)
- ✅ Complete event details in single query
- ✅ Pre-grouped by date for immediate use
- ✅ Optimized for calendar UI rendering

**Use Cases:**
- Monthly calendar view with full event details
- Event list grouped by date
- Mobile app month view
- Calendar widgets with event previews

**Frontend Integration Example:**
```typescript
// Render calendar grid
Object.entries(eventsByDate).forEach(([date, events]) => {
  const dayElement = calendar.querySelector(`[data-date="${date}"]`);
  
  // Show event count badge
  dayElement.querySelector('.count').textContent = events.length;
  
  // Render event previews on hover/click
  dayElement.addEventListener('click', () => {
    showEventList(events);
  });
});
```

---

### Get Calendar Counts

Get count of published events per date for calendar display. Optimized for performance with caching.

**Endpoint:** `GET /v2/events/calendar/counts`

**Authentication:** Not required

**Query Parameters:**
- `startDate` (optional): Start date for count range (ISO 8601 format)
  - Default: First day of current month
  - Example: `2025-10-01T00:00:00Z`
- `endDate` (optional): End date for count range (ISO 8601 format)
  - Default: Last day of current month
  - Example: `2025-10-31T23:59:59Z`
- `type` (optional): Filter by event type (see [EventType enum](#eventtype))

**Default Behavior:**
- If no date range specified, returns counts for current month
- Maximum recommended range: 3 months for performance
- Results are cached for 15 minutes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Calendar counts retrieved successfully",
  "data": {
    "counts": {
      "2025-10-01": 2,
      "2025-10-05": 1,
      "2025-10-10": 4,
      "2025-10-15": 3,
      "2025-10-17": 5,
      "2025-10-18": 2,
      "2025-10-20": 1,
      "2025-10-25": 3,
      "2025-10-31": 1
    },
    "total": 22
  }
}
```

**Response Structure:**
- `counts`: Object with dates as keys (YYYY-MM-DD) and event counts as values
- `total`: Total number of events across all dates in the range
- Dates with zero events are omitted from the response

**Performance Features:**
- ✅ Cached for 15 minutes (per date range and type filter)
- ✅ Returns only counts, not full event data
- ✅ Optimized database query (single query)
- ✅ Suitable for rendering large calendar grids

**Use Cases:**
- Calendar month view with event count badges
- Heat map visualization of event activity
- Quick overview of busy vs quiet days
- Performance-first calendar rendering

**Recommended Workflow:**

1. **Initial Calendar Load:**
   ```
   GET /v2/events/calendar/counts?startDate=2025-10-01&endDate=2025-10-31
   ```
   Display counts on calendar dates (e.g., show "5" badge on Oct 17)

2. **User Clicks a Date:**
   ```
   GET /v2/events?startDate=2025-10-17T00:00:00Z&endDate=2025-10-17T23:59:59Z&status=PUBLISHED
   ```
   Fetch and display full event details for that specific date

**Frontend Integration Example:**
```typescript
// 1. Load calendar counts
const response = await fetch('/v2/events/calendar/counts?startDate=2025-10-01&endDate=2025-10-31');
const { counts } = response.data;

// 2. Render calendar with counts
dates.forEach(date => {
  const count = counts[date] || 0;
  renderCalendarDay(date, count); // Show badge if count > 0
});

// 3. When user clicks a date with events
onClick(date) {
  if (counts[date] > 0) {
    // Fetch full event details
    fetchEventsForDate(date);
  }
}
```

**Cache Behavior:**
- Cache key includes: date range + event type filter
- Cache TTL: 15 minutes
- Cache automatically clears when events are created/updated
- Different filters have separate caches

**Query Optimization Tips:**
- Request only the months you need to display
- Use type filter if calendar is category-specific
- For month-to-month navigation, fetch 1 month at a time
- Cache results on frontend to avoid repeated calls

---

## Enums & Types

### EventType

```typescript
enum EventType {
  SOCIAL = "SOCIAL",           // Social gatherings and meetups
  SPORTS = "SPORTS",           // Sports activities and competitions
  TRIP = "TRIP",               // Travel and trips
  ILM = "ILM",                 // Knowledge and learning sessions
  CAFE_MEETUP = "CAFE_MEETUP", // Casual cafe meetups
  VOLUNTEER = "VOLUNTEER",     // Volunteer and community service
  MONTHLY_EVENT = "MONTHLY_EVENT", // Monthly recurring events
  LOCAL_TRIP = "LOCAL_TRIP"    // Local excursions and day trips
}
```

**Note:** These types can be retrieved via the `GET /v2/events/types` endpoint.

### EventStatus

```typescript
enum EventStatus {
  DRAFT = "DRAFT",         // Event created but not published
  PUBLISHED = "PUBLISHED", // Event is live and visible
  CANCELED = "CANCELED",   // Event canceled
  COMPLETED = "COMPLETED"  // Event has ended
}
```

### EventHostType

```typescript
enum EventHostType {
  PERSONAL = "PERSONAL",   // Hosted by individual user
  COMMUNITY = "COMMUNITY"  // Hosted by community
}
```

**Description:**
- `PERSONAL` - Events created and managed by individual users. The creator has full control and is listed as the host.
- `COMMUNITY` - Events created on behalf of a community. Requires `communityId` to be specified. Managed by community admins/moderators.

**Filter Usage:**
```bash
# Get personal events
GET /v2/events?hostType=PERSONAL

# Get community events
GET /v2/events?hostType=COMMUNITY
```

**Use Cases:**
- Separate personal vs community event listings
- Different permission models (personal = creator only, community = admin/moderator access)
- Display appropriate host information in UI
- Community event discovery

---

### EventTicketStatus

```typescript
enum EventTicketStatus {
  PENDING = "PENDING",     // Payment pending
  ACTIVE = "ACTIVE",       // Ticket is valid
  USED = "USED",          // Ticket used (checked in)
  CANCELED = "CANCELED",   // Ticket canceled
  REFUNDED = "REFUNDED"    // Ticket refunded
}
```

### PaymentStatus

```typescript
enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PROCESSING = "PROCESSING",
  CANCELED = "CANCELED"
}
```

---

## Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Validation errors, business logic violations |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User not authorized for this action |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry (already RSVP'd, etc.) |
| 500 | Internal Server Error | Server error |

**Error Response Format:**
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

---

## Examples

### Complete Event Creation Flow

```javascript
// 1. Create a paid event (MUST be DRAFT initially)
const createEventResponse = await fetch('https://api.berse-app.com/v2/events', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Tech Meetup 2025",
    description: "Annual tech conference",
    type: "CONFERENCE",
    date: "2025-12-01T09:00:00Z",
    location: "Tech Hub, KL",
    isFree: false,
    currency: "MYR",
    status: "DRAFT",  // Required for paid events
    hostType: "COMMUNITY",
    communityId: "cm123"
  })
});

const event = await createEventResponse.json();
const eventId = event.data.id;

// 2. Create ticket tiers
await fetch('https://api.berse-app.com/v2/events/ticket-tiers', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    eventId: eventId,
    tierName: "Early Bird",
    price: 75,
    totalQuantity: 50,
    availableUntil: "2025-11-01T00:00:00Z"
  })
});

// 3. Publish event (now allowed since we have ticket tiers)
await fetch(`https://api.berse-app.com/v2/events/${eventId}`, {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: "PUBLISHED"
  })
});
```

### Attendee RSVP and Check-In Flow

```javascript
// 1. User RSVPs to free event
const rsvpResponse = await fetch(`https://api.berse-app.com/v2/events/${eventId}/rsvp`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer USER_ACCESS_TOKEN'
  }
});

const rsvp = await rsvpResponse.json();
const rsvpId = rsvp.data.id;

// 2. Generate QR code on day of event
const qrResponse = await fetch(`https://api.berse-app.com/v2/events/rsvps/${rsvpId}/qr-code`, {
  headers: {
    'Authorization': 'Bearer USER_ACCESS_TOKEN'
  }
});

const { qrCode } = await qrResponse.json();

// 3. Display QR code
document.getElementById('qr-code').innerHTML = `<img src="${qrCode}" />`;

// 4. Staff scans QR code and checks in
const qrToken = scannedFromCamera(); // JWT token string

await fetch(`https://api.berse-app.com/v2/events/${eventId}/check-in`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer STAFF_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    qrCode: qrToken
  })
});
```

### Search and Filter Events

```javascript
// Find upcoming free meetups in Kuala Lumpur
const response = await fetch('https://api.berse-app.com/v2/events?' + new URLSearchParams({
  type: 'MEETUP',
  isFree: 'true',
  location: 'Kuala Lumpur',
  startDate: new Date().toISOString(),
  status: 'PUBLISHED',
  sortBy: 'date',
  sortOrder: 'asc',
  page: '1',
  limit: '20'
}));

const events = await response.json();
```

---

## Best Practices

### Event Organizers

1. **Draft → Review → Publish**
   - Create events as DRAFT first
   - Review all details before publishing
   - Set appropriate status transitions

2. **Ticket Management**
   - Create multiple tiers for different pricing
   - Set availability windows for early bird pricing
   - Monitor sold quantities and adjust capacity

3. **Capacity Planning**
   - Set realistic maxAttendees limits
   - Account for no-shows (typically 10-20%)
   - Consider venue capacity and safety regulations

4. **Check-In Process**
   - Test QR code scanning before event day
   - Have backup check-in method (manual entry by user ID)
   - Train staff on check-in procedures

### Attendees

1. **QR Code Generation**
   - Generate QR code close to event time
   - Save screenshot as backup
   - Ensure phone battery is charged

2. **Ticket Purchase**
   - Complete payment process promptly
   - Save ticket confirmation emails
   - Arrive early for smooth check-in

### Developers

1. **Error Handling**
   - Always handle 400/404/403 errors gracefully
   - Display user-friendly error messages
   - Implement retry logic for network failures

2. **Caching**
   - Cache event lists and details
   - Invalidate cache on updates
   - Use optimistic UI updates

3. **Real-Time Updates**
   - Poll for ticket availability changes
   - Show live attendee counts
   - Update UI when capacity reached

4. **QR Code Security**
   - Never expose JWT secrets client-side
   - Validate QR codes server-side only
   - Handle expired tokens gracefully

---

## Rate Limits

- **Public endpoints** (GET events): 100 requests/minute
- **Authenticated endpoints**: 60 requests/minute
- **Ticket purchase**: 10 requests/minute
- **Check-in**: 30 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1634567890
```

---

## Webhooks (Coming Soon)

Future webhook events:
- `event.published` - Event published
- `event.canceled` - Event canceled
- `ticket.purchased` - Ticket purchased
- `ticket.refunded` - Ticket refunded
- `rsvp.created` - RSVP created
- `rsvp.canceled` - RSVP canceled
- `attendee.checked_in` - Attendee checked in

---

## Support

For API support:
- **Email:** api-support@berse-app.com
- **Documentation:** https://docs.berse-app.com
- **GitHub Issues:** https://github.com/berse-app/api-docs/issues

---

**Last Updated:** October 16, 2025  
**API Version:** v2  
**Status:** Production Ready
