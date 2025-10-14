package dto

import (
	"eservice-backend/models"
	"time"
)

// UserInfo represents user information for response
type UserInfo struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
}

// UnifiedLicenseRequestResponse represents a unified response for all license request types
type UnifiedLicenseRequestResponse struct {
	ID            uint      `json:"id"`
	RequestNumber string    `json:"request_number"`
	LicenseType   string    `json:"license_type"`
	Status        string    `json:"status"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	RequestDate   time.Time `json:"request_date"`
	UserID        uint      `json:"user_id"`
	User          UserInfo  `json:"user"`
}

// ConvertNewLicenseRequest converts a NewLicenseRequest to UnifiedLicenseRequestResponse
func ConvertNewLicenseRequest(req models.NewLicenseRequest) UnifiedLicenseRequestResponse {
	return UnifiedLicenseRequestResponse{
		ID:            req.ID,
		RequestNumber: req.RequestNumber,
		LicenseType:   "new",
		Status:        string(req.Status),
		Title:         req.ProjectName,
		Description:   req.Description,
		RequestDate:   req.CreatedAt,
		UserID:        req.UserID,
		User: UserInfo{
			ID:       req.User.ID,
			Username: req.User.Username,
			Email:    req.User.Email,
			FullName: req.User.FullName,
		},
	}
}

// ConvertRenewalLicenseRequest converts a RenewalLicenseRequest to UnifiedLicenseRequestResponse
func ConvertRenewalLicenseRequest(req models.RenewalLicenseRequest) UnifiedLicenseRequestResponse {
	return UnifiedLicenseRequestResponse{
		ID:            req.ID,
		RequestNumber: req.RequestNumber,
		LicenseType:   "renewal",
		Status:        string(req.Status),
		Title:         req.ProjectName,
		Description:   req.Reason,
		RequestDate:   req.CreatedAt,
		UserID:        req.UserID,
		User: UserInfo{
			ID:       req.User.ID,
			Username: req.User.Username,
			Email:    req.User.Email,
			FullName: req.User.FullName,
		},
	}
}

// ConvertExtensionLicenseRequest converts an ExtensionLicenseRequest to UnifiedLicenseRequestResponse
func ConvertExtensionLicenseRequest(req models.ExtensionLicenseRequest) UnifiedLicenseRequestResponse {
	return UnifiedLicenseRequestResponse{
		ID:            req.ID,
		RequestNumber: req.RequestNumber,
		LicenseType:   "extension",
		Status:        string(req.Status),
		Title:         req.ProjectName,
		Description:   req.Description,
		RequestDate:   req.CreatedAt,
		UserID:        req.UserID,
		User: UserInfo{
			ID:       req.User.ID,
			Username: req.User.Username,
			Email:    req.User.Email,
			FullName: req.User.FullName,
		},
	}
}

// ConvertReductionLicenseRequest converts a ReductionLicenseRequest to UnifiedLicenseRequestResponse
func ConvertReductionLicenseRequest(req models.ReductionLicenseRequest) UnifiedLicenseRequestResponse {
	return UnifiedLicenseRequestResponse{
		ID:            req.ID,
		RequestNumber: req.RequestNumber,
		LicenseType:   "reduction",
		Status:        string(req.Status),
		Title:         req.ProjectName,
		Description:   req.Description,
		RequestDate:   req.CreatedAt,
		UserID:        req.UserID,
		User: UserInfo{
			ID:       req.User.ID,
			Username: req.User.Username,
			Email:    req.User.Email,
			FullName: req.User.FullName,
		},
	}
}
