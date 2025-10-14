package models

import (
	"time"

	"gorm.io/gorm"
)

// ServiceStatistics represents aggregated statistics for service requests
type ServiceStatistics struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	StatDate    time.Time      `json:"stat_date" gorm:"type:date;not null;index"`
	LicenseType LicenseType    `json:"license_type" gorm:"not null;index"`
	Status      string         `json:"status" gorm:"not null;index"`
	Count       int            `json:"count" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the ServiceStatistics model
func (ServiceStatistics) TableName() string {
	return "service_statistics"
}

// GetLicenseTypeDisplayName returns the display name for the license type
func (ss *ServiceStatistics) GetLicenseTypeDisplayName() string {
	switch ss.LicenseType {
	case LicenseTypeNew:
		return "ขอรับใบอนุญาตใหม่"
	case LicenseTypeRenew:
		return "ขอต่ออายุใบอนุญาต"
	case LicenseTypeExpand:
		return "ขอขยายการผลิต"
	case LicenseTypeReduce:
		return "ขอลดการผลิต"
	case LicenseTypeModify:
		return "ขอแก้ไข"
	case LicenseTypeCancel:
		return "ขอเลิก"
	default:
		return string(ss.LicenseType)
	}
}

// GetStatusDisplayName returns the display name for the status
func (ss *ServiceStatistics) GetStatusDisplayName() string {
	switch ss.Status {
	case "draft":
		return "ร่าง"
	case "new_request":
		return "คำร้องใหม่"
	case "accepted":
		return "รับคำขอ"
	case "rejected":
		return "ปฏิเสธคำขอ"
	case "assigned":
		return "มอบหมายผู้ตรวจ"
	case "appointment":
		return "นัดหมาย"
	case "inspecting":
		return "เข้าตรวจสอบระบบ"
	case "inspection_done":
		return "ตรวจสอบเสร็จสิ้น"
	case "document_edit":
		return "แก้ไขเอกสาร"
	case "overdue":
		return "เกินกำหนด"
	case "report_approved":
		return "รับรองรายงาน"
	case "approved":
		return "อนุมัติใบอนุญาต"
	case "rejected_final":
		return "ปฏิเสธสุดท้าย"
	default:
		return ss.Status
	}
}

// GetStatusColor returns the color class for the status
func (ss *ServiceStatistics) GetStatusColor() string {
	switch ss.Status {
	case "draft":
		return "bg-gray-100 text-gray-800"
	case "new_request":
		return "bg-blue-100 text-blue-800"
	case "accepted":
		return "bg-green-100 text-green-800"
	case "rejected", "rejected_final":
		return "bg-red-100 text-red-800"
	case "assigned":
		return "bg-purple-100 text-purple-800"
	case "appointment":
		return "bg-yellow-100 text-yellow-800"
	case "inspecting":
		return "bg-orange-100 text-orange-800"
	case "inspection_done":
		return "bg-teal-100 text-teal-800"
	case "document_edit":
		return "bg-indigo-100 text-indigo-800"
	case "overdue":
		return "bg-red-100 text-red-800"
	case "report_approved":
		return "bg-green-100 text-green-800"
	case "approved":
		return "bg-green-100 text-green-800"
	default:
		return "bg-gray-100 text-gray-800"
	}
}

// IsCompleted returns true if the status represents a completed request
func (ss *ServiceStatistics) IsCompleted() bool {
	return ss.Status == "approved" || ss.Status == "rejected_final"
}

// IsInProgress returns true if the status represents a request in progress
func (ss *ServiceStatistics) IsInProgress() bool {
	return ss.Status == "accepted" || ss.Status == "assigned" ||
		ss.Status == "appointment" || ss.Status == "inspecting" ||
		ss.Status == "inspection_done" || ss.Status == "document_edit" ||
		ss.Status == "report_approved"
}

// IsPending returns true if the status represents a pending request
func (ss *ServiceStatistics) IsPending() bool {
	return ss.Status == "new_request" || ss.Status == "draft"
}
