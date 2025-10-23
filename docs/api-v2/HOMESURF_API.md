# HomeSurf API Documentation

**Version:** 2.0  
**Base URL:** `/v2/homesurf`  
**Status:** Production Ready

## Overview

HomeSurf is Berse's couchsurfing-style accommodation feature that allows trusted community members to host travelers. This API provides endpoints for profile management, booking workflows, payment options, reviews, and discovery.

### Trust Requirements
- **Minimum Trust Score:** 70
- **Required Levels:** TRUSTED, VERIFIED, or AMBASSADOR
- Users below trust threshold cannot enable HomeSurf

---

## Table of Contents

1. [Profile Management](#profile-management)
2. [Payment Options](#payment-options)
3. [Booking Workflow](#booking-workflow)
4. [Check-in/Check-out](#check-incheck-out)
5. [Reviews](#reviews)
6. [Search & Discovery](#search--discovery)
7. [Dashboard](#dashboard)
8. [Data Models](#data-models)

---

## Profile Management

### Check Eligibility

Check if the current user can enable HomeSurf based on trust score.

**Endpoint:** `GET /v2/homesurf/eligibility`  
**Authentication:** Required

**Response:**
```json
{
  "canEnable": true,
  "trustScore": 75,
  "requiredScore": 70,
  "message": "You meet the trust requirements for HomeSurf"
}
```

---

### Get My Profile

Retrieve the authenticated user's HomeSurf profile.

**Endpoint:** `GET /v2/homesurf/profile`  
**Authentication:** Required

**Response:**
```json
{
  "userId": "user_123",
  "isEnabled": true,
  "title": "Cozy Studio in Downtown Tokyo",
  "bio": "Welcome to my home! I love hosting travelers...",
  "accommodationType": "PRIVATE_ROOM",
  "maxGuests": 2,
  "amenities": ["wifi", "kitchen", "washer"],
  "houseRules": ["no smoking", "no pets"],
  "paymentOptions": [
    {
      "id": "opt_123",
      "paymentType": "FREE",
      "description": "Free stay for cultural exchange",
      "isPreferred": true
    }
  ],
  "location": {
    "city": "Tokyo",
    "neighborhood": "Shibuya",
    "address": "123 Main St" // Only visible to approved guests
  },
  "photos": ["url1", "url2"],
  "responseRate": 95.5,
  "averageResponseTime": 4,
  "rating": 4.8,
  "reviewCount": 24,
  "totalGuests": 48,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-10-20T14:30:00Z"
}
```

---

### Get Profile by ID

Retrieve another user's HomeSurf profile (public view).

**Endpoint:** `GET /v2/homesurf/profile/:userId`  
**Authentication:** Optional

**Response:** Same as "Get My Profile" but with limited information:
- Address hidden
- Exact coordinates hidden
- Contact details hidden

---

### Create Profile

Create a new HomeSurf profile.

**Endpoint:** `POST /v2/homesurf/profile`  
**Authentication:** Required

**Request Body:**
```json
{
  "title": "Cozy Studio in Downtown Tokyo",
  "bio": "Welcome to my home! I love hosting travelers and sharing local culture.",
  "accommodationType": "PRIVATE_ROOM",
  "maxGuests": 2,
  "bedrooms": 1,
  "beds": 1,
  "bathrooms": 1,
  "amenities": ["wifi", "kitchen", "washer", "air_conditioning"],
  "photos": ["https://example.com/photo1.jpg"],
  "houseRules": ["no smoking", "no pets"],
  "city": "Tokyo",
  "state": "Tokyo",
  "country": "Japan",
  "neighborhood": "Shibuya",
  "address": "123 Main St",
  "postalCode": "150-0002",
  "latitude": 35.6595,
  "longitude": 139.7004,
  "availabilityNotes": "Available most weekends",
  "minimumStay": 1,
  "maximumStay": 7,
  "advanceNotice": 24
}
```

**Response:** Created profile object (201 Created)

**Errors:**
- `403`: Trust requirements not met
- `409`: Profile already exists

---

### Update Profile

Update existing HomeSurf profile.

**Endpoint:** `PATCH /v2/homesurf/profile`  
**Authentication:** Required

**Request Body:** Same as create, all fields optional

**Response:** Updated profile object

---

### Toggle Profile

Enable or disable HomeSurf profile.

**Endpoint:** `PATCH /v2/homesurf/profile/toggle`  
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

Permanently delete HomeSurf profile.

**Endpoint:** `DELETE /v2/homesurf/profile`  
**Authentication:** Required

**Response:** 200 OK

**Errors:**
- `400`: Cannot delete with active bookings

---

## Payment Options

### Add Payment Option

Add a payment/exchange option to your profile.

**Endpoint:** `POST /v2/homesurf/payment-options`  
**Authentication:** Required

**Request Body:**
```json
{
  "paymentType": "SKILL_TRADE",
  "amount": 0,
  "currency": "USD",
  "description": "Teach me guitar or photography",
  "isPreferred": false
}
```

**Payment Types:**
- `MONEY`: Monetary payment
- `SKILL_TRADE`: Exchange skills
- `TREAT_ME`: Treat host to meal/activity
- `BERSE_POINTS`: Use platform points
- `FREE`: Free accommodation
- `NEGOTIABLE`: Discuss terms

**Response:** Payment option object

---

### Update Payment Option

**Endpoint:** `PATCH /v2/homesurf/payment-options/:optionId`  
**Authentication:** Required

**Request Body:** Partial payment option fields

**Response:** Updated payment option

---

### Delete Payment Option

**Endpoint:** `DELETE /v2/homesurf/payment-options/:optionId`  
**Authentication:** Required

**Response:** 200 OK

---

## Booking Workflow

### Create Booking Request

Request to stay at a host's place.

**Endpoint:** `POST /v2/homesurf/bookings`  
**Authentication:** Required

**Request Body:**
```json
{
  "hostId": "user_123",
  "checkInDate": "2025-11-01",
  "checkOutDate": "2025-11-03",
  "numberOfGuests": 2,
  "message": "Hi! I'm visiting Tokyo for a conference...",
  "interestedInPaymentType": "TREAT_ME"
}
```

**Response:**
```json
{
  "id": "booking_123",
  "hostId": "user_123",
  "guestId": "user_456",
  "status": "PENDING",
  "checkInDate": "2025-11-01",
  "checkOutDate": "2025-11-03",
  "numberOfGuests": 2,
  "message": "Hi! I'm visiting Tokyo...",
  "requestedAt": "2025-10-23T10:00:00Z"
}
```

**Errors:**
- `400`: Invalid dates
- `409`: Host not available for these dates

---

### Check Availability

Check if a host is available for specific dates.

**Endpoint:** `POST /v2/homesurf/availability`  
**Authentication:** Optional

**Request Body:**
```json
{
  "hostId": "user_123",
  "checkInDate": "2025-11-01",
  "checkOutDate": "2025-11-03"
}
```

**Response:**
```json
{
  "available": true,
  "message": "Host is available for these dates"
}
```

---

### Get Booking

Retrieve booking details.

**Endpoint:** `GET /v2/homesurf/bookings/:bookingId`  
**Authentication:** Required

**Response:** Full booking object with host/guest details

**Errors:**
- `403`: Not authorized to view this booking
- `404`: Booking not found

---

### Get Bookings as Host

Get all bookings for your hosted stays.

**Endpoint:** `GET /v2/homesurf/bookings/host`  
**Authentication:** Required

**Query Parameters:**
- `status`: Filter by status (PENDING, APPROVED, COMPLETED, etc.)
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

### Get Stays as Guest

Get all your booking requests as a guest.

**Endpoint:** `GET /v2/homesurf/bookings/guest`  
**Authentication:** Required

**Query Parameters:** Same as bookings/host

---

### Approve Booking

Approve a booking request (Host only).

**Endpoint:** `PATCH /v2/homesurf/bookings/:bookingId/approve`  
**Authentication:** Required

**Request Body:**
```json
{
  "agreedPaymentType": "TREAT_ME",
  "agreedPaymentAmount": 0,
  "agreedPaymentDetails": "Let's get dinner together!"
}
```

**Response:** Updated booking with status APPROVED

**Errors:**
- `403`: Only host can approve
- `400`: Invalid booking status for approval

---

### Reject Booking

Reject a booking request (Host only).

**Endpoint:** `PATCH /v2/homesurf/bookings/:bookingId/reject`  
**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Dates no longer available"
}
```

**Response:** Updated booking with status REJECTED

---

### Cancel Booking

Cancel a booking (Host or Guest).

**Endpoint:** `PATCH /v2/homesurf/bookings/:bookingId/cancel`  
**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

**Response:** Updated booking with status CANCELLED_BY_HOST or CANCELLED_BY_GUEST

---

## Check-in/Check-out

### Check-in Guest

Mark guest as checked in (Host only).

**Endpoint:** `POST /v2/homesurf/bookings/:bookingId/check-in`  
**Authentication:** Required

**Response:** Updated booking with status CHECKED_IN

**Errors:**
- `403`: Only host can check-in
- `400`: Must be approved and on/after check-in date

---

### Check-out Guest

Mark guest as checked out (Host only).

**Endpoint:** `POST /v2/homesurf/bookings/:bookingId/check-out`  
**Authentication:** Required

**Response:** Updated booking with status COMPLETED

**Errors:**
- `403`: Only host can check-out
- `400`: Must be checked in first

---

## Reviews

### Create Review

Submit a review after a completed stay.

**Endpoint:** `POST /v2/homesurf/reviews`  
**Authentication:** Required

**Request Body:**
```json
{
  "bookingId": "booking_123",
  "revieweeId": "user_123",
  "reviewerRole": "GUEST",
  "rating": 5,
  "review": "Amazing host! Very welcoming and helpful.",
  "cleanliness": 5,
  "communication": 5,
  "hospitality": 5,
  "location": 4,
  "accuracy": 5,
  "wouldStayAgain": true,
  "highlights": ["great_host", "clean_space", "good_location"],
  "isPublic": true
}
```

**Response:** Created review object

**Errors:**
- `400`: Booking not completed
- `409`: Review already exists

---

### Get Reviews Given

Get reviews you've written.

**Endpoint:** `GET /v2/homesurf/reviews/given`  
**Authentication:** Required

**Response:** Array of review objects

---

### Get Reviews Received

Get reviews written about you.

**Endpoint:** `GET /v2/homesurf/reviews/received`  
**Authentication:** Required

**Response:** Array of review objects

---

### Get Public Reviews for User

Get public reviews for a specific user.

**Endpoint:** `GET /v2/homesurf/reviews/user/:userId`  
**Authentication:** Optional

**Response:** Array of public review objects

---

## Search & Discovery

### Search Profiles

Search for HomeSurf hosts.

**Endpoint:** `GET /v2/homesurf/search`  
**Authentication:** Optional

**Query Parameters:**
- `city`: City name
- `country`: Country name
- `checkInDate`: Check-in date (YYYY-MM-DD)
- `checkOutDate`: Check-out date (YYYY-MM-DD)
- `guests`: Number of guests
- `accommodationType`: Filter by type
- `amenities`: Comma-separated amenities
- `paymentType`: Preferred payment type
- `minRating`: Minimum rating (0-5)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)

**Example:**
```
GET /v2/homesurf/search?city=Tokyo&guests=2&amenities=wifi,kitchen&minRating=4.5
```

**Response:**
```json
{
  "data": [
    {
      "userId": "user_123",
      "title": "Cozy Studio in Downtown Tokyo",
      "accommodationType": "PRIVATE_ROOM",
      "maxGuests": 2,
      "city": "Tokyo",
      "rating": 4.8,
      "reviewCount": 24,
      "photos": ["url1"],
      "paymentOptions": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## Dashboard

### Get Dashboard

Get personalized HomeSurf dashboard with stats and activity.

**Endpoint:** `GET /v2/homesurf/dashboard`  
**Authentication:** Required

**Response:**
```json
{
  "profile": {
    "isEnabled": true,
    "totalGuests": 48,
    "rating": 4.8,
    "reviewCount": 24,
    "responseRate": 95.5
  },
  "stats": {
    "pendingRequests": 3,
    "upcomingStays": 2,
    "completedStays": 24,
    "totalEarnings": 0
  },
  "recentBookings": [...],
  "upcomingStays": [...],
  "recentReviews": [...]
}
```

---

## Data Models

### AccommodationType Enum
- `ENTIRE_PLACE`: Entire home/apartment
- `PRIVATE_ROOM`: Private room in shared space
- `SHARED_ROOM`: Shared room

### HomeSurfBookingStatus Enum
- `PENDING`: Awaiting host response
- `DISCUSSING`: In conversation
- `APPROVED`: Approved by host
- `CHECKED_IN`: Guest has checked in
- `COMPLETED`: Stay completed
- `REJECTED`: Rejected by host
- `CANCELLED_BY_HOST`: Host cancelled
- `CANCELLED_BY_GUEST`: Guest cancelled

### PaymentType Enum
- `MONEY`: Monetary payment
- `SKILL_TRADE`: Skill exchange
- `TREAT_ME`: Treat to meal/activity
- `BERSE_POINTS`: Platform points
- `FREE`: Free stay
- `NEGOTIABLE`: To be discussed

### ReviewerRole Enum
- `HOST`: Review as host
- `GUEST`: Review as guest

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

---

## Best Practices

1. **Check eligibility** before creating a profile
2. **Validate dates** before creating booking requests
3. **Check availability** before requesting to book
4. **Complete bookings** before leaving reviews
5. **Handle errors** gracefully with appropriate user messages
6. **Cache search results** to reduce API calls
7. **Use pagination** for large result sets

---

## Support

For questions or issues:
- API Documentation: `/v2/docs`
- Support Email: support@berse-app.com
- Developer Portal: https://developers.berse-app.com

---

**Last Updated:** October 23, 2025  
**API Version:** 2.0
