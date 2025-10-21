package service

import (
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/workflow/dto"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type ActivityLogService interface {
	LogActivity(req dto.LogActivityRequest) error
	GetActivityLogs(req dto.GetActivityLogsRequest) ([]models.ServiceFlowLog, int64, error)
	GetActivityLogByID(logID uint) (*models.ServiceFlowLog, error)
	GetActivityLogsByEntity(entityType string, entityID uint) ([]models.ServiceFlowLog, error)
	GetActivityLogsByUser(userID uint) ([]models.ServiceFlowLog, error)
	GetActivityLogsByDateRange(startDate, endDate time.Time) ([]models.ServiceFlowLog, error)
	GetActivityStatistics() (map[string]interface{}, error)
	ExportActivityLogs(req dto.ExportActivityLogsRequest) ([]byte, error)
}

type activityLogService struct {
	db                 *gorm.DB
	serviceFlowLogRepo repository.ServiceFlowLogRepo
	userRepo           repository.UserRepository
}

func NewActivityLogService(db *gorm.DB) ActivityLogService {
	return &activityLogService{
		db:                 db,
		serviceFlowLogRepo: repository.NewServiceFlowLogRepo(db),
		userRepo:           repository.NewUserRepository(db),
	}
}

// LogActivity logs an activity
func (s *activityLogService) LogActivity(req dto.LogActivityRequest) error {
	// Create activity log
	log := &models.ServiceFlowLog{
		LicenseRequestID: req.EntityID,
		PreviousStatus:   req.PreviousStatus,
		NewStatus:        *req.NewStatus,
		ChangedBy:        &req.UserID,
		ChangeReason:     req.Reason,
		LicenseType:      req.EntityType,
		CreatedAt:        time.Now(),
	}

	err := s.db.Create(log).Error
	if err != nil {
		return fmt.Errorf("failed to log activity: %w", err)
	}

	return nil
}

// GetActivityLogs retrieves activity logs with pagination
func (s *activityLogService) GetActivityLogs(req dto.GetActivityLogsRequest) ([]models.ServiceFlowLog, int64, error) {
	// Build query
	query := s.db.Model(&models.ServiceFlowLog{})

	// Filter by entity type
	if req.EntityType != "" {
		query = query.Where("license_type = ?", req.EntityType)
	}

	// Filter by entity ID
	if req.EntityID != nil {
		query = query.Where("license_request_id = ?", *req.EntityID)
	}

	// Filter by user ID
	if req.UserID != nil {
		query = query.Where("changed_by = ?", *req.UserID)
	}

	// Filter by status
	if req.Status != "" {
		query = query.Where("new_status = ?", req.Status)
	}

	// Filter by date range
	if req.StartDate != nil {
		query = query.Where("created_at >= ?", req.StartDate)
	}
	if req.EndDate != nil {
		query = query.Where("created_at <= ?", req.EndDate)
	}

	// Count total
	var total int64
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count activity logs: %w", err)
	}

	// Get logs with pagination
	var logs []models.ServiceFlowLog
	offset := (req.Page - 1) * req.Limit
	err = query.Preload("ChangedByUser").Order("created_at DESC").Offset(offset).Limit(req.Limit).Find(&logs).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get activity logs: %w", err)
	}

	return logs, total, nil
}

// GetActivityLogByID retrieves a specific activity log
func (s *activityLogService) GetActivityLogByID(logID uint) (*models.ServiceFlowLog, error) {
	var log models.ServiceFlowLog
	err := s.db.Where("id = ?", logID).Preload("ChangedByUser").First(&log).Error
	if err != nil {
		return nil, fmt.Errorf("activity log not found: %w", err)
	}
	return &log, nil
}

// GetActivityLogsByEntity retrieves activity logs for a specific entity
func (s *activityLogService) GetActivityLogsByEntity(entityType string, entityID uint) ([]models.ServiceFlowLog, error) {
	var logs []models.ServiceFlowLog
	err := s.db.Where("license_type = ? AND license_request_id = ?", entityType, entityID).
		Preload("ChangedByUser").
		Order("created_at DESC").
		Find(&logs).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get activity logs: %w", err)
	}
	return logs, nil
}

// GetActivityLogsByUser retrieves activity logs for a specific user
func (s *activityLogService) GetActivityLogsByUser(userID uint) ([]models.ServiceFlowLog, error) {
	var logs []models.ServiceFlowLog
	err := s.db.Where("changed_by = ?", userID).
		Preload("ChangedByUser").
		Order("created_at DESC").
		Find(&logs).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get activity logs: %w", err)
	}
	return logs, nil
}

