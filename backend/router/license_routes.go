package router

import (
	"eservice-backend/config"
	"eservice-backend/service/license/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func LicenseRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	licenseHandler := handler.NewLicenseHandler(db, cfg)

	licenses := r.Group("/licenses")
	{
		// License request routes
		licenses.GET("/", licenseHandler.GetLicenseRequests)
		licenses.GET("/:id", licenseHandler.GetLicenseRequest)
		licenses.POST("/", licenseHandler.CreateLicenseRequest)
		licenses.PUT("/:id", licenseHandler.UpdateLicenseRequest)
		licenses.DELETE("/:id", licenseHandler.DeleteLicenseRequest)

		// License request actions
		licenses.POST("/:id/submit", licenseHandler.SubmitLicenseRequest)
		licenses.POST("/:id/accept", licenseHandler.AcceptLicenseRequest)
		licenses.POST("/:id/reject", licenseHandler.RejectLicenseRequest)
		licenses.POST("/:id/assign", licenseHandler.AssignInspector)
		licenses.POST("/:id/approve", licenseHandler.ApproveLicenseRequest)

		// License types
		licenses.GET("/types", licenseHandler.GetLicenseTypes)

		// My requests (for current user)
		licenses.GET("/my", licenseHandler.GetMyLicenseRequests)

		// Specific license type requests
		licenses.POST("/new", licenseHandler.CreateNewLicenseRequest)
		licenses.POST("/renewal", licenseHandler.CreateRenewalLicenseRequest)
		licenses.POST("/extension", licenseHandler.CreateExtensionLicenseRequest)
		licenses.POST("/reduction", licenseHandler.CreateReductionLicenseRequest)
	}
}
