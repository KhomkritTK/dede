package usecase

import (
	"errors"
	"fmt"
	"time"

	"eservice-backend/models"
	"eservice-backend/repository"
	"eservice-backend/service/audit/dto"
)

type AuditUsecase interface {
	CreateAuditReport(req dto.CreateAuditReportRequest, inspectorID uint) (*dto.AuditReportResponse, error)
	GetAuditReportByID(id uint) (*dto.AuditReportResponse, error)
	GetAllAuditReports(page, limit int) (*dto.AuditReportListResponse, error)
	GetAuditReportsByInspector(inspectorID uint, page, limit int) (*dto.AuditReportListResponse, error)
	GetAuditReportsByInspection(inspectionID uint) (*dto.AuditReportListResponse, error)
	GetPendingReviewReports() (*dto.AuditReportListResponse, error)
	UpdateAuditReport(id uint, req dto.UpdateAuditReportRequest) (*dto.AuditReportResponse, error)
	DeleteAuditReport(id uint) error
	SubmitAuditReport(id uint) error
	ReviewAuditReport(req dto.ReviewReportRequest, reviewerID uint) error
	ApproveAuditReport(req dto.ApproveReportRequest, reviewerID uint) error
	RejectAuditReport(req dto.RejectReportRequest, reviewerID uint) error
	RequestEdit(req dto.RequestEditRequest, reviewerID uint) error
	SendForReview(req dto.SendForReviewRequest) error
	GetReportStatuses() []dto.ReportStatusResponse
	GetComplianceStatuses() []dto.ComplianceStatusResponse
	GetRiskLevels() []dto.RiskLevelResponse
}

type auditUsecase struct {
	auditReportRepo repository.AuditReportRepository
	userRepo        repository.UserRepository
}

func NewAuditUsecase(
	auditReportRepo repository.AuditReportRepository,
	userRepo repository.UserRepository,
) AuditUsecase {
	return &auditUsecase{
		auditReportRepo: auditReportRepo,
		userRepo:        userRepo,
	}
}

func (u *auditUsecase) CreateAuditReport(req dto.CreateAuditReportRequest, inspectorID uint) (*dto.AuditReportResponse, error) {
	// Validate compliance status
	if !u.isValidComplianceStatus(req.ComplianceStatus) {
		return nil, errors.New("invalid compliance status")
	}

	// Validate risk level
	if !u.isValidRiskLevel(req.RiskLevel) {
		return nil, errors.New("invalid risk level")
	}

	// Generate report number
	reportNumber := u.generateReportNumber()

	// Create audit report
	report := &models.AuditReport{
		RequestID:         req.RequestID,
		InspectionID:      req.InspectionID,
		InspectorID:       inspectorID,
		Status:            models.ReportStatusDraft,
		ReportNumber:      reportNumber,
		Title:             req.Title,
		Summary:           req.Summary,
		Findings:          req.Findings,
		Recommendations:   req.Recommendations,
		ComplianceStatus:  req.ComplianceStatus,
		RiskLevel:         req.RiskLevel,
		CorrectiveActions: req.CorrectiveActions,
		FollowUpRequired:  req.FollowUpRequired,
		FollowUpDate:      req.FollowUpDate,
	}

	if err := u.auditReportRepo.Create(report); err != nil {
		return nil, errors.New("failed to create audit report")
	}

	// Get the complete report with relations
	fullReport, err := u.auditReportRepo.GetByID(report.ID)
	if err != nil {
		return nil, errors.New("failed to retrieve created audit report")
	}

	return u.convertToAuditReportResponse(fullReport)
}

func (u *auditUsecase) GetAuditReportByID(id uint) (*dto.AuditReportResponse, error) {
	report, err := u.auditReportRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return u.convertToAuditReportResponse(report)
}

func (u *auditUsecase) GetAllAuditReports(page, limit int) (*dto.AuditReportListResponse, error) {
	reports, err := u.auditReportRepo.GetAll()
	if err != nil {
		return nil, err
	}

	// Apply pagination
	total := int64(len(reports))
	start := (page - 1) * limit
	end := start + limit

	if start > int(total) {
		start = int(total)
	}
	if end > int(total) {
		end = int(total)
	}

	paginatedReports := reports[start:end]

	// Convert to response format
	var responses []dto.AuditReportResponse
	for _, report := range paginatedReports {
		response, err := u.convertToAuditReportResponse(&report)
		if err != nil {
			continue
		}
		responses = append(responses, *response)
	}

	return &dto.AuditReportListResponse{
		Reports: responses,
		Pagination: dto.PaginationResponse{
			Page:  page,
			Limit: limit,
			Total: total,
		},
	}, nil
}

