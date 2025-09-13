# Detailed User Journey: Authentication and Profile Management

This document provides a detailed breakdown of the user journey for authentication and profile management, based on the application's source code.

## 1. Onboarding a New User

This journey describes how a new user creates an account and gets started.

**Actor:** A new visitor to the BerseMuka platform.

**Goal:** To become a registered member and have a basic profile.

**Steps & System Interactions:**

1.  **Initiates Registration:** The user navigates to the registration page on the frontend.
2.  **Submits Information:** The user fills out the registration form with their `email`, `password`, and `fullName`. They may optionally provide `phone`, `username`, `nationality`, `countryOfResidence`, `city`, `gender`, `dateOfBirth`, and a `referralCode`.
3.  **Frontend Validation:** The frontend performs basic validation (e.g., checking for empty fields, password complexity).
4.  **API Call:** The frontend sends a `POST` request to the `/api/auth/register` endpoint.
5.  **Backend Processing (`AuthController.register`):**
    *   The backend validates the incoming data (e.g., valid email format, password length).
    *   It checks if a user with the same `email`, `phone`, or `username` already exists in the database. If so, it returns an error.
    *   If a `referralCode` is provided, it validates the code and identifies the referring user.
    *   The user's `password` is securely hashed.
    *   A new `User` record is created in the database with the provided information.
    *   The system awards registration points to the new user (`PointsService.awardPoints`).
    *   If referred, the referring user is awarded referral points.
    *   A JWT access token and a refresh token are generated (`JwtManager.generateTokenPair`).
6.  **Successful Response:** The backend returns a `201 Created` response containing the new `user` object and the `accessToken` and `refreshToken`.
7.  **Session Creation:** The frontend stores the `accessToken` (typically in memory) and the `refreshToken` (often in a secure `HttpOnly` cookie, as handled by the backend).
8.  **Redirect:** The user is redirected to their new profile or the main dashboard, now in a logged-in state.

## 2. Returning User Login

This journey describes how a registered user logs into their account.

**Actor:** An existing user with an account.

**Goal:** To access their account and use the platform's features.

**Steps & System Interactions:**

1.  **Initiates Login:** The user navigates to the login page.
2.  **Enters Credentials:** The user provides their `email` and `password`.
3.  **API Call:** The frontend sends a `POST` request to `/api/auth/login`.
4.  **Backend Processing (`AuthController.login`):**
    *   The backend finds the user in the database by their `email`.
    *   It compares the provided `password` with the hashed password stored in the database.
    *   If the credentials are valid, it generates a new JWT `accessToken` and `refreshToken`.
5.  **Successful Response:** The backend returns a `200 OK` response with the `user` object and the new tokens.
6.  **Session Update:** The frontend securely stores the new tokens, replacing any old ones.
7.  **Redirect:** The user is granted access and redirected to the main application dashboard.

## 3. Managing a User Profile

This journey describes how a user views and customizes their public profile.

**Actor:** A logged-in user.

**Goal:** To view, update, and personalize their profile information.

**Steps & System Interactions:**

### A. Viewing the Profile

1.  **Navigation:** The user navigates to their profile page (e.g., by clicking their avatar).
2.  **API Call:** The frontend sends a `GET` request to `/api/users/profile`. This request includes the user's `accessToken` in the `Authorization` header.
3.  **Backend Processing (`UserController.getProfile`):**
    *   The `authenticateToken` middleware validates the `accessToken`.
    *   The controller fetches the complete profile for the authenticated user from the database, including details like `fullName`, `bio`, `interests`, `totalPoints`, and counts of events hosted/attended.
4.  **Renders Profile:** The backend returns the user's profile data, which the frontend then displays.

### B. Updating the Profile

1.  **Initiates Edit:** The user clicks an "Edit Profile" button.
2.  **Modifies Information:** The user changes various fields, such as their `bio`, `city`, `interests`, `instagramHandle`, etc.
3.  **API Call:** The user saves the changes, triggering a `PUT` request to `/api/users/profile`. The request body contains only the fields that were changed.
4.  **Backend Processing (`UserController.updateProfile`):**
    *   The `authenticateToken` middleware validates the token.
    *   The controller receives the updated data and updates the corresponding fields in the `User` record in the database.
5.  **Successful Response:** The backend returns a `200 OK` response with the fully updated user object.
6.  **UI Update:** The frontend updates the display with the new profile information.

## 4. Security and Access Control

This journey describes security-related actions a user can perform.

**Actor:** A logged-in user.

**Goal:** To manage their account's security.

**Steps & System Interactions:**

### A. Changing Password

1.  **Navigation:** User goes to the "Security" or "Account Settings" section of their profile.
2.  **Enters Passwords:** User provides their `currentPassword` and a `newPassword`.
3.  **API Call:** Frontend sends a `POST` request to `/api/auth/change-password`.
4.  **Backend Processing (`AuthController.changePassword`):**
    *   The backend verifies the `currentPassword` is correct.
    *   It hashes the `newPassword`.
    *   It updates the user's password in the database.
    *   For enhanced security, it revokes all of the user's existing refresh tokens (`JwtManager.revokeAllUserTokens`), forcing them to log in again on all devices.
5.  **Response:** The backend confirms the password was changed and instructs the user to log in again.

### B. Logging Out

1.  **Initiates Logout:** User clicks the "Logout" button.
2.  **API Call:** Frontend sends a `POST` request to `/api/auth/logout`.
3.  **Backend Processing (`AuthController.logout`):**
    *   The backend revokes the specific `refreshToken` associated with the current session.
    *   It clears the `refreshToken` cookie.
4.  **Session Cleared:** The frontend deletes its stored `accessToken` and redirects the user to the public homepage or login page.
