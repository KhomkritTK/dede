package router

import (
	"eservice-backend/service/otp/handler"

	"github.com/gin-gonic/gin"
)

// SetupOTPRoutes configures OTP management routes
func SetupOTPRoutes(r *gin.Engine, otpHandler *handler.OTPHandler) {
	otp := r.Group("/api/v1/otp")
	{
		// OTP generation and sending (public endpoints)
		otp.POST("/generate", otpHandler.GenerateOTP) // Generate OTP
		otp.POST("/send", otpHandler.SendOTP)         // Send OTP
		otp.POST("/resend", otpHandler.ResendOTP)     // Resend OTP

		// OTP verification (public endpoints)
		otp.POST("/verify", otpHandler.VerifyOTP)                   // Verify OTP
		otp.POST("/verify-purpose", otpHandler.VerifyOTPForPurpose) // Verify OTP for specific purpose

		// OTP management (authenticated endpoints)
		otp.DELETE("/:id", otpHandler.InvalidateOTP)               // Invalidate OTP
		otp.DELETE("/user/:userId", otpHandler.InvalidateUserOTPs) // Invalidate user OTPs
		otp.POST("/cleanup", otpHandler.CleanupExpiredOTPs)        // Cleanup expired OTPs (admin only)

		// OTP status and history (authenticated endpoints)
		otp.GET("/:id", otpHandler.GetOTPStatus)                       // Get OTP status
		otp.GET("/user/:userId/history", otpHandler.GetUserOTPHistory) // Get user OTP history

		// Rate limiting and security (public endpoints)
		otp.POST("/check-rate-limit", otpHandler.CheckRateLimit) // Check rate limit
		otp.GET("/attempts", otpHandler.GetRemainingAttempts)    // Get remaining attempts

		// OTP configuration (admin only)
		otp.GET("/config", otpHandler.GetOTPConfig)    // Get OTP configuration
		otp.PUT("/config", otpHandler.UpdateOTPConfig) // Update OTP configuration
	}
}
