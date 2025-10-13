package models

import (
	"time"
)

// CorporateType represents the type of corporate entity
type CorporateType string

const (
	CorporateTypeCompany        CorporateType = "company"
	CorporateTypePartnership    CorporateType = "partnership"
	CorporateTypeSoleProprietor CorporateType = "sole_proprietorship"
	CorporateTypeLimitedCompany CorporateType = "limited_company"
	CorporateTypePublicCompany  CorporateType = "public_company"
	CorporateStateOwned         CorporateType = "state_owned"
)

// CorporateStatus represents the status of a corporate entity
type CorporateStatus string

const (
	CorporateStatusPending   CorporateStatus = "pending"
	CorporateStatusActive    CorporateStatus = "active"
	CorporateStatusSuspended CorporateStatus = "suspended"
	CorporateStatusRejected  CorporateStatus = "rejected"
	CorporateStatusInactive  CorporateStatus = "inactive"
)

// Corporate represents a corporate entity
type Corporate struct {
	BaseModel
	CorporateName      string            `json:"corporate_name" gorm:"not null"`
	CorporateNameEn    string            `json:"corporate_name_en"`
	RegistrationNumber string            `json:"registration_number" gorm:"uniqueIndex;not null"`
	TaxID              string            `json:"tax_id" gorm:"uniqueIndex"`
	CorporateType      CorporateType     `json:"corporate_type" gorm:"not null"`
	IndustryType       string            `json:"industry_type"`
	Address            string            `json:"address" gorm:"not null"`
	Province           string            `json:"province" gorm:"not null"`
	District           string            `json:"district" gorm:"not null"`
	Subdistrict        string            `json:"subdistrict" gorm:"not null"`
	PostalCode         string            `json:"postal_code" gorm:"not null"`
	Phone              string            `json:"phone"`
	Email              string            `json:"email"`
	Website            string            `json:"website"`
	Description        string            `json:"description"`
	Status             CorporateStatus   `json:"status" gorm:"not null;default:'pending'"`
	VerifiedAt         *time.Time        `json:"verified_at"`
	AdminUserID        *uint             `json:"admin_user_id"`
	AdminUser          *User             `json:"admin_user,omitempty" gorm:"foreignKey:AdminUserID"`
	Members            []CorporateMember `json:"members,omitempty" gorm:"foreignKey:CorporateID"`
}

// TableName specifies the table name for the Corporate model
func (Corporate) TableName() string {
	return "corporates"
}

// IsVerified checks if the corporate is verified
func (c *Corporate) IsVerified() bool {
	return c.VerifiedAt != nil
}

// IsActive checks if the corporate is active
func (c *Corporate) IsActive() bool {
	return c.Status == CorporateStatusActive
}

// CanAddMembers checks if the corporate can add members
func (c *Corporate) CanAddMembers() bool {
	return c.IsActive() && c.IsVerified()
}

// GetFullName returns the appropriate corporate name based on language preference
func (c *Corporate) GetFullName(useEnglish bool) string {
	if useEnglish && c.CorporateNameEn != "" {
		return c.CorporateNameEn
	}
	return c.CorporateName
}
