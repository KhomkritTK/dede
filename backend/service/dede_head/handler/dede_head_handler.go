package handler

import (
	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/dede_head/dto"
	"eservice-backend/service/workflow/handler"
	"eservice-backend/utils"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DedeHeadHandler struct {
	db                   *gorm.DB
	cfg                  *config.Config
	newLicenseRepo       repository.NewLicenseRepo
	renewalLicenseRepo   repository.RenewalLicenseRepo
	extensionLicenseRepo repository.ExtensionLicenseRepo
	reductionLicenseRepo repository.ReductionLicenseRepo
	userRepo             repository.UserRepository
	notificationRepo     repository.NotificationRepository
	serviceFlowLogRepo   repository.ServiceFlowLogRepo
	workflowHandler      *handler.WorkflowHandler
}

func NewDedeHeadHandler(db *gorm.DB, cfg *config.Config) *DedeHeadHandler {
	return &DedeHeadHandler{
		db:                   db,
		cfg:                  cfg,
		newLicenseRepo:       repository.NewNewLicenseRepo(db),
		renewalLicenseRepo:   repository.NewRenewalLicenseRepo(db),
		extensionLicenseRepo: repository.NewExtensionLicenseRepo(db),
		reductionLicenseRepo: repository.NewReductionLicenseRepo(db),
		userRepo:             repository.NewUserRepository(db),
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

// GetForwardedRequests returns all forwarded requests for DEDE Head review
func (h *DedeHeadHandler) GetForwardedRequests(c *gin.Context) {
	// Get query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	// Get all forwarded requests across all license types
	var allRequests []map[string]interface{}
	var total int64

	// Helper function to process requests
	processRequests := func(requests interface{}, licenseType string) error {
		switch reqs := requests.(type) {
		case []models.NewLicenseRequest:
			for _, req := range reqs {
				if req.Status == models.StatusForwarded {
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
				if req.Status == models.StatusForwarded {
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
				if req.Status == models.StatusForwarded {
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
				if req.Status == models.StatusForwarded {
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

	utils.SuccessOK(c, "Forwarded requests retrieved successfully", response)
}

// GetAvailableStaff returns available DEDE staff and consultants for assignment
func (h *DedeHeadHandler) GetAvailableStaff(c *gin.Context) {
	// Get query parameters
	role := c.Query("role") // "staff" or "consult"

	var users []models.User
	var err error

	// Get users by role
	if role == "staff" {
		users, err = h.userRepo.GetByRole(models.UserRole("dede_staff"))
	} else if role == "consult" {
		users, err = h.userRepo.GetByRole(models.UserRole("dede_consult"))
	} else {
		// Get all DEDE staff and consultants
		staffUsers, _ := h.userRepo.GetByRole(models.UserRole("dede_staff"))
		consultUsers, _ := h.userRepo.GetByRole(models.UserRole("dede_consult"))
		users = append(staffUsers, consultUsers...)
	}

	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to get staff", err)
		return
	}

	// Format response
	var staffList []map[string]interface{}
	for _, user := range users {
		// Count current assignments
		assignmentCount := h.countCurrentAssignments(user.ID)

		staffList = append(staffList, map[string]interface{}{
			"id":                  user.ID,
			"username":            user.Username,
			"full_name":           user.FullName,
			"email":               user.Email,
			"role":                string(user.Role),
			"current_assignments": assignmentCount,
			"availability":        h.getAvailabilityStatus(assignmentCount),
		})
	}

	utils.SuccessOK(c, "Available staff retrieved successfully", staffList)
}

// AssignRequest assigns a request to DEDE staff or consultant
func (h *DedeHeadHandler) AssignRequest(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	var req dto.AssignRequestRequest
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

	// Validate assigned user exists
	assignedUser, err := h.userRepo.GetByID(req.AssignedToID)
	if err != nil {
		utils.ErrorNotFound(c, "Assigned user not found", err)
		return
	}

	// Validate assigned user has correct role
	if assignedUser.Role != models.UserRole("dede_staff") && assignedUser.Role != models.UserRole("dede_consult") {
		utils.ErrorBadRequest(c, "Assigned user must have DEDE Staff or DEDE Consult role", nil)
		return
	}

	var requestNumber string

	switch licenseType {
	case "new":
		idInt, _ := strconv.ParseInt(id, 10, 64)
		request, err := h.newLicenseRepo.GetByID(uint(idInt))
		if err != nil {
			utils.ErrorNotFound(c, "Request not found", err)
			return
		}

		// Update request
		request.Status = models.StatusAssigned
		request.InspectorID = &req.AssignedToID
		request.AssignedByID = &[]uint{userID.(uint)}[0]
		now := time.Now()
		request.AssignedAt = &now
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

		request.Status = models.StatusAssigned
		request.InspectorID = &req.AssignedToID
		request.AssignedByID = &[]uint{userID.(uint)}[0]
		now := time.Now()
		request.AssignedAt = &now
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

		request.Status = models.StatusAssigned
		request.InspectorID = &req.AssignedToID
		request.AssignedByID = &[]uint{userID.(uint)}[0]
		now := time.Now()
		request.AssignedAt = &now
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

		request.Status = models.StatusAssigned
		request.InspectorID = &req.AssignedToID
		request.AssignedByID = &[]uint{userID.(uint)}[0]
		now := time.Now()
		request.AssignedAt = &now
		request.Notes = req.Comments
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber

	default:
		err = fmt.Errorf("invalid license type")
	}

	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to assign request", err)
		return
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: uint(h.stringToUint(id)),
		PreviousStatus:   &[]models.RequestStatus{models.StatusForwarded}[0],
		NewStatus:        models.StatusAssigned,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     req.Comments,
		LicenseType:      licenseType,
	}

	h.serviceFlowLogRepo.Create(flowLog)

	// Create task assignment
	taskAssignment := &models.TaskAssignment{
		RequestID:    uint(h.stringToUint(id)),
		LicenseType:  licenseType,
		AssignedToID: req.AssignedToID,
		AssignedByID: userID.(uint),
		AssignedRole: assignedUser.Role,
		TaskType:     models.TaskTypeInspection,
		Status:       models.TaskStatusPending,
		Priority:     models.TaskPriorityNormal,
		Comments:     req.Comments,
	}

	h.db.Create(taskAssignment)

	// Create notification for assigned user
	h.createNotificationForUser(
		req.AssignedToID,
		"มอบหมายงานใหม่",
		"คำขอเลขที่ "+requestNumber+" ถูกมอบหมายให้ดำเนินการ",
		models.NotificationTypeRequestAssigned,
		models.PriorityNormal,
		"license_request",
		uint(h.stringToUint(id)),
		"/admin-portal/services",
	)

	utils.SuccessOK(c, "Request assigned successfully", nil)
}

// RejectRequest rejects a forwarded request
func (h *DedeHeadHandler) RejectRequest(c *gin.Context) {
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
		PreviousStatus:   &[]models.RequestStatus{models.StatusForwarded}[0],
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

// FinalApproveRequest provides final approval for a request
func (h *DedeHeadHandler) FinalApproveRequest(c *gin.Context) {
	id := c.Param("id")
	licenseType := c.Query("type")

	var req dto.FinalApproveRequestRequest
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
		request.Status = models.StatusApproved
		request.Notes = req.Comments
		now := time.Now()
		request.CompletionDate = &now
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

		request.Status = models.StatusApproved
		request.Notes = req.Comments
		now := time.Now()
		request.CompletionDate = &now
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

		request.Status = models.StatusApproved
		request.Notes = req.Comments
		now := time.Now()
		request.CompletionDate = &now
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

		request.Status = models.StatusApproved
		request.Notes = req.Comments
		now := time.Now()
		request.CompletionDate = &now
		err = h.db.Save(request).Error
		requestNumber = request.RequestNumber
		requestUserID = request.UserID

	default:
		err = fmt.Errorf("invalid license type")
	}

	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to approve request", err)
		return
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: uint(h.stringToUint(id)),
		PreviousStatus:   &[]models.RequestStatus{models.StatusReportApproved}[0],
		NewStatus:        models.StatusApproved,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     req.Comments,
		LicenseType:      licenseType,
	}

	h.serviceFlowLogRepo.Create(flowLog)

	// Create notification for user
	h.createNotificationForUser(
		requestUserID,
		"คำขอได้รับการอนุมัติแล้ว",
		"คำขอเลขที่ "+requestNumber+" ได้รับการอนุมัติแล้ว",
		models.NotificationType("request_approved"),
		models.PriorityHigh,
		"license_request",
		uint(h.stringToUint(id)),
		"/dashboard/licenses",
	)

	utils.SuccessOK(c, "Request approved successfully", nil)
}

// GetDashboardStats returns dashboard statistics for DEDE Head
func (h *DedeHeadHandler) GetDashboardStats(c *gin.Context) {
	var stats struct {
		TotalRequests     int64 `json:"total_requests"`
		ForwardedRequests int64 `json:"forwarded_requests"`
		AssignedRequests  int64 `json:"assigned_requests"`
		CompletedRequests int64 `json:"completed_requests"`
		ApprovedRequests  int64 `json:"approved_requests"`
		RejectedRequests  int64 `json:"rejected_requests"`
		StaffCount        int64 `json:"staff_count"`
		ConsultCount      int64 `json:"consult_count"`
	}

	// Count requests by status
	h.db.Model(&models.NewLicenseRequest{}).Count(&stats.TotalRequests)
	h.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusForwarded).Count(&stats.ForwardedRequests)
	h.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusAssigned).Count(&stats.AssignedRequests)
	h.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusInspectionDone).Count(&stats.CompletedRequests)
	h.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusApproved).Count(&stats.ApprovedRequests)
	h.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusRejected).Count(&stats.RejectedRequests)

	// Count staff
	h.db.Model(&models.User{}).Where("role = ?", models.UserRole("dede_staff")).Count(&stats.StaffCount)
	h.db.Model(&models.User{}).Where("role = ?", models.UserRole("dede_consult")).Count(&stats.ConsultCount)

	// Add counts from other license types
	var renewalTotal, renewalForwarded, renewalAssigned, renewalCompleted, renewalApproved, renewalRejected int64
	h.db.Model(&models.RenewalLicenseRequest{}).Count(&renewalTotal)
	h.db.Model(&models.RenewalLicenseRequest{}).Where("status = ?", models.StatusForwarded).Count(&renewalForwarded)
	h.db.Model(&models.RenewalLicenseRequest{}).Where("status = ?", models.StatusAssigned).Count(&renewalAssigned)
	h.db.Model(&models.RenewalLicenseRequest{}).Where("status = ?", models.StatusInspectionDone).Count(&renewalCompleted)
	h.db.Model(&models.RenewalLicenseRequest{}).Where("status = ?", models.StatusApproved).Count(&renewalApproved)
	h.db.Model(&models.RenewalLicenseRequest{}).Where("status = ?", models.StatusRejected).Count(&renewalRejected)

	stats.TotalRequests += renewalTotal
	stats.ForwardedRequests += renewalForwarded
	stats.AssignedRequests += renewalAssigned
	stats.CompletedRequests += renewalCompleted
	stats.ApprovedRequests += renewalApproved
	stats.RejectedRequests += renewalRejected

	// Add extension and reduction counts similarly...

	utils.SuccessOK(c, "Dashboard statistics retrieved successfully", stats)
}

// Helper functions

func (h *DedeHeadHandler) stringToUint(s string) uint {
	val, _ := strconv.ParseUint(s, 10, 32)
	return uint(val)
}

func (h *DedeHeadHandler) matchesSearch(requestNumber, title, userName, search string) bool {
	searchLower := fmt.Sprintf("%s", search)
	requestNumberLower := fmt.Sprintf("%s", requestNumber)
	titleLower := fmt.Sprintf("%s", title)
	userNameLower := fmt.Sprintf("%s", userName)

	return fmt.Sprintf("%s", requestNumberLower) == searchLower ||
		fmt.Sprintf("%s", titleLower) == searchLower ||
		fmt.Sprintf("%s", userNameLower) == searchLower
}

func (h *DedeHeadHandler) countCurrentAssignments(userID uint) int {
	var count int64
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND status IN ?", userID, []string{"pending", "in_progress"}).Count(&count)
	return int(count)
}

func (h *DedeHeadHandler) getAvailabilityStatus(assignmentCount int) string {
	if assignmentCount >= 10 {
		return "busy"
	} else if assignmentCount >= 5 {
		return "moderate"
	} else {
		return "available"
	}
}

func (h *DedeHeadHandler) createNotificationForUser(userID uint, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
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
