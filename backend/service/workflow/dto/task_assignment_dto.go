package dto

import "time"

// CreateTaskRequest represents a request to create a task
type CreateTaskRequest struct {
	RequestID    uint       `json:"request_id" binding:"required"`
	TaskTitle    string     `json:"task_title" binding:"required"`
	Description  string     `json:"description"`
	AssignedByID uint       `json:"assigned_by_id" binding:"required"`
	AssignedToID *uint      `json:"assigned_to_id"`
	Priority     string     `json:"priority"`
	Deadline     *time.Time `json:"deadline"`
}

// UpdateTaskRequest represents a request to update a task
type UpdateTaskRequest struct {
	TaskTitle   string     `json:"task_title"`
	Description string     `json:"description"`
	Priority    string     `json:"priority"`
	Deadline    *time.Time `json:"deadline"`
	Status      string     `json:"status"`
}

// CompleteTaskRequest represents a request to complete a task
type CompleteTaskRequest struct {
	Notes string `json:"notes"`
}

// TaskResponse represents a task response
type TaskResponse struct {
	ID              uint       `json:"id"`
	RequestID       uint       `json:"request_id"`
	TaskTitle       string     `json:"task_title"`
	Description     string     `json:"description"`
	AssignedByID    uint       `json:"assigned_by_id"`
	AssignedBy      User       `json:"assigned_by"`
	AssignedToID    *uint      `json:"assigned_to_id"`
	AssignedTo      *User      `json:"assigned_to"`
	Status          string     `json:"status"`
	Priority        string     `json:"priority"`
	Deadline        *time.Time `json:"deadline"`
	CompletedAt     *time.Time `json:"completed_at"`
	CompletionNotes string     `json:"completion_notes"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

// GetTasksRequest represents a request to get tasks
type GetTasksRequest struct {
	Page      int        `json:"page"`
	Limit     int        `json:"limit"`
	UserID    *uint      `json:"user_id"`
	Role      string     `json:"role"`
	Status    string     `json:"status"`
	RequestID *uint      `json:"request_id"`
	Priority  string     `json:"priority"`
	StartDate *time.Time `json:"start_date"`
	EndDate   *time.Time `json:"end_date"`
}

// AssignTaskRequest represents a request to assign a task
type AssignTaskRequest struct {
	TaskID uint `json:"task_id" binding:"required"`
	UserID uint `json:"user_id" binding:"required"`
}

// ReassignTaskRequest represents a request to reassign a task
type ReassignTaskRequest struct {
	TaskID     uint `json:"task_id" binding:"required"`
	FromUserID uint `json:"from_user_id" binding:"required"`
	ToUserID   uint `json:"to_user_id" binding:"required"`
}

// TaskStatisticsResponse represents task statistics
type TaskStatisticsResponse struct {
	TotalTasks          int64       `json:"total_tasks"`
	PendingTasks        int64       `json:"pending_tasks"`
	AssignedTasks       int64       `json:"assigned_tasks"`
	ReassignedTasks     int64       `json:"reassigned_tasks"`
	CompletedTasks      int64       `json:"completed_tasks"`
	LowPriorityTasks    int64       `json:"low_priority_tasks"`
	NormalPriorityTasks int64       `json:"normal_priority_tasks"`
	HighPriorityTasks   int64       `json:"high_priority_tasks"`
	OverdueTasks        int64       `json:"overdue_tasks"`
	TasksByUser         []UserCount `json:"tasks_by_user"`
}

// OverdueTaskResponse represents an overdue task
type OverdueTaskResponse struct {
	ID           uint       `json:"id"`
	RequestID    uint       `json:"request_id"`
	TaskTitle    string     `json:"task_title"`
	Description  string     `json:"description"`
	AssignedByID uint       `json:"assigned_by_id"`
	AssignedBy   User       `json:"assigned_by"`
	AssignedToID *uint      `json:"assigned_to_id"`
	AssignedTo   *User      `json:"assigned_to"`
	Status       string     `json:"status"`
	Priority     string     `json:"priority"`
	Deadline     *time.Time `json:"deadline"`
	DaysOverdue  int        `json:"days_overdue"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// UpcomingTaskResponse represents an upcoming task
type UpcomingTaskResponse struct {
	ID           uint       `json:"id"`
	RequestID    uint       `json:"request_id"`
	TaskTitle    string     `json:"task_title"`
	Description  string     `json:"description"`
	AssignedByID uint       `json:"assigned_by_id"`
	AssignedBy   User       `json:"assigned_by"`
	AssignedToID *uint      `json:"assigned_to_id"`
	AssignedTo   *User      `json:"assigned_to"`
	Status       string     `json:"status"`
	Priority     string     `json:"priority"`
	Deadline     *time.Time `json:"deadline"`
	DaysUntil    int        `json:"days_until"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// GetOverdueTasksRequest represents a request to get overdue tasks
type GetOverdueTasksRequest struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
}

// GetUpcomingTasksRequest represents a request to get upcoming tasks
type GetUpcomingTasksRequest struct {
	Days  int `json:"days" binding:"required"`
	Page  int `json:"page"`
	Limit int `json:"limit"`
}
