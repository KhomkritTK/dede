package service

import (
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/audit/dto"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type AuditReportService interface {
	CreateReport(req dto.CreateReportRequest) (*models.AuditReport, error)
	GetReportByID(reportID uint) (*models.AuditReport, error)
	GetReportsByRequestID(requestID uint) ([]models.AuditReport, error)
	GetReportsByUserID(userID uint) ([]models.AuditReport, error)
	UpdateReport(reportID uint, req dto.UpdateReportRequest) (*models.AuditReport, error)
	DeleteReport(reportID uint) error
	CreateReportVersion(reportID uint, req dto.CreateReportVersionRequest) (*models.AuditReportVersion, error)
	GetReportVersions(reportID uint) ([]models.AuditReportVersion, error)
	GetReportVersionByID(versionID uint) (*models.AuditReportVersion, error)
	UpdateReportVersion(versionID uint, req dto.UpdateReportVersionRequest) (*models.AuditReportVersion, error)
	DeleteReportVersion(versionID uint) error
	ApproveReportVersion(versionID uint, req dto.ApproveReportVersionRequest) error
	RejectReportVersion(versionID uint, req dto.RejectReportVersionRequest) error
	UploadFile(reportID uint, versionID uint, fileData []byte, fileName string) (string, error)
	GetReportStatistics() (map[string]interface{}, error)
}

type auditReportService struct {
	db                     *gorm.DB
	notificationRepo       repository.NotificationRepository
	userRepo               repository.UserRepository
	auditReportRepo        repository.AuditReportRepository
	auditReportVersionRepo repository.AuditReportVersionRepository
}

func NewAuditReportService(db *gorm.DB) AuditReportService {
	return &auditReportService{
		db:                     db,
		notificationRepo:       repository.NewNotificationRepository(db),
		userRepo:               repository.NewUserRepository(db),
		auditReportRepo:        repository.NewAuditReportRepository(db),
		auditReportVersionRepo: repository.NewAuditReportVersionRepository(db),
	}
}

// CreateReport creates a new audit report
func (s *auditReportService) CreateReport(req dto.CreateReportRequest) (*models.AuditReport, error) {
	// Create audit report
	report := &models.AuditReport{
		Title:       req.Title,
		RequestID:   req.RequestID,
		InspectorID: req.InspectorID,
		Status:      models.ReportStatusDraft,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err := s.db.Create(report).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create audit report: %w", err)
	}

	// Create initial version
	version := &models.AuditReportVersion{
		ReportID:         report.ID,
		VersionNumber:    1,
		Title:            req.Title,
		Content:          req.Content,
		Findings:         req.Findings,
		Recommendations:  req.Recommendations,
		ComplianceStatus: req.ComplianceStatus,
		RiskLevel:        req.RiskLevel,
		Status:           models.ReportStatusDraft,
		SubmittedByID:    req.InspectorID,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	err = s.db.Create(version).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create audit report version: %w", err)
	}

	// Store report version in the report (using a JSON field for simplicity)
	// In a real implementation, you might use a separate table for current version tracking

	// Create notification for DEDE Staff
	s.createNotificationForRole(
		models.UserRole("dede_staff"),
		"รายงานตรวจสอบใหม่",
		fmt.Sprintf("รายงานตรวจสอบ %s ถูกสร้างขึ้นสำหรับพิจารณา", req.Title),
		models.NotificationType("report_created"),
		models.PriorityNormal,
		"audit_report",
		report.ID,
		"/admin-portal/audit-reports",
	)

	return report, nil
}

// GetReportByID retrieves an audit report by ID
func (s *auditReportService) GetReportByID(reportID uint) (*models.AuditReport, error) {
	return s.auditReportRepo.GetByID(reportID)
}

// GetReportsByRequestID retrieves audit reports by request ID
func (s *auditReportService) GetReportsByRequestID(requestID uint) ([]models.AuditReport, error) {
	return s.auditReportRepo.GetByRequestID(requestID)
}

// GetReportsByUserID retrieves audit reports by user ID
func (s *auditReportService) GetReportsByUserID(userID uint) ([]models.AuditReport, error) {
	return s.auditReportRepo.GetByInspectorID(userID)
}

