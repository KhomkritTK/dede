package usecase

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/license/dto"
	"eservice-backend/utils"
)

type LicenseUsecase interface {
	CreateLicenseRequest(userID uint, req dto.CreateLicenseRequestRequest) (*dto.LicenseRequestResponse, error)
	CreateNewLicenseRequest(userID uint, req dto.NewLicenseRequestRequest) (*dto.LicenseRequestResponse, error)
	CreateRenewalLicenseRequest(userID uint, req dto.RenewalLicenseRequestRequest) (*dto.LicenseRequestResponse, error)
	CreateExtensionLicenseRequest(userID uint, req dto.ExtensionLicenseRequestRequest) (*dto.LicenseRequestResponse, error)
	CreateReductionLicenseRequest(userID uint, req dto.ReductionLicenseRequestRequest) (*dto.LicenseRequestResponse, error)
	GetLicenseRequestByID(id uint) (*dto.LicenseRequestResponse, error)
	GetLicenseRequests(page, limit int, search string, status string, userID uint) (*dto.LicenseRequestListResponse, error)
	UpdateLicenseRequest(id uint, req dto.UpdateLicenseRequestRequest) (*dto.LicenseRequestResponse, error)
	DeleteLicenseRequest(id uint) error
	SubmitLicenseRequest(id uint) error
	AcceptLicenseRequest(id uint) error
	RejectLicenseRequest(id uint, reason string) error
	AssignInspector(id uint, req dto.AssignInspectorRequest, assignedByID uint) error
	ApproveLicenseRequest(id uint) error
	GetMyLicenseRequests(userID uint, page, limit int) (*dto.LicenseRequestListResponse, error)
	GetLicenseTypes() []dto.LicenseTypeResponse
	GetRequestStatuses() []dto.RequestStatusResponse
}

type licenseUsecase struct {
	licenseRepo          repository.LicenseRequestRepository
	newLicenseRepo       repository.NewLicenseRepo
	renewalLicenseRepo   repository.RenewalLicenseRepo
	extensionLicenseRepo repository.ExtensionLicenseRepo
	reductionLicenseRepo repository.ReductionLicenseRepo
	userRepo             repository.UserRepository
}

func NewLicenseUsecase(
	licenseRepo repository.LicenseRequestRepository,
	newLicenseRepo repository.NewLicenseRepo,
	renewalLicenseRepo repository.RenewalLicenseRepo,
	extensionLicenseRepo repository.ExtensionLicenseRepo,
	reductionLicenseRepo repository.ReductionLicenseRepo,
	userRepo repository.UserRepository) LicenseUsecase {
	return &licenseUsecase{
		licenseRepo:          licenseRepo,
		newLicenseRepo:       newLicenseRepo,
		renewalLicenseRepo:   renewalLicenseRepo,
		extensionLicenseRepo: extensionLicenseRepo,
		reductionLicenseRepo: reductionLicenseRepo,
		userRepo:             userRepo,
	}
}

func (u *licenseUsecase) CreateLicenseRequest(userID uint, req dto.CreateLicenseRequestRequest) (*dto.LicenseRequestResponse, error) {
	// Validate license type
	if !u.isValidLicenseType(req.LicenseType) {
		return nil, errors.New("invalid license type")
	}

	// Generate request number
	requestNumber := u.generateRequestNumber()

	// Create license request
	licenseRequest := &models.LicenseRequest{
		UserID:            userID,
		RequestNumber:     requestNumber,
		LicenseType:       models.LicenseType(req.LicenseType),
		Status:            models.StatusDraft,
		Title:             req.Title,
		Description:       req.Description,
		CurrentCapacity:   req.CurrentCapacity,
		RequestedCapacity: req.RequestedCapacity,
		Location:          req.Location,
		Deadline:          GetDeadlinePointer(),
	}

	if err := u.licenseRepo.Create(licenseRequest); err != nil {
		return nil, errors.New("failed to create license request")
	}

	return u.convertToLicenseRequestResponse(licenseRequest)
}

func (u *licenseUsecase) GetLicenseRequestByID(id uint) (*dto.LicenseRequestResponse, error) {
	licenseRequest, err := u.licenseRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return u.convertToLicenseRequestResponse(licenseRequest)
}

