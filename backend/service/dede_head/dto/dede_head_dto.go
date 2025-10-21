package dto

import "time"

// AssignRequestRequest represents a request to assign a license request
type AssignRequestRequest struct {
	AssignedToID uint   `json:"assigned_to_id" binding:"required"`
	Comments     string `json:"comments"`
}

// RejectRequestRequest represents a request to reject a forwarded request
type RejectRequestRequest struct {
	Reason   string `json:"reason" binding:"required"`
	Comments string `json:"comments"`
}

// FinalApproveRequestRequest represents a request to provide final approval
type FinalApproveRequestRequest struct {
	Comments string `json:"comments"`
}

// ForwardedRequestResponse represents a forwarded request response
type ForwardedRequestResponse struct {
	ID            uint                 `json:"id"`
	RequestNumber string               `json:"request_number"`
	LicenseType   string               `json:"license_type"`
	Status        string               `json:"status"`
	Title         string               `json:"title"`
	Description   string               `json:"description"`
	RequestDate   time.Time            `json:"request_date"`
	User          ForwardedRequestUser `json:"user"`
	EnergyType    string               `json:"energy_type,omitempty"`
	Capacity      float64              `json:"capacity,omitempty"`
	Province      string               `json:"province,omitempty"`
	LicenseNumber string               `json:"license_number,omitempty"`
	ExpiryDate    *time.Time           `json:"expiry_date,omitempty"`
}

// ForwardedRequestUser represents user information in forwarded request
type ForwardedRequestUser struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
}

// AvailableStaffResponse represents available staff
type AvailableStaffResponse struct {
	ID                 uint   `json:"id"`
	Username           string `json:"username"`
	FullName           string `json:"full_name"`
	Email              string `json:"email"`
	Role               string `json:"role"`
	CurrentAssignments int    `json:"current_assignments"`
	Availability       string `json:"availability"`
}

// HeadDashboardStats represents head dashboard statistics
type HeadDashboardStats struct {
	TotalRequests     int64 `json:"total_requests"`
	ForwardedRequests int64 `json:"forwarded_requests"`
	AssignedRequests  int64 `json:"assigned_requests"`
	CompletedRequests int64 `json:"completed_requests"`
	ApprovedRequests  int64 `json:"approved_requests"`
	RejectedRequests  int64 `json:"rejected_requests"`
	StaffCount        int64 `json:"staff_count"`
	ConsultCount      int64 `json:"consult_count"`
}

// HeadTaskResponse represents a task for head
type HeadTaskResponse struct {
	TaskID      uint                 `json:"task_id"`
	RequestID   uint                 `json:"request_id"`
	LicenseType string               `json:"license_type"`
	Status      string               `json:"status"`
	Title       string               `json:"title"`
	Priority    string               `json:"priority"`
	Deadline    *time.Time           `json:"deadline"`
	AssignedAt  *time.Time           `json:"assigned_at"`
	NextActions []string             `json:"next_actions"`
	RequestUser ForwardedRequestUser `json:"request_user"`
}

// AssignmentResponse represents an assignment response
type AssignmentResponse struct {
	TaskID       uint      `json:"task_id"`
	RequestID    uint      `json:"request_id"`
	LicenseType  string    `json:"license_type"`
	AssignedToID uint      `json:"assigned_to_id"`
	AssignedRole string    `json:"assigned_role"`
	AssignedAt   time.Time `json:"assigned_at"`
	AssignedBy   uint      `json:"assigned_by"`
	Status       string    `json:"status"`
}
