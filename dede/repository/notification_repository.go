package repository

import (
	"eservice-backend/models"
	"time"

	"gorm.io/gorm"
)

type NotificationRepository interface {
	Create(notification *models.Notification) error
	GetByID(id uint) (*models.Notification, error)
	GetAll() ([]models.Notification, error)
	GetByRecipientID(recipientID uint) ([]models.Notification, error)
	GetByRecipientRole(role models.UserRole) ([]models.Notification, error)
	GetUnreadByRecipientID(recipientID uint) ([]models.Notification, error)
	GetByType(notificationType models.NotificationType) ([]models.Notification, error)
	GetByEntityType(entityType string, entityID uint) ([]models.Notification, error)
	GetByPriority(priority models.NotificationPriority) ([]models.Notification, error)
	GetUnsentNotifications() ([]models.Notification, error)
	GetNotificationsByEmailNotSent() ([]models.Notification, error)
	Update(notification *models.Notification) error
	Delete(id uint) error
	MarkAsRead(id uint) error
	MarkAsUnread(id uint) error
	MarkAllAsReadByRecipientID(recipientID uint) error
	MarkAsSent(id uint) error
	MarkAsEmailSent(id uint) error
	GetNotificationsByDateRange(start, end time.Time) ([]models.Notification, error)
	SearchNotifications(query string) ([]models.Notification, error)
	GetCountByRecipientID(recipientID uint) (int64, error)
	GetUnreadCountByRecipientID(recipientID uint) (int64, error)
	DeleteOldNotifications(days int) error
}

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) Create(notification *models.Notification) error {
	return r.db.Create(notification).Error
}

func (r *notificationRepository) GetByID(id uint) (*models.Notification, error) {
	var notification models.Notification
	err := r.db.Preload("Recipient").First(&notification, id).Error
	if err != nil {
		return nil, err
	}
	return &notification, nil
}

func (r *notificationRepository) GetAll() ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Preload("Recipient").Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) GetByRecipientID(recipientID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Preload("Recipient").Where("recipient_id = ?", recipientID).
		Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) GetByRecipientRole(role models.UserRole) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Preload("Recipient").Where("recipient_role = ?", role).
		Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) GetUnreadByRecipientID(recipientID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Preload("Recipient").Where("recipient_id = ? AND is_read = ?", recipientID, false).
		Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) GetByType(notificationType models.NotificationType) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Preload("Recipient").Where("type = ?", notificationType).
		Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) GetByEntityType(entityType string, entityID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Preload("Recipient").Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) GetByPriority(priority models.NotificationPriority) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Preload("Recipient").Where("priority = ?", priority).
		Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) GetUnsentNotifications() ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Preload("Recipient").Where("is_sent = ?", false).
		Order("created_at ASC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) GetNotificationsByEmailNotSent() ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Preload("Recipient").Where("is_email_sent = ?", false).
		Order("created_at ASC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) Update(notification *models.Notification) error {
	return r.db.Save(notification).Error
}

func (r *notificationRepository) Delete(id uint) error {
	return r.db.Delete(&models.Notification{}, id).Error
}

func (r *notificationRepository) MarkAsRead(id uint) error {
	now := time.Now()
	return r.db.Model(&models.Notification{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_read": true,
		"read_at": &now,
	}).Error
}

func (r *notificationRepository) MarkAsUnread(id uint) error {
	return r.db.Model(&models.Notification{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_read": false,
		"read_at": nil,
	}).Error
}

func (r *notificationRepository) MarkAllAsReadByRecipientID(recipientID uint) error {
	now := time.Now()
	return r.db.Model(&models.Notification{}).Where("recipient_id = ? AND is_read = ?", recipientID, false).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": &now,
		}).Error
}

func (r *notificationRepository) MarkAsSent(id uint) error {
	now := time.Now()
	return r.db.Model(&models.Notification{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_sent": true,
		"sent_at": &now,
	}).Error
}

func (r *notificationRepository) MarkAsEmailSent(id uint) error {
	now := time.Now()
	return r.db.Model(&models.Notification{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_email_sent": true,
		"email_sent_at": &now,
	}).Error
}

func (r *notificationRepository) GetNotificationsByDateRange(start, end time.Time) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Preload("Recipient").Where("created_at BETWEEN ? AND ?", start, end).
		Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) SearchNotifications(query string) ([]models.Notification, error) {
	var notifications []models.Notification
	searchPattern := "%" + query + "%"
	err := r.db.Preload("Recipient").Where("title LIKE ? OR message LIKE ?",
		searchPattern, searchPattern).
		Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) GetCountByRecipientID(recipientID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Notification{}).Where("recipient_id = ?", recipientID).Count(&count).Error
	return count, err
}

func (r *notificationRepository) GetUnreadCountByRecipientID(recipientID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Notification{}).
		Where("recipient_id = ? AND is_read = ?", recipientID, false).Count(&count).Error
	return count, err
}

func (r *notificationRepository) DeleteOldNotifications(days int) error {
	cutoffDate := time.Now().AddDate(0, 0, -days)
	return r.db.Where("created_at < ?", cutoffDate).Delete(&models.Notification{}).Error
}
