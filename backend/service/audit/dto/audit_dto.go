package dto

import "time"

// CreateReportRequest represents a request to create an audit report
type CreateReportRequest struct {
	Title            string `json:"title" binding:"required"`
	Description      string `json:"description"`
	RequestID        uint   `json:"request_id" binding:"required"`
	LicenseType      string `json:"license_type" binding:"required"`
	InspectorID      uint   `json:"inspector_id" binding:"required"`
	Content          string `json:"content"`
	Findings         string `json:"findings"`
	Recommendations  string `json:"recommendations"`
	ComplianceStatus string `json:"compliance_status"`
	RiskLevel        string `json:"risk_level"`
}

// UpdateReportRequest represents a request to update an audit report
type UpdateReportRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

// CreateReportVersionRequest represents a request to create a new version of an audit report
type CreateReportVersionRequest struct {
	Title            string   `json:"title" binding:"required"`
	Content          string   `json:"content"`
	Findings         string   `json:"findings"`
	Recommendations  string   `json:"recommendations"`
	ComplianceStatus string   `json:"compliance_status"`
	RiskLevel        string   `json:"risk_level"`
	Status           string   `json:"status"`
	SubmittedByID    uint     `json:"submitted_id"`
	FileAttachments  []string `json:"file_attachments"`
}

// UpdateReportVersionRequest represents a request to update a version of an audit report
type UpdateReportVersionRequest struct {
	Title            string   `json:"title"`
	Content          string   `json:"content"`
	Findings         string   `json:"findings"`
	Recommendations  string   `json:"recommendations"`
	ComplianceStatus string   `json:"compliance_status"`
	RiskLevel        string   `json:"risk_level"`
	Status           string   `json:"status"`
	FileAttachments  []string `json:"file_attachments"`
}

// ApproveReportVersionRequest represents a request to approve a version of an audit report
type ApproveReportVersionRequest struct {
	ApprovedByID uint   `json:"approved_id" binding:"required"`
	Comments     string `json:"comments"`
}

// RejectReportVersionRequest represents a request to reject a version of an audit report
type RejectReportVersionRequest struct {
	Reason   string `json:"reason" binding:"required"`
	Comments string `json:"comments"`
}

// AuditReportResponse represents an audit report response
type AuditReportResponse struct {
	ID                uint                         `json:"id"`
	Title             string                       `json:"title"`
	Description       string                       `json:"description"`
	RequestID         uint                         `json:"request_id"`
	InspectionID      uint                         `json:"inspection_id"`
	LicenseType       string                       `json:"license_type"`
	InspectorID       uint                         `json:"inspector_id"`
	Inspector         User                         `json:"inspector"`
	ReviewerID        *uint                        `json:"reviewer_id"`
	Status            string                       `json:"status"`
	ReportNumber      string                       `json:"report_number"`
	Summary           string                       `json:"summary"`
	Findings          string                       `json:"findings"`
	Recommendations   string                       `json:"recommendations"`
	ComplianceStatus  string                       `json:"compliance_status"`
	RiskLevel         string                       `json:"risk_level"`
	CorrectiveActions string                       `json:"corrective_actions"`
	FollowUpRequired  bool                         `json:"follow_up_required"`
	FollowUpDate      *time.Time                   `json:"follow_up_date"`
	SubmittedAt       *time.Time                   `json:"submitted_at"`
	ReviewedAt        *time.Time                   `json:"reviewed_at"`
	ApprovedAt        *time.Time                   `json:"approved_at"`
	RejectionReason   string                       `json:"rejection_reason"`
	ReviewComments    string                       `json:"review_comments"`
	CurrentVersion    *AuditReportVersionResponse  `json:"current_version"`
	Versions          []AuditReportVersionResponse `json:"versions"`
	CreatedAt         time.Time                    `json:"created_at"`
	UpdatedAt         time.Time                    `json:"updated_at"`
}

