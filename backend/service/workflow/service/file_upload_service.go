package service

import (
	"eservice-backend/models"
	"eservice-backend/service/workflow/dto"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gorm.io/gorm"
)

type FileUploadService interface {
	UploadFile(req dto.UploadFileRequest) (*models.Attachment, error)
	GetFileByID(fileID uint) (*models.Attachment, error)
	GetFilesByEntity(entityType string, entityID uint) ([]models.Attachment, error)
	DeleteFile(fileID uint) error
	DownloadFile(fileID uint) (string, error)
	GetFileStatistics() (map[string]interface{}, error)
}

type fileUploadService struct {
	db *gorm.DB
}

func NewFileUploadService(db *gorm.DB) FileUploadService {
	return &fileUploadService{
		db: db,
	}
}

// UploadFile uploads a file
func (s *fileUploadService) UploadFile(req dto.UploadFileRequest) (*models.Attachment, error) {
	// Validate file
	if err := s.validateFile(req.File); err != nil {
		return nil, fmt.Errorf("invalid file: %w", err)
	}

	// Create upload directory if it doesn't exist
	uploadDir := filepath.Join("uploads", req.EntityType)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Generate unique filename
	ext := filepath.Ext(req.File.Filename)
	uniqueFilename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), strings.ReplaceAll(req.File.Filename, ext, ""), ext)
	filePath := filepath.Join(uploadDir, uniqueFilename)

	// Save file to disk
	if err := s.saveFileToDisk(req.File, filePath); err != nil {
		return nil, fmt.Errorf("failed to save file: %w", err)
	}

	// Create attachment record
	attachment := &models.Attachment{
		EntityType:   req.EntityType,
		EntityID:     req.EntityID,
		FileName:     req.File.Filename,
		OriginalName: req.File.Filename,
		FilePath:     filePath,
		FileSize:     req.File.Size,
		MimeType:     req.File.Header.Get("Content-Type"),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	err := s.db.Create(attachment).Error
	if err != nil {
		// Remove file if database operation fails
		os.Remove(filePath)
		return nil, fmt.Errorf("failed to create attachment record: %w", err)
	}

	// If this is an audit report, create audit report record
	if req.EntityType == "audit_report" {
		auditReport := &models.AuditReport{
			RequestID:    req.EntityID,
			InspectorID:  req.UserID,
			Status:       models.ReportStatusDraft,
			ReportNumber: fmt.Sprintf("AUD-%d", attachment.ID),
			Title:        req.ReportType,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		err = s.db.Create(auditReport).Error
		if err != nil {
			// Remove attachment record and file if audit report creation fails
			s.db.Delete(attachment)
			os.Remove(filePath)
			return nil, fmt.Errorf("failed to create audit report record: %w", err)
		}
	}

	return attachment, nil
}

// GetFileByID retrieves a file by ID
func (s *fileUploadService) GetFileByID(fileID uint) (*models.Attachment, error) {
	var attachment models.Attachment
	err := s.db.Where("id = ?", fileID).
		Preload("UploadedBy").
		First(&attachment).Error
	if err != nil {
		return nil, fmt.Errorf("file not found: %w", err)
	}
	return &attachment, nil
}

// GetFilesByEntity retrieves files for a specific entity
func (s *fileUploadService) GetFilesByEntity(entityType string, entityID uint) ([]models.Attachment, error) {
	var attachments []models.Attachment
	err := s.db.Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Preload("UploadedBy").
		Order("created_at DESC").
		Find(&attachments).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get files: %w", err)
	}
	return attachments, nil
}