func (u *auditUsecase) GetAuditReportsByInspector(inspectorID uint, page, limit int) (*dto.AuditReportListResponse, error) {
	reports, err := u.auditReportRepo.GetByInspectorID(inspectorID)
	if err != nil {
		return nil, err
	}

	// Apply pagination
	total := int64(len(reports))
	start := (page - 1) * limit
	end := start + limit

	if start > int(total) {
		start = int(total)
	}
	if end > int(total) {
		end = int(total)
	}

	paginatedReports := reports[start:end]

	// Convert to response format
	var responses []dto.AuditReportResponse
	for _, report := range paginatedReports {
		response, err := u.convertToAuditReportResponse(&report)
		if err != nil {
			continue
		}
		responses = append(responses, *response)
	}

	return &dto.AuditReportListResponse{
		Reports: responses,
		Pagination: dto.PaginationResponse{
			Page:  page,
			Limit: limit,
			Total: total,
		},
	}, nil
}

func (u *auditUsecase) GetAuditReportsByInspection(inspectionID uint) (*dto.AuditReportListResponse, error) {
	reports, err := u.auditReportRepo.GetByInspectionID(inspectionID)
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []dto.AuditReportResponse
	for _, report := range reports {
		response, err := u.convertToAuditReportResponse(&report)
		if err != nil {
			continue
		}
		responses = append(responses, *response)
	}

	return &dto.AuditReportListResponse{
		Reports: responses,
		Pagination: dto.PaginationResponse{
			Page:  1,
			Limit: len(responses),
			Total: int64(len(responses)),
		},
	}, nil
}

func (u *auditUsecase) GetPendingReviewReports() (*dto.AuditReportListResponse, error) {
	reports, err := u.auditReportRepo.GetPendingReviewReports()
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []dto.AuditReportResponse
	for _, report := range reports {
		response, err := u.convertToAuditReportResponse(&report)
		if err != nil {
			continue
		}
		responses = append(responses, *response)
	}

	return &dto.AuditReportListResponse{
		Reports: responses,
		Pagination: dto.PaginationResponse{
			Page:  1,
			Limit: len(responses),
			Total: int64(len(responses)),
		},
	}, nil
}

func (u *auditUsecase) UpdateAuditReport(id uint, req dto.UpdateAuditReportRequest) (*dto.AuditReportResponse, error) {
	// Get the existing report
	report, err := u.auditReportRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Check if report can be updated (only draft or needs_edit status)
	if !report.CanSubmit() && !report.NeedsEdit() {
		return nil, errors.New("report cannot be updated in current status")
	}

	// Validate compliance status if provided
	if req.ComplianceStatus != "" && !u.isValidComplianceStatus(req.ComplianceStatus) {
		return nil, errors.New("invalid compliance status")
	}

	// Validate risk level if provided
	if req.RiskLevel != "" && !u.isValidRiskLevel(req.RiskLevel) {
		return nil, errors.New("invalid risk level")
	}

	// Update fields
	if req.Title != "" {
		report.Title = req.Title
	}
	if req.Summary != "" {
		report.Summary = req.Summary
	}
	if req.Findings != "" {
		report.Findings = req.Findings
	}
	if req.Recommendations != "" {
		report.Recommendations = req.Recommendations
	}
	if req.ComplianceStatus != "" {
		report.ComplianceStatus = req.ComplianceStatus
	}
	if req.RiskLevel != "" {
		report.RiskLevel = req.RiskLevel
	}
	if req.CorrectiveActions != "" {
		report.CorrectiveActions = req.CorrectiveActions
	}
	if req.FollowUpRequired != nil {
		report.FollowUpRequired = *req.FollowUpRequired
	}
	report.FollowUpDate = req.FollowUpDate

	// If report was in needs_edit status, change it back to draft
	if report.NeedsEdit() {
		report.Status = models.ReportStatusDraft
	}

	if err := u.auditReportRepo.Update(report); err != nil {
		return nil, errors.New("failed to update audit report")
	}

	return u.convertToAuditReportResponse(report)
}

func (u *auditUsecase) DeleteAuditReport(id uint) error {
	// Get the existing report
	report, err := u.auditReportRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if report can be deleted (only draft status)
	if !report.IsDraft() {
		return errors.New("report cannot be deleted in current status")
	}

	return u.auditReportRepo.Delete(id)
}

func (u *auditUsecase) SubmitAuditReport(id uint) error {
	// Get the existing report
	report, err := u.auditReportRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Check if report can be submitted
	if !report.CanSubmit() {
		return errors.New("report cannot be submitted in current status")
	}

	return u.auditReportRepo.SubmitReport(id)
}

func (u *auditUsecase) ReviewAuditReport(req dto.ReviewReportRequest, reviewerID uint) error {
	// Get the existing report
	report, err := u.auditReportRepo.GetByID(req.ReportID)
	if err != nil {
		return err
	}

	// Check if report can be reviewed
	if !report.CanReview() {
		return errors.New("report cannot be reviewed in current status")
	}

	return u.auditReportRepo.ReviewReport(req.ReportID, reviewerID, req.ReviewComments)
}

func (u *auditUsecase) ApproveAuditReport(req dto.ApproveReportRequest, reviewerID uint) error {
	// Get the existing report
	report, err := u.auditReportRepo.GetByID(req.ReportID)
	if err != nil {
		return err
	}

	// Check if report can be approved
	if !report.CanApprove() {
		return errors.New("report cannot be approved in current status")
	}

	return u.auditReportRepo.ApproveReport(req.ReportID, reviewerID)
}

