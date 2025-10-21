package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type AuditReportVersion struct {
	ID                uint            `json:"id" gorm:"primaryKey"`
	ReportID          uint            `json:"report_id" gorm:"not null;index"`
	Report            AuditReport     `json:"report" gorm:"foreignKey:ReportID"`
	VersionNumber     int             `json:"version_number" gorm:"not null"`
	Title             string          `json:"title" gorm:"not null"`
	Content           string          `json:"content"`
	Findings          string          `json:"findings"`
	Recommendations   string          `json:"recommendations"`
	ComplianceStatus  string          `json:"compliance_status"`
	RiskLevel         string          `json:"risk_level"`
	CorrectiveActions string          `json:"corrective_actions"`
	FollowUpRequired  bool            `json:"follow_up_required" gorm:"default:false"`
	FollowUpDate      *time.Time      `json:"follow_up_date"`
	Status            ReportStatus    `json:"status" gorm:"not null;default:'draft'"`
	SubmittedByID     uint            `json:"submitted_by_id" gorm:"not null;index"`
	SubmittedBy       User            `json:"submitted_by" gorm:"foreignKey:SubmittedByID"`
	ReviewedByID      *uint           `json:"reviewed_by_id" gorm:"index"`
	ReviewedBy        *User           `json:"reviewed_by" gorm:"foreignKey:ReviewedByID"`
	ApprovedByID      *uint           `json:"approved_by_id" gorm:"index"`
	ApprovedBy        *User           `json:"approved_by" gorm:"foreignKey:ApprovedByID"`
	RejectionReason   string          `json:"rejection_reason"`
	ReviewComments    string          `json:"review_comments"`
	FileAttachments   json.RawMessage `json:"file_attachments" gorm:"type:jsonb;default:'[]'"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
	DeletedAt         gorm.DeletedAt  `json:"-" gorm:"index"`
}

// TableName specifies the table name for the AuditReportVersion model
func (AuditReportVersion) TableName() string {
	return "audit_report_versions"
}

// GetFileAttachments returns the file attachments as a slice
func (arv *AuditReportVersion) GetFileAttachments() []string {
	var attachments []string
	if arv.FileAttachments != nil {
		json.Unmarshal(arv.FileAttachments, &attachments)
	}
	return attachments
}

// SetFileAttachments sets the file attachments from a slice
func (arv *AuditReportVersion) SetFileAttachments(attachments []string) error {
	data, err := json.Marshal(attachments)
	if err != nil {
		return err
	}
	arv.FileAttachments = data
	return nil
}

// IsDraft checks if the report version is in draft status
func (arv *AuditReportVersion) IsDraft() bool {
	return arv.Status == ReportStatusDraft
}

// IsSubmitted checks if the report version is submitted
func (arv *AuditReportVersion) IsSubmitted() bool {
	return arv.Status == ReportStatusSubmitted
}

// IsUnderReview checks if the report version is under review
func (arv *AuditReportVersion) IsUnderReview() bool {
	return arv.Status == ReportStatusUnderReview
}

// IsApproved checks if the report version is approved
func (arv *AuditReportVersion) IsApproved() bool {
	return arv.Status == ReportStatusApproved
}

// IsRejected checks if the report version is rejected
func (arv *AuditReportVersion) IsRejected() bool {
	return arv.Status == ReportStatusRejected
}

// NeedsEdit checks if the report version needs editing
func (arv *AuditReportVersion) NeedsEdit() bool {
	return arv.Status == ReportStatusNeedsEdit
}

// CanSubmit checks if the report version can be submitted
func (arv *AuditReportVersion) CanSubmit() bool {
	return arv.Status == ReportStatusDraft
}

// CanReview checks if the report version can be reviewed
func (arv *AuditReportVersion) CanReview() bool {
	return arv.Status == ReportStatusSubmitted
}

// CanApprove checks if the report version can be approved
func (arv *AuditReportVersion) CanApprove() bool {
	return arv.Status == ReportStatusUnderReview
}

// CanReject checks if the report version can be rejected
func (arv *AuditReportVersion) CanReject() bool {
	return arv.Status == ReportStatusSubmitted || arv.Status == ReportStatusUnderReview
}

// CanRequestEdit checks if the report version can be requested for edit
func (arv *AuditReportVersion) CanRequestEdit() bool {
	return arv.Status == ReportStatusSubmitted || arv.Status == ReportStatusUnderReview
}

// IsCompliant checks if the report indicates compliance
func (arv *AuditReportVersion) IsCompliant() bool {
	return arv.ComplianceStatus == "compliant"
}

// GetRiskLevel returns the risk level of the report
func (arv *AuditReportVersion) GetRiskLevel() string {
	return arv.RiskLevel
}
