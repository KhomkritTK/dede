package dto

import (
	"eservice-backend/models"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// UserInfo represents user information for response
type UserInfo struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
}

// StatusHistoryEntry represents an entry in the status history
type StatusHistoryEntry struct {
	Date        string `json:"date"`
	Status      string `json:"status"`
	Description string `json:"description"`
	Officer     string `json:"officer"`
}

// UnifiedLicenseRequestResponse represents a unified response for all license request types
type UnifiedLicenseRequestResponse struct {
	ID            uint                 `json:"id"`
	RequestNumber string               `json:"request_number"`
	LicenseType   string               `json:"license_type"`
	Status        string               `json:"status"`
	Title         string               `json:"title"`
	Description   string               `json:"description"`
	RequestDate   time.Time            `json:"request_date"`
	UserID        uint                 `json:"user_id"`
	User          UserInfo             `json:"user"`
	StatusHistory []StatusHistoryEntry `json:"status_history"`
}

// GetStatusHistory retrieves the status history for a license request
func GetStatusHistory(db *gorm.DB, requestID uint, licenseType string) []StatusHistoryEntry {
	var logs []models.ServiceFlowLog
	var notifications []models.Notification

	// Query the service flow logs for this request
	err := db.Preload("ChangedByUser").Where("license_request_id = ? AND license_type = ?", requestID, licenseType).Order("created_at ASC").Find(&logs).Error
	if err != nil {
		return []StatusHistoryEntry{}
	}

	// Query notifications related to this request
	err = db.Where("entity_type = ? AND entity_id = ?", "license_request", requestID).Order("created_at ASC").Find(&notifications).Error
	if err != nil {
		notifications = []models.Notification{}
	}

	var history []StatusHistoryEntry

	// Add the initial status
	history = append(history, StatusHistoryEntry{
		Date:        time.Now().Format("2006-01-02 15:04:05"),
		Status:      "new_request",
		Description: "คำขอถูกสร้างและส่งเข้าระบบ",
		Officer:     "ระบบ",
	})

	// Add notifications as history entries
	for _, notif := range notifications {
		var description string
		switch notif.Type {
		case models.NotificationTypeRequestSubmitted:
			description = "เอกสารถูกส่งให้ DEDE Admin"
		case models.NotificationTypeRequestAccepted:
			description = "DEDE Admin รับคำขอแล้ว"
		case models.NotificationTypeRequestRejected:
			description = "คำขอถูกปฏิเสธ"
		case models.NotificationTypeRequestAssigned:
			description = "มอบหมายให้เจ้าหน้าที่ตรวจสอบ"
		case models.NotificationTypeAppointmentSet:
			description = "นัดหมายวันเข้าตรวจสอบระบบ"
		case models.NotificationTypeInspectionCompleted:
			description = "ตรวจสอบระบบเสร็จสิ้น"
		case models.NotificationTypeReportSubmitted:
			description = "รายงานผลการตรวจสอบถูกส่ง"
		case models.NotificationTypeReportApproved:
			description = "รายงานได้รับการอนุมัติ"
		case models.NotificationTypeReportRejected:
			description = "รายงานถูกปฏิเสธ"
		default:
			description = notif.Message
		}

		history = append(history, StatusHistoryEntry{
			Date:        notif.CreatedAt.Format("2006-01-02 15:04:05"),
			Status:      string(notif.Type),
			Description: description,
			Officer:     "ระบบ",
		})
	}

	// Add each status change from service flow logs
	for _, log := range logs {
		officerName := "ระบบ"
		if log.ChangedByUser != nil {
			officerName = log.ChangedByUser.FullName
		}

		var description string
		switch log.NewStatus {
		case models.StatusNewRequest:
			description = "คำขอถูกสร้างและส่งเข้าระบบ"
		case models.StatusAccepted:
			description = "DEDE Admin รับคำขอแล้ว"
		case models.StatusAssigned:
			description = "มอบหมายให้เจ้าหน้าที่ตรวจสอบ"
		case models.StatusAppointment:
			description = "นัดหมายวันเข้าตรวจสอบระบบ"
		case models.StatusInspecting:
			description = "กำลังดำเนินการตรวจสอบระบบ"
		case models.StatusInspectionDone:
			description = "ตรวจสอบระบบเสร็จสิ้น"
		case models.StatusDocumentEdit:
			description = "เอกสารถูกตีกลับเพื่อแก้ไข"
		case models.StatusReportApproved:
			description = "รายงานผลการตรวจสอบได้รับการอนุมัติ"
		case models.StatusApproved:
			description = "อนุมัติใบอนุญาตแล้ว"
		case models.StatusRejected, models.StatusRejectedFinal:
			description = "คำขอถูกปฏิเสธ"
		case models.StatusReturned:
			description = "เอกสารถูกส่งกลับให้ผู้ยื่นเพื่อแก้ไข"
		case models.StatusForwarded:
			description = "ส่งเรื่องให้ DEDE Head พิจารณา"
		default:
			description = fmt.Sprintf("สถานะเปลี่ยนเป็น %s", log.GetStatusDisplayName(log.NewStatus))
		}

		if log.ChangeReason != "" {
			description = fmt.Sprintf("%s: %s", description, log.ChangeReason)
		}

		history = append(history, StatusHistoryEntry{
			Date:        log.CreatedAt.Format("2006-01-02 15:04:05"),
			Status:      string(log.NewStatus),
			Description: description,
			Officer:     officerName,
		})
	}

	// Sort history by date
	for i := 0; i < len(history); i++ {
		for j := i + 1; j < len(history); j++ {
			if history[i].Date > history[j].Date {
				history[i], history[j] = history[j], history[i]
			}
		}
	}

	return history
}

// ConvertNewLicenseRequest converts a NewLicenseRequest to UnifiedLicenseRequestResponse
func ConvertNewLicenseRequest(db *gorm.DB, req models.NewLicenseRequest) UnifiedLicenseRequestResponse {
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
		StatusHistory: GetStatusHistory(db, req.ID, "new"),
	}
}

// ConvertRenewalLicenseRequest converts a RenewalLicenseRequest to UnifiedLicenseRequestResponse
func ConvertRenewalLicenseRequest(db *gorm.DB, req models.RenewalLicenseRequest) UnifiedLicenseRequestResponse {
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
		StatusHistory: GetStatusHistory(db, req.ID, "renewal"),
	}
}

// ConvertExtensionLicenseRequest converts an ExtensionLicenseRequest to UnifiedLicenseRequestResponse
func ConvertExtensionLicenseRequest(db *gorm.DB, req models.ExtensionLicenseRequest) UnifiedLicenseRequestResponse {
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
		StatusHistory: GetStatusHistory(db, req.ID, "extension"),
	}
}

// ConvertReductionLicenseRequest converts a ReductionLicenseRequest to UnifiedLicenseRequestResponse
func ConvertReductionLicenseRequest(db *gorm.DB, req models.ReductionLicenseRequest) UnifiedLicenseRequestResponse {
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
		StatusHistory: GetStatusHistory(db, req.ID, "reduction"),
	}
}
