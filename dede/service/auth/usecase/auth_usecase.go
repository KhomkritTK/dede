package usecase

import (
	"errors"
	"time"

	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/auth/dto"
	"eservice-backend/utils"

	"golang.org/x/crypto/bcrypt"
)

type AuthUsecase interface {
	Login(req dto.LoginRequest) (*dto.LoginResponse, error)
	Register(req dto.RegisterRequest) error
	ChangePassword(userID uint, req dto.ChangePasswordRequest) error
	ForgotPassword(req dto.ForgotPasswordRequest) error
	ResetPassword(req dto.ResetPasswordRequest) error
	RefreshToken(req dto.RefreshTokenRequest) (*dto.LoginResponse, error)
	Logout(userID uint) error
}

type authUsecase struct {
	userRepo repository.UserRepository
	config   *config.Config
}

func NewAuthUsecase(userRepo repository.UserRepository, config *config.Config) AuthUsecase {
	return &authUsecase{
		userRepo: userRepo,
		config:   config,
	}
}

func (u *authUsecase) Login(req dto.LoginRequest) (*dto.LoginResponse, error) {
	// Find user by username
	user, err := u.userRepo.GetByUsername(req.Username)
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	// Check if user is active
	if !user.IsActive() {
		return nil, errors.New("user account is not active")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid username or password")
	}

	// Generate JWT tokens
	accessToken, refreshToken, err := utils.GenerateTokenPair(
		user.ID,
		user.Email,
		string(user.Role),
		u.config.JWTSecret,
	)
	if err != nil {
		return nil, errors.New("failed to generate tokens")
	}

	// Parse expiry time
	expiry, _ := time.ParseDuration(u.config.JWTExpiry)

	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: dto.UserInfo{
			ID:       user.ID,
			Username: user.Username,
			Email:    user.Email,
			FullName: user.FullName,
			Role:     string(user.Role),
			Status:   string(user.Status),
		},
		ExpiresIn: int(expiry.Seconds()),
	}, nil
}

func (u *authUsecase) Register(req dto.RegisterRequest) error {
	// Check if username already exists
	_, err := u.userRepo.GetByUsername(req.Username)
	if err == nil {
		return errors.New("username already exists")
	}

	// Check if email already exists
	_, err = u.userRepo.GetByEmail(req.Email)
	if err == nil {
		return errors.New("email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("failed to hash password")
	}

	// Create new user
	user := &models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
		FullName: req.FullName,
		Phone:    req.Phone,
		Company:  req.Company,
		Address:  req.Address,
		Role:     models.RoleUser,
		Status:   models.UserStatusActive,
	}

	if err := u.userRepo.Create(user); err != nil {
		return errors.New("failed to create user")
	}

	return nil
}

func (u *authUsecase) ChangePassword(userID uint, req dto.ChangePasswordRequest) error {
	// Get user
	user, err := u.userRepo.GetByID(userID)
	if err != nil {
		return errors.New("user not found")
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("failed to hash password")
	}

	// Update password
	user.Password = string(hashedPassword)
	if err := u.userRepo.Update(user); err != nil {
		return errors.New("failed to update password")
	}

	return nil
}

func (u *authUsecase) ForgotPassword(req dto.ForgotPasswordRequest) error {
	// Get user by email
	user, err := u.userRepo.GetByEmail(req.Email)
	if err != nil {
		// Don't reveal that user doesn't exist
		return nil
	}

	// TODO: Generate reset token and send email
	// For now, just return success
	_ = user

	return nil
}

func (u *authUsecase) ResetPassword(req dto.ResetPasswordRequest) error {
	// TODO: Validate reset token and reset password
	// For now, just return error
	return errors.New("reset password functionality not implemented yet")
}

func (u *authUsecase) RefreshToken(req dto.RefreshTokenRequest) (*dto.LoginResponse, error) {
	// Validate refresh token
	claims, err := utils.ValidateJWT(req.RefreshToken, u.config.JWTSecret)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Get user
	user, err := u.userRepo.GetByID(claims.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Check if user is active
	if !user.IsActive() {
		return nil, errors.New("user account is not active")
	}

	// Generate new tokens
	accessToken, refreshToken, err := utils.GenerateTokenPair(
		user.ID,
		user.Email,
		string(user.Role),
		u.config.JWTSecret,
	)
	if err != nil {
		return nil, errors.New("failed to generate tokens")
	}

	// Parse expiry time
	expiry, _ := time.ParseDuration(u.config.JWTExpiry)

	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: dto.UserInfo{
			ID:       user.ID,
			Username: user.Username,
			Email:    user.Email,
			FullName: user.FullName,
			Role:     string(user.Role),
			Status:   string(user.Status),
		},
		ExpiresIn: int(expiry.Seconds()),
	}, nil
}

func (u *authUsecase) Logout(userID uint) error {
	// TODO: Implement logout functionality (token blacklisting)
	// For now, just return success
	return nil
}
