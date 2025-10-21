package repository

import (
	"eservice-backend/models"

	"gorm.io/gorm"
)

type ServiceFlowLogRepo interface {
	Create(flowLog *models.ServiceFlowLog) error
	GetByID(id uint) (*models.ServiceFlowLog, error)
	GetByLicenseRequestID(licenseRequestID uint) ([]models.ServiceFlowLog, error)
	GetAll() ([]models.ServiceFlowLog, error)
	Update(flowLog *models.ServiceFlowLog) error
	Delete(id uint) error
}

type serviceFlowLogRepo struct {
	db *gorm.DB
}

func NewServiceFlowLogRepo(db *gorm.DB) ServiceFlowLogRepo {
	return &serviceFlowLogRepo{db: db}
}

func (r *serviceFlowLogRepo) Create(flowLog *models.ServiceFlowLog) error {
	return r.db.Create(flowLog).Error
}

func (r *serviceFlowLogRepo) GetByID(id uint) (*models.ServiceFlowLog, error) {
	var flowLog models.ServiceFlowLog
	err := r.db.Preload("ChangedByUser").First(&flowLog, id).Error
	if err != nil {
		return nil, err
	}
	return &flowLog, nil
}

func (r *serviceFlowLogRepo) GetByLicenseRequestID(licenseRequestID uint) ([]models.ServiceFlowLog, error) {
	var flowLogs []models.ServiceFlowLog
	err := r.db.Preload("ChangedByUser").Where("license_request_id = ?", licenseRequestID).Order("created_at DESC").Find(&flowLogs).Error
	return flowLogs, err
}

func (r *serviceFlowLogRepo) GetAll() ([]models.ServiceFlowLog, error) {
	var flowLogs []models.ServiceFlowLog
	err := r.db.Preload("ChangedByUser").Order("created_at DESC").Find(&flowLogs).Error
	return flowLogs, err
}

func (r *serviceFlowLogRepo) Update(flowLog *models.ServiceFlowLog) error {
	return r.db.Save(flowLog).Error
}

func (r *serviceFlowLogRepo) Delete(id uint) error {
	return r.db.Delete(&models.ServiceFlowLog{}, id).Error
}
