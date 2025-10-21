package dto

import "time"

// CreateNotificationRequest represents a request to create a notification
type CreateNotificationRequest struct {
	Title         string     `json:"title" binding:"required"`
	Message       string     `json:"message" binding:"required"`
	Type          string     `json:"type" binding:"required"`
	Priority      string     `json:"priority"`
	RecipientID   *uint      `json:"recipient_id"`
	RecipientRole string     `json:"recipient_role"`
	EntityType    string     `json:"entity_type"`
	EntityID      *uint      `json:"entity_id"`
	ActionURL     string     `json:"action_url"`
	ScheduledAt   *time.Time `json:"scheduled_at"`
}

// UpdateNotificationRequest represents a request to update a notification
type UpdateNotificationRequest struct {
	Title       string     `json:"title"`
	Message     string     `json:"message"`
	Priority    string     `json:"priority"`
	ReadAt      *time.Time `json:"read_at"`
	ScheduledAt *time.Time `json:"scheduled_at"`
}

// MarkAsReadRequest represents a request to mark a notification as read
type MarkAsReadRequest struct {
	NotificationID uint `json:"notification_id" binding:"required"`
}

// MarkAllAsReadRequest represents a request to mark all notifications as read
type MarkAllAsReadRequest struct {
	// Empty request body, just triggers the action
}

// DeleteNotificationRequest represents a request to delete a notification
type DeleteNotificationRequest struct {
	NotificationID uint `json:"notification_id" binding:"required"`
}

// NotificationStatisticsResponse represents notification statistics
type NotificationStatisticsResponse struct {
	TotalNotifications           int64                `json:"total_notifications"`
	UnreadNotifications          int64                `json:"unread_notifications"`
	ReadNotifications            int64                `json:"read_notifications"`
	NotificationsByType          []TypeCount          `json:"notifications_by_type"`
	NotificationsByPriority      []PriorityCount      `json:"notifications_by_priority"`
	NotificationsByRecipientType []RecipientTypeCount `json:"notifications_by_recipient_type"`
}

// TypeCount represents a count by type
type TypeCount struct {
	Type  string `json:"type"`
	Count int64  `json:"count"`
}

// PriorityCount represents a count by priority
type PriorityCount struct {
	Priority string `json:"priority"`
	Count    int64  `json:"count"`
}

// RecipientTypeCount represents a count by recipient type
type RecipientTypeCount struct {
	RecipientType string `json:"recipient_type"`
	Count         int64  `json:"count"`
}

// WebSocketNotification represents a notification sent via WebSocket
type WebSocketNotification struct {
	Type         string               `json:"type"`
	Notification NotificationResponse `json:"notification"`
}

// WebSocketMessage represents a message sent via WebSocket
type WebSocketMessage struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

// WebSocketConnectRequest represents a request to connect to WebSocket
type WebSocketConnectRequest struct {
	UserID uint   `json:"user_id" binding:"required"`
	Token  string `json:"token" binding:"required"`
}

// WebSocketDisconnectRequest represents a request to disconnect from WebSocket
type WebSocketDisconnectRequest struct {
	UserID uint `json:"user_id" binding:"required"`
}

// BroadcastNotificationRequest represents a request to broadcast a notification
type BroadcastNotificationRequest struct {
	Title         string `json:"title" binding:"required"`
	Message       string `json:"message" binding:"required"`
	Type          string `json:"type" binding:"required"`
	Priority      string `json:"priority"`
	RecipientID   *uint  `json:"recipient_id"`
	RecipientRole string `json:"recipient_role"`
	EntityType    string `json:"entity_type"`
	EntityID      *uint  `json:"entity_id"`
	ActionURL     string `json:"action_url"`
}

// ScheduleNotificationRequest represents a request to schedule a notification
type ScheduleNotificationRequest struct {
	Title         string    `json:"title" binding:"required"`
	Message       string    `json:"message" binding:"required"`
	Type          string    `json:"type" binding:"required"`
	Priority      string    `json:"priority"`
	RecipientID   *uint     `json:"recipient_id"`
	RecipientRole string    `json:"recipient_role"`
	EntityType    string    `json:"entity_type"`
	EntityID      *uint     `json:"entity_id"`
	ActionURL     string    `json:"action_url"`
	ScheduledAt   time.Time `json:"scheduled_at" binding:"required"`
}

// ProcessScheduledNotificationsRequest represents a request to process scheduled notifications
type ProcessScheduledNotificationsRequest struct {
	// Empty request body, just triggers the processing
}

// UnreadNotificationCountResponse represents the count of unread notifications
type UnreadNotificationCountResponse struct {
	Count int64 `json:"count"`
}

// NotificationPreferences represents user notification preferences
type NotificationPreferences struct {
	UserID                uint `json:"user_id"`
	EmailNotifications    bool `json:"email_notifications"`
	PushNotifications     bool `json:"push_notifications"`
	TaskNotifications     bool `json:"task_notifications"`
	DeadlineNotifications bool `json:"deadline_notifications"`
	CommentNotifications  bool `json:"comment_notifications"`
	SystemNotifications   bool `json:"system_notifications"`
}

// UpdateNotificationPreferencesRequest represents a request to update notification preferences
type UpdateNotificationPreferencesRequest struct {
	EmailNotifications    bool `json:"email_notifications"`
	PushNotifications     bool `json:"push_notifications"`
	TaskNotifications     bool `json:"task_notifications"`
	DeadlineNotifications bool `json:"deadline_notifications"`
	CommentNotifications  bool `json:"comment_notifications"`
	SystemNotifications   bool `json:"system_notifications"`
}

// GetNotificationPreferencesRequest represents a request to get notification preferences
type GetNotificationPreferencesRequest struct {
	UserID uint `json:"user_id" binding:"required"`
}

// NotificationPreferencesResponse represents notification preferences response
type NotificationPreferencesResponse struct {
	UserID                uint `json:"user_id"`
	EmailNotifications    bool `json:"email_notifications"`
	PushNotifications     bool `json:"push_notifications"`
	TaskNotifications     bool `json:"task_notifications"`
	DeadlineNotifications bool `json:"deadline_notifications"`
	CommentNotifications  bool `json:"comment_notifications"`
	SystemNotifications   bool `json:"system_notifications"`
}
