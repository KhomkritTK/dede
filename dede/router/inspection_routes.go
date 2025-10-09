package router

import (
	"eservice-backend/config"
	"eservice-backend/service/inspection/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func InspectionRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	inspectionHandler := handler.NewInspectionHandler(db, cfg)

	inspections := r.Group("/inspections")
	{
		// Inspection CRUD
		inspections.GET("/", inspectionHandler.GetInspections)
		inspections.GET("/:id", inspectionHandler.GetInspection)
		inspections.POST("/", inspectionHandler.CreateInspection)
		inspections.PUT("/:id", inspectionHandler.UpdateInspection)
		inspections.DELETE("/:id", inspectionHandler.DeleteInspection)

		// Inspection actions
		inspections.POST("/:id/start", inspectionHandler.StartInspection)
		inspections.POST("/:id/complete", inspectionHandler.CompleteInspection)
		inspections.POST("/:id/cancel", inspectionHandler.CancelInspection)
		inspections.POST("/:id/reschedule", inspectionHandler.RescheduleInspection)

		// Appointment scheduling
		inspections.POST("/:id/schedule", inspectionHandler.ScheduleInspection)
		inspections.PUT("/:id/appointment", inspectionHandler.ScheduleInspection)

		// My inspections (for current inspector)
		inspections.GET("/my", inspectionHandler.GetMyInspections)

		// Get inspections by request
		inspections.GET("/request/:requestId", inspectionHandler.GetInspectionsByRequest)
	}
}
