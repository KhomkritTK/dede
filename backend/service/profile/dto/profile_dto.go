package dto

import (
	"eservice-backend/service/auth/dto"
	"time"
)

// ProfileResponse represents the user profile response
type ProfileResponse struct {
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
	User                         dto.UserInfo         `json:"user,omitempty"`
	Preferences                  interface{}          `json:"preferences,omitempty"`
	NotificationSettings         NotificationSettings `json:"notification_settings"`
	PrivacySettings              PrivacySettings      `json:"privacy_settings"`
}

// UpdateProfileRequest represents the request to update profile
type UpdateProfileRequest struct {
	NationalID     string     `json:"national_id"`
	PassportNumber string     `json:"passport_number"`
	DateOfBirth    *time.Time `json:"date_of_birth"`
	Gender         string     `json:"gender" binding:"omitempty,oneof=male female other prefer_not_to_say"`
	Nationality    string     `json:"nationality"`
	Address        string     `json:"address"`
	Province       string     `json:"province"`
	District       string     `json:"district"`
	Subdistrict    string     `json:"subdistrict"`
	PostalCode     string     `json:"postal_code"`
	HomePhone      string     `json:"home_phone"`
	WorkPhone      string     `json:"work_phone"`
	Fax            string     `json:"fax"`
	Bio            string     `json:"bio"`
	Website        string     `json:"website"`
	LinkedIn       string     `json:"linkedin"`
	Facebook       string     `json:"facebook"`
	Twitter        string     `json:"twitter"`
}

// UpdateProfileImageRequest represents the request to update profile image
type UpdateProfileImageRequest struct {
	ProfileImage string `json:"profile_image" binding:"required"`
}

// UpdateSignatureImageRequest represents the request to update signature image
type UpdateSignatureImageRequest struct {
	SignatureImage string `json:"signature_image" binding:"required"`
}

// PreferencesResponse represents the preferences response
type PreferencesResponse struct {
	Preferences interface{} `json:"preferences"`
}

// UpdatePreferencesRequest represents the request to update preferences
type UpdatePreferencesRequest struct {
	Preferences interface{} `json:"preferences" binding:"required"`
}

// NotificationSettings represents notification settings
type NotificationSettings struct {
	Email bool `json:"email"`
	SMS   bool `json:"sms"`
	Push  bool `json:"push"`
}

// NotificationSettingsResponse represents the notification settings response
type NotificationSettingsResponse struct {
	NotificationSettings NotificationSettings `json:"notification_settings"`
}

// UpdateNotificationSettingsRequest represents the request to update notification settings
type UpdateNotificationSettingsRequest struct {
	NotificationSettings NotificationSettings `json:"notification_settings" binding:"required"`
}

// PrivacySettings represents privacy settings
type PrivacySettings struct {
	ProfileVisibility   string `json:"profile_visibility" binding:"omitempty,oneof=public members private"`
	ContactVisibility   string `json:"contact_visibility" binding:"omitempty,oneof=public members private"`
	ShowEmail           bool   `json:"show_email"`
	ShowPhone           bool   `json:"show_phone"`
	ShowAddress         bool   `json:"show_address"`
	AllowDirectMessages bool   `json:"allow_direct_messages"`
}

// PrivacySettingsResponse represents the privacy settings response
type PrivacySettingsResponse struct {
	PrivacySettings PrivacySettings `json:"privacy_settings"`
}

// UpdatePrivacySettingsRequest represents the request to update privacy settings
type UpdatePrivacySettingsRequest struct {
	PrivacySettings PrivacySettings `json:"privacy_settings" binding:"required"`
}

// VerifyPhoneRequest represents the request to verify phone number
type VerifyPhoneRequest struct {
	Phone   string `json:"phone" binding:"required"`
	OTPCode string `json:"otp_code" binding:"required,len=6"`
}

// RequestPhoneVerificationRequest represents the request to request phone verification
type RequestPhoneVerificationRequest struct {
	Phone string `json:"phone" binding:"required"`
}

// EmergencyContactResponse represents the emergency contact response
type EmergencyContactResponse struct {
	EmergencyContactName         string `json:"emergency_contact_name"`
	EmergencyContactPhone        string `json:"emergency_contact_phone"`
	EmergencyContactRelationship string `json:"emergency_contact_relationship"`
}

// UpdateEmergencyContactRequest represents the request to update emergency contact
type UpdateEmergencyContactRequest struct {
	EmergencyContactName         string `json:"emergency_contact_name" binding:"required"`
	EmergencyContactPhone        string `json:"emergency_contact_phone" binding:"required"`
	EmergencyContactRelationship string `json:"emergency_contact_relationship" binding:"required"`
}

// ProfileCompletionResponse represents the profile completion response
type ProfileCompletionResponse struct {
	CompletionPercentage int              `json:"completion_percentage"`
	CompletedFields      []string         `json:"completed_fields"`
	MissingFields        []string         `json:"missing_fields"`
	NextSteps            []string         `json:"next_steps"`
	Profile              *ProfileResponse `json:"profile,omitempty"`
}

// CompleteProfileRequest represents the request to complete profile
type CompleteProfileRequest struct {
	UpdateProfileRequest
	EmergencyContactName         string `json:"emergency_contact_name" binding:"required"`
	EmergencyContactPhone        string `json:"emergency_contact_phone" binding:"required"`
	EmergencyContactRelationship string `json:"emergency_contact_relationship" binding:"required"`
}
