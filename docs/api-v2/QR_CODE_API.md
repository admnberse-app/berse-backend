# QR Code Identity API Documentation

## Overview

The QR Code Identity System provides secure, time-limited QR codes for two primary use cases:
1. **User Connections** - Quick networking and connection requests
2. **Event Check-ins** - Fast and secure event attendance verification

All QR codes are JWT-signed, include one-time use nonces, and automatically expire.

---

## Table of Contents

- [Authentication](#authentication)
- [QR Code Generation](#qr-code-generation)
- [QR Code Validation](#qr-code-validation)
- [Connection via QR](#connection-via-qr)
- [Event Check-in via QR](#event-check-in-via-qr)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [Mobile Integration Guide](#mobile-integration-guide)

---

## Authentication

All endpoints require a valid Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## QR Code Generation

### Generate QR Code for Identity

**Endpoint:** `POST /v2/users/me/qr-code`

**Description:** Generate a secure, time-limited QR code for user identity. The QR code can be used for connections or event check-ins based on the specified purpose.

**Request Body:**

```json
{
  "purpose": "CONNECT",  // Required: "CONNECT" or "CHECKIN"
  "eventId": "evt_123"   // Optional: Required when purpose is "CHECKIN"
}
```

**Purposes:**
- **CONNECT**: For making connections with other users (15 min validity)
  - Use case: Profile screen, networking events
  - No eventId required
  
- **CHECKIN**: For event attendance verification (5 min validity)
  - Use case: Event detail screen when user has ticket/RSVP
  - Requires valid eventId
  - Validates user has ticket or RSVP for the event

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "qrData": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEyMyIsInB1cnBvc2UiOiJDT05ORUNUIiwidGltZXN0YW1wIjoxNzI5MzI2MDAwMDAwLCJleHAiOjE3MjkzMjY5MDAsIm5vbmNlIjoiNGE1YjZjN2QtOGU5Zi0xMGExLTJiM2MtNGQ1ZTZmN2c4aDlpIn0.signature_here",
    "purpose": "CONNECT",
    "expiresAt": "2025-10-19T03:15:00.000Z",
    "expiresIn": 900,
    "userId": "user_123",
    "eventId": null
  }
}
```

**Response (CHECKIN purpose):**

```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "qrData": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "purpose": "CHECKIN",
    "expiresAt": "2025-10-19T03:05:00.000Z",
    "expiresIn": 300,
    "userId": "user_123",
    "eventId": "evt_789"
  }
}
```

**Error Responses:**

```json
// 400 - Missing eventId for CHECKIN
{
  "success": false,
  "message": "eventId is required for CHECKIN purpose"
}

// 403 - No ticket/RSVP
{
  "success": false,
  "message": "You do not have a valid ticket or RSVP for this event"
}

// 404 - Event not found
{
  "success": false,
  "message": "Event not found"
}

// 403 - User account not active
{
  "success": false,
  "message": "User account is not active"
}
```

**cURL Example:**

```bash
# Generate CONNECT QR code
curl -X POST https://api.bersemuka.com/v2/users/me/qr-code \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "CONNECT"
  }'

# Generate CHECKIN QR code
curl -X POST https://api.bersemuka.com/v2/users/me/qr-code \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "CHECKIN",
    "eventId": "evt_abc123def456"
  }'
```

---

## QR Code Validation

### Validate QR Code

**Endpoint:** `POST /v2/users/qr-code/validate`

**Description:** Validate a QR code and retrieve user information. This is a general validation endpoint - for specific actions (connections, check-ins), use the dedicated scan endpoints.

**Request Body:**

```json
{
  "qrData": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "QR code validated successfully",
  "data": {
    "valid": true,
    "purpose": "CONNECT",
    "userId": "user_123",
    "user": {
      "id": "user_123",
      "fullName": "John Doe",
      "username": "johndoe",
      "profilePicture": "https://example.com/profile.jpg",
      "trustLevel": "ESTABLISHED",
      "trustScore": 75
    },
    "eventId": null,
    "message": "QR code is valid"
  }
}
```

**Error Responses:**

```json
// 400 - Expired or used QR code
{
  "success": false,
  "message": "QR code has expired or already been used"
}

// 400 - Invalid QR code
{
  "success": false,
  "message": "Invalid QR code"
}
```

**cURL Example:**

```bash
curl -X POST https://api.bersemuka.com/v2/users/qr-code/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## Connection via QR

### Scan QR Code to Connect

**Endpoint:** `POST /v2/connections/scan-qr`

**Description:** Scan another user's QR code to send a connection request. Handles different connection states intelligently.

**Request Body:**

