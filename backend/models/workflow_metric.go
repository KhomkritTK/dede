package models

import (
	"time"
)

type MetricType string

const (
	MetricTypeProcessingTime MetricType = "processing_time"
	MetricTypeInspectionTime MetricType = "inspection_time"
	MetricTypeReviewTime     MetricType = "review_time"
)

type WorkflowMetric struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	RequestID    uint       `json:"request_id" gorm:"not null;index"`
	LicenseType  string     `json:"license_type" gorm:"not null"`
	MetricType   MetricType `json:"metric_type" gorm:"not null"`
	MetricValue  float64    `json:"metric_value" gorm:"not null"`
	MetricUnit   string     `json:"metric_unit" gorm:"not null;default:'days'"`
	StartTime    time.Time  `json:"start_time" gorm:"not null"`
	EndTime      time.Time  `json:"end_time" gorm:"not null"`
	AssignedToID *uint      `json:"assigned_to_id" gorm:"index"`
	AssignedTo   *User      `json:"assigned_to" gorm:"foreignKey:AssignedToID"`
	CreatedAt    time.Time  `json:"created_at"`
}

// TableName specifies the table name for the WorkflowMetric model
func (WorkflowMetric) TableName() string {
	return "workflow_metrics"
}

// GetDuration calculates the duration between start and end time
func (wm *WorkflowMetric) GetDuration() time.Duration {
	return wm.EndTime.Sub(wm.StartTime)
}

// GetDurationInDays returns the duration in days
func (wm *WorkflowMetric) GetDurationInDays() float64 {
	duration := wm.GetDuration()
	return duration.Hours() / 24
}

// GetMetricTypeDisplayName returns the display name for the metric type
func (wm *WorkflowMetric) GetMetricTypeDisplayName() string {
	switch wm.MetricType {
	case MetricTypeProcessingTime:
		return "เวลาดำเนินการ"
	case MetricTypeInspectionTime:
		return "เวลาตรวจสอบ"
	case MetricTypeReviewTime:
		return "เวลาตรวจสอบ"
	default:
		return string(wm.MetricType)
	}
}

// IsProcessingTime checks if the metric is processing time
func (wm *WorkflowMetric) IsProcessingTime() bool {
	return wm.MetricType == MetricTypeProcessingTime
}

// IsInspectionTime checks if the metric is inspection time
func (wm *WorkflowMetric) IsInspectionTime() bool {
	return wm.MetricType == MetricTypeInspectionTime
}

// IsReviewTime checks if the metric is review time
func (wm *WorkflowMetric) IsReviewTime() bool {
	return wm.MetricType == MetricTypeReviewTime
}
