package service

import (
	"eservice-backend/models"
	"eservice-backend/repository"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

type OverdueService interface {
	CheckOverdueRequests() error
	ProcessOverdueRequest(requestID uint, licenseType string) error
	SendOverdueNotifications() error
	GetOverdueStatistics() (map[string]interface{}, error)
}

type overdueService struct {
	db                   *gorm.DB
	newLicenseRepo       repository.NewLicenseRepo
	renewalLicenseRepo   repository.RenewalLicenseRepo
	extensionLicenseRepo repository.ExtensionLicenseRepo
	reductionLicenseRepo repository.ReductionLicenseRepo
	notificationRepo     repository.NotificationRepository
	serviceFlowLogRepo   repository.ServiceFlowLogRepo
	deadlineReminderRepo *gorm.DB
}

func NewOverdueService(db *gorm.DB) OverdueService {
	return &overdueService{
		db:                   db,
		newLicenseRepo:       repository.NewNewLicenseRepo(db),
		renewalLicenseRepo:   repository.NewRenewalLicenseRepo(db),
		extensionLicenseRepo: repository.NewExtensionLicenseRepo(db),
		reductionLicenseRepo: repository.NewReductionLicenseRepo(db),
		notificationRepo:     repository.NewNotificationRepository(db),
		serviceFlowLogRepo:   repository.NewServiceFlowLogRepo(db),
		deadlineReminderRepo: db,
	}
}

// CheckOverdueRequests checks all requests for overdue status
func (s *overdueService) CheckOverdueRequests() error {
	log.Println("Checking for overdue requests...")

	// Check for overdue appointments
	if err := s.checkOverdueAppointments(); err != nil {
		return fmt.Errorf("failed to check overdue appointments: %w", err)
	}

	// Check for overdue document reviews (14+ days)
	if err := s.checkOverdueDocumentReviews(); err != nil {
		return fmt.Errorf("failed to check overdue document reviews: %w", err)
	}

	// Check for overdue tasks
	if err := s.checkOverdueTasks(); err != nil {
		return fmt.Errorf("failed to check overdue tasks: %w", err)
	}

	log.Println("Overdue check completed successfully")
	return nil
}

// ProcessOverdueRequest processes a specific overdue request
func (s *overdueService) ProcessOverdueRequest(requestID uint, licenseType string) error {
	var userID uint
	var requestNumber string
	var currentStatus models.RequestStatus

	switch licenseType {
	case "new":
		req, err := s.newLicenseRepo.GetByID(requestID)
		if err != nil {
			return fmt.Errorf("request not found: %w", err)
		}
		userID = req.UserID
		requestNumber = req.RequestNumber
		currentStatus = req.Status

	case "renewal":
		req, err := s.renewalLicenseRepo.GetByID(requestID)
		if err != nil {
			return fmt.Errorf("request not found: %w", err)
		}
		userID = req.UserID
		requestNumber = req.RequestNumber
		currentStatus = req.Status

	case "extension":
		req, err := s.extensionLicenseRepo.GetByID(requestID)
		if err != nil {
			return fmt.Errorf("request not found: %w", err)
		}
		userID = req.UserID
		requestNumber = req.RequestNumber
		currentStatus = req.Status

	case "reduction":
		req, err := s.reductionLicenseRepo.GetByID(requestID)
		if err != nil {
			return fmt.Errorf("request not found: %w", err)
		}
		userID = req.UserID
		requestNumber = req.RequestNumber
		currentStatus = req.Status

	default:
		return fmt.Errorf("unsupported license type: %s", licenseType)
	}

	// Update request status to Overdue
	if err := s.updateRequestStatusToOverdue(requestID, licenseType); err != nil {
		return fmt.Errorf("failed to update request status: %w", err)
	}

	// Create service flow log
	flowLog := &models.ServiceFlowLog{
		LicenseRequestID: requestID,
		PreviousStatus:   &currentStatus,
		NewStatus:        models.StatusOverdue,
		ChangedBy:        nil, // System change
		ChangeReason:     "Auto-cancelled due to timeout",
		LicenseType:      licenseType,
	}

	if err := s.serviceFlowLogRepo.Create(flowLog); err != nil {
		log.Printf("Failed to create flow log for request %d: %v", requestID, err)
	}

	// Create notification for user
	notification := &models.Notification{
		Title:       "คำขอหมดอายุเนื่องจากเกินกำหนดเวลา",
		Message:     fmt.Sprintf("คำขอเลขที่ %s ถูกยกเลิกโดยอัตโนมัติเนื่องจากเกินกำหนดเวลาดำเนินการ", requestNumber),
		Type:        models.NotificationType("request_overdue"),
		Priority:    models.PriorityHigh,
		RecipientID: &userID,
		EntityType:  "license_request",
		EntityID:    &requestID,
		ActionURL:   "/dashboard/licenses",
	}

	if err := s.notificationRepo.Create(notification); err != nil {
		log.Printf("Failed to create notification for user %d: %v", userID, err)
	}

	// Create notification for admins
	adminNotification := &models.Notification{
		Title:         "คำขอถูกยกเลิกโดยอัตโนมัติ",
		Message:       fmt.Sprintf("คำขอเลขที่ %s ถูกยกเลิกโดยอัตโนมัติเนื่องจากเกินกำหนดเวลา", requestNumber),
		Type:          models.NotificationType("request_overdue"),
		Priority:      models.PriorityHigh,
		RecipientRole: &[]models.UserRole{models.UserRole("admin")}[0],
		EntityType:    "license_request",
		EntityID:      &requestID,
		ActionURL:     "/admin-portal/services",
	}

	if err := s.notificationRepo.Create(adminNotification); err != nil {
		log.Printf("Failed to create notification for admins: %v", err)
	}

	log.Printf("Request %d (%s) marked as overdue and cancelled", requestID, licenseType)
	return nil
}

// SendOverdueNotifications sends notifications for upcoming deadlines
func (s *overdueService) SendOverdueNotifications() error {
	log.Println("Sending overdue notifications...")

	// Get all active deadline reminders
	var reminders []models.DeadlineReminder
	err := s.db.Where("status = ?", models.DeadlineReminderStatusActive).Find(&reminders).Error
	if err != nil {
		return fmt.Errorf("failed to get deadline reminders: %w", err)
	}

	now := time.Now()
	threeDaysFromNow := now.AddDate(0, 0, 3)
	oneDayFromNow := now.AddDate(0, 0, 1)

	for _, reminder := range reminders {
		// Check if 3-day reminder should be sent
		if reminder.DeadlineDate.Before(threeDaysFromNow) && reminder.DeadlineDate.After(now) && !reminder.ReminderSent3D {
			if err := s.sendDeadlineReminder(reminder, "3days"); err != nil {
				log.Printf("Failed to send 3-day reminder for request %d: %v", reminder.RequestID, err)
			} else {
				reminder.ReminderSent3D = true
				s.db.Save(&reminder)
			}
		}

		// Check if 1-day reminder should be sent
		if reminder.DeadlineDate.Before(oneDayFromNow) && reminder.DeadlineDate.After(now) && !reminder.ReminderSent1D {
			if err := s.sendDeadlineReminder(reminder, "1day"); err != nil {
				log.Printf("Failed to send 1-day reminder for request %d: %v", reminder.RequestID, err)
			} else {
				reminder.ReminderSent1D = true
				s.db.Save(&reminder)
			}
		}

		// Check if overdue reminder should be sent
		if reminder.DeadlineDate.Before(now) && !reminder.ReminderSentOverdue {
			if err := s.sendDeadlineReminder(reminder, "overdue"); err != nil {
				log.Printf("Failed to send overdue reminder for request %d: %v", reminder.RequestID, err)
			} else {
				reminder.ReminderSentOverdue = true
				s.db.Save(&reminder)
			}
		}
	}

	log.Println("Overdue notifications sent successfully")
	return nil
}

// GetOverdueStatistics returns statistics about overdue requests
func (s *overdueService) GetOverdueStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count overdue requests by status
	var overdueCount int64
	s.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusOverdue).Count(&overdueCount)
	stats["overdue_requests"] = overdueCount

	// Count active deadline reminders
	var activeReminders int64
	s.db.Model(&models.DeadlineReminder{}).Where("status = ?", models.DeadlineReminderStatusActive).Count(&activeReminders)
	stats["active_deadline_reminders"] = activeReminders

	// Count overdue deadline reminders
	var overdueReminders int64
	s.db.Model(&models.DeadlineReminder{}).Where("status = ? AND deadline_date < ?", models.DeadlineReminderStatusActive, time.Now()).Count(&overdueReminders)
	stats["overdue_deadline_reminders"] = overdueReminders

	// Get upcoming deadlines (next 7 days)
	var upcomingDeadlines int64
	sevenDaysFromNow := time.Now().AddDate(0, 0, 7)
	s.db.Model(&models.DeadlineReminder{}).Where("status = ? AND deadline_date BETWEEN ? AND ?",
		models.DeadlineReminderStatusActive, time.Now(), sevenDaysFromNow).Count(&upcomingDeadlines)
	stats["upcoming_deadlines"] = upcomingDeadlines

	return stats, nil
}

