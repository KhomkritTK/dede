package service

import (
	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/workflow/dto"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

type TaskAssignmentService interface {
	CreateTask(req dto.CreateTaskRequest) (*models.TaskAssignment, error)
	GetTaskByID(taskID uint) (*models.TaskAssignment, error)
	GetTasksByUser(userID uint) ([]models.TaskAssignment, error)
	GetTasksByRole(role models.UserRole) ([]models.TaskAssignment, error)
	GetTasksByStatus(status models.TaskStatus) ([]models.TaskAssignment, error)
	GetTasksByRequestID(requestID uint) ([]models.TaskAssignment, error)
	UpdateTask(taskID uint, req dto.UpdateTaskRequest) (*models.TaskAssignment, error)
	AssignTask(taskID uint, userID uint) error
	ReassignTask(taskID uint, fromUserID uint, toUserID uint) error
	CompleteTask(taskID uint, req dto.CompleteTaskRequest) error
	GetOverdueTasks() ([]models.TaskAssignment, error)
	GetUpcomingTasks(days int) ([]models.TaskAssignment, error)
	GetTaskStatistics() (map[string]interface{}, error)
}

type taskAssignmentService struct {
	db               *gorm.DB
	taskRepo         repository.NotificationRepository
	userRepo         repository.UserRepository
	notificationRepo repository.NotificationRepository
}

func NewTaskAssignmentService(db *gorm.DB) TaskAssignmentService {
	return &taskAssignmentService{
		db:               db,
		taskRepo:         repository.NewNotificationRepository(db),
		userRepo:         repository.NewUserRepository(db),
		notificationRepo: repository.NewNotificationRepository(db),
	}
}

// CreateTask creates a new task
func (s *taskAssignmentService) CreateTask(req dto.CreateTaskRequest) (*models.TaskAssignment, error) {
	// Create task
	task := &models.TaskAssignment{
		RequestID:    req.RequestID,
		LicenseType:  "license",
		AssignedToID: 0, // Will be set later if assigned
		AssignedByID: req.AssignedByID,
		AssignedRole: models.UserRole("staff"),
		TaskType:     models.TaskTypeReview,
		Status:       models.TaskStatusPending,
		Priority:     models.TaskPriorityNormal,
		Deadline:     req.Deadline,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Set assigned to ID if provided
	if req.AssignedToID != nil {
		task.AssignedToID = *req.AssignedToID
	}

	err := s.db.Create(task).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	// Create notification for assigned user
	if req.AssignedToID != nil {
		s.createNotificationForUser(
			*req.AssignedToID,
			"มอบหมายงานใหม่",
			fmt.Sprintf("คุณได้รับมอบหมายงาน: %s", req.TaskTitle),
			models.NotificationType("task_assigned"),
			models.PriorityNormal,
			"task",
			task.ID,
			"/admin-portal/tasks",
		)
	}

	return task, nil
}

// GetTaskByID retrieves a task by ID
func (s *taskAssignmentService) GetTaskByID(taskID uint) (*models.TaskAssignment, error) {
	var task models.TaskAssignment
	err := s.db.Where("id = ?", taskID).
		Preload("AssignedBy").
		Preload("AssignedTo").
		Preload("Request").
		First(&task).Error
	if err != nil {
		return nil, fmt.Errorf("task not found: %w", err)
	}
	return &task, nil
}

// GetTasksByUser retrieves tasks for a specific user
func (s *taskAssignmentService) GetTasksByUser(userID uint) ([]models.TaskAssignment, error) {
	var tasks []models.TaskAssignment
	err := s.db.Where("assigned_to_id = ?", userID).
		Preload("AssignedBy").
		Preload("AssignedTo").
		Preload("Request").
		Order("deadline ASC, priority DESC, created_at DESC").
		Find(&tasks).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get tasks: %w", err)
	}
	return tasks, nil
}

// GetTasksByRole retrieves tasks for a specific role
func (s *taskAssignmentService) GetTasksByRole(role models.UserRole) ([]models.TaskAssignment, error) {
	var tasks []models.TaskAssignment

	// Get users with the specified role
	var users []models.User
	err := s.db.Where("role = ?", role).Find(&users).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	// Get user IDs
	var userIDs []uint
	for _, user := range users {
		userIDs = append(userIDs, user.ID)
	}

	// Get tasks for these users
	if len(userIDs) > 0 {
		err = s.db.Where("assigned_to_id IN ?", userIDs).
			Preload("AssignedBy").
			Preload("AssignedTo").
			Preload("Request").
			Order("deadline ASC, priority DESC, created_at DESC").
			Find(&tasks).Error
		if err != nil {
			return nil, fmt.Errorf("failed to get tasks: %w", err)
		}
	}

	return tasks, nil
}

// GetTasksByStatus retrieves tasks by status
func (s *taskAssignmentService) GetTasksByStatus(status models.TaskStatus) ([]models.TaskAssignment, error) {
	var tasks []models.TaskAssignment
	err := s.db.Where("status = ?", status).
		Preload("AssignedBy").
		Preload("AssignedTo").
		Preload("Request").
		Order("deadline ASC, priority DESC, created_at DESC").
		Find(&tasks).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get tasks: %w", err)
	}
	return tasks, nil
}

