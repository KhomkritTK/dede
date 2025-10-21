package handler

import (
	"eservice-backend/models"
	"eservice-backend/service/workflow/dto"
	"eservice-backend/service/workflow/service"
	"eservice-backend/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type WorkflowHandler struct {
	dashboardService service.DashboardService
	taskService      service.TaskAssignmentService
	deadlineService  service.DeadlineService
	commentService   service.CommentService
	activityService  service.ActivityLogService
}

func NewWorkflowHandler(
	dashboardService service.DashboardService,
	taskService service.TaskAssignmentService,
	deadlineService service.DeadlineService,
	commentService service.CommentService,
	activityService service.ActivityLogService,
) *WorkflowHandler {
	return &WorkflowHandler{
		dashboardService: dashboardService,
		taskService:      taskService,
		deadlineService:  deadlineService,
		commentService:   commentService,
		activityService:  activityService,
	}
}

// Dashboard endpoints

// GetDashboard returns dashboard data for a user
func (h *WorkflowHandler) GetDashboard(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	// Get user role from context
	userRole, exists := c.Get("userRole")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User role not found", nil)
		return
	}

	// Get dashboard data
	dashboard, err := h.dashboardService.GetDashboard(userID.(uint), models.UserRole(userRole.(string)))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Dashboard data retrieved successfully", dashboard)
}

// Task endpoints

