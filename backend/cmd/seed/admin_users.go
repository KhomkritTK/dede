package main

import (
	"eservice-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// SeedAdminUsers creates default admin users with different roles
func SeedAdminUsers(db *gorm.DB) error {
	// Check if admin users already exist
	var count int64
	db.Model(&models.User{}).Where("role IN ?", []string{
		"system_admin", "dede_head_admin", "dede_staff_admin", "dede_consult_admin", "auditor_admin",
	}).Count(&count)

	if count > 0 {
		return nil // Admin users already exist
	}

	// Create admin users
	adminUsers := []struct {
		Username   string
		Email      string
		Password   string
		FullName   string
		Role       models.UserRole
		AdminRole  models.AdminRole
		Department string
	}{
		{
			Username:   "sysadmin",
			Email:      "sysadmin@dede.go.th",
			Password:   "admin123",
			FullName:   "System Administrator",
			Role:       models.RoleAdmin,
			AdminRole:  models.AdminRoleSystemAdmin,
			Department: "IT",
		},
		{
			Username:   "dedehead",
			Email:      "head@dede.go.th",
			Password:   "admin123",
			FullName:   "DEDE Head Administrator",
			Role:       models.RoleDEDEHead,
			AdminRole:  models.AdminRoleDEDEHeadAdmin,
			Department: "DEDE",
		},
		{
			Username:   "dedestaff",
			Email:      "staff@dede.go.th",
			Password:   "admin123",
			FullName:   "DEDE Staff Administrator",
			Role:       models.RoleDEDEStaff,
			AdminRole:  models.AdminRoleDEDEStaffAdmin,
			Department: "DEDE",
		},
		{
			Username:   "dedeconsult",
			Email:      "consult@dede.go.th",
			Password:   "admin123",
			FullName:   "DEDE Consultant Administrator",
			Role:       models.RoleDEDEConsult,
			AdminRole:  models.AdminRoleDEDEConsultAdmin,
			Department: "DEDE",
		},
		{
			Username:   "auditor",
			Email:      "auditor@dede.go.th",
			Password:   "admin123",
			FullName:   "Auditor Administrator",
			Role:       models.RoleAuditor,
			AdminRole:  models.AdminRoleAuditorAdmin,
			Department: "Audit",
		},
	}

	// Create users and admin records
	for _, admin := range adminUsers {
		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(admin.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		// Create user
		user := models.User{
			Username: admin.Username,
			Email:    admin.Email,
			Password: string(hashedPassword),
			FullName: admin.FullName,
			Role:     admin.Role,
			Status:   models.UserStatusActive,
		}

		if err := db.Create(&user).Error; err != nil {
			return err
		}

		// Create admin user record
		adminUser := models.AdminUser{
			UserID:     user.ID,
			AdminRole:  admin.AdminRole,
			Department: admin.Department,
		}

		// Set permissions based on role
		permissions := make(map[string][]string)
		switch admin.AdminRole {
		case models.AdminRoleSystemAdmin:
			permissions = map[string][]string{
				"users":       {"create", "read", "update", "delete"},
				"system":      {"read", "update"},
				"licenses":    {"create", "read", "update", "delete"},
				"inspections": {"create", "read", "update", "delete"},
				"audits":      {"create", "read", "update", "delete"},
				"reports":     {"read", "create"},
			}
		case models.AdminRoleDEDEHeadAdmin:
			permissions = map[string][]string{
				"licenses":    {"create", "read", "update", "delete"},
				"inspections": {"create", "read", "update", "delete"},
				"audits":      {"create", "read", "update", "delete"},
				"users":       {"read"},
				"reports":     {"read"},
			}
		case models.AdminRoleDEDEStaffAdmin:
			permissions = map[string][]string{
				"licenses":    {"read", "update"},
				"inspections": {"create", "read", "update"},
				"audits":      {"read"},
				"reports":     {"read"},
			}
		case models.AdminRoleDEDEConsultAdmin:
			permissions = map[string][]string{
				"licenses":    {"read", "update"},
				"inspections": {"read"},
				"audits":      {"create", "read", "update"},
				"reports":     {"read"},
			}
		case models.AdminRoleAuditorAdmin:
			permissions = map[string][]string{
				"licenses":    {"read"},
				"inspections": {"read"},
				"audits":      {"create", "read", "update"},
				"reports":     {"read", "create"},
			}
		}

		if err := adminUser.SetPermissions(permissions); err != nil {
			return err
		}

		if err := db.Create(&adminUser).Error; err != nil {
			return err
		}
	}

	return nil
}