// UpdateReport updates an audit report
func (s *auditReportService) UpdateReport(reportID uint, req dto.UpdateReportRequest) (*models.AuditReport, error) {
	// Get report
	report, err := s.auditReportRepo.GetByID(reportID)
	if err != nil {
		return nil, fmt.Errorf("report not found: %w", err)
	}

	// Update report fields
	if req.Title != "" {
		report.Title = req.Title
	}
	if req.Description != "" {
		report.Summary = req.Description
	}
	if req.Status != "" {
		report.Status = models.ReportStatus(req.Status)
	}
	report.UpdatedAt = time.Now()

	err = s.db.Save(report).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update audit report: %w", err)
	}

	return report, nil
}

// DeleteReport deletes an audit report
func (s *auditReportService) DeleteReport(reportID uint) error {
	// Get report
	report, err := s.auditReportRepo.GetByID(reportID)
	if err != nil {
		return fmt.Errorf("report not found: %w", err)
	}

	// Delete all versions
	err = s.db.Where("report_id = ?", reportID).Delete(&models.AuditReportVersion{}).Error
	if err != nil {
		return fmt.Errorf("failed to delete report versions: %w", err)
	}

	// Delete report
	err = s.db.Delete(report).Error
	if err != nil {
		return fmt.Errorf("failed to delete audit report: %w", err)
	}

	return nil
}

// CreateReportVersion creates a new version of an audit report
func (s *auditReportService) CreateReportVersion(reportID uint, req dto.CreateReportVersionRequest) (*models.AuditReportVersion, error) {
	// Get report
	report, err := s.auditReportRepo.GetByID(reportID)
	if err != nil {
		return nil, fmt.Errorf("report not found: %w", err)
	}

	// Get latest version number
	var latestVersion models.AuditReportVersion
	err = s.db.Where("report_id = ?", reportID).Order("version_number DESC").First(&latestVersion).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, fmt.Errorf("failed to get latest version: %w", err)
	}

	// Create new version
	version := &models.AuditReportVersion{
		ReportID:         reportID,
		VersionNumber:    latestVersion.VersionNumber + 1,
		Title:            req.Title,
		Content:          req.Content,
		Findings:         req.Findings,
		Recommendations:  req.Recommendations,
		ComplianceStatus: req.ComplianceStatus,
		RiskLevel:        req.RiskLevel,
		Status:           models.ReportStatus(req.Status),
		SubmittedByID:    req.SubmittedByID,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	// Set file attachments
	if len(req.FileAttachments) > 0 {
		version.SetFileAttachments(req.FileAttachments)
	}

	err = s.db.Create(version).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create audit report version: %w", err)
	}

	// Update report with new version
	report.UpdatedAt = time.Now()
	err = s.db.Save(report).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update audit report: %w", err)
	}

	// Create notification if status is submitted
	if req.Status == "submitted" {
		s.createNotificationForRole(
			models.UserRole("dede_staff"),
			"รายงานตรวจสอบสำหรับพิจารณา",
			fmt.Sprintf("รายงานตรวจสอบ %s ส่งเพื่อพิจารณา", req.Title),
			models.NotificationType("report_submitted"),
			models.PriorityNormal,
			"audit_report",
			version.ID,
			"/admin-portal/audit-reports",
		)
	}

	return version, nil
}

// GetReportVersions retrieves all versions of an audit report
func (s *auditReportService) GetReportVersions(reportID uint) ([]models.AuditReportVersion, error) {
	return s.auditReportVersionRepo.GetByReportID(reportID)
}

// GetReportVersionByID retrieves a specific version of an audit report
func (s *auditReportService) GetReportVersionByID(versionID uint) (*models.AuditReportVersion, error) {
	return s.auditReportVersionRepo.GetByID(versionID)
}

