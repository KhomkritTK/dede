package router

import (
	"eservice-backend/config"
	"eservice-backend/middleware"
	dedeconsultshandler "eservice-backend/service/dede_consults/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DedeConsultsRoutes sets up routes for DEDE Consults functionality
func DedeConsultsRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	// Create DEDE Consults handler
	dedeConsultsHandler := dedeconsultshandler.NewDedeConsultsHandler(db, cfg)

	// DEDE Consults routes (protected)
	consults := r.Group("/dede-consults")
	consults.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	consults.Use(middleware.RequireRole([]string{"admin", "dede_consult"}))
	{
		// Get tasks
		consults.GET("/tasks", dedeConsultsHandler.GetMyTasks)

		// Task actions
		consults.POST("/tasks/:taskId/schedule-appointment", dedeConsultsHandler.ScheduleAppointment)
		consults.POST("/tasks/:taskId/start-inspection", dedeConsultsHandler.StartInspection)
		consults.POST("/tasks/:taskId/complete-inspection", dedeConsultsHandler.CompleteInspection)
		consults.POST("/tasks/:taskId/submit-audit-report", dedeConsultsHandler.SubmitAuditReport)

		// Dashboard
		consults.GET("/dashboard/stats", dedeConsultsHandler.GetDashboardStats)
	}
}
