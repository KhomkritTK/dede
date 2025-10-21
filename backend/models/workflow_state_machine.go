package models

import (
	"fmt"
	"time"
)

// WorkflowState represents the complete state machine for DEDE workflow
type WorkflowState struct {
	CurrentStatus  RequestStatus  `json:"current_status"`
	PreviousStatus *RequestStatus `json:"previous_status"`
	AssignedTo     *uint          `json:"assigned_to"`
	AssignedRole   *UserRole      `json:"assigned_role"`
	Deadline       *time.Time     `json:"deadline"`
	LastUpdated    time.Time      `json:"last_updated"`
	UpdatedBy      uint           `json:"updated_by"`
	Comments       string         `json:"comments"`
}

// WorkflowTransition represents a state transition in the workflow
type WorkflowTransition struct {
	FromStatus   RequestStatus `json:"from_status"`
	ToStatus     RequestStatus `json:"to_status"`
	RequiredRole UserRole      `json:"required_role"`
	Action       string        `json:"action"`
	Description  string        `json:"description"`
	AutoAllowed  bool          `json:"auto_allowed"`
}

// WorkflowStateMachine manages the state transitions for DEDE workflow
type WorkflowStateMachine struct {
	transitions map[RequestStatus][]WorkflowTransition
}

// NewWorkflowStateMachine creates a new workflow state machine
func NewWorkflowStateMachine() *WorkflowStateMachine {
	wsm := &WorkflowStateMachine{
		transitions: make(map[RequestStatus][]WorkflowTransition),
	}

	// Initialize all possible transitions
	wsm.initializeTransitions()
	return wsm
}

// initializeTransitions sets up all valid state transitions
func (wsm *WorkflowStateMachine) initializeTransitions() {
	// From Draft
	wsm.addTransition(StatusDraft, StatusNewRequest, RoleUser, "submit", "Submit request for review", false)

	// From New Request (DEDE Admin receives)
	wsm.addTransition(StatusNewRequest, StatusAccepted, RoleAdmin, "accept", "Accept request for processing", false)
	wsm.addTransition(StatusNewRequest, StatusRejected, RoleAdmin, "reject", "Reject request", false)
	wsm.addTransition(StatusNewRequest, StatusReturned, RoleAdmin, "return", "Return to user for corrections", false)

	// From Accepted (Forward to DEDE Head)
	wsm.addTransition(StatusAccepted, StatusForwarded, RoleAdmin, "forward", "Forward to DEDE Head", false)

	// From Forwarded (DEDE Head receives)
	wsm.addTransition(StatusForwarded, StatusAssigned, RoleDEDEHead, "assign", "Assign to DEDE Staff/Consult", false)
	wsm.addTransition(StatusForwarded, StatusRejected, RoleDEDEHead, "reject", "Reject request", false)

	// From Assigned (Task assignment)
	wsm.addTransition(StatusAssigned, StatusAppointment, RoleDEDEHead, "schedule", "Schedule appointment", false)
	wsm.addTransition(StatusAssigned, StatusAppointment, RoleDEDEStaff, "schedule", "Schedule appointment", false)

	// From Appointment
	wsm.addTransition(StatusAppointment, StatusInspecting, RoleDEDEConsult, "start_inspection", "Start site inspection", false)
	wsm.addTransition(StatusAppointment, StatusInspecting, RoleDEDEStaff, "start_inspection", "Start site inspection", false)

	// From Inspecting
	wsm.addTransition(StatusInspecting, StatusInspectionDone, RoleDEDEConsult, "complete_inspection", "Complete inspection", false)
	wsm.addTransition(StatusInspecting, StatusInspectionDone, RoleDEDEStaff, "complete_inspection", "Complete inspection", false)

	// From Inspection Done (Audit Report phase)
	wsm.addTransition(StatusInspectionDone, StatusDocumentEdit, RoleDEDEConsult, "submit_report", "Submit audit report", false)
	wsm.addTransition(StatusInspectionDone, StatusDocumentEdit, RoleDEDEStaff, "submit_report", "Submit audit report", false)

	// From Document Edit (Review phase)
	wsm.addTransition(StatusDocumentEdit, StatusReportApproved, RoleDEDEStaff, "approve_report", "Approve audit report", false)
	wsm.addTransition(StatusDocumentEdit, StatusReturned, RoleDEDEStaff, "reject_report", "Reject report for revision", false)

	// From Report Approved
	wsm.addTransition(StatusReportApproved, StatusApproved, RoleDEDEStaff, "approve_license", "Approve license", false)
	wsm.addTransition(StatusReportApproved, StatusApproved, RoleDEDEHead, "approve_license", "Approve license", false)

	// Auto transitions
	wsm.addTransition(StatusAppointment, StatusOverdue, UserRole(""), "auto_overdue", "Auto-cancel due to missed appointment", true)
	wsm.addTransition(StatusDocumentEdit, StatusOverdue, UserRole(""), "auto_overdue", "Auto-cancel due to 14+ day delay", true)
}