```json
{
  "qrData": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 201 - New Connection Request):**

```json
{
  "success": true,
  "message": "Connection request sent via QR code",
  "data": {
    "valid": true,
    "purpose": "CONNECT",
    "userId": "user_456",
    "user": {
      "id": "user_456",
      "fullName": "Jane Smith",
      "username": "janesmith",
      "profilePicture": "https://example.com/jane.jpg",
      "trustLevel": "TRUSTED",
      "trustScore": 85
    },
    "connection": {
      "id": "conn_789",
      "status": "PENDING",
      "initiatorId": "user_123",
      "receiverId": "user_456",
      "createdAt": "2025-10-19T02:30:00.000Z",
      "relationshipType": "friend",
      "message": "Connected via QR code"
    },
    "connectionStatus": "pending",
    "message": "Connection request sent successfully"
  }
}
```

**Response (200 - Already Connected):**

```json
{
  "success": true,
  "message": "Already connected",
  "data": {
    "valid": true,
    "purpose": "CONNECT",
    "userId": "user_456",
    "user": {
      "id": "user_456",
      "fullName": "Jane Smith",
      "username": "janesmith",
      "profilePicture": "https://example.com/jane.jpg",
      "trustLevel": "TRUSTED",
      "trustScore": 85
    },
    "connectionStatus": "connected",
    "message": "You are already connected with this user"
  }
}
```

**Response (200 - Request Pending):**

```json
{
  "success": true,
  "message": "Request already sent",
  "data": {
    "connectionStatus": "pending",
    "message": "Connection request already pending"
  }
}
```

**Error Responses:**

```json
// 400 - Wrong QR purpose
{
  "success": false,
  "message": "This QR code is not for making connections"
}

// 400 - Self-connection attempt
{
  "success": false,
  "message": "You cannot connect with yourself"
}

// 403 - User is blocked
{
  "success": false,
  "message": "Cannot send connection request"
}
```

**cURL Example:**

```bash
curl -X POST https://api.bersemuka.com/v2/connections/scan-qr \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## Event Check-in via QR

### Scan QR Code for Event Check-in

**Endpoint:** `POST /v2/events/scan-qr`

**Description:** Scan an attendee's QR code to check them in to an event. Only event organizers can use this endpoint.

**Request Body:**

```json
{
  "qrData": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Attendee checked in successfully via QR code",
  "data": {
    "valid": true,
    "purpose": "CHECKIN",
    "userId": "user_789",
    "user": {
      "id": "user_789",
      "fullName": "Mike Johnson",
      "username": "mikej",
      "profilePicture": "https://example.com/mike.jpg",
      "trustLevel": "BUILDING",
      "trustScore": 60
    },
    "eventId": "evt_abc123",
    "attendance": {
      "id": "att_xyz789",
      "userId": "user_789",
      "eventId": "evt_abc123",
      "checkedInAt": "2025-10-19T14:30:00.000Z",
      "checkedInBy": "user_123",
      "qrCode": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "ticketId": "tkt_456",
      "status": "ATTENDED"
    },
    "event": {
      "id": "evt_abc123",
      "title": "Tech Meetup October 2025",
      "date": "2025-10-19T18:00:00.000Z"
    },
    "message": "Check-in successful"
  }
}
```

**Error Responses:**

```json
// 400 - Wrong QR purpose
{
  "success": false,
  "message": "This QR code is not for event check-in"
}

// 403 - Not event organizer
{
  "success": false,
  "message": "You do not have permission to check-in attendees for this event"
}

// 404 - No ticket/RSVP found
{
  "success": false,
  "message": "Attendee does not have a valid ticket or RSVP"
}

// 400 - Already checked in
{
  "success": false,
  "message": "Attendee already checked in"
}
```

**cURL Example:**

```bash
curl -X POST https://api.bersemuka.com/v2/events/scan-qr \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## Security Features

### JWT Token Structure

QR codes contain JWT tokens with the following payload:

```json
{
  "userId": "user_123",
  "purpose": "CONNECT",
  "eventId": "evt_789",  // Only for CHECKIN purpose
  "timestamp": 1729326000000,
  "exp": 1729326900,     // Unix timestamp
  "nonce": "4a5b6c7d-8e9f-10a1-2b3c-4d5e6f7g8h9i"
}
```

### Security Measures

1. **JWT Signing**: All tokens are cryptographically signed with server secret
2. **Expiration**: 
   - CONNECT: 15 minutes
   - CHECKIN: 5 minutes
3. **Nonce System**: One-time use tokens stored in Redis
4. **Replay Prevention**: Nonces are deleted after first use
5. **Purpose Validation**: QR codes can only be used for their intended purpose
6. **Permission Checks**: Event organizer verification, user status validation
7. **Redis Caching**: Fast lookup with automatic expiry

### Best Practices

- **Generate QR on-demand**: Don't pre-generate and store
- **Display refresh timer**: Show countdown to expiration
- **Auto-refresh**: Regenerate QR when it expires
- **Secure transmission**: Only send QR data over HTTPS
- **Don't screenshot**: Discourage users from sharing QR screenshots

---

## Error Handling

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | QR code data is required | Missing qrData in request |
| 400 | Invalid QR code | Malformed JWT token |
| 400 | QR code has expired | Token expired or nonce used |
| 400 | Wrong purpose | QR code purpose mismatch |
| 400 | You cannot connect with yourself | Self-connection attempt |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | User account is not active | Suspended/deleted account |
| 403 | No permission | Not event organizer |
| 404 | User not found | Invalid userId in QR |
| 404 | Event not found | Invalid eventId |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"  // Optional
}
```

