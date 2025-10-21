package service

import (
	"encoding/json"
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/workflow/dto"
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

type NotificationService interface {
	CreateNotification(req dto.CreateNotificationRequest) (*models.Notification, error)
	GetNotificationsByUser(userID uint) ([]models.Notification, error)
	GetNotificationsByRole(role models.UserRole) ([]models.Notification, error)
	GetNotificationsByStatus(status string) ([]models.Notification, error)
	GetUnreadNotifications(userID uint) ([]models.Notification, error)
	MarkAsRead(notificationID uint, userID uint) error
	MarkAllAsRead(userID uint) error
	DeleteNotification(notificationID uint) error
	GetNotificationStatistics() (map[string]interface{}, error)
	RegisterClient(userID uint, conn *websocket.Conn)
	UnregisterClient(userID uint, conn *websocket.Conn)
	BroadcastToUser(userID uint, notification models.Notification) error
	BroadcastToRole(role models.UserRole, notification models.Notification) error
	BroadcastToAll(notification models.Notification) error
	ProcessScheduledNotifications() error
}

type notificationService struct {
	db               *gorm.DB
	notificationRepo repository.NotificationRepository
	userRepo         repository.UserRepository
	clients          map[uint][]*websocket.Conn // userID to connections
}

func NewNotificationService(db *gorm.DB) NotificationService {
	return &notificationService{
		db:               db,
		notificationRepo: repository.NewNotificationRepository(db),
		userRepo:         repository.NewUserRepository(db),
		clients:          make(map[uint][]*websocket.Conn),
	}
}

// CreateNotification creates a new notification
func (s *notificationService) CreateNotification(req dto.CreateNotificationRequest) (*models.Notification, error) {
	// Create notification
	notification := &models.Notification{
		Title:         req.Title,
		Message:       req.Message,
		Type:          models.NotificationType(req.Type),
		Priority:      models.NotificationPriority(req.Priority),
		RecipientID:   req.RecipientID,
		RecipientRole: nil,
		EntityType:    req.EntityType,
		EntityID:      req.EntityID,
		ActionURL:     req.ActionURL,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	err := s.db.Create(notification).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create notification: %w", err)
	}

	// Broadcast notification to recipients
	if notification.RecipientID != nil {
		s.BroadcastToUser(*notification.RecipientID, *notification)
	} else if notification.RecipientRole != nil && *notification.RecipientRole != "" {
		s.BroadcastToRole(*notification.RecipientRole, *notification)
	}

	return notification, nil
}

// GetNotificationsByUser retrieves notifications for a specific user
func (s *notificationService) GetNotificationsByUser(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	err := s.db.Where("recipient_id = ? OR recipient_role IN (SELECT role FROM users WHERE id = ?)", userID, userID).
		Order("created_at DESC").
		Find(&notifications).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %w", err)
	}
	return notifications, nil
}

// GetNotificationsByRole retrieves notifications for a specific role
func (s *notificationService) GetNotificationsByRole(role models.UserRole) ([]models.Notification, error) {
	var notifications []models.Notification
	err := s.db.Where("recipient_role = ?", role).
		Order("created_at DESC").
		Find(&notifications).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %w", err)
	}
	return notifications, nil
}

// GetNotificationsByStatus retrieves notifications by status
func (s *notificationService) GetNotificationsByStatus(status string) ([]models.Notification, error) {
	var notifications []models.Notification
	err := s.db.Where("is_read = ?", status == "read").
		Order("created_at DESC").
		Find(&notifications).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %w", err)
	}
	return notifications, nil
}

// GetUnreadNotifications retrieves unread notifications for a user
func (s *notificationService) GetUnreadNotifications(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	err := s.db.Where("(recipient_id = ? OR recipient_role IN (SELECT role FROM users WHERE id = ?)) AND read_at IS NULL", userID, userID).
		Order("created_at DESC").
		Find(&notifications).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get unread notifications: %w", err)
	}
	return notifications, nil
}

// MarkAsRead marks a notification as read
func (s *notificationService) MarkAsRead(notificationID uint, userID uint) error {
	// Check if the notification belongs to the user
	var notification models.Notification
	err := s.db.Where("id = ? AND (recipient_id = ? OR recipient_role IN (SELECT role FROM users WHERE id = ?))",
		notificationID, userID, userID).First(&notification).Error
	if err != nil {
		return fmt.Errorf("notification not found or access denied: %w", err)
	}

	// Update notification
	now := time.Now()
	err = s.db.Model(&notification).Update("read_at", now).Error
	if err != nil {
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}

	return nil
}

// MarkAllAsRead marks all notifications for a user as read
func (s *notificationService) MarkAllAsRead(userID uint) error {
	now := time.Now()
	err := s.db.Model(&models.Notification{}).
		Where("(recipient_id = ? OR recipient_role IN (SELECT role FROM users WHERE id = ?)) AND read_at IS NULL", userID, userID).
		Update("read_at", now).Error
	if err != nil {
		return fmt.Errorf("failed to mark all notifications as read: %w", err)
	}

	return nil
}

// DeleteNotification deletes a notification
func (s *notificationService) DeleteNotification(notificationID uint) error {
	err := s.db.Delete(&models.Notification{}, notificationID).Error
	if err != nil {
		return fmt.Errorf("failed to delete notification: %w", err)
	}

	return nil
}

