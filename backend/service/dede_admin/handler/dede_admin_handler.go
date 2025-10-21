package handler

import (
	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/dede_admin/dto"
	"eservice-backend/service/workflow/handler"
	"eservice-backend/utils"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DedeAdminHandler struct {
	db                   *gorm.DB
	cfg                  *config.Config
	newLicenseRepo       repository.NewLicenseRepo
	renewalLicenseRepo   repository.RenewalLicenseRepo
	extensionLicenseRepo repository.ExtensionLicenseRepo
	reductionLicenseRepo repository.ReductionLicenseRepo
	notificationRepo     repository.NotificationRepository
	serviceFlowLogRepo   repository.ServiceFlowLogRepo
	workflowHandler      *handler.WorkflowHandler
}

func NewDedeAdminHandler(db *gorm.DB, cfg *config.Config) *DedeAdminHandler {
	return &DedeAdminHandler{
		db:                   db,
		cfg:                  cfg,
		newLicenseRepo:       repository.NewNewLicenseRepo(db),
		renewalLicenseRepo:   repository.NewRenewalLicenseRepo(db),
		extensionLicenseRepo: repository.NewExtensionLicenseRepo(db),
		reductionLicenseRepo: repository.NewReductionLicenseRepo(db),
		notificationRepo:     repository.NewNotificationRepository(db),
		serviceFlowLogRepo:   repository.NewServiceFlowLogRepo(db),
		workflowHandler: handler.NewWorkflowHandler(
			nil, // dashboardService
			nil, // taskService
			nil, // deadlineService
			nil, // commentService
			nil, // activityService
		),
	}
}

// GetPendingRequests returns all pending requests for DEDE Admin review
func (h *DedeAdminHandler) GetPendingRequests(c *gin.Context) {
	// Get query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	// Get all pending requests across all license types
	var allRequests []map[string]interface{}
	var total int64

	// Helper function to process requests
	processRequests := func(requests interface{}, licenseType string) error {
		switch reqs := requests.(type) {
		case []models.NewLicenseRequest:
			for _, req := range reqs {
				if req.Status == models.StatusNewRequest {
					// Apply search filter if provided
					if search != "" && !h.matchesSearch(req.RequestNumber, req.ProjectName, req.User.FullName, search) {
						continue
					}

					// Apply license type filter if provided
					if licenseType != "" && licenseType != "new" {
						continue
					}

					allRequests = append(allRequests, map[string]interface{}{
						"id":             req.ID,
						"request_number": req.RequestNumber,
						"license_type":   "new",
						"status":         string(req.Status),
						"title":          req.ProjectName,
						"description":    req.Description,
						"request_date":   req.CreatedAt,
						"user":           req.User,
						"energy_type":    req.EnergyType,
						"capacity":       req.Capacity,
						"province":       req.Province,
					})
					total++
				}
			}
		case []models.RenewalLicenseRequest:
			for _, req := range reqs {
				if req.Status == models.StatusNewRequest {
					if search != "" && !h.matchesSearch(req.RequestNumber, req.ProjectName, req.User.FullName, search) {
						continue
					}
					if licenseType != "" && licenseType != "renewal" {
						continue
					}

					allRequests = append(allRequests, map[string]interface{}{
						"id":             req.ID,
						"request_number": req.RequestNumber,
						"license_type":   "renewal",
						"status":         string(req.Status),
						"title":          req.ProjectName,
						"description":    req.Reason,
						"request_date":   req.CreatedAt,
						"user":           req.User,
						"license_number": req.LicenseNumber,
						"expiry_date":    req.ExpiryDate,
					})
					total++
				}
			}
		case []models.ExtensionLicenseRequest:
			for _, req := range reqs {
				if req.Status == models.StatusNewRequest {
					if search != "" && !h.matchesSearch(req.RequestNumber, req.ProjectName, req.User.FullName, search) {
						continue
					}
					if licenseType != "" && licenseType != "extension" {
						continue
					}

					allRequests = append(allRequests, map[string]interface{}{
						"id":             req.ID,
						"request_number": req.RequestNumber,
						"license_type":   "extension",
						"status":         string(req.Status),
						"title":          req.ProjectName,
						"description":    req.Description,
						"request_date":   req.CreatedAt,
						"user":           req.User,
						"license_number": req.LicenseNumber,
					})
					total++
				}
			}
		case []models.ReductionLicenseRequest:
			for _, req := range reqs {
				if req.Status == models.StatusNewRequest {
					if search != "" && !h.matchesSearch(req.RequestNumber, req.ProjectName, req.User.FullName, search) {
						continue
					}
					if licenseType != "" && licenseType != "reduction" {
						continue
					}

					allRequests = append(allRequests, map[string]interface{}{
						"id":             req.ID,
						"request_number": req.RequestNumber,
						"license_type":   "reduction",
						"status":         string(req.Status),
						"title":          req.ProjectName,
						"description":    req.Description,
						"request_date":   req.CreatedAt,
						"user":           req.User,
						"license_number": req.LicenseNumber,
					})
					total++
				}
			}
		}
		return nil
	}

	// Get requests from all license types
	newRequests, _ := h.newLicenseRepo.GetAll()
	processRequests(newRequests, "new")

	renewalRequests, _ := h.renewalLicenseRepo.GetAll()
	processRequests(renewalRequests, "renewal")

	extensionRequests, _ := h.extensionLicenseRepo.GetAll()
	processRequests(extensionRequests, "extension")

	reductionRequests, _ := h.reductionLicenseRepo.GetAll()
	processRequests(reductionRequests, "reduction")

	// Apply pagination
	start := (page - 1) * limit
	end := start + limit
	if end > len(allRequests) {
		end = len(allRequests)
	}
	if start > len(allRequests) {
		start = len(allRequests)
	}

	var paginatedRequests []map[string]interface{}
	if start < len(allRequests) {
		paginatedRequests = allRequests[start:end]
	}

	response := gin.H{
		"requests": paginatedRequests,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	}

	utils.SuccessOK(c, "Pending requests retrieved successfully", response)
}

// AcceptRequest accepts a pending request
func (h *DedeAdminHandler) AcceptRequest(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	var req dto.AcceptRequestRequest
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

	var err error
	var requestNumber string
	var requestUserID uint

	switch licenseType {
	case "new":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.newLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		// Update status
		request.Status = models.StatusAccepted
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	case "renewal":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.renewalLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusAccepted
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	case "extension":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.extensionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusAccepted
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	case "reduction":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.reductionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusAccepted
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	default:
		err = fmt.Errorf("invalid license type")
	}

	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to accept request", err)
		return
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: uint(h.stringToUint(id)),
		PreviousStatus:   &[]models.RequestStatus{models.StatusNewRequest}[0],
		NewStatus:        models.StatusAccepted,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     req.Comments,
		LicenseType:      licenseType,
	}

	h.serviceFlowLogRepo.Create(flowLog)

	// Create notification for user
	h.createNotificationForUser(
		requestUserID,
		"คำขอได้รับการอนุมัติ",
		"คำขอเลขที่ "+requestNumber+" ได้รับการอนุมัติเบื้องต้นแล้ว",
		models.NotificationTypeRequestAssigned,
		models.PriorityNormal,
		"license_request",
		uint(h.stringToUint(id)),
		"/dashboard/licenses",
	)

	// Create notification for DEDE Head
	h.createNotificationForRole(
		models.UserRole("dede_head"),
		"คำขอใหม่ที่ต้องดำเนินการ",
		"คำขอเลขที่ "+requestNumber+" พร้อมส่งต่อให้ดำเนินการ",
		models.NotificationTypeRequestAssigned,
		models.PriorityNormal,
		"license_request",
		uint(h.stringToUint(id)),
		"/admin-portal/services",
	)

	utils.SuccessOK(c, "Request accepted successfully", nil)
}

