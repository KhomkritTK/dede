package handler

import (
	"strconv"

	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/audit/dto"
	"eservice-backend/service/audit/usecase"
	"eservice-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuditHandler struct {
	auditUsecase usecase.AuditUsecase
	config       *config.Config
}

func NewAuditHandler(db *gorm.DB, config *config.Config) *AuditHandler {
	auditReportRepo := repository.NewAuditReportRepository(db)
	userRepo := repository.NewUserRepository(db)
	auditUsecase := usecase.NewAuditUsecase(auditReportRepo, userRepo)

	return &AuditHandler{
		auditUsecase: auditUsecase,
		config:       config,
	}
}

// CreateAuditReport handles creating a new audit report
func (h *AuditHandler) CreateAuditReport(c *gin.Context) {
	var req dto.CreateAuditReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	// Get inspector ID from context
	inspectorID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	id, ok := inspectorID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	response, err := h.auditUsecase.CreateAuditReport(req, id)
	if err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessCreated(c, "Audit report created successfully", response)
}

// GetAuditReports handles getting all audit reports
func (h *AuditHandler) GetAuditReports(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	response, err := h.auditUsecase.GetAllAuditReports(page, limit)
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve audit reports", err)
		return
	}

	utils.SuccessOK(c, "Audit reports retrieved successfully", response)
}

// GetAuditReport handles getting a specific audit report
func (h *AuditHandler) GetAuditReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid audit report ID", err)
		return
	}

	response, err := h.auditUsecase.GetAuditReportByID(uint(id))
	if err != nil {
		utils.ErrorNotFound(c, "Audit report not found", err)
		return
	}

	utils.SuccessOK(c, "Audit report retrieved successfully", response)
}

// UpdateAuditReport handles updating an audit report
func (h *AuditHandler) UpdateAuditReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid audit report ID", err)
		return
	}

	var req dto.UpdateAuditReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	response, err := h.auditUsecase.UpdateAuditReport(uint(id), req)
	if err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Audit report updated successfully", response)
}

// DeleteAuditReport handles deleting an audit report
func (h *AuditHandler) DeleteAuditReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid audit report ID", err)
		return
	}

	if err := h.auditUsecase.DeleteAuditReport(uint(id)); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Audit report deleted successfully", nil)
}

// SubmitAuditReport handles submitting an audit report
func (h *AuditHandler) SubmitAuditReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid audit report ID", err)
		return
	}

	req := dto.SubmitReportRequest{
		ReportID: uint(id),
	}

	if err := h.auditUsecase.SubmitAuditReport(req.ReportID); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Audit report submitted successfully", nil)
}

// ApproveAuditReport handles approving an audit report
func (h *AuditHandler) ApproveAuditReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid audit report ID", err)
		return
	}

	// Get reviewer ID from context
	reviewerID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	rid, ok := reviewerID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	req := dto.ApproveReportRequest{
		ReportID: uint(id),
	}

	if err := h.auditUsecase.ApproveAuditReport(req, rid); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Audit report approved successfully", nil)
}

// RejectAuditReport handles rejecting an audit report
func (h *AuditHandler) RejectAuditReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid audit report ID", err)
		return
	}

	// Get reviewer ID from context
	reviewerID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	rid, ok := reviewerID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	var req dto.RejectReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	req.ReportID = uint(id)

	if err := h.auditUsecase.RejectAuditReport(req, rid); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Audit report rejected successfully", nil)
}

// RequestEdit handles requesting edit for an audit report
func (h *AuditHandler) RequestEdit(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid audit report ID", err)
		return
	}

	// Get reviewer ID from context
	reviewerID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	rid, ok := reviewerID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	var req dto.RequestEditRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	req.ReportID = uint(id)

	if err := h.auditUsecase.RequestEdit(req, rid); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Edit request sent successfully", nil)
}

// ReviewAuditReport handles reviewing an audit report
func (h *AuditHandler) ReviewAuditReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid audit report ID", err)
		return
	}

	// Get reviewer ID from context
	reviewerID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	rid, ok := reviewerID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	var req dto.ReviewReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	req.ReportID = uint(id)

	if err := h.auditUsecase.ReviewAuditReport(req, rid); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Audit report reviewed successfully", nil)
}

// SendForReview handles sending an audit report for review
func (h *AuditHandler) SendForReview(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid audit report ID", err)
		return
	}

	req := dto.SendForReviewRequest{
		ReportID: uint(id),
	}

	if err := h.auditUsecase.SendForReview(req); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Audit report sent for review successfully", nil)
}

// GetMyAuditReports handles getting the current user's audit reports
func (h *AuditHandler) GetMyAuditReports(c *gin.Context) {
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

	response, err := h.auditUsecase.GetAuditReportsByInspector(id, page, limit)
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve audit reports", err)
		return
	}

	utils.SuccessOK(c, "Audit reports retrieved successfully", response)
}

// GetPendingReviewReports handles getting audit reports pending review
func (h *AuditHandler) GetPendingReviewReports(c *gin.Context) {
	// Check if user has permission to review
	userRole, exists := c.Get("user_role")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	role, ok := userRole.(models.UserRole)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user role", nil)
		return
	}

	// Only admin, DEDE head, or auditor can review
	if role != models.RoleAdmin && role != models.RoleDEDEHead && role != models.RoleAuditor {
		utils.ErrorForbidden(c, "Insufficient permissions to review reports", nil)
		return
	}

	response, err := h.auditUsecase.GetPendingReviewReports()
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve pending review reports", err)
		return
	}

	utils.SuccessOK(c, "Pending review reports retrieved successfully", response)
}

// GetAuditReportsByInspection handles getting audit reports by inspection ID
func (h *AuditHandler) GetAuditReportsByInspection(c *gin.Context) {
	inspectionID, err := strconv.ParseUint(c.Param("inspectionId"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid inspection ID", err)
		return
	}

	response, err := h.auditUsecase.GetAuditReportsByInspection(uint(inspectionID))
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve audit reports", err)
		return
	}

	utils.SuccessOK(c, "Audit reports retrieved successfully", response)
}