// Helper functions

func (s *overdueService) checkOverdueAppointments() error {
	// Get all requests with appointment status that are overdue
	var requests []models.NewLicenseRequest
	err := s.db.Where("status = ? AND appointment_date < ?", models.StatusAppointment, time.Now()).Find(&requests).Error
	if err != nil {
		return err
	}

	for _, req := range requests {
		if err := s.ProcessOverdueRequest(req.ID, "new"); err != nil {
			log.Printf("Failed to process overdue appointment for request %d: %v", req.ID, err)
		}
	}

	return nil
}

func (s *overdueService) checkOverdueDocumentReviews() error {
	// Get all requests with document edit status that are overdue (14+ days)
	fourteenDaysAgo := time.Now().AddDate(0, 0, -14)
	var requests []models.NewLicenseRequest
	err := s.db.Where("status = ? AND updated_at < ?", models.StatusDocumentEdit, fourteenDaysAgo).Find(&requests).Error
	if err != nil {
		return err
	}

	for _, req := range requests {
		if err := s.ProcessOverdueRequest(req.ID, "new"); err != nil {
			log.Printf("Failed to process overdue document review for request %d: %v", req.ID, err)
		}
	}

	return nil
}

func (s *overdueService) checkOverdueTasks() error {
	// Get all tasks that are overdue
	var tasks []models.TaskAssignment
	err := s.db.Where("status = ? AND deadline < ?", models.TaskStatusPending, time.Now()).Find(&tasks).Error
	if err != nil {
		return err
	}

	for _, task := range tasks {
		// Mark task as overdue
		task.Status = models.TaskStatusOverdue
		s.db.Save(&task)

		// Process the associated request as overdue
		if err := s.ProcessOverdueRequest(task.RequestID, task.LicenseType); err != nil {
			log.Printf("Failed to process overdue task for request %d: %v", task.RequestID, err)
		}
	}

	return nil
}

