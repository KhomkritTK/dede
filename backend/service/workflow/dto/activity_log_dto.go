package dto

import (
	"eservice-backend/models"
	"time"
)

// LogActivityRequest represents a request to log an activity
type LogActivityRequest struct {
	EntityType     string                `json:"entity_type" binding:"required"`
	EntityID       uint                  `json:"entity_id" binding:"required"`
	UserID         uint                  `json:"user_id" binding:"required"`
	PreviousStatus *models.RequestStatus `json:"previous_status"`
	NewStatus      *models.RequestStatus `json:"new_status"`
	Reason         string                `json:"reason"`
}

// GetActivityLogsRequest represents a request to get activity logs
type GetActivityLogsRequest struct {
	Page       int        `json:"page"`
	Limit      int        `json:"limit"`
	EntityType string     `json:"entity_type"`
	EntityID   *uint      `json:"entity_id"`
	UserID     *uint      `json:"user_id"`
	Status     string     `json:"status"`
	StartDate  *time.Time `json:"start_date"`
	EndDate    *time.Time `json:"end_date"`
}

// ExportActivityLogsRequest represents a request to export activity logs
type ExportActivityLogsRequest struct {
	EntityType string     `json:"entity_type"`
	EntityID   *uint      `json:"entity_id"`
	UserID     *uint      `json:"user_id"`
	Status     string     `json:"status"`
	StartDate  *time.Time `json:"start_date"`
	EndDate    *time.Time `json:"end_date"`
}

// ActivityLogResponse represents an activity log response
type ActivityLogResponse struct {
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

// ActivityStatisticsResponse represents activity statistics
type ActivityStatisticsResponse struct {
	TotalActivities            int64         `json:"total_activities"`
	NewLicenseActivities       int64         `json:"new_license_activities"`
	RenewalLicenseActivities   int64         `json:"renewal_license_activities"`
	ExtensionLicenseActivities int64         `json:"extension_license_activities"`
	ReductionLicenseActivities int64         `json:"reduction_license_activities"`
	ActivitiesByStatus         []StatusCount `json:"activities_by_status"`
	ActivitiesByDate           []DateCount   `json:"activities_by_date"`
	ActivitiesByUser           []UserCount   `json:"activities_by_user"`
}

// StatusCount represents a count by status
type StatusCount struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

// DateCount represents a count by date
type DateCount struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}
