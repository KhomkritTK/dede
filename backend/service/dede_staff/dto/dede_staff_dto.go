package dto

import "time"

// ReviewAuditReportRequest represents a request to review an audit report
type ReviewAuditReportRequest struct {
	Status   string `json:"status" binding:"required"` // "approved", "rejected", "needs_edit"
	Comments string `json:"comments"`
	Reason   string `json:"reason"`
}

// FinalApproveRequestRequest represents a request to provide final approval
type FinalApproveRequestRequest struct {
	Comments string `json:"comments"`
}

// StaffTaskResponse represents a task for DEDE Staff
type StaffTaskResponse struct {
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

// StaffReportResponse represents a report for DEDE Staff
type StaffReportResponse struct {
	ID               uint      `json:"id"`
	VersionNumber    int       `json:"version_number"`
	Title            string    `json:"title"`
	Findings         string    `json:"findings"`
	Recommendations  string    `json:"recommendations"`
	ComplianceStatus string    `json:"compliance_status"`
	RiskLevel        string    `json:"risk_level"`
	Status           string    `json:"status"`
	SubmittedBy      User      `json:"submitted_by"`
	SubmittedAt      time.Time `json:"submitted_at"`
	FileAttachments  []string  `json:"file_attachments"`
}

// User represents user information in staff report
type User struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
}

// StaffDashboardStats represents staff dashboard statistics
type StaffDashboardStats struct {
	TotalTasks      int64 `json:"total_tasks"`
	PendingTasks    int64 `json:"pending_tasks"`
	InProgressTasks int64 `json:"in_progress_tasks"`
	CompletedTasks  int64 `json:"completed_tasks"`
	OverdueTasks    int64 `json:"overdue_tasks"`
	ReportsToReview int64 `json:"reports_to_review"`
	ThisWeekTasks   int64 `json:"this_week_tasks"`
	ThisMonthTasks  int64 `json:"this_month_tasks"`
}

// OverdueRequestResponse represents an overdue request
type OverdueRequestResponse struct {
	ID             uint                   `json:"id"`
	RequestID      uint                   `json:"request_id"`
	LicenseType    string                 `json:"license_type"`
	DeadlineType   string                 `json:"deadline_type"`
	DeadlineDate   time.Time              `json:"deadline_date"`
	AssignedTo     *User                  `json:"assigned_to"`
	DaysOverdue    int                    `json:"days_overdue"`
	RequestDetails map[string]interface{} `json:"request_details"`
}

// ReportReviewResponse represents a report review response
type ReportReviewResponse struct {
	ReportID       uint      `json:"report_id"`
	VersionNumber  int       `json:"version_number"`
	Title          string    `json:"title"`
	Status         string    `json:"status"`
	ReviewComments string    `json:"review_comments"`
	ReviewedAt     time.Time `json:"reviewed_at"`
	ReviewedBy     *User     `json:"reviewed_by"`
}

// FinalApprovalResponse represents a final approval response
type FinalApprovalResponse struct {
	RequestID    uint      `json:"request_id"`
	LicenseType  string    `json:"license_type"`
	Status       string    `json:"status"`
	ApprovalDate time.Time `json:"approval_date"`
	ApprovedBy   *User     `json:"approved_by"`
	Comments     string    `json:"comments"`
}
