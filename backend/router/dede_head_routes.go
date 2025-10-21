package router

import (
	"eservice-backend/config"
	"eservice-backend/middleware"
	dedeheadhandler "eservice-backend/service/dede_head/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DedeHeadRoutes sets up routes for DEDE Head functionality
func DedeHeadRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	// Create DEDE Head handler
	dedeHeadHandler := dedeheadhandler.NewDedeHeadHandler(db, cfg)

	// DEDE Head routes (protected)
	head := r.Group("/dede-head")
	head.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	head.Use(middleware.RequireRole([]string{"admin", "dede_head"}))
	{
		// Get forwarded requests
		head.GET("/forwarded-requests", dedeHeadHandler.GetForwardedRequests)

		// Get available staff
		head.GET("/available-staff", dedeHeadHandler.GetAvailableStaff)

		// Request actions
		head.POST("/requests/:id/assign", dedeHeadHandler.AssignRequest)
		head.POST("/requests/:id/reject", dedeHeadHandler.RejectRequest)
		head.POST("/requests/:id/final-approve", dedeHeadHandler.FinalApproveRequest)

		// Dashboard
		head.GET("/dashboard/stats", dedeHeadHandler.GetDashboardStats)
	}
}
