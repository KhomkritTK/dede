# DEDE Workflow Management System Design

## Overview

The DEDE Workflow Management System is designed to handle the complete lifecycle of license requests through four main roles: DEDE Admin, DEDE Head, DEDE Consults, and DEDE Staff. This document outlines the complete workflow design, state transitions, and implementation details.

## System Architecture

### Core Components

1. **Workflow State Machine** - Manages state transitions and business logic
2. **Role-Based Access Control** - Ensures proper permissions for each role
3. **Notification System** - Handles state change notifications
4. **Task Assignment System** - Manages task distribution and tracking
5. **Audit Trail** - Logs all workflow activities

### Database Schema

The system uses the following main tables:
- `users` - User accounts and authentication
- `admin_users` - Admin role assignments and permissions
- `new_license_requests` - New license request data
- `renewal_license_requests` - Renewal license request data
- `extension_license_requests` - Extension license request data
- `reduction_license_requests` - Reduction license request data
- `service_flow_logs` - Workflow state change history
- `notifications` - System notifications
- `audit_reports` - Audit report data
- `inspections` - Inspection details

## Workflow States

The workflow follows these primary states:

1. **Draft** - Initial state when user creates a request
2. **New Request** - Request submitted to DEDE Admin
3. **Accepted** - Request accepted by DEDE Admin
4. **Forwarded** - Request forwarded to DEDE Head
5. **Assigned** - Task assigned to DEDE Staff/Consult
6. **Appointment** - Appointment scheduled with factory
7. **Inspecting** - Site inspection in progress
8. **Inspection Done** - Inspection completed
9. **Document Edit** - Audit report submitted for review
10. **Report Approved** - Audit report approved
11. **Approved** - Final license approval
12. **Returned** - Documents returned for corrections
13. **Rejected** - Request rejected
14. **Rejected Final** - Final rejection
15. **Overdue** - Auto-cancelled due to timeout

## Role Definitions and Responsibilities

### DEDE Admin
- **Primary Responsibilities:**
  - Receive new form requests from users
  - Perform initial verification
  - Forward valid requests to DEDE Head
  - Reject or return forms to users

- **Available Actions:**
  - Accept request
  - Reject request
  - Return to user for corrections
  - Forward to DEDE Head

- **State Transitions:**
  - `New Request` → `Accepted`
  - `New Request` → `Rejected`
  - `New Request` → `Returned`
  - `Accepted` → `Forwarded`

### DEDE Head
- **Primary Responsibilities:**
  - Assign tasks to DEDE Consults and DEDE Staff
  - Track task progress
  - Make final approval decisions

- **Available Actions:**
  - Assign to DEDE Staff
  - Assign to DEDE Consult
  - Approve final license
  - Reject request

- **State Transitions:**
  - `Forwarded` → `Assigned`
  - `Report Approved` → `Approved`
  - `Forwarded` → `Rejected`

### DEDE Consults
- **Primary Responsibilities:**
  - Receive assigned tasks
  - Contact factories to schedule appointments
  - Perform site audits
  - Create audit reports

- **Available Actions:**
  - Schedule appointment
  - Start inspection
  - Complete inspection
  - Submit audit report

- **State Transitions:**
  - `Assigned` → `Appointment`
  - `Appointment` → `Inspecting`
  - `Inspecting` → `Inspection Done`
  - `Inspection Done` → `Document Edit`

### DEDE Staff
- **Two Modes of Operation:**

#### Mode 1: Task Assigned via Consults
- **Primary Responsibilities:**
  - Review audit reports from DEDE Consults
  - Approve or reject reports
  - Handle overdue requests

- **Available Actions:**
  - Approve audit report
  - Reject audit report for revision
  - Auto-cancel overdue requests

- **State Transitions:**
  - `Document Edit` → `Report Approved`
  - `Document Edit` → `Returned`

#### Mode 2: Task Not Assigned to Consults
- **Primary Responsibilities:**
  - Perform site audit themselves
  - Handle appointment scheduling
  - Create and approve audit reports

- **Available Actions:**
  - Schedule appointment
  - Perform inspection
  - Create and approve report
  - Final approval

