package dto

import "time"

// ScheduleAppointmentRequest represents a request to schedule an appointment
type ScheduleAppointmentRequest struct {
	AppointmentDate time.Time `json:"appointment_date" binding:"required"`
	Comments        string    `json:"comments"`
}

// StartInspectionRequest represents a request to start an inspection
type StartInspectionRequest struct {
	Comments string `json:"comments"`
}

// CompleteInspectionRequest represents a request to complete an inspection
type CompleteInspectionRequest struct {
	Findings         string `json:"findings"`
	Recommendations  string `json:"recommendations"`
	ComplianceStatus string `json:"compliance_status"`
	RiskLevel        string `json:"risk_level"`
	Comments         string `json:"comments"`
}

// SubmitAuditReportRequest represents a request to submit an audit report
type SubmitAuditReportRequest struct {
	Title            string   `json:"title" binding:"required"`
	Content          string   `json:"content"`
	Findings         string   `json:"findings"`
	Recommendations  string   `json:"recommendations"`
	ComplianceStatus string   `json:"compliance_status"`
	RiskLevel        string   `json:"risk_level"`
	FileAttachments  []string `json:"file_attachments"`
}

// ConsultTaskResponse represents a task for DEDE Consult
type ConsultTaskResponse struct {
	TaskID          uint                   `json:"task_id"`
	RequestID       uint                   `json:"request_id"`
	LicenseType     string                 `json:"license_type"`
	TaskType        string                 `json:"task_type"`
	Status          string                 `json:"status"`
	Priority        string                 `json:"priority"`
	Deadline        *time.Time             `json:"deadline"`
	AppointmentDate *time.Time             `json:"appointment_date"`
	AssignedAt      time.Time              `json:"assigned_at"`
	Comments        string                 `json:"comments"`
	RequestDetails  map[string]interface{} `json:"request_details"`
}

// ConsultDashboardStats represents consult dashboard statistics
type ConsultDashboardStats struct {
	TotalTasks      int64 `json:"total_tasks"`
	PendingTasks    int64 `json:"pending_tasks"`
	InProgressTasks int64 `json:"in_progress_tasks"`
	CompletedTasks  int64 `json:"completed_tasks"`
	OverdueTasks    int64 `json:"overdue_tasks"`
	ThisWeekTasks   int64 `json:"this_week_tasks"`
	ThisMonthTasks  int64 `json:"this_month_tasks"`
}

// AppointmentResponse represents an appointment
type AppointmentResponse struct {
	TaskID          uint                   `json:"task_id"`
	RequestID       uint                   `json:"request_id"`
	LicenseType     string                 `json:"license_type"`
	AppointmentDate time.Time              `json:"appointment_date"`
	Status          string                 `json:"status"`
	Comments        string                 `json:"comments"`
	RequestDetails  map[string]interface{} `json:"request_details"`
}

// InspectionResponse represents an inspection
type InspectionResponse struct {
	TaskID         uint                   `json:"task_id"`
	RequestID      uint                   `json:"request_id"`
	LicenseType    string                 `json:"license_type"`
	Status         string                 `json:"status"`
	StartDate      *time.Time             `json:"start_date"`
	EndDate        *time.Time             `json:"end_date"`
	Comments       string                 `json:"comments"`
	RequestDetails map[string]interface{} `json:"request_details"`
}

// AuditReportResponse represents an audit report
type AuditReportResponse struct {
	ReportID         uint      `json:"report_id"`
	VersionNumber    int       `json:"version_number"`
	Title            string    `json:"title"`
	Content          string    `json:"content"`
	Findings         string    `json:"findings"`
	Recommendations  string    `json:"recommendations"`
	ComplianceStatus string    `json:"compliance_status"`
	RiskLevel        string    `json:"risk_level"`
	Status           string    `json:"status"`
	SubmittedAt      time.Time `json:"submitted_at"`
	FileAttachments  []string  `json:"file_attachments"`
}
