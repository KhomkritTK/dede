package models

import (
	"time"

	"gorm.io/gorm"
)

// ExtensionLicenseRequest represents an extension license request
type ExtensionLicenseRequest struct {
	ID            uint          `json:"id" gorm:"primaryKey"`
	UserID        uint          `json:"user_id" gorm:"not null;index"`
	User          User          `json:"user" gorm:"foreignKey:UserID"`
	RequestNumber string        `json:"request_number" gorm:"uniqueIndex;not null"`
	Status        RequestStatus `json:"status" gorm:"not null;default:'new_request'"`

	// License Information
	LicenseType   string `json:"license_type" gorm:"not null"`
	LicenseNumber string `json:"license_number" gorm:"not null"`
	ProjectName   string `json:"project_name" gorm:"not null"`

	// Capacity Information
	CurrentCapacity       float64 `json:"current_capacity" gorm:"not null"`
	CurrentCapacityUnit   string  `json:"current_capacity_unit" gorm:"not null;default:'MW'"`
	RequestedCapacity     float64 `json:"requested_capacity" gorm:"not null"`
	RequestedCapacityUnit string  `json:"requested_capacity_unit" gorm:"not null;default:'MW'"`

	// Extension Information
	ExtensionReason   string    `json:"extension_reason" gorm:"not null"`
	ExpectedStartDate time.Time `json:"expected_start_date" gorm:"not null"`
	Description       string    `json:"description" gorm:"not null"`

	// Contact Information
	ContactPerson string `json:"contact_person" gorm:"not null"`
	ContactPhone  string `json:"contact_phone" gorm:"not null"`
	ContactEmail  string `json:"contact_email" gorm:"not null"`

	// Workflow Fields
	InspectorID     *uint      `json:"inspector_id" gorm:"index"`
	Inspector       *User      `json:"inspector" gorm:"foreignKey:InspectorID"`
	AssignedByID    *uint      `json:"assigned_by_id" gorm:"index"`
	AssignedBy      *User      `json:"assigned_by" gorm:"foreignKey:AssignedByID"`
	AssignedAt      *time.Time `json:"assigned_at"`
	AppointmentDate *time.Time `json:"appointment_date"`
	InspectionDate  *time.Time `json:"inspection_date"`
	CompletionDate  *time.Time `json:"completion_date"`
	Deadline        *time.Time `json:"deadline"`
	RejectionReason string     `json:"rejection_reason"`
	Notes           string     `json:"notes"`

	// Timestamps
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the ExtensionLicenseRequest model
func (ExtensionLicenseRequest) TableName() string {
	return "extension_license_requests"
}

// IsNewRequest checks if the request is in new status
func (elr *ExtensionLicenseRequest) IsNewRequest() bool {
	return elr.Status == StatusNewRequest
}

// IsAssigned checks if the request is assigned to an inspector
func (elr *ExtensionLicenseRequest) IsAssigned() bool {
	return elr.Status == StatusAssigned
}

// NeedsAppointment checks if the request needs appointment
func (elr *ExtensionLicenseRequest) NeedsAppointment() bool {
	return elr.Status == StatusAppointment
}

// IsInspectionDone checks if the inspection is completed
func (elr *ExtensionLicenseRequest) IsInspectionDone() bool {
	return elr.Status == StatusInspectionDone
}

// IsApproved checks if the request is approved
func (elr *ExtensionLicenseRequest) IsApproved() bool {
	return elr.Status == StatusApproved
}

// IsRejected checks if the request is rejected
func (elr *ExtensionLicenseRequest) IsRejected() bool {
	return elr.Status == StatusRejected || elr.Status == StatusRejectedFinal
}

// CanBeAssigned checks if the request can be assigned to an inspector
func (elr *ExtensionLicenseRequest) CanBeAssigned() bool {
	return elr.Status == StatusAccepted || elr.Status == StatusDocumentEdit
}

// CanBeInspected checks if the request can be inspected
func (elr *ExtensionLicenseRequest) CanBeInspected() bool {
	return elr.Status == StatusAppointment
}

// CanBeApproved checks if the request can be approved
func (elr *ExtensionLicenseRequest) CanBeApproved() bool {
	return elr.Status == StatusInspectionDone
}
