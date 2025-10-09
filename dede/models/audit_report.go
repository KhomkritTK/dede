package models

import (
	"time"

	"gorm.io/gorm"
)

type ReportStatus string

const (
	ReportStatusDraft       ReportStatus = "draft"        // ร่าง
	ReportStatusSubmitted   ReportStatus = "submitted"    // ส่งรายงาน
	ReportStatusUnderReview ReportStatus = "under_review" // รอตรวจสอบ
	ReportStatusApproved    ReportStatus = "approved"     // อนุมัติรายงาน
	ReportStatusRejected    ReportStatus = "rejected"     // ปฏิเสธรายงาน
	ReportStatusNeedsEdit   ReportStatus = "needs_edit"   // ต้องแก้ไข
)

type AuditReport struct {
	ID                uint           `json:"id" gorm:"primaryKey"`
	RequestID         uint           `json:"request_id" gorm:"not null;index"`
	Request           LicenseRequest `json:"request" gorm:"foreignKey:RequestID"`
	InspectionID      uint           `json:"inspection_id" gorm:"not null;index"`
	Inspection        Inspection     `json:"inspection" gorm:"foreignKey:InspectionID"`
	InspectorID       uint           `json:"inspector_id" gorm:"not null;index"`
	Inspector         User           `json:"inspector" gorm:"foreignKey:InspectorID"`
	ReviewerID        *uint          `json:"reviewer_id" gorm:"index"`
	Reviewer          *User          `json:"reviewer" gorm:"foreignKey:ReviewerID"`
	Status            ReportStatus   `json:"status" gorm:"not null;default:'draft'"`
	ReportNumber      string         `json:"report_number" gorm:"uniqueIndex;not null"`
	Title             string         `json:"title" gorm:"not null"`
	Summary           string         `json:"summary"`
	Findings          string         `json:"findings"`
	Recommendations   string         `json:"recommendations"`
	ComplianceStatus  string         `json:"compliance_status"` // compliant, non_compliant, partial
	RiskLevel         string         `json:"risk_level"`        // low, medium, high, critical
	CorrectiveActions string         `json:"corrective_actions"`
	FollowUpRequired  bool           `json:"follow_up_required" gorm:"default:false"`
	FollowUpDate      *time.Time     `json:"follow_up_date"`
	SubmittedAt       *time.Time     `json:"submitted_at"`
	ReviewedAt        *time.Time     `json:"reviewed_at"`
	ApprovedAt        *time.Time     `json:"approved_at"`
	RejectionReason   string         `json:"rejection_reason"`
	ReviewComments    string         `json:"review_comments"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the AuditReport model
func (AuditReport) TableName() string {
	return "audit_reports"
}

// IsDraft checks if the report is in draft status
func (ar *AuditReport) IsDraft() bool {
	return ar.Status == ReportStatusDraft
}

// IsSubmitted checks if the report is submitted
func (ar *AuditReport) IsSubmitted() bool {
	return ar.Status == ReportStatusSubmitted
}

// IsUnderReview checks if the report is under review
func (ar *AuditReport) IsUnderReview() bool {
	return ar.Status == ReportStatusUnderReview
}

// IsApproved checks if the report is approved
func (ar *AuditReport) IsApproved() bool {
	return ar.Status == ReportStatusApproved
}

// IsRejected checks if the report is rejected
func (ar *AuditReport) IsRejected() bool {
	return ar.Status == ReportStatusRejected
}

// NeedsEdit checks if the report needs editing
func (ar *AuditReport) NeedsEdit() bool {
	return ar.Status == ReportStatusNeedsEdit
}

// CanSubmit checks if the report can be submitted
func (ar *AuditReport) CanSubmit() bool {
	return ar.Status == ReportStatusDraft
}

// CanReview checks if the report can be reviewed
func (ar *AuditReport) CanReview() bool {
	return ar.Status == ReportStatusSubmitted
}

// CanApprove checks if the report can be approved
func (ar *AuditReport) CanApprove() bool {
	return ar.Status == ReportStatusUnderReview
}

// CanReject checks if the report can be rejected
func (ar *AuditReport) CanReject() bool {
	return ar.Status == ReportStatusSubmitted || ar.Status == ReportStatusUnderReview
}

// CanRequestEdit checks if the report can be requested for edit
func (ar *AuditReport) CanRequestEdit() bool {
	return ar.Status == ReportStatusSubmitted || ar.Status == ReportStatusUnderReview
}

// IsCompliant checks if the report indicates compliance
func (ar *AuditReport) IsCompliant() bool {
	return ar.ComplianceStatus == "compliant"
}

// GetRiskLevel returns the risk level of the report
func (ar *AuditReport) GetRiskLevel() string {
	return ar.RiskLevel
}
