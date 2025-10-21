package handler

import (
	"eservice-backend/config"
	"eservice-backend/middleware"
	"eservice-backend/service/notification/dto"
	"eservice-backend/service/notification/service"
	"eservice-backend/utils"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type NotificationHandler struct {
	notificationService service.NotificationService
}

func NewNotificationHandler(db *gorm.DB, cfg *config.Config) *NotificationHandler {
	return &NotificationHandler{
		notificationService: service.NewNotificationService(db),
	}
}

// CreateNotification creates a new notification
func (h *NotificationHandler) CreateNotification(c *gin.Context) {
	var req dto.CreateNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	if err := h.notificationService.CreateNotification(req); err != nil {
		utils.ErrorInternalServerError(c, "Failed to create notification", err)
		return
	}

	utils.SuccessCreated(c, "Notification created successfully", nil)
}

// GetNotifications retrieves notifications for the current user
func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	// Get current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	// Get query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	req := dto.GetNotificationsRequest{
		Page:          page,
		Limit:         limit,
		Type:          c.Query("type"),
		Priority:      c.Query("priority"),
		RecipientRole: c.Query("recipient_role"),
	}

	// Parse is_read parameter
	if isReadStr := c.Query("is_read"); isReadStr != "" {
		isRead := isReadStr == "true"
		req.IsRead = &isRead
	}

	// Parse date range parameters
	if startDateStr := c.Query("start_date"); startDateStr != "" {
		startDate, err := utils.ParseDate(startDateStr)
		if err == nil {
			req.StartDate = &startDate
		}
	}

	if endDateStr := c.Query("end_date"); endDateStr != "" {
		endDate, err := utils.ParseDate(endDateStr)
		if err == nil {
			req.EndDate = &endDate
		}
	}

	notifications, total, err := h.notificationService.GetNotifications(userID.(uint), req)
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to get notifications", err)
		return
	}

	// Format response
	var notificationList []dto.NotificationResponse
	for _, notification := range notifications {
		notificationList = append(notificationList, dto.NotificationResponse{
			ID:            notification.ID,
			Title:         notification.Title,
			Message:       notification.Message,
			Type:          string(notification.Type),
			Priority:      string(notification.Priority),
			RecipientID:   notification.RecipientID,
			RecipientRole: string(*notification.RecipientRole),
			EntityType:    notification.EntityType,
			EntityID:      notification.EntityID,
			ActionURL:     notification.ActionURL,
			ReadAt:        notification.ReadAt,
			CreatedAt:     notification.CreatedAt,
		})
	}

	response := gin.H{
		"notifications": notificationList,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	}

	utils.SuccessOK(c, "Notifications retrieved successfully", response)
}

// MarkAsRead marks a notification as read
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	notificationIDStr := c.Param("id")
	notificationID, err := strconv.ParseUint(notificationIDStr, 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid notification ID", err)
		return
	}

	// Get current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	if err := h.notificationService.MarkAsRead(uint(notificationID), userID.(uint)); err != nil {
		utils.ErrorInternalServerError(c, "Failed to mark notification as read", err)
		return
	}

	utils.SuccessOK(c, "Notification marked as read successfully", nil)
}

// MarkAllAsRead marks all notifications for the current user as read
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	// Get current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	if err := h.notificationService.MarkAllAsRead(userID.(uint)); err != nil {
		utils.ErrorInternalServerError(c, "Failed to mark all notifications as read", err)
		return
	}

	utils.SuccessOK(c, "All notifications marked as read successfully", nil)
}

// DeleteNotification deletes a notification
func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
	notificationIDStr := c.Param("id")
	notificationID, err := strconv.ParseUint(notificationIDStr, 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid notification ID", err)
		return
	}

	// Get current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	if err := h.notificationService.DeleteNotification(uint(notificationID), userID.(uint)); err != nil {
		utils.ErrorInternalServerError(c, "Failed to delete notification", err)
		return
	}

	utils.SuccessOK(c, "Notification deleted successfully", nil)
}

// BroadcastNotification sends a notification to multiple recipients
func (h *NotificationHandler) BroadcastNotification(c *gin.Context) {
	var req dto.BroadcastNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	if err := h.notificationService.BroadcastNotification(req); err != nil {
		utils.ErrorInternalServerError(c, "Failed to broadcast notification", err)
		return
	}

	utils.SuccessOK(c, "Notification broadcasted successfully", nil)
}

