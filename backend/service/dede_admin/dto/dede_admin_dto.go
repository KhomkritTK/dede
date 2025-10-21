package dto

import "time"

// AcceptRequestRequest represents a request to accept a license request
type AcceptRequestRequest struct {
	Comments string `json:"comments"`
}

// RejectRequestRequest represents a request to reject a license request
type RejectRequestRequest struct {
	Reason   string `json:"reason" binding:"required"`
	Comments string `json:"comments"`
}

// ReturnRequestRequest represents a request to return a license request to user
type ReturnRequestRequest struct {
	Reason   string `json:"reason" binding:"required"`
	Comments string `json:"comments"`
}

// ForwardRequestRequest represents a request to forward a license request
type ForwardRequestRequest struct {
	Reason   string `json:"reason" binding:"required"`
	Comments string `json:"comments"`
}

// PendingRequestResponse represents a pending request response
type PendingRequestResponse struct {
	ID            uint               `json:"id"`
	RequestNumber string             `json:"request_number"`
	LicenseType   string             `json:"license_type"`
	Status        string             `json:"status"`
	Title         string             `json:"title"`
	Description   string             `json:"description"`
	RequestDate   time.Time          `json:"request_date"`
	User          PendingRequestUser `json:"user"`
	EnergyType    string             `json:"energy_type,omitempty"`
	Capacity      float64            `json:"capacity,omitempty"`
	Province      string             `json:"province,omitempty"`
	LicenseNumber string             `json:"license_number,omitempty"`
	ExpiryDate    *time.Time         `json:"expiry_date,omitempty"`
}

// PendingRequestUser represents user information in pending request
type PendingRequestUser struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
}

// AdminDashboardStats represents admin dashboard statistics
type AdminDashboardStats struct {
	TotalRequests     int64 `json:"total_requests"`
	PendingRequests   int64 `json:"pending_requests"`
	AcceptedRequests  int64 `json:"accepted_requests"`
	RejectedRequests  int64 `json:"rejected_requests"`
	ReturnedRequests  int64 `json:"returned_requests"`
	ForwardedRequests int64 `json:"forwarded_requests"`
}

// AdminTaskResponse represents a task for admin
type AdminTaskResponse struct {
	TaskID      uint               `json:"task_id"`
	RequestID   uint               `json:"request_id"`
	LicenseType string             `json:"license_type"`
	Status      string             `json:"status"`
	Title       string             `json:"title"`
	Priority    string             `json:"priority"`
	Deadline    *time.Time         `json:"deadline"`
	AssignedAt  *time.Time         `json:"assigned_at"`
	NextActions []string           `json:"next_actions"`
	RequestUser PendingRequestUser `json:"request_user"`
}

// AdminNotificationRequest represents a notification request
type AdminNotificationRequest struct {
	Title         string `json:"title" binding:"required"`
	Message       string `json:"message" binding:"required"`
	Priority      string `json:"priority"`
	RecipientID   *uint  `json:"recipient_id"`
	RecipientRole string `json:"recipient_role"`
	EntityType    string `json:"entity_type"`
	EntityID      *uint  `json:"entity_id"`
	ActionURL     string `json:"action_url"`
}
