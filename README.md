# Berse App Backend

Complete social networking and trust-building platform backend - connecting people through authentic relationships, travel experiences, service offerings, and community engagement.

## 🚀 Production Deployments

- **Frontend (Netlify)**: https://berse.app
- **Backend API (Railway)**: https://api.berse.app
- **Health Check**: https://api.berse.app/health

> Note: Main branch automatically deploys to production on both platforms

## 🚀 Development Phases

### 🎯 **MVP (Launch Ready) - Core Value Proposition**

#### ✅ **Must Have for MVP**

**🔐 Authentication & User Management** *(Essential)*
- User registration and login with JWT tokens
- Basic profile management (name, bio, location, interests)
- Email verification and password reset
- Session management with refresh tokens

**🏆 Events System** *(Core Community Feature)*
- Create and join events
- RSVP system
- See event attendees
- Basic event check-in

**🤝 Basic Trust Chain** *(MVP Differentiator)*
- Simple trust moments/feedback system
- Basic trust score calculation
- Manual connection validation (meet in person → give feedback)

**🎮 BerseCardGame** *(Engagement Hook)*
- Question/topic system
- Feedback and rating mechanism
- Basic community interaction

**🏅 Points & Rewards** *(Retention Mechanism)*
- Points for event attendance and basic actions
- Simple rewards redemption system
- Basic point history

**👤 Profile Discovery** *(Core Social Feature)*
- Browse user profiles
- Basic search functionality
- View what services people offer (in profile settings)
- Location-based discovery

---

### 🔄 **Phase 2 (Post-MVP) - Enhanced Engagement**

#### 🎯 **Advanced Social Features**

**🎯 Smart Matching System**
- AI-powered recommendations
- Advanced compatibility scoring
- Detailed filtering and preferences

**💬 Real-time Messaging**
- WebSocket-based chat system
- Live notifications and alerts
- Message history and conversations

**🌐 Community Management**
- Topic-based communities
- Community moderation tools
- Community-specific events and discussions

**✈️ Travel Logbook** *(Trust Chain Enhancement)*
- Document travel experiences with countries and cities
- Connect with Berse community members met during travels
- Travel verification through community validation
- Global travel statistics and insights

---

### 🚀 **Phase 3 (Scale & Monetization) - Service Marketplace**

#### 🛍️ **Full Service Offerings**

**Revenue-Generating Services:**
- **Local Guide Services**: Monetization ready with booking system
- **Homestay Hosting**: Revenue generation through accommodation
- **Marketplace**: Transaction fees on product/service sales
- **Professional Networking**: Premium features and subscriptions
- **BerseBuddy & BerseMentor**: Subscription tiers for enhanced matching

#### 📊 **Advanced Platform Features**
- Advanced analytics dashboard
- Multi-factor authentication
- Advanced gamification (leaderboards, challenges)
- Payment processing integration
- API monetization for third-party integrations

---

## 📋 **MVP Implementation Timeline**

### **Week 1-2: Core Foundation**
```
✅ User Registration/Login system
✅ Basic Profile Management interface
✅ Database schema for MVP features
✅ Authentication middleware setup
```

### **Week 3-4: Events & Trust**
```
🏆 Event creation and joining system
🤝 Basic trust feedback mechanism
📍 Location-based event discovery
🔒 Event privacy and moderation
```

### **Week 5-6: Engagement & Discovery**
```
🎮 BerseCardGame implementation
👤 Profile discovery and search functionality
🏅 Points system integration
📊 Basic analytics dashboard
```

### **Week 7-8: Polish & Launch**
```
🔧 Bug fixes and performance optimization
🎨 UI/UX improvements and mobile responsiveness
🧪 User acceptance testing
🚀 MVP launch preparation and deployment
```

---

## 🎯 **MVP Success Metrics**

### **Key Performance Indicators**
1. **User Registration Rate** - Sign-up conversion from landing page
2. **Event Participation** - Number of events created and joined
3. **Trust Interactions** - Feedback given and received between users
4. **Profile Completion** - Percentage of users who fill out service offerings
5. **Retention Rate** - Daily and weekly active user engagement
6. **Points Engagement** - Points earned and rewards redeemed

