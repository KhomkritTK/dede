package models

import (
	"time"

	"gorm.io/gorm"
)

// NewLicenseRequest represents a new license request
type NewLicenseRequest struct {
	ID            uint          `json:"id" gorm:"primaryKey"`
	UserID        uint          `json:"user_id" gorm:"not null;index"`
	User          User          `json:"user" gorm:"foreignKey:UserID"`
	RequestNumber string        `json:"request_number" gorm:"uniqueIndex;not null"`
	Status        RequestStatus `json:"status" gorm:"not null;default:'new_request'"`

	// Project Information
	LicenseType    string `json:"license_type" gorm:"not null"`
	ProjectName    string `json:"project_name" gorm:"not null"`
	ProjectAddress string `json:"project_address" gorm:"not null"`
	Province       string `json:"province" gorm:"not null"`
	District       string `json:"district" gorm:"not null"`
	Subdistrict    string `json:"subdistrict" gorm:"not null"`
	PostalCode     string `json:"postal_code" gorm:"not null"`

	// Technical Information
	EnergyType        string    `json:"energy_type" gorm:"not null"`
	Capacity          float64   `json:"capacity" gorm:"not null"`
	CapacityUnit      string    `json:"capacity_unit" gorm:"not null;default:'MW'"`
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

// TableName specifies the table name for the NewLicenseRequest model
func (NewLicenseRequest) TableName() string {
	return "new_license_requests"
}

// IsNewRequest checks if the request is in new status
func (nlr *NewLicenseRequest) IsNewRequest() bool {
	return nlr.Status == StatusNewRequest
}

// IsAssigned checks if the request is assigned to an inspector
func (nlr *NewLicenseRequest) IsAssigned() bool {
	return nlr.Status == StatusAssigned
}

// NeedsAppointment checks if the request needs appointment
func (nlr *NewLicenseRequest) NeedsAppointment() bool {
	return nlr.Status == StatusAppointment
}

// IsInspectionDone checks if the inspection is completed
func (nlr *NewLicenseRequest) IsInspectionDone() bool {
	return nlr.Status == StatusInspectionDone
}

// IsApproved checks if the request is approved
func (nlr *NewLicenseRequest) IsApproved() bool {
	return nlr.Status == StatusApproved
}

// IsRejected checks if the request is rejected
func (nlr *NewLicenseRequest) IsRejected() bool {
	return nlr.Status == StatusRejected || nlr.Status == StatusRejectedFinal
}

// CanBeAssigned checks if the request can be assigned to an inspector
func (nlr *NewLicenseRequest) CanBeAssigned() bool {
	return nlr.Status == StatusAccepted || nlr.Status == StatusDocumentEdit
}

// CanBeInspected checks if the request can be inspected
func (nlr *NewLicenseRequest) CanBeInspected() bool {
	return nlr.Status == StatusAppointment
}

// CanBeApproved checks if the request can be approved
func (nlr *NewLicenseRequest) CanBeApproved() bool {
	return nlr.Status == StatusInspectionDone
}
