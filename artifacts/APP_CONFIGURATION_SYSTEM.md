# App Configuration & Content Management System

## Overview
Comprehensive system for managing mobile app configuration, content, and user experience dynamically without requiring app updates.

**Version:** 2.8.0  
**Date:** October 14, 2025  
**Migration:** `20251014103130_add_app_configuration_system`

---

## 📋 Tables Added

### 1. **AppConfig** - General App Settings
Dynamic key-value configuration store for app-wide settings.

**Use Cases:**
- App version control (minimum/current version)
- Feature toggles
- API endpoints
- UI configuration
- Default settings

**Key Fields:**
- `configKey` (unique): Configuration identifier
- `configValue`: JSON string for complex values
- `dataType`: string, number, boolean, json
- `isPublic`: Expose to mobile app API
- `isEditable`: Can be edited via admin panel

**Example Configs:**
```json
{
  "configKey": "min_supported_version_ios",
  "configValue": "1.0.0",
  "dataType": "string",
  "isPublic": true
}
```

---

### 2. **OnboardingScreen** - Onboarding Flow Management
Manage multiple onboarding screens with analytics tracking.

**Features:**
- Customizable order (drag & drop in admin)
- Rich content (title, subtitle, description, images, videos)
- CTA buttons with actions
- Skippable configuration
- Target audience filtering
- Version-specific screens

**Analytics Tracked:**
- Views, completions, skips
- Time spent per screen
- Drop-off points

**Use Cases:**
- Welcome tutorials
- Feature introductions
- Permission requests
- Value proposition showcases

---

### 3. **AppVersion** - Version Control & Changelogs
Track app versions across platforms with release notes.

**Features:**
- Platform-specific (iOS, Android, Web)
- Version number + build code
- Markdown changelogs
- Force update flag
- Minimum supported version
- Release types (alpha, beta, stable, hotfix)

**Example:**
```json
{
  "versionNumber": "1.2.0",
  "platform": "IOS",
  "isForceUpdate": false,
  "releaseNotes": "## What's New\n- Dark mode support\n- Bug fixes"
}
```

---

### 4. **LegalDocument** - Terms, Privacy Policy, etc.
Version-controlled legal documents with user acceptance tracking.

**Document Types:**
- Terms of Service (TOS)
- Privacy Policy
- EULA
- Cookie Policy
- Community Guidelines
- Refund Policy
- Acceptable Use

**Features:**
- Full version history
- Effective dates
- Change summaries
- Require user acceptance
- Approval workflow

**Related Table:**
- `LegalDocumentAcceptance`: Tracks user consent with IP, device info

---

### 5. **Announcement** - News & Updates
Targeted announcements with advanced scheduling and analytics.

**Features:**
- Priority levels (LOW, NORMAL, HIGH, URGENT)
- Display types (banner, modal, inline, push)
- Rich media (images, videos)
- CTA buttons
- Advanced targeting:
  - By country
  - By user segment
  - By app version
  - By subscription tier
- Scheduling (publish/expire dates)
- Pin important announcements
- Dismissible or persistent

**Analytics:**
- View count
- Click count
- Dismissal tracking

---

### 6. **FAQ** - Frequently Asked Questions
Categorized FAQ system with helpfulness tracking.

**Features:**
- Category organization
- Display order
- Featured FAQs
- Tags for search
- Related FAQs/articles
- Helpfulness votes (helpful/not helpful)

**Analytics:**
- View count
- Helpfulness rating
- Search queries that led to FAQ

---

### 7. **HelpArticle** - Comprehensive Documentation
Full help center with rich content and search optimization.

**Features:**
- Category organization
- Rich content (Markdown/HTML)
- Media support (images, videos, attachments)
- SEO optimization
- Related articles
- Premium-only content option
- Featured articles

**Analytics:**
- View count
- Time spent reading
- Scroll depth
- Helpfulness rating

---

### 8. **MaintenanceSchedule** - Planned Maintenance
Communicate scheduled maintenance to users proactively.

**Features:**
- Start/end times
- Estimated duration
- Affected features list
- Full downtime vs. partial
- Severity levels
- User-facing message
- Status updates during maintenance
- Automatic notifications

**Statuses:**
- SCHEDULED
- IN_PROGRESS
- COMPLETED
- CANCELLED
- DELAYED

---

### 9. **FeatureFlag** - A/B Testing & Feature Rollouts
Gradual feature rollouts with advanced targeting.

**Features:**
- Enable/disable features remotely
- Percentage-based rollout (0-100%)
- User whitelist
- Segment targeting
- Country/platform filtering
- App version constraints
- A/B testing support
- Feature dependencies
- Scheduled activation

**Use Cases:**
- Test new features with small user group
- A/B test UI changes
- Emergency feature kill switch
- Beta program management

---

### 10. **AppNotice** - In-App Notices & Banners
Contextual notices displayed throughout the app.

**Types:**
- INFO
- WARNING
- ERROR
- SUCCESS
- PROMOTION
- UPDATE

