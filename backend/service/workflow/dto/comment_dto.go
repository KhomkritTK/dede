package dto

import "time"

// CreateCommentRequest represents a request to create a comment
type CreateCommentRequest struct {
	EntityType  string `json:"entity_type" binding:"required"`
	EntityID    uint   `json:"entity_id" binding:"required"`
	AuthorID    uint   `json:"author_id" binding:"required"`
	Content     string `json:"content" binding:"required"`
	CommentType string `json:"comment_type" binding:"required"`
	IsPublic    bool   `json:"is_public"`
}

// UpdateCommentRequest represents a request to update a comment
type UpdateCommentRequest struct {
	AuthorID uint   `json:"author_id" binding:"required"`
	Content  string `json:"content"`
	IsPublic *bool  `json:"is_public"`
}

// CreateFeedbackRequest represents a request to create feedback
type CreateFeedbackRequest struct {
	EntityType   string     `json:"entity_type" binding:"required"`
	EntityID     uint       `json:"entity_id" binding:"required"`
	AuthorID     uint       `json:"author_id" binding:"required"`
	Content      string     `json:"content" binding:"required"`
	IsPublic     bool       `json:"is_public"`
	FeedbackType string     `json:"feedback_type"`
	Severity     string     `json:"severity"`
	Priority     string     `json:"priority"`
	DueDate      *time.Time `json:"due_date"`
}

// CommentResponse represents a comment response
type CommentResponse struct {
	ID           uint       `json:"id"`
	EntityType   string     `json:"entity_type"`
	EntityID     uint       `json:"entity_id"`
	AuthorID     uint       `json:"author_id"`
	Author       User       `json:"author"`
	Content      string     `json:"content"`
	CommentType  string     `json:"comment_type"`
	FeedbackType string     `json:"feedback_type"`
	Severity     string     `json:"severity"`
	Priority     string     `json:"priority"`
	IsPublic     bool       `json:"is_public"`
	Status       string     `json:"status"`
	DueDate      *time.Time `json:"due_date"`
	ResolvedAt   *time.Time `json:"resolved_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// GetCommentsRequest represents a request to get comments
type GetCommentsRequest struct {
	Page        int    `json:"page"`
	Limit       int    `json:"limit"`
	EntityType  string `json:"entity_type"`
	EntityID    uint   `json:"entity_id"`
	CommentType string `json:"comment_type"`
	Status      string `json:"status"`
	IsPublic    *bool  `json:"is_public"`
}

// CommentStatisticsResponse represents comment statistics
type CommentStatisticsResponse struct {
	TotalComments          int64 `json:"total_comments"`
	RegularComments        int64 `json:"regular_comments"`
	FeedbackComments       int64 `json:"feedback_comments"`
	ActiveComments         int64 `json:"active_comments"`
	ResolvedComments       int64 `json:"resolved_comments"`
	DeletedComments        int64 `json:"deleted_comments"`
	RejectionFeedback      int64 `json:"rejection_feedback"`
	SuggestionFeedback     int64 `json:"suggestion_feedback"`
	IssueFeedback          int64 `json:"issue_feedback"`
	LowSeverityFeedback    int64 `json:"low_severity_feedback"`
	MediumSeverityFeedback int64 `json:"medium_severity_feedback"`
	HighSeverityFeedback   int64 `json:"high_severity_feedback"`
}

// ResolveCommentRequest represents a request to resolve a comment
type ResolveCommentRequest struct {
	CommentID uint `json:"comment_id" binding:"required"`
}
