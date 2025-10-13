package middleware

import (
	"eservice-backend/models"
	"eservice-backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// OTPMiddleware validates OTP for specific operations
func OTPMiddleware(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		otpHeader := c.GetHeader("X-OTP-Token")
		if otpHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "OTP token is required"})
			c.Abort()
			return
		}

		// Validate OTP token (this would be a JWT token containing OTP info)
		claims, err := utils.ValidateJWT(otpHeader, secretKey)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid OTP token"})
			c.Abort()
			return
		}

		// Set OTP claims in context
		c.Set("otp_claims", claims)
		c.Next()
	}
}

// CorporateMemberMiddleware checks if user is a member of the corporate
func CorporateMemberMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		corporateIDStr := c.Param("id")
		if corporateIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Corporate ID is required"})
			c.Abort()
			return
		}

		var corporateMember models.CorporateMember
		err := db.Where("corporate_id = ? AND user_id = ? AND status = ?",
			corporateIDStr, userID, models.MemberStatusActive).
			First(&corporateMember).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Not a member of this corporate"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			c.Abort()
			return
		}

		// Set corporate member info in context
		c.Set("corporate_member", corporateMember)
		c.Set("member_role", corporateMember.MemberRole)
		c.Next()
	}
}

// CorporateAdminMiddleware checks if user is admin or manager of the corporate
func CorporateAdminMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		corporateIDStr := c.Param("id")
		if corporateIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Corporate ID is required"})
			c.Abort()
			return
		}

		var corporateMember models.CorporateMember
		err := db.Where("corporate_id = ? AND user_id = ? AND status = ? AND member_role IN ?",
			corporateIDStr, userID, models.MemberStatusActive,
			[]models.MemberRole{models.MemberRoleAdmin, models.MemberRoleManager}).
			First(&corporateMember).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Insufficient permissions"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			c.Abort()
			return
		}

		// Set corporate member info in context
		c.Set("corporate_member", corporateMember)
		c.Set("member_role", corporateMember.MemberRole)
		c.Next()
	}
}

// EmailVerifiedMiddleware checks if user's email is verified
func EmailVerifiedMiddleware() gin.HandlerFunc {
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

		if !userModel.EmailVerified {
			c.JSON(http.StatusForbidden, gin.H{"error": "Email verification required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// PhoneVerifiedMiddleware checks if user's phone is verified
func PhoneVerifiedMiddleware() gin.HandlerFunc {
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

		if !userModel.PhoneVerified {
			c.JSON(http.StatusForbidden, gin.H{"error": "Phone verification required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// ProfileCompleteMiddleware checks if user has completed their profile
func ProfileCompleteMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		var userProfile models.UserProfile
		err := db.Where("user_id = ?", userID).First(&userProfile).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "Profile completion required"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			c.Abort()
			return
		}

		if !userProfile.HasCompleteProfile() {
			c.JSON(http.StatusForbidden, gin.H{"error": "Profile completion required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RateLimitMiddleware implements basic rate limiting
func RateLimitMiddleware(requests int, window int) gin.HandlerFunc {
	// This is a simplified version - in production, you'd use Redis or similar
	return func(c *gin.Context) {
		// TODO: Implement proper rate limiting using Redis or in-memory store
		// For now, just pass through
		c.Next()
	}
}
