package dto

import "time"

// UserInfo represents user information for response
type UserInfo struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
	Status   string `json:"status"`
}

// PaginationResponse represents pagination information
type PaginationResponse struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}

// CreateLicenseRequestRequest represents the create license request payload
type CreateLicenseRequestRequest struct {
	LicenseType       string  `json:"license_type" binding:"required"`
	Title             string  `json:"title" binding:"required"`
	Description       string  `json:"description"`
	CurrentCapacity   float64 `json:"current_capacity"`
	RequestedCapacity float64 `json:"requested_capacity"`
	Location          string  `json:"location" binding:"required"`
}

// NewLicenseRequestRequest represents the new license request payload
type NewLicenseRequestRequest struct {
	LicenseType       string `json:"licenseType" binding:"required"`
	ProjectName       string `json:"projectName" binding:"required"`
	ProjectAddress    string `json:"projectAddress" binding:"required"`
	Province          string `json:"province" binding:"required"`
	District          string `json:"district" binding:"required"`
	Subdistrict       string `json:"subdistrict" binding:"required"`
	PostalCode        string `json:"postalCode" binding:"required"`
	EnergyType        string `json:"energyType" binding:"required"`
	Capacity          string `json:"capacity" binding:"required"`
	CapacityUnit      string `json:"capacityUnit" binding:"required"`
	ExpectedStartDate string `json:"expectedStartDate" binding:"required"`
	ContactPerson     string `json:"contactPerson" binding:"required"`
	ContactPhone      string `json:"contactPhone" binding:"required"`
	ContactEmail      string `json:"contactEmail" binding:"required"`
	Description       string `json:"description" binding:"required"`
}

// RenewalLicenseRequestRequest represents the renewal license request payload
type RenewalLicenseRequestRequest struct {
	LicenseType           string `json:"licenseType" binding:"required"`
	LicenseNumber         string `json:"licenseNumber" binding:"required"`
	ProjectName           string `json:"projectName" binding:"required"`
	ProjectAddress        string `json:"projectAddress" binding:"required"`
	CurrentCapacity       string `json:"currentCapacity" binding:"required"`
	CurrentCapacityUnit   string `json:"currentCapacityUnit" binding:"required"`
	RequestedCapacity     string `json:"requestedCapacity" binding:"required"`
	RequestedCapacityUnit string `json:"requestedCapacityUnit" binding:"required"`
	ExpiryDate            string `json:"expiryDate" binding:"required"`
	RequestedExpiryDate   string `json:"requestedExpiryDate" binding:"required"`
	ContactPerson         string `json:"contactPerson" binding:"required"`
	ContactPhone          string `json:"contactPhone" binding:"required"`
	ContactEmail          string `json:"contactEmail" binding:"required"`
	Reason                string `json:"reason" binding:"required"`
}

// ExtensionLicenseRequestRequest represents the extension license request payload
type ExtensionLicenseRequestRequest struct {
	LicenseType           string `json:"licenseType" binding:"required"`
	LicenseNumber         string `json:"licenseNumber" binding:"required"`
	ProjectName           string `json:"projectName" binding:"required"`
	CurrentCapacity       string `json:"currentCapacity" binding:"required"`
	CurrentCapacityUnit   string `json:"currentCapacityUnit" binding:"required"`
	RequestedCapacity     string `json:"requestedCapacity" binding:"required"`
	RequestedCapacityUnit string `json:"requestedCapacityUnit" binding:"required"`
	ExtensionReason       string `json:"extensionReason" binding:"required"`
	ExpectedStartDate     string `json:"expectedStartDate" binding:"required"`
	ContactPerson         string `json:"contactPerson" binding:"required"`
	ContactPhone          string `json:"contactPhone" binding:"required"`
	ContactEmail          string `json:"contactEmail" binding:"required"`
	Description           string `json:"description" binding:"required"`
}

// ReductionLicenseRequestRequest represents the reduction license request payload
type ReductionLicenseRequestRequest struct {
	LicenseType           string `json:"licenseType" binding:"required"`
	LicenseNumber         string `json:"licenseNumber" binding:"required"`
	ProjectName           string `json:"projectName" binding:"required"`
	CurrentCapacity       string `json:"currentCapacity" binding:"required"`
	CurrentCapacityUnit   string `json:"currentCapacityUnit" binding:"required"`
	RequestedCapacity     string `json:"requestedCapacity" binding:"required"`
	RequestedCapacityUnit string `json:"requestedCapacityUnit" binding:"required"`
	ReductionReason       string `json:"reductionReason" binding:"required"`
	ExpectedStartDate     string `json:"expectedStartDate" binding:"required"`
	ContactPerson         string `json:"contactPerson" binding:"required"`
	ContactPhone          string `json:"contactPhone" binding:"required"`
	ContactEmail          string `json:"contactEmail" binding:"required"`
	Description           string `json:"description" binding:"required"`
}

// UpdateLicenseRequestRequest represents the update license request payload
type UpdateLicenseRequestRequest struct {
	Title             string  `json:"title"`
	Description       string  `json:"description"`
	CurrentCapacity   float64 `json:"current_capacity"`
	RequestedCapacity float64 `json:"requested_capacity"`
	Location          string  `json:"location"`
}

// AssignInspectorRequest represents the assign inspector payload
type AssignInspectorRequest struct {
	InspectorID uint `json:"inspector_id" binding:"required"`
}

// SetAppointmentRequest represents the set appointment payload
type SetAppointmentRequest struct {
	AppointmentDate time.Time `json:"appointment_date" binding:"required"`
	ScheduledTime   string    `json:"scheduled_time" binding:"required"`
	Location        string    `json:"location" binding:"required"`
}

// LicenseRequestResponse represents the license request response
type LicenseRequestResponse struct {
	ID                uint       `json:"id"`
	RequestNumber     string     `json:"request_number"`
	LicenseType       string     `json:"license_type"`
	Status            string     `json:"status"`
	Title             string     `json:"title"`
	Description       string     `json:"description"`
	CurrentCapacity   float64    `json:"current_capacity"`
	RequestedCapacity float64    `json:"requested_capacity"`
	Location          string     `json:"location"`
	InspectorID       *uint      `json:"inspector_id"`
	Inspector         *UserInfo  `json:"inspector,omitempty"`
	AssignedByID      *uint      `json:"assigned_by_id"`
	AssignedBy        *UserInfo  `json:"assigned_by,omitempty"`
	AssignedAt        *time.Time `json:"assigned_at"`
	AppointmentDate   *time.Time `json:"appointment_date"`
	InspectionDate    *time.Time `json:"inspection_date"`
	CompletionDate    *time.Time `json:"completion_date"`
	Deadline          *time.Time `json:"deadline"`
	RejectionReason   string     `json:"rejection_reason"`
	Notes             string     `json:"notes"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	UserID            uint       `json:"user_id"`
	User              UserInfo   `json:"user"`
}

// LicenseRequestListResponse represents the license request list response
type LicenseRequestListResponse struct {
	LicenseRequests []LicenseRequestResponse `json:"license_requests"`
	Pagination      PaginationResponse       `json:"pagination"`
}

// LicenseTypeResponse represents the license type response
type LicenseTypeResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// RequestStatusResponse represents the request status response
type RequestStatusResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}
