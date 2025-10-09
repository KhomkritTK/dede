package router

import (
	"eservice-backend/config"
	"eservice-backend/service/notification/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NotificationRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	notificationHandler := handler.NewNotificationHandler(db, cfg)

	notifications := r.Group("/notifications")
	{
		// Notification CRUD
		notifications.GET("/", notificationHandler.GetNotifications)
		notifications.GET("/:id", notificationHandler.GetNotification)
		notifications.POST("/", notificationHandler.CreateNotification)
		notifications.DELETE("/:id", notificationHandler.DeleteNotification)

		// Notification actions
		notifications.POST("/:id/mark-read", notificationHandler.MarkAsRead)
		notifications.POST("/my/mark-all-read", notificationHandler.MarkAllAsRead)
		notifications.POST("/send", notificationHandler.SendNotifications)

		// My notifications (for current user)
		notifications.GET("/my", notificationHandler.GetMyNotifications)
		notifications.GET("/my/unread", notificationHandler.GetUnreadNotifications)
		notifications.GET("/my/count", notificationHandler.GetNotificationCount)

		// Admin notification management
		adminOnly := notifications.Group("/")
		adminOnly.Use(RequireRole([]string{"admin", "dede_head"}))
		{
			adminOnly.POST("/send", notificationHandler.SendNotifications)
		}
	}
}
