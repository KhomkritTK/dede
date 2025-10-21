package service

import (
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/workflow/dto"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type WorkflowTransitionService interface {
	ProcessTransition(req dto.WorkflowTransitionRequest) error
	ValidateTransition(fromStatus, toStatus models.RequestStatus, userID uint, userRole models.UserRole) (bool, error)
	GetValidTransitions(currentStatus models.RequestStatus, role models.UserRole) []models.WorkflowTransition
	GetWorkflowHistory(requestID uint) ([]models.ServiceFlowLog, error)
}

type workflowTransitionService struct {
	db                   *gorm.DB
	stateMachine         *models.WorkflowStateMachine
	newLicenseRepo       repository.NewLicenseRepo
	renewalLicenseRepo   repository.RenewalLicenseRepo
	extensionLicenseRepo repository.ExtensionLicenseRepo
	reductionLicenseRepo repository.ReductionLicenseRepo
	notificationRepo     repository.NotificationRepository
	serviceFlowLogRepo   repository.ServiceFlowLogRepo
}

func NewWorkflowTransitionService(db *gorm.DB) WorkflowTransitionService {
	return &workflowTransitionService{
		db:                   db,
		stateMachine:         models.NewWorkflowStateMachine(),
		newLicenseRepo:       repository.NewNewLicenseRepo(db),
		renewalLicenseRepo:   repository.NewRenewalLicenseRepo(db),
		extensionLicenseRepo: repository.NewExtensionLicenseRepo(db),
		reductionLicenseRepo: repository.NewReductionLicenseRepo(db),
		notificationRepo:     repository.NewNotificationRepository(db),
		serviceFlowLogRepo:   repository.NewServiceFlowLogRepo(db),
	}
}

func (s *workflowTransitionService) ProcessTransition(req dto.WorkflowTransitionRequest) error {
	// Validate transition
	transitionReq := models.TransitionRequest{
		FromStatus:   req.FromStatus,
		ToStatus:     req.ToStatus,
		UserID:       req.UserID,
		UserRole:     req.UserRole,
		Comments:     req.Comments,
		AutoApproved: req.AutoApproved,
	}

	if err := s.stateMachine.ValidateTransitionRequest(transitionReq); err != nil {
		return fmt.Errorf("invalid transition: %w", err)
	}

	// Process the transition based on license type
	switch req.LicenseType {
	case "new":
		return s.processNewLicenseTransition(req)
	case "renewal":
		return s.processRenewalLicenseTransition(req)
	case "extension":
		return s.processExtensionLicenseTransition(req)
	case "reduction":
		return s.processReductionLicenseTransition(req)
	default:
		return fmt.Errorf("unsupported license type: %s", req.LicenseType)
	}
}

func (s *workflowTransitionService) ValidateTransition(fromStatus, toStatus models.RequestStatus, userID uint, userRole models.UserRole) (bool, error) {
	transitionReq := models.TransitionRequest{
		FromStatus: fromStatus,
		ToStatus:   toStatus,
		UserID:     userID,
		UserRole:   userRole,
		Comments:   "",
	}

	if err := s.stateMachine.ValidateTransitionRequest(transitionReq); err != nil {
		return false, err
	}

	return true, nil
}

func (s *workflowTransitionService) GetValidTransitions(currentStatus models.RequestStatus, role models.UserRole) []models.WorkflowTransition {
	return s.stateMachine.GetValidTransitions(currentStatus, role)
}

func (s *workflowTransitionService) GetWorkflowHistory(requestID uint) ([]models.ServiceFlowLog, error) {
	return s.serviceFlowLogRepo.GetByLicenseRequestID(requestID)
}

