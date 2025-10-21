package router

import (
	"eservice-backend/config"
	"eservice-backend/middleware"
	dedestaffhandler "eservice-backend/service/dede_staff/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DedeStaffRoutes sets up routes for DEDE Staff functionality
func DedeStaffRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	// Create DEDE Staff handler
	dedeStaffHandler := dedestaffhandler.NewDedeStaffHandler(db, cfg)

	// DEDE Staff routes (protected)
	staff := r.Group("/dede-staff")
	staff.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	staff.Use(middleware.RequireRole([]string{"admin", "dede_staff"}))
	{
		// Get tasks
		staff.GET("/tasks", dedeStaffHandler.GetMyTasks)

		// Report review
		staff.GET("/reports-to-review", dedeStaffHandler.GetReportsToReview)
		staff.POST("/reports/:reportId/review", dedeStaffHandler.ReviewAuditReport)

		// Final approval
		staff.POST("/requests/:requestId/final-approve", dedeStaffHandler.FinalApproveRequest)

		// Overdue requests
		staff.GET("/overdue-requests", dedeStaffHandler.GetOverdueRequests)

		// Dashboard
		staff.GET("/dashboard/stats", dedeStaffHandler.GetDashboardStats)
	}
}
