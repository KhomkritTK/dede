package handler

import (
	"eservice-backend/config"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/dede_consults/dto"
	"eservice-backend/service/workflow/handler"
	"eservice-backend/utils"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DedeConsultsHandler struct {
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

func NewDedeConsultsHandler(db *gorm.DB, cfg *config.Config) *DedeConsultsHandler {
	return &DedeConsultsHandler{
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

// GetMyTasks returns tasks assigned to the current DEDE Consult
func (h *DedeConsultsHandler) GetMyTasks(c *gin.Context) {
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

	// Get assigned tasks
	var tasks []models.TaskAssignment
	query := h.db.Where("assigned_to_id = ? AND assigned_role = ?", userID.(uint), models.UserRole("dede_consult"))

	if status != "" {
		query = query.Where("status = ?", status)
	}

	err := query.Preload("RequestUser").Order("created_at DESC").Offset((page - 1) * limit).Limit(limit).Find(&tasks).Error
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to get tasks", err)
		return
	}

	// Count total
	var total int64
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ?", userID.(uint), models.UserRole("dede_consult")).Count(&total)
	if status != "" {
		h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND status = ?", userID.(uint), models.UserRole("dede_consult"), status).Count(&total)
	}

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

// ScheduleAppointment schedules an appointment with the factory
func (h *DedeConsultsHandler) ScheduleAppointment(c *gin.Context) {
	taskID := c.Param("taskId")

	var req dto.ScheduleAppointmentRequest
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

	// Get task
	var task models.TaskAssignment
	err := h.db.Where("id = ? AND assigned_to_id = ?", h.stringToUint(taskID), userID.(uint)).First(&task).Error
	if err != nil {
		utils.ErrorNotFound(c, "Task not found", err)
		return
	}

	// Update task
	task.AppointmentDate = &req.AppointmentDate
	task.Status = models.TaskStatusInProgress
	task.Comments = req.Comments
	err = h.db.Save(&task).Error
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to schedule appointment", err)
		return
	}

	// Update request status
	h.updateRequestStatus(task.RequestID, task.LicenseType, models.StatusAppointment)

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: task.RequestID,
		PreviousStatus:   &[]models.RequestStatus{models.StatusAssigned}[0],
		NewStatus:        models.StatusAppointment,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     fmt.Sprintf("Appointment scheduled for %s", req.AppointmentDate.Format("2006-01-02 15:04")),
		LicenseType:      task.LicenseType,
	}

	h.serviceFlowLogRepo.Create(flowLog)

	// Create deadline reminder
	h.createDeadlineReminder(task.RequestID, task.LicenseType, models.DeadlineTypeAppointment, req.AppointmentDate, userID.(uint))

	// Create notification for factory
	requestDetails := h.getRequestDetails(task.RequestID, task.LicenseType)
	if requestDetails != nil && requestDetails["user_id"] != nil {
		h.createNotificationForUser(
			requestDetails["user_id"].(uint),
			"นัดหมายตรวจสอบระบบ",
			fmt.Sprintf("นัดหมายตรวจสอบระบบในวันที่ %s เวลา %s",
				req.AppointmentDate.Format("2006-01-02"),
				req.AppointmentDate.Format("15:04")),
			models.NotificationType("appointment_scheduled"),
			models.PriorityNormal,
			"license_request",
			task.RequestID,
			"/dashboard/licenses",
		)
	}

	utils.SuccessOK(c, "Appointment scheduled successfully", nil)
}

// StartInspection starts the inspection process
func (h *DedeConsultsHandler) StartInspection(c *gin.Context) {
	taskID := c.Param("taskId")

	var req dto.StartInspectionRequest
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

	// Get task
	var task models.TaskAssignment
	err := h.db.Where("id = ? AND assigned_to_id = ?", h.stringToUint(taskID), userID.(uint)).First(&task).Error
	if err != nil {
		utils.ErrorNotFound(c, "Task not found", err)
		return
	}

	// Update task
	task.Status = models.TaskStatusInProgress
	task.Comments = req.Comments
	err = h.db.Save(&task).Error
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to start inspection", err)
		return
	}

	// Update request status
	h.updateRequestStatus(task.RequestID, task.LicenseType, models.StatusInspecting)

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: task.RequestID,
		PreviousStatus:   &[]models.RequestStatus{models.StatusAppointment}[0],
		NewStatus:        models.StatusInspecting,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     "Inspection started",
		LicenseType:      task.LicenseType,
	}

	h.serviceFlowLogRepo.Create(flowLog)

	// Create notification for DEDE Staff
	h.createNotificationForRole(
		models.UserRole("dede_staff"),
		"การตรวจสอบเริ่มต้นแล้ว",
		fmt.Sprintf("การตรวจสอบสำหรับคำขอเลขที่ %d เริ่มต้นแล้ว", task.RequestID),
		models.NotificationType("inspection_started"),
		models.PriorityNormal,
		"license_request",
		task.RequestID,
		"/admin-portal/services",
	)

	utils.SuccessOK(c, "Inspection started successfully", nil)
}

