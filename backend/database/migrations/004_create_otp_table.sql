-- 004_create_otp_table.sql
-- Create otp table for One-Time Password verification

CREATE TABLE IF NOT EXISTS otp_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    identifier VARCHAR(100) NOT NULL, -- email or phone number
    otp_type VARCHAR(20) NOT NULL, -- email, phone
    purpose VARCHAR(20) NOT NULL, -- registration, login, password_reset, email_verify, phone_verify
    code VARCHAR(10) NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX idx_otp_codes_identifier ON otp_codes(identifier);
CREATE INDEX idx_otp_codes_otp_type ON otp_codes(otp_type);
CREATE INDEX idx_otp_codes_purpose ON otp_codes(purpose);
CREATE INDEX idx_otp_codes_code ON otp_codes(code);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);
CREATE INDEX idx_otp_codes_is_used ON otp_codes(is_used);

-- Add comments for documentation
COMMENT ON TABLE otp_codes IS 'One-Time Password codes for verification purposes';
COMMENT ON COLUMN otp_codes.identifier IS 'Email address or phone number';
COMMENT ON COLUMN otp_codes.otp_type IS 'Type of OTP: email, phone';
COMMENT ON COLUMN otp_codes.purpose IS 'Purpose of OTP: registration, login, password_reset, email_verify, phone_verify';
COMMENT ON COLUMN otp_codes.attempts IS 'Number of verification attempts made';
COMMENT ON COLUMN otp_codes.max_attempts IS 'Maximum allowed verification attempts';
COMMENT ON COLUMN otp_codes.verified_at IS 'Timestamp when OTP was successfully verified';
COMMENT ON COLUMN otp_codes.is_used IS 'Flag indicating if OTP has been used';