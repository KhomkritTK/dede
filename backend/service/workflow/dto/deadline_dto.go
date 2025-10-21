package dto

import "time"

// CreateDeadlineRequest represents a request to create a deadline
type CreateDeadlineRequest struct {
	EntityType   string     `json:"entity_type" binding:"required"`
	EntityID     uint       `json:"entity_id" binding:"required"`
	Title        string     `json:"title" binding:"required"`
	Description  string     `json:"description"`
	AssignedByID uint       `json:"assigned_by_id" binding:"required"`
	AssignedToID *uint      `json:"assigned_to_id"`
	Priority     string     `json:"priority"`
	DeadlineDate *time.Time `json:"deadline_date" binding:"required"`
	ReminderDays *int       `json:"reminder_days"`
}

// UpdateDeadlineRequest represents a request to update a deadline
type UpdateDeadlineRequest struct {
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	Priority     string     `json:"priority"`
	DeadlineDate *time.Time `json:"deadline_date"`
	ReminderDays *int       `json:"reminder_days"`
	Status       string     `json:"status"`
}

// CompleteDeadlineRequest represents a request to complete a deadline
type CompleteDeadlineRequest struct {
	Notes string `json:"notes"`
}

// DeadlineResponse represents a deadline response
type DeadlineResponse struct {
	ID              uint       `json:"id"`
	EntityType      string     `json:"entity_type"`
	EntityID        uint       `json:"entity_id"`
	Title           string     `json:"title"`
	Description     string     `json:"description"`
	AssignedByID    uint       `json:"assigned_by_id"`
	AssignedBy      User       `json:"assigned_by"`
	AssignedToID    *uint      `json:"assigned_to_id"`
	AssignedTo      *User      `json:"assigned_to"`
	Status          string     `json:"status"`
	Priority        string     `json:"priority"`
	DeadlineDate    *time.Time `json:"deadline_date"`
	ReminderDays    *int       `json:"reminder_days"`
	CompletedAt     *time.Time `json:"completed_at"`
	CompletionNotes string     `json:"completion_notes"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

// GetDeadlinesRequest represents a request to get deadlines
type GetDeadlinesRequest struct {
	Page       int        `json:"page"`
	Limit      int        `json:"limit"`
	UserID     *uint      `json:"user_id"`
	Role       string     `json:"role"`
	Status     string     `json:"status"`
	EntityType string     `json:"entity_type"`
	EntityID   *uint      `json:"entity_id"`
	Priority   string     `json:"priority"`
	StartDate  *time.Time `json:"start_date"`
	EndDate    *time.Time `json:"end_date"`
}

// GetOverdueDeadlinesRequest represents a request to get overdue deadlines
type GetOverdueDeadlinesRequest struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
}

// DeadlineStatisticsResponse represents deadline statistics
type DeadlineStatisticsResponse struct {
	TotalDeadlines          int64         `json:"total_deadlines"`
	PendingDeadlines        int64         `json:"pending_deadlines"`
	CompletedDeadlines      int64         `json:"completed_deadlines"`
	OverdueDeadlines        int64         `json:"overdue_deadlines"`
	LowPriorityDeadlines    int64         `json:"low_priority_deadlines"`
	NormalPriorityDeadlines int64         `json:"normal_priority_deadlines"`
	HighPriorityDeadlines   int64         `json:"high_priority_deadlines"`
	DeadlinesByEntityType   []EntityCount `json:"deadlines_by_entity_type"`
}

// EntityCount represents a count by entity type
type EntityCount struct {
	EntityType string `json:"entity_type"`
	Count      int64  `json:"count"`
}

// OverdueDeadlineResponse represents an overdue deadline
type OverdueDeadlineResponse struct {
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
	DaysOverdue  int        `json:"days_overdue"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// ProcessDeadlinesRequest represents a request to process deadlines
type ProcessDeadlinesRequest struct {
	// Empty request body, just triggers the processing
}
