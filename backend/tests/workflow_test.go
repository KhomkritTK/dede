package tests

import (
	"bytes"
	"encoding/json"
	"eservice-backend/models"
	"eservice-backend/service/workflow/dto"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// TestSetup sets up the test environment
func TestSetup(t *testing.T) (*gin.Engine, *gorm.DB) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Create in-memory SQLite database
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Auto migrate all models
	err = db.AutoMigrate(
		&models.User{},
		&models.NewLicenseRequest{},
		&models.ServiceFlowLog{},
		&models.TaskAssignment{},
		&models.DeadlineReminder{},
		&models.Comment{},
		&models.Feedback{},
		&models.ActivityLog{},
		&models.Attachment{},
		&models.AuditReport{},
		&models.Notification{},
	)
	if err != nil {
		t.Fatalf("Failed to migrate database: %v", err)
	}

	// Create Gin router
	router := gin.New()

	return router, db
}

// CreateTestUser creates a test user
func CreateTestUser(t *testing.T, db *gorm.DB, role string) *models.User {
	user := &models.User{
		Username:  fmt.Sprintf("testuser_%s", role),
		Email:     fmt.Sprintf("test_%s@example.com", role),
		FullName:  fmt.Sprintf("Test User %s", role),
		Password:  "password123",
		Role:      models.UserRole(role),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := db.Create(user).Error
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	return user
}

// CreateTestLicenseRequest creates a test license request
func CreateTestLicenseRequest(t *testing.T, db *gorm.DB, userID uint) *models.NewLicenseRequest {
	request := &models.NewLicenseRequest{
		UserID:      userID,
		LicenseType: "factory",
		Status:      "new_request",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err := db.Create(request).Error
	if err != nil {
		t.Fatalf("Failed to create test license request: %v", err)
	}

	return request
}

// TestWorkflowStateTransition tests the workflow state transition
func TestWorkflowStateTransition(t *testing.T) {
	router, db := TestSetup(t)

	// Create test users
	adminUser := CreateTestUser(t, db, "admin")
	headUser := CreateTestUser(t, db, "dede_head")
	staffUser := CreateTestUser(t, db, "dede_staff")

	// Create test license request
	request := CreateTestLicenseRequest(t, db, adminUser.ID)

	// Test state transition from new_request to accepted
	transitionReq := dto.WorkflowTransitionRequest{
		RequestID:    request.ID,
		TargetState:  "accepted",
		Reason:       "Request accepted for processing",
		AssignedToID: &headUser.ID,
	}

	jsonData, _ := json.Marshal(transitionReq)
	req, _ := http.NewRequest("POST", "/api/workflow/transition", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(adminUser))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Verify the state transition
	var updatedRequest models.NewLicenseRequest
	err := db.First(&updatedRequest, request.ID).Error
	assert.NoError(t, err)
	assert.Equal(t, "accepted", updatedRequest.Status)
}

// TestTaskAssignment tests the task assignment functionality
func TestTaskAssignment(t *testing.T) {
	router, db := TestSetup(t)

	// Create test users
	adminUser := CreateTestUser(t, db, "admin")
	headUser := CreateTestUser(t, db, "dede_head")
	staffUser := CreateTestUser(t, db, "dede_staff")

	// Create test license request
	request := CreateTestLicenseRequest(t, db, adminUser.ID)

	// Create a task
	taskReq := dto.CreateTaskRequest{
		RequestID:    request.ID,
		TaskTitle:    "Review application",
		Description:  "Review the license application",
		AssignedByID: headUser.ID,
		Priority:     "normal",
	}

	jsonData, _ := json.Marshal(taskReq)
	req, _ := http.NewRequest("POST", "/api/workflow/tasks", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(headUser))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Verify the task was created
	var task models.TaskAssignment
	err := db.First(&task).Error
	assert.NoError(t, err)
	assert.Equal(t, "Review application", task.TaskTitle)
}

// TestDeadlineTracking tests the deadline tracking functionality
func TestDeadlineTracking(t *testing.T) {
	router, db := TestSetup(t)

	// Create test users
	adminUser := CreateTestUser(t, db, "admin")
	headUser := CreateTestUser(t, db, "dede_head")

	// Create test license request
	request := CreateTestLicenseRequest(t, db, adminUser.ID)

	// Create a deadline
	futureTime := time.Now().AddDate(0, 0, 7) // 7 days from now
	deadlineReq := dto.CreateDeadlineRequest{
		EntityType:   "license_request",
		EntityID:     request.ID,
		Title:        "Review deadline",
		Description:  "Review the license request",
		AssignedByID: headUser.ID,
		Priority:     "high",
		DeadlineDate: &futureTime,
		ReminderDays: &[]int{3}[0],
	}

	jsonData, _ := json.Marshal(deadlineReq)
	req, _ := http.NewRequest("POST", "/api/workflow/deadlines", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(headUser))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Verify the deadline was created
	var deadline models.DeadlineReminder
	err := db.First(&deadline).Error
	assert.NoError(t, err)
	assert.Equal(t, "Review deadline", deadline.Title)
}

// TestCommentSystem tests the comment system
func TestCommentSystem(t *testing.T) {
	router, db := TestSetup(t)

	// Create test users
	adminUser := CreateTestUser(t, db, "admin")
	staffUser := CreateTestUser(t, db, "dede_staff")

	// Create test license request
	request := CreateTestLicenseRequest(t, db, adminUser.ID)

	// Create a comment
	commentReq := dto.CreateCommentRequest{
		EntityType: "license_request",
		EntityID:   request.ID,
		Content:    "Please review the attached documents",
		AuthorID:   staffUser.ID,
	}

	jsonData, _ := json.Marshal(commentReq)
	req, _ := http.NewRequest("POST", "/api/workflow/comments", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(staffUser))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Verify the comment was created
	var comment models.Comment
	err := db.First(&comment).Error
	assert.NoError(t, err)
	assert.Equal(t, "Please review the attached documents", comment.Content)
}

// TestActivityLogging tests the activity logging functionality
func TestActivityLogging(t *testing.T) {
	router, db := TestSetup(t)

	// Create test users
	adminUser := CreateTestUser(t, db, "admin")

	// Create test license request
	request := CreateTestLicenseRequest(t, db, adminUser.ID)

	// Log an activity
	logReq := dto.LogActivityRequest{
		UserID:     adminUser.ID,
		Action:     "created",
		EntityType: "license_request",
		EntityID:   &request.ID,
		Details:    "License request created",
	}

	jsonData, _ := json.Marshal(logReq)
	req, _ := http.NewRequest("POST", "/api/workflow/activity", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(adminUser))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Verify the activity was logged
	var activity models.ActivityLog
	err := db.First(&activity).Error
	assert.NoError(t, err)
	assert.Equal(t, "created", activity.Action)
}

// TestFileUpload tests the file upload functionality
func TestFileUpload(t *testing.T) {
	router, db := TestSetup(t)

	// Create test users
	adminUser := CreateTestUser(t, db, "admin")

	// Create test license request
	request := CreateTestLicenseRequest(t, db, adminUser.ID)

	// Create a mock file
	fileContent := []byte("test file content")
	file := bytes.NewBuffer(fileContent)

	// Create a multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.pdf")
	part.Write(fileContent)
	writer.WriteField("entity_type", "license_request")
	writer.WriteField("entity_id", fmt.Sprintf("%d", request.ID))
	writer.WriteField("user_id", fmt.Sprintf("%d", adminUser.ID))
	writer.Close()

	req, _ := http.NewRequest("POST", "/api/workflow/files/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(adminUser))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Verify the file was uploaded
	var attachment models.Attachment
	err := db.First(&attachment).Error
	assert.NoError(t, err)
	assert.Equal(t, "test.pdf", attachment.FileName)
}

// TestNotificationSystem tests the notification system
func TestNotificationSystem(t *testing.T) {
	router, db := TestSetup(t)

	// Create test users
	adminUser := CreateTestUser(t, db, "admin")
	staffUser := CreateTestUser(t, db, "dede_staff")

	// Create a notification
	notificationReq := dto.CreateNotificationRequest{
		Title:       "Task Assigned",
		Message:     "You have been assigned a new task",
		Type:        "task_assigned",
		Priority:    "normal",
		RecipientID: &staffUser.ID,
	}

	jsonData, _ := json.Marshal(notificationReq)
	req, _ := http.NewRequest("POST", "/api/workflow/notifications", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(adminUser))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	// Verify the notification was created
	var notification models.Notification
	err := db.First(&notification).Error
	assert.NoError(t, err)
	assert.Equal(t, "Task Assigned", notification.Title)
}

// TestRoleBasedAccessControl tests the role-based access control
func TestRoleBasedAccessControl(t *testing.T) {
	router, db := TestSetup(t)

	// Create test users
	adminUser := CreateTestUser(t, db, "admin")
	staffUser := CreateTestUser(t, db, "dede_staff")

	// Test admin access to admin-only endpoint
	req, _ := http.NewRequest("GET", "/api/admin/users", nil)
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(adminUser))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Test staff access denied to admin-only endpoint
	req, _ = http.NewRequest("GET", "/api/admin/users", nil)
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(staffUser))

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

// TestWorkflowVisualization tests the workflow visualization
func TestWorkflowVisualization(t *testing.T) {
	router, db := TestSetup(t)

	// Create test users
	adminUser := CreateTestUser(t, db, "admin")

	// Create test license request
	request := CreateTestLicenseRequest(t, db, adminUser.ID)

	// Get workflow diagram
	req, _ := http.NewRequest("GET", "/api/workflow/diagram", nil)
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(adminUser))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Get workflow state for specific request
	req, _ = http.NewRequest("GET", fmt.Sprintf("/api/workflow/state/%d", request.ID), nil)
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(adminUser))

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// TestDashboardData tests the dashboard data
func TestDashboardData(t *testing.T) {
	router, db := TestSetup(t)

	// Create test users
	adminUser := CreateTestUser(t, db, "admin")
	headUser := CreateTestUser(t, db, "dede_head")

	// Create test license requests
	for i := 0; i < 5; i++ {
		CreateTestLicenseRequest(t, db, adminUser.ID)
	}

	// Get dashboard data for admin
	req, _ := http.NewRequest("GET", "/api/workflow/dashboard", nil)
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(adminUser))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// Get dashboard data for head
	req, _ = http.NewRequest("GET", "/api/workflow/dashboard", nil)
	req.Header.Set("Authorization", "Bearer "+GenerateTestToken(headUser))

	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

// GenerateTestToken generates a test JWT token
func GenerateTestToken(user *models.User) string {
	// This is a simplified token generation for testing
	// In a real application, you would use a proper JWT library
	return fmt.Sprintf("test_token_%d_%s", user.ID, user.Role)
}

// BenchmarkWorkflowTransition benchmarks the workflow transition
func BenchmarkWorkflowTransition(b *testing.B) {
	router, db := TestSetup(&testing.T{})

	// Create test users
	adminUser := CreateTestUser(&testing.T{}, db, "admin")
	headUser := CreateTestUser(&testing.T{}, db, "dede_head")

	// Create test license requests
	var requests []*models.NewLicenseRequest
	for i := 0; i < b.N; i++ {
		requests = append(requests, CreateTestLicenseRequest(&testing.T{}, db, adminUser.ID))
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		// Test state transition from new_request to accepted
		transitionReq := dto.WorkflowTransitionRequest{
			RequestID:    requests[i].ID,
			TargetState:  "accepted",
			Reason:       "Request accepted for processing",
			AssignedToID: &headUser.ID,
		}

		jsonData, _ := json.Marshal(transitionReq)
		req, _ := http.NewRequest("POST", "/api/workflow/transition", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+GenerateTestToken(adminUser))

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			b.Fatalf("Expected status 200, got %d", w.Code)
		}
	}
}
