package dto

import (
	"eservice-backend/service/auth/dto"
	"time"
)

// CorporateResponse represents the corporate response
type CorporateResponse struct {
	ID                 uint              `json:"id"`
	CorporateName      string            `json:"corporate_name"`
	CorporateNameEn    string            `json:"corporate_name_en"`
	RegistrationNumber string            `json:"registration_number"`
	TaxID              string            `json:"tax_id"`
	CorporateType      string            `json:"corporate_type"`
	IndustryType       string            `json:"industry_type"`
	Address            string            `json:"address"`
	Province           string            `json:"province"`
	District           string            `json:"district"`
	Subdistrict        string            `json:"subdistrict"`
	PostalCode         string            `json:"postal_code"`
	Phone              string            `json:"phone"`
	Email              string            `json:"email"`
	Website            string            `json:"website"`
	Description        string            `json:"description"`
	Status             string            `json:"status"`
	VerifiedAt         *time.Time        `json:"verified_at"`
	AdminUserID        *uint             `json:"admin_user_id"`
	CreatedAt          time.Time         `json:"created_at"`
	UpdatedAt          time.Time         `json:"updated_at"`
	AdminUser          *dto.UserInfo     `json:"admin_user,omitempty"`
	Members            []CorporateMember `json:"members,omitempty"`
	MemberCount        int               `json:"member_count"`
}

// CreateCorporateRequest represents the request to create a corporate
type CreateCorporateRequest struct {
	CorporateName      string `json:"corporate_name" binding:"required,min=1,max=200"`
	CorporateNameEn    string `json:"corporate_name_en"`
	RegistrationNumber string `json:"registration_number" binding:"required"`
	TaxID              string `json:"tax_id"`
	CorporateType      string `json:"corporate_type" binding:"required,oneof=company partnership sole_proprietorship limited_company public_company state_owned"`
	IndustryType       string `json:"industry_type"`
	Address            string `json:"address" binding:"required"`
	Province           string `json:"province" binding:"required"`
	District           string `json:"district" binding:"required"`
	Subdistrict        string `json:"subdistrict" binding:"required"`
	PostalCode         string `json:"postal_code" binding:"required"`
	Phone              string `json:"phone"`
	Email              string `json:"email"`
	Website            string `json:"website"`
	Description        string `json:"description"`
}

// UpdateCorporateRequest represents the request to update a corporate
type UpdateCorporateRequest struct {
	CorporateName   string `json:"corporate_name"`
	CorporateNameEn string `json:"corporate_name_en"`
	TaxID           string `json:"tax_id"`
	IndustryType    string `json:"industry_type"`
	Address         string `json:"address"`
	Province        string `json:"province"`
	District        string `json:"district"`
	Subdistrict     string `json:"subdistrict"`
	PostalCode      string `json:"postal_code"`
	Phone           string `json:"phone"`
	Email           string `json:"email"`
	Website         string `json:"website"`
	Description     string `json:"description"`
}

// ListCorporatesRequest represents the request to list corporates
type ListCorporatesRequest struct {
	Page     int    `json:"page" form:"page"`
	Limit    int    `json:"limit" form:"limit"`
	Search   string `json:"search" form:"search"`
	Status   string `json:"status" form:"status"`
	Type     string `json:"type" form:"type"`
	SortBy   string `json:"sort_by" form:"sort_by"`
	SortDesc bool   `json:"sort_desc" form:"sort_desc"`
}

// ListCorporatesResponse represents the response for listing corporates
type ListCorporatesResponse struct {
	Corporates []CorporateResponse `json:"corporates"`
	Pagination PaginationInfo      `json:"pagination"`
}

// CorporateMember represents a corporate member
type CorporateMember struct {
	ID         uint          `json:"id"`
	UserID     uint          `json:"user_id"`
	User       *dto.UserInfo `json:"user,omitempty"`
	MemberRole string        `json:"member_role"`
	Position   string        `json:"position"`
	Department string        `json:"department"`
	Status     string        `json:"status"`
	JoinedAt   *time.Time    `json:"joined_at"`
	LeftAt     *time.Time    `json:"left_at"`
	CreatedAt  time.Time     `json:"created_at"`
	UpdatedAt  time.Time     `json:"updated_at"`
}

// CorporateMemberResponse represents the corporate member response
type CorporateMemberResponse struct {
	CorporateMember
	CorporateID uint `json:"corporate_id"`
}

// AddMemberRequest represents the request to add a member
type AddMemberRequest struct {
	UserID     uint   `json:"user_id" binding:"required"`
	MemberRole string `json:"member_role" binding:"required,oneof=admin manager member viewer"`
	Position   string `json:"position"`
	Department string `json:"department"`
}

// UpdateMemberRequest represents the request to update a member
type UpdateMemberRequest struct {
	MemberRole string `json:"member_role" binding:"omitempty,oneof=admin manager member viewer"`
	Position   string `json:"position"`
	Department string `json:"department"`
}

