package router

import (
	"eservice-backend/config"
	"eservice-backend/service/auth/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AdminRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	authHandler := handler.NewAuthHandler(db, cfg)

	// Authentication routes
	auth := r.Group("/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/logout", authHandler.Logout)
		auth.POST("/refresh", authHandler.RefreshToken)
	}
}

func PublicRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	authHandler := handler.NewAuthHandler(db, cfg)

	// Public authentication routes
	auth := r.Group("/auth")
	{
		auth.POST("/login", authHandler.Login)
		auth.POST("/register", authHandler.Register)
		auth.POST("/forgot-password", authHandler.ForgotPassword)
		auth.POST("/reset-password", authHandler.ResetPassword)
	}
}