func (u *licenseUsecase) GetLicenseRequests(page, limit int, search string, status string, userID uint) (*dto.LicenseRequestListResponse, error) {
	var licenseRequests []models.LicenseRequest
	var total int64
	var err error

	if search != "" {
		licenseRequests, err = u.licenseRepo.SearchRequests(search)
	} else if status != "" {
		licenseRequests, err = u.licenseRepo.GetByStatus(models.RequestStatus(status))
	} else if userID > 0 {
		licenseRequests, err = u.licenseRepo.GetByUserID(userID)
	} else {
		licenseRequests, err = u.licenseRepo.GetAll()
	}

	if err != nil {
		return nil, err
	}

	// Apply pagination
	total = int64(len(licenseRequests))
	start := (page - 1) * limit
	end := start + limit

	if start > int(total) {
		start = int(total)
	}
	if end > int(total) {
		end = int(total)
	}

	paginatedRequests := licenseRequests[start:end]

	// Convert to response format
	var responses []dto.LicenseRequestResponse
	for _, request := range paginatedRequests {
		response, err := u.convertToLicenseRequestResponse(&request)
		if err != nil {
			continue
		}
		responses = append(responses, *response)
	}

	return &dto.LicenseRequestListResponse{
		LicenseRequests: responses,
		Pagination: dto.PaginationResponse{
			Page:  page,
			Limit: limit,
			Total: total,
		},
	}, nil
}

func (u *licenseUsecase) UpdateLicenseRequest(id uint, req dto.UpdateLicenseRequestRequest) (*dto.LicenseRequestResponse, error) {
	licenseRequest, err := u.licenseRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Check if request is in draft status
	if licenseRequest.Status != models.StatusDraft {
		return nil, errors.New("cannot update request that is not in draft status")
	}

	// Update fields
	if req.Title != "" {
		licenseRequest.Title = req.Title
	}
	if req.Description != "" {
		licenseRequest.Description = req.Description
	}
	if req.CurrentCapacity > 0 {
		licenseRequest.CurrentCapacity = req.CurrentCapacity
	}
	if req.RequestedCapacity > 0 {
		licenseRequest.RequestedCapacity = req.RequestedCapacity
	}
	if req.Location != "" {
		licenseRequest.Location = req.Location
	}

	if err := u.licenseRepo.Update(licenseRequest); err != nil {
		return nil, errors.New("failed to update license request")
	}

	return u.convertToLicenseRequestResponse(licenseRequest)
}

func (u *licenseUsecase) DeleteLicenseRequest(id uint) error {
	licenseRequest, err := u.licenseRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if request is in draft status
	if licenseRequest.Status != models.StatusDraft {
		return errors.New("cannot delete request that is not in draft status")
	}

	return u.licenseRepo.Delete(id)
}

func (u *licenseUsecase) SubmitLicenseRequest(id uint) error {
	licenseRequest, err := u.licenseRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if request is in draft status
	if licenseRequest.Status != models.StatusDraft {
		return errors.New("cannot submit request that is not in draft status")
	}

	// Update status
	return u.licenseRepo.UpdateStatus(id, models.StatusNewRequest)
}

func (u *licenseUsecase) AcceptLicenseRequest(id uint) error {
	licenseRequest, err := u.licenseRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if request is in new request status
	if licenseRequest.Status != models.StatusNewRequest {
		return errors.New("cannot accept request that is not in new request status")
	}

	// Update status
	return u.licenseRepo.UpdateStatus(id, models.StatusAccepted)
}

func (u *licenseUsecase) RejectLicenseRequest(id uint, reason string) error {
	licenseRequest, err := u.licenseRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if request is in new request status
	if licenseRequest.Status != models.StatusNewRequest {
		return errors.New("cannot reject request that is not in new request status")
	}

	// Update status and rejection reason
	return u.licenseRepo.UpdateStatus(id, models.StatusRejected)
}

