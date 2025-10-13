# DEDE E-Service Authentication Features

This document provides an overview of all the authentication features implemented in the DEDE E-Service web portal.

## Overview

The authentication system has been enhanced to support multiple authentication methods, including traditional username/password login, OTP-based authentication, corporate registration, and password reset functionality.

## Features Implemented

### 1. Traditional Authentication
- **Username/Password Login**: Standard login with username and password
- **User Registration**: Registration for individual users
- **Session Management**: JWT-based authentication with refresh tokens

### 2. OTP-Based Authentication
- **Login with OTP**: Users can log in using an OTP sent to their email or phone
- **Registration with OTP**: Users can register using OTP verification
- **OTP Verification Component**: Reusable component for OTP input and verification
- **Resend OTP**: Users can request a new OTP if the previous one expires

### 3. Corporate Registration
- **Corporate Registration Form**: Comprehensive form for corporate entities
- **Corporate Information**: Company details, registration number, tax ID, etc.
- **Address Information**: Full address details for the corporate entity
- **OTP Verification**: Corporate registration requires OTP verification

### 4. Corporate Member Invitation
- **Accept Invitation**: Users can accept corporate membership invitations
- **Invitation Token**: Secure token-based invitation system
- **Registration with Invitation**: Users can register as part of a corporate entity

### 5. Password Reset
- **Forgot Password**: Users can request a password reset link
- **Reset Password**: Users can reset their password using a token
- **Password Change**: Authenticated users can change their password

## File Structure

### Frontend Components
```
frontend/src/components/auth/
├── OTPVerification.tsx         # Reusable OTP verification component
├── LoginWithOTP.tsx           # Login with OTP component
├── PasswordReset.tsx          # Password reset component
├── CorporateRegistration.tsx  # Corporate registration component
└── AcceptInvitation.tsx       # Accept invitation component
```

### Frontend Pages
```
frontend/src/app/
├── login/page.tsx             # Login page with multiple auth options
├── register/page.tsx          # Registration page with individual/corporate options
├── reset-password/page.tsx    # Password reset page
├── invite/page.tsx            # Accept invitation page
└── dashboard/profile/page.tsx # User profile with password change
```

### Backend Implementation
```
backend/service/auth/
├── usecase/
│   ├── auth_usecase_interface.go  # Auth interface definition
│   └── auth_usecase.go            # Auth implementation
├── dto/
│   ├── auth_dto.go               # Auth DTOs
│   └── otp_dto.go                # OTP DTOs
└── handler/
    └── auth_handler.go           # Auth HTTP handlers
```

## Authentication Flow

### 1. User Registration Flow
1. User navigates to `/register`
2. Chooses between "Individual" or "Corporate" registration
3. For Individual:
   - Fills out personal information
   - Creates account with username/password
   - Redirected to Web View
4. For Corporate:
   - Fills out comprehensive corporate information
   - Receives OTP for verification
   - Verifies OTP to complete registration
   - Redirected to login with success message

### 2. Login Flow
1. User navigates to `/login`
2. Can choose between:
   - Standard username/password login
   - OTP-based login
3. For OTP login:
   - Enters email/phone
   - Receives OTP
   - Enters OTP to authenticate
4. Successful authentication redirects to appropriate system:
   - Regular users: Web View (`/eservice/dede`)
   - Officers: Web Portal (`/eservice/dede/officer`)

### 3. Password Reset Flow
1. User clicks "Forgot Password?" on login page
2. Enters email address
3. Receives password reset link
4. Clicks link and sets new password
5. Can login with new password

### 4. Corporate Invitation Flow
1. User receives invitation email with link to `/invite?token=...`
2. Clicks link to open invitation acceptance page
3. Fills out personal information and creates password
4. Enters OTP from email to verify
5. Successfully joins corporate entity

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Standard login
- `POST /api/v1/auth/login-otp` - Login with OTP
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/register-otp` - Registration with OTP
- `POST /api/v1/auth/register-corporate` - Corporate registration
- `POST /api/v1/auth/accept-invitation` - Accept corporate invitation
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `PUT /api/v1/auth/password` - Change password
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password` - Reset password

### OTP
- `POST /api/v1/otp/send` - Send OTP
- `POST /api/v1/otp/verify` - Verify OTP
- `POST /api/v1/otp/resend` - Resend OTP

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Refresh Tokens**: Automatic token refresh for seamless experience
3. **OTP Verification**: Additional security layer for sensitive operations
4. **Password Hashing**: Secure password storage using bcrypt
5. **Token-based Invitations**: Secure corporate invitation system

## UI/UX Features

1. **Responsive Design**: All authentication components are mobile-friendly
2. **Form Validation**: Client-side and server-side validation
3. **Error Handling**: Comprehensive error messages
4. **Loading States**: Visual feedback during API calls
5. **Success Messages**: Confirmation of successful actions
6. **Thai Language**: Full Thai language support

## Usage Examples

### Login with OTP
```typescript
// Send OTP
await sendOTP({
  identifier: 'user@example.com',
  otpType: 'email',
  purpose: 'login'
});

// Login with OTP
await loginWithOTP({
  identifier: 'user@example.com',
  otpCode: '123456'
});
```

### Corporate Registration
```typescript
// Register corporate
await registerCorporate({
  username: 'corporate_admin',
  email: 'admin@company.com',
  password: 'securePassword',
  fullName: 'Admin Name',
  phone: '0812345678',
  corporateName: 'Company Name',
  registrationNumber: '1234567890',
  corporateType: 'company',
  // ... other corporate details
});
```

## Testing

All authentication features have been tested to ensure:
1. Proper form validation
2. Correct API integration
3. Error handling
4. Successful authentication flows
5. Proper redirects after authentication

## Future Enhancements

Potential improvements to consider:
1. Two-factor authentication (2FA)
2. Social login integration (Google, Facebook, etc.)
3. Biometric authentication
4. Advanced password policies
5. Session management improvements