// GetTasksByRequestID retrieves tasks for a specific request
func (s *taskAssignmentService) GetTasksByRequestID(requestID uint) ([]models.TaskAssignment, error) {
	var tasks []models.TaskAssignment
	err := s.db.Where("request_id = ?", requestID).
		Preload("AssignedBy").
		Preload("AssignedTo").
		Preload("Request").
		Order("deadline ASC, priority DESC, created_at DESC").
		Find(&tasks).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get tasks: %w", err)
	}
	return tasks, nil
}

// UpdateTask updates a task
func (s *taskAssignmentService) UpdateTask(taskID uint, req dto.UpdateTaskRequest) (*models.TaskAssignment, error) {
	// Get task
	task, err := s.GetTaskByID(taskID)
	if err != nil {
		return nil, fmt.Errorf("task not found: %w", err)
	}

	// Update task fields
	if req.TaskTitle != "" {
		// Update task fields
	}
	if req.Deadline != nil {
		task.Deadline = req.Deadline
	}
	if req.Status != "" {
		task.Status = models.TaskStatus(req.Status)
	}
	task.UpdatedAt = time.Now()

	err = s.db.Save(task).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	return task, nil
}

// AssignTask assigns a task to a user
func (s *taskAssignmentService) AssignTask(taskID uint, userID uint) error {
	// Get task
	task, err := s.GetTaskByID(taskID)
	if err != nil {
		return fmt.Errorf("task not found: %w", err)
	}

	// Update task
	task.Status = models.TaskStatusInProgress
	task.UpdatedAt = time.Now()

	err = s.db.Save(task).Error
	if err != nil {
		return fmt.Errorf("failed to assign task: %w", err)
	}

	// Create notification for assigned user
	s.createNotificationForUser(
		userID,
		"มอบหมายงานใหม่",
		fmt.Sprintf("คุณได้รับมอบหมายงาน: %s", task.GetTaskTypeDisplayName()),
		models.NotificationType("task_assigned"),
		models.PriorityNormal,
		"task",
		task.ID,
		"/admin-portal/tasks",
	)

	return nil
}

// ReassignTask reassigns a task to another user
func (s *taskAssignmentService) ReassignTask(taskID uint, fromUserID uint, toUserID uint) error {
	// Get task
	task, err := s.GetTaskByID(taskID)
	if err != nil {
		return fmt.Errorf("task not found: %w", err)
	}

	// Check if the task is assigned to the from user
	// Update task
	task.Status = models.TaskStatusInProgress
	task.UpdatedAt = time.Now()

	err = s.db.Save(task).Error
	if err != nil {
		return fmt.Errorf("failed to reassign task: %w", err)
	}

	// Create notification for new assigned user
	s.createNotificationForUser(
		toUserID,
		"มอบหมายงานใหม่",
		fmt.Sprintf("คุณได้รับมอบหมายงานใหม่: %s", task.GetTaskTypeDisplayName()),
		models.NotificationType("task_reassigned"),
		models.PriorityNormal,
		"task",
		task.ID,
		"/admin-portal/tasks",
	)

	// Create notification for previous assigned user
	s.createNotificationForUser(
		fromUserID,
		"เปลี่ยนผู้รับผิดชอบงาน",
		fmt.Sprintf("งาน %s ได้รับมอบหมายให้ผู้อื่น", task.GetTaskTypeDisplayName()),
		models.NotificationType("task_reassigned"),
		models.PriorityNormal,
		"task",
		task.ID,
		"/admin-portal/tasks",
	)

	return nil
}

// CompleteTask marks a task as completed
func (s *taskAssignmentService) CompleteTask(taskID uint, req dto.CompleteTaskRequest) error {
	// Get task
	task, err := s.GetTaskByID(taskID)
	if err != nil {
		return fmt.Errorf("task not found: %w", err)
	}

	// Update task
	task.Status = models.TaskStatusCompleted
	task.CompletedAt = &[]time.Time{time.Now()}[0]
	task.UpdatedAt = time.Now()

	err = s.db.Save(task).Error
	if err != nil {
		return fmt.Errorf("failed to complete task: %w", err)
	}

	// Create notification for assigned by user
	// Create notification for assigned by user
	if task.AssignedByID != 0 {
		s.createNotificationForUser(
			task.AssignedByID,
			"งานเสร็จสิ้น",
			fmt.Sprintf("งาน %s ได้รับการดำเนินการเสร็จสิ้น", task.GetTaskTypeDisplayName()),
			models.NotificationType("task_completed"),
			models.PriorityNormal,
			"task",
			task.ID,
			"/admin-portal/tasks",
		)
	}

	return nil
}