// UpdateReportVersion updates a specific version of an audit report
func (s *auditReportService) UpdateReportVersion(versionID uint, req dto.UpdateReportVersionRequest) (*models.AuditReportVersion, error) {
	// Get version
	version, err := s.auditReportVersionRepo.GetByID(versionID)
	if err != nil {
		return nil, fmt.Errorf("version not found: %w", err)
	}

	// Update version fields
	if req.Title != "" {
		version.Title = req.Title
	}
	if req.Content != "" {
		version.Content = req.Content
	}
	if req.Findings != "" {
		version.Findings = req.Findings
	}
	if req.Recommendations != "" {
		version.Recommendations = req.Recommendations
	}
	if req.ComplianceStatus != "" {
		version.ComplianceStatus = req.ComplianceStatus
	}
	if req.RiskLevel != "" {
		version.RiskLevel = req.RiskLevel
	}
	if req.Status != "" {
		version.Status = models.ReportStatus(req.Status)
	}
	version.UpdatedAt = time.Now()

	// Set file attachments
	if len(req.FileAttachments) > 0 {
		version.SetFileAttachments(req.FileAttachments)
	}

	err = s.db.Save(version).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update audit report version: %w", err)
	}

	return version, nil
}

// DeleteReportVersion deletes a specific version of an audit report
func (s *auditReportService) DeleteReportVersion(versionID uint) error {
	// Get version
	version, err := s.auditReportVersionRepo.GetByID(versionID)
	if err != nil {
		return fmt.Errorf("version not found: %w", err)
	}

	// Check if this is the latest version
	latestVersion, err := s.auditReportVersionRepo.GetLatestVersion(version.ReportID)
	if err != nil {
		return fmt.Errorf("failed to get latest version: %w", err)
	}

	if latestVersion.ID == versionID {
		return fmt.Errorf("cannot delete latest version")
	}

	// Delete version
	err = s.db.Delete(version).Error
	if err != nil {
		return fmt.Errorf("failed to delete audit report version: %w", err)
	}

	return nil
}

// ApproveReportVersion approves a specific version of an audit report
func (s *auditReportService) ApproveReportVersion(versionID uint, req dto.ApproveReportVersionRequest) error {
	// Get version
	version, err := s.auditReportVersionRepo.GetByID(versionID)
	if err != nil {
		return fmt.Errorf("version not found: %w", err)
	}

	// Update version status
	version.Status = models.ReportStatusApproved
	version.ApprovedByID = &req.ApprovedByID
	version.ReviewComments = req.Comments
	version.UpdatedAt = time.Now()

	err = s.db.Save(version).Error
	if err != nil {
		return fmt.Errorf("failed to approve audit report version: %w", err)
	}

	// Update report status
	report, err := s.auditReportRepo.GetByID(version.ReportID)
	if err != nil {
		return fmt.Errorf("report not found: %w", err)
	}

	report.Status = models.ReportStatusApproved
	report.UpdatedAt = time.Now()
	err = s.db.Save(report).Error
	if err != nil {
		return fmt.Errorf("failed to update audit report: %w", err)
	}

	// Create notification for inspector
	s.createNotificationForUser(
		version.SubmittedByID,
		"รายงานตรวจสอบได้รับการอนุมัติ",
		fmt.Sprintf("รายงานตรวจสอบ %s ได้รับการอนุมัติแล้ว", version.Title),
		models.NotificationType("report_approved"),
		models.PriorityHigh,
		"audit_report",
		version.ID,
		"/admin-portal/audit-reports",
	)

	// Create notification for DEDE Head
	s.createNotificationForRole(
		models.UserRole("dede_head"),
		"รายงานตรวจสอบได้รับการอนุมัติ",
		fmt.Sprintf("รายงานตรวจสอบ %s ได้รับการอนุมัติแล้ว รอการอนุมัติสุดท้าย", version.Title),
		models.NotificationType("report_approved"),
		models.PriorityHigh,
		"audit_report",
		version.ID,
		"/admin-portal/audit-reports",
	)

	return nil
}

// RejectReportVersion rejects a specific version of an audit report
func (s *auditReportService) RejectReportVersion(versionID uint, req dto.RejectReportVersionRequest) error {
	// Get version
	version, err := s.auditReportVersionRepo.GetByID(versionID)
	if err != nil {
		return fmt.Errorf("version not found: %w", err)
	}

	// Update version status
	version.Status = models.ReportStatusRejected
	version.RejectionReason = req.Reason
	version.ReviewComments = req.Comments
	version.UpdatedAt = time.Now()

	err = s.db.Save(version).Error
	if err != nil {
		return fmt.Errorf("failed to reject audit report version: %w", err)
	}

	// Create notification for inspector
	s.createNotificationForUser(
		version.SubmittedByID,
		"รายงานตรวจสอบถูกปฏิเสธ",
		fmt.Sprintf("รายงานตรวจสอบ %s ถูกปฏิเสธ: %s", version.Title, req.Reason),
		models.NotificationType("report_rejected"),
		models.PriorityHigh,
		"audit_report",
		version.ID,
		"/admin-portal/audit-reports",
	)

	return nil
}

