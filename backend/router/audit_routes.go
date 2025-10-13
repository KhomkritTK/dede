package router

import (
	"eservice-backend/config"
	"eservice-backend/service/audit/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AuditRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	auditHandler := handler.NewAuditHandler(db, cfg)

	reports := r.Group("/audit-reports")
	{
		// Audit report CRUD
		reports.GET("/", auditHandler.GetAuditReports)
		reports.GET("/:id", auditHandler.GetAuditReport)
		reports.POST("/", auditHandler.CreateAuditReport)
		reports.PUT("/:id", auditHandler.UpdateAuditReport)
		reports.DELETE("/:id", auditHandler.DeleteAuditReport)

		// Report actions
		reports.POST("/:id/submit", auditHandler.SubmitAuditReport)
		reports.POST("/:id/approve", auditHandler.ApproveAuditReport)
		reports.POST("/:id/reject", auditHandler.RejectAuditReport)
		reports.POST("/:id/request-edit", auditHandler.RequestEdit)

		// Review actions
		reports.POST("/:id/review", auditHandler.ReviewAuditReport)
		reports.POST("/:id/send-for-review", auditHandler.SendForReview)

		// My reports (for current inspector)
		reports.GET("/my", auditHandler.GetMyAuditReports)

		// Reports for review (for reviewers)
		reports.GET("/pending-review", auditHandler.GetPendingReviewReports)

		// Get reports by inspection
		reports.GET("/inspection/:inspectionId", auditHandler.GetAuditReportsByInspection)
	}
}
