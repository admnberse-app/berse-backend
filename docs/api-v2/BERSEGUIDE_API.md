# BerseGuide API Documentation

**Version:** 2.0  
**Base URL:** `/v2/berseguide`  
**Status:** Production Ready

## Overview

BerseGuide connects travelers with local guides who can provide authentic, personalized tours and cultural experiences. This API provides endpoints for guide profile management, booking workflows, session tracking, reviews, and discovery.

### Trust Requirements
- **Minimum Trust Score:** 65
- **Required Levels:** TRUSTED, VERIFIED, or AMBASSADOR
- Users below trust threshold cannot enable BerseGuide

---

## Table of Contents

1. [Profile Management](#profile-management)
2. [Payment Options](#payment-options)
3. [Booking Workflow](#booking-workflow)
4. [Session Management](#session-management)
5. [Reviews](#reviews)
6. [Search & Discovery](#search--discovery)
7. [Dashboard](#dashboard)
8. [Data Models](#data-models)

---

## Profile Management

### Check Eligibility

Check if the current user can enable BerseGuide based on trust score.

**Endpoint:** `GET /v2/berseguide/eligibility`  
**Authentication:** Required

**Response:**
```json
{
  "canEnable": true,
  "trustScore": 72,
  "requiredScore": 65,
  "message": "You meet the trust requirements for BerseGuide"
}
```

---

### Get My Profile

Retrieve the authenticated user's BerseGuide profile.

**Endpoint:** `GET /v2/berseguide/profile`  
**Authentication:** Required

**Response:**
```json
{
  "userId": "user_123",
  "isEnabled": true,
  "title": "Tokyo Food & Culture Adventure",
  "bio": "Local Tokyo guide specializing in food tours and hidden gems...",
  "guideTypes": ["FOOD_DRINK", "CULTURAL", "NIGHTLIFE"],
  "languages": ["English", "Japanese", "Spanish"],
  "specialties": ["ramen tours", "temple visits", "izakaya hopping"],
  "photos": ["url1", "url2"],
  "maxGroupSize": 4,
  "paymentOptions": [
    {
      "id": "opt_123",
      "paymentType": "MONEY",
      "amount": 50,
      "currency": "USD",
      "description": "Per person for 4-hour tour",
      "isPreferred": true
    }
  ],
  "city": "Tokyo",
  "neighborhoods": ["Shibuya", "Harajuku", "Shinjuku"],
  "availabilityNotes": "Weekends and evenings preferred",
  "advanceNotice": 24,
  "responseRate": 98.5,
  "averageResponseTime": 3,
  "totalSessions": 156,
  "rating": 4.9,
  "reviewCount": 87,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-10-20T14:30:00Z"
}
```

---

### Get Profile by ID

Retrieve another user's BerseGuide profile (public view).

**Endpoint:** `GET /v2/berseguide/profile/:userId`  
**Authentication:** Optional

**Response:** Same as "Get My Profile"

---

### Create Profile

Create a new BerseGuide profile.

**Endpoint:** `POST /v2/berseguide/profile`  
**Authentication:** Required

**Request Body:**
```json
{
  "title": "Tokyo Food & Culture Adventure",
  "bio": "I'm a local Tokyo resident who loves sharing the hidden gems...",
  "guideTypes": ["FOOD_DRINK", "CULTURAL", "SIGHTSEEING"],
  "languages": ["English", "Japanese"],
  "specialties": ["ramen tours", "temple visits", "local markets"],
  "photos": ["https://example.com/photo1.jpg"],
  "maxGroupSize": 4,
  "city": "Tokyo",
  "neighborhoods": ["Shibuya", "Harajuku"],
  "availabilityNotes": "Available weekends and evenings",
  "advanceNotice": 24
}
```

**Guide Types:**
- `SIGHTSEEING`: General sightseeing tours
- `FOOD_DRINK`: Food and drink experiences
- `CULTURAL`: Cultural experiences
- `ADVENTURE`: Adventure activities
- `NATURE`: Nature and outdoor
- `NIGHTLIFE`: Nightlife experiences
- `SHOPPING`: Shopping tours
- `PHOTOGRAPHY`: Photography tours
- `HISTORY`: Historical tours
- `ART`: Art and museums

**Response:** Created profile object (201 Created)

**Errors:**
- `403`: Trust requirements not met
- `409`: Profile already exists

---

### Update Profile

Update existing BerseGuide profile.

**Endpoint:** `PATCH /v2/berseguide/profile`  
**Authentication:** Required

**Request Body:** Same as create, all fields optional

**Response:** Updated profile object

---

### Toggle Profile

Enable or disable BerseGuide profile.

**Endpoint:** `PATCH /v2/berseguide/profile/toggle`  
**Authentication:** Required

**Request Body:**
```json
{
  "isEnabled": true
}
```

**Response:** Updated profile

**Errors:**
- `403`: Trust requirements not met (if enabling)

---

### Delete Profile

Permanently delete BerseGuide profile.

**Endpoint:** `DELETE /v2/berseguide/profile`  
**Authentication:** Required

**Response:** 200 OK

**Errors:**
- `400`: Cannot delete with active bookings

---

## Payment Options

### Add Payment Option

Add a payment/exchange option to your guide profile.

**Endpoint:** `POST /v2/berseguide/payment-options`  
**Authentication:** Required

**Request Body:**
```json
{
  "paymentType": "MONEY",
  "amount": 50,
  "currency": "USD",
  "description": "Per person for 4-hour food tour",
  "isPreferred": true
}
```

**Payment Types:**
- `MONEY`: Monetary payment
- `SKILL_TRADE`: Exchange skills
- `TREAT_ME`: Treat guide to meal/activity
- `BERSE_POINTS`: Use platform points
- `FREE`: Free tour
- `NEGOTIABLE`: Discuss terms

**Response:** Payment option object

---

### Update Payment Option

**Endpoint:** `PATCH /v2/berseguide/payment-options/:optionId`  
**Authentication:** Required

**Request Body:** Partial payment option fields

**Response:** Updated payment option

---

### Delete Payment Option

**Endpoint:** `DELETE /v2/berseguide/payment-options/:optionId`  
**Authentication:** Required

**Response:** 200 OK

---

## Booking Workflow

### Create Booking Request

Request a tour with a guide.

**Endpoint:** `POST /v2/berseguide/bookings`  
**Authentication:** Required

**Request Body:**
```json
{
  "guideId": "user_123",
  "preferredDate": "2025-11-05",
  "alternativeDates": ["2025-11-06", "2025-11-07"],
  "preferredTime": "afternoon",
  "duration": 4,
  "numberOfPeople": 2,
  "interests": ["food", "culture", "temples"],
  "specificRequests": "Interested in vegetarian-friendly restaurants",
  "message": "Hi! I'm visiting Tokyo and would love a local food tour..."
}
```

**Time Options:**
- `morning`: Morning (before noon)
- `afternoon`: Afternoon (noon-6pm)
- `evening`: Evening (after 6pm)
- `flexible`: Flexible timing

**Response:**
```json
{
  "id": "booking_123",
  "guideId": "user_123",
  "travelerId": "user_456",
  "status": "PENDING",
  "preferredDate": "2025-11-05",
  "duration": 4,
  "numberOfPeople": 2,
  "message": "Hi! I'm visiting Tokyo...",
  "requestedAt": "2025-10-23T10:00:00Z"
}
```

**Errors:**
- `400`: Invalid dates or data
- `409`: Guide not available

---

### Check Availability

Check if a guide is available.

**Endpoint:** `POST /v2/berseguide/availability`  
**Authentication:** Optional

**Request Body:**
```json
{
  "guideId": "user_123",
  "date": "2025-11-05"
}
```

**Response:**
```json
{
  "available": true,
  "message": "Guide is available for this date"
}
```

---

### Get Booking

Retrieve booking details.

**Endpoint:** `GET /v2/berseguide/bookings/:bookingId`  
**Authentication:** Required

**Response:** Full booking object with guide/traveler details

**Errors:**
- `403`: Not authorized to view this booking
- `404`: Booking not found

---

### Get Bookings as Guide

Get all bookings for your guide services.

**Endpoint:** `GET /v2/berseguide/bookings/guide`  
**Authentication:** Required

**Query Parameters:**
- `status`: Filter by status
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "bookings": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### Get Bookings as Tourist

Get all your booking requests as a traveler.

**Endpoint:** `GET /v2/berseguide/bookings/tourist`  
**Authentication:** Required

**Query Parameters:** Same as bookings/guide

---

### Approve Booking

Approve a booking request (Guide only).

**Endpoint:** `PATCH /v2/berseguide/bookings/:bookingId/approve`  
**Authentication:** Required

**Request Body:**
```json
{
  "agreedPaymentType": "MONEY",
  "agreedPaymentAmount": 100,
  "agreedPaymentDetails": "$50 per person for 4-hour tour",
  "agreedDate": "2025-11-05",
  "agreedTime": "2:00 PM",
  "agreedDuration": 4,
  "meetingPoint": "Starbucks at Shibuya Station exit 3",
  "itinerary": "We'll start at Shibuya, visit local ramen spots..."
}
```

**Response:** Updated booking with status APPROVED

**Errors:**
- `403`: Only guide can approve
- `400`: Invalid booking status for approval

---

### Reject Booking

Reject a booking request (Guide only).

**Endpoint:** `PATCH /v2/berseguide/bookings/:bookingId/reject`  
**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Already booked for that date"
}
```

**Response:** Updated booking with status REJECTED

---

### Cancel Booking

Cancel a booking (Guide or Traveler).

**Endpoint:** `PATCH /v2/berseguide/bookings/:bookingId/cancel`  
**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Change of travel plans"
}
```

**Response:** Updated booking with status CANCELLED_BY_GUIDE or CANCELLED_BY_TRAVELER

---

## Session Management

Sessions track the actual tour/guide experience with start/end times, locations visited, and photos.

### Start Session

Start a tour session (Guide only).

**Endpoint:** `POST /v2/berseguide/sessions/start`  
**Authentication:** Required

**Request Body:**
```json
{
  "bookingId": "booking_123",
  "notes": "Starting the tour at Shibuya crossing"
}
```

**Response:**
```json
{
  "id": "session_123",
  "bookingId": "booking_123",
  "guideId": "user_123",
  "travelerId": "user_456",
  "date": "2025-11-05",
  "startTime": "2025-11-05T14:00:00Z",
  "endTime": null,
  "actualDuration": null,
  "locationsCovered": [],
  "notes": "Starting the tour at Shibuya crossing",
  "createdAt": "2025-11-05T14:00:00Z"
}
```

**Errors:**
- `403`: Only guide can start session
- `400`: Booking must be approved first
- `409`: Active session already exists

---

### Update Session

Update an ongoing session with locations and notes (Guide only).

**Endpoint:** `PATCH /v2/berseguide/sessions/:sessionId`  
**Authentication:** Required

**Request Body:**
```json
{
  "locationsCovered": ["Shibuya Crossing", "Meiji Shrine", "Takeshita Street"],
  "notes": "Great energy from the group, everyone loved the ramen spot",
  "photos": ["https://example.com/photo1.jpg"]
}
```

**Response:** Updated session object

**Errors:**
- `403`: Only guide can update
- `400`: Cannot update ended session

---

### End Session

End a tour session (Guide only).

**Endpoint:** `POST /v2/berseguide/sessions/:sessionId/end`  
**Authentication:** Required

**Request Body:**
```json
{
  "locationsCovered": ["Shibuya", "Harajuku", "Shinjuku", "Senso-ji Temple"],
  "notes": "Fantastic tour! Group was very engaged and appreciative.",
  "photos": ["url1", "url2"]
}
```

**Response:**
```json
{
  "id": "session_123",
  "startTime": "2025-11-05T14:00:00Z",
  "endTime": "2025-11-05T18:15:00Z",
  "actualDuration": 255,
  "locationsCovered": ["Shibuya", "Harajuku", "Shinjuku", "Senso-ji Temple"],
  "notes": "Fantastic tour!...",
  "paymentCompleted": false
}
```

**Errors:**
- `403`: Only guide can end session
- `400`: Session already ended

---

### Get Sessions for Booking

Get all sessions for a specific booking.

**Endpoint:** `GET /v2/berseguide/bookings/:bookingId/sessions`  
**Authentication:** Required

**Response:** Array of session objects

**Errors:**
- `403`: Not authorized to view sessions

---

## Reviews

### Create Review

Submit a review after a completed tour.

**Endpoint:** `POST /v2/berseguide/reviews`  
**Authentication:** Required

**Request Body:**
```json
{
  "bookingId": "booking_123",
  "revieweeId": "user_123",
  "reviewerRole": "TRAVELER",
  "rating": 5,
  "review": "Incredible experience! Best guide ever!",
  "knowledge": 5,
  "communication": 5,
  "friendliness": 5,
  "value": 5,
  "wouldRecommend": true,
  "highlights": ["great_food_spots", "fun_personality", "lots_of_history"],
  "photos": ["https://example.com/photo1.jpg"],
  "isPublic": true
}
```

**Specific Ratings (1-5):**
- `knowledge`: Guide's expertise about the area
- `communication`: Communication clarity
- `friendliness`: Friendliness and hospitality
- `value`: Worth the payment/exchange

**Response:** Created review object

**Errors:**
- `400`: Booking not completed
- `409`: Review already exists

---

### Get Reviews Given

Get reviews you've written.

**Endpoint:** `GET /v2/berseguide/reviews/given`  
**Authentication:** Required

**Response:** Array of review objects

---

### Get Reviews Received

Get reviews written about you.

**Endpoint:** `GET /v2/berseguide/reviews/received`  
**Authentication:** Required

**Response:** Array of review objects

---

### Get Public Reviews for User

Get public reviews for a specific guide.

**Endpoint:** `GET /v2/berseguide/reviews/user/:userId`  
**Authentication:** Optional

**Response:** Array of public review objects

---

## Search & Discovery

### Search Guides

Search for local guides.

**Endpoint:** `GET /v2/berseguide/search`  
**Authentication:** Optional

**Query Parameters:**
- `city`: City name
- `country`: Country name
- `date`: Preferred date (YYYY-MM-DD)
- `guideTypes`: Comma-separated guide types
- `languages`: Comma-separated languages
- `minRating`: Minimum rating (0-5)
- `maxGroupSize`: Minimum group capacity
- `paymentType`: Preferred payment type
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)

**Example:**
```
GET /v2/berseguide/search?city=Tokyo&guideTypes=FOOD_DRINK,CULTURAL&languages=English&minRating=4.5
```

**Response:**
```json
{
  "data": [
    {
      "userId": "user_123",
      "title": "Tokyo Food & Culture Adventure",
      "bio": "Local guide specializing in...",
      "guideTypes": ["FOOD_DRINK", "CULTURAL"],
      "languages": ["English", "Japanese"],
      "maxGroupSize": 4,
      "city": "Tokyo",
      "rating": 4.9,
      "reviewCount": 87,
      "totalSessions": 156,
      "photos": ["url1"],
      "paymentOptions": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 234,
    "totalPages": 12
  }
}
```

---

## Dashboard

### Get Dashboard

Get personalized BerseGuide dashboard with stats and activity.

**Endpoint:** `GET /v2/berseguide/dashboard`  
**Authentication:** Required

**Response:**
```json
{
  "profile": {
    "isEnabled": true,
    "totalSessions": 156,
    "rating": 4.9,
    "reviewCount": 87,
    "responseRate": 98.5
  },
  "stats": {
    "pendingRequests": 5,
    "upcomingTours": 3,
    "completedTours": 156,
    "totalEarnings": 7800
  },
  "recentBookings": [...],
  "upcomingTours": [...],
  "recentReviews": [...]
}
```

---

## Data Models

### GuideType Enum
- `SIGHTSEEING`: General sightseeing
- `FOOD_DRINK`: Food and drink
- `CULTURAL`: Cultural experiences
- `ADVENTURE`: Adventure activities
- `NATURE`: Nature and outdoor
- `NIGHTLIFE`: Nightlife experiences
- `SHOPPING`: Shopping tours
- `PHOTOGRAPHY`: Photography tours
- `HISTORY`: Historical tours
- `ART`: Art and museums

### BerseGuideBookingStatus Enum
- `PENDING`: Awaiting guide response
- `DISCUSSING`: In conversation
- `APPROVED`: Approved by guide
- `IN_PROGRESS`: Tour in progress
- `COMPLETED`: Tour completed
- `REJECTED`: Rejected by guide
- `CANCELLED_BY_GUIDE`: Guide cancelled
- `CANCELLED_BY_TRAVELER`: Traveler cancelled

### PaymentType Enum
- `MONEY`: Monetary payment
- `SKILL_TRADE`: Skill exchange
- `TREAT_ME`: Treat to meal/activity
- `BERSE_POINTS`: Platform points
- `FREE`: Free tour
- `NEGOTIABLE`: To be discussed

### ReviewerRole Enum
- `GUIDE`: Review as guide
- `TRAVELER`: Review as traveler

---

## Unique Features

### Session Tracking
BerseGuide includes detailed session tracking that HomeSurf doesn't have:

- **Real-time updates**: Guides can update session notes and locations during the tour
- **Duration tracking**: Automatic calculation of actual tour duration
- **Location history**: Track all places visited during the tour
- **Photo documentation**: Add photos throughout the tour experience
- **Multiple sessions**: Support for multi-day or recurring tour bookings

### Payment Flexibility
More flexible payment options compared to HomeSurf:
- Hourly, half-day, and full-day rates
- Custom tour pricing
- Group discounts
- Payment after tour completion

---

## Error Responses

All endpoints return standard error format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

### Common Error Codes
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `500`: Internal Server Error

---

## Rate Limits

- **Standard endpoints:** 100 requests per 15 minutes
- **Search endpoint:** 50 requests per 15 minutes
- **Create/Update endpoints:** 20 requests per 15 minutes
- **Session management:** 30 requests per 15 minutes

---

## Best Practices

1. **Check eligibility** before creating a guide profile
2. **Start sessions** when tour actually begins for accurate tracking
3. **Update sessions** during tours with photos and locations
4. **End sessions** promptly to calculate accurate duration
5. **Request reviews** after completed tours
6. **Respond quickly** to booking requests to maintain high response rate
7. **Provide detailed itineraries** when approving bookings
8. **Use session photos** to showcase tour experiences

---

## Comparison: BerseGuide vs HomeSurf

| Feature | BerseGuide | HomeSurf |
|---------|------------|----------|
| **Purpose** | Local guide tours | Accommodation hosting |
| **Trust Score** | 65+ | 70+ |
| **Session Tracking** | ✅ Yes (detailed) | ❌ No |
| **Duration** | Hours (flexible) | Days (check-in/out) |
| **Real-time Updates** | ✅ Yes | ❌ No |
| **Location Tracking** | ✅ Yes | ❌ No |
| **Multiple Sessions** | ✅ Yes | ❌ No |
| **Payment Timing** | After tour | Before/during stay |

---

## Support

For questions or issues:
- API Documentation: `/v2/docs`
- Support Email: support@berse-app.com
- Developer Portal: https://developers.berse-app.com

---

**Last Updated:** October 23, 2025  
**API Version:** 2.0
