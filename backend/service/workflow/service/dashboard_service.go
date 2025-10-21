package service

import (
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/workflow/dto"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type DashboardService interface {
	GetDashboard(userID uint, role models.UserRole) (*dto.DashboardResponse, error)
	GetAdminDashboard(userID uint) (*dto.AdminDashboardResponse, error)
	GetDEDEHeadDashboard(userID uint) (*dto.DEDEHeadDashboardResponse, error)
	GetDEDEStaffDashboard(userID uint) (*dto.DEDEStaffDashboardResponse, error)
	GetDEDEConsultDashboard(userID uint) (*dto.DEDEConsultDashboardResponse, error)
	GetRecentActivities(userID uint, role models.UserRole) ([]models.ServiceFlowLog, error)
	GetUpcomingDeadlines(userID uint, role models.UserRole) ([]models.TaskAssignment, error)
	GetPendingTasks(userID uint, role models.UserRole) ([]models.TaskAssignment, error)
	GetNotifications(userID uint, role models.UserRole) ([]models.Notification, error)
}

type dashboardService struct {
	db                   *gorm.DB
	newLicenseRepo       repository.NewLicenseRepo
	renewalLicenseRepo   repository.RenewalLicenseRepo
	extensionLicenseRepo repository.ExtensionLicenseRepo
	reductionLicenseRepo repository.ReductionLicenseRepo
	notificationRepo     repository.NotificationRepository
	serviceFlowLogRepo   repository.ServiceFlowLogRepo
	userRepo             repository.UserRepository
}

func NewDashboardService(db *gorm.DB) DashboardService {
	return &dashboardService{
		db:                   db,
		newLicenseRepo:       repository.NewNewLicenseRepo(db),
		renewalLicenseRepo:   repository.NewRenewalLicenseRepo(db),
		extensionLicenseRepo: repository.NewExtensionLicenseRepo(db),
		reductionLicenseRepo: repository.NewReductionLicenseRepo(db),
		notificationRepo:     repository.NewNotificationRepository(db),
		serviceFlowLogRepo:   repository.NewServiceFlowLogRepo(db),
		userRepo:             repository.NewUserRepository(db),
	}
}

// GetDashboard returns dashboard data based on user role
func (s *dashboardService) GetDashboard(userID uint, role models.UserRole) (*dto.DashboardResponse, error) {
	switch role {
	case models.UserRole("admin"):
		adminDashboard, _ := s.GetAdminDashboard(userID)
		return &dto.DashboardResponse{
			Role:              "admin",
			Statistics:        adminDashboard.Statistics,
			RecentActivities:  adminDashboard.RecentActivities,
			UpcomingDeadlines: adminDashboard.UpcomingDeadlines,
			PendingTasks:      adminDashboard.PendingTasks,
			Notifications:     adminDashboard.Notifications,
		}, nil
	case models.UserRole("dede_head"):
		headDashboard, _ := s.GetDEDEHeadDashboard(userID)
		return &dto.DashboardResponse{
			Role:              "dede_head",
			Statistics:        headDashboard.Statistics,
			RecentActivities:  headDashboard.RecentActivities,
			UpcomingDeadlines: headDashboard.UpcomingDeadlines,
			PendingTasks:      headDashboard.PendingTasks,
			Notifications:     headDashboard.Notifications,
		}, nil
	case models.UserRole("dede_staff"):
		staffDashboard, _ := s.GetDEDEStaffDashboard(userID)
		return &dto.DashboardResponse{
			Role:              "dede_staff",
			Statistics:        staffDashboard.Statistics,
			RecentActivities:  staffDashboard.RecentActivities,
			UpcomingDeadlines: staffDashboard.UpcomingDeadlines,
			PendingTasks:      staffDashboard.PendingTasks,
			Notifications:     staffDashboard.Notifications,
		}, nil
	case models.UserRole("dede_consult"):
		consultDashboard, _ := s.GetDEDEConsultDashboard(userID)
		return &dto.DashboardResponse{
			Role:              "dede_consult",
			Statistics:        consultDashboard.Statistics,
			RecentActivities:  consultDashboard.RecentActivities,
			UpcomingDeadlines: consultDashboard.UpcomingDeadlines,
			PendingTasks:      consultDashboard.PendingTasks,
			Notifications:     consultDashboard.Notifications,
		}, nil
	default:
		return nil, fmt.Errorf("unsupported role: %s", role)
	}
}

