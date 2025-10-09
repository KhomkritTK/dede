package database

import (
	"eservice-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedData(db *gorm.DB) error {
	// Create admin user
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)

	adminUser := models.User{
		Username: "admin",
		Email:    "admin@eservice.go.th",
		Password: string(hashedPassword),
		FullName: "System Administrator",
		Role:     models.RoleAdmin,
		Status:   models.UserStatusActive,
	}

	if err := db.Where("username = ?", adminUser.Username).FirstOrCreate(&adminUser).Error; err != nil {
		return err
	}

	// Create DEDE Head user
	dedeHeadUser := models.User{
		Username: "dedehead",
		Email:    "head@eservice.go.th",
		Password: string(hashedPassword),
		FullName: "DEDE Head",
		Role:     models.RoleDEDEHead,
		Status:   models.UserStatusActive,
	}

	if err := db.Where("username = ?", dedeHeadUser.Username).FirstOrCreate(&dedeHeadUser).Error; err != nil {
		return err
	}

	// Create DEDE Staff user
	dedeStaffUser := models.User{
		Username: "dedestaff",
		Email:    "staff@eservice.go.th",
		Password: string(hashedPassword),
		FullName: "DEDE Staff",
		Role:     models.RoleDEDEStaff,
		Status:   models.UserStatusActive,
	}

	if err := db.Where("username = ?", dedeStaffUser.Username).FirstOrCreate(&dedeStaffUser).Error; err != nil {
		return err
	}

	return nil
}
