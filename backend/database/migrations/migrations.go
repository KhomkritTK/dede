package migrations

import (
	"eservice-backend/models"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	// Migrate User model first since other models depend on it
	if err := db.AutoMigrate(&models.User{}); err != nil {
		return err
	}

	// Skip UserProfile for now due to JSON serialization issues
	// TODO: Fix UserProfile model

	// Migrate other models
	if err := db.AutoMigrate(&models.Corporate{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.CorporateMember{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.OTP{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.LicenseRequest{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.NewLicenseRequest{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.RenewalLicenseRequest{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.ExtensionLicenseRequest{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.ReductionLicenseRequest{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.Inspection{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.AuditReport{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.Attachment{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.Notification{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.ServiceFlowLog{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.AdminUser{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.TaskAssignment{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.AuditReportVersion{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.WorkflowComment{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.DeadlineReminder{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.RoleDashboard{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&models.WorkflowMetric{}); err != nil {
		return err
	}

	return nil
}
