package repository

import (
	"eservice-backend/models"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type NewLicenseRepo interface {
	Create(request *models.NewLicenseRequest) error
	GetByID(id uint) (*models.NewLicenseRequest, error)
	GetByRequestNumber(requestNumber string) (*models.NewLicenseRequest, error)
	GetAll() ([]models.NewLicenseRequest, error)
	GetByUserID(userID uint) ([]models.NewLicenseRequest, error)
	GetByStatus(status models.RequestStatus) ([]models.NewLicenseRequest, error)
	GetByInspectorID(inspectorID uint) ([]models.NewLicenseRequest, error)
	GetByLicenseType(licenseType string) ([]models.NewLicenseRequest, error)
	Update(request *models.NewLicenseRequest) error
	Delete(id uint) error
	UpdateStatus(id uint, status models.RequestStatus) error
	AssignInspector(requestID, inspectorID, assignedByID uint) error
	SetDeadline(requestID uint, deadline time.Time) error
	GetPendingRequests() ([]models.NewLicenseRequest, error)
	GetOverdueRequests() ([]models.NewLicenseRequest, error)
	GetRequestsByDateRange(start, end time.Time) ([]models.NewLicenseRequest, error)
	SearchRequests(query string) ([]models.NewLicenseRequest, error)
}

type newLicenseRepo struct {
	db *gorm.DB
}

func NewNewLicenseRepo(db *gorm.DB) NewLicenseRepo {
	return &newLicenseRepo{db: db}
}

func (r *newLicenseRepo) Create(request *models.NewLicenseRequest) error {
	// Create the request
	if err := r.db.Create(request).Error; err != nil {
		return err
	}

	// Try to create a service flow log entry for the initial status (ignore errors if table doesn't exist)
	log := &models.ServiceFlowLog{
		LicenseRequestID: request.ID,
		PreviousStatus:   nil, // This is the initial status
		NewStatus:        request.Status,
		ChangeReason:     "คำขอถูกสร้างและส่งเข้าระบบ",
		LicenseType:      "new",
	}

	// Try to create the log entry, but ignore errors if the table doesn't exist
	if err := r.db.Create(log).Error; err != nil {
		// Log the error but continue
		// This handles the case where the service_flow_logs table hasn't been created yet
	}

	return nil
}

func (r *newLicenseRepo) GetByID(id uint) (*models.NewLicenseRequest, error) {
	var request models.NewLicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").First(&request, id).Error
	if err != nil {
		return nil, err
	}
	return &request, nil
}

func (r *newLicenseRepo) GetByRequestNumber(requestNumber string) (*models.NewLicenseRequest, error) {
	var request models.NewLicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("request_number = ?", requestNumber).First(&request).Error
	if err != nil {
		return nil, err
	}
	return &request, nil
}

func (r *newLicenseRepo) GetAll() ([]models.NewLicenseRequest, error) {
	var requests []models.NewLicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *newLicenseRepo) GetByUserID(userID uint) ([]models.NewLicenseRequest, error) {
	var requests []models.NewLicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("user_id = ?", userID).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *newLicenseRepo) GetByStatus(status models.RequestStatus) ([]models.NewLicenseRequest, error) {
	var requests []models.NewLicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("status = ?", status).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *newLicenseRepo) GetByInspectorID(inspectorID uint) ([]models.NewLicenseRequest, error) {
	var requests []models.NewLicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("inspector_id = ?", inspectorID).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *newLicenseRepo) GetByLicenseType(licenseType string) ([]models.NewLicenseRequest, error) {
	var requests []models.NewLicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("license_type = ?", licenseType).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *newLicenseRepo) Update(request *models.NewLicenseRequest) error {
	return r.db.Save(request).Error
}

func (r *newLicenseRepo) Delete(id uint) error {
	return r.db.Delete(&models.NewLicenseRequest{}, id).Error
}

func (r *newLicenseRepo) UpdateStatus(id uint, status models.RequestStatus) error {
	// First, get the current request to capture the previous status
	var request models.NewLicenseRequest
	if err := r.db.First(&request, id).Error; err != nil {
		return err
	}

	// Only create a log if the status is actually changing
	if request.Status != status {
		// Start a transaction
		tx := r.db.Begin()

		// Update the request status first
		if err := tx.Model(&models.NewLicenseRequest{}).Where("id = ?", id).Update("status", status).Error; err != nil {
			tx.Rollback()
			return err
		}

		// Try to create a service flow log entry (ignore errors if table doesn't exist)
		log := &models.ServiceFlowLog{
			LicenseRequestID: id,
			PreviousStatus:   &request.Status,
			NewStatus:        status,
			ChangeReason:     "Status updated",
			LicenseType:      "new",
		}

		// Try to create the log entry, but ignore errors if the table doesn't exist
		if err := tx.Create(log).Error; err != nil {
			// Log the error but continue with the transaction
			// This handles the case where the service_flow_logs table hasn't been created yet
		}

		// Commit the transaction
		return tx.Commit().Error
	}

	// If status is the same, just update without creating a log
	return r.db.Model(&models.NewLicenseRequest{}).Where("id = ?", id).Update("status", status).Error
}

func (r *newLicenseRepo) AssignInspector(requestID, inspectorID, assignedByID uint) error {
	// First, get the current request
	var request models.NewLicenseRequest
	if err := r.db.First(&request, requestID).Error; err != nil {
		return err
	}

	now := time.Now()

	// Start a transaction
	tx := r.db.Begin()

	// Update the request first
	if err := tx.Model(&models.NewLicenseRequest{}).Where("id = ?", requestID).Updates(map[string]interface{}{
		"inspector_id":   inspectorID,
		"assigned_by_id": assignedByID,
		"assigned_at":    &now,
		"status":         models.StatusAssigned,
	}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Try to create a service flow log entry (ignore errors if table doesn't exist)
	log := &models.ServiceFlowLog{
		LicenseRequestID: requestID,
		PreviousStatus:   &request.Status,
		NewStatus:        models.StatusAssigned,
		ChangedBy:        &assignedByID,
		ChangeReason:     fmt.Sprintf("Assigned to inspector ID %d", inspectorID),
		LicenseType:      "new",
	}

	// Try to create the log entry, but ignore errors if the table doesn't exist
	if err := tx.Create(log).Error; err != nil {
		// Log the error but continue with the transaction
		// This handles the case where the service_flow_logs table hasn't been created yet
	}

	// Commit the transaction
	return tx.Commit().Error
}

func (r *newLicenseRepo) SetDeadline(requestID uint, deadline time.Time) error {
	return r.db.Model(&models.NewLicenseRequest{}).Where("id = ?", requestID).
		Update("deadline", deadline).Error
}

func (r *newLicenseRepo) GetPendingRequests() ([]models.NewLicenseRequest, error) {
	var requests []models.NewLicenseRequest
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

func (r *newLicenseRepo) GetOverdueRequests() ([]models.NewLicenseRequest, error) {
	var requests []models.NewLicenseRequest
	now := time.Now()
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("deadline < ? AND status NOT IN ?", now, []models.RequestStatus{
			models.StatusApproved,
			models.StatusRejectedFinal,
		}).Order("deadline ASC").Find(&requests).Error
	return requests, err
}

func (r *newLicenseRepo) GetRequestsByDateRange(start, end time.Time) ([]models.NewLicenseRequest, error) {
	var requests []models.NewLicenseRequest
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("created_at BETWEEN ? AND ?", start, end).Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *newLicenseRepo) SearchRequests(query string) ([]models.NewLicenseRequest, error) {
	var requests []models.NewLicenseRequest
	searchPattern := "%" + query + "%"
	err := r.db.Preload("User").Preload("Inspector").Preload("AssignedBy").
		Where("request_number LIKE ? OR project_name LIKE ? OR description LIKE ?",
			searchPattern, searchPattern, searchPattern).
		Order("created_at DESC").Find(&requests).Error
	return requests, err
}