func (u *licenseUsecase) AssignInspector(id uint, req dto.AssignInspectorRequest, assignedByID uint) error {
	licenseRequest, err := u.licenseRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if request can be assigned
	if !licenseRequest.CanBeAssigned() {
		return errors.New("cannot assign inspector to this request")
	}

	// Check if inspector exists
	inspector, err := u.userRepo.GetByID(req.InspectorID)
	if err != nil {
		return errors.New("inspector not found")
	}

	// Check if inspector is DEDE role
	if !inspector.IsDEDE() {
		return errors.New("inspector must be a DEDE staff")
	}

	// Assign inspector
	return u.licenseRepo.AssignInspector(id, req.InspectorID, assignedByID)
}

func (u *licenseUsecase) ApproveLicenseRequest(id uint) error {
	licenseRequest, err := u.licenseRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if request can be approved
	if !licenseRequest.IsInspectionDone() {
		return errors.New("cannot approve request that has not been inspected")
	}

	// Update status
	return u.licenseRepo.UpdateStatus(id, models.StatusApproved)
}

func (u *licenseUsecase) GetMyLicenseRequests(userID uint, page, limit int) (*dto.LicenseRequestListResponse, error) {
	return u.GetLicenseRequests(page, limit, "", "", userID)
}

func (u *licenseUsecase) GetLicenseTypes() []dto.LicenseTypeResponse {
	return []dto.LicenseTypeResponse{
		{Value: string(models.LicenseTypeNew), Label: "ขอรับใบอนุญาต"},
		{Value: string(models.LicenseTypeRenew), Label: "ขอต่ออายุใบอนุญาต"},
		{Value: string(models.LicenseTypeExpand), Label: "ขอขยายการผลิต"},
		{Value: string(models.LicenseTypeReduce), Label: "ขอลดการผลิต"},
		{Value: string(models.LicenseTypeModify), Label: "ขอแก้ไข"},
		{Value: string(models.LicenseTypeCancel), Label: "ขอเลิก"},
	}
}

func (u *licenseUsecase) GetRequestStatuses() []dto.RequestStatusResponse {
	return []dto.RequestStatusResponse{
		{Value: string(models.StatusDraft), Label: "ร่าง"},
		{Value: string(models.StatusNewRequest), Label: "คำร้องใหม่"},
		{Value: string(models.StatusAccepted), Label: "รับคำขอ"},
		{Value: string(models.StatusRejected), Label: "ปฏิเสธคำขอ"},
		{Value: string(models.StatusAssigned), Label: "มอบหมายผู้ตรวจ"},
		{Value: string(models.StatusAppointment), Label: "นัดหมาย"},
		{Value: string(models.StatusInspecting), Label: "เข้าตรวจสอบระบบ"},
		{Value: string(models.StatusInspectionDone), Label: "ตรวจสอบเสร็จสิ้น"},
		{Value: string(models.StatusDocumentEdit), Label: "แก้ไขเอกสาร"},
		{Value: string(models.StatusOverdue), Label: "เกินกำหนด"},
		{Value: string(models.StatusReportApproved), Label: "รับรองรายงาน"},
		{Value: string(models.StatusApproved), Label: "อนุมัติใบอนุญาต"},
		{Value: string(models.StatusRejectedFinal), Label: "ปฏิเสธสุดท้าย"},
	}
}

func (u *licenseUsecase) isValidLicenseType(licenseType string) bool {
	validTypes := []string{
		string(models.LicenseTypeNew),
		string(models.LicenseTypeRenew),
		string(models.LicenseTypeExpand),
		string(models.LicenseTypeReduce),
		string(models.LicenseTypeModify),
		string(models.LicenseTypeCancel),
	}

	for _, validType := range validTypes {
		if licenseType == validType {
			return true
		}
	}

	return false
}

func (u *licenseUsecase) generateRequestNumber() string {
	// Generate request number with format: REQ-YYYYMMDD-XXXX
	now := time.Now()
	dateStr := now.Format("20060102")

	// Get count of requests for today
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	todayEnd := todayStart.Add(24 * time.Hour)

	todayRequests, _ := u.licenseRepo.GetRequestsByDateRange(todayStart, todayEnd)
	count := len(todayRequests) + 1

	// Format count with leading zeros
	countStr := fmt.Sprintf("%04d", count)

	return fmt.Sprintf("REQ-%s-%s", dateStr, countStr)
}