func (s *workflowTransitionService) processNewLicenseTransition(req dto.WorkflowTransitionRequest) error {
	request, err := s.newLicenseRepo.GetByID(req.RequestID)
	if err != nil {
		return fmt.Errorf("request not found: %w", err)
	}

	// Update request status
	request.Status = req.ToStatus
	request.Notes = req.Comments
	request.Deadline = s.calculateDeadline(req.ToStatus, time.Now())

	// Handle specific transition logic
	if req.ToStatus == models.StatusAssigned {
		request.InspectorID = &req.AssignedToID
		request.AssignedByID = &[]uint{req.UserID}[0]
		now := time.Now()
		request.AssignedAt = &now
	}

	if req.ToStatus == models.StatusAppointment {
		if req.AppointmentDate != nil {
			request.AppointmentDate = req.AppointmentDate
		}
	}

	err = s.db.Save(request).Error
	if err != nil {
		return fmt.Errorf("failed to update request: %w", err)
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: req.RequestID,
		PreviousStatus:   &req.FromStatus,
		NewStatus:        req.ToStatus,
		ChangedBy:        &[]uint{req.UserID}[0],
		ChangeReason:     req.Comments,
		LicenseType:      req.LicenseType,
	}

	err = s.serviceFlowLogRepo.Create(flowLog)
	if err != nil {
		return fmt.Errorf("failed to create flow log: %w", err)
	}

	// Create task assignment if needed
	if req.ToStatus == models.StatusAssigned {
		taskAssignment := &models.TaskAssignment{
			RequestID:    req.RequestID,
			LicenseType:  req.LicenseType,
			AssignedToID: req.AssignedToID,
			AssignedByID: req.UserID,
			AssignedRole: req.UserRole,
			TaskType:     models.TaskTypeInspection,
			Status:       models.TaskStatusPending,
			Priority:     models.TaskPriorityNormal,
			Deadline:     request.Deadline,
			Comments:     req.Comments,
		}

		err = s.db.Create(taskAssignment).Error
		if err != nil {
			return fmt.Errorf("failed to create task assignment: %w", err)
		}
	}

	// Send notifications
	return s.sendTransitionNotifications(req, request)
}

func (s *workflowTransitionService) processRenewalLicenseTransition(req dto.WorkflowTransitionRequest) error {
	request, err := s.renewalLicenseRepo.GetByID(req.RequestID)
	if err != nil {
		return fmt.Errorf("request not found: %w", err)
	}

	// Update request status
	request.Status = req.ToStatus
	request.Notes = req.Comments
	request.Deadline = s.calculateDeadline(req.ToStatus, time.Now())

	// Handle specific transition logic
	if req.ToStatus == models.StatusAssigned {
		request.InspectorID = &req.AssignedToID
		request.AssignedByID = &[]uint{req.UserID}[0]
		now := time.Now()
		request.AssignedAt = &now
	}

	if req.ToStatus == models.StatusAppointment {
		if req.AppointmentDate != nil {
			request.AppointmentDate = req.AppointmentDate
		}
	}

	err = s.db.Save(request).Error
	if err != nil {
		return fmt.Errorf("failed to update request: %w", err)
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: req.RequestID,
		PreviousStatus:   &req.FromStatus,
		NewStatus:        req.ToStatus,
		ChangedBy:        &[]uint{req.UserID}[0],
		ChangeReason:     req.Comments,
		LicenseType:      req.LicenseType,
	}

	err = s.serviceFlowLogRepo.Create(flowLog)
	if err != nil {
		return fmt.Errorf("failed to create flow log: %w", err)
	}

	// Create task assignment if needed
	if req.ToStatus == models.StatusAssigned {
		taskAssignment := &models.TaskAssignment{
			RequestID:    req.RequestID,
			LicenseType:  req.LicenseType,
			AssignedToID: req.AssignedToID,
			AssignedByID: req.UserID,
			AssignedRole: req.UserRole,
			TaskType:     models.TaskTypeInspection,
			Status:       models.TaskStatusPending,
			Priority:     models.TaskPriorityNormal,
			Deadline:     request.Deadline,
			Comments:     req.Comments,
		}

		err = s.db.Create(taskAssignment).Error
		if err != nil {
			return fmt.Errorf("failed to create task assignment: %w", err)
		}
	}

	// Send notifications
	return s.sendTransitionNotifications(req, request)
}

