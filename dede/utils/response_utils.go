package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIResponse represents a standard API response
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// SuccessResponse sends a success response
func SuccessResponse(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// ErrorResponse sends an error response
func ErrorResponse(c *gin.Context, statusCode int, message string, err error) {
	errorMsg := message
	if err != nil {
		errorMsg = err.Error()
	}

	c.JSON(statusCode, APIResponse{
		Success: false,
		Message: message,
		Error:   errorMsg,
	})
}

// SuccessOK sends a 200 OK response
func SuccessOK(c *gin.Context, message string, data interface{}) {
	SuccessResponse(c, http.StatusOK, message, data)
}

// SuccessCreated sends a 201 Created response
func SuccessCreated(c *gin.Context, message string, data interface{}) {
	SuccessResponse(c, http.StatusCreated, message, data)
}

// SuccessAccepted sends a 202 Accepted response
func SuccessAccepted(c *gin.Context, message string, data interface{}) {
	SuccessResponse(c, http.StatusAccepted, message, data)
}

// SuccessNoContent sends a 204 No Content response
func SuccessNoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// ErrorBadRequest sends a 400 Bad Request response
func ErrorBadRequest(c *gin.Context, message string, err error) {
	ErrorResponse(c, http.StatusBadRequest, message, err)
}

// ErrorUnauthorized sends a 401 Unauthorized response
func ErrorUnauthorized(c *gin.Context, message string, err error) {
	ErrorResponse(c, http.StatusUnauthorized, message, err)
}

// ErrorForbidden sends a 403 Forbidden response
func ErrorForbidden(c *gin.Context, message string, err error) {
	ErrorResponse(c, http.StatusForbidden, message, err)
}

// ErrorNotFound sends a 404 Not Found response
func ErrorNotFound(c *gin.Context, message string, err error) {
	ErrorResponse(c, http.StatusNotFound, message, err)
}

// ErrorConflict sends a 409 Conflict response
func ErrorConflict(c *gin.Context, message string, err error) {
	ErrorResponse(c, http.StatusConflict, message, err)
}

// ErrorUnprocessableEntity sends a 422 Unprocessable Entity response
func ErrorUnprocessableEntity(c *gin.Context, message string, err error) {
	ErrorResponse(c, http.StatusUnprocessableEntity, message, err)
}

// ErrorInternalServerError sends a 500 Internal Server Error response
func ErrorInternalServerError(c *gin.Context, message string, err error) {
	ErrorResponse(c, http.StatusInternalServerError, message, err)
}

// ErrorServiceUnavailable sends a 503 Service Unavailable response
func ErrorServiceUnavailable(c *gin.Context, message string, err error) {
	ErrorResponse(c, http.StatusServiceUnavailable, message, err)
}

// ValidationError sends a validation error response
func ValidationError(c *gin.Context, errors interface{}) {
	c.JSON(http.StatusBadRequest, APIResponse{
		Success: false,
		Message: "Validation failed",
		Error:   "Invalid input data",
		Data:    errors,
	})
}
