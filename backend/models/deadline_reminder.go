package models

import (
	"time"

	"gorm.io/gorm"
)

type DeadlineType string

const (
	DeadlineTypeAppointment    DeadlineType = "appointment"
	DeadlineTypeDocumentReview DeadlineType = "document_review"
	DeadlineTypeInspection     DeadlineType = "inspection"
)

type DeadlineReminderStatus string

const (
	DeadlineReminderStatusActive    DeadlineReminderStatus = "active"
	DeadlineReminderStatusExpired   DeadlineReminderStatus = "expired"
	DeadlineReminderStatusCancelled DeadlineReminderStatus = "cancelled"
)

type DeadlineReminder struct {
	ID                  uint                   `json:"id" gorm:"primaryKey"`
	RequestID           uint                   `json:"request_id" gorm:"not null;index"`
	LicenseType         string                 `json:"license_type" gorm:"not null"`
	DeadlineType        DeadlineType           `json:"deadline_type" gorm:"not null"`
	DeadlineDate        time.Time              `json:"deadline_date" gorm:"not null"`
	ReminderSent3D      bool                   `json:"reminder_sent_3d" gorm:"default:false"`
	ReminderSent1D      bool                   `json:"reminder_sent_1d" gorm:"default:false"`
	ReminderSentOverdue bool                   `json:"reminder_sent_overdue" gorm:"default:false"`
	AssignedToID        *uint                  `json:"assigned_to_id" gorm:"index"`
	AssignedTo          *User                  `json:"assigned_to" gorm:"foreignKey:AssignedToID"`
	Status              DeadlineReminderStatus `json:"status" gorm:"not null;default:'active'"`
	CreatedAt           time.Time              `json:"created_at"`
	UpdatedAt           time.Time              `json:"updated_at"`
	DeletedAt           gorm.DeletedAt         `json:"-" gorm:"index"`
}

// TableName specifies the table name for the DeadlineReminder model
func (DeadlineReminder) TableName() string {
	return "deadline_reminders"
}

// IsActive checks if the deadline reminder is active
func (dr *DeadlineReminder) IsActive() bool {
	return dr.Status == DeadlineReminderStatusActive
}

// IsExpired checks if the deadline reminder is expired
func (dr *DeadlineReminder) IsExpired() bool {
	return dr.Status == DeadlineReminderStatusExpired
}

// IsCancelled checks if the deadline reminder is cancelled
func (dr *DeadlineReminder) IsCancelled() bool {
	return dr.Status == DeadlineReminderStatusCancelled
}

// IsOverdue checks if the deadline has passed
func (dr *DeadlineReminder) IsOverdue() bool {
	return time.Now().After(dr.DeadlineDate)
}

// GetDaysUntilDeadline returns the number of days until deadline
func (dr *DeadlineReminder) GetDaysUntilDeadline() int {
	duration := dr.DeadlineDate.Sub(time.Now())
	return int(duration.Hours() / 24)
}

// ShouldSend3DayReminder checks if 3-day reminder should be sent
func (dr *DeadlineReminder) ShouldSend3DayReminder() bool {
	if dr.ReminderSent3D {
		return false
	}

	daysUntil := dr.GetDaysUntilDeadline()
	return daysUntil <= 3 && daysUntil > 0
}

// ShouldSend1DayReminder checks if 1-day reminder should be sent
func (dr *DeadlineReminder) ShouldSend1DayReminder() bool {
	if dr.ReminderSent1D {
		return false
	}

	daysUntil := dr.GetDaysUntilDeadline()
	return daysUntil <= 1 && daysUntil > 0
}

// ShouldSendOverdueReminder checks if overdue reminder should be sent
func (dr *DeadlineReminder) ShouldSendOverdueReminder() bool {
	if dr.ReminderSentOverdue {
		return false
	}

	return dr.IsOverdue()
}

// Mark3DayReminderSent marks the 3-day reminder as sent
func (dr *DeadlineReminder) Mark3DayReminderSent() {
	dr.ReminderSent3D = true
}

// Mark1DayReminderSent marks the 1-day reminder as sent
func (dr *DeadlineReminder) Mark1DayReminderSent() {
	dr.ReminderSent1D = true
}

// MarkOverdueReminderSent marks the overdue reminder as sent
func (dr *DeadlineReminder) MarkOverdueReminderSent() {
	dr.ReminderSentOverdue = true
}

// MarkAsExpired marks the deadline reminder as expired
func (dr *DeadlineReminder) MarkAsExpired() {
	dr.Status = DeadlineReminderStatusExpired
}

// MarkAsCancelled marks the deadline reminder as cancelled
func (dr *DeadlineReminder) MarkAsCancelled() {
	dr.Status = DeadlineReminderStatusCancelled
}

// GetDeadlineTypeDisplayName returns the display name for the deadline type
func (dr *DeadlineReminder) GetDeadlineTypeDisplayName() string {
	switch dr.DeadlineType {
	case DeadlineTypeAppointment:
		return "นัดหมาย"
	case DeadlineTypeDocumentReview:
		return "ตรวจสอบเอกสาร"
	case DeadlineTypeInspection:
		return "การตรวจสอบ"
	default:
		return string(dr.DeadlineType)
	}
}

// GetStatusDisplayName returns the display name for the status
func (dr *DeadlineReminder) GetStatusDisplayName() string {
	switch dr.Status {
	case DeadlineReminderStatusActive:
		return "ใช้งาน"
	case DeadlineReminderStatusExpired:
		return "หมดอายุ"
	case DeadlineReminderStatusCancelled:
		return "ยกเลิก"
	default:
		return string(dr.Status)
	}
}
