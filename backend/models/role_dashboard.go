package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type RoleDashboard struct {
	ID            uint            `json:"id" gorm:"primaryKey"`
	Role          UserRole        `json:"role" gorm:"not null;index"`
	DashboardName string          `json:"dashboard_name" gorm:"not null"`
	Configuration json.RawMessage `json:"configuration" gorm:"type:jsonb;default:'{}'"`
	DefaultFlag   bool            `json:"is_default" gorm:"default:false"`
	ActiveFlag    bool            `json:"is_active" gorm:"default:true"`
	CreatedByID   uint            `json:"created_by_id" gorm:"not null"`
	CreatedBy     User            `json:"created_by" gorm:"foreignKey:CreatedByID"`
	UpdatedByID   uint            `json:"updated_by_id" gorm:"not null"`
	UpdatedBy     User            `json:"updated_by" gorm:"foreignKey:UpdatedByID"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
	DeletedAt     gorm.DeletedAt  `json:"-" gorm:"index"`
}

// TableName specifies the table name for the RoleDashboard model
func (RoleDashboard) TableName() string {
	return "role_dashboards"
}

// GetConfiguration returns the configuration as a map
func (rd *RoleDashboard) GetConfiguration() map[string]interface{} {
	var configuration map[string]interface{}
	if rd.Configuration != nil {
		json.Unmarshal(rd.Configuration, &configuration)
	}
	return configuration
}

// SetConfiguration sets the configuration from a map
func (rd *RoleDashboard) SetConfiguration(configuration map[string]interface{}) error {
	data, err := json.Marshal(configuration)
	if err != nil {
		return err
	}
	rd.Configuration = data
	return nil
}

// IsActive checks if the dashboard is active
func (rd *RoleDashboard) IsActive() bool {
	return rd.ActiveFlag
}

// IsDefault checks if the dashboard is the default for the role
func (rd *RoleDashboard) IsDefault() bool {
	return rd.DefaultFlag
}

// GetRoleDisplayName returns the display name for the role
func (rd *RoleDashboard) GetRoleDisplayName() string {
	switch rd.Role {
	case RoleAdmin:
		return "ผู้ดูแลระบบ"
	case RoleDEDEHead:
		return "ผู้บริหาร DEDE"
	case RoleDEDEStaff:
		return "เจ้าหน้าที่ DEDE"
	case RoleDEDEConsult:
		return "ที่ปรึกษา DEDE"
	case RoleAuditor:
		return "ผู้ตรวจสอบ"
	default:
		return string(rd.Role)
	}
}
