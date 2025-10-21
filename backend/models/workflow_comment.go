package models

import (
	"time"

	"gorm.io/gorm"
)

type CommentType string

const (
	CommentTypeFeedback  CommentType = "feedback"
	CommentTypeRejection CommentType = "rejection"
	CommentTypeNote      CommentType = "note"
	CommentTypeApproval  CommentType = "approval"
)

type WorkflowComment struct {
	ID              uint             `json:"id" gorm:"primaryKey"`
	RequestID       uint             `json:"request_id" gorm:"not null;index"`
	LicenseType     string           `json:"license_type" gorm:"not null"`
	CommentType     CommentType      `json:"comment_type" gorm:"not null"`
	Content         string           `json:"content" gorm:"not null"`
	AuthorID        uint             `json:"author_id" gorm:"not null;index"`
	Author          User             `json:"author" gorm:"foreignKey:AuthorID"`
	RecipientID     *uint            `json:"recipient_id" gorm:"index"`
	Recipient       *User            `json:"recipient" gorm:"foreignKey:RecipientID"`
	InternalFlag    bool             `json:"is_internal" gorm:"default:false"`
	VisibleToUser   bool             `json:"is_visible_to_user" gorm:"default:true"`
	ParentCommentID *uint            `json:"parent_comment_id" gorm:"index"`
	ParentComment   *WorkflowComment `json:"parent_comment" gorm:"foreignKey:ParentCommentID"`
	StatusBefore    *RequestStatus   `json:"status_before"`
	StatusAfter     *RequestStatus   `json:"status_after"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
	DeletedAt       gorm.DeletedAt   `json:"-" gorm:"index"`
}

// TableName specifies the table name for the WorkflowComment model
func (WorkflowComment) TableName() string {
	return "workflow_comments"
}

// IsFeedback checks if the comment is a feedback type
func (wc *WorkflowComment) IsFeedback() bool {
	return wc.CommentType == CommentTypeFeedback
}

// IsRejection checks if the comment is a rejection type
func (wc *WorkflowComment) IsRejection() bool {
	return wc.CommentType == CommentTypeRejection
}

// IsNote checks if the comment is a note type
func (wc *WorkflowComment) IsNote() bool {
	return wc.CommentType == CommentTypeNote
}

// IsApproval checks if the comment is an approval type
func (wc *WorkflowComment) IsApproval() bool {
	return wc.CommentType == CommentTypeApproval
}

// IsInternal checks if the comment is internal (not visible to users)
func (wc *WorkflowComment) IsInternal() bool {
	return wc.InternalFlag
}

// IsVisibleToUser checks if the comment is visible to users
func (wc *WorkflowComment) IsVisibleToUser() bool {
	return wc.VisibleToUser
}

// HasParent checks if the comment has a parent comment
func (wc *WorkflowComment) HasParent() bool {
	return wc.ParentCommentID != nil
}

// GetCommentTypeDisplayName returns the display name for the comment type
func (wc *WorkflowComment) GetCommentTypeDisplayName() string {
	switch wc.CommentType {
	case CommentTypeFeedback:
		return "ความคิดเห็น"
	case CommentTypeRejection:
		return "การปฏิเสธ"
	case CommentTypeNote:
		return "โน้ต"
	case CommentTypeApproval:
		return "การอนุมัติ"
	default:
		return string(wc.CommentType)
	}
}
