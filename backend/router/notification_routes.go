package router

import (
	"eservice-backend/config"
	"eservice-backend/service/notification/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NotificationRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	// Set up notification routes using the handler
	handler.SetNotificationRoutes(r, db, cfg)
}
