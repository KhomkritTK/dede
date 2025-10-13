package router

import (
	"eservice-backend/config"
	"eservice-backend/service/auth/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	userHandler := handler.NewAuthHandler(db, cfg)

	users := r.Group("/users")
	{
		// User management routes
		users.GET("/profile", userHandler.GetProfile)
		users.PUT("/profile", userHandler.UpdateProfile)
		users.PUT("/password", userHandler.ChangePassword)

		// Only admin can access these routes
		adminOnly := users.Group("/")
		adminOnly.Use(RequireRole([]string{"admin", "dede_head"}))
		{
			adminOnly.GET("/", userHandler.GetUsers)
		}
	}
}

// RequireRole middleware to check if user has required role
func RequireRole(roles []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// This will be implemented in auth middleware
		// For now, just continue
		c.Next()
	}
}
