package service

import (
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/notification/dto"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

type NotificationService interface {
	CreateNotification(req dto.CreateNotificationRequest) error
	GetNotifications(userID uint, req dto.GetNotificationsRequest) ([]models.Notification, int64, error)
	MarkAsRead(notificationID uint, userID uint) error
	MarkAllAsRead(userID uint) error
	DeleteNotification(notificationID uint, userID uint) error
	BroadcastNotification(req dto.BroadcastNotificationRequest) error
	GetUnreadCount(userID uint) (int64, error)
	GetNotificationSettings(userID uint) (models.NotificationSettings, error)
	UpdateNotificationSettings(userID uint, settings dto.UpdateNotificationSettingsRequest) error
}

type notificationService struct {
	db               *gorm.DB
	notificationRepo repository.NotificationRepository
	userRepo         repository.UserRepository
}

func NewNotificationService(db *gorm.DB) NotificationService {
	return &notificationService{
		db:               db,
		notificationRepo: repository.NewNotificationRepository(db),
		userRepo:         repository.NewUserRepository(db),
	}
}

// CreateNotification creates a new notification
func (s *notificationService) CreateNotification(req dto.CreateNotificationRequest) error {
	notification := &models.Notification{
		Title:         req.Title,
		Message:       req.Message,
		Type:          models.NotificationType(req.Type),
		Priority:      models.NotificationPriority(req.Priority),
		RecipientID:   req.RecipientID,
		RecipientRole: &[]models.UserRole{models.UserRole(req.RecipientRole)}[0],
		EntityType:    req.EntityType,
		EntityID:      req.EntityID,
		ActionURL:     req.ActionURL,
	}

	return s.notificationRepo.Create(notification)
}

// GetNotifications retrieves notifications for a user
func (s *notificationService) GetNotifications(userID uint, req dto.GetNotificationsRequest) ([]models.Notification, int64, error) {
	// Get user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, 0, fmt.Errorf("user not found: %w", err)
	}

	// Build query
	query := s.db.Model(&models.Notification{})

	// Filter by recipient
	if req.RecipientRole != "" {
		query = query.Where("recipient_role = ?", req.RecipientRole)
	} else {
		query = query.Where("recipient_id = ? OR recipient_role = ?", userID, user.Role)
	}

	// Filter by type
	if req.Type != "" {
		query = query.Where("type = ?", req.Type)
	}

	// Filter by priority
	if req.Priority != "" {
		query = query.Where("priority = ?", req.Priority)
	}

	// Filter by read status
	if req.IsRead != nil {
		if *req.IsRead {
			query = query.Where("read_at IS NOT NULL")
		} else {
			query = query.Where("read_at IS NULL")
		}
	}

	// Filter by date range
	if req.StartDate != nil {
		query = query.Where("created_at >= ?", req.StartDate)
	}
	if req.EndDate != nil {
		query = query.Where("created_at <= ?", req.EndDate)
	}

	// Count total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count notifications: %w", err)
	}

	// Get notifications with pagination
	var notifications []models.Notification
	offset := (req.Page - 1) * req.Limit
	err = query.Order("created_at DESC").Offset(offset).Limit(req.Limit).Find(&notifications).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get notifications: %w", err)
	}

	return notifications, total, nil
}

// MarkAsRead marks a notification as read
func (s *notificationService) MarkAsRead(notificationID uint, userID uint) error {
	// Get notification
	notification, err := s.notificationRepo.GetByID(notificationID)
	if err != nil {
		return fmt.Errorf("notification not found: %w", err)
	}

	// Check if user is the recipient
	if notification.RecipientID != nil && *notification.RecipientID != userID {
		return fmt.Errorf("user is not the recipient of this notification")
	}

	// Check if user has the role
	if notification.RecipientRole != nil {
		user, err := s.userRepo.GetByID(userID)
		if err != nil {
			return fmt.Errorf("user not found: %w", err)
		}
		if user.Role != *notification.RecipientRole {
			return fmt.Errorf("user does not have the required role")
		}
	}

	// Mark as read
	now := time.Now()
	return s.db.Model(notification).Update("read_at", &now).Error
}

// MarkAllAsRead marks all notifications for a user as read
func (s *notificationService) MarkAllAsRead(userID uint) error {
	// Get user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Update all unread notifications
	now := time.Now()
	return s.db.Model(&models.Notification{}).
		Where("(recipient_id = ? OR recipient_role = ?) AND read_at IS NULL", userID, user.Role).
		Update("read_at", &now).Error
}

// DeleteNotification deletes a notification
func (s *notificationService) DeleteNotification(notificationID uint, userID uint) error {
	// Get notification
	notification, err := s.notificationRepo.GetByID(notificationID)
	if err != nil {
		return fmt.Errorf("notification not found: %w", err)
	}

	// Check if user is the recipient
	if notification.RecipientID != nil && *notification.RecipientID != userID {
		return fmt.Errorf("user is not the recipient of this notification")
	}

	// Check if user has the role
	if notification.RecipientRole != nil {
		user, err := s.userRepo.GetByID(userID)
		if err != nil {
			return fmt.Errorf("user not found: %w", err)
		}
		if user.Role != *notification.RecipientRole {
			return fmt.Errorf("user does not have the required role")
		}
	}

	// Delete notification
	return s.db.Delete(notification).Error
}

