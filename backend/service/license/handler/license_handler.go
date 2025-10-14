package handler

import (
	"strconv"

	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/license/dto"
	"eservice-backend/service/license/usecase"
	"eservice-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LicenseHandler struct {
	licenseUsecase usecase.LicenseUsecase
	config         *config.Config
}

func NewLicenseHandler(db *gorm.DB, config *config.Config) *LicenseHandler {
	licenseRepo := repository.NewLicenseRequestRepository(db)
	newLicenseRepo := repository.NewNewLicenseRepo(db)
	renewalLicenseRepo := repository.NewRenewalLicenseRepo(db)
	extensionLicenseRepo := repository.NewExtensionLicenseRepo(db)
	reductionLicenseRepo := repository.NewReductionLicenseRepo(db)
	userRepo := repository.NewUserRepository(db)
	licenseUsecase := usecase.NewLicenseUsecase(
		licenseRepo,
		newLicenseRepo,
		renewalLicenseRepo,
		extensionLicenseRepo,
		reductionLicenseRepo,
		userRepo,
	)

	return &LicenseHandler{
		licenseUsecase: licenseUsecase,
		config:         config,
	}
}

// CreateLicenseRequest handles creating a new license request
func (h *LicenseHandler) CreateLicenseRequest(c *gin.Context) {
	var req dto.CreateLicenseRequestRequest
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

	response, err := h.licenseUsecase.CreateLicenseRequest(id, req)
	if err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessCreated(c, "License request created successfully", response)
}

// GetLicenseRequests handles getting license requests
func (h *LicenseHandler) GetLicenseRequests(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	status := c.Query("status")

	response, err := h.licenseUsecase.GetLicenseRequests(page, limit, search, status, 0)
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve license requests", err)
		return
	}

	utils.SuccessOK(c, "License requests retrieved successfully", response)
}

// GetLicenseRequest handles getting a specific license request
func (h *LicenseHandler) GetLicenseRequest(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid request ID", err)
		return
	}

	response, err := h.licenseUsecase.GetLicenseRequestByID(uint(id))
	if err != nil {
		utils.ErrorNotFound(c, "License request not found", err)
		return
	}

	utils.SuccessOK(c, "License request retrieved successfully", response)
}

// UpdateLicenseRequest handles updating a license request
func (h *LicenseHandler) UpdateLicenseRequest(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid request ID", err)
		return
	}

	var req dto.UpdateLicenseRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	response, err := h.licenseUsecase.UpdateLicenseRequest(uint(id), req)
	if err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "License request updated successfully", response)
}

// DeleteLicenseRequest handles deleting a license request
func (h *LicenseHandler) DeleteLicenseRequest(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid request ID", err)
		return
	}

	if err := h.licenseUsecase.DeleteLicenseRequest(uint(id)); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "License request deleted successfully", nil)
}

// SubmitLicenseRequest handles submitting a license request
func (h *LicenseHandler) SubmitLicenseRequest(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid request ID", err)
		return
	}

	if err := h.licenseUsecase.SubmitLicenseRequest(uint(id)); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "License request submitted successfully", nil)
}

// AcceptLicenseRequest handles accepting a license request
func (h *LicenseHandler) AcceptLicenseRequest(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid request ID", err)
		return
	}

	// Check if user is admin or DEDE head
	userRole, exists := c.Get("user_role")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	role, ok := userRole.(models.UserRole)
	if !ok || (role != models.RoleAdmin && role != models.RoleDEDEHead) {
		utils.ErrorForbidden(c, "Insufficient permissions", nil)
		return
	}

	if err := h.licenseUsecase.AcceptLicenseRequest(uint(id)); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "License request accepted successfully", nil)
}

