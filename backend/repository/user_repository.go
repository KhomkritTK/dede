package repository

import (
	"eservice-backend/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	Create(user *models.User) error
	GetByID(id uint) (*models.User, error)
	GetByUsername(username string) (*models.User, error)
	GetByEmail(email string) (*models.User, error)
	GetAll() ([]models.User, error)
	Update(user *models.User) error
	Delete(id uint) error
	UpdateStatus(id uint, status models.UserStatus) error
	GetByRole(role models.UserRole) ([]models.User, error)
	GetActiveUsers() ([]models.User, error)
	SearchUsers(query string) ([]models.User, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) GetByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetAll() ([]models.User, error) {
	var users []models.User
	err := r.db.Find(&users).Error
	return users, err
}

func (r *userRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) Delete(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}

func (r *userRepository) UpdateStatus(id uint, status models.UserStatus) error {
	return r.db.Model(&models.User{}).Where("id = ?", id).Update("status", status).Error
}

func (r *userRepository) GetByRole(role models.UserRole) ([]models.User, error) {
	var users []models.User
	err := r.db.Where("role = ?", role).Find(&users).Error
	return users, err
}

func (r *userRepository) GetActiveUsers() ([]models.User, error) {
	var users []models.User
	err := r.db.Where("status = ?", models.UserStatusActive).Find(&users).Error
	return users, err
}

func (r *userRepository) SearchUsers(query string) ([]models.User, error) {
	var users []models.User
	searchPattern := "%" + query + "%"
	err := r.db.Where("username LIKE ? OR email LIKE ? OR full_name LIKE ?",
		searchPattern, searchPattern, searchPattern).Find(&users).Error
	return users, err
}
