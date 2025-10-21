package service

import (
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/workflow/dto"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

type DeadlineService interface {
	CreateDeadline(req dto.CreateDeadlineRequest) (*models.DeadlineReminder, error)
	GetDeadlineByID(deadlineID uint) (*models.DeadlineReminder, error)
	GetDeadlinesByUser(userID uint) ([]models.DeadlineReminder, error)
	GetDeadlinesByRole(role models.UserRole) ([]models.DeadlineReminder, error)
	GetDeadlinesByStatus(status models.DeadlineReminderStatus) ([]models.DeadlineReminder, error)
	GetDeadlinesByEntityType(entityType string, entityID uint) ([]models.DeadlineReminder, error)
	UpdateDeadline(deadlineID uint, req dto.UpdateDeadlineRequest) (*models.DeadlineReminder, error)
	MarkAsCompleted(deadlineID uint, req dto.CompleteDeadlineRequest) error
	GetUpcomingDeadlines(days int) ([]models.DeadlineReminder, error)
	GetOverdueDeadlines() ([]models.DeadlineReminder, error)
	GetDeadlineStatistics() (map[string]interface{}, error)
	ProcessDeadlines() error
}

type deadlineService struct {
	db               *gorm.DB
	deadlineRepo     repository.NotificationRepository
	userRepo         repository.UserRepository
	notificationRepo repository.NotificationRepository
}

func NewDeadlineService(db *gorm.DB) DeadlineService {
	return &deadlineService{
		db:               db,
		deadlineRepo:     repository.NewNotificationRepository(db),
		userRepo:         repository.NewUserRepository(db),
		notificationRepo: repository.NewNotificationRepository(db),
	}
}

// CreateDeadline creates a new deadline
func (s *deadlineService) CreateDeadline(req dto.CreateDeadlineRequest) (*models.DeadlineReminder, error) {
	// Create deadline
	deadline := &models.DeadlineReminder{
		RequestID:    req.EntityID,
		LicenseType:  req.EntityType,
		DeadlineType: models.DeadlineTypeAppointment,
		DeadlineDate: *req.DeadlineDate,
		AssignedToID: req.AssignedToID,
		Status:       models.DeadlineReminderStatusActive,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	err := s.db.Create(deadline).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create deadline: %w", err)
	}

	// Create notification for assigned user
	if req.AssignedToID != nil {
		s.createNotificationForUser(
			*req.AssignedToID,
			"กำหนดการใหม่",
			fmt.Sprintf("คุณมีกำหนดการใหม่: %s", req.Title),
			models.NotificationType("deadline_created"),
			models.PriorityNormal,
			"deadline",
			deadline.ID,
			"/admin-portal/deadlines",
		)
	}

	return deadline, nil
}

// GetDeadlineByID retrieves a deadline by ID
func (s *deadlineService) GetDeadlineByID(deadlineID uint) (*models.DeadlineReminder, error) {
	var deadline models.DeadlineReminder
	err := s.db.Where("id = ?", deadlineID).
		Preload("AssignedBy").
		Preload("AssignedTo").
		First(&deadline).Error
	if err != nil {
		return nil, fmt.Errorf("deadline not found: %w", err)
	}
	return &deadline, nil
}

// GetDeadlinesByUser retrieves deadlines for a specific user
func (s *deadlineService) GetDeadlinesByUser(userID uint) ([]models.DeadlineReminder, error) {
	var deadlines []models.DeadlineReminder
	err := s.db.Where("assigned_to_id = ?", userID).
		Preload("AssignedBy").
		Preload("AssignedTo").
		Order("deadline_date ASC, priority DESC, created_at DESC").
		Find(&deadlines).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get deadlines: %w", err)
	}
	return deadlines, nil
}

