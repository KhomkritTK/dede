package middleware

import (
	"eservice-backend/models"
	"eservice-backend/utils"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// RoleBasedAccessControl creates a middleware for role-based access control
func RoleBasedAccessControl(requiredRoles ...models.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context (should be set by authentication middleware)
		userInterface, exists := c.Get("user")
		if !exists {
			utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
			c.Abort()
			return
		}

		// Type assert to User model
		user, ok := userInterface.(models.User)
		if !ok {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Invalid user data", nil)
			c.Abort()
			return
		}

		// Check if user has any of the required roles
		hasRequiredRole := false
		for _, role := range requiredRoles {
			if user.Role == role {
				hasRequiredRole = true
				break
			}
		}

		// Admin has access to everything
		if user.Role == "admin" {
			hasRequiredRole = true
		}

		if !hasRequiredRole {
			utils.ErrorResponse(c, http.StatusForbidden, "Access denied: insufficient permissions", nil)
			c.Abort()
			return
		}

		// Set user ID and role in context for use in handlers
		c.Set("userID", user.ID)
		c.Set("userRole", user.Role)

		c.Next()
	}
}

// OwnershipOrRoleAccess creates a middleware that checks if the user owns the resource or has a specific role
func OwnershipOrRoleAccess(getResourceOwnerID func(*gin.Context) *uint, allowedRoles ...models.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context (should be set by authentication middleware)
		userInterface, exists := c.Get("user")
		if !exists {
			utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
			c.Abort()
			return
		}

		// Type assert to User model
		user, ok := userInterface.(models.User)
		if !ok {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Invalid user data", nil)
			c.Abort()
			return
		}

		// Check if user is the owner of the resource
		resourceOwnerID := getResourceOwnerID(c)
		if resourceOwnerID != nil && user.ID == *resourceOwnerID {
			// Set user ID and role in context for use in handlers
			c.Set("userID", user.ID)
			c.Set("userRole", user.Role)
			c.Next()
			return
		}

		// Check if user has any of the allowed roles
		hasAllowedRole := false
		for _, role := range allowedRoles {
			if user.Role == role {
				hasAllowedRole = true
				break
			}
		}

		// Admin has access to everything
		if user.Role == "admin" {
			hasAllowedRole = true
		}

		if !hasAllowedRole {
			utils.ErrorResponse(c, http.StatusForbidden, "Access denied: insufficient permissions", nil)
			c.Abort()
			return
		}

		// Set user ID and role in context for use in handlers
		c.Set("userID", user.ID)
		c.Set("userRole", user.Role)

		c.Next()
	}
}

// DepartmentAccess creates a middleware that checks if the user belongs to the same department as the resource
func DepartmentAccess(getResourceDepartmentID func(*gin.Context) *uint) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context (should be set by authentication middleware)
		userInterface, exists := c.Get("user")
		if !exists {
			utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
			c.Abort()
			return
		}

		// Type assert to User model
		user, ok := userInterface.(models.User)
		if !ok {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Invalid user data", nil)
			c.Abort()
			return
		}

		// Admin has access to everything
		if user.Role == "admin" {
			// Set user ID and role in context for use in handlers
			c.Set("userID", user.ID)
			c.Set("userRole", user.Role)
			c.Next()
			return
		}

		// Get resource department ID
		resourceDepartmentID := getResourceDepartmentID(c)
		if resourceDepartmentID == nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Resource department not specified", nil)
			c.Abort()
			return
		}

		// Check if user belongs to the same department
		// Note: This is a simplified example. In a real application, you would check against the user's department

		// Set user ID and role in context for use in handlers
		c.Set("userID", user.ID)
		c.Set("userRole", user.Role)

		c.Next()
	}
}

// WorkflowStateAccess creates a middleware that checks if the user can access a specific workflow state
func WorkflowStateAccess(getCurrentState func(*gin.Context) (string, error)) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context (should be set by authentication middleware)
		userInterface, exists := c.Get("user")
		if !exists {
			utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
			c.Abort()
			return
		}

		// Type assert to User model
		user, ok := userInterface.(models.User)
		if !ok {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Invalid user data", nil)
			c.Abort()
			return
		}

		// Admin has access to everything
		if user.Role == "admin" {
			// Set user ID and role in context for use in handlers
			c.Set("userID", user.ID)
			c.Set("userRole", user.Role)
			c.Next()
			return
		}

		// Get current state
		currentState, err := getCurrentState(c)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Failed to get current state", err)
			c.Abort()
			return
		}

		// Define role-state access map
		roleStateAccess := map[string]map[string]bool{
			"dede_head": {
				"new_request":           true,
				"accepted":              true,
				"approved":              true,
				"rejected":              true,
				"cancelled":             true,
				"completed":             true,
				"under_review":          true,
				"payment_pending":       true,
				"document_verification": true,
				"site_inspection":       true,
				"final_approval":        true,
				"issued":                true,
				"expired":               true,
				"renewed":               true,
			},
			"dede_staff": {
				"accepted":              true,
				"document_verification": true,
				"site_inspection":       true,
			},
			"dede_consult": {
				"new_request": true,
				"accepted":    true,
			},
		}

		// Check if user role can access current state
		if roleStates, ok := roleStateAccess[string(user.Role)]; ok {
			if canAccess, stateOk := roleStates[currentState]; stateOk && canAccess {
				// Set user ID and role in context for use in handlers
				c.Set("userID", user.ID)
				c.Set("userRole", user.Role)
				c.Next()
				return
			}
		}

		utils.ErrorResponse(c, http.StatusForbidden, "Access denied: cannot access this workflow state", nil)
		c.Abort()
	}
}

// APIKeyAuth creates a middleware for API key authentication
func APIKeyAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get API key from header
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "API key required", nil)
			c.Abort()
			return
		}

		// Validate API key (this is a simplified example)
		// In a real application, you would validate against a database
		if !strings.HasPrefix(apiKey, "dede-") {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid API key", nil)
			c.Abort()
			return
		}

		// Extract user ID from API key (simplified)
		// In a real application, you would look up the user associated with the API key
		userID := uint(1)   // Placeholder
		userRole := "admin" // Placeholder

		// Set user ID and role in context for use in handlers
		c.Set("userID", userID)
		c.Set("userRole", userRole)

		c.Next()
	}
}

// CORS creates a middleware for Cross-Origin Resource Sharing
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// RateLimiter creates a middleware for rate limiting
func RateLimiter() gin.HandlerFunc {
	// This is a placeholder implementation
	// In a real application, you would use a proper rate limiting library
	return func(c *gin.Context) {
		// Set rate limit headers
		c.Header("X-RateLimit-Limit", "100")
		c.Header("X-RateLimit-Remaining", "99")
		c.Header("X-RateLimit-Reset", "1620000000")

		c.Next()
	}
}

// SecurityHeaders creates a middleware for security headers
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Set security headers
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Header("Content-Security-Policy", "default-src 'self'")

		c.Next()
	}
}

// RequestLogger creates a middleware for request logging
func RequestLogger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format("02/Jan/2006:15:04:05 -0700"),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}

// RequestSizeLimit creates a middleware for request size limiting
func RequestSizeLimit(maxSize int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check request size
		if c.Request.ContentLength > maxSize {
			utils.ErrorResponse(c, http.StatusRequestEntityTooLarge, "Request too large", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}
