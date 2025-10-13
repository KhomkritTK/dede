-- 005_create_user_profiles_table.sql
-- Create user_profiles table for extended user information

CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    national_id VARCHAR(20) UNIQUE,
    passport_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    nationality VARCHAR(50),
    address TEXT,
    province VARCHAR(100),
    district VARCHAR(100),
    subdistrict VARCHAR(100),
    postal_code VARCHAR(10),
    home_phone VARCHAR(20),
    work_phone VARCHAR(20),
    fax VARCHAR(20),
    profile_image VARCHAR(255),
    signature_image VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "contact_visibility": "members"}',
    bio TEXT,
    website VARCHAR(255),
    linkedin VARCHAR(255),
    facebook VARCHAR(255),
    twitter VARCHAR(255),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_national_id ON user_profiles(national_id);
CREATE INDEX idx_user_profiles_passport_number ON user_profiles(passport_number);
CREATE INDEX idx_user_profiles_date_of_birth ON user_profiles(date_of_birth);
CREATE INDEX idx_user_profiles_gender ON user_profiles(gender);
CREATE INDEX idx_user_profiles_nationality ON user_profiles(nationality);
CREATE INDEX idx_user_profiles_deleted_at ON user_profiles(deleted_at);

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_user_profiles_preferences ON user_profiles USING GIN(preferences);
CREATE INDEX idx_user_profiles_notification_settings ON user_profiles USING GIN(notification_settings);
CREATE INDEX idx_user_profiles_privacy_settings ON user_profiles USING GIN(privacy_settings);

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'Extended user profile information';
COMMENT ON COLUMN user_profiles.preferences IS 'User preferences in JSON format';
COMMENT ON COLUMN user_profiles.notification_settings IS 'Notification preferences in JSON format';
COMMENT ON COLUMN user_profiles.privacy_settings IS 'Privacy settings in JSON format';
COMMENT ON COLUMN user_profiles.profile_image IS 'URL or path to profile image';
COMMENT ON COLUMN user_profiles.signature_image IS 'URL or path to signature image';
COMMENT ON COLUMN user_profiles.gender IS 'Gender: male, female, other, prefer_not_to_say';
COMMENT ON COLUMN user_profiles.nationality IS 'Country of citizenship';