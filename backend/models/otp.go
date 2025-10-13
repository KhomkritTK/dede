package models

import (
	"time"
)

// OTPType represents the type of OTP
type OTPType string

const (
	OTPTypeEmail OTPType = "email"
	OTPTypePhone OTPType = "phone"
)

// OTPPurpose represents the purpose of the OTP
type OTPPurpose string

const (
	OTPPurposeRegistration        OTPPurpose = "registration"
	OTPPurposeLogin               OTPPurpose = "login"
	OTPPurposePasswordReset       OTPPurpose = "password_reset"
	OTPPurposeEmailVerify         OTPPurpose = "email_verify"
	OTPPurposePhoneVerify         OTPPurpose = "phone_verify"
	OTPPurposeCorporateInvitation OTPPurpose = "corporate_invitation"
)

// OTP represents a one-time password code
type OTP struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	UserID      *uint      `json:"user_id"`
	User        *User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Identifier  string     `json:"identifier" gorm:"not null"` // email or phone number
	OTPType     OTPType    `json:"otp_type" gorm:"not null"`
	Purpose     OTPPurpose `json:"purpose" gorm:"not null"`
	Code        string     `json:"code" gorm:"not null"`
	Attempts    int        `json:"attempts" gorm:"default:0"`
	MaxAttempts int        `json:"max_attempts" gorm:"default:3"`
	ExpiresAt   time.Time  `json:"expires_at" gorm:"not null"`
	VerifiedAt  *time.Time `json:"verified_at"`
	IsUsed      bool       `json:"is_used" gorm:"default:false"`
	CreatedAt   time.Time  `json:"created_at" gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"default:CURRENT_TIMESTAMP"`
}

// TableName specifies the table name for the OTP model
func (OTP) TableName() string {
	return "otp_codes"
}

// IsExpired checks if the OTP has expired
func (o *OTP) IsExpired() bool {
	return time.Now().After(o.ExpiresAt)
}

// IsVerified checks if the OTP has been verified
func (o *OTP) IsVerified() bool {
	return o.VerifiedAt != nil
}

// CanAttempt checks if the user can still attempt verification
func (o *OTP) CanAttempt() bool {
	return o.Attempts < o.MaxAttempts && !o.IsExpired() && !o.IsUsed
}

// Verify marks the OTP as verified
func (o *OTP) Verify() {
	now := time.Now()
	o.VerifiedAt = &now
	o.IsUsed = true
	o.UpdatedAt = now
}

// IncrementAttempt increments the attempt counter
func (o *OTP) IncrementAttempt() {
	o.Attempts++
	o.UpdatedAt = time.Now()
}

// IsValid checks if the OTP code is valid and can be used
func (o *OTP) IsValid(code string) bool {
	return o.Code == code && o.CanAttempt() && !o.IsVerified()
}

// GenerateNewCode generates a new 6-digit code and resets the OTP
func (o *OTP) GenerateNewCode() string {
	// Generate a 6-digit code
	code := generateOTPCode()
	o.Code = code
	o.Attempts = 0
	o.IsUsed = false
	o.VerifiedAt = nil
	o.ExpiresAt = time.Now().Add(10 * time.Minute) // 10 minutes expiry
	o.UpdatedAt = time.Now()
	return code
}

// generateOTPCode generates a 6-digit OTP code
func generateOTPCode() string {
	// In a real implementation, you would use a proper random number generator
	// This is a simplified version for demonstration
	return "123456" // This should be replaced with actual random code generation
}

// NewOTP creates a new OTP instance
func NewOTP(userID *uint, identifier string, otpType OTPType, purpose OTPPurpose) *OTP {
	code := generateOTPCode()
	return &OTP{
		UserID:      userID,
		Identifier:  identifier,
		OTPType:     otpType,
		Purpose:     purpose,
		Code:        code,
		Attempts:    0,
		MaxAttempts: 3,
		ExpiresAt:   time.Now().Add(10 * time.Minute), // 10 minutes expiry
		IsUsed:      false,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}
