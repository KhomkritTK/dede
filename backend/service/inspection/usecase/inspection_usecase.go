package usecase

import (
	"errors"
	"time"

	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/inspection/dto"
)

type InspectionUsecase interface {
	CreateInspection(userID uint, req dto.CreateInspectionRequest) (*dto.InspectionResponse, error)
	GetInspectionByID(id uint) (*dto.InspectionResponse, error)
	GetInspections(page, limit int, search string, status string, inspectorID uint) (*dto.InspectionListResponse, error)
	UpdateInspection(id uint, req dto.UpdateInspectionRequest) (*dto.InspectionResponse, error)
	DeleteInspection(id uint) error
	StartInspection(id uint) error
	CompleteInspection(id uint, findings, recommendations string) error
	CancelInspection(id uint, reason string) error
	RescheduleInspection(id uint, req dto.RescheduleInspectionRequest) error
	ScheduleInspection(id uint, scheduledDate time.Time, scheduledTime, location string) error
	GetMyInspections(inspectorID uint, page, limit int) (*dto.InspectionListResponse, error)
	GetInspectionsByRequest(requestID uint) (*dto.InspectionListResponse, error)
	GetInspectionStatuses() []dto.InspectionStatusResponse
}

type inspectionUsecase struct {
	inspectionRepo repository.InspectionRepository
	licenseRepo    repository.LicenseRequestRepository
	userRepo       repository.UserRepository
}

func NewInspectionUsecase(
	inspectionRepo repository.InspectionRepository,
	licenseRepo repository.LicenseRequestRepository,
	userRepo repository.UserRepository,
) InspectionUsecase {
	return &inspectionUsecase{
		inspectionRepo: inspectionRepo,
		licenseRepo:    licenseRepo,
		userRepo:       userRepo,
	}
}

func (u *inspectionUsecase) CreateInspection(userID uint, req dto.CreateInspectionRequest) (*dto.InspectionResponse, error) {
	// Check if license request exists
	request, err := u.licenseRepo.GetByID(req.RequestID)
	if err != nil {
		return nil, errors.New("license request not found")
	}

	// Check if request can be inspected
	if !request.CanBeInspected() {
		return nil, errors.New("license request cannot be inspected")
	}

	// Create inspection
	inspection := &models.Inspection{
		RequestID:     req.RequestID,
		InspectorID:   userID,
		Status:        models.InspectionStatusScheduled,
		ScheduledDate: req.ScheduledDate,
		ScheduledTime: req.ScheduledTime,
		Location:      req.Location,
		Purpose:       req.Purpose,
	}

	if err := u.inspectionRepo.Create(inspection); err != nil {
		return nil, errors.New("failed to create inspection")
	}

	return u.convertToInspectionResponse(inspection)
}

func (u *inspectionUsecase) GetInspectionByID(id uint) (*dto.InspectionResponse, error) {
	inspection, err := u.inspectionRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return u.convertToInspectionResponse(inspection)
}

func (u *inspectionUsecase) GetInspections(page, limit int, search string, status string, inspectorID uint) (*dto.InspectionListResponse, error) {
	var inspections []models.Inspection
	var total int64
	var err error

	if search != "" {
		inspections, err = u.inspectionRepo.SearchInspections(search)
	} else if status != "" {
		inspections, err = u.inspectionRepo.GetByStatus(models.InspectionStatus(status))
	} else if inspectorID > 0 {
		inspections, err = u.inspectionRepo.GetByInspectorID(inspectorID)
	} else {
		inspections, err = u.inspectionRepo.GetAll()
	}

	if err != nil {
		return nil, err
	}

	// Apply pagination
	total = int64(len(inspections))
	start := (page - 1) * limit
	end := start + limit

	if start > int(total) {
		start = int(total)
	}
	if end > int(total) {
		end = int(total)
	}

	paginatedInspections := inspections[start:end]

	// Convert to response format
	var responses []dto.InspectionResponse
	for _, inspection := range paginatedInspections {
		response, err := u.convertToInspectionResponse(&inspection)
		if err != nil {
			continue
		}
		responses = append(responses, *response)
	}

	return &dto.InspectionListResponse{
		Inspections: responses,
		Pagination: dto.PaginationResponse{
			Page:  page,
			Limit: limit,
			Total: total,
		},
	}, nil
}

func (u *inspectionUsecase) UpdateInspection(id uint, req dto.UpdateInspectionRequest) (*dto.InspectionResponse, error) {
	inspection, err := u.inspectionRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Update fields
	if !req.ScheduledDate.IsZero() {
		inspection.ScheduledDate = req.ScheduledDate
	}
	if req.ScheduledTime != "" {
		inspection.ScheduledTime = req.ScheduledTime
	}
	if req.Location != "" {
		inspection.Location = req.Location
	}
	if req.Purpose != "" {
		inspection.Purpose = req.Purpose
	}
	if req.Findings != "" {
		inspection.Findings = req.Findings
	}
	if req.Recommendations != "" {
		inspection.Recommendations = req.Recommendations
	}
	if req.Notes != "" {
		inspection.Notes = req.Notes
	}

	if err := u.inspectionRepo.Update(inspection); err != nil {
		return nil, errors.New("failed to update inspection")
	}

	return u.convertToInspectionResponse(inspection)
}

