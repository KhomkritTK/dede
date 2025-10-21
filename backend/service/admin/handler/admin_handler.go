package handler

import (
	"errors"
	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/admin/dto"
	"eservice-backend/utils"
	"fmt"
	"strconv"
	"strings"

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
			allRequests = append(allRequests, dto.ConvertNewLicenseRequest(h.db, req))
		}
	}

	// Process renewal license requests
	for _, req := range renewalRequests {
		if h.matchesFilters(req, search, status, licenseType) {
			allRequests = append(allRequests, dto.ConvertRenewalLicenseRequest(h.db, req))
		}
	}

	// Process extension license requests
	for _, req := range extensionRequests {
		if h.matchesFilters(req, search, status, licenseType) {
			allRequests = append(allRequests, dto.ConvertExtensionLicenseRequest(h.db, req))
		}
	}

	// Process reduction license requests
	for _, req := range reductionRequests {
		if h.matchesFilters(req, search, status, licenseType) {
			allRequests = append(allRequests, dto.ConvertReductionLicenseRequest(h.db, req))
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
			response = dto.ConvertNewLicenseRequest(h.db, *request)
		}
	case "renewal":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.renewalLicenseRepo.GetByID(uint(idInt))
		if err == nil {
			response = dto.ConvertRenewalLicenseRequest(h.db, *request)
		}
	case "extension":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.extensionLicenseRepo.GetByID(uint(idInt))
		if err == nil {
			response = dto.ConvertExtensionLicenseRequest(h.db, *request)
		}
	case "reduction":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.reductionLicenseRepo.GetByID(uint(idInt))
		if err == nil {
			response = dto.ConvertReductionLicenseRequest(h.db, *request)
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

// UpdateLicenseRequest handles updating a license request (for returned documents)
func (h *AdminHandler) UpdateLicenseRequest(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	// Log the update request
	fmt.Printf("Updating license request ID: %s, Type: %s\n", id, licenseType)

	var err error
	idInt, _ := strconv.ParseInt(id, 10, 64)
	requestID := uint(idInt)

	switch licenseType {
	case "new":
		var req models.NewLicenseRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.ErrorBadRequest(c, "Invalid request body", err)
			return
		}

		// Get the original request to preserve status
		original, err := h.newLicenseRepo.GetByID(requestID)
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update the request with new data but preserve status and ID
		req.ID = requestID
		req.Status = original.Status
		req.UserID = original.UserID
		req.RequestNumber = original.RequestNumber
		req.CreatedAt = original.CreatedAt

		err = h.newLicenseRepo.Update(&req)

	case "renewal":
		var req struct {
			ProjectName    string `json:"title"`
			Reason         string `json:"description"`
			ProjectAddress string `json:"projectAddress"`
			ContactPerson  string `json:"contactPerson"`
			ContactPhone   string `json:"contactPhone"`
			ContactEmail   string `json:"contactEmail"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.ErrorBadRequest(c, "Invalid request body", err)
			return
		}

		// For renewal requests, we need to update the underlying model
		original, err := h.renewalLicenseRepo.GetByID(requestID)
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update the original request with new data
		original.ProjectName = req.ProjectName
		original.Reason = req.Reason
		original.ProjectAddress = req.ProjectAddress
		original.ContactPerson = req.ContactPerson
		original.ContactPhone = req.ContactPhone
		original.ContactEmail = req.ContactEmail

		// Save the updated request
		err = h.db.Save(&original).Error

	case "extension":
		var req struct {
			ProjectName   string `json:"title"`
			Description   string `json:"description"`
			ContactPerson string `json:"contactPerson"`
			ContactPhone  string `json:"contactPhone"`
			ContactEmail  string `json:"contactEmail"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.ErrorBadRequest(c, "Invalid request body", err)
			return
		}

		// For extension requests, we need to update the underlying model
		original, err := h.extensionLicenseRepo.GetByID(requestID)
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update the original request with new data
		original.ProjectName = req.ProjectName
		original.Description = req.Description
		original.ContactPerson = req.ContactPerson
		original.ContactPhone = req.ContactPhone
		original.ContactEmail = req.ContactEmail

		// Save the updated request
		err = h.db.Save(&original).Error

	case "reduction":
		var req struct {
			ProjectName   string `json:"title"`
			Description   string `json:"description"`
			ContactPerson string `json:"contactPerson"`
			ContactPhone  string `json:"contactPhone"`
			ContactEmail  string `json:"contactEmail"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			utils.ErrorBadRequest(c, "Invalid request body", err)
			return
		}

		// For reduction requests, we need to update the underlying model
		original, err := h.reductionLicenseRepo.GetByID(requestID)
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update the original request with new data
		original.ProjectName = req.ProjectName
		original.Description = req.Description
		original.ContactPerson = req.ContactPerson
		original.ContactPhone = req.ContactPhone
		original.ContactEmail = req.ContactEmail

		// Save the updated request
		err = h.db.Save(&original).Error

	default:
		err = errors.New("Invalid license type")
	}

	if err != nil {
		fmt.Printf("Error updating license request: %v\n", err)
		utils.ErrorBadRequest(c, "Failed to update license request", err)
		return
	}

	// If the request was in "returned" status, update it to "new_request" to resubmit
	// We need to check the original status before updating
	switch licenseType {
	case "new":
		original, _ := h.newLicenseRepo.GetByID(requestID)
		if original.Status == models.StatusReturned {
			h.newLicenseRepo.UpdateStatus(requestID, models.StatusNewRequest)
		}
	case "renewal":
		original, _ := h.renewalLicenseRepo.GetByID(requestID)
		if original.Status == models.StatusReturned {
			h.renewalLicenseRepo.UpdateStatus(requestID, models.StatusNewRequest)
		}
	case "extension":
		original, _ := h.extensionLicenseRepo.GetByID(requestID)
		if original.Status == models.StatusReturned {
			h.extensionLicenseRepo.UpdateStatus(requestID, models.StatusNewRequest)
		}
	case "reduction":
		original, _ := h.reductionLicenseRepo.GetByID(requestID)
		if original.Status == models.StatusReturned {
			h.reductionLicenseRepo.UpdateStatus(requestID, models.StatusNewRequest)
		}
	}

	fmt.Printf("License request updated successfully\n")
	utils.SuccessOK(c, "License request updated successfully", nil)
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

	// Log the update request
	fmt.Printf("Updating status for request ID: %s, Type: %s, New Status: %s\n", id, licenseType, req.Status)

	var err error

	switch licenseType {
	case "new":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		err = h.newLicenseRepo.UpdateStatus(uint(idInt), models.RequestStatus(req.Status))
	case "renewal":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		err = h.renewalLicenseRepo.UpdateStatus(uint(idInt), models.RequestStatus(req.Status))
	case "extension":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		err = h.extensionLicenseRepo.UpdateStatus(uint(idInt), models.RequestStatus(req.Status))
	case "reduction":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		err = h.reductionLicenseRepo.UpdateStatus(uint(idInt), models.RequestStatus(req.Status))
	default:
		err = errors.New("Invalid license type")
	}

	if err != nil {
		fmt.Printf("Error updating status: %v\n", err)
		utils.ErrorBadRequest(c, "Failed to update request status", err)
		return
	}

	fmt.Printf("Status updated successfully\n")
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
		idInt, _ := strconv.ParseInt(id, 10, 64)
		err = h.renewalLicenseRepo.UpdateStatus(uint(idInt), models.StatusAssigned)
	case "extension":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		err = h.extensionLicenseRepo.UpdateStatus(uint(idInt), models.StatusAssigned)
	case "reduction":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		err = h.reductionLicenseRepo.UpdateStatus(uint(idInt), models.StatusAssigned)
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
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	// Convert userID to uint if needed
	var assignedBy uint
	if uid, ok := userID.(uint); ok {
		assignedBy = uid
	}
	_ = assignedBy // Use the variable to avoid compiler error

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
		idInt, _ := strconv.ParseInt(id, 10, 64)

		// Get the request to get user ID for notification
		request, err := h.renewalLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update status to returned
		err = h.renewalLicenseRepo.UpdateStatus(uint(idInt), models.StatusReturned)
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
	case "extension":
		idInt, _ := strconv.ParseInt(id, 10, 64)

		// Get the request to get user ID for notification
		request, err := h.extensionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update status to returned
		err = h.extensionLicenseRepo.UpdateStatus(uint(idInt), models.StatusReturned)
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
	case "reduction":
		idInt, _ := strconv.ParseInt(id, 10, 64)

		// Get the request to get user ID for notification
		request, err := h.reductionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update status to returned
		err = h.reductionLicenseRepo.UpdateStatus(uint(idInt), models.StatusReturned)
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
		idInt, _ := strconv.ParseInt(id, 10, 64)

		// Get the request to get user ID for notification
		request, err := h.renewalLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update status to forwarded
		err = h.renewalLicenseRepo.UpdateStatus(uint(idInt), models.StatusForwarded)
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
	case "extension":
		idInt, _ := strconv.ParseInt(id, 10, 64)

		// Get the request to get user ID for notification
		request, err := h.extensionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update status to forwarded
		err = h.extensionLicenseRepo.UpdateStatus(uint(idInt), models.StatusForwarded)
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
	case "reduction":
		idInt, _ := strconv.ParseInt(id, 10, 64)

		// Get the request to get user ID for notification
		request, err := h.reductionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "License request not found", err)
			return
		}

		// Update status to forwarded
		err = h.reductionLicenseRepo.UpdateStatus(uint(idInt), models.StatusForwarded)
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

// GetAdminUsers handles getting all admin users
func (h *AdminHandler) GetAdminUsers(c *gin.Context) {
	var adminUsers []models.AdminUser

	// Preload the User relationship
	if err := h.db.Preload("User").Find(&adminUsers).Error; err != nil {
		utils.ErrorInternalServerError(c, "Failed to retrieve admin users", err)
		return
	}

	// Transform the data to match the expected format
	var result []map[string]interface{}
	for _, adminUser := range adminUsers {
		result = append(result, map[string]interface{}{
			"id":          adminUser.ID,
			"user_id":     adminUser.UserID,
			"admin_role":  adminUser.AdminRole,
			"department":  adminUser.Department,
			"permissions": adminUser.Permissions,
			"created_at":  adminUser.CreatedAt,
			"updated_at":  adminUser.UpdatedAt,
			"user": map[string]interface{}{
				"id":        adminUser.User.ID,
				"username":  adminUser.User.Username,
				"email":     adminUser.User.Email,
				"full_name": adminUser.User.FullName,
				"role":      adminUser.User.Role,
				"status":    adminUser.User.Status,
			},
		})
	}

	utils.SuccessOK(c, "Admin users retrieved successfully", gin.H{"users": result})
}

// matchesFilters checks if a request matches the provided filters
func (h *AdminHandler) matchesFilters(req interface{}, search, status, licenseType string) bool {
	var requestNumber, title, description, reqStatus, reqLicenseType string
	var userID uint

	// Extract common fields based on request type
	switch r := req.(type) {
	case models.NewLicenseRequest:
		requestNumber = r.RequestNumber
		title = r.ProjectName
		description = r.Description
		reqStatus = string(r.Status)
		reqLicenseType = "new"
		userID = r.UserID
	case models.RenewalLicenseRequest:
		requestNumber = r.RequestNumber
		title = r.ProjectName
		description = r.Reason
		reqStatus = string(r.Status)
		reqLicenseType = "renewal"
		userID = r.UserID
	case models.ExtensionLicenseRequest:
		requestNumber = r.RequestNumber
		title = r.ProjectName
		description = r.Description
		reqStatus = string(r.Status)
		reqLicenseType = "extension"
		userID = r.UserID
	case models.ReductionLicenseRequest:
		requestNumber = r.RequestNumber
		title = r.ProjectName
		description = r.Description
		reqStatus = string(r.Status)
		reqLicenseType = "reduction"
		userID = r.UserID
	default:
		return false
	}

	// Check license type filter
	if licenseType != "" && reqLicenseType != licenseType {
		return false
	}

	// Check status filter
	if status != "" && reqStatus != status {
		return false
	}

	// Check search filter
	if search != "" {
		searchLower := strings.ToLower(search)
		requestNumberLower := strings.ToLower(requestNumber)
		titleLower := strings.ToLower(title)
		descriptionLower := strings.ToLower(description)

		// Get user information for search
		var user models.User
		if err := h.db.First(&user, userID).Error; err == nil {
			userNameLower := strings.ToLower(user.FullName)
			userEmailLower := strings.ToLower(user.Email)

			// Check if search term matches any field
			if !strings.Contains(requestNumberLower, searchLower) &&
				!strings.Contains(titleLower, searchLower) &&
				!strings.Contains(descriptionLower, searchLower) &&
				!strings.Contains(userNameLower, searchLower) &&
				!strings.Contains(userEmailLower, searchLower) {
				return false
			}
		} else {
			// If user not found, search only in request fields
			if !strings.Contains(requestNumberLower, searchLower) &&
				!strings.Contains(titleLower, searchLower) &&
				!strings.Contains(descriptionLower, searchLower) {
				return false
			}
		}
	}

	return true
}
