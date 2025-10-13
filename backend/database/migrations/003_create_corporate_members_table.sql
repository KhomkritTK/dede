-- 003_create_corporate_members_table.sql
-- Create corporate_members table for managing corporate member relationships

CREATE TABLE IF NOT EXISTS corporate_members (
    id SERIAL PRIMARY KEY,
    corporate_id INTEGER NOT NULL REFERENCES corporates(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_role VARCHAR(50) NOT NULL DEFAULT 'member',
    position VARCHAR(100),
    department VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    invited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    invitation_token VARCHAR(255) UNIQUE,
    invitation_token_expires_at TIMESTAMP,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    UNIQUE(corporate_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_corporate_members_corporate_id ON corporate_members(corporate_id);
CREATE INDEX idx_corporate_members_user_id ON corporate_members(user_id);
CREATE INDEX idx_corporate_members_invited_by ON corporate_members(invited_by);
CREATE INDEX idx_corporate_members_invitation_token ON corporate_members(invitation_token);
CREATE INDEX idx_corporate_members_status ON corporate_members(status);
CREATE INDEX idx_corporate_members_member_role ON corporate_members(member_role);
CREATE INDEX idx_corporate_members_deleted_at ON corporate_members(deleted_at);

-- Add comments for documentation
COMMENT ON TABLE corporate_members IS 'Corporate member relationships and invitations';
COMMENT ON COLUMN corporate_members.member_role IS 'Member role: admin, manager, member, viewer';
COMMENT ON COLUMN corporate_members.status IS 'Member status: pending, active, declined, left';
COMMENT ON COLUMN corporate_members.invited_by IS 'User who sent the invitation';
COMMENT ON COLUMN corporate_members.invitation_token IS 'Token for invitation acceptance';
COMMENT ON COLUMN corporate_members.invitation_token_expires_at IS 'Expiration time for invitation token';
COMMENT ON COLUMN corporate_members.joined_at IS 'Timestamp when member joined the corporate';
COMMENT ON COLUMN corporate_members.left_at IS 'Timestamp when member left the corporate';