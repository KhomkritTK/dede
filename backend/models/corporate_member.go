package models

import (
	"time"
)

// MemberRole represents the role of a corporate member
type MemberRole string

const (
	MemberRoleAdmin   MemberRole = "admin"
	MemberRoleManager MemberRole = "manager"
	MemberRoleMember  MemberRole = "member"
	MemberRoleViewer  MemberRole = "viewer"
)

// MemberStatus represents the status of a corporate member
type MemberStatus string

const (
	MemberStatusPending  MemberStatus = "pending"
	MemberStatusActive   MemberStatus = "active"
	MemberStatusDeclined MemberStatus = "declined"
	MemberStatusLeft     MemberStatus = "left"
)

// CorporateMember represents a corporate member relationship
type CorporateMember struct {
	BaseModel
	CorporateID              uint         `json:"corporate_id" gorm:"not null"`
	Corporate                *Corporate   `json:"corporate,omitempty" gorm:"foreignKey:CorporateID"`
	UserID                   uint         `json:"user_id" gorm:"not null"`
	User                     *User        `json:"user,omitempty" gorm:"foreignKey:UserID"`
	MemberRole               MemberRole   `json:"member_role" gorm:"not null;default:'member'"`
	Position                 string       `json:"position"`
	Department               string       `json:"department"`
	Status                   MemberStatus `json:"status" gorm:"not null;default:'pending'"`
	InvitedBy                *uint        `json:"invited_by"`
	InvitedByUser            *User        `json:"invited_by_user,omitempty" gorm:"foreignKey:InvitedBy"`
	InvitationToken          string       `json:"invitation_token" gorm:"uniqueIndex"`
	InvitationTokenExpiresAt *time.Time   `json:"invitation_token_expires_at"`
	InvitedAt                time.Time    `json:"invited_at" gorm:"default:CURRENT_TIMESTAMP"`
	JoinedAt                 *time.Time   `json:"joined_at"`
	LeftAt                   *time.Time   `json:"left_at"`
}

// TableName specifies the table name for the CorporateMember model
func (CorporateMember) TableName() string {
	return "corporate_members"
}

// IsActive checks if the member is active
func (cm *CorporateMember) IsActive() bool {
	return cm.Status == MemberStatusActive
}

// IsPending checks if the member is pending
func (cm *CorporateMember) IsPending() bool {
	return cm.Status == MemberStatusPending
}

// IsInvitationExpired checks if the invitation token has expired
func (cm *CorporateMember) IsInvitationExpired() bool {
	if cm.InvitationTokenExpiresAt == nil {
		return false
	}
	return time.Now().After(*cm.InvitationTokenExpiresAt)
}

// CanManageMembers checks if the member can manage other members
func (cm *CorporateMember) CanManageMembers() bool {
	return cm.IsActive() && (cm.MemberRole == MemberRoleAdmin || cm.MemberRole == MemberRoleManager)
}

// CanViewCorporateInfo checks if the member can view corporate information
func (cm *CorporateMember) CanViewCorporateInfo() bool {
	return cm.IsActive() || cm.IsPending()
}

// AcceptInvitation marks the member as joined
func (cm *CorporateMember) AcceptInvitation() {
	now := time.Now()
	cm.Status = MemberStatusActive
	cm.JoinedAt = &now
	cm.InvitationToken = ""
	cm.InvitationTokenExpiresAt = nil
}

// DeclineInvitation marks the member as declined
func (cm *CorporateMember) DeclineInvitation() {
	cm.Status = MemberStatusDeclined
	cm.InvitationToken = ""
	cm.InvitationTokenExpiresAt = nil
}

// LeaveCorporate marks the member as left
func (cm *CorporateMember) LeaveCorporate() {
	now := time.Now()
	cm.Status = MemberStatusLeft
	cm.LeftAt = &now
}
