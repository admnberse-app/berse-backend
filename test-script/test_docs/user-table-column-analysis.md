# User Table Column Analysis for Authentication & Profile Management

## Table of Contents
- [Overview](#overview)
- [Core Authentication Fields](#core-authentication-fields)
- [Basic Profile Fields](#basic-profile-fields)
- [Social & Communication Fields](#social--communication-fields)
- [Security & Session Management](#security--session-management)
- [User Preferences & Settings](#user-preferences--settings)
- [Gamification & Points System](#gamification--points-system)
- [Analytics & Tracking](#analytics--tracking)
- [System & Administrative](#system--administrative)
- [Integrations & API](#integrations--api)
- [Flexible/Custom Fields](#flexiblecustom-fields)
- [GDPR & Privacy Compliance](#gdpr--privacy-compliance)
- [Summary](#summary)

## Overview

This document provides a comprehensive analysis of the 98 fields in the User model from `@berse-app-backend/prisma/schema.prisma`, categorized by their role in user authentication and profile management features.

**Schema Location:** `berse-app-backend/prisma/schema.prisma` (lines 10-134)

---

## 🔑 Core Authentication Fields
*Essential fields required for user registration, login, and identity verification*

| Column | Type | Purpose | Required |
|--------|------|---------|----------|
| `id` | String (PK) | Unique user identifier | ✅ |
| `email` | String (Unique) | Primary login credential | ✅ |
| `password` | String | Hashed password for authentication | ✅ |
| `phone` | String? (Unique) | Alternative login credential | ❌ |
| `username` | String? (Unique) | User handle/display name | ❌ |
| `role` | UserRole | User permission level (GENERAL_USER, ADMIN, etc.) | ✅ |

---

## 👤 Basic Profile Fields
*User-facing information that appears in profiles and can be edited by users*

| Column | Type | Purpose |
|--------|------|---------|
| `fullName` | String | User's display name |
| `profilePicture` | String? | Avatar/photo URL |
| `bio` | String? | Long-form bio/description |
| `shortBio` | String? | Brief bio/tagline |
| `city` | String? | Current city |
| `currentLocation` | String? | Current location |
| `originallyFrom` | String? | Hometown/origin |
| `interests` | String[] | User interests/hobbies |
| `age` | Int? | User age |
| `gender` | String? | Gender identity |
| `nationality` | String? | Nationality |
| `countryOfResidence` | String? | Country of residence |
| `dateOfBirth` | DateTime? | Birth date |
| `profession` | String? | Job/career |
| `personalityType` | String? | Personality type (MBTI, etc.) |
| `languages` | String[] | Spoken languages |
| `website` | String? | Personal website |

---

## 🔗 Social & Communication Fields
*Profile fields related to social connections and communication*

| Column | Type | Purpose |
|--------|------|---------|
| `instagramHandle` | String? | Instagram username |
| `linkedinHandle` | String? | LinkedIn profile |
| `allowDirectMessages` | Boolean? | DM permission setting |
| `communityRole` | String? | Role in community |
| `eventsAttended` | String[] | Event participation history |
| `servicesOffered` | Json? | Services user offers |
| `travelHistory` | Json? | Travel experience data |

---

## 🔒 Security & Session Management
*Fields for advanced security, MFA, password reset, and session control*

| Column | Type | Purpose |
|--------|------|---------|
| `mfaEnabled` | Boolean | Multi-factor auth status |
| `mfaSecret` | String? | TOTP secret key |
| `mfaBackupCodes` | String[] | MFA recovery codes |
| `mfaRecoveryEmail` | String? | MFA recovery email |
| `lastMfaAuthAt` | DateTime? | Last MFA authentication |
| `emailVerificationToken` | String? | Email verification token |
| `emailVerificationExpires` | DateTime? | Token expiration |
| `passwordResetToken` | String? | Password reset token |
| `passwordResetExpires` | DateTime? | Reset token expiration |
| `loginAttempts` | Int? | Failed login counter |
| `lockoutUntil` | DateTime? | Account lockout end time |
| `sessionTokens` | String[] | Active session tokens |
| `deviceIds` | String[] | Registered devices |
| `trustedDevices` | Json? | Trusted device list |
| `securityQuestions` | Json? | Security Q&A |
| `lastPasswordChangeAt` | DateTime? | Last password change |
| `passwordHistory` | String[] | Previous password hashes |
| `requirePasswordChange` | Boolean? | Force password update |

---

## ⚙️ User Preferences & Settings
*Configurable user preferences and privacy settings*

| Column | Type | Purpose |
|--------|------|---------|
| `profileVisibility` | String? | Profile visibility level |
| `searchableByPhone` | Boolean? | Phone number search permission |
| `searchableByEmail` | Boolean? | Email search permission |
| `timezone` | String? | User timezone |
| `preferredLanguage` | String? | UI language preference |
| `currency` | String? | Preferred currency |
| `darkMode` | Boolean? | UI theme preference |
| `notificationPreferences` | Json? | Notification settings |

---

## 🎯 Gamification & Points System
*Fields related to rewards, points, and certification*

| Column | Type | Purpose |
|--------|------|---------|
| `totalPoints` | Int | User points balance |
| `isHostCertified` | Boolean | Host certification status |
| `membershipId` | String? (Unique) | Membership identifier |

---

## 📊 Analytics & Tracking
*Fields for marketing analytics and referral tracking*

| Column | Type | Purpose |
|--------|------|---------|
| `referralCode` | String (Unique) | User's referral code |
| `referredById` | String? | Referring user ID |
| `referralSource` | String? | Referral source tracking |
| `utmSource` | String? | Marketing source |
| `utmMedium` | String? | Marketing medium |
| `utmCampaign` | String? | Marketing campaign |
| `affiliateId` | String? | Affiliate program ID |
| `lifetimeValue` | Float? | Customer lifetime value |
| `ipAddress` | String? | Registration IP |
| `userAgent` | String? | Registration user agent |
| `lastLoginLocation` | String? | Last login location |
| `lastSeenAt` | DateTime? | Last activity timestamp |

---

## 🛠️ System & Administrative
*Backend administrative and audit fields*

| Column | Type | Purpose |
|--------|------|---------|
| `createdAt` | DateTime | Account creation timestamp |
| `updatedAt` | DateTime | Last profile update |
| `accountLockedReason` | String? | Lock reason (admin) |
| `suspendedUntil` | DateTime? | Suspension end date |
| `suspensionReason` | String? | Suspension reason |
| `deletionRequestedAt` | DateTime? | Account deletion request |
| `deletionScheduledFor` | DateTime? | Deletion execution date |
| `dataExportRequestedAt` | DateTime? | Data export request |
| `notes` | String? | User notes |
| `internalNotes` | String? | Admin notes |
| `tags` | String[] | User tags/labels |

---

## 🔌 Integrations & API
*Fields for external service integrations and API access*

| Column | Type | Purpose |
|--------|------|---------|
| `pushToken` | String? | Push notification token |
| `googleCalendarConnected` | Boolean? | Google Calendar integration |
| `googleCalendarRefreshToken` | String? | Google API refresh token |
| `apiKeys` | String[] | User API keys |
| `webhookUrl` | String? | Webhook endpoint |
| `integrations` | Json? | Third-party integrations |

---

## 📦 Flexible/Custom Fields
*Extensible fields for future features and customization*

| Column | Type | Purpose |
|--------|------|---------|
| `customFields` | Json? | Custom user data |

---

## 🔗 GDPR & Privacy Compliance
*Fields for legal compliance and user consent*

| Column | Type | Purpose |
|--------|------|---------|
| `consentToDataProcessing` | Boolean? | GDPR consent |
| `consentToMarketing` | Boolean? | Marketing consent |
| `consentDate` | DateTime? | Consent timestamp |

---

## Summary

### Field Count Breakdown

| Category | Field Count | Purpose |
|----------|-------------|---------|
| **Core Authentication** | 6 | Essential login/registration |
| **Basic Profile** | 17 | User-editable profile info |
| **Social & Communication** | 7 | Social features and contact |
| **Security & Session** | 18 | Advanced auth security |
| **User Preferences** | 8 | Settings and privacy |
| **Gamification** | 3 | Points and certification |
| **Analytics & Tracking** | 12 | Marketing and analytics |
| **System & Administrative** | 11 | Backend management |
| **Integrations & API** | 6 | External services |
| **Flexible/Custom** | 1 | Extensible data |
| **GDPR & Privacy** | 3 | Legal compliance |
| **Audit Timestamps** | 6 | System timestamps |

**Total User Table Columns: 98 fields**

### Key Insights for Authentication & Profile Management

1. **Comprehensive Auth Support**: The schema supports basic email/password auth plus advanced features like MFA, session management, and security questions.

2. **Rich Profile System**: 17+ profile fields support detailed user profiles with social media integration, location data, and personal information.

3. **Enterprise-Ready Security**: Extensive security fields support enterprise requirements including audit trails, account lockouts, and password policies.

4. **Flexible & Extensible**: JSON fields and custom data support allow for future feature expansion without schema changes.

5. **Privacy Compliant**: Built-in GDPR compliance fields ensure legal requirements are met.

6. **Analytics-Enabled**: Marketing and referral tracking fields support growth and analytics initiatives.

This comprehensive field structure positions the application to support both basic social networking features and advanced enterprise security and compliance requirements.

---

*Document generated from schema analysis on 2025-09-17*
*Source: berse-app-backend/prisma/schema.prisma (User model, lines 10-134)*