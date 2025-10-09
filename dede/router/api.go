package router

import (
	"eservice-backend/config"
	"eservice-backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// Global middleware
	r.Use(middleware.LoggingMiddleware())
	r.Use(middleware.RecoveryMiddleware())
	r.Use(middleware.CORSMiddleware())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"message": "eService API is running",
		})
	})

	// API versioning
	v1 := r.Group("/api/v1")
	{
		// Public routes (no authentication required)
		PublicRoutes(v1, db, cfg)

		// Protected routes (authentication required)
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			// User routes
			UserRoutes(protected, db, cfg)

			// Admin routes
			AdminRoutes(protected, db, cfg)

			// License request routes
			LicenseRoutes(protected, db, cfg)

			// Inspection routes
			InspectionRoutes(protected, db, cfg)

			// Audit report routes
			AuditRoutes(protected, db, cfg)

			// Notification routes
			NotificationRoutes(protected, db, cfg)
		}
	}
}