func (u *licenseUsecase) convertToLicenseRequestResponse(request *models.LicenseRequest) (*dto.LicenseRequestResponse, error) {
	response := &dto.LicenseRequestResponse{
		ID:                request.ID,
		RequestNumber:     request.RequestNumber,
		LicenseType:       string(request.LicenseType),
		Status:            string(request.Status),
		Title:             request.Title,
		Description:       request.Description,
		CurrentCapacity:   request.CurrentCapacity,
		RequestedCapacity: request.RequestedCapacity,
		Location:          request.Location,
		InspectorID:       request.InspectorID,
		AssignedByID:      request.AssignedByID,
		AssignedAt:        request.AssignedAt,
		AppointmentDate:   request.AppointmentDate,
		InspectionDate:    request.InspectionDate,
		CompletionDate:    request.CompletionDate,
		Deadline:          request.Deadline,
		RejectionReason:   request.RejectionReason,
		Notes:             request.Notes,
		CreatedAt:         request.CreatedAt,
		UpdatedAt:         request.UpdatedAt,
		UserID:            request.UserID,
		User: dto.UserInfo{
			ID:       request.User.ID,
			Username: request.User.Username,
			Email:    request.User.Email,
			FullName: request.User.FullName,
			Role:     string(request.User.Role),
			Status:   string(request.User.Status),
		},
	}

	// Add inspector info if available
	if request.Inspector != nil {
		response.Inspector = &dto.UserInfo{
			ID:       request.Inspector.ID,
			Username: request.Inspector.Username,
			Email:    request.Inspector.Email,
			FullName: request.Inspector.FullName,
			Role:     string(request.Inspector.Role),
			Status:   string(request.Inspector.Status),
		}
	}

	// Add assigned by info if available
	if request.AssignedBy != nil {
		response.AssignedBy = &dto.UserInfo{
			ID:       request.AssignedBy.ID,
			Username: request.AssignedBy.Username,
			Email:    request.AssignedBy.Email,
			FullName: request.AssignedBy.FullName,
			Role:     string(request.AssignedBy.Role),
			Status:   string(request.AssignedBy.Status),
		}
	}

	return response, nil
}

// CreateNewLicenseRequest creates a new license request
func (u *licenseUsecase) CreateNewLicenseRequest(userID uint, req dto.NewLicenseRequestRequest) (*dto.LicenseRequestResponse, error) {
	// Generate request number
	requestNumber := u.generateRequestNumber()

	// Parse capacity
	capacity, err := strconv.ParseFloat(req.Capacity, 64)
	if err != nil {
		capacity = 0
	}

	// Parse expected start date
	expectedStartDate, err := time.Parse("2006-01-02", req.ExpectedStartDate)
	if err != nil {
		expectedStartDate = time.Now()
	}

	// Create new license request
	newLicenseRequest := &models.NewLicenseRequest{
		UserID:            userID,
		RequestNumber:     requestNumber,
		Status:            models.StatusNewRequest,
		LicenseType:       req.LicenseType,
		ProjectName:       req.ProjectName,
		ProjectAddress:    req.ProjectAddress,
		Province:          req.Province,
		District:          req.District,
		Subdistrict:       req.Subdistrict,
		PostalCode:        req.PostalCode,
		EnergyType:        req.EnergyType,
		Capacity:          capacity,
		CapacityUnit:      req.CapacityUnit,
		ExpectedStartDate: expectedStartDate,
		Description:       req.Description,
		ContactPerson:     req.ContactPerson,
		ContactPhone:      req.ContactPhone,
		ContactEmail:      req.ContactEmail,
		Deadline:          GetDeadlinePointer(),
	}

	if err := u.newLicenseRepo.Create(newLicenseRequest); err != nil {
		return nil, errors.New("failed to create new license request")
	}

	// Convert to response format
	response := &dto.LicenseRequestResponse{
		ID:            newLicenseRequest.ID,
		RequestNumber: newLicenseRequest.RequestNumber,
		LicenseType:   newLicenseRequest.LicenseType,
		Status:        string(newLicenseRequest.Status),
		Title:         newLicenseRequest.ProjectName,
		Description:   newLicenseRequest.Description,
		Location:      newLicenseRequest.ProjectAddress + ", " + newLicenseRequest.District + ", " + newLicenseRequest.Subdistrict + ", " + newLicenseRequest.Province + " " + newLicenseRequest.PostalCode,
		CreatedAt:     newLicenseRequest.CreatedAt,
		UpdatedAt:     newLicenseRequest.UpdatedAt,
		UserID:        newLicenseRequest.UserID,
	}

	return response, nil
}