// GetDeadlinesByRole retrieves deadlines for a specific role
func (s *deadlineService) GetDeadlinesByRole(role models.UserRole) ([]models.DeadlineReminder, error) {
	var deadlines []models.DeadlineReminder

	// Get users with the specified role
	var users []models.User
	err := s.db.Where("role = ?", role).Find(&users).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	// Get user IDs
	var userIDs []uint
	for _, user := range users {
		userIDs = append(userIDs, user.ID)
	}

	// Get deadlines for these users
	if len(userIDs) > 0 {
		err = s.db.Where("assigned_to_id IN ?", userIDs).
			Preload("AssignedBy").
			Preload("AssignedTo").
			Order("deadline_date ASC, priority DESC, created_at DESC").
			Find(&deadlines).Error
		if err != nil {
			return nil, fmt.Errorf("failed to get deadlines: %w", err)
		}
	}

	return deadlines, nil
}

// GetDeadlinesByStatus retrieves deadlines by status
func (s *deadlineService) GetDeadlinesByStatus(status models.DeadlineReminderStatus) ([]models.DeadlineReminder, error) {
	var deadlines []models.DeadlineReminder
	err := s.db.Where("status = ?", status).
		Preload("AssignedBy").
		Preload("AssignedTo").
		Order("deadline_date ASC, priority DESC, created_at DESC").
		Find(&deadlines).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get deadlines: %w", err)
	}
	return deadlines, nil
}

// GetDeadlinesByEntityType retrieves deadlines for a specific entity
func (s *deadlineService) GetDeadlinesByEntityType(entityType string, entityID uint) ([]models.DeadlineReminder, error) {
	var deadlines []models.DeadlineReminder
	err := s.db.Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Preload("AssignedBy").
		Preload("AssignedTo").
		Order("deadline_date ASC, priority DESC, created_at DESC").
		Find(&deadlines).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get deadlines: %w", err)
	}
	return deadlines, nil
}

// UpdateDeadline updates a deadline
func (s *deadlineService) UpdateDeadline(deadlineID uint, req dto.UpdateDeadlineRequest) (*models.DeadlineReminder, error) {
	// Get deadline
	deadline, err := s.GetDeadlineByID(deadlineID)
	if err != nil {
		return nil, fmt.Errorf("deadline not found: %w", err)
	}

	// Update deadline fields
	if req.Title != "" {
		// Update deadline fields
		deadline.UpdatedAt = time.Now()
	}

	err = s.db.Save(deadline).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update deadline: %w", err)
	}

	return deadline, nil
}

// MarkAsCompleted marks a deadline as completed
func (s *deadlineService) MarkAsCompleted(deadlineID uint, req dto.CompleteDeadlineRequest) error {
	// Get deadline
	deadline, err := s.GetDeadlineByID(deadlineID)
	if err != nil {
		return fmt.Errorf("deadline not found: %w", err)
	}

	// Update deadline
	deadline.Status = models.DeadlineReminderStatusExpired
	deadline.UpdatedAt = time.Now()

	err = s.db.Save(deadline).Error
	if err != nil {
		return fmt.Errorf("failed to complete deadline: %w", err)
	}

	// No notification needed for deadline completion as there's no assigned by field

	return nil
}

// GetUpcomingDeadlines retrieves deadlines within the specified number of days
func (s *deadlineService) GetUpcomingDeadlines(days int) ([]models.DeadlineReminder, error) {
	now := time.Now()
	future := now.AddDate(0, 0, days)

	var deadlines []models.DeadlineReminder
	err := s.db.Where("status = ? AND deadline_date BETWEEN ? AND ?",
		models.DeadlineReminderStatusActive, now, future).
		Preload("AssignedBy").
		Preload("AssignedTo").
		Order("deadline_date ASC").
		Find(&deadlines).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get upcoming deadlines: %w", err)
	}
	return deadlines, nil
}

// GetOverdueDeadlines retrieves overdue deadlines
func (s *deadlineService) GetOverdueDeadlines() ([]models.DeadlineReminder, error) {
	var deadlines []models.DeadlineReminder
	err := s.db.Where("status = ? AND deadline_date < ?",
		models.DeadlineReminderStatusActive, time.Now()).
		Preload("AssignedBy").
		Preload("AssignedTo").
		Order("deadline_date ASC").
		Find(&deadlines).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get overdue deadlines: %w", err)
	}
	return deadlines, nil
}

