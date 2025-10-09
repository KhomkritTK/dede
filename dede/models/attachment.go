package models

import (
	"time"

	"gorm.io/gorm"
)

type AttachmentType string

const (
	AttachmentTypeDocument     AttachmentType = "document"     // เอกสารทั่วไป
	AttachmentTypeImage        AttachmentType = "image"        // รูปภาพ
	AttachmentTypeVideo        AttachmentType = "video"        // วิดีโอ
	AttachmentTypeAudio        AttachmentType = "audio"        // ไฟล์เสียง
	AttachmentTypePDF          AttachmentType = "pdf"          // PDF
	AttachmentTypeSpreadsheet  AttachmentType = "spreadsheet"  // สเปรดชีต
	AttachmentTypePresentation AttachmentType = "presentation" // การนำเสนอ
	AttachmentTypeOther        AttachmentType = "other"        // อื่นๆ
)

type Attachment struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	FileName     string         `json:"file_name" gorm:"not null"`
	OriginalName string         `json:"original_name" gorm:"not null"`
	FilePath     string         `json:"file_path" gorm:"not null"`
	FileSize     int64          `json:"file_size" gorm:"not null"`
	MimeType     string         `json:"mime_type" gorm:"not null"`
	FileType     AttachmentType `json:"file_type" gorm:"not null"`
	Description  string         `json:"description"`

	// Polymorphic associations
	EntityType string `json:"entity_type" gorm:"not null;index"` // license_request, inspection, audit_report
	EntityID   uint   `json:"entity_id" gorm:"not null;index"`

	UploaderID uint `json:"uploader_id" gorm:"not null;index"`
	Uploader   User `json:"uploader" gorm:"foreignKey:UploaderID"`

	IsPublic    bool   `json:"is_public" gorm:"default:false"`
	IsRequired  bool   `json:"is_required" gorm:"default:false"`
	Reviewed    bool   `json:"reviewed" gorm:"default:false"`
	ReviewNotes string `json:"review_notes"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the Attachment model
func (Attachment) TableName() string {
	return "attachments"
}

// IsImage checks if the attachment is an image
func (a *Attachment) IsImage() bool {
	return a.FileType == AttachmentTypeImage
}

// IsDocument checks if the attachment is a document
func (a *Attachment) IsDocument() bool {
	return a.FileType == AttachmentTypeDocument || a.FileType == AttachmentTypePDF
}

// IsVideo checks if the attachment is a video
func (a *Attachment) IsVideo() bool {
	return a.FileType == AttachmentTypeVideo
}

// IsAudio checks if the attachment is an audio file
func (a *Attachment) IsAudio() bool {
	return a.FileType == AttachmentTypeAudio
}

// GetSizeInMB returns the file size in megabytes
func (a *Attachment) GetSizeInMB() float64 {
	return float64(a.FileSize) / (1024 * 1024)
}

// GetExtension returns the file extension
func (a *Attachment) GetExtension() string {
	// Simple implementation, you might want to use filepath.Ext
	for i := len(a.FileName) - 1; i >= 0; i-- {
		if a.FileName[i] == '.' {
			return a.FileName[i+1:]
		}
	}
	return ""
}

// CanBePreviewed checks if the attachment can be previewed in browser
func (a *Attachment) CanBePreviewed() bool {
	return a.IsImage() || a.FileType == AttachmentTypePDF
}
