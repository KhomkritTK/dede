package database

import (
	"eservice-backend/config"

	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) (*gorm.DB, error) {
	db, err := config.InitDB(cfg)
	if err != nil {
		return nil, err
	}

	DB = db
	return db, nil
}

func GetDB() *gorm.DB {
	return DB
}