// CompleteInspection completes the inspection process
func (h *DedeConsultsHandler) CompleteInspection(c *gin.Context) {
	taskID := c.Param("taskId")

	var req dto.CompleteInspectionRequest
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

	// Get task
	var task models.TaskAssignment
	err := h.db.Where("id = ? AND assigned_to_id = ?", h.stringToUint(taskID), userID.(uint)).First(&task).Error
	if err != nil {
		utils.ErrorNotFound(c, "Task not found", err)
		return
	}

	// Update task
	task.Status = models.TaskStatusCompleted
	task.Comments = req.Comments
	err = h.db.Save(&task).Error
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to complete inspection", err)
		return
	}

	// Update request status
	h.updateRequestStatus(task.RequestID, task.LicenseType, models.StatusInspectionDone)

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: task.RequestID,
		PreviousStatus:   &[]models.RequestStatus{models.StatusInspecting}[0],
		NewStatus:        models.StatusInspectionDone,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     "Inspection completed",
		LicenseType:      task.LicenseType,
	}

	h.serviceFlowLogRepo.Create(flowLog)

	// Create audit report version
	auditReportVersion := &models.AuditReportVersion{
		ReportID:         0, // Will be created later
		VersionNumber:    1,
		Title:            fmt.Sprintf("รายงานตรวจสอบคำขอเลขที่ %d", task.RequestID),
		Findings:         req.Findings,
		Recommendations:  req.Recommendations,
		ComplianceStatus: req.ComplianceStatus,
		RiskLevel:        req.RiskLevel,
		Status:           models.ReportStatusDraft,
		SubmittedByID:    userID.(uint),
	}

	h.db.Create(auditReportVersion)

	// Create notification for DEDE Staff
	h.createNotificationForRole(
		models.UserRole("dede_staff"),
		"การตรวจสอบเสร็จสิ้น",
		fmt.Sprintf("การตรวจสอบสำหรับคำขอเลขที่ %d เสร็จสิ้น รอการตรวจสอบรายงาน", task.RequestID),
		models.NotificationType("inspection_completed"),
		models.PriorityNormal,
		"license_request",
		task.RequestID,
		"/admin-portal/services",
	)

	utils.SuccessOK(c, "Inspection completed successfully", nil)
}

