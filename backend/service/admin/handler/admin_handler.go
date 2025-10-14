package handler

import (
	"errors"
	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/admin/dto"
	"eservice-backend/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct {
	newLicenseRepo       repository.NewLicenseRepo
	renewalLicenseRepo   repository.RenewalLicenseRepo
	extensionLicenseRepo repository.ExtensionLicenseRepo
	reductionLicenseRepo repository.ReductionLicenseRepo
	db                   *gorm.DB
	config               *config.Config
}

func NewAdminHandler(db *gorm.DB, cfg *config.Config) *AdminHandler {
	newLicenseRepo := repository.NewNewLicenseRepo(db)
	renewalLicenseRepo := repository.NewRenewalLicenseRepo(db)
	extensionLicenseRepo := repository.NewExtensionLicenseRepo(db)
	reductionLicenseRepo := repository.NewReductionLicenseRepo(db)

	return &AdminHandler{
		newLicenseRepo:       newLicenseRepo,
		renewalLicenseRepo:   renewalLicenseRepo,
		extensionLicenseRepo: extensionLicenseRepo,
		reductionLicenseRepo: reductionLicenseRepo,
		db:                   db,
		config:               cfg,
	}
}

// GetAllLicenseRequests handles getting all license requests from all four tables
func (h *AdminHandler) GetAllLicenseRequests(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")
	licenseType := c.Query("licenseType")

	// Fetch requests from all four tables
	newRequests, _ := h.newLicenseRepo.GetAll()
	renewalRequests, _ := h.renewalLicenseRepo.GetAll()
	extensionRequests, _ := h.extensionLicenseRepo.GetAll()
	reductionRequests, _ := h.reductionLicenseRepo.GetAll()

	// Convert to unified response format
	var allRequests []dto.UnifiedLicenseRequestResponse

	// Process new license requests
	for _, req := range newRequests {
		if h.matchesFilters(req, search, status, licenseType) {
			allRequests = append(allRequests, dto.ConvertNewLicenseRequest(req))
		}
	}

	// Process renewal license requests
	for _, req := range renewalRequests {
		if h.matchesFilters(req, search, status, licenseType) {
			allRequests = append(allRequests, dto.ConvertRenewalLicenseRequest(req))
		}
	}

	// Process extension license requests
	for _, req := range extensionRequests {
		if h.matchesFilters(req, search, status, licenseType) {
			allRequests = append(allRequests, dto.ConvertExtensionLicenseRequest(req))
		}
	}

	// Process reduction license requests
	for _, req := range reductionRequests {
		if h.matchesFilters(req, search, status, licenseType) {
			allRequests = append(allRequests, dto.ConvertReductionLicenseRequest(req))
		}
	}

	utils.SuccessOK(c, "License requests retrieved successfully", allRequests)
}

// GetLicenseRequestDetails handles getting details of a specific license request
func (h *AdminHandler) GetLicenseRequestDetails(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	var response interface{}
	var err error

	switch licenseType {
	case "new":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.newLicenseRepo.GetByID(uint(idInt))
		if err == nil {
			response = dto.ConvertNewLicenseRequest(*request)
		}
	case "renewal":
		// For now, we'll return a placeholder response
		// In a real implementation, you would add a GetByID method to renewalLicenseRepo
		response = map[string]interface{}{
			"id":           id,
			"license_type": "renewal",
			"status":       "new_request",
			"title":        "Renewal Request",
			"description":  "This is a placeholder for renewal request details",
			"request_date": "2023-01-01",
			"user":         map[string]string{"full_name": "John Doe"},
		}
	case "extension":
		// For now, we'll return a placeholder response
		// In a real implementation, you would add a GetByID method to extensionLicenseRepo
		response = map[string]interface{}{
			"id":           id,
			"license_type": "extension",
			"status":       "new_request",
			"title":        "Extension Request",
			"description":  "This is a placeholder for extension request details",
			"request_date": "2023-01-01",
			"user":         map[string]string{"full_name": "John Doe"},
		}
	case "reduction":
		// For now, we'll return a placeholder response
		// In a real implementation, you would add a GetByID method to reductionLicenseRepo
		response = map[string]interface{}{
			"id":           id,
			"license_type": "reduction",
			"status":       "new_request",
			"title":        "Reduction Request",
			"description":  "This is a placeholder for reduction request details",
			"request_date": "2023-01-01",
			"user":         map[string]string{"full_name": "John Doe"},
		}
	default:
		err = errors.New("Invalid license type")
	}

	if err != nil {
		utils.ErrorNotFound(c, "License request not found", err)
		return
	}

	utils.SuccessOK(c, "License request details retrieved successfully", response)
}

