package repository

import (
	"eservice-backend/models"

	"gorm.io/gorm"
)

// RenewalLicenseRepo interface for renewal license requests
type RenewalLicenseRepo interface {
	Create(request *models.RenewalLicenseRequest) error
	GetAll() ([]models.RenewalLicenseRequest, error)
}

type renewalLicenseRepo struct {
	db *gorm.DB
}

func NewRenewalLicenseRepo(db *gorm.DB) RenewalLicenseRepo {
	return &renewalLicenseRepo{db: db}
}

func (r *renewalLicenseRepo) Create(request *models.RenewalLicenseRequest) error {
	return r.db.Create(request).Error
}

func (r *renewalLicenseRepo) GetAll() ([]models.RenewalLicenseRequest, error) {
	var requests []models.RenewalLicenseRequest
	err := r.db.Preload("User").Order("created_at DESC").Find(&requests).Error
	return requests, err
}

// ExtensionLicenseRepo interface for extension license requests
type ExtensionLicenseRepo interface {
	Create(request *models.ExtensionLicenseRequest) error
	GetAll() ([]models.ExtensionLicenseRequest, error)
}

type extensionLicenseRepo struct {
	db *gorm.DB
}

func NewExtensionLicenseRepo(db *gorm.DB) ExtensionLicenseRepo {
	return &extensionLicenseRepo{db: db}
}

func (r *extensionLicenseRepo) Create(request *models.ExtensionLicenseRequest) error {
	return r.db.Create(request).Error
}

func (r *extensionLicenseRepo) GetAll() ([]models.ExtensionLicenseRequest, error) {
	var requests []models.ExtensionLicenseRequest
	err := r.db.Preload("User").Order("created_at DESC").Find(&requests).Error
	return requests, err
}

// ReductionLicenseRepo interface for reduction license requests
type ReductionLicenseRepo interface {
	Create(request *models.ReductionLicenseRequest) error
	GetAll() ([]models.ReductionLicenseRequest, error)
}

type reductionLicenseRepo struct {
	db *gorm.DB
}

func NewReductionLicenseRepo(db *gorm.DB) ReductionLicenseRepo {
	return &reductionLicenseRepo{db: db}
}

func (r *reductionLicenseRepo) Create(request *models.ReductionLicenseRequest) error {
	return r.db.Create(request).Error
}

func (r *reductionLicenseRepo) GetAll() ([]models.ReductionLicenseRequest, error) {
	var requests []models.ReductionLicenseRequest
	err := r.db.Preload("User").Order("created_at DESC").Find(&requests).Error
	return requests, err
}
