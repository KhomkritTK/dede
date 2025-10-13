package interfaces

import (
	"eservice-backend/models"
	"time"
)

// CorporateRepository defines the interface for corporate data operations
type CorporateRepository interface {
	// Basic CRUD operations
	Create(corporate *models.Corporate) error
	GetByID(id uint) (*models.Corporate, error)
	GetByRegistrationNumber(regNumber string) (*models.Corporate, error)
	GetByTaxID(taxID string) (*models.Corporate, error)
	Update(corporate *models.Corporate) error
	Delete(id uint) error

	// Query operations
	GetAll() ([]models.Corporate, error)
	GetByStatus(status models.CorporateStatus) ([]models.Corporate, error)
	GetByType(corporateType models.CorporateType) ([]models.Corporate, error)
	GetByAdminUserID(adminUserID uint) ([]models.Corporate, error)

	// Search and filtering
	Search(query string) ([]models.Corporate, error)
	Filter(filters CorporateFilters) ([]models.Corporate, error)
	GetWithPagination(filters CorporateFilters, page, limit int) ([]models.Corporate, int64, error)

	// Corporate verification
	VerifyCorporate(id uint, verifiedBy uint, notes string) error
	GetUnverifiedCorporates() ([]models.Corporate, error)

	// Corporate statistics
	GetCorporateStats() (*CorporateStats, error)
	GetCorporateGrowth(period string) ([]CorporateGrowth, error)
}

// CorporateMemberRepository defines the interface for corporate member data operations
type CorporateMemberRepository interface {
	// Basic CRUD operations
	Create(member *models.CorporateMember) error
	GetByID(id uint) (*models.CorporateMember, error)
	Update(member *models.CorporateMember) error
	Delete(id uint) error

	// Query operations
	GetByCorporateID(corporateID uint) ([]models.CorporateMember, error)
	GetByUserID(userID uint) ([]models.CorporateMember, error)
	GetByCorporateAndUser(corporateID, userID uint) (*models.CorporateMember, error)
	GetActiveMembers(corporateID uint) ([]models.CorporateMember, error)
	GetPendingMembers(corporateID uint) ([]models.CorporateMember, error)

	// Invitation operations
	GetByInvitationToken(token string) (*models.CorporateMember, error)
	GetPendingInvitations(corporateID uint) ([]models.CorporateMember, error)
	GetInvitationsByEmail(email string) ([]models.CorporateMember, error)
	CleanupExpiredInvitations() error

	// Member management
	AcceptInvitation(memberID uint) error
	DeclineInvitation(memberID uint) error
	RemoveMember(corporateID, userID uint) error
	UpdateMemberRole(memberID uint, role models.MemberRole) error

	// Member statistics
	GetMemberCount(corporateID uint) (int64, error)
	GetMemberStats(corporateID uint) (*MemberStats, error)
}

// CorporateFilters represents filters for corporate queries
type CorporateFilters struct {
	Search         string
	Status         models.CorporateStatus
	CorporateType  models.CorporateType
	IndustryType   string
	Province       string
	VerifiedAfter  *time.Time
	VerifiedBefore *time.Time
	CreatedAfter   *time.Time
	CreatedBefore  *time.Time
	AdminUserID    *uint
	SortBy         string
	SortDesc       bool
}

// CorporateStats represents corporate statistics
type CorporateStats struct {
	TotalCorporates    int64 `json:"total_corporates"`
	ActiveCorporates   int64 `json:"active_corporates"`
	PendingCorporates  int64 `json:"pending_corporates"`
	VerifiedCorporates int64 `json:"verified_corporates"`
	NewCorporatesToday int64 `json:"new_corporates_today"`
	NewCorporatesWeek  int64 `json:"new_corporates_week"`
	NewCorporatesMonth int64 `json:"new_corporates_month"`
}

// CorporateGrowth represents corporate growth data
type CorporateGrowth struct {
	Period string `json:"period"`
	Count  int64  `json:"count"`
}

// MemberStats represents member statistics
type MemberStats struct {
	TotalMembers    int64                       `json:"total_members"`
	ActiveMembers   int64                       `json:"active_members"`
	PendingMembers  int64                       `json:"pending_members"`
	MembersByRole   map[models.MemberRole]int64 `json:"members_by_role"`
	NewMembersToday int64                       `json:"new_members_today"`
	NewMembersWeek  int64                       `json:"new_members_week"`
	NewMembersMonth int64                       `json:"new_members_month"`
}
