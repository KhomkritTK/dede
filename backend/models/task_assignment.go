package models

import (
	"time"

	"gorm.io/gorm"
)

type TaskType string

const (
	TaskTypeReview       TaskType = "review"
	TaskTypeInspection   TaskType = "inspection"
	TaskTypeReportReview TaskType = "report_review"
	TaskTypeApproval     TaskType = "approval"
)

type TaskStatus string

const (
	TaskStatusPending    TaskStatus = "pending"
	TaskStatusInProgress TaskStatus = "in_progress"
	TaskStatusCompleted  TaskStatus = "completed"
	TaskStatusCancelled  TaskStatus = "cancelled"
	TaskStatusOverdue    TaskStatus = "overdue"
)

type TaskPriority string

const (
	TaskPriorityLow    TaskPriority = "low"
	TaskPriorityNormal TaskPriority = "normal"
	TaskPriorityHigh   TaskPriority = "high"
	TaskPriorityUrgent TaskPriority = "urgent"
)

type TaskAssignment struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	RequestID       uint           `json:"request_id" gorm:"not null;index"`
	LicenseType     string         `json:"license_type" gorm:"not null"`
	AssignedToID    uint           `json:"assigned_to_id" gorm:"not null;index"`
	AssignedTo      User           `json:"assigned_to" gorm:"foreignKey:AssignedToID"`
	AssignedByID    uint           `json:"assigned_by_id" gorm:"not null;index"`
	AssignedBy      User           `json:"assigned_by" gorm:"foreignKey:AssignedByID"`
	AssignedRole    UserRole       `json:"assigned_role" gorm:"not null"`
	TaskType        TaskType       `json:"task_type" gorm:"not null"`
	Status          TaskStatus     `json:"status" gorm:"not null;default:'pending'"`
	Priority        TaskPriority   `json:"priority" gorm:"not null;default:'normal'"`
	Deadline        *time.Time     `json:"deadline"`
	AppointmentDate *time.Time     `json:"appointment_date"`
	CompletedAt     *time.Time     `json:"completed_at"`
	Comments        string         `json:"comments"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the TaskAssignment model
func (TaskAssignment) TableName() string {
	return "task_assignments"
}

// IsPending checks if the task is pending
func (ta *TaskAssignment) IsPending() bool {
	return ta.Status == TaskStatusPending
}

// IsInProgress checks if the task is in progress
func (ta *TaskAssignment) IsInProgress() bool {
	return ta.Status == TaskStatusInProgress
}

// IsCompleted checks if the task is completed
func (ta *TaskAssignment) IsCompleted() bool {
	return ta.Status == TaskStatusCompleted
}

// IsCancelled checks if the task is cancelled
func (ta *TaskAssignment) IsCancelled() bool {
	return ta.Status == TaskStatusCancelled
}

// IsOverdue checks if the task is overdue
func (ta *TaskAssignment) IsOverdue() bool {
	return ta.Status == TaskStatusOverdue
}

// CanStart checks if the task can be started
func (ta *TaskAssignment) CanStart() bool {
	return ta.Status == TaskStatusPending
}

// CanComplete checks if the task can be completed
func (ta *TaskAssignment) CanComplete() bool {
	return ta.Status == TaskStatusInProgress
}

// CanCancel checks if the task can be cancelled
func (ta *TaskAssignment) CanCancel() bool {
	return ta.Status == TaskStatusPending || ta.Status == TaskStatusInProgress
}

// GetPriorityDisplayName returns the display name for the priority
func (ta *TaskAssignment) GetPriorityDisplayName() string {
	switch ta.Priority {
	case TaskPriorityLow:
		return "ต่ำ"
	case TaskPriorityNormal:
		return "ปกติ"
	case TaskPriorityHigh:
		return "สูง"
	case TaskPriorityUrgent:
		return "เร่งด่วน"
	default:
		return string(ta.Priority)
	}
}

// GetStatusDisplayName returns the display name for the status
func (ta *TaskAssignment) GetStatusDisplayName() string {
	switch ta.Status {
	case TaskStatusPending:
		return "รอดำเนินการ"
	case TaskStatusInProgress:
		return "กำลังดำเนินการ"
	case TaskStatusCompleted:
		return "เสร็จสิ้น"
	case TaskStatusCancelled:
		return "ยกเลิก"
	case TaskStatusOverdue:
		return "เกินกำหนด"
	default:
		return string(ta.Status)
	}
}

// GetTaskTypeDisplayName returns the display name for the task type
func (ta *TaskAssignment) GetTaskTypeDisplayName() string {
	switch ta.TaskType {
	case TaskTypeReview:
		return "ตรวจสอบคำขอ"
	case TaskTypeInspection:
		return "ตรวจสอบระบบ"
	case TaskTypeReportReview:
		return "ตรวจสอบรายงาน"
	case TaskTypeApproval:
		return "อนุมัติ"
	default:
		return string(ta.TaskType)
	}
}

// IsOverdueDeadline checks if the task deadline has passed
func (ta *TaskAssignment) IsOverdueDeadline() bool {
	if ta.Deadline == nil {
		return false
	}
	return time.Now().After(*ta.Deadline)
}

// GetDaysUntilDeadline returns the number of days until deadline
func (ta *TaskAssignment) GetDaysUntilDeadline() int {
	if ta.Deadline == nil {
		return -1
	}
	duration := ta.Deadline.Sub(time.Now())
	return int(duration.Hours() / 24)
}

// MarkAsCompleted marks the task as completed
func (ta *TaskAssignment) MarkAsCompleted() {
	now := time.Now()
	ta.Status = TaskStatusCompleted
	ta.CompletedAt = &now
}

// MarkAsInProgress marks the task as in progress
func (ta *TaskAssignment) MarkAsInProgress() {
	ta.Status = TaskStatusInProgress
}

// MarkAsCancelled marks the task as cancelled
func (ta *TaskAssignment) MarkAsCancelled() {
	ta.Status = TaskStatusCancelled
}

// MarkAsOverdue marks the task as overdue
func (ta *TaskAssignment) MarkAsOverdue() {
	ta.Status = TaskStatusOverdue
}