// GetAdminDashboard returns admin dashboard data
func (s *dashboardService) GetAdminDashboard(userID uint) (*dto.AdminDashboardResponse, error) {
	// Get statistics
	stats, err := s.getAdminStatistics()
	if err != nil {
		return nil, fmt.Errorf("failed to get admin statistics: %w", err)
	}

	// Get recent activities
	activities, err := s.GetRecentActivities(userID, models.UserRole("admin"))
	if err != nil {
		return nil, fmt.Errorf("failed to get recent activities: %w", err)
	}

	// Get upcoming deadlines
	deadlines, err := s.GetUpcomingDeadlines(userID, models.UserRole("admin"))
	if err != nil {
		return nil, fmt.Errorf("failed to get upcoming deadlines: %w", err)
	}

	// Get pending tasks
	tasks, err := s.GetPendingTasks(userID, models.UserRole("admin"))
	if err != nil {
		return nil, fmt.Errorf("failed to get pending tasks: %w", err)
	}

	// Get notifications
	notifications, err := s.GetNotifications(userID, models.UserRole("admin"))
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %w", err)
	}

	return &dto.AdminDashboardResponse{
		Statistics:        stats,
		RecentActivities:  activities,
		UpcomingDeadlines: deadlines,
		PendingTasks:      tasks,
		Notifications:     notifications,
	}, nil
}

// GetDEDEHeadDashboard returns DEDE Head dashboard data
func (s *dashboardService) GetDEDEHeadDashboard(userID uint) (*dto.DEDEHeadDashboardResponse, error) {
	// Get statistics
	stats, err := s.getDEDEHeadStatistics()
	if err != nil {
		return nil, fmt.Errorf("failed to get DEDE Head statistics: %w", err)
	}

	// Get recent activities
	activities, err := s.GetRecentActivities(userID, models.UserRole("dede_head"))
	if err != nil {
		return nil, fmt.Errorf("failed to get recent activities: %w", err)
	}

	// Get upcoming deadlines
	deadlines, err := s.GetUpcomingDeadlines(userID, models.UserRole("dede_head"))
	if err != nil {
		return nil, fmt.Errorf("failed to get upcoming deadlines: %w", err)
	}

	// Get pending tasks
	tasks, err := s.GetPendingTasks(userID, models.UserRole("dede_head"))
	if err != nil {
		return nil, fmt.Errorf("failed to get pending tasks: %w", err)
	}

	// Get notifications
	notifications, err := s.GetNotifications(userID, models.UserRole("dede_head"))
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %w", err)
	}

	return &dto.DEDEHeadDashboardResponse{
		Statistics:        stats,
		RecentActivities:  activities,
		UpcomingDeadlines: deadlines,
		PendingTasks:      tasks,
		Notifications:     notifications,
	}, nil
}

