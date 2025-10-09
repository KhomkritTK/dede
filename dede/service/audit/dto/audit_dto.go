package dto

import "time"

// PaginationResponse represents pagination information
type PaginationResponse struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}

// CreateAuditReportRequest represents the create audit report request payload
type CreateAuditReportRequest struct {
	RequestID         uint       `json:"request_id" binding:"required"`
	InspectionID      uint       `json:"inspection_id" binding:"required"`
	Title             string     `json:"title" binding:"required"`
	Summary           string     `json:"summary"`
	Findings          string     `json:"findings"`
	Recommendations   string     `json:"recommendations"`
	ComplianceStatus  string     `json:"compliance_status"` // compliant, non_compliant, partial
	RiskLevel         string     `json:"risk_level"`        // low, medium, high, critical
	CorrectiveActions string     `json:"corrective_actions"`
	FollowUpRequired  bool       `json:"follow_up_required"`
	FollowUpDate      *time.Time `json:"follow_up_date"`
}

// UpdateAuditReportRequest represents the update audit report request payload
type UpdateAuditReportRequest struct {
	Title             string     `json:"title"`
	Summary           string     `json:"summary"`
	Findings          string     `json:"findings"`
	Recommendations   string     `json:"recommendations"`
	ComplianceStatus  string     `json:"compliance_status"`
	RiskLevel         string     `json:"risk_level"`
	CorrectiveActions string     `json:"corrective_actions"`
	FollowUpRequired  bool       `json:"follow_up_required"`
	FollowUpDate      *time.Time `json:"follow_up_date"`
}

// AuditReportResponse represents the audit report response
type AuditReportResponse struct {
	ID                uint       `json:"id"`
	RequestID         uint       `json:"request_id"`
	InspectionID      uint       `json:"inspection_id"`
	InspectorID       uint       `json:"inspector_id"`
	ReviewerID        *uint      `json:"reviewer_id"`
	Status            string     `json:"status"`
	ReportNumber      string     `json:"report_number"`
	Title             string     `json:"title"`
	Summary           string     `json:"summary"`
	Findings          string     `json:"findings"`
	Recommendations   string     `json:"recommendations"`
	ComplianceStatus  string     `json:"compliance_status"`
	RiskLevel         string     `json:"risk_level"`
	CorrectiveActions string     `json:"corrective_actions"`
	FollowUpRequired  bool       `json:"follow_up_required"`
	FollowUpDate      *time.Time `json:"follow_up_date"`
	SubmittedAt       *time.Time `json:"submitted_at"`
	ReviewedAt        *time.Time `json:"reviewed_at"`
	ApprovedAt        *time.Time `json:"approved_at"`
	RejectionReason   string     `json:"rejection_reason"`
	ReviewComments    string     `json:"review_comments"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// AuditReportListResponse represents the audit report list response
type AuditReportListResponse struct {
	Reports    []AuditReportResponse `json:"reports"`
	Pagination PaginationResponse    `json:"pagination"`
}

// SubmitReportRequest represents the submit report request payload
type SubmitReportRequest struct {
	ReportID uint `json:"report_id" binding:"required"`
}

// ReviewReportRequest represents the review report request payload
type ReviewReportRequest struct {
	ReportID       uint   `json:"report_id" binding:"required"`
	ReviewComments string `json:"review_comments" binding:"required"`
}

// ApproveReportRequest represents the approve report request payload
type ApproveReportRequest struct {
	ReportID uint `json:"report_id" binding:"required"`
}

// RejectReportRequest represents the reject report request payload
type RejectReportRequest struct {
	ReportID        uint   `json:"report_id" binding:"required"`
	RejectionReason string `json:"rejection_reason" binding:"required"`
}

// RequestEditRequest represents the request edit request payload
type RequestEditRequest struct {
	ReportID       uint   `json:"report_id" binding:"required"`
	ReviewComments string `json:"review_comments" binding:"required"`
}

// SendForReviewRequest represents the send for review request payload
type SendForReviewRequest struct {
	ReportID uint `json:"report_id" binding:"required"`
}

// ReportStatusResponse represents the report status response
type ReportStatusResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// ComplianceStatusResponse represents the compliance status response
type ComplianceStatusResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// RiskLevelResponse represents the risk level response
type RiskLevelResponse struct {
	Value string `json:"value"`
	Label string `json:"label"`
}
