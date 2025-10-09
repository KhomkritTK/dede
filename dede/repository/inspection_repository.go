package repository

import (
	"eservice-backend/models"
	"time"

	"gorm.io/gorm"
)

type InspectionRepository interface {
	Create(inspection *models.Inspection) error
	GetByID(id uint) (*models.Inspection, error)
	GetAll() ([]models.Inspection, error)
	GetByRequestID(requestID uint) ([]models.Inspection, error)
	GetByInspectorID(inspectorID uint) ([]models.Inspection, error)
	GetByStatus(status models.InspectionStatus) ([]models.Inspection, error)
	GetByDateRange(start, end time.Time) ([]models.Inspection, error)
	Update(inspection *models.Inspection) error
	Delete(id uint) error
	UpdateStatus(id uint, status models.InspectionStatus) error
	StartInspection(id uint) error
	CompleteInspection(id uint, findings, recommendations string) error
	CancelInspection(id uint, reason string) error
	RescheduleInspection(id uint, newDate time.Time, newTime string) error
	GetUpcomingInspections() ([]models.Inspection, error)
	GetMissedInspections() ([]models.Inspection, error)
	SearchInspections(query string) ([]models.Inspection, error)
}

type inspectionRepository struct {
	db *gorm.DB
}

func NewInspectionRepository(db *gorm.DB) InspectionRepository {
	return &inspectionRepository{db: db}
}

func (r *inspectionRepository) Create(inspection *models.Inspection) error {
	return r.db.Create(inspection).Error
}

func (r *inspectionRepository) GetByID(id uint) (*models.Inspection, error) {
	var inspection models.Inspection
	err := r.db.Preload("Request").Preload("Inspector").First(&inspection, id).Error
	if err != nil {
		return nil, err
	}
	return &inspection, nil
}

func (r *inspectionRepository) GetAll() ([]models.Inspection, error) {
	var inspections []models.Inspection
	err := r.db.Preload("Request").Preload("Inspector").
		Order("scheduled_date DESC, scheduled_time DESC").Find(&inspections).Error
	return inspections, err
}

func (r *inspectionRepository) GetByRequestID(requestID uint) ([]models.Inspection, error) {
	var inspections []models.Inspection
	err := r.db.Preload("Request").Preload("Inspector").
		Where("request_id = ?", requestID).Order("scheduled_date DESC").Find(&inspections).Error
	return inspections, err
}

func (r *inspectionRepository) GetByInspectorID(inspectorID uint) ([]models.Inspection, error) {
	var inspections []models.Inspection
	err := r.db.Preload("Request").Preload("Inspector").
		Where("inspector_id = ?", inspectorID).Order("scheduled_date DESC").Find(&inspections).Error
	return inspections, err
}

func (r *inspectionRepository) GetByStatus(status models.InspectionStatus) ([]models.Inspection, error) {
	var inspections []models.Inspection
	err := r.db.Preload("Request").Preload("Inspector").
		Where("status = ?", status).Order("scheduled_date DESC").Find(&inspections).Error
	return inspections, err
}

func (r *inspectionRepository) GetByDateRange(start, end time.Time) ([]models.Inspection, error) {
	var inspections []models.Inspection
	err := r.db.Preload("Request").Preload("Inspector").
		Where("scheduled_date BETWEEN ? AND ?", start, end).
		Order("scheduled_date DESC, scheduled_time DESC").Find(&inspections).Error
	return inspections, err
}

func (r *inspectionRepository) Update(inspection *models.Inspection) error {
	return r.db.Save(inspection).Error
}

func (r *inspectionRepository) Delete(id uint) error {
	return r.db.Delete(&models.Inspection{}, id).Error
}

func (r *inspectionRepository) UpdateStatus(id uint, status models.InspectionStatus) error {
	return r.db.Model(&models.Inspection{}).Where("id = ?", id).Update("status", status).Error
}

func (r *inspectionRepository) StartInspection(id uint) error {
	now := time.Now()
	return r.db.Model(&models.Inspection{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":            models.InspectionStatusInProgress,
		"actual_start_date": &now,
	}).Error
}

func (r *inspectionRepository) CompleteInspection(id uint, findings, recommendations string) error {
	now := time.Now()
	return r.db.Model(&models.Inspection{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":          models.InspectionStatusCompleted,
		"actual_end_date": &now,
		"findings":        findings,
		"recommendations": recommendations,
	}).Error
}

func (r *inspectionRepository) CancelInspection(id uint, reason string) error {
	return r.db.Model(&models.Inspection{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status": models.InspectionStatusCancelled,
		"notes":  reason,
	}).Error
}

func (r *inspectionRepository) RescheduleInspection(id uint, newDate time.Time, newTime string) error {
	return r.db.Model(&models.Inspection{}).Where("id = ?", id).Updates(map[string]interface{}{
		"scheduled_date": newDate,
		"scheduled_time": newTime,
		"status":         models.InspectionStatusScheduled,
	}).Error
}

func (r *inspectionRepository) GetUpcomingInspections() ([]models.Inspection, error) {
	var inspections []models.Inspection
	now := time.Now()
	err := r.db.Preload("Request").Preload("Inspector").
		Where("scheduled_date >= ? AND status = ?", now, models.InspectionStatusScheduled).
		Order("scheduled_date ASC, scheduled_time ASC").Find(&inspections).Error
	return inspections, err
}

func (r *inspectionRepository) GetMissedInspections() ([]models.Inspection, error) {
	var inspections []models.Inspection
	now := time.Now()
	err := r.db.Preload("Request").Preload("Inspector").
		Where("scheduled_date < ? AND status = ?", now, models.InspectionStatusScheduled).
		Order("scheduled_date DESC").Find(&inspections).Error
	return inspections, err
}

func (r *inspectionRepository) SearchInspections(query string) ([]models.Inspection, error) {
	var inspections []models.Inspection
	searchPattern := "%" + query + "%"
	err := r.db.Preload("Request").Preload("Inspector").
		Joins("JOIN license_requests ON inspections.request_id = license_requests.id").
		Where("inspections.location LIKE ? OR inspections.purpose LIKE ? OR license_requests.request_number LIKE ?",
			searchPattern, searchPattern, searchPattern).
		Order("inspections.scheduled_date DESC").Find(&inspections).Error
	return inspections, err
}
