package dto

import (
	"time"
)

// GenerateOTPRequest represents the request to generate OTP
type GenerateOTPRequest struct {
	UserID     *uint  `json:"user_id"`
	Identifier string `json:"identifier" binding:"required"` // email or phone
	OTPType    string `json:"otp_type" binding:"required,oneof=email phone"`
	Purpose    string `json:"purpose" binding:"required,oneof=registration login password_reset email_verify phone_verify corporate_invitation"`
	ExpiresIn  int    `json:"expires_in"` // in minutes, default 10
}

// OTPResponse represents the OTP response
type OTPResponse struct {
	ID         uint      `json:"id"`
	UserID     *uint     `json:"user_id"`
	Identifier string    `json:"identifier"`
	OTPType    string    `json:"otp_type"`
	Purpose    string    `json:"purpose"`
	ExpiresAt  time.Time `json:"expires_at"`
	CreatedAt  time.Time `json:"created_at"`
	// Note: Code is not returned in response for security
}

// SendOTPRequest represents the request to send OTP
type SendOTPRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	OTPType    string `json:"otp_type" binding:"required,oneof=email phone"`
	Purpose    string `json:"purpose" binding:"required,oneof=registration login password_reset email_verify phone_verify corporate_invitation"`
	Message    string `json:"message"` // custom message
}

// ResendOTPRequest represents the request to resend OTP
type ResendOTPRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Purpose    string `json:"purpose" binding:"required"`
}

// VerifyOTPRequest represents the request to verify OTP
type VerifyOTPRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Code       string `json:"code" binding:"required,len=6"`
	Purpose    string `json:"purpose" binding:"required"`
}

// VerifyOTPForPurposeRequest represents the request to verify OTP for specific purpose
type VerifyOTPForPurposeRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Code       string `json:"code" binding:"required,len=6"`
	Purpose    string `json:"purpose" binding:"required"`
	UserID     *uint  `json:"user_id"`
}

// VerifyOTPResponse represents the response after OTP verification
type VerifyOTPResponse struct {
	Success      bool      `json:"success"`
	Message      string    `json:"message"`
	VerifiedAt   time.Time `json:"verified_at"`
	AccessToken  string    `json:"access_token,omitempty"`
	RefreshToken string    `json:"refresh_token,omitempty"`
	User         UserInfo  `json:"user,omitempty"`
	ExpiresIn    int       `json:"expires_in,omitempty"`
}

// OTPStatusResponse represents the OTP status response
type OTPStatusResponse struct {
	ID          uint       `json:"id"`
	Identifier  string     `json:"identifier"`
	OTPType     string     `json:"otp_type"`
	Purpose     string     `json:"purpose"`
	Attempts    int        `json:"attempts"`
	MaxAttempts int        `json:"max_attempts"`
	IsUsed      bool       `json:"is_used"`
	IsExpired   bool       `json:"is_expired"`
	IsVerified  bool       `json:"is_verified"`
	ExpiresAt   time.Time  `json:"expires_at"`
	VerifiedAt  *time.Time `json:"verified_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// GetUserOTPHistoryRequest represents the request to get user OTP history
type GetUserOTPHistoryRequest struct {
	UserID  uint   `json:"user_id" binding:"required"`
	Page    int    `json:"page" form:"page"`
	Limit   int    `json:"limit" form:"limit"`
	Purpose string `json:"purpose" form:"purpose"`
	OTPType string `json:"otp_type" form:"otp_type"`
}

// UserOTPHistoryResponse represents the response for user OTP history
type UserOTPHistoryResponse struct {
	OTPs       []OTPStatusResponse `json:"otps"`
	Pagination PaginationInfo      `json:"pagination"`
}

// AttemptsResponse represents the attempts response
type AttemptsResponse struct {
	RemainingAttempts int        `json:"remaining_attempts"`
	MaxAttempts       int        `json:"max_attempts"`
	NextAttemptAt     *time.Time `json:"next_attempt_at"`
	IsBlocked         bool       `json:"is_blocked"`
	BlockUntil        *time.Time `json:"block_until"`
}

// OTPConfig represents OTP configuration
type OTPConfig struct {
	CodeLength      int    `json:"code_length"`
	ExpiryMinutes   int    `json:"expiry_minutes"`
	MaxAttempts     int    `json:"max_attempts"`
	ResendCooldown  int    `json:"resend_cooldown"`   // in minutes
	RateLimitWindow int    `json:"rate_limit_window"` // in minutes
	MaxOTPPerWindow int    `json:"max_otp_per_window"`
	BlockDuration   int    `json:"block_duration"` // in minutes
	EmailTemplate   string `json:"email_template"`
	SMSTemplate     string `json:"sms_template"`
}

// OTPConfigResponse represents the OTP configuration response
type OTPConfigResponse struct {
	Config OTPConfig `json:"config"`
}

// UpdateOTPConfigRequest represents the request to update OTP configuration
type UpdateOTPConfigRequest struct {
	Config OTPConfig `json:"config" binding:"required"`
}

// UserInfo represents user information (imported from auth DTO)
type UserInfo struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
	Status   string `json:"status"`
}

// PaginationInfo represents pagination information
type PaginationInfo struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}
