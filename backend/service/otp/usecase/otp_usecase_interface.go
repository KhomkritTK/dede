package usecase

import (
	"eservice-backend/service/otp/dto"
)

// OTPUsecase defines the interface for OTP business logic
type OTPUsecase interface {
	// OTP generation and sending
	GenerateOTP(req dto.GenerateOTPRequest) (*dto.OTPResponse, error)
	SendOTP(req dto.SendOTPRequest) error
	ResendOTP(req dto.ResendOTPRequest) error

	// OTP verification
	VerifyOTP(req dto.VerifyOTPRequest) (*dto.VerifyOTPResponse, error)
	VerifyOTPForPurpose(req dto.VerifyOTPForPurposeRequest) (*dto.VerifyOTPResponse, error)

	// OTP management
	InvalidateOTP(otpID uint) error
	InvalidateUserOTPs(userID uint, purpose string) error
	CleanupExpiredOTPs() error

	// OTP status and history
	GetOTPStatus(otpID uint) (*dto.OTPStatusResponse, error)
	GetUserOTPHistory(userID uint, req dto.GetUserOTPHistoryRequest) (*dto.UserOTPHistoryResponse, error)

	// Rate limiting and security
	CheckRateLimit(identifier string, purpose string) error
	GetRemainingAttempts(identifier string, purpose string) (*dto.AttemptsResponse, error)

	// OTP configuration
	GetOTPConfig() (*dto.OTPConfigResponse, error)
	UpdateOTPConfig(req dto.UpdateOTPConfigRequest) error
}
