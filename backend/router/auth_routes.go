package router

import (
	"eservice-backend/middleware"
	"eservice-backend/service/auth/handler"

	"github.com/gin-gonic/gin"
)

// SetupAuthRoutes configures authentication routes
func SetupAuthRoutes(r *gin.Engine, authHandler *handler.AuthHandler, jwtSecret string) {
	auth := r.Group("/api/v1/auth")
	{
		// WB-LG-01 (E-License Login) - Existing
		auth.POST("/login", authHandler.Login)
		// TODO: auth.POST("/login-with-otp", authHandler.LoginWithOTP)

		// WB-RG-01 (General User Register) - Existing
		auth.POST("/register", authHandler.Register)
		// TODO: auth.POST("/register-with-otp", authHandler.RegisterWithOTP)
		// TODO: auth.POST("/verify-registration-otp", authHandler.VerifyRegistrationOTP)

		// WB-RG-02 (Corporate Admin Register) - TODO
		// TODO: auth.POST("/register-corporate", authHandler.RegisterCorporate)
		// TODO: auth.POST("/verify-corporate-otp", authHandler.VerifyCorporateOTP)

		// WB-RG-03 (Corporate Member Register) - TODO
		// TODO: auth.POST("/accept-invitation", authHandler.AcceptInvitation)
		// TODO: auth.POST("/register-corporate-member", authHandler.RegisterCorporateMember)

		// General authentication functions - Existing
		auth.POST("/refresh-token", authHandler.RefreshToken)
		auth.POST("/logout", middleware.AuthMiddleware(jwtSecret), authHandler.Logout)
		auth.POST("/change-password", middleware.AuthMiddleware(jwtSecret), authHandler.ChangePassword)
		auth.POST("/forgot-password", authHandler.ForgotPassword)
		auth.POST("/reset-password", authHandler.ResetPassword)

		// OTP functions - TODO
		// TODO: auth.POST("/send-otp", authHandler.SendOTP)
		// TODO: auth.POST("/verify-otp", authHandler.VerifyOTP)
		// TODO: auth.POST("/resend-otp", authHandler.ResendOTP)

		// Profile endpoints (WB-PR-01) - Existing
		auth.GET("/profile", middleware.AuthMiddleware(jwtSecret), authHandler.GetProfile)
		auth.PUT("/profile", middleware.AuthMiddleware(jwtSecret), authHandler.UpdateProfile)

		// Admin endpoints - Existing
		auth.GET("/users", middleware.AuthMiddleware(jwtSecret), middleware.RequireAdminRole(), authHandler.GetUsers)
	}
}
