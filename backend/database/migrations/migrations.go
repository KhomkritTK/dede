package migrations

import (
	"eservice-backend/models"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Corporate{},
		&models.CorporateMember{},
		&models.UserProfile{},
		&models.OTP{},
		&models.LicenseRequest{},
		&models.NewLicenseRequest{},
		&models.RenewalLicenseRequest{},
		&models.ExtensionLicenseRequest{},
		&models.ReductionLicenseRequest{},
		&models.Inspection{},
		&models.AuditReport{},
		&models.Attachment{},
		&models.Notification{},
		&models.ServiceFlowLog{},
		&models.AdminUser{},
		&models.TaskAssignment{},
		&models.AuditReportVersion{},
		&models.WorkflowComment{},
		&models.DeadlineReminder{},
		&models.RoleDashboard{},
		&models.WorkflowMetric{},
	)
}
