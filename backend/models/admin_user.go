package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type AdminRole string

const (
	AdminRoleSystemAdmin      AdminRole = "system_admin"
	AdminRoleDEDEHeadAdmin    AdminRole = "dede_head_admin"
	AdminRoleDEDEStaffAdmin   AdminRole = "dede_staff_admin"
	AdminRoleDEDEConsultAdmin AdminRole = "dede_consult_admin"
	AdminRoleAuditorAdmin     AdminRole = "auditor_admin"
)

// AdminUser represents an admin user with specific permissions
type AdminUser struct {
	ID          uint            `json:"id" gorm:"primaryKey"`
	UserID      uint            `json:"user_id" gorm:"not null;uniqueIndex"`
	User        User            `json:"user" gorm:"foreignKey:UserID"`
	AdminRole   AdminRole       `json:"admin_role" gorm:"not null;default:'admin'"`
	Department  string          `json:"department"`
	Permissions json.RawMessage `json:"permissions" gorm:"type:jsonb;default:'{}'"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	DeletedAt   gorm.DeletedAt  `json:"-" gorm:"index"`
}

// TableName specifies the table name for the AdminUser model
func (AdminUser) TableName() string {
	return "admin_users"
}

// GetPermissions returns the permissions as a map
func (au *AdminUser) GetPermissions() map[string][]string {
	var permissions map[string][]string
	if au.Permissions != nil {
		json.Unmarshal(au.Permissions, &permissions)
	}
	return permissions
}

// SetPermissions sets the permissions from a map
func (au *AdminUser) SetPermissions(permissions map[string][]string) error {
	data, err := json.Marshal(permissions)
	if err != nil {
		return err
	}
	au.Permissions = data
	return nil
}

// HasPermission checks if the admin user has a specific permission
func (au *AdminUser) HasPermission(resource, action string) bool {
	permissions := au.GetPermissions()
	for resourceKey, actions := range permissions {
		if resourceKey == resource {
			for _, act := range actions {
				if act == action || act == "*" {
					return true
				}
			}
		}
	}
	return false
}

// CanManageUsers checks if the admin can manage users
func (au *AdminUser) CanManageUsers() bool {
	return au.AdminRole == AdminRoleSystemAdmin || au.HasPermission("users", "create")
}

// CanManageLicenses checks if the admin can manage licenses
func (au *AdminUser) CanManageLicenses() bool {
	return au.HasPermission("licenses", "update") || au.HasPermission("licenses", "delete")
}

// CanManageInspections checks if the admin can manage inspections
func (au *AdminUser) CanManageInspections() bool {
	return au.HasPermission("inspections", "create") || au.HasPermission("inspections", "update")
}

// CanManageAudits checks if the admin can manage audits
func (au *AdminUser) CanManageAudits() bool {
	return au.HasPermission("audits", "create") || au.HasPermission("audits", "update")
}

// CanViewReports checks if the admin can view reports
func (au *AdminUser) CanViewReports() bool {
	return au.HasPermission("reports", "read")
}

// GetRoleDisplayName returns the display name for the admin role
func (au *AdminUser) GetRoleDisplayName() string {
	switch au.AdminRole {
	case AdminRoleSystemAdmin:
		return "ผู้ดูแลระบบ"
	case AdminRoleDEDEHeadAdmin:
		return "ผู้บริหาร DEDE"
	case AdminRoleDEDEStaffAdmin:
		return "เจ้าหน้าที่ DEDE"
	case AdminRoleDEDEConsultAdmin:
		return "ที่ปรึกษา DEDE"
	case AdminRoleAuditorAdmin:
		return "ผู้ตรวจสอบ"
	default:
		return "ผู้ดูแลระบบ"
	}
}