// GetOverdueTasks retrieves overdue tasks
func (s *taskAssignmentService) GetOverdueTasks() ([]models.TaskAssignment, error) {
	var tasks []models.TaskAssignment
	err := s.db.Where("status IN ? AND deadline < ?",
		[]models.TaskStatus{models.TaskStatusPending, models.TaskStatusInProgress},
		time.Now()).
		Preload("AssignedBy").
		Preload("AssignedTo").
		Preload("Request").
		Order("deadline ASC").
		Find(&tasks).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get overdue tasks: %w", err)
	}
	return tasks, nil
}

// GetUpcomingTasks retrieves tasks with deadlines within the specified number of days
func (s *taskAssignmentService) GetUpcomingTasks(days int) ([]models.TaskAssignment, error) {
	now := time.Now()
	future := now.AddDate(0, 0, days)

	var tasks []models.TaskAssignment
	err := s.db.Where("status IN ? AND deadline BETWEEN ? AND ?",
		[]models.TaskStatus{models.TaskStatusPending, models.TaskStatusInProgress},
		now, future).
		Preload("AssignedBy").
		Preload("AssignedTo").
		Preload("Request").
		Order("deadline ASC").
		Find(&tasks).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get upcoming tasks: %w", err)
	}
	return tasks, nil
}

// GetTaskStatistics returns statistics about tasks
func (s *taskAssignmentService) GetTaskStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count tasks by status
	var pendingCount, assignedCount, completedCount int64
	s.db.Model(&models.TaskAssignment{}).Where("status = ?", models.TaskStatusPending).Count(&pendingCount)
	s.db.Model(&models.TaskAssignment{}).Where("status = ?", models.TaskStatusInProgress).Count(&assignedCount)
	s.db.Model(&models.TaskAssignment{}).Where("status = ?", models.TaskStatusCompleted).Count(&completedCount)
	reassignedCount := int64(0) // No reassigned status in the model

	stats["total_tasks"] = pendingCount + assignedCount + completedCount
	stats["pending_tasks"] = pendingCount
	stats["assigned_tasks"] = assignedCount
	stats["reassigned_tasks"] = reassignedCount
	stats["completed_tasks"] = completedCount

	// Count tasks by priority
	var lowPriorityCount, normalPriorityCount, highPriorityCount int64
	s.db.Model(&models.TaskAssignment{}).Where("priority = ?", models.TaskPriorityLow).Count(&lowPriorityCount)
	s.db.Model(&models.TaskAssignment{}).Where("priority = ?", models.TaskPriorityNormal).Count(&normalPriorityCount)
	s.db.Model(&models.TaskAssignment{}).Where("priority = ?", models.TaskPriorityHigh).Count(&highPriorityCount)

	stats["low_priority_tasks"] = lowPriorityCount
	stats["normal_priority_tasks"] = normalPriorityCount
	stats["high_priority_tasks"] = highPriorityCount

	// Count overdue tasks
	var overdueCount int64
	s.db.Model(&models.TaskAssignment{}).Where("status IN ? AND deadline < ?",
		[]models.TaskStatus{models.TaskStatusPending, models.TaskStatusInProgress},
		time.Now()).Count(&overdueCount)

	stats["overdue_tasks"] = overdueCount

	// Count tasks by user
	var userCounts []struct {
		UserID uint   `json:"user_id"`
		Name   string `json:"name"`
		Count  int64  `json:"count"`
	}
	s.db.Table("task_assignments").
		Select("assigned_to_id as user_id, u.full_name as name, count(*) as count").
		Joins("LEFT JOIN users u ON task_assignments.assigned_to_id = u.id").
		Where("status IN ?", []models.TaskStatus{models.TaskStatusPending, models.TaskStatusInProgress}).
		Group("assigned_to_id, u.full_name").
		Order("count DESC").
		Find(&userCounts)

	stats["tasks_by_user"] = userCounts

	return stats, nil
}

// Helper functions

func (s *taskAssignmentService) createNotificationForUser(userID uint, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
	notification := &models.Notification{
		Title:       title,
		Message:     message,
		Type:        notifType,
		Priority:    priority,
		RecipientID: &userID,
		EntityType:  entityType,
		EntityID:    &entityID,
		ActionURL:   actionURL,
	}

	if err := s.notificationRepo.Create(notification); err != nil {
		log.Printf("Failed to create notification for user %d: %v", userID, err)
	}
}
