package middleware

import (
	"eservice-backend/models"
	"eservice-backend/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AuthMiddleware validates JWT token and sets user context
func AuthMiddleware(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// Check if the token has the Bearer prefix
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		// Extract the token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token is required"})
			c.Abort()
			return
		}

		// Validate the token
		claims, err := utils.ValidateJWT(tokenString, secretKey)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Get user from database to verify it exists and is active
		db := c.MustGet("db").(*gorm.DB)
		var user models.User
		if err := db.First(&user, claims.UserID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			c.Abort()
			return
		}

		// Check if user is active
		if !user.IsActive() {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User account is not active"})
			c.Abort()
			return
		}

		// Set user in context
		c.Set("user", user)
		c.Set("user_id", user.ID)
		c.Set("user_role", user.Role)

		c.Next()
	}
}

// RequireRole middleware to check if user has required role
func RequireRole(roles []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		userModel, ok := user.(models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user data"})
			c.Abort()
			return
		}

		// Check if user has any of the required roles
		userRole := string(userModel.Role)
		hasRequiredRole := false
		for _, role := range roles {
			if userRole == role {
				hasRequiredRole = true
				break
			}
		}

		if !hasRequiredRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireDEDERole middleware to check if user is any DEDE role
func RequireDEDERole() gin.HandlerFunc {
	return RequireRole([]string{"dede_head", "dede_staff", "dede_consult", "auditor"})
}

// RequireAdminRole middleware to check if user is admin
func RequireAdminRole() gin.HandlerFunc {
	return RequireRole([]string{"admin"})
}

// RequireDEDEHeadOrAdmin middleware to check if user is DEDE Head or Admin
func RequireDEDEHeadOrAdmin() gin.HandlerFunc {
	return RequireRole([]string{"admin", "dede_head"})
}
