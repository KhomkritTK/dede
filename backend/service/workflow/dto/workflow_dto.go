package dto

import (
	"eservice-backend/models"
	"time"
)

// WorkflowStateResponse represents the response for workflow state
type WorkflowStateResponse struct {
	CurrentState     models.WorkflowState        `json:"current_state"`
	ValidTransitions []models.WorkflowTransition `json:"valid_transitions"`
	Progress         int                         `json:"progress"`
	NextActions      []string                    `json:"next_actions"`
	Description      string                      `json:"description"`
	IsTerminal       bool                        `json:"is_terminal"`
}

// WorkflowTransitionRequest represents a request to transition workflow state
type WorkflowTransitionRequest struct {
	RequestID       uint                 `json:"request_id" binding:"required"`
	LicenseType     string               `json:"license_type" binding:"required"`
	FromStatus      models.RequestStatus `json:"from_status" binding:"required"`
	ToStatus        models.RequestStatus `json:"to_status" binding:"required"`
	AssignedToID    uint                 `json:"assigned_to_id"`
	Comments        string               `json:"comments"`
	AutoApproved    bool                 `json:"auto_approved"`
	UserID          uint                 `json:"user_id"`
	UserRole        models.UserRole      `json:"user_role"`
	AppointmentDate *time.Time           `json:"appointment_date"`
}

// WorkflowHistoryResponse represents the response for workflow history
type WorkflowHistoryResponse struct {
	ID               uint                  `json:"id"`
	LicenseRequestID uint                  `json:"license_request_id"`
	PreviousStatus   *models.RequestStatus `json:"previous_status"`
	NewStatus        models.RequestStatus  `json:"new_status"`
	ChangedBy        uint                  `json:"changed_by"`
	ChangedByUser    *models.User          `json:"changed_by_user"`
	ChangeReason     string                `json:"change_reason"`
	LicenseType      string                `json:"license_type"`
	CreatedAt        time.Time             `json:"created_at"`
}

// WorkflowDiagramResponse represents the response for workflow diagram
type WorkflowDiagramResponse struct {
	Nodes   []WorkflowNode         `json:"nodes"`
	Edges   []WorkflowEdge         `json:"edges"`
	Summary map[string]interface{} `json:"summary"`
}

// WorkflowNode represents a node in the workflow diagram
type WorkflowNode struct {
	ID          string                 `json:"id"`
	Label       string                 `json:"label"`
	Description string                 `json:"description"`
	Progress    int                    `json:"progress"`
	Position    map[string]interface{} `json:"position"`
}

// WorkflowEdge represents an edge in the workflow diagram
type WorkflowEdge struct {
	From string `json:"from"`
	To   string `json:"to"`
	Type string `json:"type"`
}

// TaskAssignmentRequest represents a request to assign a task
type TaskAssignmentRequest struct {
	RequestID       uint            `json:"request_id" binding:"required"`
	LicenseType     string          `json:"license_type" binding:"required"`
	AssignedToID    uint            `json:"assigned_to_id" binding:"required"`
	AssignedRole    models.UserRole `json:"assigned_role" binding:"required"`
	Comments        string          `json:"comments"`
	AppointmentDate *time.Time      `json:"appointment_date"`
}

// TaskAssignmentResponse represents the response for task assignment
type TaskAssignmentResponse struct {
	RequestID    uint            `json:"request_id"`
	AssignedToID uint            `json:"assigned_to_id"`
	AssignedRole models.UserRole `json:"assigned_role"`
	AssignedAt   time.Time       `json:"assigned_at"`
	AssignedBy   uint            `json:"assigned_by"`
	Status       string          `json:"status"`
}

// OverdueCheckResponse represents the response for overdue check
type OverdueCheckResponse struct {
	OverdueProcessed int       `json:"overdue_processed"`
	Errors           []string  `json:"errors"`
	ProcessedAt      time.Time `json:"processed_at"`
}

// DashboardStatsResponse represents the response for dashboard statistics
type DashboardStatsResponse struct {
	TotalRequests      int64 `json:"total_requests"`
	PendingRequests    int64 `json:"pending_requests"`
	InProgressRequests int64 `json:"in_progress_requests"`
	CompletedRequests  int64 `json:"completed_requests"`
	RejectedRequests   int64 `json:"rejected_requests"`
	OverdueRequests    int64 `json:"overdue_requests"`
}

// RoleTaskResponse represents tasks for a specific role
type RoleTaskResponse struct {
	TaskID      uint                 `json:"task_id"`
	RequestID   uint                 `json:"request_id"`
	LicenseType string               `json:"license_type"`
	Status      models.RequestStatus `json:"status"`
	Title       string               `json:"title"`
	Priority    string               `json:"priority"`
	Deadline    *time.Time           `json:"deadline"`
	AssignedAt  *time.Time           `json:"assigned_at"`
	NextActions []string             `json:"next_actions"`
	RequestUser *models.User         `json:"request_user"`
}

// NotificationRequest represents a notification request
type NotificationRequest struct {
	Title         string                      `json:"title" binding:"required"`
	Message       string                      `json:"message" binding:"required"`
	Type          models.NotificationType     `json:"type" binding:"required"`
	Priority      models.NotificationPriority `json:"priority"`
	RecipientID   *uint                       `json:"recipient_id"`
	RecipientRole *models.UserRole            `json:"recipient_role"`
	EntityType    string                      `json:"entity_type"`
	EntityID      *uint                       `json:"entity_id"`
	ActionURL     string                      `json:"action_url"`
}

// WorkflowSummary represents a summary of the workflow
type WorkflowSummary struct {
	TotalStates     int      `json:"total_states"`
	TerminalStates  []string `json:"terminal_states"`
	AutoTransitions []string `json:"auto_transitions"`
	Roles           []string `json:"roles"`
	MaxDaysDelay    int      `json:"max_days_delay"`
}
