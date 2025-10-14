package models

import (
	"time"

	"gorm.io/gorm"
)

type LicenseType string

const (
	LicenseTypeNew    LicenseType = "new"    // ขอรับใบอนุญาต
	LicenseTypeRenew  LicenseType = "renew"  // ขอต่ออายุใบอนุญาต
	LicenseTypeExpand LicenseType = "expand" // ขอขยายการผลิต
	LicenseTypeReduce LicenseType = "reduce" // ขอลดการผลิต
	LicenseTypeModify LicenseType = "modify" // ขอแก้ไข
	LicenseTypeCancel LicenseType = "cancel" // ขอเลิก
)

type RequestStatus string

const (
	StatusDraft          RequestStatus = "draft"           // ร่าง
	StatusNewRequest     RequestStatus = "new_request"     // คำร้องใหม่
	StatusAccepted       RequestStatus = "accepted"        // รับคำขอ
	StatusRejected       RequestStatus = "rejected"        // ปฏิเสธคำขอ
	StatusAssigned       RequestStatus = "assigned"        // มอบหมายผู้ตรวจ
	StatusAppointment    RequestStatus = "appointment"     // นัดหมาย
	StatusInspecting     RequestStatus = "inspecting"      // เข้าตรวจสอบระบบ
	StatusInspectionDone RequestStatus = "inspection_done" // ตรวจสอบเสร็จสิ้น
	StatusDocumentEdit   RequestStatus = "document_edit"   // แก้ไขเอกสาร
	StatusOverdue        RequestStatus = "overdue"         // เกินกำหนด
	StatusReportApproved RequestStatus = "report_approved" // รับรองรายงาน
	StatusApproved       RequestStatus = "approved"        // อนุมัติใบอนุญาต
	StatusRejectedFinal  RequestStatus = "rejected_final"  // ปฏิเสธสุดท้าย
	StatusReturned       RequestStatus = "returned"        // ตีเอกสารกลับไปแก้ไข
	StatusForwarded      RequestStatus = "forwarded"       // ส่งต่อให้ DEDE Admin
)

type LicenseRequest struct {
	ID                uint           `json:"id" gorm:"primaryKey"`
	UserID            uint           `json:"user_id" gorm:"not null;index"`
	User              User           `json:"user" gorm:"foreignKey:UserID"`
	RequestNumber     string         `json:"request_number" gorm:"uniqueIndex;not null"`
	LicenseType       LicenseType    `json:"license_type" gorm:"not null"`
	Status            RequestStatus  `json:"status" gorm:"not null;default:'draft'"`
	Title             string         `json:"title" gorm:"not null"`
	Description       string         `json:"description"`
	CurrentCapacity   float64        `json:"current_capacity"`
	RequestedCapacity float64        `json:"requested_capacity"`
	Location          string         `json:"location"`
	InspectorID       *uint          `json:"inspector_id" gorm:"index"`
	Inspector         *User          `json:"inspector" gorm:"foreignKey:InspectorID"`
	AssignedByID      *uint          `json:"assigned_by_id" gorm:"index"`
	AssignedBy        *User          `json:"assigned_by" gorm:"foreignKey:AssignedByID"`
	AssignedAt        *time.Time     `json:"assigned_at"`
	AppointmentDate   *time.Time     `json:"appointment_date"`
	InspectionDate    *time.Time     `json:"inspection_date"`
	CompletionDate    *time.Time     `json:"completion_date"`
	Deadline          *time.Time     `json:"deadline"`
	RejectionReason   string         `json:"rejection_reason"`
	Notes             string         `json:"notes"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the LicenseRequest model
func (LicenseRequest) TableName() string {
	return "license_requests"
}

// IsNewRequest checks if the request is in new status
func (lr *LicenseRequest) IsNewRequest() bool {
	return lr.Status == StatusNewRequest
}

// IsAssigned checks if the request is assigned to an inspector
func (lr *LicenseRequest) IsAssigned() bool {
	return lr.Status == StatusAssigned
}

// NeedsAppointment checks if the request needs appointment
func (lr *LicenseRequest) NeedsAppointment() bool {
	return lr.Status == StatusAppointment
}

// IsInspectionDone checks if the inspection is completed
func (lr *LicenseRequest) IsInspectionDone() bool {
	return lr.Status == StatusInspectionDone
}

// IsApproved checks if the request is approved
func (lr *LicenseRequest) IsApproved() bool {
	return lr.Status == StatusApproved
}

// IsRejected checks if the request is rejected
func (lr *LicenseRequest) IsRejected() bool {
	return lr.Status == StatusRejected || lr.Status == StatusRejectedFinal
}

// CanBeAssigned checks if the request can be assigned to an inspector
func (lr *LicenseRequest) CanBeAssigned() bool {
	return lr.Status == StatusAccepted || lr.Status == StatusDocumentEdit
}

// CanBeInspected checks if the request can be inspected
func (lr *LicenseRequest) CanBeInspected() bool {
	return lr.Status == StatusAppointment
}

// CanBeApproved checks if the request can be approved
func (lr *LicenseRequest) CanBeApproved() bool {
	return lr.Status == StatusInspectionDone
}