// AuditReportVersionResponse represents a version of an audit report
type AuditReportVersionResponse struct {
	ID               uint      `json:"id"`
	ReportID         uint      `json:"report_id"`
	VersionNumber    int       `json:"version_number"`
	Title            string    `json:"title"`
	Content          string    `json:"content"`
	Findings         string    `json:"findings"`
	Recommendations  string    `json:"recommendations"`
	ComplianceStatus string    `json:"compliance_status"`
	RiskLevel        string    `json:"risk_level"`
	Status           string    `json:"status"`
	SubmittedBy      *User     `json:"submitted_by"`
	ApprovedBy       *User     `json:"approved_by"`
	ReviewedBy       *User     `json:"reviewed_by"`
	ReviewComments   string    `json:"review_comments"`
	RejectionReason  string    `json:"rejection_reason"`
	FileAttachments  []string  `json:"file_attachments"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// User represents user information in audit report
type User struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
}

// GetReportsRequest represents a request to get audit reports
type GetReportsRequest struct {
	Page        int        `json:"page"`
	Limit       int        `json:"limit"`
	Status      string     `json:"status"`
	InspectorID uint       `json:"inspector_id"`
	RequestID   uint       `json:"request_id"`
	LicenseType string     `json:"license_type"`
	StartDate   *time.Time `json:"start_date"`
	EndDate     *time.Time `json:"end_date"`
}

// GetReportVersionsRequest represents a request to get audit report versions
type GetReportVersionsRequest struct {
	Page   int    `json:"page"`
	Limit  int    `json:"limit"`
	Status string `json:"status"`
}

// UploadFileRequest represents a request to upload a file
type UploadFileRequest struct {
	ReportID  uint   `json:"report_id" binding:"required"`
	VersionID uint   `json:"version_id" binding:"required"`
	FileName  string `json:"file_name" binding:"required"`
	FileData  []byte `json:"file_data" binding:"required"`
}

// UploadFileResponse represents a response to a file upload request
type UploadFileResponse struct {
	FilePath string `json:"file_path"`
	FileSize int    `json:"file_size"`
	FileName string `json:"file_name"`
}

// AuditReportStatisticsResponse represents audit report statistics
type AuditReportStatisticsResponse struct {
	TotalReports              int64 `json:"total_reports"`
	DraftReports              int64 `json:"draft_reports"`
	SubmittedReports          int64 `json:"submitted_reports"`
	UnderReviewReports        int64 `json:"under_review_reports"`
	ApprovedReports           int64 `json:"approved_reports"`
	RejectedReports           int64 `json:"rejected_reports"`
	CompliantReports          int64 `json:"compliant_reports"`
	NonCompliantReports       int64 `json:"non_compliant_reports"`
	PartiallyCompliantReports int64 `json:"partially_compliant_reports"`
	LowRiskReports            int64 `json:"low_risk_reports"`
	MediumRiskReports         int64 `json:"medium_risk_reports"`
	HighRiskReports           int64 `json:"high_risk_reports"`
}

// CreateAuditReportRequest represents a request to create an audit report
type CreateAuditReportRequest struct {
	Title             string     `json:"title" binding:"required"`
	Description       string     `json:"description"`
	RequestID         uint       `json:"request_id" binding:"required"`
	LicenseType       string     `json:"license_type" binding:"required"`
	InspectorID       uint       `json:"inspector_id" binding:"required"`
	InspectionID      uint       `json:"inspection_id"`
	Content           string     `json:"content"`
	Findings          string     `json:"findings"`
	Recommendations   string     `json:"recommendations"`
	ComplianceStatus  string     `json:"compliance_status"`
	RiskLevel         string     `json:"risk_level"`
	Summary           string     `json:"summary"`
	CorrectiveActions string     `json:"corrective_actions"`
	FollowUpRequired  bool       `json:"follow_up_required"`
	FollowUpDate      *time.Time `json:"follow_up_date"`
}

// UpdateAuditReportRequest represents a request to update an audit report
type UpdateAuditReportRequest struct {
	Title             string     `json:"title"`
	Description       string     `json:"description"`
	Status            string     `json:"status"`
	ComplianceStatus  string     `json:"compliance_status"`
	RiskLevel         string     `json:"risk_level"`
	Summary           string     `json:"summary"`
	Findings          string     `json:"findings"`
	Recommendations   string     `json:"recommendations"`
	CorrectiveActions string     `json:"corrective_actions"`
	FollowUpRequired  *bool      `json:"follow_up_required"`
	FollowUpDate      *time.Time `json:"follow_up_date"`
}

// AuditReportListResponse represents a list of audit reports
type AuditReportListResponse struct {
	Reports    []AuditReportResponse `json:"reports"`
	Pagination PaginationResponse    `json:"pagination"`
}

// ReviewReportRequest represents a request to review an audit report
type ReviewReportRequest struct {
	ReportID       uint   `json:"report_id" binding:"required"`
	ReviewComments string `json:"review_comments"`
}

// ApproveReportRequest represents a request to approve an audit report
type ApproveReportRequest struct {
	ReportID uint `json:"report_id" binding:"required"`
}

// RejectReportRequest represents a request to reject an audit report
type RejectReportRequest struct {
	ReportID        uint   `json:"report_id" binding:"required"`
	RejectionReason string `json:"rejection_reason" binding:"required"`
}

// RequestEditRequest represents a request to request edits for an audit report
type RequestEditRequest struct {
	ReportID       uint   `json:"report_id" binding:"required"`
	ReviewComments string `json:"review_comments"`
}

// SubmitReportRequest represents a request to submit an audit report
type SubmitReportRequest struct {
	ReportID uint `json:"report_id" binding:"required"`
}

// SendForReviewRequest represents a request to send an audit report for review
type SendForReviewRequest struct {
	ReportID uint `json:"report_id" binding:"required"`
}

// ReportStatusResponse represents a report status option
type ReportStatusResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// ComplianceStatusResponse represents a compliance status option
type ComplianceStatusResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// RiskLevelResponse represents a risk level option
type RiskLevelResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// PaginationResponse represents pagination information
type PaginationResponse struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}