// RejectRequest rejects a pending request
func (h *DedeAdminHandler) RejectRequest(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	var req dto.RejectRequestRequest
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

	var err error
	var requestNumber string
	var requestUserID uint

	switch licenseType {
	case "new":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.newLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		// Update status
		request.Status = models.StatusRejected
		request.RejectionReason = req.Reason
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	case "renewal":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.renewalLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusRejected
		request.RejectionReason = req.Reason
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	case "extension":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.extensionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusRejected
		request.RejectionReason = req.Reason
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	case "reduction":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.reductionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusRejected
		request.RejectionReason = req.Reason
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	default:
		err = fmt.Errorf("invalid license type")
	}

	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to reject request", err)
		return
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: uint(h.stringToUint(id)),
		PreviousStatus:   &[]models.RequestStatus{models.StatusNewRequest}[0],
		NewStatus:        models.StatusRejected,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     req.Comments,
		LicenseType:      licenseType,
	}

	h.serviceFlowLogRepo.Create(flowLog)

	// Create notification for user
	h.createNotificationForUser(
		requestUserID,
		"คำขอถูกปฏิเสธ",
		"คำขอเลขที่ "+requestNumber+" ถูกปฏิเสธ: "+req.Reason,
		models.NotificationTypeRequestRejected,
		models.PriorityHigh,
		"license_request",
		uint(h.stringToUint(id)),
		"/dashboard/licenses",
	)

	utils.SuccessOK(c, "Request rejected successfully", nil)
}