// addTransition adds a transition to the state machine
func (wsm *WorkflowStateMachine) addTransition(from, to RequestStatus, role UserRole, action, description string, autoAllowed bool) {
	if wsm.transitions[from] == nil {
		wsm.transitions[from] = make([]WorkflowTransition, 0)
	}

	wsm.transitions[from] = append(wsm.transitions[from], WorkflowTransition{
		FromStatus:   from,
		ToStatus:     to,
		RequiredRole: role,
		Action:       action,
		Description:  description,
		AutoAllowed:  autoAllowed,
	})
}

// GetValidTransitions returns all valid transitions from current state
func (wsm *WorkflowStateMachine) GetValidTransitions(currentStatus RequestStatus, userRole UserRole) []WorkflowTransition {
	transitions := wsm.transitions[currentStatus]
	validTransitions := make([]WorkflowTransition, 0)

	for _, transition := range transitions {
		// Allow auto transitions or check role
		if transition.AutoAllowed || transition.RequiredRole == userRole || transition.RequiredRole == UserRole("") {
			validTransitions = append(validTransitions, transition)
		}
	}

	return validTransitions
}

// CanTransition checks if a transition is valid
func (wsm *WorkflowStateMachine) CanTransition(from, to RequestStatus, userRole UserRole) bool {
	transitions := wsm.transitions[from]

	for _, transition := range transitions {
		if transition.ToStatus == to {
			// Allow auto transitions or check role
			if transition.AutoAllowed || transition.RequiredRole == userRole || transition.RequiredRole == UserRole("") {
				return true
			}
		}
	}

	return false
}

// GetNextRequiredActions returns actions required to move forward
func (wsm *WorkflowStateMachine) GetNextRequiredActions(currentStatus RequestStatus) []string {
	actions := make([]string, 0)

	switch currentStatus {
	case StatusDraft:
		actions = append(actions, "Submit request for review")
	case StatusNewRequest:
		actions = append(actions, "DEDE Admin: Accept, Reject, or Return request")
	case StatusAccepted:
		actions = append(actions, "DEDE Admin: Forward to DEDE Head")
	case StatusForwarded:
		actions = append(actions, "DEDE Head: Assign to staff or reject")
	case StatusAssigned:
		actions = append(actions, "Schedule appointment with factory")
	case StatusAppointment:
		actions = append(actions, "Conduct site inspection")
	case StatusInspecting:
		actions = append(actions, "Complete inspection and submit report")
	case StatusInspectionDone:
		actions = append(actions, "Submit audit report for review")
	case StatusDocumentEdit:
		actions = append(actions, "DEDE Staff: Review and approve/reject report")
	case StatusReportApproved:
		actions = append(actions, "Final license approval")
	case StatusReturned:
		actions = append(actions, "User: Update and resubmit documents")
	case StatusOverdue:
		actions = append(actions, "Request auto-cancelled")
	case StatusApproved:
		actions = append(actions, "Process completed")
	case StatusRejected, StatusRejectedFinal:
		actions = append(actions, "Request rejected")
	}

	return actions
}

// GetRoleDisplayName returns the display name for a role
func (wsm *WorkflowStateMachine) GetRoleDisplayName(role UserRole) string {
	switch role {
	case RoleAdmin:
		return "DEDE Admin"
	case RoleDEDEHead:
		return "DEDE Head"
	case RoleDEDEStaff:
		return "DEDE Staff"
	case RoleDEDEConsult:
		return "DEDE Consult"
	case RoleAuditor:
		return "Auditor"
	case RoleUser:
		return "User"
	default:
		return string(role)
	}
}

// GetStatusProgress returns progress percentage (0-100)
func (wsm *WorkflowStateMachine) GetStatusProgress(status RequestStatus) int {
	progressMap := map[RequestStatus]int{
		StatusDraft:          0,
		StatusNewRequest:     10,
		StatusAccepted:       20,
		StatusForwarded:      30,
		StatusAssigned:       40,
		StatusAppointment:    50,
		StatusInspecting:     60,
		StatusInspectionDone: 70,
		StatusDocumentEdit:   80,
		StatusReportApproved: 90,
		StatusApproved:       100,
		StatusRejected:       0,
		StatusRejectedFinal:  0,
		StatusReturned:       15,
		StatusOverdue:        0,
	}

	if progress, exists := progressMap[status]; exists {
		return progress
	}
	return 0
}

