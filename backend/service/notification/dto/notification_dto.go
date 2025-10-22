package dto

import "time"

// CreateNotificationRequest represents a request to create a notification
type CreateNotificationRequest struct {
	Title         string `json:"title" binding:"required"`
	Message       string `json:"message" binding:"required"`
	Type          string `json:"type" binding:"required"`
	Priority      string `json:"priority"`
	RecipientID   *uint  `json:"recipient_id"`
	RecipientRole string `json:"recipient_role"`
	EntityType    string `json:"entity_type"`
	EntityID      *uint  `json:"entity_id"`
	ActionURL     string `json:"action_url"`
	IsEmailSent   bool   `json:"is_email_sent"`
}

// GetNotificationsRequest represents a request to get notifications
type GetNotificationsRequest struct {
	Page          int        `json:"page"`
	Limit         int        `json:"limit"`
	Type          string     `json:"type"`
	Priority      string     `json:"priority"`
	IsRead        *bool      `json:"is_read"`
	StartDate     *time.Time `json:"start_date"`
	EndDate       *time.Time `json:"end_date"`
	RecipientRole string     `json:"recipient_role"`
}

// BroadcastNotificationRequest represents a request to broadcast a notification
type BroadcastNotificationRequest struct {
	Title          string   `json:"title" binding:"required"`
	Message        string   `json:"message" binding:"required"`
	Type           string   `json:"type" binding:"required"`
	Priority       string   `json:"priority"`
	RecipientIDs   []uint   `json:"recipient_ids"`
	RecipientRoles []string `json:"recipient_roles"`
	EntityType     string   `json:"entity_type"`
	EntityID       *uint    `json:"entity_id"`
	ActionURL      string   `json:"action_url"`
}

// UpdateNotificationSettingsRequest represents a request to update notification settings
type UpdateNotificationSettingsRequest struct {
	EmailNotifications   *bool `json:"email_notifications"`
	PushNotifications    *bool `json:"push_notifications"`
	RequestAssigned      *bool `json:"request_assigned"`
	RequestStatusChanged *bool `json:"request_status_changed"`
	DeadlineReminder     *bool `json:"deadline_reminder"`
	OverdueAlert         *bool `json:"overdue_alert"`
	SystemAnnouncements  *bool `json:"system_announcements"`
}

// NotificationResponse represents a notification response
type NotificationResponse struct {
	ID            uint       `json:"id"`
	RecipientID   *uint      `json:"recipient_id"`
	RecipientRole string     `json:"recipient_role"`
	Type          string     `json:"type"`
	Title         string     `json:"title"`
	Message       string     `json:"message"`
	Priority      string     `json:"priority"`
	EntityType    string     `json:"entity_type"`
	EntityID      *uint      `json:"entity_id"`
	ActionURL     string     `json:"action_url"`
	IsRead        bool       `json:"is_read"`
	IsSent        bool       `json:"is_sent"`
	IsEmailSent   bool       `json:"is_email_sent"`
	ReadAt        *time.Time `json:"read_at"`
	SentAt        *time.Time `json:"sent_at"`
	EmailSentAt   *time.Time `json:"email_sent_at"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// NotificationStatisticsResponse represents notification statistics
type NotificationStatisticsResponse struct {
	TotalNotifications  int64 `json:"total_notifications"`
	UnreadNotifications int64 `json:"unread_notifications"`
	ReadNotifications   int64 `json:"read_notifications"`
	HighPriorityCount   int64 `json:"high_priority_count"`
	NormalPriorityCount int64 `json:"normal_priority_count"`
	LowPriorityCount    int64 `json:"low_priority_count"`
}

// NotificationSettingsResponse represents notification settings
type NotificationSettingsResponse struct {
	EmailNotifications   bool `json:"email_notifications"`
	PushNotifications    bool `json:"push_notifications"`
	RequestAssigned      bool `json:"request_assigned"`
	RequestStatusChanged bool `json:"request_status_changed"`
	DeadlineReminder     bool `json:"deadline_reminder"`
	OverdueAlert         bool `json:"overdue_alert"`
	SystemAnnouncements  bool `json:"system_announcements"`
}

// StateChangeNotificationRequest represents a request to create a state change notification
type StateChangeNotificationRequest struct {
	RequestID   uint     `json:"request_id" binding:"required"`
	LicenseType string   `json:"license_type" binding:"required"`
	FromStatus  string   `json:"from_status" binding:"required"`
	ToStatus    string   `json:"to_status" binding:"required"`
	ChangedBy   uint     `json:"changed_by" binding:"required"`
	Recipients  []uint   `json:"recipients"`
	Roles       []string `json:"roles"`
}

// NotificationTypeResponse represents a notification type response
type NotificationTypeResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// NotificationPriorityResponse represents a notification priority response
type NotificationPriorityResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// NotificationListResponse represents a list of notifications with pagination
type NotificationListResponse struct {
	Notifications []NotificationResponse `json:"notifications"`
	Pagination    PaginationResponse     `json:"pagination"`
}

// NotificationCountResponse represents notification count
type NotificationCountResponse struct {
	Total  int64 `json:"total"`
	Unread int64 `json:"unread"`
}

// PaginationResponse represents pagination information
type PaginationResponse struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}