// GetDEDEStaffDashboard returns DEDE Staff dashboard data
func (s *dashboardService) GetDEDEStaffDashboard(userID uint) (*dto.DEDEStaffDashboardResponse, error) {
	// Get statistics
	stats, err := s.getDEDEStaffStatistics(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get DEDE Staff statistics: %w", err)
	}

	// Get recent activities
	activities, err := s.GetRecentActivities(userID, models.UserRole("dede_staff"))
	if err != nil {
		return nil, fmt.Errorf("failed to get recent activities: %w", err)
	}

	// Get upcoming deadlines
	deadlines, err := s.GetUpcomingDeadlines(userID, models.UserRole("dede_staff"))
	if err != nil {
		return nil, fmt.Errorf("failed to get upcoming deadlines: %w", err)
	}

	// Get pending tasks
	tasks, err := s.GetPendingTasks(userID, models.UserRole("dede_staff"))
	if err != nil {
		return nil, fmt.Errorf("failed to get pending tasks: %w", err)
	}

	// Get notifications
	notifications, err := s.GetNotifications(userID, models.UserRole("dede_staff"))
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %w", err)
	}

	return &dto.DEDEStaffDashboardResponse{
		Statistics:        stats,
		RecentActivities:  activities,
		UpcomingDeadlines: deadlines,
		PendingTasks:      tasks,
		Notifications:     notifications,
	}, nil
}

// GetDEDEConsultDashboard returns DEDE Consult dashboard data
func (s *dashboardService) GetDEDEConsultDashboard(userID uint) (*dto.DEDEConsultDashboardResponse, error) {
	// Get statistics
	stats, err := s.getDEDEConsultStatistics(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get DEDE Consult statistics: %w", err)
	}

	// Get recent activities
	activities, err := s.GetRecentActivities(userID, models.UserRole("dede_consult"))
	if err != nil {
		return nil, fmt.Errorf("failed to get recent activities: %w", err)
	}

	// Get upcoming deadlines
	deadlines, err := s.GetUpcomingDeadlines(userID, models.UserRole("dede_consult"))
	if err != nil {
		return nil, fmt.Errorf("failed to get upcoming deadlines: %w", err)
	}

	// Get pending tasks
	tasks, err := s.GetPendingTasks(userID, models.UserRole("dede_consult"))
	if err != nil {
		return nil, fmt.Errorf("failed to get pending tasks: %w", err)
	}

	// Get notifications
	notifications, err := s.GetNotifications(userID, models.UserRole("dede_consult"))
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %w", err)
	}

	return &dto.DEDEConsultDashboardResponse{
		Statistics:        stats,
		RecentActivities:  activities,
		UpcomingDeadlines: deadlines,
		PendingTasks:      tasks,
		Notifications:     notifications,
	}, nil
}

// GetRecentActivities returns recent activities for a user
func (s *dashboardService) GetRecentActivities(userID uint, role models.UserRole) ([]models.ServiceFlowLog, error) {
	var activities []models.ServiceFlowLog
	var err error

	// Get activities based on role
	switch role {
	case models.UserRole("admin"):
		// Admin can see all activities
		err = s.db.Preload("ChangedByUser").Order("created_at DESC").Limit(10).Find(&activities).Error
	case models.UserRole("dede_head"):
		// DEDE Head can see all activities
		err = s.db.Preload("ChangedByUser").Order("created_at DESC").Limit(10).Find(&activities).Error
	case models.UserRole("dede_staff"):
		// DEDE Staff can see activities they're involved in
		err = s.db.Where("changed_by = ?", userID).Preload("ChangedByUser").Order("created_at DESC").Limit(10).Find(&activities).Error
	case models.UserRole("dede_consult"):
		// DEDE Consult can see activities they're involved in
		err = s.db.Where("changed_by = ?", userID).Preload("ChangedByUser").Order("created_at DESC").Limit(10).Find(&activities).Error
	default:
		return nil, fmt.Errorf("unsupported role: %s", role)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get recent activities: %w", err)
	}

	return activities, nil
}

