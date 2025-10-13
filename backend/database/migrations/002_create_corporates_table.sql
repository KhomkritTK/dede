-- 002_create_corporates_table.sql
-- Create corporates table for corporate entity management

CREATE TABLE IF NOT EXISTS corporates (
    id SERIAL PRIMARY KEY,
    corporate_name VARCHAR(200) NOT NULL,
    corporate_name_en VARCHAR(200),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    tax_id VARCHAR(30) UNIQUE,
    corporate_type VARCHAR(50) NOT NULL,
    industry_type VARCHAR(100),
    address TEXT NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    subdistrict VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMP,
    admin_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_corporates_registration_number ON corporates(registration_number);
CREATE INDEX idx_corporates_tax_id ON corporates(tax_id);
CREATE INDEX idx_corporates_admin_user_id ON corporates(admin_user_id);
CREATE INDEX idx_corporates_status ON corporates(status);
CREATE INDEX idx_corporates_corporate_type ON corporates(corporate_type);
CREATE INDEX idx_corporates_deleted_at ON corporates(deleted_at);

-- Add comments for documentation
COMMENT ON TABLE corporates IS 'Corporate entity information for corporate accounts';
COMMENT ON COLUMN corporates.corporate_type IS 'Type of corporate: company, partnership, sole_proprietorship, etc.';
COMMENT ON COLUMN corporates.status IS 'Corporate status: pending, active, suspended, rejected';
COMMENT ON COLUMN corporates.verified_at IS 'Timestamp when corporate was verified';
COMMENT ON COLUMN corporates.admin_user_id IS 'Reference to the corporate admin user';