-- 001_create_users_table.sql
-- Create users table for authentication and basic user information

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts for authentication and basic information';
COMMENT ON COLUMN users.role IS 'User role: user, admin, dede_head, dede_staff, dede_consult, auditor';
COMMENT ON COLUMN users.status IS 'User status: active, inactive, suspended';
COMMENT ON COLUMN users.email_verified IS 'Flag indicating if email has been verified';
COMMENT ON COLUMN users.phone_verified IS 'Flag indicating if phone has been verified';