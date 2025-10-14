package models

import (
	"time"

	"gorm.io/gorm"
)

// ServiceFlowLog represents a log entry for service request status changes
type ServiceFlowLog struct {
	ID               uint           `json:"id" gorm:"primaryKey"`
	LicenseRequestID uint           `json:"license_request_id" gorm:"not null;index"`
	LicenseRequest   LicenseRequest `json:"license_request" gorm:"foreignKey:LicenseRequestID"`
	PreviousStatus   *RequestStatus `json:"previous_status"`
	NewStatus        RequestStatus  `json:"new_status" gorm:"not null"`
	ChangedBy        *uint          `json:"changed_by" gorm:"index"`
	ChangedByUser    *User          `json:"changed_by_user" gorm:"foreignKey:ChangedBy"`
	ChangeReason     string         `json:"change_reason"`
	CreatedAt        time.Time      `json:"created_at"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the ServiceFlowLog model
func (ServiceFlowLog) TableName() string {
	return "service_flow_logs"
}

// GetStatusDisplayName returns the display name for the status
func (sfl *ServiceFlowLog) GetStatusDisplayName(status RequestStatus) string {
	switch status {
	case StatusDraft:
		return "ร่าง"
	case StatusNewRequest:
		return "คำร้องใหม่"
	case StatusAccepted:
		return "รับคำขอ"
	case StatusRejected:
		return "ปฏิเสธคำขอ"
	case StatusAssigned:
		return "มอบหมายผู้ตรวจ"
	case StatusAppointment:
		return "นัดหมาย"
	case StatusInspecting:
		return "เข้าตรวจสอบระบบ"
	case StatusInspectionDone:
		return "ตรวจสอบเสร็จสิ้น"
	case StatusDocumentEdit:
		return "แก้ไขเอกสาร"
	case StatusOverdue:
		return "เกินกำหนด"
	case StatusReportApproved:
		return "รับรองรายงาน"
	case StatusApproved:
		return "อนุมัติใบอนุญาต"
	case StatusRejectedFinal:
		return "ปฏิเสธสุดท้าย"
	default:
		return string(status)
	}
}

// GetStatusColor returns the color class for the status
func (sfl *ServiceFlowLog) GetStatusColor(status RequestStatus) string {
	switch status {
	case StatusDraft:
		return "bg-gray-100 text-gray-800"
	case StatusNewRequest:
		return "bg-blue-100 text-blue-800"
	case StatusAccepted:
		return "bg-green-100 text-green-800"
	case StatusRejected, StatusRejectedFinal:
		return "bg-red-100 text-red-800"
	case StatusAssigned:
		return "bg-purple-100 text-purple-800"
	case StatusAppointment:
		return "bg-yellow-100 text-yellow-800"
	case StatusInspecting:
		return "bg-orange-100 text-orange-800"
	case StatusInspectionDone:
		return "bg-teal-100 text-teal-800"
	case StatusDocumentEdit:
		return "bg-indigo-100 text-indigo-800"
	case StatusOverdue:
		return "bg-red-100 text-red-800"
	case StatusReportApproved:
		return "bg-green-100 text-green-800"
	case StatusApproved:
		return "bg-green-100 text-green-800"
	default:
		return "bg-gray-100 text-gray-800"
	}
}

// IsStatusProgress determines if the status change represents progress
func (sfl *ServiceFlowLog) IsStatusProgress() bool {
	// Define the progression order
	statusOrder := map[RequestStatus]int{
		StatusDraft:          0,
		StatusNewRequest:     1,
		StatusAccepted:       2,
		StatusAssigned:       3,
		StatusAppointment:    4,
		StatusInspecting:     5,
		StatusInspectionDone: 6,
		StatusDocumentEdit:   7,
		StatusReportApproved: 8,
		StatusApproved:       9,
		StatusRejected:       -1,
		StatusRejectedFinal:  -2,
		StatusOverdue:        -3,
	}

	if sfl.PreviousStatus == nil {
		return true
	}

	prevOrder := statusOrder[*sfl.PreviousStatus]
	newOrder := statusOrder[sfl.NewStatus]

	return newOrder > prevOrder
}
