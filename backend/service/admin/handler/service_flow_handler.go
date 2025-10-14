package handler

import (
	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/utils"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ServiceFlowHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewServiceFlowHandler(db *gorm.DB, cfg *config.Config) *ServiceFlowHandler {
	return &ServiceFlowHandler{
		db:  db,
		cfg: cfg,
	}
}

// GetServiceFlowLogs retrieves all service flow logs
func (h *ServiceFlowHandler) GetServiceFlowLogs(c *gin.Context) {
	var flowLogs []models.ServiceFlowLog
	if err := h.db.Preload("LicenseRequest").Preload("ChangedByUser").Find(&flowLogs).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve service flow logs", err)
		return
	}

	utils.SuccessOK(c, "Service flow logs retrieved successfully", flowLogs)
}

// GetServiceFlowLogsByRequest retrieves service flow logs for a specific request
func (h *ServiceFlowHandler) GetServiceFlowLogsByRequest(c *gin.Context) {
	requestID := c.Param("requestId")
	var flowLogs []models.ServiceFlowLog
	if err := h.db.Preload("LicenseRequest").Preload("ChangedByUser").Where("license_request_id = ?", requestID).Find(&flowLogs).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve service flow logs", err)
		return
	}

	utils.SuccessOK(c, "Service flow logs retrieved successfully", flowLogs)
}

// CreateServiceFlowLog creates a new service flow log
func (h *ServiceFlowHandler) CreateServiceFlowLog(c *gin.Context) {
	var req struct {
		LicenseRequestID uint                 `json:"license_request_id" binding:"required"`
		NewStatus        models.RequestStatus `json:"new_status" binding:"required"`
		ChangeReason     string               `json:"change_reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	// Get current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	// Get current license request to capture previous status
	var licenseRequest models.LicenseRequest
	if err := h.db.First(&licenseRequest, req.LicenseRequestID).Error; err != nil {
		utils.ErrorNotFound(c, "License request not found", err)
		return
	}

	// Create flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: req.LicenseRequestID,
		PreviousStatus:   &licenseRequest.Status,
		NewStatus:        req.NewStatus,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     req.ChangeReason,
	}

	if err := h.db.Create(flowLog).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to create service flow log", err)
		return
	}

	// Update license request status
	licenseRequest.Status = req.NewStatus
	if err := h.db.Save(&licenseRequest).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to update license request status", err)
		return
	}

	utils.SuccessCreated(c, "Service flow log created successfully", flowLog)
}

// UpdateServiceFlowLog updates a service flow log
func (h *ServiceFlowHandler) UpdateServiceFlowLog(c *gin.Context) {
	id := c.Param("id")
	var flowLog models.ServiceFlowLog
	if err := h.db.First(&flowLog, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorNotFound(c, "Service flow log not found", err)
		} else {
			utils.ErrorInternalServerError(c, "Failed to retrieve service flow log", err)
		}
		return
	}

	var req struct {
		ChangeReason string `json:"change_reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	// Update fields
	if req.ChangeReason != "" {
		flowLog.ChangeReason = req.ChangeReason
	}

	if err := h.db.Save(&flowLog).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to update service flow log", err)
		return
	}

	utils.SuccessOK(c, "Service flow log updated successfully", flowLog)
}

// GetDashboardStats retrieves dashboard statistics
func (h *ServiceFlowHandler) GetDashboardStats(c *gin.Context) {
	var stats struct {
		TotalRequests      int64 `json:"total_requests"`
		PendingRequests    int64 `json:"pending_requests"`
		InProgressRequests int64 `json:"in_progress_requests"`
		CompletedRequests  int64 `json:"completed_requests"`
		RejectedRequests   int64 `json:"rejected_requests"`
	}

	// Get total requests
	h.db.Model(&models.LicenseRequest{}).Count(&stats.TotalRequests)

	// Get pending requests (new_request, draft)
	h.db.Model(&models.LicenseRequest{}).Where("status IN ?", []string{"new_request", "draft"}).Count(&stats.PendingRequests)

	// Get in progress requests
	h.db.Model(&models.LicenseRequest{}).Where("status IN ?", []string{"accepted", "assigned", "appointment", "inspecting", "inspection_done", "document_edit", "report_approved"}).Count(&stats.InProgressRequests)

	// Get completed requests (approved)
	h.db.Model(&models.LicenseRequest{}).Where("status = ?", "approved").Count(&stats.CompletedRequests)

	// Get rejected requests
	h.db.Model(&models.LicenseRequest{}).Where("status IN ?", []string{"rejected", "rejected_final"}).Count(&stats.RejectedRequests)

	utils.SuccessOK(c, "Dashboard statistics retrieved successfully", stats)
}

// GetServiceSummaryStats retrieves service summary statistics by type
func (h *ServiceFlowHandler) GetServiceSummaryStats(c *gin.Context) {
	var stats []struct {
		LicenseType string `json:"license_type"`
		Status      string `json:"status"`
		Count       int64  `json:"count"`
	}

	// Get statistics grouped by license type and status
	if err := h.db.Model(&models.LicenseRequest{}).
		Select("license_type, status, COUNT(*) as count").
		Group("license_type, status").
		Scan(&stats).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve service summary statistics", err)
		return
	}

	utils.SuccessOK(c, "Service summary statistics retrieved successfully", stats)
}

// GetTimelineStats retrieves timeline statistics
func (h *ServiceFlowHandler) GetTimelineStats(c *gin.Context) {
	var stats []struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}

	// Get statistics for the last 30 days
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	if err := h.db.Model(&models.LicenseRequest{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= ?", thirtyDaysAgo).
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&stats).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve timeline statistics", err)
		return
	}

	utils.SuccessOK(c, "Timeline statistics retrieved successfully", stats)
}

// GetPerformanceStats retrieves performance statistics
func (h *ServiceFlowHandler) GetPerformanceStats(c *gin.Context) {
	var stats struct {
		AverageProcessingTime float64 `json:"average_processing_time_days"`
		FastestProcessingTime float64 `json:"fastest_processing_time_days"`
		SlowestProcessingTime float64 `json:"slowest_processing_time_days"`
	}

	if err := h.db.Raw(`
		SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400.0) as avg_days,
		       MIN(EXTRACT(EPOCH FROM (updated_at - created_at))/86400.0) as min_days,
		       MAX(EXTRACT(EPOCH FROM (updated_at - created_at))/86400.0) as max_days
		FROM license_requests 
		WHERE status IN ('approved', 'rejected_final') 
		AND updated_at IS NOT NULL 
		AND created_at IS NOT NULL
	`).Scan(&stats).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve performance statistics", err)
		return
	}

	utils.SuccessOK(c, "Performance statistics retrieved successfully", stats)
}
