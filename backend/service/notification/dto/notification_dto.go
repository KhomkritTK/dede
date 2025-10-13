package dto

import "time"

// PaginationResponse represents pagination information
type PaginationResponse struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}

// CreateNotificationRequest represents the create notification request payload
type CreateNotificationRequest struct {
	RecipientID   *uint  `json:"recipient_id"`
	RecipientRole string `json:"recipient_role"`
	Type          string `json:"type" binding:"required"`
	Title         string `json:"title" binding:"required"`
	Message       string `json:"message" binding:"required"`
	Priority      string `json:"priority" binding:"required"`
	EntityType    string `json:"entity_type"`
	EntityID      uint   `json:"entity_id"`
	IsEmailSent   bool   `json:"is_email_sent"`
}

// NotificationResponse represents the notification response
type NotificationResponse struct {
	ID            uint       `json:"id"`
	RecipientID   *uint      `json:"recipient_id"`
	RecipientRole string     `json:"recipient_role"`
	Type          string     `json:"type"`
	Title         string     `json:"title"`
	Message       string     `json:"message"`
	Priority      string     `json:"priority"`
	EntityType    string     `json:"entity_type"`
	EntityID      uint       `json:"entity_id"`
	IsRead        bool       `json:"is_read"`
	IsSent        bool       `json:"is_sent"`
	IsEmailSent   bool       `json:"is_email_sent"`
	ReadAt        *time.Time `json:"read_at"`
	SentAt        *time.Time `json:"sent_at"`
	EmailSentAt   *time.Time `json:"email_sent_at"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// NotificationListResponse represents the notification list response
type NotificationListResponse struct {
	Notifications []NotificationResponse `json:"notifications"`
	Pagination    PaginationResponse     `json:"pagination"`
}

// NotificationCountResponse represents the notification count response
type NotificationCountResponse struct {
	Total  int64 `json:"total"`
	Unread int64 `json:"unread"`
}

// NotificationTypeResponse represents the notification type response
type NotificationTypeResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// NotificationPriorityResponse represents the notification priority response
type NotificationPriorityResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}
