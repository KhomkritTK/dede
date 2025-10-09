package utils

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// FileUpload represents an uploaded file
type FileUpload struct {
	FileName     string
	OriginalName string
	FilePath     string
	FileSize     int64
	MimeType     string
	FileType     string
}

// UploadFile uploads a file to the specified directory
func UploadFile(file *multipart.FileHeader, uploadDir string) (*FileUpload, error) {
	// Create upload directory if it doesn't exist
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	fileName := fmt.Sprintf("%d_%s%s", time.Now().Unix(), strings.ReplaceAll(file.Filename, " ", "_"), ext)
	filePath := filepath.Join(uploadDir, fileName)

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Create the destination file
	dst, err := os.Create(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	// Copy the file content
	if _, err := io.Copy(dst, src); err != nil {
		return nil, fmt.Errorf("failed to copy file content: %w", err)
	}

	// Determine file type
	fileType := DetermineFileType(file.Filename, file.Header.Get("Content-Type"))

	return &FileUpload{
		FileName:     fileName,
		OriginalName: file.Filename,
		FilePath:     filePath,
		FileSize:     file.Size,
		MimeType:     file.Header.Get("Content-Type"),
		FileType:     fileType,
	}, nil
}

// DeleteFile deletes a file from the filesystem
func DeleteFile(filePath string) error {
	if err := os.Remove(filePath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}

// DetermineFileType determines the type of file based on filename and MIME type
func DetermineFileType(filename, mimeType string) string {
	ext := strings.ToLower(filepath.Ext(filename))

	// Check by file extension
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp":
		return "image"
	case ".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv":
		return "video"
	case ".mp3", ".wav", ".ogg", ".flac", ".aac":
		return "audio"
	case ".pdf":
		return "pdf"
	case ".doc", ".docx":
		return "document"
	case ".xls", ".xlsx", ".csv":
		return "spreadsheet"
	case ".ppt", ".pptx":
		return "presentation"
	default:
		// Check by MIME type
		if strings.HasPrefix(mimeType, "image/") {
			return "image"
		} else if strings.HasPrefix(mimeType, "video/") {
			return "video"
		} else if strings.HasPrefix(mimeType, "audio/") {
			return "audio"
		} else if mimeType == "application/pdf" {
			return "pdf"
		} else if strings.Contains(mimeType, "document") {
			return "document"
		} else if strings.Contains(mimeType, "spreadsheet") {
			return "spreadsheet"
		} else if strings.Contains(mimeType, "presentation") {
			return "presentation"
		}
		return "other"
	}
}

// GetFileSizeInMB returns file size in megabytes
func GetFileSizeInMB(fileSize int64) float64 {
	return float64(fileSize) / (1024 * 1024)
}

// IsValidFileType checks if the file type is valid for upload
func IsValidFileType(fileType string, allowedTypes []string) bool {
	for _, allowedType := range allowedTypes {
		if fileType == allowedType {
			return true
		}
	}
	return false
}

// IsValidFileSize checks if the file size is within the allowed limit
func IsValidFileSize(fileSize int64, maxSizeMB int64) bool {
	return fileSize <= maxSizeMB*1024*1024
}

// GenerateUniqueFilename generates a unique filename
func GenerateUniqueFilename(originalName string) string {
	ext := filepath.Ext(originalName)
	nameWithoutExt := strings.TrimSuffix(originalName, ext)
	timestamp := time.Now().Unix()
	return fmt.Sprintf("%s_%d%s", strings.ReplaceAll(nameWithoutExt, " ", "_"), timestamp, ext)
}

// CreateDirectory creates a directory if it doesn't exist
func CreateDirectory(dirPath string) error {
	return os.MkdirAll(dirPath, 0755)
}

// FileExists checks if a file exists
func FileExists(filePath string) bool {
	_, err := os.Stat(filePath)
	return !os.IsNotExist(err)
}

// GetFileExtension returns the file extension
func GetFileExtension(filename string) string {
	return strings.ToLower(filepath.Ext(filename))
}

// IsImageFile checks if the file is an image
func IsImageFile(filename string) bool {
	ext := GetFileExtension(filename)
	imageExtensions := []string{".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"}

	for _, imgExt := range imageExtensions {
		if ext == imgExt {
			return true
		}
	}
	return false
}

// IsPDFFile checks if the file is a PDF
func IsPDFFile(filename string) bool {
	return GetFileExtension(filename) == ".pdf"
}

// GetAllowedFileTypes returns a list of allowed file types
func GetAllowedFileTypes() []string {
	return []string{
		"image",
		"video",
		"audio",
		"pdf",
		"document",
		"spreadsheet",
		"presentation",
	}
}
