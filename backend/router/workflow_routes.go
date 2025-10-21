package router

import (
	"eservice-backend/config"
	"eservice-backend/middleware"
	"eservice-backend/service/workflow/handler"
	workflowhandler "eservice-backend/service/workflow/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// WorkflowRoutes sets up routes for workflow management
func WorkflowRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	// Create workflow handler
	workflowHandler := workflowhandler.NewWorkflowHandler(
		nil, // dashboardService
		nil, // taskService
		nil, // deadlineService
		nil, // commentService
		nil, // activityService
	)

	// Workflow routes (protected)
	workflow := r.Group("/workflow")
	workflow.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// Workflow endpoints are now part of the task and deadline handlers
		// These routes will be handled by the task and deadline services
	}

	// Role-specific task routes
	tasks := r.Group("/tasks")
	tasks.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// Get tasks for current user
		tasks.GET("/my-tasks", workflowHandler.GetTasks)

		// Get tasks by role
		tasks.GET("/role/:role",
			middleware.RequireRole([]string{"admin", "dede_head", "dede_staff", "dede_consult"}),
			workflowHandler.GetTasks)

		// Assign task
		tasks.POST("/assign",
			middleware.RequireRole([]string{"admin", "dede_head"}),
			workflowHandler.AssignTask)

		// Update task status
		tasks.PUT("/:taskId/status", workflowHandler.CompleteTask)
	}

	// Dashboard routes for different roles
	dashboard := r.Group("/dashboard")
	dashboard.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// Get dashboard stats for current user's role
		dashboard.GET("/stats", workflowHandler.GetDashboard)
	}
	// Set up overdue routes
	handler.SetOverdueRoutes(r, db, cfg)
}
