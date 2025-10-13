package router

import (
	"eservice-backend/middleware"
	"eservice-backend/service/corporate/handler"

	"github.com/gin-gonic/gin"
)

// SetupCorporateRoutes configures corporate management routes
func SetupCorporateRoutes(r *gin.Engine, corporateHandler *handler.CorporateHandler, jwtSecret string) {
	corporate := r.Group("/api/v1/corporates")
	corporate.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// Corporate management
		corporate.POST("", corporateHandler.CreateCorporate)       // Create corporate
		corporate.GET("/:id", corporateHandler.GetCorporate)       // Get corporate by ID
		corporate.PUT("/:id", corporateHandler.UpdateCorporate)    // Update corporate
		corporate.DELETE("/:id", corporateHandler.DeleteCorporate) // Delete corporate
		corporate.GET("", corporateHandler.ListCorporates)         // List corporates

		// Corporate member management
		corporate.POST("/:id/members", corporateHandler.AddMember)                // Add member to corporate
		corporate.GET("/:id/members/:memberId", corporateHandler.GetMember)       // Get member by ID
		corporate.PUT("/:id/members/:memberId", corporateHandler.UpdateMember)    // Update member
		corporate.DELETE("/:id/members/:memberId", corporateHandler.RemoveMember) // Remove member
		corporate.GET("/:id/members", corporateHandler.ListMembers)               // List members

		// Member invitation management
		corporate.POST("/:id/invite", corporateHandler.InviteMember)                          // Invite member
		corporate.GET("/invitation/:token", corporateHandler.GetInvitation)                   // Get invitation by token
		corporate.POST("/invitation/:token/accept", corporateHandler.AcceptInvitation)        // Accept invitation
		corporate.POST("/invitation/:token/decline", corporateHandler.DeclineInvitation)      // Decline invitation
		corporate.DELETE("/:id/invitations/:invitationId", corporateHandler.CancelInvitation) // Cancel invitation
		corporate.GET("/:id/invitations", corporateHandler.ListInvitations)                   // List invitations

		// Corporate verification (admin only)
		corporate.POST("/:id/verify", middleware.RequireAdminRole(), corporateHandler.VerifyCorporate) // Verify corporate
		corporate.GET("/:id/verification", corporateHandler.GetVerificationStatus)                     // Get verification status

		// Corporate settings
		corporate.GET("/:id/settings", corporateHandler.GetSettings)    // Get corporate settings
		corporate.PUT("/:id/settings", corporateHandler.UpdateSettings) // Update corporate settings

		// Member role management
		corporate.PUT("/:id/members/:memberId/role", corporateHandler.UpdateMemberRole)            // Update member role
		corporate.GET("/:id/members/:memberId/permissions", corporateHandler.GetMemberPermissions) // Get member permissions
	}

	// Public routes (no authentication required)
	public := r.Group("/api/v1/public")
	{
		public.GET("/invitation/:token", corporateHandler.GetPublicInvitation) // Get public invitation info
	}
}
