package handler

import (
	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/dede_staff/dto"
	"eservice-backend/service/workflow/handler"
	"eservice-backend/utils"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DedeStaffHandler struct {
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

func NewDedeStaffHandler(db *gorm.DB, cfg *config.Config) *DedeStaffHandler {
	return &DedeStaffHandler{
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

// GetMyTasks returns tasks assigned to the current DEDE Staff
func (h *DedeStaffHandler) GetMyTasks(c *gin.Context) {
	// Get current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	// Get query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")
	taskType := c.Query("task_type") // "review", "inspection", "approval"

	// Get assigned tasks
	var tasks []models.TaskAssignment
	query := h.db.Where("assigned_to_id = ? AND assigned_role = ?", userID.(uint), models.UserRole("dede_staff"))

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if taskType != "" {
		query = query.Where("task_type = ?", taskType)
	}

	err := query.Preload("RequestUser").Order("created_at DESC").Offset((page - 1) * limit).Limit(limit).Find(&tasks).Error
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to get tasks", err)
		return
	}

	// Count total
	var total int64
	countQuery := h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ?", userID.(uint), models.UserRole("dede_staff"))
	if status != "" {
		countQuery = countQuery.Where("status = ?", status)
	}
	if taskType != "" {
		countQuery = countQuery.Where("task_type = ?", taskType)
	}
	countQuery.Count(&total)

	// Format response
	var taskList []map[string]interface{}
	for _, task := range tasks {
		taskList = append(taskList, map[string]interface{}{
			"id":               task.ID,
			"request_id":       task.RequestID,
			"license_type":     task.LicenseType,
			"task_type":        string(task.TaskType),
			"status":           string(task.Status),
			"priority":         string(task.Priority),
			"deadline":         task.Deadline,
			"appointment_date": task.AppointmentDate,
			"assigned_at":      task.CreatedAt,
			"comments":         task.Comments,
			"request_details":  h.getRequestDetails(task.RequestID, task.LicenseType),
		})
	}

	response := gin.H{
		"tasks": taskList,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	}

	utils.SuccessOK(c, "Tasks retrieved successfully", response)
}

// GetReportsToReview returns audit reports that need review
func (h *DedeStaffHandler) GetReportsToReview(c *gin.Context) {
	// Get query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")

	// Get audit reports to review
	var reports []models.AuditReportVersion
	query := h.db.Where("status IN ?", []string{"submitted", "under_review"})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	err := query.Preload("SubmittedBy").Order("created_at DESC").Offset((page - 1) * limit).Limit(limit).Find(&reports).Error
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to get reports", err)
		return
	}

	// Count total
	var total int64
	countQuery := h.db.Model(&models.AuditReportVersion{}).Where("status IN ?", []string{"submitted", "under_review"})
	if status != "" {
		countQuery = countQuery.Where("status = ?", status)
	}
	countQuery.Count(&total)

	// Format response
	var reportList []map[string]interface{}
	for _, report := range reports {
		reportList = append(reportList, map[string]interface{}{
			"id":                report.ID,
			"version_number":    report.VersionNumber,
			"title":             report.Title,
			"findings":          report.Findings,
			"recommendations":   report.Recommendations,
			"compliance_status": report.ComplianceStatus,
			"risk_level":        report.RiskLevel,
			"status":            string(report.Status),
			"submitted_by":      report.SubmittedBy,
			"submitted_at":      report.CreatedAt,
			"file_attachments":  report.GetFileAttachments(),
		})
	}

	response := gin.H{
		"reports": reportList,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	}

	utils.SuccessOK(c, "Reports retrieved successfully", response)
}

// ReviewAuditReport reviews an audit report
func (h *DedeStaffHandler) ReviewAuditReport(c *gin.Context) {
	reportID := c.Param("reportId")

	var req dto.ReviewAuditReportRequest
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

	// Get report
	var report models.AuditReportVersion
	err := h.db.Where("id = ?", h.stringToUint(reportID)).First(&report).Error
	if err != nil {
		utils.ErrorNotFound(c, "Report not found", err)
		return
	}

	// Update report
	report.Status = models.ReportStatus(req.Status)
	report.ReviewComments = req.Comments
	report.ReviewedByID = &[]uint{userID.(uint)}[0]

	if req.Status == "approved" {
		report.ApprovedByID = &[]uint{userID.(uint)}[0]
	} else if req.Status == "rejected" {
		report.RejectionReason = req.Reason
	} else if req.Status == "needs_edit" {
		report.RejectionReason = req.Reason
	}

	err = h.db.Save(&report).Error
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to review report", err)
		return
	}

	// Update request status based on report review
	if req.Status == "approved" {
		h.updateRequestStatus(report.ReportID, "new", models.StatusReportApproved)
	} else if req.Status == "rejected" || req.Status == "needs_edit" {
		h.updateRequestStatus(report.ReportID, "new", models.StatusReturned)
	}

	// Create service flow log
	var newStatus models.RequestStatus
	if req.Status == "approved" {
		newStatus = models.StatusReportApproved
	} else {
		newStatus = models.StatusReturned
	}

	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: report.ReportID,
		PreviousStatus:   &[]models.RequestStatus{models.StatusDocumentEdit}[0],
		NewStatus:        newStatus,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     req.Comments,
		LicenseType:      "new",
	}

	h.serviceFlowLogRepo.Create(flowLog)

	// Create notification for DEDE Consult
	h.createNotificationForUser(
		report.SubmittedByID,
		"รายงานตรวจสอบได้รับการตรวจสอบแล้ว",
		fmt.Sprintf("รายงานตรวจสอบ %s ได้รับการตรวจสอบแล้ว: %s", report.Title, req.Status),
		models.NotificationType("report_reviewed"),
		models.PriorityNormal,
		"audit_report",
		report.ID,
		"/admin-portal/services",
	)

	// If approved, create notification for DEDE Head
	if req.Status == "approved" {
		h.createNotificationForRole(
			models.UserRole("dede_head"),
			"รายงานตรวจสอบได้รับการอนุมัติ",
			fmt.Sprintf("รายงานตรวจสอบ %s ได้รับการอนุมัติแล้ว รอการอนุมัติสุดท้าย", report.Title),
			models.NotificationType("report_approved"),
			models.PriorityNormal,
			"audit_report",
			report.ID,
			"/admin-portal/services",
		)
	}

	utils.SuccessOK(c, "Report reviewed successfully", nil)
}

