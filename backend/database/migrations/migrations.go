package migrations

import (
	"eservice-backend/models"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.LicenseRequest{},
		&models.Inspection{},
		&models.AuditReport{},
		&models.Attachment{},
		&models.Notification{},
	)
}
