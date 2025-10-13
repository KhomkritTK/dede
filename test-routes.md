# DEDE E-Service Route Testing Guide

## Overview
This document outlines the testing procedures for the separate routes for web view and admin sections.

## Route Structure

### Web View (Public Users)
- **Main Page**: `/eservice/dede` - Public landing page
- **Home**: `/eservice/dede/home` - Home page with news and updates
- **Services**: `/eservice/dede/services` - Available services for public users
- **About**: `/eservice/dede/about` - About DEDE organization
- **Contact**: `/eservice/dede/contact` - Contact information and form

### Admin Section (Officer/Staff)
- **Dashboard**: `/eservice/dede/officer/dashboard` - Admin dashboard
- **Licenses**: `/eservice/dede/officer/licenses` - Manage license requests
- **Inspections**: `/eservice/dede/officer/inspections` - Manage inspections
- **Audits**: `/eservice/dede/officer/audits` - Manage audit reports
- **Notifications**: `/eservice/dede/officer/notifications` - Manage notifications
- **Profile**: `/eservice/dede/officer/profile` - User profile management

### Authentication
- **Login**: `/login` - Login page for all users
- **Register**: `/register` - Registration page for new users

## Role-Based Access Control

### User Roles
1. **user** - Regular users who can apply for licenses
2. **admin** - System administrators
3. **dede_head** - DEDE department head
4. **dede_staff** - DEDE staff members
5. **dede_consult** - DEDE consultants
6. **auditor** - Audit personnel

### Access Rules
- **Public Routes**: Accessible to everyone (authenticated or not)
- **Admin Routes**: Only accessible to users with admin, dede_head, dede_staff, dede_consult, or auditor roles
- **Authentication Redirects**:
  - After login: Users are redirected based on their role
    - Admin roles → `/eservice/dede/officer/dashboard`
    - Regular users → `/eservice/dede`
  - After registration: Same as login

## Testing Scenarios

### 1. Public Access (No Authentication)
1. Visit `/eservice/dede` - Should show the public landing page
2. Visit `/eservice/dede/home` - Should show the home page
3. Visit `/eservice/dede/services` - Should show available services
4. Visit `/eservice/dede/about` - Should show about page
5. Visit `/eservice/dede/contact` - Should show contact page
6. Try to access `/eservice/dede/officer/dashboard` - Should redirect to login

### 2. Regular User Authentication
1. Register as a regular user (role: "user")
2. Login with the new account
3. Should be redirected to `/eservice/dede`
4. Navigation should show user's name and logout option
5. Try to access `/eservice/dede/officer/dashboard` - Should be denied or redirected

### 3. Admin/Officer Authentication
1. Register as an admin user (role: "admin" or any DEDE role)
2. Login with the new account
3. Should be redirected to `/eservice/dede/officer/dashboard`
4. Should be able to access all admin routes
5. Navigation should include "จัดการระบบ" (System Management) option

### 4. Navigation Testing
1. Test navigation menu on public pages
2. Test navigation menu on admin pages
3. Test mobile responsive navigation
4. Test logout functionality

### 5. Role-Based UI Testing
1. Verify that regular users don't see admin options
2. Verify that admin users see appropriate admin options
3. Verify that the navigation changes based on authentication status

## Implementation Notes

### Middleware Protection
- Admin routes are protected by middleware in `frontend/src/middleware.ts`
- The middleware checks for authentication tokens
- Role verification is done at the component level

### Layout Components
- `PublicLayout` - Used for all public-facing pages
- `OfficerLayout` - Used for admin/officer pages
- Both layouts handle navigation and authentication state

### Authentication Flow
- Login and register pages redirect based on user role after successful authentication
- The `useAuth` hook provides user information and authentication state
- Role checks are implemented in layout components and pages

## Expected Behavior

### Public Users
- Can view public pages without authentication
- Can register for an account
- After login, can only access public pages
- Cannot access admin routes

### Admin Users
- Can access all public pages
- Can access admin routes after authentication
- See additional navigation options for system management
- Can manage licenses, inspections, audits, and notifications

This structure ensures a clear separation between public-facing content and administrative functions, with proper role-based access control.