// GetActivityLogsByDateRange retrieves activity logs within a date range
func (s *activityLogService) GetActivityLogsByDateRange(startDate, endDate time.Time) ([]models.ServiceFlowLog, error) {
	var logs []models.ServiceFlowLog
	err := s.db.Where("created_at BETWEEN ? AND ?", startDate, endDate).
		Preload("ChangedByUser").
		Order("created_at DESC").
		Find(&logs).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get activity logs: %w", err)
	}
	return logs, nil
}

// GetActivityStatistics returns statistics about activities
func (s *activityLogService) GetActivityStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count total activities
	var totalActivities int64
	s.db.Model(&models.ServiceFlowLog{}).Count(&totalActivities)
	stats["total_activities"] = totalActivities

	// Count activities by entity type
	var newLicenseCount, renewalLicenseCount, extensionLicenseCount, reductionLicenseCount int64
	s.db.Model(&models.ServiceFlowLog{}).Where("license_type = ?", "new").Count(&newLicenseCount)
	s.db.Model(&models.ServiceFlowLog{}).Where("license_type = ?", "renewal").Count(&renewalLicenseCount)
	s.db.Model(&models.ServiceFlowLog{}).Where("license_type = ?", "extension").Count(&extensionLicenseCount)
	s.db.Model(&models.ServiceFlowLog{}).Where("license_type = ?", "reduction").Count(&reductionLicenseCount)

	stats["new_license_activities"] = newLicenseCount
	stats["renewal_license_activities"] = renewalLicenseCount
	stats["extension_license_activities"] = extensionLicenseCount
	stats["reduction_license_activities"] = reductionLicenseCount

	// Count activities by status
	var statusCounts []struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	s.db.Model(&models.ServiceFlowLog{}).
		Select("new_status as status, count(*) as count").
		Group("new_status").
		Find(&statusCounts)

	stats["activities_by_status"] = statusCounts

	// Count activities by date (last 7 days)
	var dateCounts []struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}
	sevenDaysAgo := time.Now().AddDate(0, 0, -7)
	s.db.Model(&models.ServiceFlowLog{}).
		Select("DATE(created_at) as date, count(*) as count").
		Where("created_at >= ?", sevenDaysAgo).
		Group("DATE(created_at)").
		Order("date DESC").
		Find(&dateCounts)

	stats["activities_by_date"] = dateCounts

	// Count activities by user (top 10)
	var userCounts []struct {
		UserID uint   `json:"user_id"`
		Name   string `json:"name"`
		Count  int64  `json:"count"`
	}
	s.db.Table("service_flow_logs").
		Select("changed_by as user_id, u.full_name as name, count(*) as count").
		Joins("LEFT JOIN users u ON service_flow_logs.changed_by = u.id").
		Group("changed_by, u.full_name").
		Order("count DESC").
		Limit(10).
		Find(&userCounts)

	stats["activities_by_user"] = userCounts

	return stats, nil
}

// ExportActivityLogs exports activity logs to CSV
func (s *activityLogService) ExportActivityLogs(req dto.ExportActivityLogsRequest) ([]byte, error) {
	// Get activity logs
	logs, _, err := s.GetActivityLogs(dto.GetActivityLogsRequest{
		Page:       1,
		Limit:      10000, // Large limit for export
		EntityType: req.EntityType,
		EntityID:   req.EntityID,
		UserID:     req.UserID,
		Status:     req.Status,
		StartDate:  req.StartDate,
		EndDate:    req.EndDate,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get activity logs: %w", err)
	}

	// Convert to CSV
	csv := "ID,License Type,License Request ID,Previous Status,New Status,Changed By,Change Reason,Created At\n"
	for _, log := range logs {
		csv += fmt.Sprintf("%d,%s,%d,%s,%s,%s,%s,%s\n",
			log.ID,
			log.LicenseType,
			log.LicenseRequestID,
			statusToStringPtr(log.PreviousStatus),
			log.NewStatus,
			userToString(log.ChangedByUser),
			log.ChangeReason,
			log.CreatedAt.Format("2006-01-02 15:04:05"),
		)
	}

	return []byte(csv), nil
}

// Helper functions

func statusToString(status models.RequestStatus) string {
	return string(status)
}

func statusToStringPtr(status *models.RequestStatus) string {
	if status == nil {
		return ""
	}
	return string(*status)
}

func userToString(user *models.User) string {
	if user == nil {
		return "System"
	}
	return user.FullName
}
