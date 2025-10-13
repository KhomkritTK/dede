package interfaces

import (
	"eservice-backend/models"
	"time"
)

// OTPRepository defines the interface for OTP data operations
type OTPRepository interface {
	// Basic CRUD operations
	Create(otp *models.OTP) error
	GetByID(id uint) (*models.OTP, error)
	Update(otp *models.OTP) error
	Delete(id uint) error

	// Query operations
	GetByUserID(userID uint) ([]models.OTP, error)
	GetByIdentifier(identifier string) ([]models.OTP, error)
	GetByCode(code string) (*models.OTP, error)
	GetActiveOTP(identifier, purpose string) (*models.OTP, error)
	GetLatestOTP(identifier, purpose string) (*models.OTP, error)

	// OTP validation and verification
	VerifyOTP(identifier, code, purpose string) (*models.OTP, error)
	MarkAsUsed(otpID uint) error
	IncrementAttempts(otpID uint) error
	IsExpired(otpID uint) (bool, error)
	IsUsed(otpID uint) (bool, error)

	// OTP management
	InvalidateOTP(identifier, purpose string) error
	InvalidateUserOTPs(userID uint, purpose string) error
	InvalidateExpiredOTPs() error
	CleanupExpiredOTPs() (int64, error)

	// Rate limiting and security
	GetAttemptCount(identifier, purpose string, within time.Duration) (int, error)
	GetLastOTPTime(identifier, purpose string) (*time.Time, error)
	IsRateLimited(identifier, purpose string) (bool, error)
	BlockIdentifier(identifier, purpose string, until time.Time) error
	IsBlocked(identifier, purpose string) (bool, *time.Time, error)

	// OTP statistics
	GetOTPStats(period string) (*OTPStats, error)
	GetOTPUsageByPurpose(period string) ([]OTPUsageByPurpose, error)
	GetOTPFailureRate(period string) (float64, error)

	// Advanced queries
	GetOTPHistory(userID uint, filters OTPHistoryFilters) ([]models.OTP, int64, error)
	GetPendingOTPs() ([]models.OTP, error)
	GetOTPsWithPagination(filters OTPFilters, page, limit int) ([]models.OTP, int64, error)
}

// OTPFilters represents filters for OTP queries
type OTPFilters struct {
	UserID        *uint
	Identifier    string
	OTPType       models.OTPType
	Purpose       models.OTPPurpose
	IsUsed        *bool
	CreatedAfter  *time.Time
	CreatedBefore *time.Time
	ExpiresAfter  *time.Time
	ExpiresBefore *time.Time
	SortBy        string
	SortDesc      bool
}

// OTPHistoryFilters represents filters for OTP history queries
type OTPHistoryFilters struct {
	UserID     *uint
	Purpose    models.OTPPurpose
	OTPType    models.OTPType
	IsVerified *bool
	IsUsed     *bool
	StartDate  *time.Time
	EndDate    *time.Time
	Page       int
	Limit      int
	SortBy     string
	SortDesc   bool
}

// OTPStats represents OTP statistics
type OTPStats struct {
	TotalGenerated int64   `json:"total_generated"`
	TotalVerified  int64   `json:"total_verified"`
	TotalUsed      int64   `json:"total_used"`
	TotalExpired   int64   `json:"total_expired"`
	TotalFailed    int64   `json:"total_failed"`
	SuccessRate    float64 `json:"success_rate"`
	AverageTime    int64   `json:"average_time_seconds"`
	GeneratedToday int64   `json:"generated_today"`
	GeneratedWeek  int64   `json:"generated_week"`
	GeneratedMonth int64   `json:"generated_month"`
}

// OTPUsageByPurpose represents OTP usage by purpose
type OTPUsageByPurpose struct {
	Purpose      string  `json:"purpose"`
	Count        int64   `json:"count"`
	SuccessCount int64   `json:"success_count"`
	FailureCount int64   `json:"failure_count"`
	SuccessRate  float64 `json:"success_rate"`
}

// OTPConfig represents OTP configuration
type OTPConfig struct {
	CodeLength      int    `json:"code_length"`
	ExpiryMinutes   int    `json:"expiry_minutes"`
	MaxAttempts     int    `json:"max_attempts"`
	ResendCooldown  int    `json:"resend_cooldown"`   // in minutes
	RateLimitWindow int    `json:"rate_limit_window"` // in minutes
	MaxOTPPerWindow int    `json:"max_otp_per_window"`
	BlockDuration   int    `json:"block_duration"` // in minutes
	EmailTemplate   string `json:"email_template"`
	SMSTemplate     string `json:"sms_template"`
}

// OTPConfigRepository defines the interface for OTP configuration operations
type OTPConfigRepository interface {
	GetConfig() (*OTPConfig, error)
	UpdateConfig(config *OTPConfig) error
	GetDefaultConfig() *OTPConfig
	ValidateConfig(config *OTPConfig) error
}
