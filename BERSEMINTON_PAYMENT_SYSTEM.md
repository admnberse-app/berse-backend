# BerseMinton Payment System Documentation

## Overview
Simple QR code payment system for BerseMinton sports events by Sukan Squad.

## How It Works

### For Users:
1. Click "Register" on any BerseMinton event in BerseConnect screen
2. Fill in personal details (name, phone, email)
3. Select number of sessions (1, 4, or 8 sessions)
4. View QR code and bank account details for payment
5. Make bank transfer to: **Maybank 162354789652 (Sukan Squad)**
6. Upload payment receipt (image or PDF)
7. Receive registration ID for reference

### For Organizers:
1. View registered participants by clicking "👥 Participants" button on event
2. See registration stats:
   - Total confirmed participants
   - Pending verifications
   - Total revenue collected
3. Filter participants by status (All/Confirmed/Pending)

## Data Storage
All registration data is stored in browser localStorage under key: `berseMintonRegistrations`

### Registration Data Structure:
```javascript
{
  id: "BM123456",           // Unique registration ID
  eventId: "berseminton-venue1",
  name: "John Doe",
  phone: "0123456789",
  email: "john@email.com",
  sessions: "4",            // Number of sessions
  amount: 60,               // Total amount (RM)
  receiptFileName: "receipt.jpg",
  timestamp: "2025-08-16T08:00:00Z",
  status: "pending"         // or "confirmed"
}
```

## Pricing
- 1 Session: RM15
- 4 Sessions (Monthly): RM60
- 8 Sessions (2 Months): RM120

## Features
✅ Simple 3-step registration process
✅ QR code display for easy payment
✅ Receipt upload functionality
✅ Unique registration ID generation
✅ Participant list with filtering
✅ Revenue tracking
✅ Session package options

## Future Enhancements
- Backend integration for persistent storage
- Automatic payment verification
- Email/WhatsApp notifications
- Admin dashboard for approval
- Export participant list to Excel
- Integration with actual payment gateway (Stripe/PayPal)