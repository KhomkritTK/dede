package interfaces

import (
	"eservice-backend/models"
	"time"
)

// UserProfileRepository defines the interface for user profile data operations
type UserProfileRepository interface {
	// Basic CRUD operations
	Create(profile *models.UserProfile) error
	GetByID(id uint) (*models.UserProfile, error)
	GetByUserID(userID uint) (*models.UserProfile, error)
	Update(profile *models.UserProfile) error
	Delete(id uint) error

	// Query operations
	GetAll() ([]models.UserProfile, error)
	GetByNationalID(nationalID string) (*models.UserProfile, error)
	GetByPassportNumber(passportNumber string) (*models.UserProfile, error)
	GetByDateOfBirth(dob time.Time) ([]models.UserProfile, error)
	GetByGender(gender models.Gender) ([]models.UserProfile, error)
	GetByNationality(nationality string) ([]models.UserProfile, error)

	// Search and filtering
	Search(query string) ([]models.UserProfile, error)
	Filter(filters UserProfileFilters) ([]models.UserProfile, error)
	GetWithPagination(filters UserProfileFilters, page, limit int) ([]models.UserProfile, int64, error)

	// Profile completion
	GetIncompleteProfiles() ([]models.UserProfile, error)
	GetCompleteProfiles() ([]models.UserProfile, error)
	CalculateCompletionPercentage(userID uint) (int, error)
	GetMissingFields(userID uint) ([]string, error)

	// Profile verification
	UpdateEmailVerification(userID uint, verified bool) error
	UpdatePhoneVerification(userID uint, verified bool) error
	GetVerifiedUsers() ([]models.UserProfile, error)
	GetUnverifiedUsers() ([]models.UserProfile, error)

	// Profile statistics
	GetProfileStats() (*ProfileStats, error)
	GetCompletionStats() (*CompletionStats, error)
	GetDemographicsStats() (*DemographicsStats, error)
}

// UserRepository defines the interface for user data operations (extended)
type UserRepository interface {
	// Basic CRUD operations
	Create(user *models.User) error
	GetByID(id uint) (*models.User, error)
	GetByUsername(username string) (*models.User, error)
	GetByEmail(email string) (*models.User, error)
	Update(user *models.User) error
	Delete(id uint) error

	// Query operations
	GetAll() ([]models.User, error)
	GetByRole(role models.UserRole) ([]models.User, error)
	GetActiveUsers() ([]models.User, error)
	GetInactiveUsers() ([]models.User, error)
	GetSuspendedUsers() ([]models.User, error)
	GetVerifiedUsers() ([]models.User, error)
	GetUnverifiedUsers() ([]models.User, error)

	// Search and filtering
	SearchUsers(query string) ([]models.User, error)
	FilterUsers(filters UserFilters) ([]models.User, error)
	GetUsersWithPagination(filters UserFilters, page, limit int) ([]models.User, int64, error)

	// User management
	UpdateStatus(id uint, status models.UserStatus) error
	UpdateRole(id uint, role models.UserRole) error
	UpdateLastLogin(id uint) error
	BanUser(id uint, reason string) error
	UnbanUser(id uint) error

	// User verification
	VerifyEmail(userID uint) error
	VerifyPhone(userID uint) error

	// User statistics
	GetUserStats() (*UserStats, error)
	GetUserGrowth(period string) ([]UserGrowth, error)
	GetUserActivityStats(period string) (*UserActivityStats, error)

	// Corporate relations
	GetCorporateMembers(userID uint) ([]models.CorporateMember, error)
	GetCorporateAdmins(userID uint) ([]models.Corporate, error)
}

// UserProfileFilters represents filters for user profile queries
type UserProfileFilters struct {
	Search        string
	Gender        *models.Gender
	Nationality   string
	Province      string
	District      string
	HasNationalID *bool
	HasPassport   *bool
	IsVerified    *bool
	MinAge        *int
	MaxAge        *int
	CreatedAfter  *time.Time
	CreatedBefore *time.Time
	UpdatedAfter  *time.Time
	UpdatedBefore *time.Time
	SortBy        string
	SortDesc      bool
}

// UserFilters represents filters for user queries
type UserFilters struct {
	Search          string
	Role            *models.UserRole
	Status          *models.UserStatus
	EmailVerified   *bool
	PhoneVerified   *bool
	CreatedAfter    *time.Time
	CreatedBefore   *time.Time
	LastLoginAfter  *time.Time
	LastLoginBefore *time.Time
	SortBy          string
	SortDesc        bool
}

// ProfileStats represents profile statistics
type ProfileStats struct {
	TotalProfiles        int64 `json:"total_profiles"`
	CompleteProfiles     int64 `json:"complete_profiles"`
	IncompleteProfiles   int64 `json:"incomplete_profiles"`
	VerifiedProfiles     int64 `json:"verified_profiles"`
	WithNationalID       int64 `json:"with_national_id"`
	WithPassport         int64 `json:"with_passport"`
	WithEmergencyContact int64 `json:"with_emergency_contact"`
}

// CompletionStats represents profile completion statistics
type CompletionStats struct {
	AverageCompletion   float64          `json:"average_completion"`
	CompletionRanges    map[string]int64 `json:"completion_ranges"`
	MissingFields       map[string]int64 `json:"missing_fields"`
	MostCompleteFields  []string         `json:"most_complete_fields"`
	LeastCompleteFields []string         `json:"least_complete_fields"`
}

// DemographicsStats represents demographics statistics
type DemographicsStats struct {
	GenderDistribution      map[models.Gender]int64 `json:"gender_distribution"`
	AgeDistribution         map[string]int64        `json:"age_distribution"`
	NationalityDistribution map[string]int64        `json:"nationality_distribution"`
	ProvinceDistribution    map[string]int64        `json:"province_distribution"`
}

// UserStats represents user statistics
type UserStats struct {
	TotalUsers     int64 `json:"total_users"`
	ActiveUsers    int64 `json:"active_users"`
	InactiveUsers  int64 `json:"inactive_users"`
	SuspendedUsers int64 `json:"suspended_users"`
	VerifiedUsers  int64 `json:"verified_users"`
	EmailVerified  int64 `json:"email_verified"`
	PhoneVerified  int64 `json:"phone_verified"`
	NewUsersToday  int64 `json:"new_users_today"`
	NewUsersWeek   int64 `json:"new_users_week"`
	NewUsersMonth  int64 `json:"new_users_month"`
}

// UserGrowth represents user growth data
type UserGrowth struct {
	Period string `json:"period"`
	Count  int64  `json:"count"`
}

// UserActivityStats represents user activity statistics
type UserActivityStats struct {
	DailyActiveUsers       int64            `json:"daily_active_users"`
	WeeklyActiveUsers      int64            `json:"weekly_active_users"`
	MonthlyActiveUsers     int64            `json:"monthly_active_users"`
	AverageSessionDuration int64            `json:"average_session_duration_seconds"`
	LastLoginDistribution  map[string]int64 `json:"last_login_distribution"`
}
