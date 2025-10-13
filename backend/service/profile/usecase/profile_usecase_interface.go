package usecase

import (
	"eservice-backend/service/profile/dto"
)

// ProfileUsecase defines the interface for user profile business logic
type ProfileUsecase interface {
	// WB-PR-01 (User Profile Management)
	GetProfile(userID uint) (*dto.ProfileResponse, error)
	UpdateProfile(userID uint, req dto.UpdateProfileRequest) (*dto.ProfileResponse, error)
	UpdateProfileImage(userID uint, req dto.UpdateProfileImageRequest) (*dto.ProfileResponse, error)
	UpdateSignatureImage(userID uint, req dto.UpdateSignatureImageRequest) (*dto.ProfileResponse, error)

	// Profile preferences and settings
	GetPreferences(userID uint) (*dto.PreferencesResponse, error)
	UpdatePreferences(userID uint, req dto.UpdatePreferencesRequest) error
	GetNotificationSettings(userID uint) (*dto.NotificationSettingsResponse, error)
	UpdateNotificationSettings(userID uint, req dto.UpdateNotificationSettingsRequest) error
	GetPrivacySettings(userID uint) (*dto.PrivacySettingsResponse, error)
	UpdatePrivacySettings(userID uint, req dto.UpdatePrivacySettingsRequest) error

	// Profile verification
	VerifyEmail(userID uint) error
	VerifyPhone(userID uint, req dto.VerifyPhoneRequest) error
	RequestEmailVerification(userID uint) error
	RequestPhoneVerification(userID uint, req dto.RequestPhoneVerificationRequest) error

	// Emergency contact
	GetEmergencyContact(userID uint) (*dto.EmergencyContactResponse, error)
	UpdateEmergencyContact(userID uint, req dto.UpdateEmergencyContactRequest) error

	// Profile completion
	GetProfileCompletion(userID uint) (*dto.ProfileCompletionResponse, error)
	CompleteProfile(userID uint, req dto.CompleteProfileRequest) error
}
