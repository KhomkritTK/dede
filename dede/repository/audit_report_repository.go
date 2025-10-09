package repository

import (
	"eservice-backend/models"
	"time"

	"gorm.io/gorm"
)

type AuditReportRepository interface {
	Create(report *models.AuditReport) error
	GetByID(id uint) (*models.AuditReport, error)
	GetByReportNumber(reportNumber string) (*models.AuditReport, error)
	GetAll() ([]models.AuditReport, error)
	GetByRequestID(requestID uint) ([]models.AuditReport, error)
	GetByInspectionID(inspectionID uint) ([]models.AuditReport, error)
	GetByInspectorID(inspectorID uint) ([]models.AuditReport, error)
	GetByReviewerID(reviewerID uint) ([]models.AuditReport, error)
	GetByStatus(status models.ReportStatus) ([]models.AuditReport, error)
	GetByDateRange(start, end time.Time) ([]models.AuditReport, error)
	Update(report *models.AuditReport) error
	Delete(id uint) error
	UpdateStatus(id uint, status models.ReportStatus) error
	SubmitReport(id uint) error
	ReviewReport(id, reviewerID uint, reviewComments string) error
	ApproveReport(id, reviewerID uint) error
	RejectReport(id, reviewerID uint, reason string) error
	RequestEdit(id, reviewerID uint, comments string) error
	GetPendingReviewReports() ([]models.AuditReport, error)
	GetApprovedReports() ([]models.AuditReport, error)
	SearchReports(query string) ([]models.AuditReport, error)
}

type auditReportRepository struct {
	db *gorm.DB
}

func NewAuditReportRepository(db *gorm.DB) AuditReportRepository {
	return &auditReportRepository{db: db}
}

func (r *auditReportRepository) Create(report *models.AuditReport) error {
	return r.db.Create(report).Error
}

func (r *auditReportRepository) GetByID(id uint) (*models.AuditReport, error) {
	var report models.AuditReport
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").First(&report, id).Error
	if err != nil {
		return nil, err
	}
	return &report, nil
}

func (r *auditReportRepository) GetByReportNumber(reportNumber string) (*models.AuditReport, error) {
	var report models.AuditReport
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").
		Where("report_number = ?", reportNumber).First(&report).Error
	if err != nil {
		return nil, err
	}
	return &report, nil
}

func (r *auditReportRepository) GetAll() ([]models.AuditReport, error) {
	var reports []models.AuditReport
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").
		Order("created_at DESC").Find(&reports).Error
	return reports, err
}

func (r *auditReportRepository) GetByRequestID(requestID uint) ([]models.AuditReport, error) {
	var reports []models.AuditReport
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").
		Where("request_id = ?", requestID).Order("created_at DESC").Find(&reports).Error
	return reports, err
}

func (r *auditReportRepository) GetByInspectionID(inspectionID uint) ([]models.AuditReport, error) {
	var reports []models.AuditReport
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").
		Where("inspection_id = ?", inspectionID).Order("created_at DESC").Find(&reports).Error
	return reports, err
}

func (r *auditReportRepository) GetByInspectorID(inspectorID uint) ([]models.AuditReport, error) {
	var reports []models.AuditReport
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").
		Where("inspector_id = ?", inspectorID).Order("created_at DESC").Find(&reports).Error
	return reports, err
}

func (r *auditReportRepository) GetByReviewerID(reviewerID uint) ([]models.AuditReport, error) {
	var reports []models.AuditReport
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").
		Where("reviewer_id = ?", reviewerID).Order("created_at DESC").Find(&reports).Error
	return reports, err
}

func (r *auditReportRepository) GetByStatus(status models.ReportStatus) ([]models.AuditReport, error) {
	var reports []models.AuditReport
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").
		Where("status = ?", status).Order("created_at DESC").Find(&reports).Error
	return reports, err
}

func (r *auditReportRepository) GetByDateRange(start, end time.Time) ([]models.AuditReport, error) {
	var reports []models.AuditReport
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").
		Where("created_at BETWEEN ? AND ?", start, end).
		Order("created_at DESC").Find(&reports).Error
	return reports, err
}

func (r *auditReportRepository) Update(report *models.AuditReport) error {
	return r.db.Save(report).Error
}

func (r *auditReportRepository) Delete(id uint) error {
	return r.db.Delete(&models.AuditReport{}, id).Error
}

func (r *auditReportRepository) UpdateStatus(id uint, status models.ReportStatus) error {
	return r.db.Model(&models.AuditReport{}).Where("id = ?", id).Update("status", status).Error
}

func (r *auditReportRepository) SubmitReport(id uint) error {
	now := time.Now()
	return r.db.Model(&models.AuditReport{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":       models.ReportStatusSubmitted,
		"submitted_at": &now,
	}).Error
}

func (r *auditReportRepository) ReviewReport(id, reviewerID uint, reviewComments string) error {
	now := time.Now()
	return r.db.Model(&models.AuditReport{}).Where("id = ?", id).Updates(map[string]interface{}{
		"reviewer_id":     reviewerID,
		"status":          models.ReportStatusUnderReview,
		"reviewed_at":     &now,
		"review_comments": reviewComments,
	}).Error
}

func (r *auditReportRepository) ApproveReport(id, reviewerID uint) error {
	now := time.Now()
	return r.db.Model(&models.AuditReport{}).Where("id = ?", id).Updates(map[string]interface{}{
		"reviewer_id": reviewerID,
		"status":      models.ReportStatusApproved,
		"approved_at": &now,
	}).Error
}

func (r *auditReportRepository) RejectReport(id, reviewerID uint, reason string) error {
	return r.db.Model(&models.AuditReport{}).Where("id = ?", id).Updates(map[string]interface{}{
		"reviewer_id":      reviewerID,
		"status":           models.ReportStatusRejected,
		"rejection_reason": reason,
	}).Error
}

func (r *auditReportRepository) RequestEdit(id, reviewerID uint, comments string) error {
	return r.db.Model(&models.AuditReport{}).Where("id = ?", id).Updates(map[string]interface{}{
		"reviewer_id":     reviewerID,
		"status":          models.ReportStatusNeedsEdit,
		"review_comments": comments,
	}).Error
}

func (r *auditReportRepository) GetPendingReviewReports() ([]models.AuditReport, error) {
	var reports []models.AuditReport
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").
		Where("status = ?", models.ReportStatusSubmitted).
		Order("submitted_at ASC").Find(&reports).Error
	return reports, err
}

func (r *auditReportRepository) GetApprovedReports() ([]models.AuditReport, error) {
	var reports []models.AuditReport
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").
		Where("status = ?", models.ReportStatusApproved).
		Order("approved_at DESC").Find(&reports).Error
	return reports, err
}

func (r *auditReportRepository) SearchReports(query string) ([]models.AuditReport, error) {
	var reports []models.AuditReport
	searchPattern := "%" + query + "%"
	err := r.db.Preload("Request").Preload("Inspection").
		Preload("Inspector").Preload("Reviewer").
		Where("report_number LIKE ? OR title LIKE ? OR summary LIKE ?",
			searchPattern, searchPattern, searchPattern).
		Order("created_at DESC").Find(&reports).Error
	return reports, err
}
