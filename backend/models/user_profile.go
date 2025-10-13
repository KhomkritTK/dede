package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// Gender represents gender options
type Gender string

const (
	GenderMale           Gender = "male"
	GenderFemale         Gender = "female"
	GenderOther          Gender = "other"
	GenderPreferNotToSay Gender = "prefer_not_to_say"
)

// NotificationSettings represents user notification preferences
type NotificationSettings struct {
	Email bool `json:"email"`
	SMS   bool `json:"sms"`
	Push  bool `json:"push"`
}

// PrivacySettings represents user privacy preferences
type PrivacySettings struct {
	ProfileVisibility   string `json:"profile_visibility"` // public, members, private
	ContactVisibility   string `json:"contact_visibility"` // public, members, private
	ShowEmail           bool   `json:"show_email"`
	ShowPhone           bool   `json:"show_phone"`
	ShowAddress         bool   `json:"show_address"`
	AllowDirectMessages bool   `json:"allow_direct_messages"`
}

// UserProfile represents extended user profile information
type UserProfile struct {
	BaseModel
	UserID                       uint                 `json:"user_id" gorm:"uniqueIndex;not null"`
	User                         *User                `json:"user,omitempty" gorm:"foreignKey:UserID"`
	NationalID                   string               `json:"national_id" gorm:"uniqueIndex"`
	PassportNumber               string               `json:"passport_number" gorm:"uniqueIndex"`
	DateOfBirth                  *time.Time           `json:"date_of_birth"`
	Gender                       Gender               `json:"gender"`
	Nationality                  string               `json:"nationality"`
	Address                      string               `json:"address"`
	Province                     string               `json:"province"`
	District                     string               `json:"district"`
	Subdistrict                  string               `json:"subdistrict"`
	PostalCode                   string               `json:"postal_code"`
	HomePhone                    string               `json:"home_phone"`
	WorkPhone                    string               `json:"work_phone"`
	Fax                          string               `json:"fax"`
	ProfileImage                 string               `json:"profile_image"`
	SignatureImage               string               `json:"signature_image"`
	Preferences                  json.RawMessage      `json:"preferences" gorm:"type:jsonb"`
	NotificationSettings         NotificationSettings `json:"notification_settings" gorm:"type:jsonb"`
	PrivacySettings              PrivacySettings      `json:"privacy_settings" gorm:"type:jsonb"`
	Bio                          string               `json:"bio"`
	Website                      string               `json:"website"`
	LinkedIn                     string               `json:"linkedin"`
	Facebook                     string               `json:"facebook"`
	Twitter                      string               `json:"twitter"`
	EmergencyContactName         string               `json:"emergency_contact_name"`
	EmergencyContactPhone        string               `json:"emergency_contact_phone"`
	EmergencyContactRelationship string               `json:"emergency_contact_relationship"`
}

// TableName specifies the table name for the UserProfile model
func (UserProfile) TableName() string {
	return "user_profiles"
}

// Scan implements the sql.Scanner interface for Preferences
func (up *UserProfile) Scan(value interface{}) error {
	if value == nil {
		up.Preferences = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, &up.Preferences)
}

// Value implements the driver.Valuer interface for Preferences
func (up UserProfile) Value() (driver.Value, error) {
	if up.Preferences == nil {
		return nil, nil
	}
	return json.Marshal(up.Preferences)
}

// GetAge calculates the age from date of birth
func (up *UserProfile) GetAge() *int {
	if up.DateOfBirth == nil {
		return nil
	}

	now := time.Now()
	age := now.Year() - up.DateOfBirth.Year()

	// Adjust age if birthday hasn't occurred this year yet
	if now.Month() < up.DateOfBirth.Month() ||
		(now.Month() == up.DateOfBirth.Month() && now.Day() < up.DateOfBirth.Day()) {
		age--
	}

	return &age
}

// IsAdult checks if the user is 18 years or older
func (up *UserProfile) IsAdult() bool {
	age := up.GetAge()
	return age != nil && *age >= 18
}

// HasCompleteProfile checks if the user has completed their profile
func (up *UserProfile) HasCompleteProfile() bool {
	return up.NationalID != "" &&
		up.Address != "" &&
		up.Province != "" &&
		up.District != "" &&
		up.Subdistrict != "" &&
		up.PostalCode != "" &&
		(up.HomePhone != "" || up.WorkPhone != "")
}

// GetFullName returns the user's full name from the associated user
func (up *UserProfile) GetFullName() string {
	if up.User != nil {
		return up.User.FullName
	}
	return ""
}

// GetEmail returns the user's email from the associated user
func (up *UserProfile) GetEmail() string {
	if up.User != nil {
		return up.User.Email
	}
	return ""
}

// CanDisplayContactInfo checks if contact information can be displayed based on privacy settings
func (up *UserProfile) CanDisplayContactInfo(viewerRole string) bool {
	switch up.PrivacySettings.ContactVisibility {
	case "public":
		return true
	case "members":
		return viewerRole != "" // Anyone with a role can see
	case "private":
		return false
	default:
		return true
	}
}
