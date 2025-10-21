-- Create task_assignments table for workflow task management
CREATE TABLE IF NOT EXISTS task_assignments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL,
    license_type VARCHAR(20) NOT NULL,
    assigned_to_id INTEGER NOT NULL REFERENCES users(id),
    assigned_by_id INTEGER NOT NULL REFERENCES users(id),
    assigned_role VARCHAR(50) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    deadline TIMESTAMP,
    appointment_date TIMESTAMP,
    completed_at TIMESTAMP,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_task_assignments_request_id (request_id),
    INDEX idx_task_assignments_assigned_to (assigned_to_id),
    INDEX idx_task_assignments_assigned_by (assigned_by_id),
    INDEX idx_task_assignments_status (status),
    INDEX idx_task_assignments_task_type (task_type),
    INDEX idx_task_assignments_deadline (deadline),
    INDEX idx_task_assignments_deleted_at (deleted_at)
);

-- Create audit_report_versions table for report versioning
CREATE TABLE IF NOT EXISTS audit_report_versions (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES audit_reports(id),
    version_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    findings TEXT,
    recommendations TEXT,
    compliance_status VARCHAR(50),
    risk_level VARCHAR(20),
    corrective_actions TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    submitted_by_id INTEGER NOT NULL REFERENCES users(id),
    reviewed_by_id INTEGER REFERENCES users(id),
    approved_by_id INTEGER REFERENCES users(id),
    rejection_reason TEXT,
    review_comments TEXT,
    file_attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_audit_report_versions_report_id (report_id),
    INDEX idx_audit_report_versions_status (status),
    INDEX idx_audit_report_versions_submitted_by (submitted_by_id),
    INDEX idx_audit_report_versions_deleted_at (deleted_at),
    UNIQUE(report_id, version_number)
);

-- Create workflow_comments table for comment/reject feedback loop
CREATE TABLE IF NOT EXISTS workflow_comments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL,
    license_type VARCHAR(20) NOT NULL,
    comment_type VARCHAR(50) NOT NULL, -- 'feedback', 'rejection', 'note', 'approval'
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER REFERENCES users(id),
    is_internal BOOLEAN DEFAULT FALSE,
    is_visible_to_user BOOLEAN DEFAULT TRUE,
    parent_comment_id INTEGER REFERENCES workflow_comments(id),
    status_before VARCHAR(50),
    status_after VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_workflow_comments_request_id (request_id),
    INDEX idx_workflow_comments_author_id (author_id),
    INDEX idx_workflow_comments_recipient_id (recipient_id),
    INDEX idx_workflow_comments_type (comment_type),
    INDEX idx_workflow_comments_created_at (created_at),
    INDEX idx_workflow_comments_deleted_at (deleted_at)
);

-- Create deadline_reminders table for deadline tracking
CREATE TABLE IF NOT EXISTS deadline_reminders (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL,
    license_type VARCHAR(20) NOT NULL,
    deadline_type VARCHAR(50) NOT NULL, -- 'appointment', 'document_review', 'inspection'
    deadline_date TIMESTAMP NOT NULL,
    reminder_sent_3d BOOLEAN DEFAULT FALSE,
    reminder_sent_1d BOOLEAN DEFAULT FALSE,
    reminder_sent_overdue BOOLEAN DEFAULT FALSE,
    assigned_to_id INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_deadline_reminders_request_id (request_id),
    INDEX idx_deadline_reminders_deadline_date (deadline_date),
    INDEX idx_deadline_reminders_type (deadline_type),
    INDEX idx_deadline_reminders_status (status),
    INDEX idx_deadline_reminders_assigned_to (assigned_to_id),
    INDEX idx_deadline_reminders_deleted_at (deleted_at)
);

-- Create role_dashboards table for role-specific dashboard configurations
CREATE TABLE IF NOT EXISTS role_dashboards (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    dashboard_name VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_id INTEGER NOT NULL REFERENCES users(id),
    updated_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_role_dashboards_role (role),
    INDEX idx_role_dashboards_name (dashboard_name),
    INDEX idx_role_dashboards_is_active (is_active),
    INDEX idx_role_dashboards_deleted_at (deleted_at),
    UNIQUE(role, dashboard_name)
);

-- Create workflow_metrics table for performance tracking
CREATE TABLE IF NOT EXISTS workflow_metrics (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL,
    license_type VARCHAR(20) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'processing_time', 'inspection_time', 'review_time'
    metric_value NUMERIC NOT NULL,
    metric_unit VARCHAR(20) NOT NULL DEFAULT 'days',
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    assigned_to_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_workflow_metrics_request_id (request_id),
    INDEX idx_workflow_metrics_type (metric_type),
    INDEX idx_workflow_metrics_assigned_to (assigned_to_id),
    INDEX idx_workflow_metrics_start_time (start_time),
    INDEX idx_workflow_metrics_end_time (end_time)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_task_assignments_updated_at BEFORE UPDATE ON task_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audit_report_versions_updated_at BEFORE UPDATE ON audit_report_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_comments_updated_at BEFORE UPDATE ON workflow_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deadline_reminders_updated_at BEFORE UPDATE ON deadline_reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_role_dashboards_updated_at BEFORE UPDATE ON role_dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();