- **State Transitions:**
  - `Assigned` → `Appointment`
  - `Appointment` → `Inspecting`
  - `Inspecting` → `Inspection Done`
  - `Inspection Done` → `Document Edit`
  - `Document Edit` → `Report Approved`
  - `Report Approved` → `Approved`

## State Transition Rules

### Valid Transitions

| From State | To State | Required Role | Description |
|------------|----------|---------------|-------------|
| Draft | New Request | User | Submit request for review |
| New Request | Accepted | DEDE Admin | Accept request for processing |
| New Request | Rejected | DEDE Admin | Reject request |
| New Request | Returned | DEDE Admin | Return to user for corrections |
| Accepted | Forwarded | DEDE Admin | Forward to DEDE Head |
| Forwarded | Assigned | DEDE Head | Assign to DEDE Staff/Consult |
| Forwarded | Rejected | DEDE Head | Reject request |
| Assigned | Appointment | DEDE Head/Staff | Schedule appointment |
| Appointment | Inspecting | DEDE Consult/Staff | Start site inspection |
| Inspecting | Inspection Done | DEDE Consult/Staff | Complete inspection |
| Inspection Done | Document Edit | DEDE Consult/Staff | Submit audit report |
| Document Edit | Report Approved | DEDE Staff | Approve audit report |
| Document Edit | Returned | DEDE Staff | Reject report for revision |
| Report Approved | Approved | DEDE Staff/Head | Final license approval |
| Appointment | Overdue | System | Auto-cancel missed appointment |
| Document Edit | Overdue | System | Auto-cancel 14+ day delay |

### Auto-Transitions

The system automatically handles these transitions:

1. **Overdue Appointment**: If appointment date passes without action
2. **Overdue Document**: If document review exceeds 14 days
3. **Deadline Tracking**: Automatic deadline calculation and enforcement

## Notification System

### Notification Types

- `request_submitted` - New request submitted
- `request_accepted` - Request accepted by admin
- `request_rejected` - Request rejected
- `request_assigned` - Task assigned
- `appointment_set` - Appointment scheduled
- `inspection_completed` - Inspection completed
- `report_submitted` - Audit report submitted
- `report_approved` - Audit report approved
- `report_rejected` - Audit report rejected
- `deadline_reminder` - Deadline approaching
- `system_announcement` - System notifications

### Notification Rules

1. **Real-time Notifications**: Immediate notification for state changes
2. **Email Notifications**: Daily digest for pending items
3. **Deadline Reminders**: 3-day and 1-day warnings
4. **Role-based Notifications**: Only relevant roles receive notifications

## Task Assignment System

### Assignment Logic

1. **Load Balancing**: Distribute tasks evenly among available staff
2. **Skill-based Assignment**: Assign based on expertise and availability
3. **Priority Handling**: Urgent tasks assigned first
4. **Capacity Management**: Track current workload before assignment

### Task Types

1. **Review Tasks**: Initial request review
2. **Inspection Tasks**: Site audit assignments
3. **Report Review**: Audit report evaluation
4. **Approval Tasks**: Final license approval

## Deadline Tracking

### Deadline Rules

1. **Document Review**: 14 days maximum
2. **Appointment Scheduling**: 7 days from assignment
3. **Inspection Completion**: Based on factory availability
4. **Report Submission**: 7 days after inspection

### Overdue Handling

1. **Automatic Cancellation**: System cancels overdue requests
2. **Notification Escalation**: Notify supervisors of overdue items
3. **Reassignment Option**: Manual reassignment of overdue tasks
4. **Audit Trail**: Log all overdue actions

## API Endpoints

### Workflow Management

- `GET /api/v1/workflow/state/:requestId` - Get workflow state
- `POST /api/v1/workflow/transition` - Transition workflow state
- `GET /api/v1/workflow/history/:requestId` - Get workflow history
- `GET /api/v1/workflow/diagram` - Get workflow diagram
- `POST /api/v1/workflow/check-overdue` - Check overdue requests

### Task Management

