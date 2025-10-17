# Community Module

## 📋 Overview

The Community module manages communities where users can join, create events, build connections, and establish trust through community vouches. It supports role-based permissions (ADMIN, MODERATOR, MEMBER) and community vouching system.

## ✅ Implementation Status

### Core Community Management 🚧 SKELETON
- 🚧 Create, update, delete communities
- 🚧 Search and filter communities
- 🚧 Get community details with stats
- 🚧 Community verification system
- 🚧 Category-based organization

### Community Membership 🚧 SKELETON
- 🚧 Join community (with approval flow)
- 🚧 Leave community
- 🚧 Approve/reject join requests
- 🚧 Update member roles (admin only)
- 🚧 Remove members
- 🚧 Get member list with filters
- 🚧 Member statistics

### Community Vouching 🚧 SKELETON
- 🚧 Admin vouch for members (community vouch)
- 🚧 Auto-vouch eligibility check
- 🚧 Revoke community vouches
- 🚧 Max 2 community vouches per user
- 🚧 Auto-vouch criteria: 5+ events, 90+ days, no negative feedback

### Permissions & Roles 🚧 SKELETON
- 🚧 ADMIN: Full control (create, update, delete, manage members)
- 🚧 MODERATOR: Member management, event approval
- 🚧 MEMBER: Basic participation

## 📁 Module Structure

```
src/modules/communities/
├── community.types.ts       # TypeScript interfaces ✅
├── community.validators.ts  # Express validators ✅
├── community.service.ts     # Business logic (SKELETON) 🚧
├── community.controller.ts  # HTTP handlers (SKELETON) 🚧
├── community.routes.ts      # Express routes (SKELETON) 🚧
├── index.ts                 # Module exports ✅
└── README.md                # This file ✅
```

## 🔌 API Endpoints

### Community Management
- `POST /v2/communities` - Create a new community
- `GET /v2/communities` - Get all communities with filters
- `GET /v2/communities/my` - Get communities user is member of
- `GET /v2/communities/:communityId` - Get community details
- `PUT /v2/communities/:communityId` - Update community (Admin/Mod)
- `DELETE /v2/communities/:communityId` - Delete community (Admin)

### Community Membership
- `POST /v2/communities/:communityId/join` - Join community
- `DELETE /v2/communities/:communityId/leave` - Leave community
- `GET /v2/communities/:communityId/members` - Get members
- `POST /v2/communities/:communityId/members/:userId/approve` - Approve member
- `POST /v2/communities/:communityId/members/:userId/reject` - Reject member
- `PUT /v2/communities/:communityId/members/:userId/role` - Update role
- `DELETE /v2/communities/:communityId/members/:userId` - Remove member
- `GET /v2/communities/:communityId/stats` - Get community stats

### Community Vouching
- `GET /v2/communities/:communityId/members/:userId/vouch-eligibility` - Check eligibility
- `POST /v2/communities/:communityId/members/:userId/vouch` - Grant community vouch
- `DELETE /v2/communities/:communityId/members/:userId/vouch` - Revoke vouch

## 🔗 Integration Points

### With Connections Module
- Community members can be suggested as connection recommendations
- Community vouches count toward trust score (max 2, 40% weight total)

### With Events Module
- Communities can host events (EventHostType: COMMUNITY)
- Event attendance counts toward auto-vouch eligibility
- Community events link to community in Event model

### With Trust Score Module
- Community vouches contribute 40% to overall trust score
- Each community vouch = ~20% weight
- Auto-vouch triggers after meeting criteria

### With Notifications Module
- Join request notifications to admins
- Approval/rejection notifications to users
- Role change notifications
- Community vouch granted/revoked notifications

## 📊 Database Schema

```prisma
model Community {
  id                String              @id @default(cuid())
  name              String              @unique
  description       String?
  imageUrl          String?
  category          String?
  isVerified        Boolean             @default(false)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  createdById       String
  user              User                @relation(fields: [createdById], references: [id])
  communityMembers  CommunityMember[]
  events            Event[]
}

model CommunityMember {
  id          String        @id @default(cuid())
  role        CommunityRole @default(MEMBER)
  joinedAt    DateTime      @default(now())
  isApproved  Boolean       @default(false)
  userId      String
  communityId String
  communities Community     @relation(fields: [communityId], references: [id])
  user        User          @relation(fields: [userId], references: [id])

  @@unique([userId, communityId])
}

enum CommunityRole {
  ADMIN
  MODERATOR
  MEMBER
}
```

## 🎯 Implementation Priorities

### Phase 1: Core Functionality (High Priority)
1. Create/update/delete communities
2. Join/leave communities
3. Approval flow for new members
4. Member list and basic search

### Phase 2: Role Management (Medium Priority)
5. Update member roles
6. Permission checks for all actions
7. Prevent last admin removal
8. Admin dashboard stats

### Phase 3: Vouching Integration (Medium Priority)
9. Community vouch by admins
10. Auto-vouch eligibility checking
11. Trust score integration
12. Vouch revocation

### Phase 4: Advanced Features (Low Priority)
13. Community invitations
14. Community discovery/suggestions
15. Community categories and tagging
16. Community verification system

## 🚀 Next Steps

1. **Implement CommunityService methods** - Replace all `throw new AppError` with actual logic
2. **Add permission middleware** - Create role-checking middleware for routes
3. **Integrate with VouchService** - Link community vouches to trust score
4. **Add notification triggers** - Send notifications for all member actions
5. **Write unit tests** - Test all service methods and edge cases
6. **Create API documentation** - Add to `docs/api-v2/COMMUNITIES_API.md`
7. **Register routes** - Add to `src/routes/v2/index.ts`

## 📝 TODO Comments

Each service method has detailed TODO comments explaining:
- Required validation logic
- Database operations needed
- Permission checks required
- Notification triggers
- Related data handling
- Activity logging

Use these as implementation guides when building out the actual functionality.

## 🔐 Security Considerations

- Validate community ownership before updates/deletes
- Check admin/moderator roles for member management
- Prevent last admin from leaving/being removed
- Rate limit community creation per user
- Validate unique community names
- Sanitize user inputs (name, description)
- Log all administrative actions
- Handle cascading deletes properly (members, events, vouches)