// CreateRenewalLicenseRequest creates a renewal license request
func (u *licenseUsecase) CreateRenewalLicenseRequest(userID uint, req dto.RenewalLicenseRequestRequest) (*dto.LicenseRequestResponse, error) {
	// Generate request number
	requestNumber := u.generateRequestNumber()

	// Parse capacities
	currentCapacity, err := strconv.ParseFloat(req.CurrentCapacity, 64)
	if err != nil {
		currentCapacity = 0
	}

	requestedCapacity, err := strconv.ParseFloat(req.RequestedCapacity, 64)
	if err != nil {
		requestedCapacity = 0
	}

	// Parse dates
	expiryDate, err := time.Parse("2006-01-02", req.ExpiryDate)
	if err != nil {
		expiryDate = time.Now()
	}

	requestedExpiryDate, err := time.Parse("2006-01-02", req.RequestedExpiryDate)
	if err != nil {
		requestedExpiryDate = time.Now()
	}

	// Create renewal license request
	renewalLicenseRequest := &models.RenewalLicenseRequest{
		UserID:                userID,
		RequestNumber:         requestNumber,
		Status:                models.StatusNewRequest,
		LicenseType:           req.LicenseType,
		LicenseNumber:         req.LicenseNumber,
		ProjectName:           req.ProjectName,
		ProjectAddress:        req.ProjectAddress,
		CurrentCapacity:       currentCapacity,
		CurrentCapacityUnit:   req.CurrentCapacityUnit,
		RequestedCapacity:     requestedCapacity,
		RequestedCapacityUnit: req.RequestedCapacityUnit,
		ExpiryDate:            expiryDate,
		RequestedExpiryDate:   requestedExpiryDate,
		Reason:                req.Reason,
		ContactPerson:         req.ContactPerson,
		ContactPhone:          req.ContactPhone,
		ContactEmail:          req.ContactEmail,
		Deadline:              GetDeadlinePointer(),
	}

	if err := u.renewalLicenseRepo.Create(renewalLicenseRequest); err != nil {
		return nil, errors.New("failed to create renewal license request")
	}

	// Convert to response format
	response := &dto.LicenseRequestResponse{
		ID:            renewalLicenseRequest.ID,
		RequestNumber: renewalLicenseRequest.RequestNumber,
		LicenseType:   renewalLicenseRequest.LicenseType,
		Status:        string(renewalLicenseRequest.Status),
		Title:         renewalLicenseRequest.ProjectName,
		Description:   renewalLicenseRequest.Reason,
		Location:      renewalLicenseRequest.ProjectAddress,
		CreatedAt:     renewalLicenseRequest.CreatedAt,
		UpdatedAt:     renewalLicenseRequest.UpdatedAt,
		UserID:        renewalLicenseRequest.UserID,
	}

	return response, nil
}

