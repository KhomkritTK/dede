package models

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleUser        UserRole = "user"
	RoleAdmin       UserRole = "admin"
	RoleDEDEHead    UserRole = "dede_head"
	RoleDEDEStaff   UserRole = "dede_staff"
	RoleDEDEConsult UserRole = "dede_consult"
	RoleAuditor     UserRole = "auditor"
)

type UserStatus string

const (
	UserStatusActive    UserStatus = "active"
	UserStatusInactive  UserStatus = "inactive"
	UserStatusSuspended UserStatus = "suspended"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"uniqueIndex;not null"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	FullName  string         `json:"full_name" gorm:"not null"`
	Role      UserRole       `json:"role" gorm:"not null;default:'user'"`
	Status    UserStatus     `json:"status" gorm:"not null;default:'active'"`
	Phone     string         `json:"phone"`
	Company   string         `json:"company"`
	Address   string         `json:"address"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the User model
func (User) TableName() string {
	return "users"
}

// IsRole checks if the user has a specific role
func (u *User) IsRole(role UserRole) bool {
	return u.Role == role
}

// IsAdmin checks if the user is an admin
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

// IsDEDE checks if the user is any DEDE role
func (u *User) IsDEDE() bool {
	return u.Role == RoleDEDEHead || u.Role == RoleDEDEStaff || u.Role == RoleDEDEConsult || u.Role == RoleAuditor
}

// IsActive checks if the user is active
func (u *User) IsActive() bool {
	return u.Status == UserStatusActive
}
