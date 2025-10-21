-- Migration: Create service_flow_logs table
-- Created: 2025-10-17
-- Description: Create table to track status changes for license requests

CREATE TABLE IF NOT EXISTS service_flow_logs (
    id SERIAL PRIMARY KEY,
    license_request_id INTEGER NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER,
    change_reason TEXT,
    license_type VARCHAR(20) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraints
    CONSTRAINT fk_service_flow_logs_changed_by 
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_flow_logs_license_request_id ON service_flow_logs(license_request_id);
CREATE INDEX IF NOT EXISTS idx_service_flow_logs_changed_by ON service_flow_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_service_flow_logs_new_status ON service_flow_logs(new_status);
CREATE INDEX IF NOT EXISTS idx_service_flow_logs_license_type ON service_flow_logs(license_type);
CREATE INDEX IF NOT EXISTS idx_service_flow_logs_created_at ON service_flow_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_service_flow_logs_deleted_at ON service_flow_logs(deleted_at);

-- Add comment to the table
COMMENT ON TABLE service_flow_logs IS 'Tracks all status changes for license requests';
COMMENT ON COLUMN service_flow_logs.license_request_id IS 'ID of the license request';
COMMENT ON COLUMN service_flow_logs.previous_status IS 'Previous status before the change';
COMMENT ON COLUMN service_flow_logs.new_status IS 'New status after the change';
COMMENT ON COLUMN service_flow_logs.changed_by IS 'ID of the user who made the change';
COMMENT ON COLUMN service_flow_logs.change_reason IS 'Reason for the status change';
COMMENT ON COLUMN service_flow_logs.license_type IS 'Type of license request (new, renewal, extension, reduction)';