func (u *auditUsecase) RejectAuditReport(req dto.RejectReportRequest, reviewerID uint) error {
	// Get the existing report
	report, err := u.auditReportRepo.GetByID(req.ReportID)
	if err != nil {
		return err
	}

	// Check if report can be rejected
	if !report.CanReject() {
		return errors.New("report cannot be rejected in current status")
	}

	return u.auditReportRepo.RejectReport(req.ReportID, reviewerID, req.RejectionReason)
}

func (u *auditUsecase) RequestEdit(req dto.RequestEditRequest, reviewerID uint) error {
	// Get the existing report
	report, err := u.auditReportRepo.GetByID(req.ReportID)
	if err != nil {
		return err
	}

	// Check if report can be requested for edit
	if !report.CanRequestEdit() {
		return errors.New("report cannot be requested for edit in current status")
	}

	return u.auditReportRepo.RequestEdit(req.ReportID, reviewerID, req.ReviewComments)
}

func (u *auditUsecase) SendForReview(req dto.SendForReviewRequest) error {
	// Get the existing report
	report, err := u.auditReportRepo.GetByID(req.ReportID)
	if err != nil {
		return err
	}

	// Check if report can be submitted for review
	if !report.CanSubmit() {
		return errors.New("report cannot be sent for review in current status")
	}

	return u.auditReportRepo.SubmitReport(req.ReportID)
}

func (u *auditUsecase) GetReportStatuses() []dto.ReportStatusResponse {
	return []dto.ReportStatusResponse{
		{Value: string(models.ReportStatusDraft), Label: "ร่าง"},
		{Value: string(models.ReportStatusSubmitted), Label: "ส่งรายงาน"},
		{Value: string(models.ReportStatusUnderReview), Label: "รอตรวจสอบ"},
		{Value: string(models.ReportStatusApproved), Label: "อนุมัติรายงาน"},
		{Value: string(models.ReportStatusRejected), Label: "ปฏิเสธรายงาน"},
		{Value: string(models.ReportStatusNeedsEdit), Label: "ต้องแก้ไข"},
	}
}

func (u *auditUsecase) GetComplianceStatuses() []dto.ComplianceStatusResponse {
	return []dto.ComplianceStatusResponse{
		{Value: "compliant", Label: "สอดคล้อง"},
		{Value: "non_compliant", Label: "ไม่สอดคล้อง"},
		{Value: "partial", Label: "บางส่วน"},
	}
}

func (u *auditUsecase) GetRiskLevels() []dto.RiskLevelResponse {
	return []dto.RiskLevelResponse{
		{Value: "low", Label: "ต่ำ"},
		{Value: "medium", Label: "ปานกลาง"},
		{Value: "high", Label: "สูง"},
		{Value: "critical", Label: "วิกฤต"},
	}
}

func (u *auditUsecase) isValidComplianceStatus(status string) bool {
	validStatuses := []string{"compliant", "non_compliant", "partial"}
	for _, validStatus := range validStatuses {
		if status == validStatus {
			return true
		}
	}
	return false
}

func (u *auditUsecase) isValidRiskLevel(level string) bool {
	validLevels := []string{"low", "medium", "high", "critical"}
	for _, validLevel := range validLevels {
		if level == validLevel {
			return true
		}
	}
	return false
}

func (u *auditUsecase) generateReportNumber() string {
	now := time.Now()
	return fmt.Sprintf("AUD-%d%02d%02d-%d", now.Year(), now.Month(), now.Day(), now.Unix()%10000)
}

func (u *auditUsecase) convertToAuditReportResponse(report *models.AuditReport) (*dto.AuditReportResponse, error) {
	reviewerID := uint(0)
	if report.ReviewerID != nil {
		reviewerID = *report.ReviewerID
	}

	return &dto.AuditReportResponse{
		ID:                report.ID,
		RequestID:         report.RequestID,
		InspectionID:      report.InspectionID,
		InspectorID:       report.InspectorID,
		ReviewerID:        &reviewerID,
		Status:            string(report.Status),
		ReportNumber:      report.ReportNumber,
		Title:             report.Title,
		Summary:           report.Summary,
		Findings:          report.Findings,
		Recommendations:   report.Recommendations,
		ComplianceStatus:  report.ComplianceStatus,
		RiskLevel:         report.RiskLevel,
		CorrectiveActions: report.CorrectiveActions,
		FollowUpRequired:  report.FollowUpRequired,
		FollowUpDate:      report.FollowUpDate,
		SubmittedAt:       report.SubmittedAt,
		ReviewedAt:        report.ReviewedAt,
		ApprovedAt:        report.ApprovedAt,
		RejectionReason:   report.RejectionReason,
		ReviewComments:    report.ReviewComments,
		CreatedAt:         report.CreatedAt,
		UpdatedAt:         report.UpdatedAt,
	}, nil
}