### **Launch Goals**
- **Month 1**: 500 registered users in Kuala Lumpur
- **Month 2**: 50+ events created, 80% user retention
- **Month 3**: 1,000 active users, 200+ trust interactions
- **Phase 2 Readiness**: Validated product-market fit for enhanced features

---

## 🌟 Complete Feature Roadmap

### 🔐 Authentication & User Management
- ✅ **MVP**: Secure registration, basic profiles, email verification
- 🔄 **Phase 2**: Advanced profile customization, privacy controls
- 🚀 **Phase 3**: Multi-factor authentication, enterprise features

### 🤝 Trust Chain System  
- ✅ **MVP**: Basic trust feedback and scoring
- 🔄 **Phase 2**: Travel-based verification, mutual validation
- 🚀 **Phase 3**: Decentralized trust network, reputation algorithms

### 🏆 Events & Activities
- ✅ **MVP**: Event creation, RSVP, basic check-in
- 🔄 **Phase 2**: QR code check-ins, event analytics
- 🚀 **Phase 3**: Paid events, enterprise event management

### 🎯 Matching & Discovery
- ✅ **MVP**: Basic profile search and discovery
- 🔄 **Phase 2**: AI-powered matching, compatibility scoring
- 🚀 **Phase 3**: Premium matching features, advanced algorithms

### 🛍️ Service Marketplace
- ✅ **MVP**: Service listings in profiles
- 🔄 **Phase 2**: Basic service categories and discovery
- 🚀 **Phase 3**: Full marketplace with payments and transactions

### 🎮 Community Features
- ✅ **MVP**: BerseCardGame, basic interactions
- 🔄 **Phase 2**: Topic communities, real-time messaging  
- 🚀 **Phase 3**: Advanced moderation, community monetization

## 🛠️ Tech Stack

### Backend Framework
- **Node.js** with **TypeScript** for type-safe development
- **Express.js** web framework with comprehensive middleware
- **Prisma ORM** for database management and migrations
- **PostgreSQL** as primary database with optimized schemas

### Security & Authentication  
- **JWT** tokens with refresh token rotation
- **bcrypt** for password hashing
- **Helmet** for security headers
- **CORS** configuration for cross-origin requests
- **Rate limiting** and request validation
- **CSRF** protection with token-based verification

### Real-time & Communication
- **Socket.io** for real-time messaging and updates
- **Web Push** notifications for mobile devices
- **WebSocket** connections for live features
- **Nodemailer** for email communications

### Performance & Scaling
- **Redis** for caching and session management
- **Compression** middleware for response optimization
- **Morgan** logging with Winston for production
- **Cluster mode** support for horizontal scaling

### Development & Deployment
- **Docker** containerization support
- **Railway** for production deployment
- **Netlify** for frontend hosting  
- **ESLint** and **Prettier** for code quality
- **Jest** for comprehensive testing
- **GitHub Actions** for CI/CD pipelines

### External Integrations
- **Twilio** for SMS communications  
- **Payment gateway** integration ready
- **QR code** generation for event check-ins
- **Speakeasy** for 2FA implementation

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

## 📚 API Documentation

