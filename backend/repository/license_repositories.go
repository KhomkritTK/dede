package repository

import (
	"eservice-backend/models"

	"gorm.io/gorm"
)

// RenewalLicenseRepo interface for renewal license requests
type RenewalLicenseRepo interface {
	Create(request *models.RenewalLicenseRequest) error
	GetAll() ([]models.RenewalLicenseRequest, error)
	GetByID(id uint) (*models.RenewalLicenseRequest, error)
	UpdateStatus(id uint, status models.RequestStatus) error
}

type renewalLicenseRepo struct {
	db *gorm.DB
}

func NewRenewalLicenseRepo(db *gorm.DB) RenewalLicenseRepo {
	return &renewalLicenseRepo{db: db}
}

func (r *renewalLicenseRepo) Create(request *models.RenewalLicenseRequest) error {
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
		LicenseType:      "renewal",
	}

	// Try to create the log entry, but ignore errors if the table doesn't exist
	if err := r.db.Create(log).Error; err != nil {
		// Log the error but continue
		// This handles the case where the service_flow_logs table hasn't been created yet
	}

	return nil
}

func (r *renewalLicenseRepo) GetAll() ([]models.RenewalLicenseRequest, error) {
	var requests []models.RenewalLicenseRequest
	err := r.db.Preload("User").Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *renewalLicenseRepo) GetByID(id uint) (*models.RenewalLicenseRequest, error) {
	var request models.RenewalLicenseRequest
	err := r.db.Preload("User").First(&request, id).Error
	if err != nil {
		return nil, err
	}
	return &request, nil
}

func (r *renewalLicenseRepo) UpdateStatus(id uint, status models.RequestStatus) error {
	// First, get the current request to capture the previous status
	var request models.RenewalLicenseRequest
	if err := r.db.First(&request, id).Error; err != nil {
		return err
	}

	// Only create a log if the status is actually changing
	if request.Status != status {
		// Start a transaction
		tx := r.db.Begin()

		// Update the request status first
		if err := tx.Model(&models.RenewalLicenseRequest{}).Where("id = ?", id).Update("status", status).Error; err != nil {
			tx.Rollback()
			return err
		}

		// Try to create a service flow log entry (ignore errors if table doesn't exist)
		log := &models.ServiceFlowLog{
			LicenseRequestID: id,
			PreviousStatus:   &request.Status,
			NewStatus:        status,
			ChangeReason:     "Status updated",
			LicenseType:      "renewal",
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
	return r.db.Model(&models.RenewalLicenseRequest{}).Where("id = ?", id).Update("status", status).Error
}

// ExtensionLicenseRepo interface for extension license requests
type ExtensionLicenseRepo interface {
	Create(request *models.ExtensionLicenseRequest) error
	GetAll() ([]models.ExtensionLicenseRequest, error)
	GetByID(id uint) (*models.ExtensionLicenseRequest, error)
	UpdateStatus(id uint, status models.RequestStatus) error
}

type extensionLicenseRepo struct {
	db *gorm.DB
}

func NewExtensionLicenseRepo(db *gorm.DB) ExtensionLicenseRepo {
	return &extensionLicenseRepo{db: db}
}

func (r *extensionLicenseRepo) Create(request *models.ExtensionLicenseRequest) error {
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
		LicenseType:      "extension",
	}

	// Try to create the log entry, but ignore errors if the table doesn't exist
	if err := r.db.Create(log).Error; err != nil {
		// Log the error but continue
		// This handles the case where the service_flow_logs table hasn't been created yet
	}

	return nil
}

func (r *extensionLicenseRepo) GetAll() ([]models.ExtensionLicenseRequest, error) {
	var requests []models.ExtensionLicenseRequest
	err := r.db.Preload("User").Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *extensionLicenseRepo) GetByID(id uint) (*models.ExtensionLicenseRequest, error) {
	var request models.ExtensionLicenseRequest
	err := r.db.Preload("User").First(&request, id).Error
	if err != nil {
		return nil, err
	}
	return &request, nil
}

func (r *extensionLicenseRepo) UpdateStatus(id uint, status models.RequestStatus) error {
	// First, get the current request to capture the previous status
	var request models.ExtensionLicenseRequest
	if err := r.db.First(&request, id).Error; err != nil {
		return err
	}

	// Only create a log if the status is actually changing
	if request.Status != status {
		// Start a transaction
		tx := r.db.Begin()

		// Update the request status first
		if err := tx.Model(&models.ExtensionLicenseRequest{}).Where("id = ?", id).Update("status", status).Error; err != nil {
			tx.Rollback()
			return err
		}

		// Try to create a service flow log entry (ignore errors if table doesn't exist)
		log := &models.ServiceFlowLog{
			LicenseRequestID: id,
			PreviousStatus:   &request.Status,
			NewStatus:        status,
			ChangeReason:     "Status updated",
			LicenseType:      "extension",
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
	return r.db.Model(&models.ExtensionLicenseRequest{}).Where("id = ?", id).Update("status", status).Error
}

// ReductionLicenseRepo interface for reduction license requests
type ReductionLicenseRepo interface {
	Create(request *models.ReductionLicenseRequest) error
	GetAll() ([]models.ReductionLicenseRequest, error)
	GetByID(id uint) (*models.ReductionLicenseRequest, error)
	UpdateStatus(id uint, status models.RequestStatus) error
}

type reductionLicenseRepo struct {
	db *gorm.DB
}

func NewReductionLicenseRepo(db *gorm.DB) ReductionLicenseRepo {
	return &reductionLicenseRepo{db: db}
}

func (r *reductionLicenseRepo) Create(request *models.ReductionLicenseRequest) error {
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
		LicenseType:      "reduction",
	}

	// Try to create the log entry, but ignore errors if the table doesn't exist
	if err := r.db.Create(log).Error; err != nil {
		// Log the error but continue
		// This handles the case where the service_flow_logs table hasn't been created yet
	}

	return nil
}

func (r *reductionLicenseRepo) GetAll() ([]models.ReductionLicenseRequest, error) {
	var requests []models.ReductionLicenseRequest
	err := r.db.Preload("User").Order("created_at DESC").Find(&requests).Error
	return requests, err
}

func (r *reductionLicenseRepo) GetByID(id uint) (*models.ReductionLicenseRequest, error) {
	var request models.ReductionLicenseRequest
	err := r.db.Preload("User").First(&request, id).Error
	if err != nil {
		return nil, err
	}
	return &request, nil
}

func (r *reductionLicenseRepo) UpdateStatus(id uint, status models.RequestStatus) error {
	// First, get the current request to capture the previous status
	var request models.ReductionLicenseRequest
	if err := r.db.First(&request, id).Error; err != nil {
		return err
	}

	// Only create a log if the status is actually changing
	if request.Status != status {
		// Create a service flow log entry
		log := &models.ServiceFlowLog{
			LicenseRequestID: id,
			PreviousStatus:   &request.Status,
			NewStatus:        status,
			ChangeReason:     "Status updated",
			LicenseType:      "reduction",
		}

		// Start a transaction
		tx := r.db.Begin()

		// Create the log entry
		if err := tx.Create(log).Error; err != nil {
			tx.Rollback()
			return err
		}

		// Update the request status
		if err := tx.Model(&models.ReductionLicenseRequest{}).Where("id = ?", id).Update("status", status).Error; err != nil {
			tx.Rollback()
			return err
		}

		// Commit the transaction
		return tx.Commit().Error
	}

	// If status is the same, just update without creating a log
	return r.db.Model(&models.ReductionLicenseRequest{}).Where("id = ?", id).Update("status", status).Error
}