**Features:**
- Display locations (home, profile, settings, all screens)
- Display styles (banner, toast, modal, inline)
- Priority ordering
- Auto-dismiss capability
- Dismissible or persistent
- Advanced targeting
- CTA buttons

**Analytics:**
- Impressions
- Dismissals
- Clicks

---

## 📊 Analytics Tables

All major content types have dedicated analytics tables:

1. **OnboardingAnalytics** - Track onboarding funnel
2. **AnnouncementAnalytics** - Announcement engagement
3. **FAQAnalytics** - FAQ effectiveness
4. **HelpArticleAnalytics** - Article engagement
5. **FeatureFlagAnalytics** - Feature usage by segment

**Tracked Metrics:**
- Views
- Clicks
- Completions
- Time spent
- Drop-off points
- Device/platform info
- Search context

---

## 🎯 Key Features

### ✅ Multi-Language Ready
Schema supports multi-language expansion (currently English only).

### ✅ Advanced Targeting
Target content by:
- Country
- User segment (new, active, premium, etc.)
- App version
- Platform (iOS, Android, Web)
- Subscription tier

### ✅ Rich Content Support
All content fields support **Markdown/HTML** for easy editing and rich formatting.

### ✅ Version Control
Full version history for legal documents and app versions.

### ✅ Analytics Tracking
Comprehensive analytics on all user interactions.

### ✅ Admin Panel Ready
All tables designed for easy admin panel integration.

---

## 🚀 Next Steps

### 1. **Seed Initial Data**
Create a seed file to populate:
- Default app configs
- Initial onboarding screens
- Current app version
- TOS & Privacy Policy v1.0
- FAQ categories
- Help article categories

### 2. **API Endpoints**
Create endpoints for:
```
GET /api/app/config - Public app configs
GET /api/app/version/:platform - Latest version info
GET /api/onboarding/screens - Active onboarding screens
GET /api/legal/:type - Latest legal document
POST /api/legal/:id/accept - Accept legal document
GET /api/announcements - Active announcements
GET /api/faq - FAQ list with categories
GET /api/help/articles - Help articles
GET /api/notices - Active app notices
GET /api/features/:key - Check feature flag
```

### 3. **Admin Panel**
Build admin UI for:
- App config management
- Onboarding screen builder
- Announcement composer
- FAQ editor
- Help article CMS
- Maintenance scheduler
- Feature flag dashboard
- Version management

### 4. **Mobile App Integration**
Mobile app should:
- Fetch configs on app start
- Cache onboarding screens
- Check version requirements
- Display announcements appropriately
- Track analytics events
- Respect feature flags

---

## 📝 Sample API Response Structures

### App Config
```json
{
  "configs": {
    "min_supported_version_ios": "1.0.0",
    "maintenance_mode": false,
    "api_base_url": "https://api.berse.app"
  }
}
```

### Onboarding Screens
```json
{
  "screens": [
    {
      "id": "uuid",
      "screenOrder": 1,
      "title": "Welcome to Berse",
      "subtitle": "Connect with trusted people",
      "description": "Build meaningful connections...",
      "imageUrl": "https://...",
      "ctaText": "Next",
      "ctaAction": "next",
      "isSkippable": true
    }
  ]
}
```

### Active Announcements
```json
{
  "announcements": [
    {
      "id": "uuid",
      "title": "New Feature: Dark Mode",
      "content": "Enjoy our new dark mode...",
      "priority": "HIGH",
      "imageUrl": "https://...",
      "isPinned": true,
      "ctaText": "Try Now",
      "ctaUrl": "/settings/appearance"
    }
  ]
}
```

---

## 🔒 Security Considerations

1. **User Consent Tracking**
   - IP address, user agent, device info for legal document acceptance
   - Audit trail for compliance (GDPR, etc.)

2. **Content Sanitization**
   - Sanitize HTML/Markdown before rendering
   - Validate URLs in CTAs

3. **Admin Access Control**
   - Track who created/modified content (`createdBy` fields)
   - Approval workflows for legal documents

4. **Feature Flag Security**
   - Server-side validation
   - Don't expose sensitive flags to client

---

## 📈 Analytics Dashboard Ideas

### Content Performance
- Most viewed FAQs
- Most helpful articles
- Announcement engagement rates
- Onboarding completion rates

### Feature Adoption
- Feature flag adoption rates by segment
- A/B test results
- Platform-specific metrics

### User Journey
- Onboarding drop-off points
- Help article search patterns
- Common support queries

---

## ✅ Migration Applied Successfully

The migration `20251014103130_add_app_configuration_system` has been applied successfully to your database.

All 21 new tables are now available:
- 10 main content tables
- 9 analytics tables
- 2 category tables
- 6 new enums

**Ready for:**
1. Seed data creation
2. API endpoint development
3. Admin panel integration
4. Mobile app implementation

---

## 📞 Support

For questions or issues with the app configuration system:
1. Check this documentation
2. Review seed data examples
3. Test endpoints with Postman
4. Monitor analytics for insights

**Happy configuring! 🎉**
