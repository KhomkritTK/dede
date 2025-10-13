# DEDE e-License Portal - Clean Architecture Design

## Folder Structure

```
backend/
├── cmd/
│   ├── migrate/
│   │   └── main.go
│   ├── seed/
│   │   └── main.go
│   └── server/
│       └── main.go
├── config/
│   ├── app_config.go
│   ├── database.go
│   └── logger.go
├── database/
│   ├── connection.go
│   ├── migrations/
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_create_corporates_table.sql
│   │   ├── 003_create_corporate_members_table.sql
│   │   ├── 004_create_otp_table.sql
│   │   ├── 005_create_user_profiles_table.sql
│   │   └── migrations.go
│   └── seed.go
├── middleware/
│   ├── auth_middleware.go
│   ├── cors_middleware.go
│   ├── logging_middleware.go
│   ├── otp_middleware.go
│   └── recovery_middleware.go
├── models/
│   ├── user.go
│   ├── corporate.go
│   ├── corporate_member.go
│   ├── otp.go
│   ├── user_profile.go
│   └── base.go
├── repository/
│   ├── interfaces/
│   │   ├── user_repository_interface.go
│   │   ├── corporate_repository_interface.go
│   │   ├── corporate_member_repository_interface.go
│   │   ├── otp_repository_interface.go
│   │   └── user_profile_repository_interface.go
│   ├── user_repository.go
│   ├── corporate_repository.go
│   ├── corporate_member_repository.go
│   ├── otp_repository.go
│   └── user_profile_repository.go
├── service/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── auth_dto.go
│   │   │   ├── login_dto.go
│   │   │   ├── register_dto.go
│   │   │   └── otp_dto.go
│   │   ├── handler/
│   │   │   └── auth_handler.go
│   │   └── usecase/
│   │       ├── auth_usecase.go
│   │       └── auth_usecase_interface.go
│   ├── user/
│   │   ├── dto/
│   │   │   ├── user_dto.go
│   │   │   └── profile_dto.go
│   │   ├── handler/
│   │   │   └── user_handler.go
│   │   └── usecase/
│   │       ├── user_usecase.go
│   │       └── user_usecase_interface.go
│   ├── corporate/
│   │   ├── dto/
│   │   │   ├── corporate_dto.go
│   │   │   └── member_dto.go
│   │   ├── handler/
│   │   │   └── corporate_handler.go
│   │   └── usecase/
│   │       ├── corporate_usecase.go
│   │       └── corporate_usecase_interface.go
│   ├── otp/
│   │   ├── dto/
│   │   │   └── otp_dto.go
│   │   ├── handler/
│   │   │   └── otp_handler.go
│   │   └── usecase/
│   │       ├── otp_usecase.go
│   │       └── otp_usecase_interface.go
│   └── profile/
│       ├── dto/
│       │   └── profile_dto.go
│       ├── handler/
│       │   └── profile_handler.go
│       └── usecase/
│           ├── profile_usecase.go
│           └── profile_usecase_interface.go
├── router/
│   ├── api.go
│   ├── auth_routes.go
│   ├── user_routes.go
│   ├── corporate_routes.go
│   ├── otp_routes.go
│   └── profile_routes.go
├── server/
│   ├── middleware.go
│   └── server.go
├── utils/
│   ├── email_utils.go
│   ├── file_utils.go
│   ├── jwt_utils.go
│   ├── otp_utils.go
│   ├── response_utils.go
│   └── time_utils.go
├── go.mod
├── go.sum
└── Makefile
```

## Clean Architecture Layers

### 1. Domain Layer (Models & Interfaces)
- **models/**: Entity definitions (User, Corporate, CorporateMember, OTP, UserProfile)
- **repository/interfaces/**: Repository interfaces defining data access contracts

### 2. Data Layer (Repository Implementations)
- **repository/**: Concrete implementations of repository interfaces
- **database/**: Database connection, migrations, and seeding

### 3. Application Layer (Use Cases)
- **service/*/usecase/**: Business logic implementation for each domain
- **service/*/dto/**: Data Transfer Objects for request/response

### 4. Interface Layer (Handlers & Routes)
- **service/*/handler/**: HTTP handlers for API endpoints
- **router/**: Route definitions and API structure
- **middleware/**: Cross-cutting concerns (auth, CORS, logging)

### 5. Infrastructure Layer
- **config/**: Configuration management
- **utils/**: Utility functions (JWT, email, OTP, etc.)
- **cmd/**: Application entry points

## Key Design Principles

1. **Dependency Inversion**: High-level modules don't depend on low-level modules
2. **Single Responsibility**: Each component has one reason to change
3. **Open/Closed**: Open for extension, closed for modification
4. **Interface Segregation**: Clients don't depend on unused interfaces
5. **Dependency Injection**: Dependencies are injected rather than hard-coded

## Flow Implementation

### WB-LG-01 (E-License Login)
- Service: `service/auth/`
- Flow: Login → OTP Verification → JWT Token Generation

### WB-RG-01 (General User Register)
- Service: `service/auth/` + `service/user/`
- Flow: Registration → Email OTP Verification → Account Activation

### WB-RG-02 (Corporate Admin Register)
- Service: `service/corporate/` + `service/auth/`
- Flow: Corporate Registration → Admin Registration → Email OTP Verification

### WB-RG-03 (Corporate Member Register)
- Service: `service/corporate/` + `service/auth/`
- Flow: Invitation Acceptance → Member Registration → OTP Verification

### WB-PR-01 (User Profile Management)
- Service: `service/profile/`
- Flow: Get Profile → Update Profile → Manage Preferences