- `GET /api/v1/tasks/my-tasks` - Get current user's tasks
- `GET /api/v1/tasks/role/:role` - Get tasks by role
- `POST /api/v1/tasks/assign` - Assign task
- `PUT /api/v1/tasks/:taskId/status` - Update task status

### Dashboard

- `GET /api/v1/dashboard/stats` - Get dashboard statistics
- `GET /api/v1/dashboard/role/:role` - Get role-specific dashboard

## Security and Permissions

### Role-Based Access Control

1. **Authentication Required**: All endpoints require valid JWT token
2. **Role Verification**: Each action verifies user role permissions
3. **Resource Ownership**: Users can only access their assigned tasks
4. **Audit Logging**: All actions logged with user and timestamp

### Permission Matrix

| Action | DEDE Admin | DEDE Head | DEDE Staff | DEDE Consult | User |
|--------|------------|-----------|------------|--------------|------|
| Submit Request | ❌ | ❌ | ❌ | ❌ | ✅ |
| Accept Request | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reject Request | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Task | ❌ | ✅ | ❌ | ❌ | ❌ |
| Perform Inspection | ❌ | ❌ | ✅ | ✅ | ❌ |
| Review Report | ❌ | ❌ | ✅ | ❌ | ❌ |
| Final Approval | ❌ | ✅ | ✅ | ❌ | ❌ |

## Frontend Components

### Role-Specific Dashboards

1. **DEDE Admin Dashboard**
   - New requests queue
   - Pending verifications
   - Returned documents tracking

2. **DEDE Head Dashboard**
   - Task assignment overview
   - Progress tracking
   - Team performance metrics

3. **DEDE Consult Dashboard**
   - Assigned inspections
   - Appointment calendar
   - Report submission status

4. **DEDE Staff Dashboard**
   - Report review queue
   - Approval pending items
   - Overdue alerts

### Workflow Visualization

1. **State Diagram**: Visual representation of workflow
2. **Progress Tracking**: Real-time progress indicators
3. **Timeline View**: Historical timeline of requests
4. **Kanban Board**: Task management interface

## Performance Considerations

### Database Optimization

1. **Indexing Strategy**: Proper indexes on frequently queried fields
2. **Query Optimization**: Efficient database queries
3. **Connection Pooling**: Database connection management
4. **Caching Strategy**: Redis for frequently accessed data

### Scalability

1. **Horizontal Scaling**: Multiple application instances
2. **Load Balancing**: Distribute request load
3. **Background Jobs**: Asynchronous task processing
4. **Monitoring**: Performance metrics and alerts

## Testing Strategy

### Unit Tests

1. **State Machine Tests**: Verify all state transitions
2. **Permission Tests**: Validate role-based access
3. **Business Logic Tests**: Test workflow rules
4. **Notification Tests**: Verify notification delivery

### Integration Tests

1. **API Tests**: Test all endpoints
2. **Database Tests**: Verify data integrity
3. **Workflow Tests**: End-to-end workflow testing
4. **Performance Tests**: Load and stress testing

## Deployment Considerations

### Environment Setup

1. **Development**: Local development environment
2. **Staging**: Pre-production testing environment
3. **Production**: Live production environment
4. **Disaster Recovery**: Backup and recovery procedures

### Monitoring and Logging

1. **Application Logging**: Structured logging with levels
2. **Performance Monitoring**: Response time and throughput
3. **Error Tracking**: Error reporting and alerting
4. **User Analytics**: Usage patterns and metrics

## Future Enhancements

### Planned Features

1. **Mobile Application**: Native mobile app for field inspections
2. **Document Management**: Advanced document versioning
3. **Reporting Analytics**: Advanced reporting and analytics
4. **Integration APIs**: External system integrations

### Technology Improvements

1. **Microservices Architecture**: Service decomposition
2. **Event-Driven Architecture**: Async event processing
3. **Machine Learning**: Predictive analytics for workload
4. **Blockchain**: Immutable audit trail

## Conclusion

The DEDE Workflow Management System provides a comprehensive solution for managing license requests through a well-defined workflow with proper role-based access control, notifications, and audit trails. The system is designed to be scalable, maintainable, and extensible to meet future requirements.