// GetUnreadCount returns the count of unread notifications for the current user
func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	// Get current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	count, err := h.notificationService.GetUnreadCount(userID.(uint))
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to get unread count", err)
		return
	}

	response := gin.H{
		"unread_count": count,
	}

	utils.SuccessOK(c, "Unread count retrieved successfully", response)
}

// GetNotificationSettings returns notification settings for the current user
func (h *NotificationHandler) GetNotificationSettings(c *gin.Context) {
	// Get current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	settings, err := h.notificationService.GetNotificationSettings(userID.(uint))
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to get notification settings", err)
		return
	}

	utils.SuccessOK(c, "Notification settings retrieved successfully", settings)
}

// UpdateNotificationSettings updates notification settings for the current user
func (h *NotificationHandler) UpdateNotificationSettings(c *gin.Context) {
	var req dto.UpdateNotificationSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	// Get current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	if err := h.notificationService.UpdateNotificationSettings(userID.(uint), req); err != nil {
		utils.ErrorInternalServerError(c, "Failed to update notification settings", err)
		return
	}

	utils.SuccessOK(c, "Notification settings updated successfully", nil)
}

// CreateStateChangeNotification creates a notification for state changes
func (h *NotificationHandler) CreateStateChangeNotification(c *gin.Context) {
	var req dto.StateChangeNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	// Create a state change notification manually
	title := "สถานะคำขอเปลี่ยนแล้ว"
	message := fmt.Sprintf("คำขอเลขที่ %d เปลี่ยนสถานะจาก %s เป็น %s", req.RequestID, req.FromStatus, req.ToStatus)

	// Create notification for each recipient
	for _, recipientID := range req.Recipients {
		notificationReq := dto.CreateNotificationRequest{
			Title:       title,
			Message:     message,
			Type:        "state_changed",
			Priority:    "normal",
			RecipientID: &recipientID,
			EntityType:  "license_request",
			EntityID:    &req.RequestID,
			ActionURL:   fmt.Sprintf("/admin-portal/services/%d", req.RequestID),
		}

		if err := h.notificationService.CreateNotification(notificationReq); err != nil {
			utils.ErrorInternalServerError(c, "Failed to create state change notification", err)
			return
		}
	}

	// Create notification for each role
	for _, role := range req.Roles {
		notificationReq := dto.CreateNotificationRequest{
			Title:         title,
			Message:       message,
			Type:          "state_changed",
			Priority:      "normal",
			RecipientRole: role,
			EntityType:    "license_request",
			EntityID:      &req.RequestID,
			ActionURL:     fmt.Sprintf("/admin-portal/services/%d", req.RequestID),
		}

		if err := h.notificationService.CreateNotification(notificationReq); err != nil {
			utils.ErrorInternalServerError(c, "Failed to create state change notification", err)
			return
		}
	}

	utils.SuccessOK(c, "State change notification created successfully", nil)
}

// SetNotificationRoutes sets up routes for notification functionality
func SetNotificationRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	// Create notification handler
	notificationHandler := NewNotificationHandler(db, cfg)

	// Notification routes (protected)
	notifications := r.Group("/notifications")
	notifications.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// Get notifications
		notifications.GET("", notificationHandler.GetNotifications)

		// Get unread count
		notifications.GET("/unread-count", notificationHandler.GetUnreadCount)

		// Mark as read
		notifications.POST("/:id/read", notificationHandler.MarkAsRead)

		// Mark all as read
		notifications.POST("/read-all", notificationHandler.MarkAllAsRead)

		// Delete notification
		notifications.DELETE("/:id", notificationHandler.DeleteNotification)

		// Get notification settings
		notifications.GET("/settings", notificationHandler.GetNotificationSettings)

		// Update notification settings
		notifications.PUT("/settings", notificationHandler.UpdateNotificationSettings)

		// Create state change notification (admin only)
		notifications.POST("/state-change",
			middleware.RequireRole([]string{"admin", "dede_head", "dede_staff", "dede_consult"}),
			notificationHandler.CreateStateChangeNotification)
	}

	// Admin notification routes (admin only)
	adminNotifications := r.Group("/admin/notifications")
	adminNotifications.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	adminNotifications.Use(middleware.RequireRole([]string{"admin"}))
	{
		// Create notification
		adminNotifications.POST("", notificationHandler.CreateNotification)

		// Broadcast notification
		adminNotifications.POST("/broadcast", notificationHandler.BroadcastNotification)
	}
}