// GetDeadlineStatistics returns statistics about deadlines
func (s *deadlineService) GetDeadlineStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count deadlines by status
	var pendingCount, completedCount, overdueCount int64
	s.db.Model(&models.DeadlineReminder{}).Where("status = ?", models.DeadlineReminderStatusActive).Count(&pendingCount)
	s.db.Model(&models.DeadlineReminder{}).Where("status = ?", models.DeadlineReminderStatusExpired).Count(&completedCount)
	s.db.Model(&models.DeadlineReminder{}).Where("status = ? AND deadline_date < ?",
		models.DeadlineReminderStatusActive, time.Now()).Count(&overdueCount)

	stats["total_deadlines"] = pendingCount + completedCount
	stats["pending_deadlines"] = pendingCount
	stats["completed_deadlines"] = completedCount
	stats["overdue_deadlines"] = overdueCount

	// Count deadlines by priority
	var lowPriorityCount, normalPriorityCount, highPriorityCount int64
	s.db.Model(&models.DeadlineReminder{}).Where("deadline_type = ?", models.DeadlineTypeAppointment).Count(&lowPriorityCount)
	s.db.Model(&models.DeadlineReminder{}).Where("deadline_type = ?", models.DeadlineTypeDocumentReview).Count(&normalPriorityCount)
	s.db.Model(&models.DeadlineReminder{}).Where("deadline_type = ?", models.DeadlineTypeInspection).Count(&highPriorityCount)

	stats["low_priority_deadlines"] = lowPriorityCount
	stats["normal_priority_deadlines"] = normalPriorityCount
	stats["high_priority_deadlines"] = highPriorityCount

	// Count deadlines by entity type
	var entityCounts []struct {
		EntityType string `json:"entity_type"`
		Count      int64  `json:"count"`
	}
	s.db.Model(&models.DeadlineReminder{}).
		Select("license_type, count(*) as count").
		Group("license_type").
		Find(&entityCounts)

	stats["deadlines_by_entity_type"] = entityCounts

	return stats, nil
}

// ProcessDeadlines processes deadlines and sends reminders
func (s *deadlineService) ProcessDeadlines() error {
	now := time.Now()

	// Get pending deadlines
	var deadlines []models.DeadlineReminder
	err := s.db.Where("status = ?", models.DeadlineReminderStatusActive).Find(&deadlines).Error
	if err != nil {
		return fmt.Errorf("failed to get deadlines: %w", err)
	}

	for _, deadline := range deadlines {
		// Check if deadline is overdue
		if deadline.DeadlineDate.Before(now) {
			// Mark as overdue
			deadline.Status = models.DeadlineReminderStatusExpired
			deadline.UpdatedAt = now
			s.db.Save(&deadline)

			// Create notification for assigned user
			if deadline.AssignedToID != nil {
				s.createNotificationForUser(
					*deadline.AssignedToID,
					"กำหนดการล่าช้า",
					fmt.Sprintf("กำหนดการ %s ได้ล่าช้าแล้ว", deadline.GetDeadlineTypeDisplayName()),
					models.NotificationType("deadline_overdue"),
					models.PriorityHigh,
					"deadline",
					deadline.ID,
					"/admin-portal/deadlines",
				)
			}
		} else {
			// Check if reminder should be sent
			if deadline.ShouldSend3DayReminder() || deadline.ShouldSend1DayReminder() {
				// Create notification for assigned user
				if deadline.AssignedToID != nil {
					s.createNotificationForUser(
						*deadline.AssignedToID,
						"แจ้งเตือนกำหนดการ",
						fmt.Sprintf("กำหนดการ %s จะถึงใน %d วัน", deadline.GetDeadlineTypeDisplayName(), deadline.GetDaysUntilDeadline()),
						models.NotificationType("deadline_reminder"),
						models.PriorityNormal,
						"deadline",
						deadline.ID,
						"/admin-portal/deadlines",
					)
				}
			}
		}
	}

	return nil
}

// Helper functions

func (s *deadlineService) createNotificationForUser(userID uint, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
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

	if err := s.notificationRepo.Create(notification); err != nil {
		log.Printf("Failed to create notification for user %d: %v", userID, err)
	}
}