// DeleteFile deletes a file
func (s *fileUploadService) DeleteFile(fileID uint) error {
	// Get file
	attachment, err := s.GetFileByID(fileID)
	if err != nil {
		return fmt.Errorf("file not found: %w", err)
	}

	// Delete audit report if exists
	if attachment.EntityType == "audit_report" {
		var auditReport models.AuditReport
		err = s.db.Where("attachment_id = ?", attachment.ID).First(&auditReport).Error
		if err == nil {
			s.db.Delete(&auditReport)
		}
	}

	// Delete attachment record
	err = s.db.Delete(attachment).Error
	if err != nil {
		return fmt.Errorf("failed to delete attachment record: %w", err)
	}

	// Delete file from disk
	if _, err := os.Stat(attachment.FilePath); err == nil {
		if err := os.Remove(attachment.FilePath); err != nil {
			return fmt.Errorf("failed to delete file from disk: %w", err)
		}
	}

	return nil
}

// DownloadFile returns the file path for downloading
func (s *fileUploadService) DownloadFile(fileID uint) (string, error) {
	// Get file
	attachment, err := s.GetFileByID(fileID)
	if err != nil {
		return "", fmt.Errorf("file not found: %w", err)
	}

	// Check if file exists
	if _, err := os.Stat(attachment.FilePath); os.IsNotExist(err) {
		return "", fmt.Errorf("file does not exist on disk")
	}

	return attachment.FilePath, nil
}

// GetFileStatistics returns statistics about files
func (s *fileUploadService) GetFileStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count files by entity type
	var auditReportCount, otherCount int64
	s.db.Model(&models.Attachment{}).Where("entity_type = ?", "audit_report").Count(&auditReportCount)
	s.db.Model(&models.Attachment{}).Where("entity_type != ?", "audit_report").Count(&otherCount)

	stats["total_files"] = auditReportCount + otherCount
	stats["audit_report_files"] = auditReportCount
	stats["other_files"] = otherCount

	// Count files by content type
	var contentTypeCounts []struct {
		ContentType string `json:"content_type"`
		Count       int64  `json:"count"`
	}
	s.db.Model(&models.Attachment{}).
		Select("content_type, count(*) as count").
		Group("content_type").
		Find(&contentTypeCounts)

	stats["files_by_content_type"] = contentTypeCounts

	// Calculate total file size
	var totalSize int64
	s.db.Model(&models.Attachment{}).Select("COALESCE(SUM(file_size), 0)").Scan(&totalSize)

	stats["total_file_size"] = totalSize
	stats["total_file_size_mb"] = float64(totalSize) / (1024 * 1024)

	// Count files by user
	var userCounts []struct {
		UserID uint   `json:"user_id"`
		Name   string `json:"name"`
		Count  int64  `json:"count"`
	}
	s.db.Table("attachments").
		Select("uploaded_by_id as user_id, u.full_name as name, count(*) as count").
		Joins("LEFT JOIN users u ON attachments.uploaded_by_id = u.id").
		Group("uploaded_by_id, u.full_name").
		Order("count DESC").
		Find(&userCounts)

	stats["files_by_user"] = userCounts

	return stats, nil
}

// Helper functions

func (s *fileUploadService) validateFile(file *multipart.FileHeader) error {
	// Check file size (max 10MB)
	if file.Size > 10*1024*1024 {
		return fmt.Errorf("file size exceeds 10MB limit")
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExtensions := map[string]bool{
		".pdf":  true,
		".doc":  true,
		".docx": true,
		".xls":  true,
		".xlsx": true,
		".ppt":  true,
		".pptx": true,
		".txt":  true,
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
	}

	if !allowedExtensions[ext] {
		return fmt.Errorf("file extension %s is not allowed", ext)
	}

	// Check content type
	contentType := file.Header.Get("Content-Type")
	allowedContentTypes := map[string]bool{
		"application/pdf":    true,
		"application/msword": true,
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
		"application/vnd.ms-excel": true,
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":         true,
		"application/vnd.ms-powerpoint":                                             true,
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": true,
		"text/plain": true,
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
	}

	if !allowedContentTypes[contentType] {
		return fmt.Errorf("content type %s is not allowed", contentType)
	}

	return nil
}

func (s *fileUploadService) saveFileToDisk(file *multipart.FileHeader, filePath string) error {
	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Create the destination file
	dst, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	// Copy the file content
	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("failed to copy file content: %w", err)
	}

	return nil
}