// GetUpcomingDeadlines returns upcoming deadlines for a user
func (s *dashboardService) GetUpcomingDeadlines(userID uint, role models.UserRole) ([]models.TaskAssignment, error) {
	var deadlines []models.TaskAssignment
	var err error

	// Get deadlines based on role
	switch role {
	case models.UserRole("admin"):
		// Admin can see all deadlines
		err = s.db.Where("status = ? AND deadline >= ?", models.TaskStatusPending, time.Now()).
			Order("deadline ASC").Limit(5).Find(&deadlines).Error
	case models.UserRole("dede_head"):
		// DEDE Head can see all deadlines
		err = s.db.Where("status = ? AND deadline >= ?", models.TaskStatusPending, time.Now()).
			Order("deadline ASC").Limit(5).Find(&deadlines).Error
	case models.UserRole("dede_staff"):
		// DEDE Staff can see their own deadlines
		err = s.db.Where("assigned_to_id = ? AND status = ? AND deadline >= ?",
			userID, models.TaskStatusPending, time.Now()).
			Order("deadline ASC").Limit(5).Find(&deadlines).Error
	case models.UserRole("dede_consult"):
		// DEDE Consult can see their own deadlines
		err = s.db.Where("assigned_to_id = ? AND status = ? AND deadline >= ?",
			userID, models.TaskStatusPending, time.Now()).
			Order("deadline ASC").Limit(5).Find(&deadlines).Error
	default:
		return nil, fmt.Errorf("unsupported role: %s", role)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get upcoming deadlines: %w", err)
	}

	return deadlines, nil
}

// GetPendingTasks returns pending tasks for a user
func (s *dashboardService) GetPendingTasks(userID uint, role models.UserRole) ([]models.TaskAssignment, error) {
	var tasks []models.TaskAssignment
	var err error

	// Get tasks based on role
	switch role {
	case models.UserRole("admin"):
		// Admin can see all pending tasks
		err = s.db.Where("status = ?", models.TaskStatusPending).
			Order("created_at DESC").Limit(10).Find(&tasks).Error
	case models.UserRole("dede_head"):
		// DEDE Head can see all pending tasks
		err = s.db.Where("status = ?", models.TaskStatusPending).
			Order("created_at DESC").Limit(10).Find(&tasks).Error
	case models.UserRole("dede_staff"):
		// DEDE Staff can see their own pending tasks
		err = s.db.Where("assigned_to_id = ? AND status = ?", userID, models.TaskStatusPending).
			Order("created_at DESC").Limit(10).Find(&tasks).Error
	case models.UserRole("dede_consult"):
		// DEDE Consult can see their own pending tasks
		err = s.db.Where("assigned_to_id = ? AND status = ?", userID, models.TaskStatusPending).
			Order("created_at DESC").Limit(10).Find(&tasks).Error
	default:
		return nil, fmt.Errorf("unsupported role: %s", role)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get pending tasks: %w", err)
	}

	return tasks, nil
}

// GetNotifications returns notifications for a user
func (s *dashboardService) GetNotifications(userID uint, role models.UserRole) ([]models.Notification, error) {
	var notifications []models.Notification
	var err error

	// Get notifications based on role
	switch role {
	case models.UserRole("admin"):
		// Admin can see all notifications
		err = s.db.Where("recipient_id = ? OR recipient_role = ?", userID, role).
			Order("created_at DESC").Limit(10).Find(&notifications).Error
	case models.UserRole("dede_head"):
		// DEDE Head can see all notifications
		err = s.db.Where("recipient_id = ? OR recipient_role = ?", userID, role).
			Order("created_at DESC").Limit(10).Find(&notifications).Error
	case models.UserRole("dede_staff"):
		// DEDE Staff can see their own notifications
		err = s.db.Where("recipient_id = ? OR recipient_role = ?", userID, role).
			Order("created_at DESC").Limit(10).Find(&notifications).Error
	case models.UserRole("dede_consult"):
		// DEDE Consult can see their own notifications
		err = s.db.Where("recipient_id = ? OR recipient_role = ?", userID, role).
			Order("created_at DESC").Limit(10).Find(&notifications).Error
	default:
		return nil, fmt.Errorf("unsupported role: %s", role)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %w", err)
	}

	return notifications, nil
}

// Helper functions for statistics