// RejectLicenseRequest handles rejecting a license request
func (h *LicenseHandler) RejectLicenseRequest(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid request ID", err)
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	// Check if user is admin or DEDE head
	userRole, exists := c.Get("user_role")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	role, ok := userRole.(models.UserRole)
	if !ok || (role != models.RoleAdmin && role != models.RoleDEDEHead) {
		utils.ErrorForbidden(c, "Insufficient permissions", nil)
		return
	}

	if err := h.licenseUsecase.RejectLicenseRequest(uint(id), req.Reason); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "License request rejected successfully", nil)
}

// AssignInspector handles assigning an inspector to a license request
func (h *LicenseHandler) AssignInspector(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid request ID", err)
		return
	}

	var req dto.AssignInspectorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	// Check if user is admin or DEDE head
	userRole, exists := c.Get("user_role")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	role, ok := userRole.(models.UserRole)
	if !ok || (role != models.RoleAdmin && role != models.RoleDEDEHead) {
		utils.ErrorForbidden(c, "Insufficient permissions", nil)
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	assignedByID, ok := userID.(uint)
	if !ok {
		utils.ErrorInternalServerError(c, "Invalid user ID", nil)
		return
	}

	if err := h.licenseUsecase.AssignInspector(uint(id), req, assignedByID); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "Inspector assigned successfully", nil)
}

// ApproveLicenseRequest handles approving a license request
func (h *LicenseHandler) ApproveLicenseRequest(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorBadRequest(c, "Invalid request ID", err)
		return
	}

	// Check if user is admin or DEDE head
	userRole, exists := c.Get("user_role")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	role, ok := userRole.(models.UserRole)
	if !ok || (role != models.RoleAdmin && role != models.RoleDEDEHead) {
		utils.ErrorForbidden(c, "Insufficient permissions", nil)
		return
	}

	if err := h.licenseUsecase.ApproveLicenseRequest(uint(id)); err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessOK(c, "License request approved successfully", nil)
}

// GetMyLicenseRequests handles getting the current user's license requests
func (h *LicenseHandler) GetMyLicenseRequests(c *gin.Context) {
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

	response, err := h.licenseUsecase.GetMyLicenseRequests(id, page, limit)
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve license requests", err)
		return
	}

	utils.SuccessOK(c, "License requests retrieved successfully", response)
}

// GetLicenseTypes handles getting license types
func (h *LicenseHandler) GetLicenseTypes(c *gin.Context) {
	response := h.licenseUsecase.GetLicenseTypes()
	utils.SuccessOK(c, "License types retrieved successfully", response)
}

// CreateNewLicenseRequest handles creating a new license request
func (h *LicenseHandler) CreateNewLicenseRequest(c *gin.Context) {
	var req dto.NewLicenseRequestRequest
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

	response, err := h.licenseUsecase.CreateNewLicenseRequest(id, req)
	if err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessCreated(c, "License request created successfully", response)
}

// CreateRenewalLicenseRequest handles creating a renewal license request
func (h *LicenseHandler) CreateRenewalLicenseRequest(c *gin.Context) {
	var req dto.RenewalLicenseRequestRequest
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

	response, err := h.licenseUsecase.CreateRenewalLicenseRequest(id, req)
	if err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessCreated(c, "License request created successfully", response)
}

// CreateExtensionLicenseRequest handles creating an extension license request
func (h *LicenseHandler) CreateExtensionLicenseRequest(c *gin.Context) {
	var req dto.ExtensionLicenseRequestRequest
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

	response, err := h.licenseUsecase.CreateExtensionLicenseRequest(id, req)
	if err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessCreated(c, "License request created successfully", response)
}

// CreateReductionLicenseRequest handles creating a reduction license request
func (h *LicenseHandler) CreateReductionLicenseRequest(c *gin.Context) {
	var req dto.ReductionLicenseRequestRequest
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

	response, err := h.licenseUsecase.CreateReductionLicenseRequest(id, req)
	if err != nil {
		utils.ErrorBadRequest(c, err.Error(), nil)
		return
	}

	utils.SuccessCreated(c, "License request created successfully", response)
}
