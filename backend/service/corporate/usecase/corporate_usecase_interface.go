package usecase

import (
	"eservice-backend/service/corporate/dto"
)

// CorporateUsecase defines the interface for corporate business logic
type CorporateUsecase interface {
	// Corporate management
	CreateCorporate(req dto.CreateCorporateRequest) (*dto.CorporateResponse, error)
	GetCorporate(corporateID uint) (*dto.CorporateResponse, error)
	UpdateCorporate(corporateID uint, req dto.UpdateCorporateRequest) (*dto.CorporateResponse, error)
	DeleteCorporate(corporateID uint) error
	ListCorporates(req dto.ListCorporatesRequest) (*dto.ListCorporatesResponse, error)

	// Corporate member management
	AddMember(corporateID uint, req dto.AddMemberRequest) (*dto.CorporateMemberResponse, error)
	GetMember(corporateID uint, memberID uint) (*dto.CorporateMemberResponse, error)
	UpdateMember(corporateID uint, memberID uint, req dto.UpdateMemberRequest) (*dto.CorporateMemberResponse, error)
	RemoveMember(corporateID uint, memberID uint) error
	ListMembers(corporateID uint, req dto.ListMembersRequest) (*dto.ListMembersResponse, error)

	// Member invitation management
	InviteMember(corporateID uint, req dto.InviteMemberRequest) error
	GetInvitation(token string) (*dto.InvitationResponse, error)
	AcceptInvitation(token string, req dto.AcceptInvitationRequest) (*dto.CorporateMemberResponse, error)
	DeclineInvitation(token string) error
	CancelInvitation(corporateID uint, invitationID uint) error
	ListInvitations(corporateID uint, req dto.ListInvitationsRequest) (*dto.ListInvitationsResponse, error)

	// Corporate verification
	VerifyCorporate(corporateID uint, req dto.VerifyCorporateRequest) error
	GetVerificationStatus(corporateID uint) (*dto.VerificationStatusResponse, error)

	// Corporate settings
	GetSettings(corporateID uint) (*dto.CorporateSettingsResponse, error)
	UpdateSettings(corporateID uint, req dto.UpdateCorporateSettingsRequest) error

	// Member role management
	UpdateMemberRole(corporateID uint, memberID uint, req dto.UpdateMemberRoleRequest) error
	GetMemberPermissions(corporateID uint, memberID uint) (*dto.MemberPermissionsResponse, error)
}
