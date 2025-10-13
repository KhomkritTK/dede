# DEDE e-License Portal - System Workflow Explanation

## Overview

The DEDE e-License Portal is a comprehensive backend system built with Go and Clean Architecture principles, designed to handle user authentication, corporate management, and licensing workflows. The system supports multiple user types including general users, corporate administrators, and corporate members.

## Architecture Overview

The system follows Clean Architecture with clear separation of concerns:

- **Domain Layer**: Models and business rules
- **Application Layer**: Use cases implementing business logic
- **Infrastructure Layer**: Database, external services, and frameworks
- **Interface Layer**: HTTP handlers, routes, and middleware

## Core Workflows

### WB-LG-01 (E-License Login)

**Flow:**
1. User submits login credentials (username/password or email/phone + OTP)
2. System validates credentials
3. If using OTP, system sends OTP to registered email/phone
4. User verifies OTP
5. System generates JWT tokens (access + refresh)
6. User receives authentication response with user info and tokens

**API Endpoints:**
- `POST /api/v1/auth/login` - Standard login
- `POST /api/v1/auth/login-with-otp` - OTP-based login
- `POST /api/v1/auth/send-otp` - Send OTP for login
- `POST /api/v1/auth/verify-otp` - Verify OTP

**Security Features:**
- JWT-based authentication
- OTP verification for enhanced security
- Rate limiting on login attempts
- Account lockout after failed attempts

### WB-RG-01 (General User Register)

**Flow:**
1. User submits registration form with basic information
2. System validates input data and checks for duplicates
3. System sends verification OTP to email/phone
4. User verifies OTP to activate account
5. System creates user account with "user" role
6. User can optionally complete profile information

**API Endpoints:**
- `POST /api/v1/auth/register` - Initial registration
- `POST /api/v1/auth/register-with-otp` - Registration with OTP
- `POST /api/v1/auth/verify-registration-otp` - Verify registration OTP
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

**Validation:**
- Unique username and email validation
- Password strength requirements
- Email/phone format validation
- OTP verification for account activation

### WB-RG-02 (Corporate Admin Register)

**Flow:**
1. Corporate administrator submits corporate registration form
2. System validates corporate information (registration number, tax ID, etc.)
3. System creates corporate account with "pending" status
4. System creates admin user account linked to corporate
5. System sends verification OTP to admin email/phone
6. Admin verifies OTP to activate accounts
7. Corporate remains in "pending" status until manual verification by DEDE staff

**API Endpoints:**
- `POST /api/v1/auth/register-corporate` - Corporate registration
- `POST /api/v1/auth/verify-corporate-otp` - Verify corporate OTP
- `GET /api/v1/corporates/:id` - Get corporate information
- `PUT /api/v1/corporates/:id` - Update corporate information

**Corporate Information Required:**
- Corporate name (Thai and English)
- Registration number
- Tax ID
- Corporate type (company, partnership, etc.)
- Business address
- Contact information
- Industry type

### WB-RG-03 (Corporate Member Register)

**Flow:**
1. Corporate admin invites member via email
2. System generates invitation token and sends invitation email
3. Invited user clicks invitation link
4. System validates invitation token
5. User submits registration form with personal information
6. System sends verification OTP to user email/phone
7. User verifies OTP to complete registration
8. User is added to corporate with specified role

**API Endpoints:**
- `POST /api/v1/corporates/:id/invite` - Invite corporate member
- `GET /api/v1/public/invitation/:token` - Get invitation info
- `POST /api/v1/corporates/invitation/:token/accept` - Accept invitation
- `POST /api/v1/auth/register-corporate-member` - Register corporate member
- `GET /api/v1/corporates/:id/members` - List corporate members

**Member Roles:**
- **Admin**: Full access to corporate management
- **Manager**: Can manage members and licenses
- **Member**: Can view and apply for licenses
- **Viewer**: Read-only access

### WB-PR-01 (User Profile Management)

**Flow:**
1. User accesses profile management interface
2. System displays current profile information
3. User updates profile fields as needed
4. System validates and saves changes
5. User can manage notification and privacy settings
6. User can upload profile image and signature

**API Endpoints:**
- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update user profile
- `PUT /api/v1/profile/image` - Update profile image
- `PUT /api/v1/profile/signature` - Update signature
- `GET /api/v1/profile/preferences` - Get preferences
- `PUT /api/v1/profile/preferences` - Update preferences
- `GET /api/v1/profile/notifications` - Get notification settings
- `PUT /api/v1/profile/notifications` - Update notification settings
- `GET /api/v1/profile/privacy` - Get privacy settings
- `PUT /api/v1/profile/privacy` - Update privacy settings

**Profile Features:**
- Personal information management
- Contact information updates
- Privacy controls
- Notification preferences
- Emergency contact management
- Profile completion tracking

## Security Features

### Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control (RBAC)
- OTP verification for sensitive operations
- Session management with refresh tokens

### Data Protection
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention with GORM
- XSS protection with proper output encoding

### Rate Limiting
- Login attempt rate limiting
- OTP request rate limiting
- API endpoint rate limiting
- Account lockout after failed attempts

## Database Schema

### Core Tables
1. **users** - Basic user information and authentication
2. **user_profiles** - Extended user profile data
3. **corporates** - Corporate entity information
4. **corporate_members** - Corporate member relationships
5. **otp_codes** - One-time password verification

### Relationships
- Users ↔ UserProfiles (1:1)
- Users → Corporates (1:M as admin)
- Users ↔ CorporateMembers (1:M)
- Corporates ↔ CorporateMembers (1:M)
- Users → OTPCodes (1:M)

## API Structure

### Authentication Endpoints
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/logout
POST /api/v1/auth/refresh-token
POST /api/v1/auth/change-password
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

### Corporate Management Endpoints
```
GET /api/v1/corporates
POST /api/v1/corporates
GET /api/v1/corporates/:id
PUT /api/v1/corporates/:id
DELETE /api/v1/corporates/:id
GET /api/v1/corporates/:id/members
POST /api/v1/corporates/:id/members
PUT /api/v1/corporates/:id/members/:memberId
DELETE /api/v1/corporates/:id/members/:memberId
```

### Profile Management Endpoints
```
GET /api/v1/profile
PUT /api/v1/profile
GET /api/v1/profile/preferences
PUT /api/v1/profile/preferences
GET /api/v1/profile/notifications
PUT /api/v1/profile/notifications
GET /api/v1/profile/privacy
PUT /api/v1/profile/privacy
```

### OTP Management Endpoints
```
POST /api/v1/otp/generate
POST /api/v1/otp/send
POST /api/v1/otp/verify
POST /api/v1/otp/resend
GET /api/v1/otp/:id
DELETE /api/v1/otp/:id
```

## Error Handling

The system implements consistent error handling with:
- Standardized error response format
- Appropriate HTTP status codes
- Detailed error messages for development
- Generic error messages for production
- Error logging and monitoring

## Performance Considerations

- Database connection pooling
- Query optimization with proper indexing
- Caching for frequently accessed data
- Pagination for large datasets
- Asynchronous OTP sending
- Background cleanup tasks

## Monitoring & Logging

- Structured logging with context
- Request/response logging
- Performance metrics collection
- Error tracking and alerting
- Audit trail for sensitive operations

## Deployment Considerations

- Environment-specific configuration
- Database migration management
- Health check endpoints
- Graceful shutdown handling
- Horizontal scaling support
- Load balancing readiness

This comprehensive system design provides a robust foundation for the DEDE e-License Portal, supporting all required workflows while maintaining security, scalability, and maintainability.