// ReturnRequest returns a request to user for corrections
func (h *DedeAdminHandler) ReturnRequest(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	var req dto.ReturnRequestRequest
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

	var err error
	var requestNumber string
	var requestUserID uint

	switch licenseType {
	case "new":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.newLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		// Update status
		request.Status = models.StatusReturned
		request.RejectionReason = req.Reason
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	case "renewal":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.renewalLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusReturned
		request.RejectionReason = req.Reason
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	case "extension":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.extensionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusReturned
		request.RejectionReason = req.Reason
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	case "reduction":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.reductionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusReturned
		request.RejectionReason = req.Reason
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	default:
		err = fmt.Errorf("invalid license type")
	}

	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to return request", err)
		return
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: uint(h.stringToUint(id)),
		PreviousStatus:   &[]models.RequestStatus{models.StatusNewRequest}[0],
		NewStatus:        models.StatusReturned,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     req.Comments,
		LicenseType:      licenseType,
	}

	h.serviceFlowLogRepo.Create(flowLog)

	// Create notification for user
	h.createNotificationForUser(
		requestUserID,
		"เอกสารถูกตีกลับเพื่อแก้ไข",
		"คำขอเลขที่ "+requestNumber+" ต้องมีการแก้ไขเอกสาร: "+req.Reason,
		models.NotificationTypeRequestRejected,
		models.PriorityHigh,
		"license_request",
		uint(h.stringToUint(id)),
		"/dashboard/licenses",
	)

	utils.SuccessOK(c, "Request returned to user successfully", nil)
}

// ForwardRequest forwards a request to DEDE Head
func (h *DedeAdminHandler) ForwardRequest(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	var req dto.ForwardRequestRequest
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

	var err error
	var requestNumber string

	switch licenseType {
	case "new":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.newLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		// Update status
		request.Status = models.StatusForwarded
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber

	case "renewal":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.renewalLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusForwarded
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber

	case "extension":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.extensionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusForwarded
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber

	case "reduction":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.reductionLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		request.Status = models.StatusForwarded
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber

	default:
		err = fmt.Errorf("invalid license type")
	}

	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to forward request", err)
		return
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: uint(h.stringToUint(id)),
		PreviousStatus:   &[]models.RequestStatus{models.StatusAccepted}[0],
		NewStatus:        models.StatusForwarded,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     req.Comments,
		LicenseType:      licenseType,
	}

	h.serviceFlowLogRepo.Create(flowLog)

	// Create notification for DEDE Head role
	h.createNotificationForRole(
		models.UserRole("dede_head"),
		"คำขอที่ต้องดำเนินการ",
		"คำขอเลขที่ "+requestNumber+" ถูกส่งต่อให้ดำเนินการ: "+req.Reason,
		models.NotificationTypeRequestAssigned,
		models.PriorityNormal,
		"license_request",
		uint(h.stringToUint(id)),
		"/admin-portal/services",
	)

	utils.SuccessOK(c, "Request forwarded to DEDE Head successfully", nil)
}