### 🔐 Authentication (`/api/v1/auth`)
- `POST /auth/register` - User registration with email verification
- `POST /auth/login` - User authentication with JWT tokens
- `POST /auth/refresh` - Refresh access token using refresh token
- `POST /auth/logout` - Secure logout with token invalidation
- `POST /auth/forgot-password` - Request password reset link
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/verify-email` - Verify email address with token

### 👤 User Management (`/api/v1/users`)
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile and settings
- `GET /users/search` - Search users with filters
- `GET /users/:id` - Get specific user profile
- `POST /users/follow/:id` - Follow another user
- `DELETE /users/follow/:id` - Unfollow user
- `GET /users/:id/followers` - Get user's followers
- `GET /users/:id/following` - Get users being followed

### 🎯 Matching System (`/api/v1/matching`)
- `GET /matching` - Get user's matches and connections
- `POST /matching` - Create new match request
- `GET /matching/:matchId` - Get specific match details
- `PUT /matching/:matchId/respond` - Accept/decline match request
- `POST /matching/find` - Find potential matches with criteria
- `GET /matching/recommendations` - Get AI-powered match suggestions
- `POST /matching/friend-request` - Send friend request
- `GET /matching/search` - Search for users to connect with

### 🏆 Events & Activities (`/api/v1/events`)
- `GET /events` - List all upcoming events
- `POST /events` - Create new event (authenticated users)
- `GET /events/:id` - Get detailed event information
- `PUT /events/:id` - Update event details (creator/admin)
- `DELETE /events/:id` - Delete event (creator/admin)
- `POST /events/:id/join` - Join/RSVP to event
- `POST /events/:id/leave` - Leave event
- `GET /events/:id/attendees` - Get event attendees list
- `POST /events/:id/checkin` - Check-in to event with QR code

### 🌐 Communities (`/api/v1/communities`)
- `GET /communities` - List all public communities
- `GET /communities/search` - Search communities by topic/name
- `GET /communities/my` - Get user's joined communities
- `POST /communities` - Create new community
- `GET /communities/:id` - Get community details
- `POST /communities/:id/join` - Join community
- `POST /communities/:id/leave` - Leave community
- `GET /communities/:id/members` - Get community members

### 🎮 Card Game System (`/api/v1/cardgame`)
- `POST /cardgame/feedback` - Submit feedback for a question
- `GET /cardgame/feedback` - Get user's feedback history
- `GET /cardgame/feedback/topic/:topicId` - Get topic-specific feedback
- `GET /cardgame/stats` - Get topic statistics and analytics
- `DELETE /cardgame/feedback/:feedbackId` - Delete user feedback
- `POST /cardgame/upvote` - Upvote community feedback
- `POST /cardgame/reply` - Reply to feedback

### 💬 Messaging System (`/api/v1/messages`)
- `GET /messages` - Get user's message conversations
- `POST /messages` - Send new message
- `GET /messages/:conversationId` - Get conversation messages
- `PUT /messages/:messageId/read` - Mark message as read
- `DELETE /messages/:messageId` - Delete message
- `POST /messages/conversation` - Start new conversation

### 🔔 Push Notifications (`/api/v1/push`)
- `POST /push/subscribe` - Subscribe to push notifications
- `POST /push/unsubscribe` - Unsubscribe from notifications
- `GET /push/subscriptions` - Get user's active subscriptions
- `POST /push/test` - Send test notification

### 🏅 Points & Rewards System
- `GET /api/points/user/:id?` - Get user points balance and history
- `PUT /api/points/manual` - Manual points adjustment (Admin)
- `GET /api/rewards` - List available rewards
- `POST /api/rewards` - Create new reward (Admin)
- `POST /api/rewards/redeem` - Redeem reward with points
- `GET /api/rewards/user` - Get user's redemption history
- `PUT /api/rewards/:id/status` - Update redemption status (Admin)

### 🎖️ Badge System
- `GET /api/badges/user/:id?` - Get user's earned badges
- `GET /api/badges/available` - Get all available badges
- `POST /api/badges/award` - Award badge to user (Admin)

### 📊 Analytics & Health
- `GET /api/v1/health` - API health check and status
- `GET /api/v1/docs` - Interactive API documentation
- `GET /api/analytics/dashboard` - Get platform analytics (Admin)

### 🔒 Admin Endpoints (Require Admin Role)
- `GET /api/admin/users` - Manage users
- `PUT /api/admin/users/:id/role` - Update user roles
- `GET /api/admin/reports` - Get platform reports
- `POST /api/admin/announcements` - Create platform announcements

## 🎯 Gamification System

### Points Earning Structure
- **User Registration**: +5 points (one-time)
- **Event Attendance**: +10 points per event
- **Event Hosting**: +15 points per event
- **Successful Referral**: +3 points per new user
- **Travel Logbook Entry**: +5 points per verified trip
- **Service Offering**: +2 points per listing
- **Community Participation**: +3 points per meaningful contribution
- **Volunteer Activities**: +6 points per verified activity
- **Community Donations**: +4 points per contribution
- **Profile Completion**: +2 points per section completed
- **Trust Verification**: +8 points per mutual verification
- **Positive Reviews**: +1 point per review received

### Badge Achievement System
- **Explorer**: Complete travel logbook entries for 5+ countries
- **Connector**: Successfully match with 10+ community members
- **Host Master**: Host 5+ events with positive feedback
- **Trusted Member**: Achieve trust score of 80+
- **Community Builder**: Create or moderate active communities
- **Service Provider**: Maintain 4.5+ star rating across 20+ services
- **Early Adopter**: Join platform within first 1000 users
- **Global Citizen**: Verify connections across 3+ continents

### Trust Chain Mechanics
- **Initial Trust Score**: 50 points (new users)
- **Verification Bonus**: +10 points per verified connection
- **Travel Validation**: +5 points per confirmed travel experience
- **Service Completion**: +3 points per successful service delivery
- **Community Endorsement**: +2 points per peer endorsement
- **Penalty System**: -5 to -20 points for policy violations

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Load Balancer │    │   Backend API   │
│   (React)       │◄──►│   (Railway)     │◄──►│   (Node.js)     │
│   Netlify       │    │                 │    │   Express       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │   Redis Cache   │◄─────────────┤
                       │   (Sessions)    │              │
                       └─────────────────┘              │
                                                        │
                       ┌─────────────────┐              │
                       │   PostgreSQL    │◄─────────────┤
                       │   (Primary DB)  │              │
                       └─────────────────┘              │
                                                        │
                       ┌─────────────────┐              │
                       │   Socket.io     │◄─────────────┘
                       │   (Real-time)   │
                       └─────────────────┘
```