func (s *dashboardService) getAdminStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count requests by status
	var newRequestsCount, pendingCount, approvedCount, rejectedCount int64
	s.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusNewRequest).Count(&newRequestsCount)
	s.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusAccepted).Count(&pendingCount)
	s.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusApproved).Count(&approvedCount)
	s.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusRejected).Count(&rejectedCount)

	stats["new_requests"] = newRequestsCount
	stats["pending_requests"] = pendingCount
	stats["approved_requests"] = approvedCount
	stats["rejected_requests"] = rejectedCount

	// Count tasks by status
	var pendingTasksCount, completedTasksCount int64
	s.db.Model(&models.TaskAssignment{}).Where("status = ?", models.TaskStatusPending).Count(&pendingTasksCount)
	s.db.Model(&models.TaskAssignment{}).Where("status = ?", models.TaskStatusCompleted).Count(&completedTasksCount)

	stats["pending_tasks"] = pendingTasksCount
	stats["completed_tasks"] = completedTasksCount

	// Count overdue requests
	var overdueCount int64
	s.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusOverdue).Count(&overdueCount)

	stats["overdue_requests"] = overdueCount

	return stats, nil
}

func (s *dashboardService) getDEDEHeadStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count requests by status
	var newRequestsCount, pendingCount, approvedCount, rejectedCount int64
	s.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusNewRequest).Count(&newRequestsCount)
	s.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusAccepted).Count(&pendingCount)
	s.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusApproved).Count(&approvedCount)
	s.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusRejected).Count(&rejectedCount)

	stats["new_requests"] = newRequestsCount
	stats["pending_requests"] = pendingCount
	stats["approved_requests"] = approvedCount
	stats["rejected_requests"] = rejectedCount

	// Count tasks by status
	var pendingTasksCount, completedTasksCount int64
	s.db.Model(&models.TaskAssignment{}).Where("status = ?", models.TaskStatusPending).Count(&pendingTasksCount)
	s.db.Model(&models.TaskAssignment{}).Where("status = ?", models.TaskStatusCompleted).Count(&completedTasksCount)

	stats["pending_tasks"] = pendingTasksCount
	stats["completed_tasks"] = completedTasksCount

	// Count overdue requests
	var overdueCount int64
	s.db.Model(&models.NewLicenseRequest{}).Where("status = ?", models.StatusOverdue).Count(&overdueCount)

	stats["overdue_requests"] = overdueCount

	return stats, nil
}

func (s *dashboardService) getDEDEStaffStatistics(userID uint) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count assigned tasks
	var assignedTasksCount, completedTasksCount int64
	s.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND status = ?", userID, models.TaskStatusPending).Count(&assignedTasksCount)
	s.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND status = ?", userID, models.TaskStatusCompleted).Count(&completedTasksCount)

	stats["assigned_tasks"] = assignedTasksCount
	stats["completed_tasks"] = completedTasksCount

	// Count overdue tasks
	var overdueTasksCount int64
	s.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND status = ? AND deadline < ?",
		userID, models.TaskStatusPending, time.Now()).Count(&overdueTasksCount)

	stats["overdue_tasks"] = overdueTasksCount

	return stats, nil
}

func (s *dashboardService) getDEDEConsultStatistics(userID uint) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count assigned tasks
	var assignedTasksCount, completedTasksCount int64
	s.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND status = ?", userID, models.TaskStatusPending).Count(&assignedTasksCount)
	s.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND status = ?", userID, models.TaskStatusCompleted).Count(&completedTasksCount)

	stats["assigned_tasks"] = assignedTasksCount
	stats["completed_tasks"] = completedTasksCount

	// Count overdue tasks
	var overdueTasksCount int64
	s.db.Model(&models.TaskAssignment{}).Where("assigned_to_id = ? AND status = ? AND deadline < ?",
		userID, models.TaskStatusPending, time.Now()).Count(&overdueTasksCount)

	stats["overdue_tasks"] = overdueTasksCount

	return stats, nil
}
