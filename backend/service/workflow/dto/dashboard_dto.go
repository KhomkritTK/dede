package dto

import (
	"eservice-backend/models"
	"time"
)

// DashboardResponse represents a generic dashboard response
type DashboardResponse struct {
	Role              string      `json:"role"`
	Statistics        interface{} `json:"statistics"`
	RecentActivities  interface{} `json:"recent_activities"`
	UpcomingDeadlines interface{} `json:"upcoming_deadlines"`
	PendingTasks      interface{} `json:"pending_tasks"`
	Notifications     interface{} `json:"notifications"`
}

// AdminDashboardResponse represents an admin dashboard response
type AdminDashboardResponse struct {
	Statistics        map[string]interface{}  `json:"statistics"`
	RecentActivities  []models.ServiceFlowLog `json:"recent_activities"`
	UpcomingDeadlines []models.TaskAssignment `json:"upcoming_deadlines"`
	PendingTasks      []models.TaskAssignment `json:"pending_tasks"`
	Notifications     []models.Notification   `json:"notifications"`
}

// DEDEHeadDashboardResponse represents a DEDE Head dashboard response
type DEDEHeadDashboardResponse struct {
	Statistics        map[string]interface{}  `json:"statistics"`
	RecentActivities  []models.ServiceFlowLog `json:"recent_activities"`
	UpcomingDeadlines []models.TaskAssignment `json:"upcoming_deadlines"`
	PendingTasks      []models.TaskAssignment `json:"pending_tasks"`
	Notifications     []models.Notification   `json:"notifications"`
}

// DEDEStaffDashboardResponse represents a DEDE Staff dashboard response
type DEDEStaffDashboardResponse struct {
	Statistics        map[string]interface{}  `json:"statistics"`
	RecentActivities  []models.ServiceFlowLog `json:"recent_activities"`
	UpcomingDeadlines []models.TaskAssignment `json:"upcoming_deadlines"`
	PendingTasks      []models.TaskAssignment `json:"pending_tasks"`
	Notifications     []models.Notification   `json:"notifications"`
}

// DEDEConsultDashboardResponse represents a DEDE Consult dashboard response
type DEDEConsultDashboardResponse struct {
	Statistics        map[string]interface{}  `json:"statistics"`
	RecentActivities  []models.ServiceFlowLog `json:"recent_activities"`
	UpcomingDeadlines []models.TaskAssignment `json:"upcoming_deadlines"`
	PendingTasks      []models.TaskAssignment `json:"pending_tasks"`
	Notifications     []models.Notification   `json:"notifications"`
}

// DashboardStatisticsResponse represents dashboard statistics
type DashboardStatisticsResponse struct {
	TotalRequests    int64 `json:"total_requests"`
	NewRequests      int64 `json:"new_requests"`
	PendingRequests  int64 `json:"pending_requests"`
	ApprovedRequests int64 `json:"approved_requests"`
	RejectedRequests int64 `json:"rejected_requests"`
	OverdueRequests  int64 `json:"overdue_requests"`
	PendingTasks     int64 `json:"pending_tasks"`
	CompletedTasks   int64 `json:"completed_tasks"`
	OverdueTasks     int64 `json:"overdue_tasks"`
}

// RecentActivityResponse represents a recent activity
type RecentActivityResponse struct {
	ID               uint      `json:"id"`
	LicenseType      string    `json:"license_type"`
	LicenseRequestID uint      `json:"license_request_id"`
	PreviousStatus   string    `json:"previous_status"`
	NewStatus        string    `json:"new_status"`
	ChangedBy        uint      `json:"changed_by"`
	ChangedByUser    User      `json:"changed_by_user"`
	ChangeReason     string    `json:"change_reason"`
	CreatedAt        time.Time `json:"created_at"`
}

// PendingTaskResponse represents a pending task
type PendingTaskResponse struct {
	ID             uint       `json:"id"`
	RequestID      uint       `json:"request_id"`
	LicenseType    string     `json:"license_type"`
	TaskTitle      string     `json:"task_title"`
	Description    string     `json:"description"`
	AssignedTo     uint       `json:"assigned_to"`
	AssignedToUser User       `json:"assigned_to_user"`
	Status         string     `json:"status"`
	Priority       string     `json:"priority"`
	Deadline       *time.Time `json:"deadline"`
	CreatedAt      time.Time  `json:"created_at"`
}

// GetDashboardRequest represents a request to get dashboard data
type GetDashboardRequest struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
}

// GetRecentActivitiesRequest represents a request to get recent activities
type GetRecentActivitiesRequest struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	Limit  int    `json:"limit"`
}

// GetPendingTasksRequest represents a request to get pending tasks
type GetPendingTasksRequest struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	Limit  int    `json:"limit"`
}