---

## Mobile Integration Guide

### Connection Flow (Profile Screen)

```typescript
// 1. User taps "Show My QR Code" button
async function showConnectionQR() {
  try {
    const response = await api.post('/v2/users/me/qr-code', {
      purpose: 'CONNECT'
    });
    
    const { qrData, expiresAt, expiresIn } = response.data.data;
    
    // 2. Display QR code using qrData
    displayQRCode(qrData);
    
    // 3. Show expiration timer
    startCountdown(expiresIn);
    
    // 4. Auto-refresh when expired
    setTimeout(() => showConnectionQR(), expiresIn * 1000);
    
  } catch (error) {
    showError(error.message);
  }
}

// Other user scans the QR
async function scanConnectionQR(scannedData: string) {
  try {
    const response = await api.post('/v2/connections/scan-qr', {
      qrData: scannedData
    });
    
    const { connectionStatus, user, message } = response.data.data;
    
    if (connectionStatus === 'connected') {
      showMessage('Already connected!');
    } else if (connectionStatus === 'pending') {
      showMessage('Connection request sent!');
    }
    
    // Display user profile
    showUserProfile(user);
    
  } catch (error) {
    showError(error.message);
  }
}
```

### Event Check-in Flow

```typescript
// Attendee: Generate check-in QR from event detail page
async function showCheckInQR(eventId: string) {
  try {
    const response = await api.post('/v2/users/me/qr-code', {
      purpose: 'CHECKIN',
      eventId: eventId
    });
    
    const { qrData, expiresIn } = response.data.data;
    
    displayQRCode(qrData);
    startCountdown(expiresIn);
    
    // Auto-refresh every 5 minutes
    setTimeout(() => showCheckInQR(eventId), expiresIn * 1000);
    
  } catch (error) {
    if (error.status === 403) {
      showError('You need a ticket or RSVP to check in');
    } else {
      showError(error.message);
    }
  }
}

// Organizer: Scan attendee QR
async function scanCheckInQR(scannedData: string) {
  try {
    const response = await api.post('/v2/events/scan-qr', {
      qrData: scannedData
    });
    
    const { user, event, attendance } = response.data.data;
    
    // Show success animation
    showCheckInSuccess();
    
    // Display attendee info
    showAttendeeCard({
      name: user.fullName,
      trustLevel: user.trustLevel,
      trustScore: user.trustScore,
      checkedInAt: attendance.checkedInAt
    });
    
    // Play success sound
    playSuccessSound();
    
  } catch (error) {
    if (error.status === 403) {
      showError('Not authorized to check-in attendees');
    } else {
      showError(error.message);
    }
  }
}
```

### UI Recommendations

**QR Display Screen:**
- Large QR code (minimum 200x200px)
- User's profile picture and name above QR
- Countdown timer showing time remaining
- Purpose badge (CONNECT or CHECK-IN)
- Refresh button for manual regeneration
- Warning: "Don't share screenshots"

**QR Scanner Screen:**
- Camera viewfinder with guide overlay
- Flash/torch toggle
- Purpose indicator (what will happen after scan)
- Recent scans history
- Manual entry option for QR data

**Success States:**
- Connection: Show other user's profile, "Request Sent" badge
- Check-in: Green checkmark, attendee name, timestamp
- Already connected: Blue badge, "Already Friends"
- Pending: Yellow badge, "Request Pending"

---

## Testing

### Test Scenarios

**1. Generate CONNECT QR Code**
```bash
POST /v2/users/me/qr-code
Body: { "purpose": "CONNECT" }
Expected: 201, qrData with 15min expiry
```

**2. Generate CHECKIN QR Code**
```bash
POST /v2/users/me/qr-code
Body: { "purpose": "CHECKIN", "eventId": "evt_123" }
Expected: 201, qrData with 5min expiry
```

**3. Scan for Connection**
```bash
POST /v2/connections/scan-qr
Body: { "qrData": "<generated_token>" }
Expected: 201, connection created
```

**4. Scan for Check-in**
```bash
POST /v2/events/scan-qr
Body: { "qrData": "<generated_token>" }
Expected: 201, attendance marked
```

**5. Expired QR Code**
- Wait for expiration
- Try to scan
- Expected: 400, "QR code has expired"

**6. Replay Attack**
- Scan same QR twice
- Expected: 400, "QR code has expired or already been used"

**7. Wrong Purpose**
- Generate CONNECT QR
- Scan with /events/scan-qr
- Expected: 400, "This QR code is not for event check-in"

---

## Rate Limiting

- QR generation: 20 requests per minute per user
- QR scanning: 100 requests per minute per user
- Validation: 50 requests per minute per user

---

## Support

For issues or questions:
- Email: support@bersemuka.com
- Documentation: https://docs.bersemuka.com
- Status: https://status.bersemuka.com
