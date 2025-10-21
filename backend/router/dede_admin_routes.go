package router

import (
	"eservice-backend/config"
	"eservice-backend/middleware"
	dedeadminhandler "eservice-backend/service/dede_admin/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DedeAdminRoutes sets up routes for DEDE Admin functionality
func DedeAdminRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	// Create DEDE Admin handler
	dedeAdminHandler := dedeadminhandler.NewDedeAdminHandler(db, cfg)

	// DEDE Admin routes (protected)
	admin := r.Group("/dede-admin")
	admin.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	admin.Use(middleware.RequireRole([]string{"admin", "dede_admin"}))
	{
		// Get pending requests
		admin.GET("/pending-requests", dedeAdminHandler.GetPendingRequests)

		// Request actions
		admin.POST("/requests/:id/accept", dedeAdminHandler.AcceptRequest)
		admin.POST("/requests/:id/reject", dedeAdminHandler.RejectRequest)
		admin.POST("/requests/:id/return", dedeAdminHandler.ReturnRequest)
		admin.POST("/requests/:id/forward", dedeAdminHandler.ForwardRequest)

		// Dashboard
		admin.GET("/dashboard/stats", dedeAdminHandler.GetDashboardStats)
	}
}
