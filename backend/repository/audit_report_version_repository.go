package repository

import (
	"eservice-backend/models"
	"time"

	"gorm.io/gorm"
)

type AuditReportVersionRepository interface {
	Create(version *models.AuditReportVersion) error
	GetByID(id uint) (*models.AuditReportVersion, error)
	GetByReportID(reportID uint) ([]models.AuditReportVersion, error)
	GetAll() ([]models.AuditReportVersion, error)
	GetByVersionNumber(reportID uint, versionNumber int) (*models.AuditReportVersion, error)
	GetByStatus(status models.ReportStatus) ([]models.AuditReportVersion, error)
	GetBySubmittedByID(submittedByID uint) ([]models.AuditReportVersion, error)
	GetByDateRange(start, end time.Time) ([]models.AuditReportVersion, error)
	Update(version *models.AuditReportVersion) error
	Delete(id uint) error
	UpdateStatus(id uint, status models.ReportStatus) error
	GetLatestVersion(reportID uint) (*models.AuditReportVersion, error)
	GetVersionsByComplianceStatus(complianceStatus string) ([]models.AuditReportVersion, error)
	GetVersionsByRiskLevel(riskLevel string) ([]models.AuditReportVersion, error)
	SearchVersions(query string) ([]models.AuditReportVersion, error)
}

type auditReportVersionRepository struct {
	db *gorm.DB
}

func NewAuditReportVersionRepository(db *gorm.DB) AuditReportVersionRepository {
	return &auditReportVersionRepository{db: db}
}

func (r *auditReportVersionRepository) Create(version *models.AuditReportVersion) error {
	return r.db.Create(version).Error
}

func (r *auditReportVersionRepository) GetByID(id uint) (*models.AuditReportVersion, error) {
	var version models.AuditReportVersion
	err := r.db.Preload("Report").Preload("SubmittedBy").
		Preload("ReviewedBy").Preload("ApprovedBy").First(&version, id).Error
	if err != nil {
		return nil, err
	}
	return &version, nil
}

func (r *auditReportVersionRepository) GetByReportID(reportID uint) ([]models.AuditReportVersion, error) {
	var versions []models.AuditReportVersion
	err := r.db.Preload("Report").Preload("SubmittedBy").
		Preload("ReviewedBy").Preload("ApprovedBy").
		Where("report_id = ?", reportID).Order("version_number DESC").Find(&versions).Error
	return versions, err
}

func (r *auditReportVersionRepository) GetAll() ([]models.AuditReportVersion, error) {
	var versions []models.AuditReportVersion
	err := r.db.Preload("Report").Preload("SubmittedBy").
		Preload("ReviewedBy").Preload("ApprovedBy").
		Order("created_at DESC").Find(&versions).Error
	return versions, err
}

func (r *auditReportVersionRepository) GetByVersionNumber(reportID uint, versionNumber int) (*models.AuditReportVersion, error) {
	var version models.AuditReportVersion
	err := r.db.Preload("Report").Preload("SubmittedBy").
		Preload("ReviewedBy").Preload("ApprovedBy").
		Where("report_id = ? AND version_number = ?", reportID, versionNumber).First(&version).Error
	if err != nil {
		return nil, err
	}
	return &version, nil
}

func (r *auditReportVersionRepository) GetByStatus(status models.ReportStatus) ([]models.AuditReportVersion, error) {
	var versions []models.AuditReportVersion
	err := r.db.Preload("Report").Preload("SubmittedBy").
		Preload("ReviewedBy").Preload("ApprovedBy").
		Where("status = ?", status).Order("created_at DESC").Find(&versions).Error
	return versions, err
}

func (r *auditReportVersionRepository) GetBySubmittedByID(submittedByID uint) ([]models.AuditReportVersion, error) {
	var versions []models.AuditReportVersion
	err := r.db.Preload("Report").Preload("SubmittedBy").
		Preload("ReviewedBy").Preload("ApprovedBy").
		Where("submitted_by_id = ?", submittedByID).Order("created_at DESC").Find(&versions).Error
	return versions, err
}

func (r *auditReportVersionRepository) GetByDateRange(start, end time.Time) ([]models.AuditReportVersion, error) {
	var versions []models.AuditReportVersion
	err := r.db.Preload("Report").Preload("SubmittedBy").
		Preload("ReviewedBy").Preload("ApprovedBy").
		Where("created_at BETWEEN ? AND ?", start, end).
		Order("created_at DESC").Find(&versions).Error
	return versions, err
}

func (r *auditReportVersionRepository) Update(version *models.AuditReportVersion) error {
	return r.db.Save(version).Error
}

func (r *auditReportVersionRepository) Delete(id uint) error {
	return r.db.Delete(&models.AuditReportVersion{}, id).Error
}

func (r *auditReportVersionRepository) UpdateStatus(id uint, status models.ReportStatus) error {
	return r.db.Model(&models.AuditReportVersion{}).Where("id = ?", id).Update("status", status).Error
}

func (r *auditReportVersionRepository) GetLatestVersion(reportID uint) (*models.AuditReportVersion, error) {
	var version models.AuditReportVersion
	err := r.db.Preload("Report").Preload("SubmittedBy").
		Preload("ReviewedBy").Preload("ApprovedBy").
		Where("report_id = ?", reportID).Order("version_number DESC").First(&version).Error
	if err != nil {
		return nil, err
	}
	return &version, nil
}

func (r *auditReportVersionRepository) GetVersionsByComplianceStatus(complianceStatus string) ([]models.AuditReportVersion, error) {
	var versions []models.AuditReportVersion
	err := r.db.Preload("Report").Preload("SubmittedBy").
		Preload("ReviewedBy").Preload("ApprovedBy").
		Where("compliance_status = ?", complianceStatus).Order("created_at DESC").Find(&versions).Error
	return versions, err
}

func (r *auditReportVersionRepository) GetVersionsByRiskLevel(riskLevel string) ([]models.AuditReportVersion, error) {
	var versions []models.AuditReportVersion
	err := r.db.Preload("Report").Preload("SubmittedBy").
		Preload("ReviewedBy").Preload("ApprovedBy").
		Where("risk_level = ?", riskLevel).Order("created_at DESC").Find(&versions).Error
	return versions, err
}

func (r *auditReportVersionRepository) SearchVersions(query string) ([]models.AuditReportVersion, error) {
	var versions []models.AuditReportVersion
	searchPattern := "%" + query + "%"
	err := r.db.Preload("Report").Preload("SubmittedBy").
		Preload("ReviewedBy").Preload("ApprovedBy").
		Where("title LIKE ? OR content LIKE ? OR findings LIKE ? OR recommendations LIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern).
		Order("created_at DESC").Find(&versions).Error
	return versions, err
}
