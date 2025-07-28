# Authentication Integration

This document explains how the authentication system has been integrated into the OusAuris mobile app.

## Overview

The app now integrates with the OusAuris backend API for user authentication, including:
- User signup
- User login  
- Token refresh
- User profile management
- Automatic token management

## Backend API

The app connects to the OusAuris backend at:
```
https://ousauris-backend-production.up.railway.app
```

## Authentication Flow

### 1. User Signup
- Users can create accounts with email, password, and basic profile information
- The app automatically splits the full name into first and last name
- Default main goal is set to "Improve my overall wellness and build better habits"
- On successful signup, users are redirected to the paywall

### 2. User Login
- Users can log in with their email and password
- On successful login, access and refresh tokens are stored securely
- Users are redirected to the paywall after login

### 3. Token Management
- Access tokens are automatically refreshed when they expire
- Tokens are stored securely in AsyncStorage
- The app handles 401 errors by attempting token refresh

### 4. User Profile
- User profile information is available throughout the app
- Profile data is displayed in the settings screen
- Users can view their name and email

## Files Added/Modified

### New Files
- `utils/authService.ts` - Authentication service with API integration
- `utils/authContext.tsx` - React Context for authentication state management
- `AUTHENTICATION.md` - This documentation file

### Modified Files
- `app/_layout.tsx` - Added AuthProvider wrapper
- `app/index.tsx` - Integrated login with backend API
- `app/create-account.tsx` - Integrated signup with backend API
- `app/(tabs)/settings.tsx` - Added user profile display and proper logout

## API Endpoints Used

### Authentication
- `POST /api/users/signup` - Create new user account
- `POST /api/users/login` - User login
- `POST /api/users/refresh-token` - Refresh access token

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Usage

### Using the Auth Context
```typescript
import { useAuth } from '../utils/authContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Access user data
  console.log(user?.first_name);
  
  // Check authentication status
  if (isAuthenticated) {
    // User is logged in
  }
  
  // Login
  await login(email, password);
  
  // Logout
  await logout();
}
```

### Protecting Routes
Routes are protected by checking authentication status in the component:

```typescript
import { useAuth } from '../utils/authContext';

function ProtectedScreen() {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);
  
  // Component content
}
```

## Error Handling

The authentication system includes comprehensive error handling:
- Network errors are caught and displayed to users
- Invalid credentials show appropriate error messages
- Token refresh failures automatically log users out
- AsyncStorage errors are handled gracefully

## Security Features

- Tokens are stored securely in AsyncStorage
- Automatic token refresh prevents session expiration
- Failed authentication attempts are handled gracefully
- User data is cleared on logout

## Testing

To test the authentication system:

1. **Signup**: Create a new account with valid email and password
2. **Login**: Use existing credentials to log in
3. **Profile**: Check that user information appears in settings
4. **Logout**: Verify that logout clears all data and redirects to login
5. **Token Refresh**: The system automatically handles token refresh

## Notes

- The app uses the existing UI design and styling
- Error messages are displayed inline with the forms
- Loading states are shown during authentication operations
- The authentication state persists across app restarts 