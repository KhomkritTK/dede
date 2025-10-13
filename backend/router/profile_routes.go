package router

import (
	"eservice-backend/middleware"
	"eservice-backend/service/profile/handler"

	"github.com/gin-gonic/gin"
)

// SetupProfileRoutes configures user profile management routes (WB-PR-01)
func SetupProfileRoutes(r *gin.Engine, profileHandler *handler.ProfileHandler, jwtSecret string) {
	profile := r.Group("/api/v1/profile")
	profile.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// WB-PR-01 (User Profile Management)
		profile.GET("", profileHandler.GetProfile)                     // Get user profile
		profile.PUT("", profileHandler.UpdateProfile)                  // Update user profile
		profile.PUT("/image", profileHandler.UpdateProfileImage)       // Update profile image
		profile.PUT("/signature", profileHandler.UpdateSignatureImage) // Update signature image

		// Profile preferences and settings
		profile.GET("/preferences", profileHandler.GetPreferences)               // Get user preferences
		profile.PUT("/preferences", profileHandler.UpdatePreferences)            // Update user preferences
		profile.GET("/notifications", profileHandler.GetNotificationSettings)    // Get notification settings
		profile.PUT("/notifications", profileHandler.UpdateNotificationSettings) // Update notification settings
		profile.GET("/privacy", profileHandler.GetPrivacySettings)               // Get privacy settings
		profile.PUT("/privacy", profileHandler.UpdatePrivacySettings)            // Update privacy settings

		// Profile verification
		profile.POST("/verify-email", profileHandler.VerifyEmail)                            // Verify email
		profile.POST("/verify-phone", profileHandler.VerifyPhone)                            // Verify phone
		profile.POST("/request-email-verification", profileHandler.RequestEmailVerification) // Request email verification
		profile.POST("/request-phone-verification", profileHandler.RequestPhoneVerification) // Request phone verification

		// Emergency contact
		profile.GET("/emergency-contact", profileHandler.GetEmergencyContact)    // Get emergency contact
		profile.PUT("/emergency-contact", profileHandler.UpdateEmergencyContact) // Update emergency contact

		// Profile completion
		profile.GET("/completion", profileHandler.GetProfileCompletion) // Get profile completion status
		profile.POST("/complete", profileHandler.CompleteProfile)       // Complete profile
	}
}
