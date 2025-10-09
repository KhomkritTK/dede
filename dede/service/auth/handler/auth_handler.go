package handler

import (
	"strconv"

	"eservice-backend/config"
	"eservice-backend/database"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/auth/dto"
	"eservice-backend/service/auth/usecase"
	"eservice-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	authUsecase usecase.AuthUsecase
	config      *config.Config
}

func NewAuthHandler(db *gorm.DB, config *config.Config) *AuthHandler {
	userRepo := repository.NewUserRepository(db)
	authUsecase := usecase.NewAuthUsecase(userRepo, config)

	return &AuthHandler{
		authUsecase: authUsecase,
		config:      config,
	}
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	response, err := h.authUsecase.Login(req)
	if err != nil {
		utils.ErrorUnauthorized(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Login successful", response)
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	if err := h.authUsecase.Register(req); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessCreated(c, "Registration successful", nil)
}

// ChangePassword handles password change
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	id, ok := userID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	if err := h.authUsecase.ChangePassword(id, req); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Password changed successfully", nil)
}

// ForgotPassword handles forgot password request
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req dto.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	if err := h.authUsecase.ForgotPassword(req); err != nil {
		utils.ErrorInternalServerError(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "If your email is registered, you will receive a password reset link", nil)
}

// ResetPassword handles password reset
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req dto.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	if err := h.authUsecase.ResetPassword(req); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Password reset successful", nil)
}

// RefreshToken handles token refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req dto.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	response, err := h.authUsecase.RefreshToken(req)
	if err != nil {
		utils.ErrorUnauthorized(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Token refreshed successfully", response)
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	id, ok := userID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	if err := h.authUsecase.Logout(id); err != nil {
		utils.ErrorInternalServerError(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Logout successful", nil)
}

// GetProfile handles getting user profile
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	id, ok := userID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	db := database.GetDB()
	var user models.User
	if err := db.First(&user, id).Error; err != nil {
		utils.ErrorNotFound(c, "User not found", err)
		return
	}

	userInfo := dto.UserInfo{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		FullName: user.FullName,
		Role:     string(user.Role),
		Status:   string(user.Status),
		Phone:    user.Phone,
		Company:  user.Company,
		Address:  user.Address,
	}

	utils.SuccessOK(c, "Profile retrieved successfully", userInfo)
}

// UpdateProfile handles updating user profile
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	id, ok := userID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	var req struct {
		FullName string `json:"full_name"`
		Phone    string `json:"phone"`
		Company  string `json:"company"`
		Address  string `json:"address"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	db := database.GetDB()
	var user models.User
	if err := db.First(&user, id).Error; err != nil {
		utils.ErrorNotFound(c, "User not found", err)
		return
	}

	// Update user fields
	user.FullName = req.FullName
	user.Phone = req.Phone
	user.Company = req.Company
	user.Address = req.Address

	if err := db.Save(&user).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to update profile", err)
		return
	}

	userInfo := dto.UserInfo{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		FullName: user.FullName,
		Role:     string(user.Role),
		Status:   string(user.Status),
		Phone:    user.Phone,
		Company:  user.Company,
		Address:  user.Address,
	}

	utils.SuccessOK(c, "Profile updated successfully", userInfo)
}

// GetUsers handles getting all users (admin only)
func (h *AuthHandler) GetUsers(c *gin.Context) {
	// Check if user is admin
	userRole, exists := c.Get("user_role")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	role, ok := userRole.(models.UserRole)
	if !ok || (role != models.RoleAdmin && role != models.RoleDEDEHead) {
		utils.ErrorForbidden(c, "Insufficient permissions", nil)
		return
	}

	// Get query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	db := database.GetDB()
	var users []models.User
	var total int64

	query := db.Model(&models.User{})

	// Apply search filter
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("username LIKE ? OR email LIKE ? OR full_name LIKE ?",
			searchPattern, searchPattern, searchPattern)
	}

	// Count total records
	query.Count(&total)

	// Apply pagination
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve users", err)
		return
	}

	// Convert to user info
	var userInfos []dto.UserInfo
	for _, user := range users {
		userInfos = append(userInfos, dto.UserInfo{
			ID:       user.ID,
			Username: user.Username,
			Email:    user.Email,
			FullName: user.FullName,
			Role:     string(user.Role),
			Status:   string(user.Status),
			Phone:    user.Phone,
			Company:  user.Company,
			Address:  user.Address,
		})
	}

	response := gin.H{
		"users": userInfos,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	}

	utils.SuccessOK(c, "Users retrieved successfully", response)
}