// IsTerminalState checks if the status is a terminal state
func (wsm *WorkflowStateMachine) IsTerminalState(status RequestStatus) bool {
	return status == StatusApproved || status == StatusRejectedFinal || status == StatusOverdue
}

// GetWorkflowPath returns the complete workflow path
func (wsm *WorkflowStateMachine) GetWorkflowPath() []RequestStatus {
	return []RequestStatus{
		StatusDraft,
		StatusNewRequest,
		StatusAccepted,
		StatusForwarded,
		StatusAssigned,
		StatusAppointment,
		StatusInspecting,
		StatusInspectionDone,
		StatusDocumentEdit,
		StatusReportApproved,
		StatusApproved,
	}
}

// GetStatusDescription returns a description of the current status
func (wsm *WorkflowStateMachine) GetStatusDescription(status RequestStatus) string {
	descriptions := map[RequestStatus]string{
		StatusDraft:          "Request is being prepared by user",
		StatusNewRequest:     "Request submitted and waiting for DEDE Admin review",
		StatusAccepted:       "Request accepted by DEDE Admin",
		StatusForwarded:      "Request forwarded to DEDE Head",
		StatusAssigned:       "Request assigned to DEDE Staff/Consult",
		StatusAppointment:    "Appointment scheduled with factory",
		StatusInspecting:     "Site inspection in progress",
		StatusInspectionDone: "Inspection completed, preparing report",
		StatusDocumentEdit:   "Audit report submitted for review",
		StatusReportApproved: "Audit report approved, pending final approval",
		StatusApproved:       "License approved and issued",
		StatusRejected:       "Request rejected, can be resubmitted",
		StatusRejectedFinal:  "Request permanently rejected",
		StatusReturned:       "Request returned to user for corrections",
		StatusOverdue:        "Request auto-cancelled due to timeout",
	}

	if desc, exists := descriptions[status]; exists {
		return desc
	}
	return "Unknown status"
}

// ValidateDeadline checks if the request is overdue
func (wsm *WorkflowStateMachine) ValidateDeadline(status RequestStatus, deadline *time.Time, createdAt time.Time) bool {
	if deadline == nil {
		return false
	}

	// Check for document edit status (14 days)
	if status == StatusDocumentEdit {
		return time.Now().After(*deadline)
	}

	// Check for appointment status
	if status == StatusAppointment {
		return time.Now().After(*deadline)
	}

	return false
}

// GetDefaultDeadline returns the default deadline for a status
func (wsm *WorkflowStateMachine) GetDefaultDeadline(status RequestStatus, fromTime time.Time) *time.Time {
	var deadline time.Time

	switch status {
	case StatusDocumentEdit:
		// 14 days for document review
		deadline = fromTime.AddDate(0, 0, 14)
	case StatusAppointment:
		// 7 days for appointment
		deadline = fromTime.AddDate(0, 0, 7)
	default:
		return nil
	}

	return &deadline
}

// GetWorkflowSummary returns a summary of the workflow
func (wsm *WorkflowStateMachine) GetWorkflowSummary() map[string]interface{} {
	return map[string]interface{}{
		"total_states":     len(wsm.GetWorkflowPath()),
		"terminal_states":  []string{"approved", "rejected_final", "overdue"},
		"auto_transitions": []string{"auto_overdue"},
		"roles":            []string{"user", "admin", "dede_head", "dede_staff", "dede_consult"},
		"max_days_delay":   14,
	}
}

// TransitionRequest represents a request to transition workflow state
type TransitionRequest struct {
	FromStatus   RequestStatus `json:"from_status" binding:"required"`
	ToStatus     RequestStatus `json:"to_status" binding:"required"`
	UserID       uint          `json:"user_id" binding:"required"`
	UserRole     UserRole      `json:"user_role" binding:"required"`
	Comments     string        `json:"comments"`
	AutoApproved bool          `json:"auto_approved"`
}

// ValidateTransitionRequest validates a transition request
func (wsm *WorkflowStateMachine) ValidateTransitionRequest(req TransitionRequest) error {
	// Check if transition is valid
	if !wsm.CanTransition(req.FromStatus, req.ToStatus, req.UserRole) {
		return fmt.Errorf("invalid transition from %s to %s for role %s", req.FromStatus, req.ToStatus, req.UserRole)
	}

	// Additional validation can be added here
	return nil
}