// BroadcastNotification sends a notification to multiple recipients
func (s *notificationService) BroadcastNotification(req dto.BroadcastNotificationRequest) error {
	// Create notifications for each recipient
	for _, recipientID := range req.RecipientIDs {
		notification := &models.Notification{
			Title:       req.Title,
			Message:     req.Message,
			Type:        models.NotificationType(req.Type),
			Priority:    models.NotificationPriority(req.Priority),
			RecipientID: &recipientID,
			EntityType:  req.EntityType,
			EntityID:    req.EntityID,
			ActionURL:   req.ActionURL,
		}

		if err := s.notificationRepo.Create(notification); err != nil {
			log.Printf("Failed to create notification for user %d: %v", recipientID, err)
		}
	}

	// Create notifications for each role
	for _, role := range req.RecipientRoles {
		notification := &models.Notification{
			Title:         req.Title,
			Message:       req.Message,
			Type:          models.NotificationType(req.Type),
			Priority:      models.NotificationPriority(req.Priority),
			RecipientRole: &[]models.UserRole{models.UserRole(role)}[0],
			EntityType:    req.EntityType,
			EntityID:      req.EntityID,
			ActionURL:     req.ActionURL,
		}

		if err := s.notificationRepo.Create(notification); err != nil {
			log.Printf("Failed to create notification for role %s: %v", role, err)
		}
	}

	return nil
}

// GetUnreadCount returns the count of unread notifications for a user
func (s *notificationService) GetUnreadCount(userID uint) (int64, error) {
	// Get user
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return 0, fmt.Errorf("user not found: %w", err)
	}

	// Count unread notifications
	var count int64
	err = s.db.Model(&models.Notification{}).
		Where("(recipient_id = ? OR recipient_role = ?) AND read_at IS NULL", userID, user.Role).
		Count(&count).Error

	return count, err
}

// GetNotificationSettings returns notification settings for a user
func (s *notificationService) GetNotificationSettings(userID uint) (models.NotificationSettings, error) {
	// Get notification settings
	var settings models.NotificationSettings
	err := s.db.Where("user_id = ?", userID).First(&settings).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default settings
			settings = models.NotificationSettings{}
			s.db.Create(&settings)
		} else {
			return models.NotificationSettings{}, fmt.Errorf("failed to get notification settings: %w", err)
		}
	}

	return settings, nil
}

// UpdateNotificationSettings updates notification settings for a user
func (s *notificationService) UpdateNotificationSettings(userID uint, settingsReq dto.UpdateNotificationSettingsRequest) error {
	// Get current settings
	settings, err := s.GetNotificationSettings(userID)
	if err != nil {
		return fmt.Errorf("failed to get notification settings: %w", err)
	}

	// Update settings would go here if the model had these fields
	// For now, we'll just save the settings as is

	return s.db.Save(&settings).Error
}

// Helper function to create state change notifications
func (s *notificationService) CreateStateChangeNotification(
	requestID uint,
	licenseType string,
	fromStatus, toStatus models.RequestStatus,
	changedBy uint,
	recipients []uint,
	roles []string,
) error {
	title := fmt.Sprintf("สถานะคำขอเปลี่ยนแล้ว")
	message := fmt.Sprintf("คำขอเลขที่ %d เปลี่ยนสถานะจาก %s เป็น %s", requestID, fromStatus, toStatus)

	// Create notification for each recipient
	for _, recipientID := range recipients {
		notification := &models.Notification{
			Title:       title,
			Message:     message,
			Type:        models.NotificationType("state_changed"),
			Priority:    models.PriorityNormal,
			RecipientID: &recipientID,
			EntityType:  "license_request",
			EntityID:    &requestID,
			ActionURL:   fmt.Sprintf("/admin-portal/services/%d", requestID),
		}

		if err := s.notificationRepo.Create(notification); err != nil {
			log.Printf("Failed to create state change notification for user %d: %v", recipientID, err)
		}
	}

	// Create notification for each role
	for _, role := range roles {
		notification := &models.Notification{
			Title:         title,
			Message:       message,
			Type:          models.NotificationType("state_changed"),
			Priority:      models.PriorityNormal,
			RecipientRole: &[]models.UserRole{models.UserRole(role)}[0],
			EntityType:    "license_request",
			EntityID:      &requestID,
			ActionURL:     fmt.Sprintf("/admin-portal/services/%d", requestID),
		}

		if err := s.notificationRepo.Create(notification); err != nil {
			log.Printf("Failed to create state change notification for role %s: %v", role, err)
		}
	}

	return nil
}