// ListMembersRequest represents the request to list members
type ListMembersRequest struct {
	Page       int    `json:"page" form:"page"`
	Limit      int    `json:"limit" form:"limit"`
	Search     string `json:"search" form:"search"`
	Status     string `json:"status" form:"status"`
	MemberRole string `json:"member_role" form:"member_role"`
	SortBy     string `json:"sort_by" form:"sort_by"`
	SortDesc   bool   `json:"sort_desc" form:"sort_desc"`
}

// ListMembersResponse represents the response for listing members
type ListMembersResponse struct {
	Members    []CorporateMember `json:"members"`
	Pagination PaginationInfo    `json:"pagination"`
}

// InviteMemberRequest represents the request to invite a member
type InviteMemberRequest struct {
	Email      string `json:"email" binding:"required,email"`
	MemberRole string `json:"member_role" binding:"required,oneof=admin manager member viewer"`
	Position   string `json:"position"`
	Department string `json:"department"`
	Message    string `json:"message"`
}

// InvitationResponse represents the invitation response
type InvitationResponse struct {
	ID                       uint               `json:"id"`
	CorporateID              uint               `json:"corporate_id"`
	Corporate                *CorporateResponse `json:"corporate,omitempty"`
	UserID                   *uint              `json:"user_id"`
	User                     *dto.UserInfo      `json:"user,omitempty"`
	MemberRole               string             `json:"member_role"`
	Position                 string             `json:"position"`
	Department               string             `json:"department"`
	Status                   string             `json:"status"`
	InvitedBy                *uint              `json:"invited_by"`
	InvitedByUser            *dto.UserInfo      `json:"invited_by_user,omitempty"`
	InvitationToken          string             `json:"invitation_token"`
	InvitationTokenExpiresAt *time.Time         `json:"invitation_token_expires_at"`
	InvitedAt                time.Time          `json:"invited_at"`
	JoinedAt                 *time.Time         `json:"joined_at"`
	LeftAt                   *time.Time         `json:"left_at"`
	CreatedAt                time.Time          `json:"created_at"`
	UpdatedAt                time.Time          `json:"updated_at"`
}

// ListInvitationsRequest represents the request to list invitations
type ListInvitationsRequest struct {
	Page     int    `json:"page" form:"page"`
	Limit    int    `json:"limit" form:"limit"`
	Status   string `json:"status" form:"status"`
	SortBy   string `json:"sort_by" form:"sort_by"`
	SortDesc bool   `json:"sort_desc" form:"sort_desc"`
}

// ListInvitationsResponse represents the response for listing invitations
type ListInvitationsResponse struct {
	Invitations []InvitationResponse `json:"invitations"`
	Pagination  PaginationInfo       `json:"pagination"`
}

// AcceptInvitationRequest represents the request to accept an invitation
type AcceptInvitationRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required,min=1,max=100"`
	Phone    string `json:"phone"`
	OTPCode  string `json:"otp_code" binding:"required,len=6"`
}

// VerifyCorporateRequest represents the request to verify a corporate
type VerifyCorporateRequest struct {
	VerificationNotes string   `json:"verification_notes"`
	Documents         []string `json:"documents"`
}

// VerificationStatusResponse represents the verification status response
type VerificationStatusResponse struct {
	Status            string     `json:"status"`
	VerifiedAt        *time.Time `json:"verified_at"`
	VerifiedBy        *uint      `json:"verified_by"`
	VerificationNotes string     `json:"verification_notes"`
	Documents         []string   `json:"documents"`
}

// CorporateSettings represents corporate settings
type CorporateSettings struct {
	AllowMemberInvitation bool     `json:"allow_member_invitation"`
	RequireApproval       bool     `json:"require_approval"`
	DefaultMemberRole     string   `json:"default_member_role"`
	AllowedDomains        []string `json:"allowed_domains"`
	MaxMembers            int      `json:"max_members"`
}

// CorporateSettingsResponse represents the corporate settings response
type CorporateSettingsResponse struct {
	Settings CorporateSettings `json:"settings"`
}

// UpdateCorporateSettingsRequest represents the request to update corporate settings
type UpdateCorporateSettingsRequest struct {
	Settings CorporateSettings `json:"settings" binding:"required"`
}

// UpdateMemberRoleRequest represents the request to update member role
type UpdateMemberRoleRequest struct {
	MemberRole string `json:"member_role" binding:"required,oneof=admin manager member viewer"`
}

// MemberPermissionsResponse represents the member permissions response
type MemberPermissionsResponse struct {
	CanViewMembers    bool `json:"can_view_members"`
	CanAddMembers     bool `json:"can_add_members"`
	CanRemoveMembers  bool `json:"can_remove_members"`
	CanUpdateMembers  bool `json:"can_update_members"`
	CanManageSettings bool `json:"can_manage_settings"`
	CanViewReports    bool `json:"can_view_reports"`
	CanManageLicenses bool `json:"can_manage_licenses"`
}

// PaginationInfo represents pagination information
type PaginationInfo struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}
