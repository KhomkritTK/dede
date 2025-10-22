package models

import (
	"database/sql/driver"
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

// Value implements the driver.Valuer interface for UserRole
func (ur UserRole) Value() (driver.Value, error) {
	return string(ur), nil
}

// Scan implements the sql.Scanner interface for UserRole
func (ur *UserRole) Scan(value interface{}) error {
	if value == nil {
		*ur = ""
		return nil
	}
	if str, ok := value.(string); ok {
		*ur = UserRole(str)
		return nil
	}
	return nil
}

type UserStatus string

const (
	UserStatusActive    UserStatus = "active"
	UserStatusInactive  UserStatus = "inactive"
	UserStatusSuspended UserStatus = "suspended"
)

// Value implements the driver.Valuer interface for UserStatus
func (us UserStatus) Value() (driver.Value, error) {
	return string(us), nil
}

// Scan implements the sql.Scanner interface for UserStatus
func (us *UserStatus) Scan(value interface{}) error {
	if value == nil {
		*us = ""
		return nil
	}
	if str, ok := value.(string); ok {
		*us = UserStatus(str)
		return nil
	}
	return nil
}

type User struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	Username      string         `json:"username" gorm:"uniqueIndex;not null"`
	Email         string         `json:"email" gorm:"uniqueIndex;not null"`
	Password      string         `json:"-" gorm:"not null"`
	FullName      string         `json:"full_name" gorm:"not null"`
	Role          UserRole       `json:"role" gorm:"not null;default:'user'"`
	Status        UserStatus     `json:"status" gorm:"not null;default:'active'"`
	Phone         string         `json:"phone"`
	Company       string         `json:"company"`
	Address       string         `json:"address"`
	EmailVerified bool           `json:"email_verified" gorm:"default:false"`
	PhoneVerified bool           `json:"phone_verified" gorm:"default:false"`
	LastLoginAt   *time.Time     `json:"last_login_at"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships - temporarily removed Profile relationship
	// Profile        *UserProfile      `json:"profile,omitempty" gorm:"foreignKey:UserID"`
	Corporates     []Corporate       `json:"corporates,omitempty" gorm:"foreignKey:AdminUserID"`
	MemberOf       []CorporateMember `json:"member_of,omitempty" gorm:"foreignKey:UserID"`
	InvitedMembers []CorporateMember `json:"invited_members,omitempty" gorm:"foreignKey:InvitedBy"`
	OTPs           []OTP             `json:"otps,omitempty" gorm:"foreignKey:UserID"`
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
