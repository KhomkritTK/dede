package repository

import (
	"eservice-backend/models"

	"gorm.io/gorm"
)

type AttachmentRepository interface {
	Create(attachment *models.Attachment) error
	GetByID(id uint) (*models.Attachment, error)
	GetAll() ([]models.Attachment, error)
	GetByUploaderID(uploaderID uint) ([]models.Attachment, error)
	GetByEntityType(entityType string, entityID uint) ([]models.Attachment, error)
	GetByFileType(fileType models.AttachmentType) ([]models.Attachment, error)
	GetUnreviewedAttachments() ([]models.Attachment, error)
	GetRequiredAttachments() ([]models.Attachment, error)
	Update(attachment *models.Attachment) error
	Delete(id uint) error
	MarkAsReviewed(id uint, reviewNotes string) error
	GetAttachmentsByDateRange(start, end string) ([]models.Attachment, error)
	SearchAttachments(query string) ([]models.Attachment, error)
	GetTotalSizeByUploaderID(uploaderID uint) (int64, error)
	DeleteByEntityType(entityType string, entityID uint) error
}

type attachmentRepository struct {
	db *gorm.DB
}

func NewAttachmentRepository(db *gorm.DB) AttachmentRepository {
	return &attachmentRepository{db: db}
}

func (r *attachmentRepository) Create(attachment *models.Attachment) error {
	return r.db.Create(attachment).Error
}

func (r *attachmentRepository) GetByID(id uint) (*models.Attachment, error) {
	var attachment models.Attachment
	err := r.db.Preload("Uploader").First(&attachment, id).Error
	if err != nil {
		return nil, err
	}
	return &attachment, nil
}

func (r *attachmentRepository) GetAll() ([]models.Attachment, error) {
	var attachments []models.Attachment
	err := r.db.Preload("Uploader").Order("created_at DESC").Find(&attachments).Error
	return attachments, err
}

func (r *attachmentRepository) GetByUploaderID(uploaderID uint) ([]models.Attachment, error) {
	var attachments []models.Attachment
	err := r.db.Preload("Uploader").Where("uploader_id = ?", uploaderID).
		Order("created_at DESC").Find(&attachments).Error
	return attachments, err
}

func (r *attachmentRepository) GetByEntityType(entityType string, entityID uint) ([]models.Attachment, error) {
	var attachments []models.Attachment
	err := r.db.Preload("Uploader").Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Order("created_at DESC").Find(&attachments).Error
	return attachments, err
}

func (r *attachmentRepository) GetByFileType(fileType models.AttachmentType) ([]models.Attachment, error) {
	var attachments []models.Attachment
	err := r.db.Preload("Uploader").Where("file_type = ?", fileType).
		Order("created_at DESC").Find(&attachments).Error
	return attachments, err
}

func (r *attachmentRepository) GetUnreviewedAttachments() ([]models.Attachment, error) {
	var attachments []models.Attachment
	err := r.db.Preload("Uploader").Where("reviewed = ?", false).
		Order("created_at ASC").Find(&attachments).Error
	return attachments, err
}

func (r *attachmentRepository) GetRequiredAttachments() ([]models.Attachment, error) {
	var attachments []models.Attachment
	err := r.db.Preload("Uploader").Where("is_required = ?", true).
		Order("created_at DESC").Find(&attachments).Error
	return attachments, err
}

func (r *attachmentRepository) Update(attachment *models.Attachment) error {
	return r.db.Save(attachment).Error
}

func (r *attachmentRepository) Delete(id uint) error {
	return r.db.Delete(&models.Attachment{}, id).Error
}

func (r *attachmentRepository) MarkAsReviewed(id uint, reviewNotes string) error {
	return r.db.Model(&models.Attachment{}).Where("id = ?", id).Updates(map[string]interface{}{
		"reviewed":     true,
		"review_notes": reviewNotes,
	}).Error
}

func (r *attachmentRepository) GetAttachmentsByDateRange(start, end string) ([]models.Attachment, error) {
	var attachments []models.Attachment
	err := r.db.Preload("Uploader").Where("created_at BETWEEN ? AND ?", start, end).
		Order("created_at DESC").Find(&attachments).Error
	return attachments, err
}

func (r *attachmentRepository) SearchAttachments(query string) ([]models.Attachment, error) {
	var attachments []models.Attachment
	searchPattern := "%" + query + "%"
	err := r.db.Preload("Uploader").Where("file_name LIKE ? OR original_name LIKE ? OR description LIKE ?",
		searchPattern, searchPattern, searchPattern).
		Order("created_at DESC").Find(&attachments).Error
	return attachments, err
}

func (r *attachmentRepository) GetTotalSizeByUploaderID(uploaderID uint) (int64, error) {
	var totalSize int64
	err := r.db.Model(&models.Attachment{}).Where("uploader_id = ?", uploaderID).
		Select("COALESCE(SUM(file_size), 0)").Scan(&totalSize).Error
	return totalSize, err
}

func (r *attachmentRepository) DeleteByEntityType(entityType string, entityID uint) error {
	return r.db.Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Delete(&models.Attachment{}).Error
}
