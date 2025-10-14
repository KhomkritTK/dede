-- 006_create_new_license_requests_table.sql
-- Create table for new license requests

CREATE TABLE IF NOT EXISTS new_license_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new_request',
    
    -- Project Information
    license_type VARCHAR(20) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_address TEXT NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    subdistrict VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    
    -- Technical Information
    energy_type VARCHAR(50) NOT NULL,
    capacity DECIMAL(10,2) NOT NULL,
    capacity_unit VARCHAR(10) NOT NULL DEFAULT 'MW',
    expected_start_date DATE NOT NULL,
    description TEXT NOT NULL,
    
    -- Contact Information
    contact_person VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    
    -- Workflow Fields
    inspector_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP,
    appointment_date TIMESTAMP,
    inspection_date TIMESTAMP,
    completion_date TIMESTAMP,
    deadline TIMESTAMP,
    rejection_reason TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_new_license_requests_user_id ON new_license_requests(user_id);
CREATE INDEX idx_new_license_requests_request_number ON new_license_requests(request_number);
CREATE INDEX idx_new_license_requests_status ON new_license_requests(status);
CREATE INDEX idx_new_license_requests_license_type ON new_license_requests(license_type);
CREATE INDEX idx_new_license_requests_inspector_id ON new_license_requests(inspector_id);
CREATE INDEX idx_new_license_requests_deleted_at ON new_license_requests(deleted_at);

-- Add comments for documentation
COMMENT ON TABLE new_license_requests IS 'Table for storing new license requests';
COMMENT ON COLUMN new_license_requests.status IS 'Request status: new_request, accepted, rejected, assigned, appointment, inspecting, inspection_done, document_edit, overdue, report_approved, approved, rejected_final';
COMMENT ON COLUMN new_license_requests.license_type IS 'License type: solar, wind, biomass, hydro, waste';
COMMENT ON COLUMN new_license_requests.capacity_unit IS 'Capacity unit: MW, kW, MWp, kWp';