// FinalApproveRequest provides final approval for a request
func (h *DedeStaffHandler) FinalApproveRequest(c *gin.Context) {
	requestID := c.Param("requestId")
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
		idInt, _ := strconv.ParseInt(requestID, 10, 64)
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
		idInt, _ := strconv.ParseInt(requestID, 10, 64)
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
		idInt, _ := strconv.ParseInt(requestID, 10, 64)
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
		idInt, _ := strconv.ParseInt(requestID, 10, 64)
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
		LicenseRequestID: uint(h.stringToUint(requestID)),
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
		uint(h.stringToUint(requestID)),
		"/dashboard/licenses",
	)

	utils.SuccessOK(c, "Request approved successfully", nil)
}

// GetOverdueRequests returns overdue requests that need attention
func (h *DedeStaffHandler) GetOverdueRequests(c *gin.Context) {
	// Get query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	// Get overdue deadline reminders
	var reminders []models.DeadlineReminder
	query := h.db.Where("status = ? AND deadline_date < ?", models.DeadlineReminderStatusActive, time.Now())

	err := query.Preload("AssignedTo").Order("deadline_date ASC").Offset((page - 1) * limit).Limit(limit).Find(&reminders).Error
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to get overdue requests", err)
		return
	}

	// Count total
	var total int64
	h.db.Model(&models.DeadlineReminder{}).Where("status = ? AND deadline_date < ?", models.DeadlineReminderStatusActive, time.Now()).Count(&total)

	// Format response
	var overdueList []map[string]interface{}
	for _, reminder := range reminders {
		overdueList = append(overdueList, map[string]interface{}{
			"id":              reminder.ID,
			"request_id":      reminder.RequestID,
			"license_type":    reminder.LicenseType,
			"deadline_type":   string(reminder.DeadlineType),
			"deadline_date":   reminder.DeadlineDate,
			"assigned_to":     reminder.AssignedTo,
			"days_overdue":    int(time.Now().Sub(reminder.DeadlineDate).Hours() / 24),
			"request_details": h.getRequestDetails(reminder.RequestID, reminder.LicenseType),
		})
	}

	response := gin.H{
		"overdue_requests": overdueList,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	}

	utils.SuccessOK(c, "Overdue requests retrieved successfully", response)
}