func (s *workflowTransitionService) processExtensionLicenseTransition(req dto.WorkflowTransitionRequest) error {
	request, err := s.extensionLicenseRepo.GetByID(req.RequestID)
	if err != nil {
		return fmt.Errorf("request not found: %w", err)
	}

	// Update request status
	request.Status = req.ToStatus
	request.Notes = req.Comments
	request.Deadline = s.calculateDeadline(req.ToStatus, time.Now())

	// Handle specific transition logic
	if req.ToStatus == models.StatusAssigned {
		request.InspectorID = &req.AssignedToID
		request.AssignedByID = &[]uint{req.UserID}[0]
		now := time.Now()
		request.AssignedAt = &now
	}

	if req.ToStatus == models.StatusAppointment {
		if req.AppointmentDate != nil {
			request.AppointmentDate = req.AppointmentDate
		}
	}

	err = s.db.Save(request).Error
	if err != nil {
		return fmt.Errorf("failed to update request: %w", err)
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: req.RequestID,
		PreviousStatus:   &req.FromStatus,
		NewStatus:        req.ToStatus,
		ChangedBy:        &[]uint{req.UserID}[0],
		ChangeReason:     req.Comments,
		LicenseType:      req.LicenseType,
	}

	err = s.serviceFlowLogRepo.Create(flowLog)
	if err != nil {
		return fmt.Errorf("failed to create flow log: %w", err)
	}

	// Create task assignment if needed
	if req.ToStatus == models.StatusAssigned {
		taskAssignment := &models.TaskAssignment{
			RequestID:    req.RequestID,
			LicenseType:  req.LicenseType,
			AssignedToID: req.AssignedToID,
			AssignedByID: req.UserID,
			AssignedRole: req.UserRole,
			TaskType:     models.TaskTypeInspection,
			Status:       models.TaskStatusPending,
			Priority:     models.TaskPriorityNormal,
			Deadline:     request.Deadline,
			Comments:     req.Comments,
		}

		err = s.db.Create(taskAssignment).Error
		if err != nil {
			return fmt.Errorf("failed to create task assignment: %w", err)
		}
	}

	// Send notifications
	return s.sendTransitionNotifications(req, request)
}

func (s *workflowTransitionService) processReductionLicenseTransition(req dto.WorkflowTransitionRequest) error {
	request, err := s.reductionLicenseRepo.GetByID(req.RequestID)
	if err != nil {
		return fmt.Errorf("request not found: %w", err)
	}

	// Update request status
	request.Status = req.ToStatus
	request.Notes = req.Comments
	request.Deadline = s.calculateDeadline(req.ToStatus, time.Now())

	// Handle specific transition logic
	if req.ToStatus == models.StatusAssigned {
		request.InspectorID = &req.AssignedToID
		request.AssignedByID = &[]uint{req.UserID}[0]
		now := time.Now()
		request.AssignedAt = &now
	}

	if req.ToStatus == models.StatusAppointment {
		if req.AppointmentDate != nil {
			request.AppointmentDate = req.AppointmentDate
		}
	}

	err = s.db.Save(request).Error
	if err != nil {
		return fmt.Errorf("failed to update request: %w", err)
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: req.RequestID,
		PreviousStatus:   &req.FromStatus,
		NewStatus:        req.ToStatus,
		ChangedBy:        &[]uint{req.UserID}[0],
		ChangeReason:     req.Comments,
		LicenseType:      req.LicenseType,
	}

	err = s.serviceFlowLogRepo.Create(flowLog)
	if err != nil {
		return fmt.Errorf("failed to create flow log: %w", err)
	}

	// Create task assignment if needed
	if req.ToStatus == models.StatusAssigned {
		taskAssignment := &models.TaskAssignment{
			RequestID:    req.RequestID,
			LicenseType:  req.LicenseType,
			AssignedToID: req.AssignedToID,
			AssignedByID: req.UserID,
			AssignedRole: req.UserRole,
			TaskType:     models.TaskTypeInspection,
			Status:       models.TaskStatusPending,
			Priority:     models.TaskPriorityNormal,
			Deadline:     request.Deadline,
			Comments:     req.Comments,
		}

		err = s.db.Create(taskAssignment).Error
		if err != nil {
			return fmt.Errorf("failed to create task assignment: %w", err)
		}
	}

	// Send notifications
	return s.sendTransitionNotifications(req, request)
}

