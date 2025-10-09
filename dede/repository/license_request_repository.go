package repository

import (
	"eservice-backend/models"
	"time"

	"gorm.io/gorm"
)

type LicenseRequestRepository interface {
	Create(request *models.LicenseRequest) error
	GetByID(id uint) (*models.LicenseRequest, error)
	GetByRequestNumber(requestNumber string) (*models.LicenseRequest, error)
	GetAll() ([]models.LicenseRequest, error)
	GetByUserID(userID uint) ([]models.LicenseRequest, error)
	GetByStatus(status models.RequestStatus) ([]models.LicenseRequest, error)
	GetByInspectorID(inspectorID uint) ([]models.LicenseRequest, error)
	GetByLicenseType(licenseType models.LicenseType) ([]models.LicenseRequest, error)
	Update(request *models.LicenseRequest) error
	Delete(id uint) error
	UpdateStatus(id uint, status models.RequestStatus) error
	AssignInspector(requestID, inspectorID, assignedByID uint) error
	SetDeadline(requestID uint, deadline time.Time) error
	GetPendingRequests() ([]models.LicenseRequest, error)
	GetOverdueRequests() ([]models.LicenseRequest, error)
	GetRequestsByDateRange(start, end time.Time) ([]models.LicenseRequest, error)
	SearchRequests(query string) ([]models.LicenseRequest, error)
}

type licenseRequestRepository struct {
	db *gorm.DB
}

func NewLicenseRequestRepository(db *gorm.DB) LicenseRequestRepository {
	return &licenseRequestRepository{db: db}
}

func (r *licenseRequestRepository) Create(request *models.LicenseRequest) error {
	return r.db.Create(request).Error
}

func (r *licenseRequestRepository) GetByID(id uint) (*models.LicenseRequest, error) {
	var request models.LicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").First(&request, id).Error
	if err != nil {
		return nil, err
	}
	return &request, nil
}

func (r *licenseRequestRepository) GetByRequestNumber(requestNumber string) (*models.LicenseRequest, error) {
	var request models.LicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("request_number = ?", requestNumber).First(&request).Error
	if err != nil {
		return nil, err
	}
	return &request, nil
}

func (r *licenseRequestRepository) GetAll() ([]models.LicenseRequest, error) {
	var requests []models.LicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *licenseRequestRepository) GetByUserID(userID uint) ([]models.LicenseRequest, error) {
	var requests []models.LicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("user_id = ?", userID).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *licenseRequestRepository) GetByStatus(status models.RequestStatus) ([]models.LicenseRequest, error) {
	var requests []models.LicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("status = ?", status).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *licenseRequestRepository) GetByInspectorID(inspectorID uint) ([]models.LicenseRequest, error) {
	var requests []models.LicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("inspector_id = ?", inspectorID).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *licenseRequestRepository) GetByLicenseType(licenseType models.LicenseType) ([]models.LicenseRequest, error) {
	var requests []models.LicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("license_type = ?", licenseType).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *licenseRequestRepository) Update(request *models.LicenseRequest) error {
	return r.db.Save(request).Error
}

func (r *licenseRequestRepository) Delete(id uint) error {
	return r.db.Delete(&models.LicenseRequest{}, id).Error
}

func (r *licenseRequestRepository) UpdateStatus(id uint, status models.RequestStatus) error {
	return r.db.Model(&models.LicenseRequest{}).Where("id = ?", id).Update("status", status).Error
}

func (r *licenseRequestRepository) AssignInspector(requestID, inspectorID, assignedByID uint) error {
	now := time.Now()
	return r.db.Model(&models.LicenseRequest{}).Where("id = ?", requestID).Updates(map[string]interface{}{
		"inspector_id":   inspectorID,
		"assigned_by_id": assignedByID,
		"assigned_at":    &now,
		"status":         models.StatusAssigned,
	}).Error
}

func (r *licenseRequestRepository) SetDeadline(requestID uint, deadline time.Time) error {
	return r.db.Model(&models.LicenseRequest{}).Where("id = ?", requestID).
		Update("deadline", deadline).Error
}

func (r *licenseRequestRepository) GetPendingRequests() ([]models.LicenseRequest, error) {
	var requests []models.LicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("status IN ?", []models.RequestStatus{
			models.StatusNewRequest,
			models.StatusAccepted,
			models.StatusAssigned,
			models.StatusAppointment,
			models.StatusInspecting,
		}).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *licenseRequestRepository) GetOverdueRequests() ([]models.LicenseRequest, error) {
	var requests []models.LicenseRequest
	now := time.Now()
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("deadline < ? AND status NOT IN ?", now, []models.RequestStatus{
			models.StatusApproved,
			models.StatusRejectedFinal,
		}).Order("deadline ASC").Find(&requests).Error
	return requests, err
}

func (r *licenseRequestRepository) GetRequestsByDateRange(start, end time.Time) ([]models.LicenseRequest, error) {
	var requests []models.LicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("created_at BETWEEN ? AND ?", start, end).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *licenseRequestRepository) SearchRequests(query string) ([]models.LicenseRequest, error) {
	var requests []models.LicenseRequest
	searchPattern := "%" + query + "%"
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("request_number LIKE ? OR title LIKE ? OR description LIKE ?",
			searchPattern, searchPattern, searchPattern).
		Order("created_at DESC").Find(&requests).Error
	return requests, err
}
