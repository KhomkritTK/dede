package dto

import "mime/multipart"

// UploadFileRequest represents a request to upload a file
type UploadFileRequest struct {
	EntityType string                `form:"entity_type" binding:"required"`
	EntityID   uint                  `form:"entity_id" binding:"required"`
	File       *multipart.FileHeader `form:"file" binding:"required"`
	UserID     uint                  `form:"user_id" binding:"required"`
	ReportType string                `form:"report_type"`
}

// FileResponse represents a file response
type FileResponse struct {
	ID           uint   `json:"id"`
	EntityType   string `json:"entity_type"`
	EntityID     uint   `json:"entity_id"`
	FileName     string `json:"file_name"`
	OriginalName string `json:"original_name"`
	FileSize     int64  `json:"file_size"`
	ContentType  string `json:"content_type"`
	UploadedByID uint   `json:"uploaded_by_id"`
	UploadedBy   User   `json:"uploaded_by"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

// GetFilesRequest represents a request to get files
type GetFilesRequest struct {
	EntityType string `form:"entity_type"`
	EntityID   uint   `form:"entity_id"`
}

// DeleteFileRequest represents a request to delete a file
type DeleteFileRequest struct {
	FileID uint `json:"file_id" binding:"required"`
}

// DownloadFileRequest represents a request to download a file
type DownloadFileRequest struct {
	FileID uint `json:"file_id" binding:"required"`
}

// FileStatisticsResponse represents file statistics
type FileStatisticsResponse struct {
	TotalFiles         int64              `json:"total_files"`
	AuditReportFiles   int64              `json:"audit_report_files"`
	OtherFiles         int64              `json:"other_files"`
	TotalFileSize      int64              `json:"total_file_size"`
	TotalFileSizeMB    float64            `json:"total_file_size_mb"`
	FilesByContentType []ContentTypeCount `json:"files_by_content_type"`
	FilesByUser        []UserCount        `json:"files_by_user"`
}

// ContentTypeCount represents a count by content type
type ContentTypeCount struct {
	ContentType string `json:"content_type"`
	Count       int64  `json:"count"`
}

// AuditReportFileRequest represents a request to upload an audit report
type AuditReportFileRequest struct {
	RequestID  uint                  `form:"request_id" binding:"required"`
	ReportType string                `form:"report_type" binding:"required"`
	File       *multipart.FileHeader `form:"file" binding:"required"`
	UserID     uint                  `form:"user_id" binding:"required"`
}

// AuditReportFileResponse represents an audit report file response
type AuditReportFileResponse struct {
	ID           uint         `json:"id"`
	RequestID    uint         `json:"request_id"`
	ReportType   string       `json:"report_type"`
	Status       string       `json:"status"`
	AttachmentID uint         `json:"attachment_id"`
	Attachment   FileResponse `json:"attachment"`
	CreatedByID  uint         `json:"created_by_id"`
	CreatedBy    User         `json:"created_by"`
	CreatedAt    string       `json:"created_at"`
	UpdatedAt    string       `json:"updated_at"`
}

// GetAuditReportFilesRequest represents a request to get audit report files
type GetAuditReportFilesRequest struct {
	RequestID  uint   `form:"request_id"`
	ReportType string `form:"report_type"`
	Status     string `form:"status"`
}

// UpdateAuditReportFileRequest represents a request to update an audit report file
type UpdateAuditReportFileRequest struct {
	FileID     uint   `json:"file_id" binding:"required"`
	ReportType string `json:"report_type"`
	Status     string `json:"status"`
}

// VersionAuditReportFileRequest represents a request to version an audit report file
type VersionAuditReportFileRequest struct {
	OriginalFileID uint                  `form:"original_file_id" binding:"required"`
	File           *multipart.FileHeader `form:"file" binding:"required"`
	UserID         uint                  `form:"user_id" binding:"required"`
	ChangeNotes    string                `form:"change_notes"`
}

// AuditReportFileVersionResponse represents an audit report file version response
type AuditReportFileVersionResponse struct {
	ID             uint         `json:"id"`
	OriginalFileID uint         `json:"original_file_id"`
	FileID         uint         `json:"file_id"`
	File           FileResponse `json:"file"`
	ChangeNotes    string       `json:"change_notes"`
	CreatedByID    uint         `json:"created_by_id"`
	CreatedBy      User         `json:"created_by"`
	CreatedAt      string       `json:"created_at"`
}

// GetAuditReportFileVersionsRequest represents a request to get audit report file versions
type GetAuditReportFileVersionsRequest struct {
	OriginalFileID uint `form:"original_file_id" binding:"required"`
}

// RestoreAuditReportFileVersionRequest represents a request to restore an audit report file version
type RestoreAuditReportFileVersionRequest struct {
	VersionID uint `json:"version_id" binding:"required"`
	UserID    uint `json:"user_id" binding:"required"`
}
