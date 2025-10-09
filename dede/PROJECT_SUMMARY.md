# DEDE E-Service Backend System - Project Summary

## Overview
This is a comprehensive backend system for the Department of Alternative Energy Development and Efficiency (DEDE) to manage license requests for power producers. The system follows a clean architecture pattern with proper separation of concerns.

## Technology Stack
- **Language**: Go (Golang)
- **Framework**: Gin HTTP Web Framework
- **Database**: PostgreSQL with GORM ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Architecture**: Clean Architecture (Domain, Use Cases, Adapters)

## Project Structure
```
eservice-backend/
├── cmd/
│   └── main.go                           # Application entry point
├── config/
│   ├── app_config.go                     # Application configuration
│   ├── database.go                       # Database configuration
│   └── logger.go                         # Logger configuration
├── database/
│   ├── connection.go                     # Database connection
│   ├── migrations/
│   │   └── migrations.go                 # Database migrations
│   └── seed.go                           # Database seeding
├── models/                               # Data models (entities)
├── repository/                           # Data access layer
│   ├── user_repository.go
│   ├── license_request_repository.go
│   ├── inspection_repository.go
│   ├── audit_report_repository.go
│   ├── attachment_repository.go
│   └── notification_repository.go
├── service/                              # Business logic layer
│   ├── auth/                             # Authentication service
│   ├── license/                          # License request service
│   ├── inspection/                       # Inspection service
│   ├── audit/                            # Audit report service
│   └── notification/                     # Notification service
├── router/                               # HTTP routing
│   ├── auth_routes.go
│   ├── user_routes.go
│   ├── license_routes.go
│   ├── inspection_routes.go
│   ├── audit_routes.go
│   └── notification_routes.go
├── server/                               # Server setup and middleware
│   ├── server.go                         # Server configuration
│   └── middleware.go                     # HTTP middlewares
├── utils/                                # Utility functions
│   ├── jwt.go                            # JWT utilities
│   ├── password.go                       # Password utilities
│   └── response.go                       # Response utilities
├── docs/                                 # Documentation
└── README.md                             # Project documentation
```

## Core Features

### 1. User Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing and validation
- Profile management

### 2. License Request Management
- Create and manage license requests
- License type classification (New, Renew, Expand, Reduce, Modify, Cancel)
- Request status tracking
- Assign inspectors to requests
- Set deadlines for requests
- Request approval/rejection workflow

### 3. Inspection Management
- Schedule inspections for license requests
- Track inspection status (Scheduled, In Progress, Completed, Cancelled)
- Record inspection findings and recommendations
- Reschedule inspections when needed
- Inspection history

### 4. Audit Report Management
- Create and submit inspection reports
- Report review and approval process
- Report status tracking
- Report versioning

### 5. Notification System
- Send notifications to users about important events
- Role-based notifications
- Email notifications (template system)
- Unread notification tracking
- Broadcast messages to all users

### 6. File Management
- Upload and manage attachments
- File type validation
- File size restrictions
- Secure file storage

## API Endpoints

### Authentication
- POST /auth/login - User login
- POST /auth/register - User registration
- POST /auth/logout - User logout
- POST /auth/refresh - Refresh JWT token
- GET /auth/profile - Get user profile
- PUT /auth/profile - Update user profile
- PUT /auth/password - Change password

### License Requests
- GET /licenses - Get all license requests
- GET /licenses/:id - Get a specific license request
- POST /licenses - Create a new license request
- PUT /licenses/:id - Update a license request
- DELETE /licenses/:id - Delete a license request
- POST /licenses/:id/submit - Submit a license request
- POST /licenses/:id/accept - Accept a license request
- POST /licenses/:id/reject - Reject a license request
- POST /licenses/:id/assign - Assign an inspector
- POST /licenses/:id/approve - Approve a license request
- GET /licenses/my - Get my license requests
- GET /licenses/types - Get license types

### Inspections
- GET /inspections - Get all inspections
- GET /inspections/:id - Get a specific inspection
- POST /inspections - Create a new inspection
- PUT /inspections/:id - Update an inspection
- DELETE /inspections/:id - Delete an inspection
- POST /inspections/:id/start - Start an inspection
- POST /inspections/:id/complete - Complete an inspection
- POST /inspections/:id/cancel - Cancel an inspection
- POST /inspections/:id/reschedule - Reschedule an inspection
- PUT /inspections/:id/appointment - Set appointment details
- GET /inspections/my - Get my inspections
- GET /inspections/request/:request_id - Get inspections for a request

### Audit Reports
- GET /audits - Get all audit reports
- GET /audits/:id - Get a specific audit report
- POST /audits - Create a new audit report
- PUT /audits/:id - Update an audit report
- DELETE /audits/:id - Delete an audit report
- POST /audits/:id/submit - Submit an audit report
- POST /audits/:id/review - Review an audit report
- POST /audits/:id/approve - Approve an audit report
- POST /audits/:id/reject - Reject an audit report
- POST /audits/:id/request-edit - Request edits

### Notifications
- GET /notifications - Get all notifications
- GET /notifications/:id - Get a specific notification
- POST /notifications - Create a new notification
- DELETE /notifications/:id - Delete a notification
- POST /notifications/:id/mark-read - Mark notification as read
- POST /notifications/my/mark-all-read - Mark all notifications as read
- POST /notifications/send - Send unsent notifications
- GET /notifications/my - Get my notifications
- GET /notifications/my/unread - Get my unread notifications
- GET /notifications/my/count - Get my notification count
- GET /notifications/types - Get notification types
- GET /notifications/priorities - Get notification priorities

## Database Schema
The system uses the following main tables:
- users - User accounts and authentication
- license_requests - License request information
- inspections - Inspection details and scheduling
- audit_reports - Audit report data
- notifications - System notifications
- attachments - File attachments

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- SQL injection protection with GORM

## Error Handling
- Custom error responses
- Validation error handling
- HTTP status code standardization
- Error logging

## Deployment Considerations
- Environment-based configuration
- Migration scripts for database setup
- Logging for monitoring and debugging
- Health check endpoints
- Graceful shutdown handling

## Future Enhancements
- Real-time notifications with WebSockets
- Email service integration
- File storage integration (AWS S3, etc.)
- Advanced reporting and analytics
- API rate limiting
- API documentation with Swagger/OpenAPI
- Containerization with Docker
- Kubernetes deployment support

## Getting Started
1. Clone the repository
2. Install dependencies with `go mod download`
3. Set up PostgreSQL database
4. Run database migrations
5. Update configuration in config/app_config.go
6. Start the server with `go run cmd/main.go`