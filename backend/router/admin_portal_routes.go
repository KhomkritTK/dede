package router

import (
	"eservice-backend/config"
	"eservice-backend/middleware"
	adminhandler "eservice-backend/service/admin/handler"
	authhandler "eservice-backend/service/auth/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AdminPortalRoutes sets up routes for the admin portal
func AdminPortalRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	// Create handlers
	authHandler := authhandler.NewAuthHandler(db, cfg)
	adminHandler := adminhandler.NewAdminHandler(db, cfg)
	serviceFlowHandler := adminhandler.NewServiceFlowHandler(db, cfg)

	// Public routes for admin portal login
	public := r.Group("/admin-portal")
	{
		auth := public.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)
		}
	}

	// Protected admin portal routes
	protected := r.Group("/admin-portal")
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// Authentication routes
		auth := protected.Group("/auth")
		{
			auth.POST("/logout", authHandler.Logout)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.GET("/profile", authHandler.GetProfile)
			auth.PUT("/profile", authHandler.UpdateProfile)
		}

		// Service request management
		services := protected.Group("/services")
		{
			services.GET("/requests", adminHandler.GetAllLicenseRequests)
			services.GET("/requests/:id", adminHandler.GetLicenseRequestDetails)
			services.PUT("/requests/:id/status", adminHandler.UpdateRequestStatus)
			services.POST("/requests/:id/assign", adminHandler.AssignRequest)
			services.POST("/requests/:id/return", adminHandler.ReturnDocumentsToUser)
			services.POST("/requests/:id/forward", adminHandler.ForwardToDedeHead)
		}

		// Dashboard routes
		dashboard := protected.Group("/dashboard")
		{
			dashboard.GET("/stats", serviceFlowHandler.GetDashboardStats)
			dashboard.GET("/stats/summary", serviceFlowHandler.GetServiceSummaryStats)
			dashboard.GET("/stats/timeline", serviceFlowHandler.GetTimelineStats)
			dashboard.GET("/stats/performance", serviceFlowHandler.GetPerformanceStats)
		}

		// Admin user management
		admin := protected.Group("/admin")
		{
			admin.GET("/users", adminHandler.GetAdminUsers)
		}
	}
}