// CreateTask creates a new task
func (h *WorkflowHandler) CreateTask(c *gin.Context) {
	var req dto.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	req.AssignedByID = userID.(uint)

	// Create task
	task, err := h.taskService.CreateTask(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Task created successfully", task)
}

// GetTasks returns tasks for a user
func (h *WorkflowHandler) GetTasks(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	// Get tasks
	tasks, err := h.taskService.GetTasksByUser(userID.(uint))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Tasks retrieved successfully", tasks)
}

// GetTaskByID returns a task by ID
func (h *WorkflowHandler) GetTaskByID(c *gin.Context) {
	// Get task ID from URL
	taskIDStr := c.Param("id")
	taskID, err := strconv.ParseUint(taskIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid task ID", err)
		return
	}

	// Get task
	task, err := h.taskService.GetTaskByID(uint(taskID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task retrieved successfully", task)
}

// UpdateTask updates a task
func (h *WorkflowHandler) UpdateTask(c *gin.Context) {
	// Get task ID from URL
	taskIDStr := c.Param("id")
	taskID, err := strconv.ParseUint(taskIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid task ID", err)
		return
	}

	var req dto.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Update task
	task, err := h.taskService.UpdateTask(uint(taskID), req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task updated successfully", task)
}

// AssignTask assigns a task to a user
func (h *WorkflowHandler) AssignTask(c *gin.Context) {
	// Get task ID from URL
	taskIDStr := c.Param("id")
	taskID, err := strconv.ParseUint(taskIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid task ID", err)
		return
	}

	var req dto.AssignTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Assign task
	err = h.taskService.AssignTask(uint(taskID), req.UserID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task assigned successfully", nil)
}

// ReassignTask reassigns a task to another user
func (h *WorkflowHandler) ReassignTask(c *gin.Context) {
	// Get task ID from URL
	taskIDStr := c.Param("id")
	taskID, err := strconv.ParseUint(taskIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid task ID", err)
		return
	}

	var req dto.ReassignTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Reassign task
	err = h.taskService.ReassignTask(uint(taskID), req.FromUserID, req.ToUserID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task reassigned successfully", nil)
}

// CompleteTask marks a task as completed
func (h *WorkflowHandler) CompleteTask(c *gin.Context) {
	// Get task ID from URL
	taskIDStr := c.Param("id")
	taskID, err := strconv.ParseUint(taskIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid task ID", err)
		return
	}

	var req dto.CompleteTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Complete task
	err = h.taskService.CompleteTask(uint(taskID), req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task completed successfully", nil)
}

// GetOverdueTasks returns overdue tasks
func (h *WorkflowHandler) GetOverdueTasks(c *gin.Context) {
	// Get overdue tasks
	tasks, err := h.taskService.GetOverdueTasks()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Overdue tasks retrieved successfully", tasks)
}

// GetUpcomingTasks returns upcoming tasks
func (h *WorkflowHandler) GetUpcomingTasks(c *gin.Context) {
	// Get days from query parameter
	daysStr := c.DefaultQuery("days", "7")
	days, err := strconv.Atoi(daysStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid days parameter", err)
		return
	}

	// Get upcoming tasks
	tasks, err := h.taskService.GetUpcomingTasks(days)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Upcoming tasks retrieved successfully", tasks)
}

// GetTaskStatistics returns task statistics
func (h *WorkflowHandler) GetTaskStatistics(c *gin.Context) {
	// Get task statistics
	stats, err := h.taskService.GetTaskStatistics()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task statistics retrieved successfully", stats)
}

// Deadline endpoints

// CreateDeadline creates a new deadline
func (h *WorkflowHandler) CreateDeadline(c *gin.Context) {
	var req dto.CreateDeadlineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	req.AssignedByID = userID.(uint)

	// Create deadline
	deadline, err := h.deadlineService.CreateDeadline(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Deadline created successfully", deadline)
}

// GetDeadlines returns deadlines for a user
func (h *WorkflowHandler) GetDeadlines(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	// Get deadlines
	deadlines, err := h.deadlineService.GetDeadlinesByUser(userID.(uint))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Deadlines retrieved successfully", deadlines)
}

// GetDeadlineByID returns a deadline by ID
func (h *WorkflowHandler) GetDeadlineByID(c *gin.Context) {
	// Get deadline ID from URL
	deadlineIDStr := c.Param("id")
	deadlineID, err := strconv.ParseUint(deadlineIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid deadline ID", err)
		return
	}

	// Get deadline
	deadline, err := h.deadlineService.GetDeadlineByID(uint(deadlineID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Deadline retrieved successfully", deadline)
}

// UpdateDeadline updates a deadline
func (h *WorkflowHandler) UpdateDeadline(c *gin.Context) {
	// Get deadline ID from URL
	deadlineIDStr := c.Param("id")
	deadlineID, err := strconv.ParseUint(deadlineIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid deadline ID", err)
		return
	}

	var req dto.UpdateDeadlineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Update deadline
	deadline, err := h.deadlineService.UpdateDeadline(uint(deadlineID), req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Deadline updated successfully", deadline)
}

// MarkAsCompleted marks a deadline as completed
func (h *WorkflowHandler) MarkAsCompleted(c *gin.Context) {
	// Get deadline ID from URL
	deadlineIDStr := c.Param("id")
	deadlineID, err := strconv.ParseUint(deadlineIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid deadline ID", err)
		return
	}

	var req dto.CompleteDeadlineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Mark as completed
	err = h.deadlineService.MarkAsCompleted(uint(deadlineID), req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Deadline marked as completed", nil)
}

// GetUpcomingDeadlines returns upcoming deadlines
func (h *WorkflowHandler) GetUpcomingDeadlines(c *gin.Context) {
	// Get days from query parameter
	daysStr := c.DefaultQuery("days", "7")
	days, err := strconv.Atoi(daysStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid days parameter", err)
		return
	}

	// Get upcoming deadlines
	deadlines, err := h.deadlineService.GetUpcomingDeadlines(days)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Upcoming deadlines retrieved successfully", deadlines)
}

// GetOverdueDeadlines returns overdue deadlines
func (h *WorkflowHandler) GetOverdueDeadlines(c *gin.Context) {
	// Get overdue deadlines
	deadlines, err := h.deadlineService.GetOverdueDeadlines()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Overdue deadlines retrieved successfully", deadlines)
}

// GetDeadlineStatistics returns deadline statistics
func (h *WorkflowHandler) GetDeadlineStatistics(c *gin.Context) {
	// Get deadline statistics
	stats, err := h.deadlineService.GetDeadlineStatistics()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Deadline statistics retrieved successfully", stats)
}

// ProcessDeadlines processes deadlines and sends reminders
func (h *WorkflowHandler) ProcessDeadlines(c *gin.Context) {
	// Process deadlines
	err := h.deadlineService.ProcessDeadlines()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Deadlines processed successfully", nil)
}

// Comment endpoints

// CreateComment creates a new comment
func (h *WorkflowHandler) CreateComment(c *gin.Context) {
	var req dto.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	req.AuthorID = userID.(uint)

	// Create comment
	comment, err := h.commentService.CreateComment(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Comment created successfully", comment)
}

// GetComments returns comments for an entity
func (h *WorkflowHandler) GetComments(c *gin.Context) {
	// Get entity type and ID from query parameters
	entityType := c.Query("entity_type")
	entityIDStr := c.Query("entity_id")
	if entityType == "" || entityIDStr == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Entity type and ID are required", nil)
		return
	}

	entityID, err := strconv.ParseUint(entityIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid entity ID", err)
		return
	}

	// Get comments
	comments, err := h.commentService.GetCommentsByEntity(entityType, uint(entityID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Comments retrieved successfully", comments)
}

// GetCommentByID returns a comment by ID
func (h *WorkflowHandler) GetCommentByID(c *gin.Context) {
	// Get comment ID from URL
	commentIDStr := c.Param("id")
	commentID, err := strconv.ParseUint(commentIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid comment ID", err)
		return
	}

	// Get comment
	comment, err := h.commentService.GetCommentByID(uint(commentID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Comment retrieved successfully", comment)
}

// UpdateComment updates a comment
func (h *WorkflowHandler) UpdateComment(c *gin.Context) {
	// Get comment ID from URL
	commentIDStr := c.Param("id")
	commentID, err := strconv.ParseUint(commentIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid comment ID", err)
		return
	}

	var req dto.UpdateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	req.AuthorID = userID.(uint)

	// Update comment
	comment, err := h.commentService.UpdateComment(uint(commentID), req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Comment updated successfully", comment)
}

// DeleteComment deletes a comment
func (h *WorkflowHandler) DeleteComment(c *gin.Context) {
	// Get comment ID from URL
	commentIDStr := c.Param("id")
	commentID, err := strconv.ParseUint(commentIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid comment ID", err)
		return
	}

	// Delete comment
	err = h.commentService.DeleteComment(uint(commentID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Comment deleted successfully", nil)
}

// CreateFeedback creates a new feedback
func (h *WorkflowHandler) CreateFeedback(c *gin.Context) {
	var req dto.CreateFeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	req.AuthorID = userID.(uint)

	// Create feedback
	feedback, err := h.commentService.CreateFeedback(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Feedback created successfully", feedback)
}

// GetFeedback returns feedback for an entity
func (h *WorkflowHandler) GetFeedback(c *gin.Context) {
	// Get entity type and ID from query parameters
	entityType := c.Query("entity_type")
	entityIDStr := c.Query("entity_id")
	if entityType == "" || entityIDStr == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Entity type and ID are required", nil)
		return
	}

	entityID, err := strconv.ParseUint(entityIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid entity ID", err)
		return
	}

	// Get feedback
	feedback, err := h.commentService.GetFeedbackByEntity(entityType, uint(entityID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Feedback retrieved successfully", feedback)
}

// ResolveComment resolves a comment
func (h *WorkflowHandler) ResolveComment(c *gin.Context) {
	// Get comment ID from URL
	commentIDStr := c.Param("id")
	commentID, err := strconv.ParseUint(commentIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid comment ID", err)
		return
	}

	// Resolve comment
	err = h.commentService.ResolveComment(uint(commentID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Comment resolved successfully", nil)
}

// GetCommentStatistics returns comment statistics
func (h *WorkflowHandler) GetCommentStatistics(c *gin.Context) {
	// Get comment statistics
	stats, err := h.commentService.GetCommentStatistics()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Comment statistics retrieved successfully", stats)
}

// Activity log endpoints

// GetActivityLogs returns activity logs
func (h *WorkflowHandler) GetActivityLogs(c *gin.Context) {
	// Get query parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	entityType := c.Query("entity_type")
	entityIDStr := c.Query("entity_id")
	status := c.Query("status")

	page, err := strconv.Atoi(pageStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid page parameter", err)
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid limit parameter", err)
		return
	}

	var entityID *uint
	if entityIDStr != "" {
		id, err := strconv.ParseUint(entityIDStr, 10, 32)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid entity ID", err)
			return
		}
		idUint := uint(id)
		entityID = &idUint
	}

	// Create request
	req := dto.GetActivityLogsRequest{
		Page:       page,
		Limit:      limit,
		EntityType: entityType,
		EntityID:   entityID,
		Status:     status,
	}

	// Get activity logs
	logs, _, err := h.activityService.GetActivityLogs(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Activity logs retrieved successfully", logs)
}

// GetActivityLogByID returns an activity log by ID
func (h *WorkflowHandler) GetActivityLogByID(c *gin.Context) {
	// Get log ID from URL
	logIDStr := c.Param("id")
	logID, err := strconv.ParseUint(logIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid log ID", err)
		return
	}

	// Get activity log
	log, err := h.activityService.GetActivityLogByID(uint(logID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Activity log retrieved successfully", log)
}

// GetActivityLogsByEntity returns activity logs for an entity
func (h *WorkflowHandler) GetActivityLogsByEntity(c *gin.Context) {
	// Get entity type and ID from query parameters
	entityType := c.Query("entity_type")
	entityIDStr := c.Query("entity_id")
	if entityType == "" || entityIDStr == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Entity type and ID are required", nil)
		return
	}

	entityID, err := strconv.ParseUint(entityIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid entity ID", err)
		return
	}

	// Get activity logs
	logs, err := h.activityService.GetActivityLogsByEntity(entityType, uint(entityID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Activity logs retrieved successfully", logs)
}

// GetActivityLogsByUser returns activity logs for a user
func (h *WorkflowHandler) GetActivityLogsByUser(c *gin.Context) {
	// Get user ID from URL
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}

	// Get activity logs
	logs, err := h.activityService.GetActivityLogsByUser(uint(userID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Activity logs retrieved successfully", logs)
}

// GetActivityLogsByDateRange returns activity logs within a date range
func (h *WorkflowHandler) GetActivityLogsByDateRange(c *gin.Context) {
	// Get date range from query parameters
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	if startDateStr == "" || endDateStr == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Start date and end date are required", nil)
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid start date format", err)
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid end date format", err)
		return
	}

	// Get activity logs
	logs, err := h.activityService.GetActivityLogsByDateRange(startDate, endDate)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Activity logs retrieved successfully", logs)
}

// GetActivityStatistics returns activity statistics
func (h *WorkflowHandler) GetActivityStatistics(c *gin.Context) {
	// Get activity statistics
	stats, err := h.activityService.GetActivityStatistics()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Activity statistics retrieved successfully", stats)
}

// ExportActivityLogs exports activity logs to CSV
func (h *WorkflowHandler) ExportActivityLogs(c *gin.Context) {
	// Get query parameters
	entityType := c.Query("entity_type")
	entityIDStr := c.Query("entity_id")
	status := c.Query("status")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var entityID *uint
	if entityIDStr != "" {
		id, err := strconv.ParseUint(entityIDStr, 10, 32)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid entity ID", err)
			return
		}
		idUint := uint(id)
		entityID = &idUint
	}

	var startDate, endDate *time.Time
	if startDateStr != "" {
		date, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid start date format", err)
			return
		}
		startDate = &date
	}

	if endDateStr != "" {
		date, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid end date format", err)
			return
		}
		endDate = &date
	}

	// Create request
	req := dto.ExportActivityLogsRequest{
		EntityType: entityType,
		EntityID:   entityID,
		Status:     status,
		StartDate:  startDate,
		EndDate:    endDate,
	}

	// Export activity logs
	csv, err := h.activityService.ExportActivityLogs(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=activity_logs.csv")
	c.Data(http.StatusOK, "text/csv", csv)
}

// LogActivity logs an activity
func (h *WorkflowHandler) LogActivity(c *gin.Context) {
	var req dto.LogActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	req.UserID = userID.(uint)

	// Log activity
	err := h.activityService.LogActivity(req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Activity logged successfully", nil)
}
