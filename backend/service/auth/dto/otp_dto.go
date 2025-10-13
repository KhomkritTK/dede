package dto

import "time"

// SendOTPRequest represents the request to send OTP
type SendOTPRequest struct {
	Identifier string `json:"identifier" binding:"required"` // email or phone
	OTPType    string `json:"otp_type" binding:"required,oneof=email phone"`
	Purpose    string `json:"purpose" binding:"required,oneof=registration login password_reset email_verify phone_verify corporate_invitation"`
}

// VerifyOTPRequest represents the request to verify OTP
type VerifyOTPRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Code       string `json:"code" binding:"required,len=6"`
	Purpose    string `json:"purpose" binding:"required"`
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

// ResendOTPRequest represents the request to resend OTP
type ResendOTPRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Purpose    string `json:"purpose" binding:"required"`
}

// LoginWithOTPRequest represents the login request with OTP
type LoginWithOTPRequest struct {
	Identifier string `json:"identifier" binding:"required"` // email or phone
	OTPCode    string `json:"otp_code" binding:"required,len=6"`
}

// RegisterWithOTPRequest represents the registration request with OTP verification
type RegisterWithOTPRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required,min=1,max=100"`
	Phone    string `json:"phone"`
	Company  string `json:"company"`
	Address  string `json:"address"`
	OTPCode  string `json:"otp_code" binding:"required,len=6"`
}

// RegisterCorporateRequest represents the corporate registration request
type RegisterCorporateRequest struct {
	// User Information
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required,min=1,max=100"`
	Phone    string `json:"phone" binding:"required"`

	// Corporate Information
	CorporateName      string `json:"corporate_name" binding:"required,min=1,max=200"`
	CorporateNameEn    string `json:"corporate_name_en"`
	RegistrationNumber string `json:"registration_number" binding:"required"`
	TaxID              string `json:"tax_id"`
	CorporateType      string `json:"corporate_type" binding:"required,oneof=company partnership sole_proprietorship limited_company public_company state_owned"`
	IndustryType       string `json:"industry_type"`
	Address            string `json:"address" binding:"required"`
	Province           string `json:"province" binding:"required"`
	District           string `json:"district" binding:"required"`
	Subdistrict        string `json:"subdistrict" binding:"required"`
	PostalCode         string `json:"postal_code" binding:"required"`
	CorporatePhone     string `json:"corporate_phone"`
	CorporateEmail     string `json:"corporate_email"`
	Website            string `json:"website"`
	Description        string `json:"description"`
}

// AcceptInvitationRequest represents the request to accept corporate invitation
type AcceptInvitationRequest struct {
	InvitationToken string `json:"invitation_token" binding:"required"`
	Username        string `json:"username" binding:"required,min=3,max=50"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=6"`
	FullName        string `json:"full_name" binding:"required,min=1,max=100"`
	Phone           string `json:"phone"`
	OTPCode         string `json:"otp_code" binding:"required,len=6"`
}

// RegisterCorporateMemberRequest represents the request to register a corporate member
type RegisterCorporateMemberRequest struct {
	CorporateID uint   `json:"corporate_id" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	FullName    string `json:"full_name" binding:"required,min=1,max=100"`
	Phone       string `json:"phone"`
	Position    string `json:"position"`
	Department  string `json:"department"`
	MemberRole  string `json:"member_role" binding:"required,oneof=admin manager member viewer"`
}