func (s *workflowTransitionService) calculateDeadline(status models.RequestStatus, startTime time.Time) *time.Time {
	// Define default deadlines based on status
	var days int
	switch status {
	case models.StatusNewRequest:
		days = 3
	case models.StatusForwarded:
		days = 5
	case models.StatusAssigned:
		days = 14
	case models.StatusAppointment:
		days = 7
	case models.StatusInspecting:
		days = 10
	case models.StatusDocumentEdit:
		days = 14
	default:
		return nil
	}

	if days > 0 {
		deadline := startTime.AddDate(0, 0, days)
		return &deadline
	}
	return nil
}

func (s *workflowTransitionService) sendTransitionNotifications(req dto.WorkflowTransitionRequest, request interface{}) error {
	var title, message string
	var recipientID *uint
	var recipientRole *models.UserRole

	switch req.ToStatus {
	case models.StatusNewRequest:
		title = "คำขอใหม่"
		message = fmt.Sprintf("คำขอเลขที่ %d ได้รับการส่งเข้าระบบแล้ว", req.RequestID)
		recipientRole = &[]models.UserRole{models.UserRole("admin")}[0]

	case models.StatusAccepted:
		title = "คำขอได้รับการอนุมัติเบื้องต้น"
		message = fmt.Sprintf("คำขอเลขที่ %d ได้รับการอนุมัติเบื้องต้น", req.RequestID)
		recipientRole = &[]models.UserRole{models.UserRole("admin")}[0]

	case models.StatusForwarded:
		title = "คำขอถูกส่งต่อ"
		message = fmt.Sprintf("คำขอเลขที่ %d ถูกส่งต่อให้ DEDE Head", req.RequestID)
		recipientRole = &[]models.UserRole{models.UserRole("dede_head")}[0]

	case models.StatusAssigned:
		title = "มอบหมายงาน"
		message = fmt.Sprintf("คำขอเลขที่ %d ถูกมอบหมายให้ดำเนินการ", req.RequestID)
		recipientID = &req.AssignedToID

	case models.StatusAppointment:
		title = "นัดหมายตรวจสอบ"
		message = fmt.Sprintf("คำขอเลขที่ %d มีการนัดหมายตรวจสอบ", req.RequestID)
		recipientID = &req.AssignedToID

	case models.StatusDocumentEdit:
		title = "ส่งรายงานตรวจสอบ"
		message = fmt.Sprintf("คำขอเลขที่ %d มีรายงานตรวจสอบสำหรับพิจารณา", req.RequestID)
		recipientRole = &[]models.UserRole{models.UserRole("dede_staff")}[0]

	case models.StatusApproved:
		title = "อนุมัติคำขอ"
		message = fmt.Sprintf("คำขอเลขที่ %d ได้รับการอนุมัติแล้ว", req.RequestID)
		// Get the original user ID from the request
		if req.LicenseType == "new" {
			if request, ok := request.(*models.NewLicenseRequest); ok {
				recipientID = &request.UserID
			}
		}

	case models.StatusRejected:
		title = "ปฏิเสธคำขอ"
		message = fmt.Sprintf("คำขอเลขที่ %d ถูกปฏิเสธ", req.RequestID)
		// Get the original user ID from the request
		if req.LicenseType == "new" {
			if request, ok := request.(*models.NewLicenseRequest); ok {
				recipientID = &request.UserID
			}
		}

	case models.StatusReturned:
		title = "ตีกลับเอกสาร"
		message = fmt.Sprintf("คำขอเลขที่ %d ต้องมีการแก้ไขเอกสาร", req.RequestID)
		// Get the original user ID from the request
		if req.LicenseType == "new" {
			if request, ok := request.(*models.NewLicenseRequest); ok {
				recipientID = &request.UserID
			}
		}
	}

	// Create notification
	notification := &models.Notification{
		Title:         title,
		Message:       message,
		Type:          models.NotificationType("request_assigned"),
		Priority:      models.PriorityNormal,
		RecipientID:   recipientID,
		RecipientRole: recipientRole,
		EntityType:    "license_request",
		EntityID:      &req.RequestID,
		ActionURL:     fmt.Sprintf("/admin-portal/services/%d", req.RequestID),
	}

	return s.notificationRepo.Create(notification)
}
