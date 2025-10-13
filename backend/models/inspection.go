package models

import (
	"time"

	"gorm.io/gorm"
)

type InspectionStatus string

const (
	InspectionStatusScheduled  InspectionStatus = "scheduled"   // นัดหมาย
	InspectionStatusInProgress InspectionStatus = "in_progress" // กำลังตรวจสอบ
	InspectionStatusCompleted  InspectionStatus = "completed"   // เสร็จสิ้น
	InspectionStatusCancelled  InspectionStatus = "cancelled"   // ยกเลิก
)

type Inspection struct {
	ID               uint             `json:"id" gorm:"primaryKey"`
	RequestID        uint             `json:"request_id" gorm:"not null;index"`
	Request          LicenseRequest   `json:"request" gorm:"foreignKey:RequestID"`
	InspectorID      uint             `json:"inspector_id" gorm:"not null;index"`
	Inspector        User             `json:"inspector" gorm:"foreignKey:InspectorID"`
	Status           InspectionStatus `json:"status" gorm:"not null;default:'scheduled'"`
	ScheduledDate    time.Time        `json:"scheduled_date" gorm:"not null"`
	ScheduledTime    string           `json:"scheduled_time"`
	Location         string           `json:"location" gorm:"not null"`
	Purpose          string           `json:"purpose"`
	Notes            string           `json:"notes"`
	ActualStartDate  *time.Time       `json:"actual_start_date"`
	ActualEndDate    *time.Time       `json:"actual_end_date"`
	Findings         string           `json:"findings"`
	Recommendations  string           `json:"recommendations"`
	FollowUpRequired bool             `json:"follow_up_required" gorm:"default:false"`
	FollowUpDate     *time.Time       `json:"follow_up_date"`
	CreatedAt        time.Time        `json:"created_at"`
	UpdatedAt        time.Time        `json:"updated_at"`
	DeletedAt        gorm.DeletedAt   `json:"-" gorm:"index"`
}

// TableName specifies the table name for the Inspection model
func (Inspection) TableName() string {
	return "inspections"
}

// IsScheduled checks if the inspection is scheduled
func (i *Inspection) IsScheduled() bool {
	return i.Status == InspectionStatusScheduled
}

// IsInProgress checks if the inspection is in progress
func (i *Inspection) IsInProgress() bool {
	return i.Status == InspectionStatusInProgress
}

// IsCompleted checks if the inspection is completed
func (i *Inspection) IsCompleted() bool {
	return i.Status == InspectionStatusCompleted
}

// IsCancelled checks if the inspection is cancelled
func (i *Inspection) IsCancelled() bool {
	return i.Status == InspectionStatusCancelled
}

// CanStart checks if the inspection can be started
func (i *Inspection) CanStart() bool {
	return i.Status == InspectionStatusScheduled && time.Now().After(i.ScheduledDate)
}

// CanComplete checks if the inspection can be completed
func (i *Inspection) CanComplete() bool {
	return i.Status == InspectionStatusInProgress
}

// CanCancel checks if the inspection can be cancelled
func (i *Inspection) CanCancel() bool {
	return i.Status == InspectionStatusScheduled
}

// GetDuration calculates the duration of the inspection
func (i *Inspection) GetDuration() time.Duration {
	if i.ActualStartDate != nil && i.ActualEndDate != nil {
		return i.ActualEndDate.Sub(*i.ActualStartDate)
	}
	return 0
}
