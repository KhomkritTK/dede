package models

import (
	"time"

	"gorm.io/gorm"
)

type NotificationType string

const (
	NotificationTypeRequestSubmitted    NotificationType = "request_submitted"    // ส่งคำขอใหม่
	NotificationTypeRequestAccepted     NotificationType = "request_accepted"     // คำขอได้รับการอนุมัติ
	NotificationTypeRequestRejected     NotificationType = "request_rejected"     // คำขอถูกปฏิเสธ
	NotificationTypeRequestAssigned     NotificationType = "request_assigned"     // มอบหมายผู้ตรวจ
	NotificationTypeAppointmentSet      NotificationType = "appointment_set"      // นัดหมายตรวจสอบ
	NotificationTypeInspectionCompleted NotificationType = "inspection_completed" // ตรวจสอบเสร็จสิ้น
	NotificationTypeReportSubmitted     NotificationType = "report_submitted"     // ส่งรายงาน
	NotificationTypeReportApproved      NotificationType = "report_approved"      // รายงานได้รับการอนุมัติ
	NotificationTypeReportRejected      NotificationType = "report_rejected"      // รายงานถูกปฏิเสธ
	NotificationTypeDeadlineReminder    NotificationType = "deadline_reminder"    // เตือนกำหนดเวลา
	NotificationTypeSystemAnnouncement  NotificationType = "system_announcement"  // ประกาศระบบ
)

type NotificationPriority string

const (
	PriorityLow      NotificationPriority = "low"
	PriorityNormal   NotificationPriority = "normal"
	PriorityHigh     NotificationPriority = "high"
	PriorityCritical NotificationPriority = "critical"
)

type Notification struct {
	ID       uint                 `json:"id" gorm:"primaryKey"`
	Title    string               `json:"title" gorm:"not null"`
	Message  string               `json:"message" gorm:"not null"`
	Type     NotificationType     `json:"type" gorm:"not null;index"`
	Priority NotificationPriority `json:"priority" gorm:"not null;default:'normal'"`

	// Recipient information
	RecipientID   *uint     `json:"recipient_id" gorm:"index"` // If null, it's for all users or a specific role
	Recipient     *User     `json:"recipient" gorm:"foreignKey:RecipientID"`
	RecipientRole *UserRole `json:"recipient_role" gorm:"index"` // If set, notification for all users with this role

	// Related entity (optional)
	EntityType string `json:"entity_type" gorm:"index"` // license_request, inspection, audit_report
	EntityID   *uint  `json:"entity_id" gorm:"index"`

	// Status and tracking
	IsRead      bool       `json:"is_read" gorm:"default:false"`
	ReadAt      *time.Time `json:"read_at"`
	IsSent      bool       `json:"is_sent" gorm:"default:false"`
	SentAt      *time.Time `json:"sent_at"`
	IsEmailSent bool       `json:"is_email_sent" gorm:"default:false"`
	EmailSentAt *time.Time `json:"email_sent_at"`

	// Additional data
	Data      string `json:"data"`       // JSON data for additional information
	ActionURL string `json:"action_url"` // URL to redirect when user clicks notification

	// Timestamps
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the Notification model
func (Notification) TableName() string {
	return "notifications"
}

// MarkAsRead marks the notification as read
func (n *Notification) MarkAsRead() {
	now := time.Now()
	n.IsRead = true
	n.ReadAt = &now
}

// MarkAsUnread marks the notification as unread
func (n *Notification) MarkAsUnread() {
	n.IsRead = false
	n.ReadAt = nil
}

// MarkAsSent marks the notification as sent
func (n *Notification) MarkAsSent() {
	now := time.Now()
	n.IsSent = true
	n.SentAt = &now
}

// MarkAsEmailSent marks the notification as email sent
func (n *Notification) MarkAsEmailSent() {
	now := time.Now()
	n.IsEmailSent = true
	n.EmailSentAt = &now
}

// IsHighPriority checks if the notification is high priority
func (n *Notification) IsHighPriority() bool {
	return n.Priority == PriorityHigh || n.Priority == PriorityCritical
}

// IsCritical checks if the notification is critical priority
func (n *Notification) IsCritical() bool {
	return n.Priority == PriorityCritical
}

// IsForRole checks if the notification is for a specific role
func (n *Notification) IsForRole() bool {
	return n.RecipientRole != nil && *n.RecipientRole != ""
}

// IsForSpecificUser checks if the notification is for a specific user
func (n *Notification) IsForSpecificUser() bool {
	return n.RecipientID != nil
}

// IsForAllUsers checks if the notification is for all users
func (n *Notification) IsForAllUsers() bool {
	return n.RecipientID == nil && (n.RecipientRole == nil || *n.RecipientRole == "")
}
