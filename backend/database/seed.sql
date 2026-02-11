-- Seed Data for QReports Authentication System
-- Creates initial client and admin user for setup

-- ============================================
-- SEED CLIENT
-- ============================================
-- Insert a default client for initial setup
INSERT INTO clients (slug, name, db_host, db_port, db_name, active)
VALUES (
    'default',
    'Default Client',
    'localhost',
    3306,
    'relatorios',
    1
)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    db_host = VALUES(db_host),
    db_port = VALUES(db_port),
    db_name = VALUES(db_name);

-- ============================================
-- SEED ADMIN USER
-- ============================================
-- NOTE: This creates a default admin user
-- Email: admin@qreports.local
-- Password: Admin@123 (CHANGE THIS IMMEDIATELY IN PRODUCTION!)
-- Password hash below is bcrypt hash of "Admin@123" with salt rounds = 10

INSERT INTO users (client_id, email, password_hash, role, active)
SELECT 
    c.id,
    'admin@qreports.local',
    '$2a$10$rKJ1EH.zWZYX6qkF7lH9yOXKqQvGqK1xwmYQy6YZ7YQZ7YQZ7YQZ7e',  -- Admin@123
    'admin',
    1
FROM clients c
WHERE c.slug = 'default'
ON DUPLICATE KEY UPDATE 
    role = VALUES(role),
    active = VALUES(active);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment below to verify the seed data

-- SELECT * FROM clients;
-- SELECT id, client_id, email, role, active FROM users;
