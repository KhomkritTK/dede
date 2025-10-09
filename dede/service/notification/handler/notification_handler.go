package handler

import (
	"strconv"

	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/notification/dto"
	"eservice-backend/service/notification/usecase"
	"eservice-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type NotificationHandler struct {
	notificationUsecase usecase.NotificationUsecase
	config              *config.Config
}

func NewNotificationHandler(db *gorm.DB, config *config.Config) *NotificationHandler {
	notificationRepo := repository.NewNotificationRepository(db)
	userRepo := repository.NewUserRepository(db)
	notificationUsecase := usecase.NewNotificationUsecase(notificationRepo, userRepo)

	return &NotificationHandler{
		notificationUsecase: notificationUsecase,
		config:              config,
	}
}

// CreateNotification handles creating a new notification
func (h *NotificationHandler) CreateNotification(c *gin.Context) {
	var req dto.CreateNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	response, err := h.notificationUsecase.CreateNotification(req)
	if err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessCreated(c, "Notification created successfully", response)
}

// GetNotifications handles getting notifications
func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	recipientID, _ := strconv.ParseUint(c.Query("recipient_id"), 10, 32)
	recipientRole := c.Query("recipient_role")

	response, err := h.notificationUsecase.GetNotifications(
		page,
		limit,
		uint(recipientID),
		recipientRole,
	)
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve notifications", err)
		return
	}

	utils.SuccessOK(c, "Notifications retrieved successfully", response)
}

// GetNotification handles getting a specific notification
func (h *NotificationHandler) GetNotification(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid notification ID", err)
		return
	}

	response, err := h.notificationUsecase.GetNotificationByID(uint(id))
	if err != nil {
		utils.ErrorNotFound(c, "Notification not found", err)
		return
	}

	utils.SuccessOK(c, "Notification retrieved successfully", response)
}

// GetMyNotifications handles getting the current user's notifications
func (h *NotificationHandler) GetMyNotifications(c *gin.Context) {
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

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	response, err := h.notificationUsecase.GetNotifications(page, limit, id, "")
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve notifications", err)
		return
	}

	utils.SuccessOK(c, "Notifications retrieved successfully", response)
}

// GetUnreadNotifications handles getting unread notifications
func (h *NotificationHandler) GetUnreadNotifications(c *gin.Context) {
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

	response, err := h.notificationUsecase.GetUnreadNotifications(id)
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve notifications", err)
		return
	}

	utils.SuccessOK(c, "Unread notifications retrieved successfully", response)
}

// MarkAsRead handles marking a notification as read
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid notification ID", err)
		return
	}

	if err := h.notificationUsecase.MarkAsRead(uint(id)); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Notification marked as read", nil)
}

// MarkAllAsRead handles marking all notifications as read
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
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

	if err := h.notificationUsecase.MarkAllAsRead(id); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "All notifications marked as read", nil)
}

// DeleteNotification handles deleting a notification
func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid notification ID", err)
		return
	}

	if err := h.notificationUsecase.DeleteNotification(uint(id)); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Notification deleted successfully", nil)
}

// GetNotificationCount handles getting notification count
func (h *NotificationHandler) GetNotificationCount(c *gin.Context) {
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

	response, err := h.notificationUsecase.GetNotificationCount(id)
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve notification count", err)
		return
	}

	utils.SuccessOK(c, "Notification count retrieved successfully", response)
}

// GetNotificationTypes handles getting notification types
func (h *NotificationHandler) GetNotificationTypes(c *gin.Context) {
	response := h.notificationUsecase.GetNotificationTypes()
	utils.SuccessOK(c, "Notification types retrieved successfully", response)
}

// GetNotificationPriorities handles getting notification priorities
func (h *NotificationHandler) GetNotificationPriorities(c *gin.Context) {
	response := h.notificationUsecase.GetNotificationPriorities()
	utils.SuccessOK(c, "Notification priorities retrieved successfully", response)
}

// SendNotifications handles sending unsent notifications (admin only)
func (h *NotificationHandler) SendNotifications(c *gin.Context) {
	// Check if user is admin or DEDE head
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

	if err := h.notificationUsecase.SendUnsentNotifications(); err != nil {
		utils.ErrorInternalServerError(c, "Failed to send notifications", err)
		return
	}

	utils.SuccessOK(c, "Notifications sent successfully", nil)
}