// GetDashboardStats returns dashboard statistics for DEDE Staff
func (h *DedeStaffHandler) GetDashboardStats(c *gin.Context) {
	// Get current user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorUnauthorized(c, "User not authenticated", nil)
		return
	}

	var stats struct {
		TotalTasks      int64 `json:"total_tasks"`
		PendingTasks    int64 `json:"pending_tasks"`
		InProgressTasks int64 `json:"in_progress_tasks"`
		CompletedTasks  int64 `json:"completed_tasks"`
		OverdueTasks    int64 `json:"overdue_tasks"`
		ReportsToReview int64 `json:"reports_to_review"`
		ThisWeekTasks   int64 `json:"this_week_tasks"`
		ThisMonthTasks  int64 `json:"this_month_tasks"`
	}

	// Count tasks by status
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ?", userID.(uint), models.UserRole("dede_staff")).Count(&stats.TotalTasks)
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND status = ?", userID.(uint), models.UserRole("dede_staff"), models.TaskStatusPending).Count(&stats.PendingTasks)
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND status = ?", userID.(uint), models.UserRole("dede_staff"), models.TaskStatusInProgress).Count(&stats.InProgressTasks)
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND status = ?", userID.(uint), models.UserRole("dede_staff"), models.TaskStatusCompleted).Count(&stats.CompletedTasks)
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND status = ?", userID.(uint), models.UserRole("dede_staff"), models.TaskStatusOverdue).Count(&stats.OverdueTasks)

	// Count reports to review
	h.db.Model(&models.AuditReportVersion{}).Where("status IN ?", []string{"submitted", "under_review"}).Count(&stats.ReportsToReview)

	// Count tasks this week
	weekStart := time.Now().AddDate(0, 0, -int(time.Now().Weekday()))
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND created_at >= ?", userID.(uint), models.UserRole("dede_staff"), weekStart).Count(&stats.ThisWeekTasks)

	// Count tasks this month
	monthStart := time.Now().AddDate(0, 0, -time.Now().Day()+1)
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND created_at >= ?", userID.(uint), models.UserRole("dede_staff"), monthStart).Count(&stats.ThisMonthTasks)

	utils.SuccessOK(c, "Dashboard statistics retrieved successfully", stats)
}

// Helper functions

func (h *DedeStaffHandler) stringToUint(s string) uint {
	val, _ := strconv.ParseUint(s, 10, 32)
	return uint(val)
}

func (h *DedeStaffHandler) getRequestDetails(requestID uint, licenseType string) map[string]interface{} {
	switch licenseType {
	case "new":
		request, err := h.newLicenseRepo.GetByID(requestID)
		if err != nil {
			return nil
		}
		return map[string]interface{}{
			"id":             request.ID,
			"request_number": request.RequestNumber,
			"project_name":   request.ProjectName,
			"user_id":        request.UserID,
			"user_full_name": request.User.FullName,
		}
	case "renewal":
		request, err := h.renewalLicenseRepo.GetByID(requestID)
		if err != nil {
			return nil
		}
		return map[string]interface{}{
			"id":             request.ID,
			"request_number": request.RequestNumber,
			"project_name":   request.ProjectName,
			"user_id":        request.UserID,
			"user_full_name": request.User.FullName,
		}
	case "extension":
		request, err := h.extensionLicenseRepo.GetByID(requestID)
		if err != nil {
			return nil
		}
		return map[string]interface{}{
			"id":             request.ID,
			"request_number": request.RequestNumber,
			"project_name":   request.ProjectName,
			"user_id":        request.UserID,
			"user_full_name": request.User.FullName,
		}
	case "reduction":
		request, err := h.reductionLicenseRepo.GetByID(requestID)
		if err != nil {
			return nil
		}
		return map[string]interface{}{
			"id":             request.ID,
			"request_number": request.RequestNumber,
			"project_name":   request.ProjectName,
			"user_id":        request.UserID,
			"user_full_name": request.User.FullName,
		}
	}
	return nil
}

func (h *DedeStaffHandler) updateRequestStatus(requestID uint, licenseType string, status models.RequestStatus) {
	switch licenseType {
	case "new":
		request, _ := h.newLicenseRepo.GetByID(requestID)
		if request != nil {
			request.Status = status
			h.db.Save(request)
		}
	case "renewal":
		request, _ := h.renewalLicenseRepo.GetByID(requestID)
		if request != nil {
			request.Status = status
			h.db.Save(request)
		}
	case "extension":
		request, _ := h.extensionLicenseRepo.GetByID(requestID)
		if request != nil {
			request.Status = status
			h.db.Save(request)
		}
	case "reduction":
		request, _ := h.reductionLicenseRepo.GetByID(requestID)
		if request != nil {
			request.Status = status
			h.db.Save(request)
		}
	}
}

func (h *DedeStaffHandler) createNotificationForUser(userID uint, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
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

func (h *DedeStaffHandler) createNotificationForRole(role models.UserRole, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
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