// UploadFile uploads a file for an audit report version
func (s *auditReportService) UploadFile(reportID uint, versionID uint, fileData []byte, fileName string) (string, error) {
	// Generate file path
	filePath := fmt.Sprintf("audit_reports/%d/%d/%s", reportID, versionID, fileName)

	// Save file (in a real implementation, you would save to cloud storage)
	// For now, we'll just return the file path
	return filePath, nil
}

// GetReportStatistics returns statistics about audit reports
func (s *auditReportService) GetReportStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count reports by status
	var draftCount, submittedCount, underReviewCount, approvedCount, rejectedCount int64
	s.db.Model(&models.AuditReport{}).Where("status = ?", models.ReportStatusDraft).Count(&draftCount)
	s.db.Model(&models.AuditReport{}).Where("status = ?", models.ReportStatusSubmitted).Count(&submittedCount)
	s.db.Model(&models.AuditReport{}).Where("status = ?", models.ReportStatusUnderReview).Count(&underReviewCount)
	s.db.Model(&models.AuditReport{}).Where("status = ?", models.ReportStatusApproved).Count(&approvedCount)
	s.db.Model(&models.AuditReport{}).Where("status = ?", models.ReportStatusRejected).Count(&rejectedCount)

	stats["total_reports"] = draftCount + submittedCount + underReviewCount + approvedCount + rejectedCount
	stats["draft_reports"] = draftCount
	stats["submitted_reports"] = submittedCount
	stats["under_review_reports"] = underReviewCount
	stats["approved_reports"] = approvedCount
	stats["rejected_reports"] = rejectedCount

	// Count reports by compliance status
	var compliantCount, nonCompliantCount, partiallyCompliantCount int64
	s.db.Model(&models.AuditReportVersion{}).Where("compliance_status = ?", "compliant").Count(&compliantCount)
	s.db.Model(&models.AuditReportVersion{}).Where("compliance_status = ?", "non_compliant").Count(&nonCompliantCount)
	s.db.Model(&models.AuditReportVersion{}).Where("compliance_status = ?", "partially_compliant").Count(&partiallyCompliantCount)

	stats["compliant_reports"] = compliantCount
	stats["non_compliant_reports"] = nonCompliantCount
	stats["partially_compliant_reports"] = partiallyCompliantCount

	// Count reports by risk level
	var lowRiskCount, mediumRiskCount, highRiskCount int64
	s.db.Model(&models.AuditReportVersion{}).Where("risk_level = ?", "low").Count(&lowRiskCount)
	s.db.Model(&models.AuditReportVersion{}).Where("risk_level = ?", "medium").Count(&mediumRiskCount)
	s.db.Model(&models.AuditReportVersion{}).Where("risk_level = ?", "high").Count(&highRiskCount)

	stats["low_risk_reports"] = lowRiskCount
	stats["medium_risk_reports"] = mediumRiskCount
	stats["high_risk_reports"] = highRiskCount

	return stats, nil
}

// Helper functions

func (s *auditReportService) createNotificationForUser(userID uint, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
	notification := &models.Notification{
		Title:       title,
		Message:     message,
		Type:        notifType,
		Priority:    priority,
		RecipientID: &userID,
		EntityType:  entityType,
		EntityID:    &entityID,
		ActionURL:   actionURL,
	}

	s.notificationRepo.Create(notification)
}

func (s *auditReportService) createNotificationForRole(role models.UserRole, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
	notification := &models.Notification{
		Title:         title,
		Message:       message,
		Type:          notifType,
		Priority:      priority,
		RecipientRole: &role,
		EntityType:    entityType,
		EntityID:      &entityID,
		ActionURL:     actionURL,
	}

	s.notificationRepo.Create(notification)
}
