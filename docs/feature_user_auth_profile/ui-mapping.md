# User Auth & Profile UI Component Mapping

## 🎯 Exact Integration Points Based on Current Code

Based on the analysis of the backend codebase, here's the precise mapping of where User Authentication and Profile Management features will be integrated on the frontend.

---

## 🔑 1. Authentication Screens

### A. Login Screen

**Assumed File**: `frontend/src/screens/LoginScreen.tsx`

**UI Components**:
- Email/Phone Input
- Password Input
- Login Button
- "Forgot Password?" Link
- "Don't have an account? Sign Up" Link

**Backend Interaction**:
- **On Login Button Click**:
    - **API Endpoint**: `POST /api/auth/login`
    - **Backend File**: `berse-app-backend/src/routes/auth.routes.ts`
    - **Controller**: `auth.controller.ts` -> `login()`
    - **Payload**: `{ "email": "...", "password": "..." }`
    - **Success Response**: JWT token and user data. The token is stored in client-side state management and/or secure storage.
    - **Error Handling**: Display errors for invalid credentials, server issues, etc.

```tsx
// frontend/src/screens/LoginScreen.tsx (Illustrative)

const handleLogin = async (data) => {
  try {
    const response = await apiClient.post('/auth/login', data);
    // Save token, redirect to profile or home
    authContext.login(response.data.token, response.data.user);
  } catch (error) {
    // Display error message
  }
};
```

### B. Registration Screen

**Assumed File**: `frontend/src/screens/RegisterScreen.tsx`

**UI Components**:
- Full Name Input
- Email Input
- Phone Number Input
- Password Input
- Confirm Password Input
- Referral Code Input (Optional)
- Sign Up Button
- "Already have an account? Log In" Link

**Backend Interaction**:
- **On Sign Up Button Click**:
    - **API Endpoint**: `POST /api/auth/register`
    - **Backend File**: `berse-app-backend/src/routes/auth.routes.ts`
    - **Controller**: `auth.controller.ts` -> `register()`
    - **Payload**: `{ "fullName": "...", "email": "...", "phone": "...", "password": "...", "referralCode": "..." }`
    - **Success Response**: JWT token and new user data.
    - **Error Handling**: Display errors for existing email/phone, password mismatch, invalid inputs.

```tsx
// frontend/src/screens/RegisterScreen.tsx (Illustrative)

const handleRegister = async (data) => {
  if (data.password !== data.confirmPassword) {
    // show error
    return;
  }
  try {
    const response = await apiClient.post('/auth/register', data);
    // Save token, redirect to profile
    authContext.login(response.data.token, response.data.user);
  } catch (error) {
    // Display error message from server
  }
};
```

---

## 👤 2. User Profile Screens

### A. View Profile Screen

**Assumed File**: `frontend/src/screens/ProfileScreen.tsx`

**UI Components**:
- Profile Picture
- Full Name
- Bio
- City
- Interests
- Social Media Handles (Instagram, LinkedIn)
- "Edit Profile" Button
- User's Posts/Activity Feed
- Followers/Following counts

**Backend Interaction**:
- **On Screen Load**:
    - **API Endpoint**: `GET /api/users/profile` (assuming it gets the current user's profile) or `GET /api/users/:id`
    - **Backend File**: `berse-app-backend/src/routes/user.routes.ts`
    - **Controller**: `user.controller.ts` -> `getUserProfile()`
    - **Middleware**: `auth.ts` is used to protect this route and identify the user from the JWT token.
    - **Success Response**: User profile data.

```tsx
// frontend/src/screens/ProfileScreen.tsx (Illustrative)

useEffect(() => {
  const fetchProfile = async () => {
    try {
      // The auth middleware will identify the user from the token
      const response = await apiClient.get('/users/profile');
      setProfileData(response.data);
    } catch (error) {
      // Handle error
    }
  };
  fetchProfile();
}, []);
```

### B. Edit Profile Screen

**Assumed File**: `frontend/src/screens/EditProfileScreen.tsx`

**UI Components**:
- Form with inputs for all editable profile fields (Full Name, Bio, City, Interests, Social Handles).
- Profile Picture Uploader.
- "Save Changes" Button.

**Backend Interaction**:
- **On "Save Changes" Button Click**:
    - **API Endpoint**: `PUT /api/users/profile`
    - **Backend File**: `berse-app-backend/src/routes/user.routes.ts`
    - **Controller**: `user.controller.ts` -> `updateUserProfile()`
    - **Middleware**: `auth.ts` protects the route.
    - **Payload**: `{ "fullName": "...", "bio": "...", ... }`
    - **Success Response**: Updated user profile data.
    - **Error Handling**: Display errors for invalid data.

```tsx
// frontend/src/screens/EditProfileScreen.tsx (Illustrative)

const handleProfileUpdate = async (formData) => {
  try {
    const response = await apiClient.put('/users/profile', formData);
    // Update local state and show success message
    setProfileData(response.data);
    navigation.goBack();
  } catch (error) {
    // Display error message
  }
};
```

---

## ⚙️ 3. Core Components & State Management

### A. Auth Middleware (Frontend)

**Assumed File**: `frontend/src/middleware/auth.ts` or similar concept in UI framework.

- A high-level component or logic that wraps protected parts of the app.
- It checks for the presence of a JWT token in state/storage.
- If no token exists, it redirects the user to the `LoginScreen`.
- It can also handle token expiration and trigger a refresh mechanism.

### B. Auth Context / State

**Assumed File**: `frontend/src/contexts/AuthContext.tsx`

- A global state provider to manage authentication status.
- **State**: `user`, `token`, `isAuthenticated`.
- **Actions**: `login(token, user)`, `logout()`, `loadUserFromStorage()`.
- This context will make user and auth status available throughout the component tree.

```tsx
// frontend/src/contexts/AuthContext.tsx (Illustrative)

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    // save to async storage
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // remove from async storage
  };

  const value = { user, token, isAuthenticated: !!token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

---

## 📊 Integration Summary

### Backend Files Involved:
1. ✅ `prisma/schema.prisma` - Defines the `User` model.
2. ✅ `src/routes/auth.routes.ts` - Defines `/login` and `/register` endpoints.
3. ✅ `src/routes/user.routes.ts` - Defines profile-related endpoints.
4. ✅ `src/controllers/auth.controller.ts` - Handles login/registration logic.
5. ✅ `src/controllers/user.controller.ts` - Handles profile data logic.
6. ✅ `src/middleware/auth.ts` - Secures protected routes.

### Assumed New/Modified Frontend Files:
1. ✅ `screens/LoginScreen.tsx` - Handles user login.
2. ✅ `screens/RegisterScreen.tsx` - Handles user registration.
3. ✅ `screens/ProfileScreen.tsx` - Displays user profile.
4. ✅ `screens/EditProfileScreen.tsx` - Handles profile updates.
5. ✅ `contexts/AuthContext.tsx` - Manages global auth state.
6. ✅ `services/apiClient.ts` - Configured to send the auth token with requests.

This mapping provides a clear plan for connecting the frontend UI components for authentication and profile management to the existing backend infrastructure.