// CreateExtensionLicenseRequest creates an extension license request
func (u *licenseUsecase) CreateExtensionLicenseRequest(userID uint, req dto.ExtensionLicenseRequestRequest) (*dto.LicenseRequestResponse, error) {
	// Generate request number
	requestNumber := u.generateRequestNumber()

	// Parse capacities
	currentCapacity, err := strconv.ParseFloat(req.CurrentCapacity, 64)
	if err != nil {
		currentCapacity = 0
	}

	requestedCapacity, err := strconv.ParseFloat(req.RequestedCapacity, 64)
	if err != nil {
		requestedCapacity = 0
	}

	// Parse expected start date
	expectedStartDate, err := time.Parse("2006-01-02", req.ExpectedStartDate)
	if err != nil {
		expectedStartDate = time.Now()
	}

	// Create extension license request
	extensionLicenseRequest := &models.ExtensionLicenseRequest{
		UserID:                userID,
		RequestNumber:         requestNumber,
		Status:                models.StatusNewRequest,
		LicenseType:           req.LicenseType,
		LicenseNumber:         req.LicenseNumber,
		ProjectName:           req.ProjectName,
		CurrentCapacity:       currentCapacity,
		CurrentCapacityUnit:   req.CurrentCapacityUnit,
		RequestedCapacity:     requestedCapacity,
		RequestedCapacityUnit: req.RequestedCapacityUnit,
		ExtensionReason:       req.ExtensionReason,
		ExpectedStartDate:     expectedStartDate,
		Description:           req.Description,
		ContactPerson:         req.ContactPerson,
		ContactPhone:          req.ContactPhone,
		ContactEmail:          req.ContactEmail,
		Deadline:              GetDeadlinePointer(),
	}

	if err := u.extensionLicenseRepo.Create(extensionLicenseRequest); err != nil {
		return nil, errors.New("failed to create extension license request")
	}

	// Convert to response format
	response := &dto.LicenseRequestResponse{
		ID:            extensionLicenseRequest.ID,
		RequestNumber: extensionLicenseRequest.RequestNumber,
		LicenseType:   extensionLicenseRequest.LicenseType,
		Status:        string(extensionLicenseRequest.Status),
		Title:         extensionLicenseRequest.ProjectName,
		Description:   extensionLicenseRequest.Description,
		CreatedAt:     extensionLicenseRequest.CreatedAt,
		UpdatedAt:     extensionLicenseRequest.UpdatedAt,
		UserID:        extensionLicenseRequest.UserID,
	}

	return response, nil
}

// CreateReductionLicenseRequest creates a reduction license request
func (u *licenseUsecase) CreateReductionLicenseRequest(userID uint, req dto.ReductionLicenseRequestRequest) (*dto.LicenseRequestResponse, error) {
	// Generate request number
	requestNumber := u.generateRequestNumber()

	// Parse capacities
	currentCapacity, err := strconv.ParseFloat(req.CurrentCapacity, 64)
	if err != nil {
		currentCapacity = 0
	}

	requestedCapacity, err := strconv.ParseFloat(req.RequestedCapacity, 64)
	if err != nil {
		requestedCapacity = 0
	}

	// Parse expected start date
	expectedStartDate, err := time.Parse("2006-01-02", req.ExpectedStartDate)
	if err != nil {
		expectedStartDate = time.Now()
	}

	// Create reduction license request
	reductionLicenseRequest := &models.ReductionLicenseRequest{
		UserID:                userID,
		RequestNumber:         requestNumber,
		Status:                models.StatusNewRequest,
		LicenseType:           req.LicenseType,
		LicenseNumber:         req.LicenseNumber,
		ProjectName:           req.ProjectName,
		CurrentCapacity:       currentCapacity,
		CurrentCapacityUnit:   req.CurrentCapacityUnit,
		RequestedCapacity:     requestedCapacity,
		RequestedCapacityUnit: req.RequestedCapacityUnit,
		ReductionReason:       req.ReductionReason,
		ExpectedStartDate:     expectedStartDate,
		Description:           req.Description,
		ContactPerson:         req.ContactPerson,
		ContactPhone:          req.ContactPhone,
		ContactEmail:          req.ContactEmail,
		Deadline:              GetDeadlinePointer(),
	}

	if err := u.reductionLicenseRepo.Create(reductionLicenseRequest); err != nil {
		return nil, errors.New("failed to create reduction license request")
	}

	// Convert to response format
	response := &dto.LicenseRequestResponse{
		ID:            reductionLicenseRequest.ID,
		RequestNumber: reductionLicenseRequest.RequestNumber,
		LicenseType:   reductionLicenseRequest.LicenseType,
		Status:        string(reductionLicenseRequest.Status),
		Title:         reductionLicenseRequest.ProjectName,
		Description:   reductionLicenseRequest.Description,
		CreatedAt:     reductionLicenseRequest.CreatedAt,
		UpdatedAt:     reductionLicenseRequest.UpdatedAt,
		UserID:        reductionLicenseRequest.UserID,
	}

	return response, nil
}

// Helper function to get deadline pointer
func GetDeadlinePointer() *time.Time {
	deadline := utils.GetDeadline()
	return &deadline
}