// SubmitAuditReport submits an audit report
func (h *DedeConsultsHandler) SubmitAuditReport(c *gin.Context) {
	taskID := c.Param("taskId")

	var req dto.SubmitAuditReportRequest
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

	// Get task
	var task models.TaskAssignment
	err := h.db.Where("id = ? AND assigned_to_id = ?", h.stringToUint(taskID), userID.(uint)).First(&task).Error
	if err != nil {
		utils.ErrorNotFound(c, "Task not found", err)
		return
	}

	// Create or update audit report version
	auditReportVersion := &models.AuditReportVersion{
		ReportID:         0, // Will be created later
		VersionNumber:    1,
		Title:            req.Title,
		Content:          req.Content,
		Findings:         req.Findings,
		Recommendations:  req.Recommendations,
		ComplianceStatus: req.ComplianceStatus,
		RiskLevel:        req.RiskLevel,
		Status:           models.ReportStatusSubmitted,
		SubmittedByID:    userID.(uint),
	}

	// Set file attachments
	if len(req.FileAttachments) > 0 {
		auditReportVersion.SetFileAttachments(req.FileAttachments)
	}

	err = h.db.Create(auditReportVersion).Error
	if err != nil {
		utils.ErrorInternalServerError(c, "Failed to submit audit report", err)
		return
	}

	// Update request status
	h.updateRequestStatus(task.RequestID, task.LicenseType, models.StatusDocumentEdit)

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: task.RequestID,
		PreviousStatus:   &[]models.RequestStatus{models.StatusInspectionDone}[0],
		NewStatus:        models.StatusDocumentEdit,
		ChangedBy:        &[]uint{userID.(uint)}[0],
		ChangeReason:     "Audit report submitted",
		LicenseType:      task.LicenseType,
	}

	h.serviceFlowLogRepo.Create(flowLog)

	// Create deadline reminder for document review
	deadline := time.Now().AddDate(0, 0, 14) // 14 days from now
	h.createDeadlineReminder(task.RequestID, task.LicenseType, models.DeadlineTypeDocumentReview, deadline, userID.(uint))

	// Create notification for DEDE Staff
	h.createNotificationForRole(
		models.UserRole("dede_staff"),
		"รายงานตรวจสอบสำหรับพิจารณา",
		fmt.Sprintf("รายงานตรวจสอบสำหรับคำขอเลขที่ %d ส่งเพื่อพิจารณา", task.RequestID),
		models.NotificationType("report_submitted"),
		models.PriorityNormal,
		"license_request",
		task.RequestID,
		"/admin-portal/services",
	)

	utils.SuccessOK(c, "Audit report submitted successfully", nil)
}

// GetDashboardStats returns dashboard statistics for DEDE Consult
func (h *DedeConsultsHandler) GetDashboardStats(c *gin.Context) {
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
		ThisWeekTasks   int64 `json:"this_week_tasks"`
		ThisMonthTasks  int64 `json:"this_month_tasks"`
	}

	// Count tasks by status
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ?", userID.(uint), models.UserRole("dede_consult")).Count(&stats.TotalTasks)
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND status = ?", userID.(uint), models.UserRole("dede_consult"), models.TaskStatusPending).Count(&stats.PendingTasks)
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND status = ?", userID.(uint), models.UserRole("dede_consult"), models.TaskStatusInProgress).Count(&stats.InProgressTasks)
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND status = ?", userID.(uint), models.UserRole("dede_consult"), models.TaskStatusCompleted).Count(&stats.CompletedTasks)
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND status = ?", userID.(uint), models.UserRole("dede_consult"), models.TaskStatusOverdue).Count(&stats.OverdueTasks)

	// Count tasks this week
	weekStart := time.Now().AddDate(0, 0, -int(time.Now().Weekday()))
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND created_at >= ?", userID.(uint), models.UserRole("dede_consult"), weekStart).Count(&stats.ThisWeekTasks)

	// Count tasks this month
	monthStart := time.Now().AddDate(0, 0, -time.Now().Day()+1)
	h.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND assigned_role = ? AND created_at >= ?", userID.(uint), models.UserRole("dede_consult"), monthStart).Count(&stats.ThisMonthTasks)

	utils.SuccessOK(c, "Dashboard statistics retrieved successfully", stats)
}

// Helper functions

func (h *DedeConsultsHandler) stringToUint(s string) uint {
	val, _ := strconv.ParseUint(s, 10, 32)
	return uint(val)
}

func (h *DedeConsultsHandler) getRequestDetails(requestID uint, licenseType string) map[string]interface{} {
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

func (h *DedeConsultsHandler) updateRequestStatus(requestID uint, licenseType string, status models.RequestStatus) {
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

func (h *DedeConsultsHandler) createDeadlineReminder(requestID uint, licenseType string, deadlineType models.DeadlineType, deadlineDate time.Time, userID uint) {
	reminder := &models.DeadlineReminder{
		RequestID:    requestID,
		LicenseType:  licenseType,
		DeadlineType: deadlineType,
		DeadlineDate: deadlineDate,
		AssignedToID: &userID,
		Status:       models.DeadlineReminderStatusActive,
	}

	h.db.Create(reminder)
}

func (h *DedeConsultsHandler) createNotificationForUser(userID uint, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
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

func (h *DedeConsultsHandler) createNotificationForRole(role models.UserRole, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
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