// GetNotificationStatistics returns statistics about notifications
func (s *notificationService) GetNotificationStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count notifications by status
	var totalCount, unreadCount, readCount int64
	s.db.Model(&models.Notification{}).Count(&totalCount)
	s.db.Model(&models.Notification{}).Where("read_at IS NULL").Count(&unreadCount)
	s.db.Model(&models.Notification{}).Where("read_at IS NOT NULL").Count(&readCount)

	stats["total_notifications"] = totalCount
	stats["unread_notifications"] = unreadCount
	stats["read_notifications"] = readCount

	// Count notifications by type
	var typeCounts []struct {
		Type  string `json:"type"`
		Count int64  `json:"count"`
	}
	s.db.Model(&models.Notification{}).
		Select("type, count(*) as count").
		Group("type").
		Find(&typeCounts)

	stats["notifications_by_type"] = typeCounts

	// Count notifications by priority
	var priorityCounts []struct {
		Priority string `json:"priority"`
		Count    int64  `json:"count"`
	}
	s.db.Model(&models.Notification{}).
		Select("priority, count(*) as count").
		Group("priority").
		Find(&priorityCounts)

	stats["notifications_by_priority"] = priorityCounts

	// Count notifications by recipient type
	var recipientTypeCounts []struct {
		RecipientType string `json:"recipient_type"`
		Count         int64  `json:"count"`
	}
	s.db.Model(&models.Notification{}).
		Select(`
			CASE 
				WHEN recipient_id IS NOT NULL THEN 'user'
				WHEN recipient_role IS NOT NULL THEN 'role'
				ELSE 'all'
			END as recipient_type, 
			count(*) as count
		`).
		Group("recipient_type").
		Find(&recipientTypeCounts)

	stats["notifications_by_recipient_type"] = recipientTypeCounts

	return stats, nil
}

// RegisterClient registers a WebSocket client for a user
func (s *notificationService) RegisterClient(userID uint, conn *websocket.Conn) {
	if s.clients[userID] == nil {
		s.clients[userID] = make([]*websocket.Conn, 0)
	}
	s.clients[userID] = append(s.clients[userID], conn)
	log.Printf("Client registered for user %d. Total clients: %d", userID, len(s.clients[userID]))
}

// UnregisterClient unregisters a WebSocket client for a user
func (s *notificationService) UnregisterClient(userID uint, conn *websocket.Conn) {
	if connections, ok := s.clients[userID]; ok {
		for i, c := range connections {
			if c == conn {
				// Remove the connection
				s.clients[userID] = append(connections[:i], connections[i+1:]...)
				break
			}
		}

		// If no more connections for this user, remove the entry
		if len(s.clients[userID]) == 0 {
			delete(s.clients, userID)
		}
	}
	log.Printf("Client unregistered for user %d. Total clients: %d", userID, len(s.clients[userID]))
}

// BroadcastToUser broadcasts a notification to all clients of a user
func (s *notificationService) BroadcastToUser(userID uint, notification models.Notification) error {
	if connections, ok := s.clients[userID]; ok {
		// Convert notification to JSON
		data, err := json.Marshal(map[string]interface{}{
			"type":         "notification",
			"notification": notification,
		})
		if err != nil {
			return fmt.Errorf("failed to marshal notification: %w", err)
		}

		// Send to all connections
		for _, conn := range connections {
			err := conn.WriteMessage(websocket.TextMessage, data)
			if err != nil {
				log.Printf("Failed to send notification to client: %v", err)
				// Remove the faulty connection
				s.UnregisterClient(userID, conn)
			}
		}
	}
	return nil
}

// BroadcastToRole broadcasts a notification to all clients of users with a specific role
func (s *notificationService) BroadcastToRole(role models.UserRole, notification models.Notification) error {
	// Get users with the specified role
	var users []models.User
	err := s.db.Where("role = ?", role).Find(&users).Error
	if err != nil {
		return fmt.Errorf("failed to get users: %w", err)
	}

	// Broadcast to each user
	for _, user := range users {
		err := s.BroadcastToUser(user.ID, notification)
		if err != nil {
			log.Printf("Failed to broadcast to user %d: %v", user.ID, err)
		}
	}

	return nil
}

// BroadcastToAll broadcasts a notification to all clients
func (s *notificationService) BroadcastToAll(notification models.Notification) error {
	// Convert notification to JSON
	data, err := json.Marshal(map[string]interface{}{
		"type":         "notification",
		"notification": notification,
	})
	if err != nil {
		return fmt.Errorf("failed to marshal notification: %w", err)
	}

	// Send to all connections
	for userID, connections := range s.clients {
		for _, conn := range connections {
			err := conn.WriteMessage(websocket.TextMessage, data)
			if err != nil {
				log.Printf("Failed to send notification to client: %v", err)
				// Remove the faulty connection
				s.UnregisterClient(userID, conn)
			}
		}
	}

	return nil
}

// ProcessScheduledNotifications processes scheduled notifications
func (s *notificationService) ProcessScheduledNotifications() error {
	// Get scheduled notifications that are due
	var notifications []models.Notification
	now := time.Now()
	err := s.db.Where("scheduled_at <= ? AND sent_at IS NULL", now).
		Find(&notifications).Error
	if err != nil {
		return fmt.Errorf("failed to get scheduled notifications: %w", err)
	}

	// Process each notification
	for _, notification := range notifications {
		// Mark as sent
		err := s.db.Model(&notification).Update("sent_at", now).Error
		if err != nil {
			log.Printf("Failed to mark notification as sent: %v", err)
			continue
		}

		// Broadcast notification
		if notification.RecipientID != nil {
			err := s.BroadcastToUser(*notification.RecipientID, notification)
			if err != nil {
				log.Printf("Failed to broadcast notification: %v", err)
			}
		} else if notification.RecipientRole != nil && *notification.RecipientRole != "" {
			err := s.BroadcastToRole(*notification.RecipientRole, notification)
			if err != nil {
				log.Printf("Failed to broadcast notification: %v", err)
			}
		} else {
			err := s.BroadcastToAll(notification)
			if err != nil {
				log.Printf("Failed to broadcast notification: %v", err)
			}
		}
	}

	return nil
}