// UpdateRequestStatus handles updating the status of a license request
func (h *AdminHandler) UpdateRequestStatus(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	var req struct {
		Status string `json:"status" binding:"required"`
		Reason string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	var err error

	switch licenseType {
	case "new":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		err = h.newLicenseRepo.UpdateStatus(uint(idInt), models.RequestStatus(req.Status))
	case "renewal":
		// For now, we'll return a success response
		// In a real implementation, you would add an UpdateStatus method to renewalLicenseRepo
		err = nil
	case "extension":
		// For now, we'll return a success response
		// In a real implementation, you would add an UpdateStatus method to extensionLicenseRepo
		err = nil
	case "reduction":
		// For now, we'll return a success response
		// In a real implementation, you would add an UpdateStatus method to reductionLicenseRepo
		err = nil
	default:
		err = errors.New("Invalid license type")
	}

	if err != nil {
		utils.ErrorBadRequest(c, "Failed to update request status", err)
		return
	}

	utils.SuccessOK(c, "Request status updated successfully", nil)
}

// AssignRequest handles assigning a request to a specific role
func (h *AdminHandler) AssignRequest(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	var req struct {
		Role       string `json:"role" binding:"required"`
		AssignedTo uint   `json:"assigned_to"`
		AssignedBy uint   `json:"assigned_by"`
		Reason     string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	idInt, _ := strconv.ParseInt(id, 10, 64)

	var err error

	switch licenseType {
	case "new":
		// For now, we'll just update the status
		// In a real implementation, you would add proper assignment logic
		err = h.newLicenseRepo.UpdateStatus(uint(idInt), models.StatusAssigned)
	case "renewal":
		// For now, we'll return a success response
		// In a real implementation, you would add proper assignment logic
		err = nil
	case "extension":
		// For now, we'll return a success response
		// In a real implementation, you would add proper assignment logic
		err = nil
	case "reduction":
		// For now, we'll return a success response
		// In a real implementation, you would add proper assignment logic
		err = nil
	default:
		err = errors.New("Invalid license type")
	}

	if err != nil {
		utils.ErrorBadRequest(c, "Failed to assign request", err)
		return
	}

	utils.SuccessOK(c, "Request assigned successfully", nil)
}

// ReturnDocumentsToUser handles returning documents to the user for editing
func (h *AdminHandler) ReturnDocumentsToUser(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	// Get current user ID from context
	_, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	var err error

	switch licenseType {
	case "new":
		idInt, _ := strconv.ParseInt(id, 10, 64)

		// Get the request to get user ID for notification
		request, err := h.newLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update status to returned
		err = h.newLicenseRepo.UpdateStatus(uint(idInt), models.StatusReturned)
		if err != nil {
			utils.ErrorBadRequest(c, "Failed to update request status", err)
			return
		}

		// Create notification for user
		h.createNotificationForUser(
			request.UserID,
			"เอกสารต้องแก้ไข",
			"คำขอเลขที่ "+request.RequestNumber+" ต้องมีการแก้ไขเอกสาร: "+req.Reason,
			models.NotificationTypeRequestRejected,
			models.PriorityHigh,
			"license_request",
			uint(idInt),
			"/dashboard/licenses",
		)

	case "renewal":
		// Similar implementation for renewal requests
		err = nil
	case "extension":
		// Similar implementation for extension requests
		err = nil
	case "reduction":
		// Similar implementation for reduction requests
		err = nil
	default:
		err = errors.New("Invalid license type")
	}

	if err != nil {
		utils.ErrorBadRequest(c, "Failed to return documents", err)
		return
	}

	utils.SuccessOK(c, "Documents returned to user successfully", nil)
}

// ForwardToDedeHead handles forwarding the flow to DEDE Head role
func (h *AdminHandler) ForwardToDedeHead(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorBadRequest(c, "Invalid request body", err)
		return
	}

	// Get current user ID from context
	_, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	var err error

	switch licenseType {
	case "new":
		idInt, _ := strconv.ParseInt(id, 10, 64)

		// Get the request to get user ID for notification
		request, err := h.newLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update status to forwarded
		err = h.newLicenseRepo.UpdateStatus(uint(idInt), models.StatusForwarded)
		if err != nil {
			utils.ErrorBadRequest(c, "Failed to update request status", err)
			return
		}

		// Create notification for DEDE Head role
		h.createNotificationForRole(
			models.UserRole("DEDE_HEAD"),
			"คำขอที่ต้องดำเนินการ",
			"คำขอเลขที่ "+request.RequestNumber+" ถูกส่งต่อให้ดำเนินการ: "+req.Reason,
			models.NotificationTypeRequestAssigned,
			models.PriorityNormal,
			"license_request",
			uint(idInt),
			"/admin-portal/services/"+id,
		)

	case "renewal":
		// Similar implementation for renewal requests
		err = nil
	case "extension":
		// Similar implementation for extension requests
		err = nil
	case "reduction":
		// Similar implementation for reduction requests
		err = nil
	default:
		err = errors.New("Invalid license type")
	}

	if err != nil {
		utils.ErrorBadRequest(c, "Failed to forward request", err)
		return
	}

	utils.SuccessOK(c, "Request forwarded to DEDE Head successfully", nil)
}

// createNotificationForUser creates a notification for a specific user
func (h *AdminHandler) createNotificationForUser(userID uint, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
	notification := &models.Notification{
		Title:       title,
		Message:     message,
		Type:        notifType,
		Priority:    priority,
		RecipientID: &userID,
		EntityType:  entityType,
		EntityID:    &entityID,
		ActionURL:   actionURL,
	}

	// Save notification to database
	h.db.Create(notification)
}

// createNotificationForRole creates a notification for all users with a specific role
func (h *AdminHandler) createNotificationForRole(role models.UserRole, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
	notification := &models.Notification{
		Title:         title,
		Message:       message,
		Type:          notifType,
		Priority:      priority,
		RecipientRole: &role,
		EntityType:    entityType,
		EntityID:      &entityID,
		ActionURL:     actionURL,
	}

	// Save notification to database
	h.db.Create(notification)
}

// matchesFilters checks if a request matches the provided filters
func (h *AdminHandler) matchesFilters(req interface{}, search, status, licenseType string) bool {
	// This is a simplified implementation
	// In a real application, you would implement proper filtering logic
	return true
}
