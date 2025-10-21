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

type CommentService interface {
	CreateComment(req dto.CreateCommentRequest) (*models.WorkflowComment, error)
	GetCommentsByEntity(entityType string, entityID uint) ([]models.WorkflowComment, error)
	GetCommentByID(commentID uint) (*models.WorkflowComment, error)
	UpdateComment(commentID uint, req dto.UpdateCommentRequest) (*models.WorkflowComment, error)
	DeleteComment(commentID uint) error
	CreateFeedback(req dto.CreateFeedbackRequest) (*models.WorkflowComment, error)
	GetFeedbackByEntity(entityType string, entityID uint) ([]models.WorkflowComment, error)
	ResolveComment(commentID uint) error
	GetUnresolvedCommentsCount(userID uint) (int64, error)
	GetCommentStatistics() (map[string]interface{}, error)
}

type commentService struct {
	db               *gorm.DB
	notificationRepo repository.NotificationRepository
	userRepo         repository.UserRepository
}

func NewCommentService(db *gorm.DB) CommentService {
	return &commentService{
		db:               db,
		notificationRepo: repository.NewNotificationRepository(db),
		userRepo:         repository.NewUserRepository(db),
	}
}

// CreateComment creates a new comment
func (s *commentService) CreateComment(req dto.CreateCommentRequest) (*models.WorkflowComment, error) {
	// Create comment
	comment := &models.WorkflowComment{
		Content:   req.Content,
		AuthorID:  req.AuthorID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := s.db.Create(comment).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	// Create notification for relevant users
	s.createCommentNotifications(comment)

	return comment, nil
}

// GetCommentsByEntity retrieves comments for a specific entity
func (s *commentService) GetCommentsByEntity(entityType string, entityID uint) ([]models.WorkflowComment, error) {
	var comments []models.WorkflowComment
	err := s.db.Where("id = ?", entityID).
		Preload("Author").
		Order("created_at DESC").
		Find(&comments).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get comments: %w", err)
	}
	return comments, nil
}

// GetCommentByID retrieves a specific comment
func (s *commentService) GetCommentByID(commentID uint) (*models.WorkflowComment, error) {
	var comment models.WorkflowComment
	err := s.db.Where("id = ?", commentID).
		Preload("Author").
		First(&comment).Error
	if err != nil {
		return nil, fmt.Errorf("comment not found: %w", err)
	}
	return &comment, nil
}

// UpdateComment updates a comment
func (s *commentService) UpdateComment(commentID uint, req dto.UpdateCommentRequest) (*models.WorkflowComment, error) {
	// Get comment
	comment, err := s.GetCommentByID(commentID)
	if err != nil {
		return nil, fmt.Errorf("comment not found: %w", err)
	}

	// Check if user is the author
	if comment.AuthorID != req.AuthorID {
		return nil, fmt.Errorf("user is not the author of this comment")
	}

	// Update comment fields
	if req.Content != "" {
		comment.Content = req.Content
	}
	if req.IsPublic != nil {
		// Update comment content
	}
	comment.UpdatedAt = time.Now()

	err = s.db.Save(comment).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update comment: %w", err)
	}

	return comment, nil
}

// DeleteComment deletes a comment
func (s *commentService) DeleteComment(commentID uint) error {
	// Get comment
	comment, err := s.GetCommentByID(commentID)
	if err != nil {
		return fmt.Errorf("comment not found: %w", err)
	}

	// Mark as deleted instead of actually deleting
	// Mark as deleted by clearing content
	comment.Content = "[DELETED]"
	comment.UpdatedAt = time.Now()

	err = s.db.Save(comment).Error
	if err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}

	return nil
}

// CreateFeedback creates a new feedback comment
func (s *commentService) CreateFeedback(req dto.CreateFeedbackRequest) (*models.WorkflowComment, error) {
	// Create feedback comment
	comment := &models.WorkflowComment{
		Content:   req.Content,
		AuthorID:  req.AuthorID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := s.db.Create(comment).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create feedback: %w", err)
	}

	// Create notification for relevant users
	s.createFeedbackNotifications(comment)

	return comment, nil
}

