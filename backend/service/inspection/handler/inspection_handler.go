package handler

import (
	"strconv"
	"time"

	"eservice-backend/config"
	"eservice-backend/repository"
	"eservice-backend/service/inspection/dto"
	"eservice-backend/service/inspection/usecase"
	"eservice-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type InspectionHandler struct {
	inspectionUsecase usecase.InspectionUsecase
	config            *config.Config
}

func NewInspectionHandler(db *gorm.DB, config *config.Config) *InspectionHandler {
	inspectionRepo := repository.NewInspectionRepository(db)
	licenseRepo := repository.NewLicenseRequestRepository(db)
	userRepo := repository.NewUserRepository(db)
	inspectionUsecase := usecase.NewInspectionUsecase(inspectionRepo, licenseRepo, userRepo)

	return &InspectionHandler{
		inspectionUsecase: inspectionUsecase,
		config:            config,
	}
}

// CreateInspection handles creating a new inspection
func (h *InspectionHandler) CreateInspection(c *gin.Context) {
	var req dto.CreateInspectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	id, ok := userID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	response, err := h.inspectionUsecase.CreateInspection(id, req)
	if err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessCreated(c, "Inspection created successfully", response)
}

// GetInspections handles getting inspections
func (h *InspectionHandler) GetInspections(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	status := c.Query("status")

	response, err := h.inspectionUsecase.GetInspections(page, limit, search, status, 0)
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve inspections", err)
		return
	}

	utils.SuccessOK(c, "Inspections retrieved successfully", response)
}

// GetInspection handles getting a specific inspection
func (h *InspectionHandler) GetInspection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid inspection ID", err)
		return
	}

	response, err := h.inspectionUsecase.GetInspectionByID(uint(id))
	if err != nil {
		utils.ErrorNotFound(c, "Inspection not found", err)
		return
	}

	utils.SuccessOK(c, "Inspection retrieved successfully", response)
}

// UpdateInspection handles updating an inspection
func (h *InspectionHandler) UpdateInspection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid inspection ID", err)
		return
	}

	var req dto.UpdateInspectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	response, err := h.inspectionUsecase.UpdateInspection(uint(id), req)
	if err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Inspection updated successfully", response)
}

// DeleteInspection handles deleting an inspection
func (h *InspectionHandler) DeleteInspection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid inspection ID", err)
		return
	}

	if err := h.inspectionUsecase.DeleteInspection(uint(id)); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Inspection deleted successfully", nil)
}

// StartInspection handles starting an inspection
func (h *InspectionHandler) StartInspection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid inspection ID", err)
		return
	}

	if err := h.inspectionUsecase.StartInspection(uint(id)); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Inspection started successfully", nil)
}

// CompleteInspection handles completing an inspection
func (h *InspectionHandler) CompleteInspection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid inspection ID", err)
		return
	}

	var req struct {
		Findings        string `json:"findings"`
		Recommendations string `json:"recommendations"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	if err := h.inspectionUsecase.CompleteInspection(uint(id), req.Findings, req.Recommendations); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Inspection completed successfully", nil)
}

// CancelInspection handles canceling an inspection
func (h *InspectionHandler) CancelInspection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid inspection ID", err)
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	if err := h.inspectionUsecase.CancelInspection(uint(id), req.Reason); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Inspection canceled successfully", nil)
}

// RescheduleInspection handles rescheduling an inspection
func (h *InspectionHandler) RescheduleInspection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid inspection ID", err)
		return
	}

	var req dto.RescheduleInspectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	if err := h.inspectionUsecase.RescheduleInspection(uint(id), req); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Inspection rescheduled successfully", nil)
}

// ScheduleInspection handles scheduling an inspection
func (h *InspectionHandler) ScheduleInspection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid inspection ID", err)
		return
	}

	var req struct {
		ScheduledDate time.Time `json:"scheduled_date" binding:"required"`
		ScheduledTime string    `json:"scheduled_time" binding:"required"`
		Location      string    `json:"location" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	if err := h.inspectionUsecase.ScheduleInspection(uint(id), req.ScheduledDate, req.ScheduledTime, req.Location); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Inspection scheduled successfully", nil)
}

// GetMyInspections handles getting the current user's inspections
func (h *InspectionHandler) GetMyInspections(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	id, ok := userID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	response, err := h.inspectionUsecase.GetMyInspections(id, page, limit)
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve inspections", err)
		return
	}

	utils.SuccessOK(c, "Inspections retrieved successfully", response)
}

// GetInspectionsByRequest handles getting inspections for a specific request
func (h *InspectionHandler) GetInspectionsByRequest(c *gin.Context) {
	requestID, err := strconv.ParseUint(c.Param("request_id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid request ID", err)
		return
	}

	response, err := h.inspectionUsecase.GetInspectionsByRequest(uint(requestID))
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve inspections", err)
		return
	}

	utils.SuccessOK(c, "Inspections retrieved successfully", response)
}

// GetInspectionStatuses handles getting inspection statuses
func (h *InspectionHandler) GetInspectionStatuses(c *gin.Context) {
	response := h.inspectionUsecase.GetInspectionStatuses()
	utils.SuccessOK(c, "Inspection statuses retrieved successfully", response)
}
