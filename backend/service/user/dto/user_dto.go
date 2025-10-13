package dto

import (
	"eservice-backend/service/auth/dto"
	"time"
)

// UserResponse represents the user response
type UserResponse struct {
	ID            uint                 `json:"id"`
	Username      string               `json:"username"`
	Email         string               `json:"email"`
	FullName      string               `json:"full_name"`
	Role          string               `json:"role"`
	Status        string               `json:"status"`
	Phone         string               `json:"phone"`
	Company       string               `json:"company"`
	Address       string               `json:"address"`
	EmailVerified bool                 `json:"email_verified"`
	PhoneVerified bool                 `json:"phone_verified"`
	LastLoginAt   *time.Time           `json:"last_login_at"`
	CreatedAt     time.Time            `json:"created_at"`
	UpdatedAt     time.Time            `json:"updated_at"`
	Profile       *UserProfileResponse `json:"profile,omitempty"`
	MemberOf      []CorporateMember    `json:"member_of,omitempty"`
}

// UserProfileResponse represents the user profile response
type UserProfileResponse struct {
	ID                           uint                 `json:"id"`
	UserID                       uint                 `json:"user_id"`
	NationalID                   string               `json:"national_id"`
	PassportNumber               string               `json:"passport_number"`
	DateOfBirth                  *time.Time           `json:"date_of_birth"`
	Gender                       string               `json:"gender"`
	Nationality                  string               `json:"nationality"`
	Address                      string               `json:"address"`
	Province                     string               `json:"province"`
	District                     string               `json:"district"`
	Subdistrict                  string               `json:"subdistrict"`
	PostalCode                   string               `json:"postal_code"`
	HomePhone                    string               `json:"home_phone"`
	WorkPhone                    string               `json:"work_phone"`
	Fax                          string               `json:"fax"`
	ProfileImage                 string               `json:"profile_image"`
	SignatureImage               string               `json:"signature_image"`
	Bio                          string               `json:"bio"`
	Website                      string               `json:"website"`
	LinkedIn                     string               `json:"linkedin"`
	Facebook                     string               `json:"facebook"`
	Twitter                      string               `json:"twitter"`
	EmergencyContactName         string               `json:"emergency_contact_name"`
	EmergencyContactPhone        string               `json:"emergency_contact_phone"`
	EmergencyContactRelationship string               `json:"emergency_contact_relationship"`
	CreatedAt                    time.Time            `json:"created_at"`
	UpdatedAt                    time.Time            `json:"updated_at"`
	Preferences                  interface{}          `json:"preferences,omitempty"`
	NotificationSettings         NotificationSettings `json:"notification_settings"`
	PrivacySettings              PrivacySettings      `json:"privacy_settings"`
}

// CorporateMember represents a corporate member in user context
type CorporateMember struct {
	ID          uint               `json:"id"`
	CorporateID uint               `json:"corporate_id"`
	Corporate   *CorporateResponse `json:"corporate,omitempty"`
	MemberRole  string             `json:"member_role"`
	Position    string             `json:"position"`
	Department  string             `json:"department"`
	Status      string             `json:"status"`
	JoinedAt    *time.Time         `json:"joined_at"`
	LeftAt      *time.Time         `json:"left_at"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
}

// CorporateResponse represents corporate in user context
type CorporateResponse struct {
	ID                 uint       `json:"id"`
	CorporateName      string     `json:"corporate_name"`
	CorporateNameEn    string     `json:"corporate_name_en"`
	RegistrationNumber string     `json:"registration_number"`
	Status             string     `json:"status"`
	VerifiedAt         *time.Time `json:"verified_at"`
}

// UpdateUserRequest represents the request to update user
type UpdateUserRequest struct {
	FullName string `json:"full_name" binding:"omitempty,min=1,max=100"`
	Phone    string `json:"phone"`
	Company  string `json:"company"`
	Address  string `json:"address"`
}

// ListUsersRequest represents the request to list users
type ListUsersRequest struct {
	Page     int    `json:"page" form:"page"`
	Limit    int    `json:"limit" form:"limit"`
	Search   string `json:"search" form:"search"`
	Role     string `json:"role" form:"role"`
	Status   string `json:"status" form:"status"`
	SortBy   string `json:"sort_by" form:"sort_by"`
	SortDesc bool   `json:"sort_desc" form:"sort_desc"`
}

// ListUsersResponse represents the response for listing users
type ListUsersResponse struct {
	Users      []UserResponse `json:"users"`
	Pagination PaginationInfo `json:"pagination"`
}

// UserStatsResponse represents user statistics
type UserStatsResponse struct {
	TotalUsers     int64 `json:"total_users"`
	ActiveUsers    int64 `json:"active_users"`
	VerifiedUsers  int64 `json:"verified_users"`
	CorporateUsers int64 `json:"corporate_users"`
	NewUsersToday  int64 `json:"new_users_today"`
	NewUsersWeek   int64 `json:"new_users_week"`
	NewUsersMonth  int64 `json:"new_users_month"`
}

// NotificationSettings represents notification settings
type NotificationSettings struct {
	Email bool `json:"email"`
	SMS   bool `json:"sms"`
	Push  bool `json:"push"`
}

// PrivacySettings represents privacy settings
type PrivacySettings struct {
	ProfileVisibility   string `json:"profile_visibility"`
	ContactVisibility   string `json:"contact_visibility"`
	ShowEmail           bool   `json:"show_email"`
	ShowPhone           bool   `json:"show_phone"`
	ShowAddress         bool   `json:"show_address"`
	AllowDirectMessages bool   `json:"allow_direct_messages"`
}

// PaginationInfo represents pagination information
type PaginationInfo struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// Convert from auth.UserInfo to UserResponse
func FromAuthUserInfo(userInfo dto.UserInfo) UserResponse {
	return UserResponse{
		ID:       userInfo.ID,
		Username: userInfo.Username,
		Email:    userInfo.Email,
		FullName: userInfo.FullName,
		Role:     userInfo.Role,
		Status:   userInfo.Status,
		Phone:    userInfo.Phone,
		Company:  userInfo.Company,
		Address:  userInfo.Address,
	}
}
