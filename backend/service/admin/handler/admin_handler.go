package handler

import (
	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewAdminHandler(db *gorm.DB, cfg *config.Config) *AdminHandler {
	return &AdminHandler{
		db:  db,
		cfg: cfg,
	}
}

// GetAdminUsers retrieves all admin users
func (h *AdminHandler) GetAdminUsers(c *gin.Context) {
	var adminUsers []models.AdminUser
	if err := h.db.Preload("User").Find(&adminUsers).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve admin users", err)
		return
	}

	utils.SuccessOK(c, "Admin users retrieved successfully", adminUsers)
}

// CreateAdminUser creates a new admin user
func (h *AdminHandler) CreateAdminUser(c *gin.Context) {
	var req struct {
		UserID      uint                `json:"user_id" binding:"required"`
		AdminRole   models.AdminRole    `json:"admin_role" binding:"required"`
		Department  string              `json:"department"`
		Permissions map[string][]string `json:"permissions"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	// Check if user exists
	var user models.User
	if err := h.db.First(&user, req.UserID).Error; err != nil {
		utils.ErrorNotFound(c, "User not found", err)
		return
	}

	// Create admin user
	adminUser := &models.AdminUser{
		UserID:     req.UserID,
		AdminRole:  req.AdminRole,
		Department: req.Department,
	}

	if err := adminUser.SetPermissions(req.Permissions); err != nil {
		utils.ErrorBadRequest(c, "Invalid permissions format", err)
		return
	}

	if err := h.db.Create(adminUser).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to create admin user", err)
		return
	}

	utils.SuccessCreated(c, "Admin user created successfully", adminUser)
}

// GetAdminUser retrieves a specific admin user
func (h *AdminHandler) GetAdminUser(c *gin.Context) {
	id := c.Param("id")
	var adminUser models.AdminUser
	if err := h.db.Preload("User").First(&adminUser, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorNotFound(c, "Admin user not found", err)
		} else {
			utils.ErrorInternalServerError(c, "Failed to retrieve admin user", err)
		}
		return
	}

	utils.SuccessOK(c, "Admin user retrieved successfully", adminUser)
}

// UpdateAdminUser updates an admin user
func (h *AdminHandler) UpdateAdminUser(c *gin.Context) {
	id := c.Param("id")
	var adminUser models.AdminUser
	if err := h.db.First(&adminUser, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorNotFound(c, "Admin user not found", err)
		} else {
			utils.ErrorInternalServerError(c, "Failed to retrieve admin user", err)
		}
		return
	}

	var req struct {
		AdminRole   *models.AdminRole   `json:"admin_role"`
		Department  *string             `json:"department"`
		Permissions map[string][]string `json:"permissions"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	// Update fields
	if req.AdminRole != nil {
		adminUser.AdminRole = *req.AdminRole
	}
	if req.Department != nil {
		adminUser.Department = *req.Department
	}
	if req.Permissions != nil {
		if err := adminUser.SetPermissions(req.Permissions); err != nil {
			utils.ErrorBadRequest(c, "Invalid permissions format", err)
			return
		}
	}

	if err := h.db.Save(&adminUser).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to update admin user", err)
		return
	}

	utils.SuccessOK(c, "Admin user updated successfully", adminUser)
}

// DeleteAdminUser deletes an admin user
func (h *AdminHandler) DeleteAdminUser(c *gin.Context) {
	id := c.Param("id")
	var adminUser models.AdminUser
	if err := h.db.First(&adminUser, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorNotFound(c, "Admin user not found", err)
		} else {
			utils.ErrorInternalServerError(c, "Failed to retrieve admin user", err)
		}
		return
	}

	if err := h.db.Delete(&adminUser).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to delete admin user", err)
		return
	}

	utils.SuccessOK(c, "Admin user deleted successfully", nil)
}

// GetLicenseRequests retrieves license requests for admin management
func (h *AdminHandler) GetLicenseRequests(c *gin.Context) {
	var licenseRequests []models.LicenseRequest
	if err := h.db.Preload("User").Preload("Inspector").Find(&licenseRequests).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve license requests", err)
		return
	}

	utils.SuccessOK(c, "License requests retrieved successfully", licenseRequests)
}

// GetLicenseRequest retrieves a specific license request
func (h *AdminHandler) GetLicenseRequest(c *gin.Context) {
	id := c.Param("id")
	var licenseRequest models.LicenseRequest
	if err := h.db.Preload("User").Preload("Inspector").First(&licenseRequest, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorNotFound(c, "License request not found", err)
		} else {
			utils.ErrorInternalServerError(c, "Failed to retrieve license request", err)
		}
		return
	}

	utils.SuccessOK(c, "License request retrieved successfully", licenseRequest)
}

// UpdateLicenseRequestStatus updates the status of a license request
func (h *AdminHandler) UpdateLicenseRequestStatus(c *gin.Context) {
	id := c.Param("id")
	var licenseRequest models.LicenseRequest
	if err := h.db.First(&licenseRequest, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorNotFound(c, "License request not found", err)
		} else {
			utils.ErrorInternalServerError(c, "Failed to retrieve license request", err)
		}
		return
	}

	var req struct {
		Status          models.RequestStatus `json:"status" binding:"required"`
		RejectionReason string               `json:"rejection_reason"`
		Notes           string               `json:"notes"`
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

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: licenseRequest.ID,
		PreviousStatus:   &licenseRequest.Status,
		NewStatus:        req.Status,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     req.Notes,
	}

	if err := h.db.Create(flowLog).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to create flow log", err)
		return
	}

	// Update license request
	licenseRequest.Status = req.Status
	if req.RejectionReason != "" {
		licenseRequest.RejectionReason = req.RejectionReason
	}
	if req.Notes != "" {
		licenseRequest.Notes = req.Notes
	}

	if err := h.db.Save(&licenseRequest).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to update license request", err)
		return
	}

	utils.SuccessOK(c, "License request status updated successfully", licenseRequest)
}

// AssignInspector assigns an inspector to a license request
func (h *AdminHandler) AssignInspector(c *gin.Context) {
	id := c.Param("id")
	var licenseRequest models.LicenseRequest
	if err := h.db.First(&licenseRequest, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorNotFound(c, "License request not found", err)
		} else {
			utils.ErrorInternalServerError(c, "Failed to retrieve license request", err)
		}
		return
	}

	var req struct {
		InspectorID uint `json:"inspector_id" binding:"required"`
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

	// Check if inspector exists
	var inspector models.User
	if err := h.db.First(&inspector, req.InspectorID).Error; err != nil {
		utils.ErrorNotFound(c, "Inspector not found", err)
		return
	}

	// Update license request
	licenseRequest.InspectorID = &req.InspectorID
	licenseRequest.AssignedByID = &[]uint{userID.(uint)}[0]
	licenseRequest.Status = models.StatusAssigned

	if err := h.db.Save(&licenseRequest).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to assign inspector", err)
		return
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: licenseRequest.ID,
		PreviousStatus:   &[]models.RequestStatus{models.StatusAccepted}[0],
		NewStatus:        models.StatusAssigned,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     "Assigned inspector",
	}

	if err := h.db.Create(flowLog).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to create flow log", err)
		return
	}

	utils.SuccessOK(c, "Inspector assigned successfully", licenseRequest)
}
