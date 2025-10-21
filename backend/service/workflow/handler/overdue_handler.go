package handler

import (
	"eservice-backend/config"
	"eservice-backend/middleware"
	"eservice-backend/service/workflow/cron"
	"eservice-backend/service/workflow/service"
	"eservice-backend/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OverdueHandler struct {
	overdueService service.OverdueService
	overdueCron    *cron.OverdueCronJob
}

func NewOverdueHandler(db *gorm.DB, cfg *config.Config) *OverdueHandler {
	overdueService := service.NewOverdueService(db)
	overdueCron := cron.NewOverdueCronJob(overdueService)

	return &OverdueHandler{
		overdueService: overdueService,
		overdueCron:    overdueCron,
	}
}

// CheckOverdueRequests manually triggers the overdue check
func (h *OverdueHandler) CheckOverdueRequests(c *gin.Context) {
	if err := h.overdueService.CheckOverdueRequests(); err != nil {
		utils.ErrorInternalServerError(c, "Failed to check overdue requests", err)
		return
	}

	utils.SuccessOK(c, "Overdue check completed successfully", nil)
}

// ProcessOverdueRequest processes a specific overdue request
func (h *OverdueHandler) ProcessOverdueRequest(c *gin.Context) {
	idStr := c.Param("id")
	licenseType := c.Query("type")

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid request ID", err)
		return
	}

	if licenseType == "" {
		utils.ErrorBadRequest(c, "License type is required", nil)
		return
	}

	if err := h.overdueService.ProcessOverdueRequest(uint(id), licenseType); err != nil {
		utils.ErrorInternalServerError(c, "Failed to process overdue request", err)
		return
	}

	utils.SuccessOK(c, "Overdue request processed successfully", nil)
}

// SendOverdueNotifications manually triggers sending overdue notifications
func (h *OverdueHandler) SendOverdueNotifications(c *gin.Context) {
	if err := h.overdueService.SendOverdueNotifications(); err != nil {
		utils.ErrorInternalServerError(c, "Failed to send overdue notifications", err)
		return
	}

	utils.SuccessOK(c, "Overdue notifications sent successfully", nil)
}

// GetOverdueStatistics returns statistics about overdue requests
func (h *OverdueHandler) GetOverdueStatistics(c *gin.Context) {
	stats, err := h.overdueService.GetOverdueStatistics()
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to get overdue statistics", err)
		return
	}

	utils.SuccessOK(c, "Overdue statistics retrieved successfully", stats)
}

// TestOverdueRequest tests the overdue functionality for a specific request
func (h *OverdueHandler) TestOverdueRequest(c *gin.Context) {
	idStr := c.Param("id")
	licenseType := c.Query("type")

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid request ID", err)
		return
	}

	if licenseType == "" {
		utils.ErrorBadRequest(c, "License type is required", nil)
		return
	}

	if err := h.overdueCron.RunTest(uint(id), licenseType); err != nil {
		utils.ErrorInternalServerError(c, "Failed to test overdue request", err)
		return
	}

	utils.SuccessOK(c, "Overdue test completed successfully", nil)
}

// StartOverdueCron starts the overdue cron jobs
func (h *OverdueHandler) StartOverdueCron(c *gin.Context) {
	h.overdueCron.Start()
	utils.SuccessOK(c, "Overdue cron jobs started successfully", nil)
}

// StopOverdueCron stops the overdue cron jobs
func (h *OverdueHandler) StopOverdueCron(c *gin.Context) {
	h.overdueCron.Stop()
	utils.SuccessOK(c, "Overdue cron jobs stopped successfully", nil)
}

// RunOverdueCronOnce runs the overdue cron jobs once immediately
func (h *OverdueHandler) RunOverdueCronOnce(c *gin.Context) {
	h.overdueCron.RunOnce()
	utils.SuccessOK(c, "Overdue cron jobs executed once successfully", nil)
}

// SetOverdueRoutes sets up routes for overdue functionality
func SetOverdueRoutes(r *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	// Create overdue handler
	overdueHandler := NewOverdueHandler(db, cfg)

	// Overdue routes (protected)
	overdue := r.Group("/overdue")
	overdue.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	overdue.Use(middleware.RequireRole([]string{"admin"}))
	{
		// Manual triggers
		overdue.POST("/check", overdueHandler.CheckOverdueRequests)
		overdue.POST("/notifications", overdueHandler.SendOverdueNotifications)
		overdue.POST("/requests/:id/process", overdueHandler.ProcessOverdueRequest)
		overdue.POST("/requests/:id/test", overdueHandler.TestOverdueRequest)

		// Cron management
		overdue.POST("/cron/start", overdueHandler.StartOverdueCron)
		overdue.POST("/cron/stop", overdueHandler.StopOverdueCron)
		overdue.POST("/cron/run-once", overdueHandler.RunOverdueCronOnce)

		// Statistics
		overdue.GET("/statistics", overdueHandler.GetOverdueStatistics)
	}
}