func (s *overdueService) updateRequestStatusToOverdue(requestID uint, licenseType string) error {
	switch licenseType {
	case "new":
		return s.db.Model(&models.NewLicenseRequest{}).Where("id = ?", requestID).Update("status", models.StatusOverdue).Error
	case "renewal":
		return s.db.Model(&models.RenewalLicenseRequest{}).Where("id = ?", requestID).Update("status", models.StatusOverdue).Error
	case "extension":
		return s.db.Model(&models.ExtensionLicenseRequest{}).Where("id = ?", requestID).Update("status", models.StatusOverdue).Error
	case "reduction":
		return s.db.Model(&models.ReductionLicenseRequest{}).Where("id = ?", requestID).Update("status", models.StatusOverdue).Error
	}
	return fmt.Errorf("unsupported license type: %s", licenseType)
}

func (s *overdueService) sendDeadlineReminder(reminder models.DeadlineReminder, reminderType string) error {
	var title, message string
	var priority models.NotificationPriority

	switch reminderType {
	case "3days":
		title = "กำหนดเวลาใกล้ถึง"
		message = fmt.Sprintf("กำหนดเวลาสำหรับคำขอเลขที่ %d จะถึงในอีก 3 วัน", reminder.RequestID)
		priority = models.PriorityNormal
	case "1day":
		title = "กำหนดเวลาใกล้ถึง"
		message = fmt.Sprintf("กำหนดเวลาสำหรับคำขอเลขที่ %d จะถึงในอีก 1 วัน", reminder.RequestID)
		priority = models.PriorityHigh
	case "overdue":
		title = "เกินกำหนดเวลา"
		message = fmt.Sprintf("คำขอเลขที่ %d เกินกำหนดเวลาแล้ว", reminder.RequestID)
		priority = models.PriorityHigh
	}

	// Create notification for assigned user
	notification := &models.Notification{
		Title:       title,
		Message:     message,
		Type:        models.NotificationType("deadline_reminder"),
		Priority:    priority,
		RecipientID: reminder.AssignedToID,
		EntityType:  "deadline_reminder",
		EntityID:    &[]uint{reminder.ID}[0],
		ActionURL:   "/admin-portal/services",
	}

	return s.notificationRepo.Create(notification)
}