// GetDashboardStats returns dashboard statistics for DEDE Admin
func (h *DedeAdminHandler) GetDashboardStats(c *gin.Context) {
	var stats struct {
		TotalRequests     int64 `json:"total_requests"`
		PendingRequests   int64 `json:"pending_requests"`
		AcceptedRequests  int64 `json:"accepted_requests"`
		RejectedRequests  int64 `json:"rejected_requests"`
		ReturnedRequests  int64 `json:"returned_requests"`
		ForwardedRequests int64 `json:"forwarded_requests"`
	}

	// Count new license requests
	h.db.Model(&models.NewLicenseRequest{}).Count(&stats.TotalRequests)
	h.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusNewRequest).Count(&stats.PendingRequests)
	h.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusAccepted).Count(&stats.AcceptedRequests)
	h.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusRejected).Count(&stats.RejectedRequests)
	h.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusReturned).Count(&stats.ReturnedRequests)
	h.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusForwarded).Count(&stats.ForwardedRequests)

	// Add counts from other license types
	var renewalTotal, renewalPending, renewalAccepted, renewalRejected, renewalReturned, renewalForwarded int64
	h.db.Model(&models.RenewalLicenseRequest{}).Count(&renewalTotal)
	h.db.Model(&models.RenewalLicenseRequest{}).Where("status = ?", models.StatusNewRequest).Count(&renewalPending)
	h.db.Model(&models.RenewalLicenseRequest{}).Where("status = ?", models.StatusAccepted).Count(&renewalAccepted)
	h.db.Model(&models.RenewalLicenseRequest{}).Where("status = ?", models.StatusRejected).Count(&renewalRejected)
	h.db.Model(&models.RenewalLicenseRequest{}).Where("status = ?", models.StatusReturned).Count(&renewalReturned)
	h.db.Model(&models.RenewalLicenseRequest{}).Where("status = ?", models.StatusForwarded).Count(&renewalForwarded)

	stats.TotalRequests += renewalTotal
	stats.PendingRequests += renewalPending
	stats.AcceptedRequests += renewalAccepted
	stats.RejectedRequests += renewalRejected
	stats.ReturnedRequests += renewalReturned
	stats.ForwardedRequests += renewalForwarded

	// Add extension and reduction counts similarly...

	utils.SuccessOK(c, "Dashboard statistics retrieved successfully", stats)
}

// Helper functions

func (h *DedeAdminHandler) stringToUint(s string) uint {
	val, _ := strconv.ParseUint(s, 10, 32)
	return uint(val)
}

func (h *DedeAdminHandler) matchesSearch(requestNumber, title, userName, search string) bool {
	searchLower := fmt.Sprintf("%s", search)
	requestNumberLower := fmt.Sprintf("%s", requestNumber)
	titleLower := fmt.Sprintf("%s", title)
	userNameLower := fmt.Sprintf("%s", userName)

	return fmt.Sprintf("%s", requestNumberLower) == searchLower ||
		fmt.Sprintf("%s", titleLower) == searchLower ||
		fmt.Sprintf("%s", userNameLower) == searchLower
}

func (h *DedeAdminHandler) createNotificationForUser(userID uint, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
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

	h.notificationRepo.Create(notification)
}

func (h *DedeAdminHandler) createNotificationForRole(role models.UserRole, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
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

	h.notificationRepo.Create(notification)
}
