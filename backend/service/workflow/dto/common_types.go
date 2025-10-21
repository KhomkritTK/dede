package dto

import "time"

// User represents user information across workflow DTOs
type User struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
}

// UserCount represents a count by user
type UserCount struct {
	UserID uint   `json:"user_id"`
	Name   string `json:"name"`
	Count  int64  `json:"count"`
}

// PaginationResponse represents pagination information
type PaginationResponse struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}

// NotificationResponse represents a notification response
type NotificationResponse struct {
	ID            uint       `json:"id"`
	Title         string     `json:"title"`
	Message       string     `json:"message"`
	Type          string     `json:"type"`
	Priority      string     `json:"priority"`
	RecipientID   *uint      `json:"recipient_id"`
	RecipientRole string     `json:"recipient_role"`
	EntityType    string     `json:"entity_type"`
	EntityID      *uint      `json:"entity_id"`
	ActionURL     string     `json:"action_url"`
	ScheduledAt   *time.Time `json:"scheduled_at"`
	SentAt        *time.Time `json:"sent_at"`
	ReadAt        *time.Time `json:"read_at"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// GetNotificationsRequest represents a request to get notifications
type GetNotificationsRequest struct {
	Page       int        `json:"page"`
	Limit      int        `json:"limit"`
	UserID     *uint      `json:"user_id"`
	Role       string     `json:"role"`
	Status     string     `json:"status"`
	Type       string     `json:"type"`
	Priority   string     `json:"priority"`
	UnreadOnly bool       `json:"unread_only"`
	StartDate  *time.Time `json:"start_date"`
	EndDate    *time.Time `json:"end_date"`
}

// UpcomingDeadlineResponse represents an upcoming deadline
type UpcomingDeadlineResponse struct {
	ID           uint       `json:"id"`
	EntityType   string     `json:"entity_type"`
	EntityID     uint       `json:"entity_id"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	AssignedByID uint       `json:"assigned_by_id"`
	AssignedBy   User       `json:"assigned_by"`
	AssignedToID *uint      `json:"assigned_to_id"`
	AssignedTo   *User      `json:"assigned_to"`
	Status       string     `json:"status"`
	Priority     string     `json:"priority"`
	DeadlineDate *time.Time `json:"deadline_date"`
	DaysUntil    int        `json:"days_until"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// GetUpcomingDeadlinesRequest represents a request to get upcoming deadlines
type GetUpcomingDeadlinesRequest struct {
	Days  int `json:"days" binding:"required"`
	Page  int `json:"page"`
	Limit int `json:"limit"`
}
