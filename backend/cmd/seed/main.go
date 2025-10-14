package main

import (
	"fmt"
	"log"
	"time"

	"eservice-backend/config"
	"eservice-backend/database"
	"eservice-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Create tables if they don't exist
	err = db.AutoMigrate(
		&models.User{},
		&models.AdminUser{},
		&models.LicenseRequest{},
		&models.Inspection{},
		&models.AuditReport{},
		&models.Notification{},
		&models.Attachment{},
		&models.ServiceFlowLog{},
		&models.ServiceStatistics{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Seed data
	seedUsers(db)
	seedAdminUsers(db)
	seedLicenseRequests(db)
	seedInspections(db)
	seedAuditReports(db)
	seedNotifications(db)

	fmt.Println("Seed data created successfully!")
}

func seedUsers(db *gorm.DB) {
	// Hash passwords
	adminPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	userPassword, _ := bcrypt.GenerateFromPassword([]byte("user123"), bcrypt.DefaultCost)
	inspectorPassword, _ := bcrypt.GenerateFromPassword([]byte("inspector123"), bcrypt.DefaultCost)

	// Create admin user
	admin := models.User{
		Username: "admin",
		Email:    "admin@dede.go.th",
		Password: string(adminPassword),
		FullName: "Admin User",
		Role:     models.RoleAdmin,
		Phone:    "02-123-4567",
		Company:  "DEDE",
		Address:  "Bangkok, Thailand",
	}
	db.FirstOrCreate(&admin, models.User{Username: "admin"})

	// Create regular user
	user := models.User{
		Username: "user",
		Email:    "user@example.com",
		Password: string(userPassword),
		FullName: "Regular User",
		Role:     models.RoleUser,
		Phone:    "02-234-5678",
		Company:  "Power Production Co.",
		Address:  "Bangkok, Thailand",
	}
	db.FirstOrCreate(&user, models.User{Username: "user"})

	// Create inspector
	inspector := models.User{
		Username: "inspector",
		Email:    "inspector@dede.go.th",
		Password: string(inspectorPassword),
		FullName: "Inspector User",
		Role:     models.RoleDEDEStaff,
		Phone:    "02-345-6789",
		Company:  "DEDE",
		Address:  "Bangkok, Thailand",
	}
	db.FirstOrCreate(&inspector, models.User{Username: "inspector"})

	fmt.Println("Users seeded successfully!")
}

func seedLicenseRequests(db *gorm.DB) {
	var admin, user models.User
	db.Where("username = ?", "admin").First(&admin)
	db.Where("username = ?", "user").First(&user)

	// Create sample license requests
	requests := []models.LicenseRequest{
		{
			RequestNumber:     "REQ-2024-001",
			UserID:            user.ID,
			LicenseType:       models.LicenseTypeNew,
			Status:            models.StatusNewRequest,
			Title:             "Solar Power Plant Installation Request",
			Description:       "Request for installation of 5MW solar power plant in Bangkok",
			CurrentCapacity:   0,
			RequestedCapacity: 5,
			Location:          "Bangkok, Thailand",
			AssignedByID:      &admin.ID,
			AssignedAt:        &[]time.Time{time.Now().AddDate(0, 0, -29)}[0],
			CreatedAt:         time.Now().AddDate(0, 0, -30),
			UpdatedAt:         time.Now().AddDate(0, 0, -29),
		},
		{
			RequestNumber:     "REQ-2024-002",
			UserID:            user.ID,
			LicenseType:       models.LicenseTypeNew,
			Status:            models.StatusAssigned,
			Title:             "Wind Power Project",
			Description:       "Request for installation of 10MW wind power project",
			CurrentCapacity:   0,
			RequestedCapacity: 10,
			Location:          "Chonburi, Thailand",
			AssignedByID:      &admin.ID,
			AssignedAt:        &[]time.Time{time.Now().AddDate(0, 0, -19)}[0],
			CreatedAt:         time.Now().AddDate(0, 0, -20),
			UpdatedAt:         time.Now().AddDate(0, 0, -19),
		},
		{
			RequestNumber:     "REQ-2024-003",
			UserID:            user.ID,
			LicenseType:       models.LicenseTypeNew,
			Status:            models.StatusApproved,
			Title:             "Biomass Energy Project",
			Description:       "Request for installation of 3MW biomass power plant",
			CurrentCapacity:   0,
			RequestedCapacity: 3,
			Location:          "Rayong, Thailand",
			AssignedByID:      &admin.ID,
			AssignedAt:        &[]time.Time{time.Now().AddDate(0, 0, -9)}[0],
			AppointmentDate:   &[]time.Time{time.Now().AddDate(0, 0, -15)}[0],
			InspectionDate:    &[]time.Time{time.Now().AddDate(0, 0, -10)}[0],
			CompletionDate:    &[]time.Time{time.Now().AddDate(0, 0, -5)}[0],
			CreatedAt:         time.Now().AddDate(0, 0, -10),
			UpdatedAt:         time.Now().AddDate(0, 0, -9),
		},
	}

	for _, req := range requests {
		db.FirstOrCreate(&req, models.LicenseRequest{RequestNumber: req.RequestNumber})
	}

	fmt.Println("License requests seeded successfully!")
}

func seedInspections(db *gorm.DB) {
	var inspector models.User
	var requests []models.LicenseRequest
	db.Where("username = ?", "inspector").First(&inspector)
	db.Find(&requests)

	// Create sample inspections
	inspections := []models.Inspection{
		{
			RequestID:     requests[0].ID,
			InspectorID:   inspector.ID,
			Status:        models.InspectionStatusScheduled,
			ScheduledDate: time.Now().AddDate(0, 0, 5),
			ScheduledTime: "10:00",
			Location:      "Bangkok, Thailand",
			Purpose:       "Initial inspection for solar power plant installation",
		},
		{
			RequestID:       requests[1].ID,
			InspectorID:     inspector.ID,
			Status:          models.InspectionStatusInProgress,
			ScheduledDate:   time.Now().AddDate(0, 0, -5),
			ScheduledTime:   "14:00",
			Location:        "Chonburi, Thailand",
			Purpose:         "Inspection for wind power project",
			ActualStartDate: &[]time.Time{time.Now().AddDate(0, 0, -5)}[0],
		},
		{
			RequestID:       requests[2].ID,
			InspectorID:     inspector.ID,
			Status:          models.InspectionStatusCompleted,
			ScheduledDate:   time.Now().AddDate(0, 0, -15),
			ScheduledTime:   "09:00",
			Location:        "Rayong, Thailand",
			Purpose:         "Final inspection for biomass power plant",
			ActualStartDate: &[]time.Time{time.Now().AddDate(0, 0, -15)}[0],
			ActualEndDate:   &[]time.Time{time.Now().AddDate(0, 0, -10)}[0],
			Findings:        "Installation meets all requirements",
			Recommendations: "Regular maintenance recommended",
		},
	}

	for _, inspection := range inspections {
		db.FirstOrCreate(&inspection, models.Inspection{
			RequestID: inspection.RequestID,
		})
	}

	fmt.Println("Inspections seeded successfully!")
}

func seedAuditReports(db *gorm.DB) {
	var inspector models.User
	var inspections []models.Inspection
	db.Where("username = ?", "inspector").First(&inspector)
	db.Find(&inspections)

	// Create sample audit reports
	reports := []models.AuditReport{
		{
			RequestID:        inspections[2].RequestID,
			InspectionID:     inspections[2].ID,
			InspectorID:      inspector.ID,
			Status:           models.ReportStatusApproved,
			ReportNumber:     "RPT-2024-001",
			Title:            "Solar Power Plant Inspection Report",
			Summary:          "The installation meets all technical and safety requirements",
			Findings:         "The installation meets all technical and safety requirements. The system is properly grounded and all components are installed according to the manufacturer specifications.",
			Recommendations:  "Regular maintenance recommended",
			ComplianceStatus: "compliant",
			RiskLevel:        "low",
			SubmittedAt:      &[]time.Time{time.Now().AddDate(0, 0, -8)}[0],
			ApprovedAt:       &[]time.Time{time.Now().AddDate(0, 0, -6)}[0],
			CreatedAt:        time.Now().AddDate(0, 0, -8),
			UpdatedAt:        time.Now().AddDate(0, 0, -6),
		},
	}

	for _, report := range reports {
		db.FirstOrCreate(&report, models.AuditReport{
			InspectionID: report.InspectionID,
		})
	}

	fmt.Println("Audit reports seeded successfully!")
}

func seedNotifications(db *gorm.DB) {
	var admin, user, inspector models.User
	inspectorRole := models.RoleDEDEStaff

	db.Where("username = ?", "admin").First(&admin)
	db.Where("username = ?", "user").First(&user)
	db.Where("username = ?", "inspector").First(&inspector)

	// Create sample notifications
	notifications := []models.Notification{
		// Admin notifications
		{
			Title:       "New License Request Submitted",
			Message:     "A new license request has been submitted by Regular User",
			Type:        models.NotificationTypeRequestSubmitted,
			Priority:    models.PriorityNormal,
			RecipientID: &admin.ID,
			CreatedAt:   time.Now().AddDate(0, 0, -1),
		},
		// User notifications
		{
			Title:       "License Request Approved",
			Message:     "Your license request has been approved",
			Type:        models.NotificationTypeRequestAccepted,
			Priority:    models.PriorityHigh,
			RecipientID: &user.ID,
			CreatedAt:   time.Now().AddDate(0, 0, -5),
		},
		{
			Title:       "Inspection Scheduled",
			Message:     "Your inspection has been scheduled for next week",
			Type:        models.NotificationTypeAppointmentSet,
			Priority:    models.PriorityNormal,
			RecipientID: &user.ID,
			IsRead:      true,
			ReadAt:      &[]time.Time{time.Now().AddDate(0, 0, -2)}[0],
			CreatedAt:   time.Now().AddDate(0, 0, -3),
		},
		// Inspector notifications
		{
			Title:       "New Inspection Assigned",
			Message:     "You have been assigned to a new inspection",
			Type:        models.NotificationTypeRequestAssigned,
			Priority:    models.PriorityHigh,
			RecipientID: &inspector.ID,
			CreatedAt:   time.Now().AddDate(0, 0, -2),
		},
		// Role-based notifications
		{
			Title:         "System Maintenance",
			Message:       "The system will be under maintenance tomorrow from 2:00 AM to 4:00 AM",
			Type:          models.NotificationTypeSystemAnnouncement,
			Priority:      models.PriorityNormal,
			RecipientRole: &inspectorRole,
			CreatedAt:     time.Now().AddDate(0, 0, -7),
		},
	}

	for _, notification := range notifications {
		db.FirstOrCreate(&notification, models.Notification{
			Title: notification.Title,
		})
	}

	fmt.Println("Notifications seeded successfully!")
}

// SeedAdminUsers creates default admin users with different roles
func seedAdminUsers(db *gorm.DB) {
	// Check if admin users already exist
	var count int64
	db.Model(&models.User{}).Where("role IN ?", []string{
		"system_admin", "dede_head_admin", "dede_staff_admin", "dede_consult_admin", "auditor_admin",
	}).Count(&count)

	if count > 0 {
		fmt.Println("Admin users already exist!")
		return
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
			log.Fatal("Failed to hash password:", err)
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
			log.Fatal("Failed to create user:", err)
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
			log.Fatal("Failed to set permissions:", err)
		}

		if err := db.Create(&adminUser).Error; err != nil {
			log.Fatal("Failed to create admin user:", err)
		}
	}

	fmt.Println("Admin users seeded successfully!")
}