func (u *inspectionUsecase) DeleteInspection(id uint) error {
	inspection, err := u.inspectionRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if inspection can be deleted
	if inspection.Status != models.InspectionStatusScheduled {
		return errors.New("cannot delete inspection that is not in scheduled status")
	}

	return u.inspectionRepo.Delete(id)
}

func (u *inspectionUsecase) StartInspection(id uint) error {
	inspection, err := u.inspectionRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if inspection can be started
	if inspection.Status != models.InspectionStatusScheduled {
		return errors.New("cannot start inspection that is not in scheduled status")
	}

	return u.inspectionRepo.StartInspection(id)
}

func (u *inspectionUsecase) CompleteInspection(id uint, findings, recommendations string) error {
	inspection, err := u.inspectionRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if inspection can be completed
	if inspection.Status != models.InspectionStatusInProgress {
		return errors.New("cannot complete inspection that is not in progress")
	}

	return u.inspectionRepo.CompleteInspection(id, findings, recommendations)
}

func (u *inspectionUsecase) CancelInspection(id uint, reason string) error {
	inspection, err := u.inspectionRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if inspection can be cancelled
	if inspection.Status == models.InspectionStatusCompleted || inspection.Status == models.InspectionStatusCancelled {
		return errors.New("cannot cancel inspection that is completed or already cancelled")
	}

	return u.inspectionRepo.CancelInspection(id, reason)
}

func (u *inspectionUsecase) RescheduleInspection(id uint, req dto.RescheduleInspectionRequest) error {
	inspection, err := u.inspectionRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if inspection can be rescheduled
	if inspection.Status != models.InspectionStatusScheduled {
		return errors.New("cannot reschedule inspection that is not in scheduled status")
	}

	return u.inspectionRepo.RescheduleInspection(id, req.NewDate, req.NewTime)
}

func (u *inspectionUsecase) ScheduleInspection(id uint, scheduledDate time.Time, scheduledTime, location string) error {
	inspection, err := u.inspectionRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Update appointment details
	inspection.ScheduledDate = scheduledDate
	inspection.ScheduledTime = scheduledTime
	inspection.Location = location
	inspection.Status = models.InspectionStatusScheduled

	return u.inspectionRepo.Update(inspection)
}

func (u *inspectionUsecase) GetMyInspections(inspectorID uint, page, limit int) (*dto.InspectionListResponse, error) {
	return u.GetInspections(page, limit, "", "", inspectorID)
}

func (u *inspectionUsecase) GetInspectionsByRequest(requestID uint) (*dto.InspectionListResponse, error) {
	inspections, err := u.inspectionRepo.GetByRequestID(requestID)
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []dto.InspectionResponse
	for _, inspection := range inspections {
		response, err := u.convertToInspectionResponse(&inspection)
		if err != nil {
			continue
		}
		responses = append(responses, *response)
	}

	return &dto.InspectionListResponse{
		Inspections: responses,
		Pagination: dto.PaginationResponse{
			Page:  1,
			Limit: len(responses),
			Total: int64(len(responses)),
		},
	}, nil
}

func (u *inspectionUsecase) GetInspectionStatuses() []dto.InspectionStatusResponse {
	return []dto.InspectionStatusResponse{
		{Value: string(models.InspectionStatusScheduled), Label: "นัดหมาย"},
		{Value: string(models.InspectionStatusInProgress), Label: "กำลังตรวจสอบ"},
		{Value: string(models.InspectionStatusCompleted), Label: "ตรวจสอบเสร็จสิ้น"},
		{Value: string(models.InspectionStatusCancelled), Label: "ยกเลิก"},
	}
}

func (u *inspectionUsecase) convertToInspectionResponse(inspection *models.Inspection) (*dto.InspectionResponse, error) {
	response := &dto.InspectionResponse{
		ID:              inspection.ID,
		RequestID:       inspection.RequestID,
		InspectorID:     inspection.InspectorID,
		Status:          string(inspection.Status),
		ScheduledDate:   inspection.ScheduledDate,
		ScheduledTime:   inspection.ScheduledTime,
		Location:        inspection.Location,
		Purpose:         inspection.Purpose,
		ActualStartDate: inspection.ActualStartDate,
		ActualEndDate:   inspection.ActualEndDate,
		Findings:        inspection.Findings,
		Recommendations: inspection.Recommendations,
		Notes:           inspection.Notes,
		CreatedAt:       inspection.CreatedAt,
		UpdatedAt:       inspection.UpdatedAt,
	}

	// Add request number if available
	if inspection.Request.ID > 0 {
		response.RequestNumber = inspection.Request.RequestNumber
	}

	// Add inspector info if available
	if inspection.Inspector.ID > 0 {
		response.Inspector = dto.UserInfo{
			ID:       inspection.Inspector.ID,
			Username: inspection.Inspector.Username,
			Email:    inspection.Inspector.Email,
			FullName: inspection.Inspector.FullName,
			Role:     string(inspection.Inspector.Role),
			Status:   string(inspection.Inspector.Status),
		}
	}

	return response, nil
}
