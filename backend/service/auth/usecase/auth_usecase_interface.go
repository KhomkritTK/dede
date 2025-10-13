package usecase

import "eservice-backend/service/auth/dto"

type AuthUsecase interface {
	// WB-LG-01 (E-License Login)
	Login(req dto.LoginRequest) (*dto.LoginResponse, error)
	LoginWithOTP(req dto.LoginWithOTPRequest) (*dto.LoginResponse, error)

	// WB-RG-01 (General User Register)
	Register(req dto.RegisterRequest) error
	RegisterWithOTP(req dto.RegisterWithOTPRequest) error
	VerifyRegistrationOTP(req dto.VerifyOTPRequest) error

	// WB-RG-02 (Corporate Admin Register)
	RegisterCorporate(req dto.RegisterCorporateRequest) error
	VerifyCorporateOTP(req dto.VerifyOTPRequest) error

	// WB-RG-03 (Corporate Member Register)
	AcceptInvitation(req dto.AcceptInvitationRequest) error
	RegisterCorporateMember(req dto.RegisterCorporateMemberRequest) error

	// General authentication functions
	ChangePassword(userID uint, req dto.ChangePasswordRequest) error
	ForgotPassword(req dto.ForgotPasswordRequest) error
	ResetPassword(req dto.ResetPasswordRequest) error
	RefreshToken(req dto.RefreshTokenRequest) (*dto.LoginResponse, error)
	Logout(userID uint) error

	// OTP functions
	SendOTP(req dto.SendOTPRequest) error
	VerifyOTP(req dto.VerifyOTPRequest) (*dto.VerifyOTPResponse, error)
	ResendOTP(req dto.ResendOTPRequest) error
}
