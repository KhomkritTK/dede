package dto

import "time"

// UserInfo represents user information for response
type UserInfo struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
	Status   string `json:"status"`
}

// PaginationResponse represents pagination information
type PaginationResponse struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}

// CreateInspectionRequest represents the create inspection request payload
type CreateInspectionRequest struct {
	RequestID     uint      `json:"request_id" binding:"required"`
	ScheduledDate time.Time `json:"scheduled_date" binding:"required"`
	ScheduledTime string    `json:"scheduled_time" binding:"required"`
	Location      string    `json:"location" binding:"required"`
	Purpose       string    `json:"purpose" binding:"required"`
}

// UpdateInspectionRequest represents the update inspection request payload
type UpdateInspectionRequest struct {
	ScheduledDate   time.Time `json:"scheduled_date"`
	ScheduledTime   string    `json:"scheduled_time"`
	Location        string    `json:"location"`
	Purpose         string    `json:"purpose"`
	Findings        string    `json:"findings"`
	Recommendations string    `json:"recommendations"`
	Notes           string    `json:"notes"`
}

// RescheduleInspectionRequest represents the reschedule inspection request payload
type RescheduleInspectionRequest struct {
	NewDate time.Time `json:"new_date" binding:"required"`
	NewTime string    `json:"new_time" binding:"required"`
	Reason  string    `json:"reason" binding:"required"`
}

// InspectionResponse represents the inspection response
type InspectionResponse struct {
	ID              uint       `json:"id"`
	RequestID       uint       `json:"request_id"`
	RequestNumber   string     `json:"request_number"`
	InspectorID     uint       `json:"inspector_id"`
	Inspector       UserInfo   `json:"inspector"`
	Status          string     `json:"status"`
	ScheduledDate   time.Time  `json:"scheduled_date"`
	ScheduledTime   string     `json:"scheduled_time"`
	Location        string     `json:"location"`
	Purpose         string     `json:"purpose"`
	ActualStartDate *time.Time `json:"actual_start_date"`
	ActualEndDate   *time.Time `json:"actual_end_date"`
	Findings        string     `json:"findings"`
	Recommendations string     `json:"recommendations"`
	Notes           string     `json:"notes"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

// InspectionListResponse represents the inspection list response
type InspectionListResponse struct {
	Inspections []InspectionResponse `json:"inspections"`
	Pagination  PaginationResponse   `json:"pagination"`
}

// InspectionStatusResponse represents the inspection status response
type InspectionStatusResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}
