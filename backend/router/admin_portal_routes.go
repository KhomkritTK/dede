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
	flowHandler := adminhandler.NewServiceFlowHandler(db, cfg)

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

		// Admin management routes (system admin only)
		admin := protected.Group("/admin")
		admin.Use(middleware.RequireRole([]string{"system_admin"}))
		{
			admin.GET("/users", adminHandler.GetAdminUsers)
			admin.POST("/users", adminHandler.CreateAdminUser)
			admin.GET("/users/:id", adminHandler.GetAdminUser)
			admin.PUT("/users/:id", adminHandler.UpdateAdminUser)
			admin.DELETE("/users/:id", adminHandler.DeleteAdminUser)
		}

		// Service flow management routes
		flow := protected.Group("/flow")
		{
			// All authenticated admins can view flow logs
			flow.GET("/logs", flowHandler.GetServiceFlowLogs)
			flow.GET("/logs/:requestId", flowHandler.GetServiceFlowLogsByRequest)

			// Admins with appropriate permissions can manage flow
			flow.POST("/logs", flowHandler.CreateServiceFlowLog)
			flow.PUT("/logs/:id", flowHandler.UpdateServiceFlowLog)
		}

		// Dashboard and statistics routes
		dashboard := protected.Group("/dashboard")
		{
			dashboard.GET("/stats", flowHandler.GetDashboardStats)
			dashboard.GET("/stats/summary", flowHandler.GetServiceSummaryStats)
			dashboard.GET("/stats/timeline", flowHandler.GetTimelineStats)
			dashboard.GET("/stats/performance", flowHandler.GetPerformanceStats)
		}

		// Service request management
		services := protected.Group("/services")
		{
			services.GET("/requests", adminHandler.GetLicenseRequests)
			services.GET("/requests/:id", adminHandler.GetLicenseRequest)
			services.PUT("/requests/:id/status", adminHandler.UpdateLicenseRequestStatus)
			services.POST("/requests/:id/assign", adminHandler.AssignInspector)
		}
	}
}
