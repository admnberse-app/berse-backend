# BerseMuka App Backend

Community engagement platform backend for BerseMuka MVP - connecting people through events, points, and rewards.

## 🚀 Production Deployments

- **Frontend (Netlify)**: https://berse.app
- **Backend API (Railway)**: https://api.berse.app
- **Health Check**: https://api.berse.app/health

> Note: Main branch automatically deploys to production on both platforms

## Features

- User authentication and profile management
- Event creation, RSVP, and QR code check-in
- Points and rewards system
- Badge achievement system
- Social features (follow, search)
- Admin dashboard endpoints

## Tech Stack

- Node.js with TypeScript
- Express.js
- Prisma ORM with PostgreSQL
- JWT authentication
- QR code generation

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and settings.

3. Set up database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data (badges and sample rewards)
npm run prisma:seed
```

4. Create uploads directory:
```bash
mkdir uploads
```

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

### Database Management

View database:
```bash
npm run prisma:studio
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/follow/:id` - Follow user
- `DELETE /api/users/follow/:id` - Unfollow user

### Events
- `GET /api/events` - List events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (Admin/Mod)
- `PUT /api/events/:id` - Update event
- `POST /api/events/:id/rsvp` - RSVP to event
- `POST /api/events/checkin` - Check-in to event

### Points
- `GET /api/points/user/:id?` - Get user points
- `PUT /api/points/manual` - Manual points update (Admin)

### Rewards
- `GET /api/rewards` - List rewards
- `POST /api/rewards` - Create reward (Admin)
- `POST /api/rewards/redeem` - Redeem reward
- `GET /api/rewards/user` - Get user redemptions
- `PUT /api/rewards/:id/status` - Update redemption status (Admin)

### Badges
- `GET /api/badges/user/:id?` - Get user badges

## Point System

- Register: +5 pts
- Attend Event: +10 pts
- Host Event: +15 pts
- Referral: +3 pts
- Join Trip: +5 pts
- Cafe Meetup: +2 pts
- Ilm Event: +3 pts
- Volunteer: +6 pts
- Donate: +4 pts

## Development

Run type checking:
```bash
npm run typecheck
```

## License

Proprietary - BerseMuka 2025