// GetFeedbackByEntity retrieves feedback for a specific entity
func (s *commentService) GetFeedbackByEntity(entityType string, entityID uint) ([]models.WorkflowComment, error) {
	var comments []models.WorkflowComment
	err := s.db.Where("entity_type = ? AND entity_id = ? AND comment_type = ? AND status = ?",
		"").
		Preload("Author").
		Order("created_at DESC").
		Find(&comments).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get feedback: %w", err)
	}
	return comments, nil
}

// ResolveComment marks a comment as resolved
func (s *commentService) ResolveComment(commentID uint) error {
	// Get comment
	comment, err := s.GetCommentByID(commentID)
	if err != nil {
		return fmt.Errorf("comment not found: %w", err)
	}

	// Mark as resolved
	// Mark as resolved by adding a prefix to content
	comment.Content = "[RESOLVED] " + comment.Content
	comment.UpdatedAt = time.Now()

	err = s.db.Save(comment).Error
	if err != nil {
		return fmt.Errorf("failed to resolve comment: %w", err)
	}

	// Create notification for author
	s.createNotificationForUser(
		comment.AuthorID,
		"ความคิดเห็นได้รับการแก้ไข",
		fmt.Sprintf("ความคิดเห็นของคุณได้รับการแก้ไขแล้ว"),
		models.NotificationType("comment_resolved"),
		models.PriorityNormal,
		"comment",
		comment.ID,
		"/admin-portal/comments",
	)

	return nil
}

// GetUnresolvedCommentsCount returns the count of unresolved comments for a user
func (s *commentService) GetUnresolvedCommentsCount(userID uint) (int64, error) {
	// Get user
	// Count unresolved comments
	var count int64
	err := s.db.Model(&models.WorkflowComment{}).
		Where("author_id = ?", userID).
		Count(&count).Error

	return count, err
}

// GetCommentStatistics returns statistics about comments
func (s *commentService) GetCommentStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Count comments by type
	// Count total comments
	var totalCount int64
	s.db.Model(&models.WorkflowComment{}).Count(&totalCount)

	stats["total_comments"] = totalCount
	stats["active_comments"] = totalCount

	return stats, nil
}

// Helper functions

func (s *commentService) createCommentNotifications(comment *models.WorkflowComment) {
	// Get relevant users based on entity type
	// Notify admins
	s.createNotificationForRole(
		models.UserRole("admin"),
		"ความคิดเห็นใหม่",
		fmt.Sprintf("มีความคิดเห็นใหม่"),
		models.NotificationType("comment_created"),
		models.PriorityNormal,
		"comment",
		comment.ID,
		"/admin-portal/comments",
	)
}

func (s *commentService) createFeedbackNotifications(feedback *models.WorkflowComment) {
	// Get relevant users based on entity type
	// Notify admins
	s.createNotificationForRole(
		models.UserRole("admin"),
		"ความคิดเห็นใหม่",
		fmt.Sprintf("มีความคิดเห็นใหม่"),
		models.NotificationType("feedback_created"),
		models.PriorityNormal,
		"comment",
		feedback.ID,
		"/admin-portal/comments",
	)
}

func (s *commentService) createNotificationForUser(userID uint, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
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

func (s *commentService) createNotificationForRole(role models.UserRole, title, message string, notifType models.NotificationType, priority models.NotificationPriority, entityType string, entityID uint, actionURL string) {
	notification := &models.Notification{
		Title:         title,
		Message:       message,
		Type:          notifType,
		Priority:      priority,
		RecipientRole: &role,
		EntityType:    entityType,
		EntityID:      &entityID,
		ActionURL:     actionURL,
	}

	if err := s.notificationRepo.Create(notification); err != nil {
		log.Printf("Failed to create notification for role %s: %v", role, err)
	}
}
