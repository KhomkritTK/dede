-- Create admin_users table for role-based admin access
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_role VARCHAR(50) NOT NULL DEFAULT 'admin',
    department VARCHAR(100),
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(admin_role);

-- Insert default admin users with different roles
INSERT INTO admin_users (user_id, admin_role, department, permissions) VALUES
-- System Administrator
(1, 'system_admin', 'IT', '{"users": ["create", "read", "update", "delete"], "system": ["read", "update"]}'),

-- DEDE Head Administrator
(2, 'dede_head_admin', 'DEDE', '{"licenses": ["create", "read", "update", "delete"], "inspections": ["create", "read", "update", "delete"], "audits": ["create", "read", "update", "delete"], "users": ["read"], "reports": ["read"]}'),

-- DEDE Staff Administrator
(3, 'dede_staff_admin', 'DEDE', '{"licenses": ["read", "update"], "inspections": ["create", "read", "update"], "audits": ["read"], "reports": ["read"]}'),

-- DEDE Consultant Administrator
(4, 'dede_consult_admin', 'DEDE', '{"licenses": ["read", "update"], "inspections": ["read"], "audits": ["create", "read", "update"], "reports": ["read"]}'),

-- Auditor Administrator
(5, 'auditor_admin', 'Audit', '{"licenses": ["read"], "inspections": ["read"], "audits": ["create", "read", "update"], "reports": ["read", "create"]}')
ON CONFLICT (user_id) DO NOTHING;

-- Create service_flow_logs table to track service request flows
CREATE TABLE IF NOT EXISTS service_flow_logs (
    id SERIAL PRIMARY KEY,
    license_request_id INTEGER REFERENCES license_requests(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for service flow logs
CREATE INDEX IF NOT EXISTS idx_service_flow_logs_request_id ON service_flow_logs(license_request_id);
CREATE INDEX IF NOT EXISTS idx_service_flow_logs_changed_by ON service_flow_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_service_flow_logs_created_at ON service_flow_logs(created_at);

-- Create service_statistics table for dashboard analytics
CREATE TABLE IF NOT EXISTS service_statistics (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    license_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stat_date, license_type, status)
);

-- Create indexes for service statistics
CREATE INDEX IF NOT EXISTS idx_service_statistics_date ON service_statistics(stat_date);
CREATE INDEX IF NOT EXISTS idx_service_statistics_type ON service_statistics(license_type);
CREATE INDEX IF NOT EXISTS idx_service_statistics_status ON service_statistics(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_statistics_updated_at BEFORE UPDATE ON service_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();