### Database Schema Highlights
- **Users**: Complete profile management with trust scores
- **Trust Chain**: Decentralized verification network
- **Travel Logbook**: Geographic and temporal tracking
- **Service Offerings**: Marketplace with 6 service categories
- **Events**: Community event management
- **Matching**: Advanced compatibility algorithms
- **Communities**: Topic-based user groupings
- **Gamification**: Points, badges, and rewards system

### Security Architecture
- **JWT Authentication** with refresh token rotation
- **CORS** protection with whitelist validation
- **Rate limiting** per endpoint and user
- **Input validation** with Zod schemas
- **SQL injection** protection via Prisma ORM
- **XSS protection** with helmet middleware
- **CSRF tokens** for state-changing operations

## 🚀 Development Guide

### Environment Setup
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# Seed database with initial data
npm run prisma:seed

# Create uploads directory
mkdir uploads
```

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Type checking without compilation
npm run typecheck

# Build for production
npm run build

# Run production server
npm start

# Database management
npm run prisma:studio

# Run tests
npm test
npm run test:backend
npm run test:e2e

# Code quality
npm run lint
npm run lint:fix
npm run format
```

### Docker Development
```bash
# Build and start all services
npm run docker:up

# View logs
npm run docker:logs

# Rebuild containers
npm run docker:rebuild

# Stop all services
npm run docker:down
```

## 📈 Monitoring & Analytics

### Health Endpoints
- `GET /health` - Basic server health
- `GET /api/v1/health` - Comprehensive API health
- `GET /api/analytics/dashboard` - Platform metrics (Admin)

### Performance Metrics
- Response time monitoring
- Database query optimization
- Cache hit rates
- WebSocket connection stats
- Trust chain calculation performance

## 🔄 Contributing

### Commit Message Format
```
feat: add travel logbook verification system
fix: resolve trust score calculation bug
docs: update API documentation for matching
perf: optimize database queries for events
```

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation if needed
4. Ensure all tests pass
5. Request code review
6. Deploy to staging for testing
7. Merge to `main` for production deployment

## 📖 Additional Documentation

### Feature Documentation
- [Trust Chain Integration](./docs/trust-chain-integration-plan.md)
- [Travel Logbook User Journey](./docs/travel-logbook-user-journey.md)
- [Service Offerings ERD](./docs/offerings-erd.md)
- [UML Diagrams](./docs/trust-chain-uml-diagrams.md)

### API Reference
- Interactive API docs: `GET /api/v1/docs`
- Postman collection: Available in `/docs` folder
- Authentication guide: See authentication endpoints above

## 🌍 Deployment

### Production Environments
- **Frontend**: Auto-deploy from `main` branch to Netlify
- **Backend**: Auto-deploy from `main` branch to Railway
- **Database**: PostgreSQL on Railway with automated backups
- **Cache**: Redis cluster for session management

### Environment Variables
See `.env.example` for complete configuration options including:
- Database connection strings
- JWT secrets and expiration times
- CORS allowed origins
- External service API keys
- Email and SMS provider credentials

## 📝 License

Proprietary - Berse App 2025

## 🤝 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs` folder

---

**Built with ❤️ by the Berse Team**