-- Database Schema for QReports Authentication System
-- Multi-tenant architecture with clients and users

-- ============================================
-- CLIENTS TABLE
-- ============================================
-- Stores information about each client/tenant
-- Each client has their own external database for reports
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique identifier for the client (e.g., "acme-corp")',
    name VARCHAR(255) NOT NULL COMMENT 'Client display name',
    
    -- External database connection details
    db_host VARCHAR(255) NOT NULL COMMENT 'External database host',
    db_port INT NOT NULL DEFAULT 3306 COMMENT 'External database port',
    db_name VARCHAR(100) NOT NULL COMMENT 'External database name',
    
    -- Status and metadata
    active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (active),
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Client/tenant information with external database configuration';

-- ============================================
-- USERS TABLE
-- ============================================
-- Stores user authentication and authorization data
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL COMMENT 'Reference to clients table',
    email VARCHAR(255) NOT NULL COMMENT 'User email (login)',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
    role ENUM('admin', 'user', 'viewer') NOT NULL DEFAULT 'user' COMMENT 'User role/permissions',
    
    -- Status and metadata
    active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive/deleted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL COMMENT 'Last successful login timestamp',
    
    -- Foreign key and indexes
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_email_client (email, client_id) COMMENT 'Email must be unique per client',
    INDEX idx_email (email),
    INDEX idx_client_id (client_id),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User authentication and authorization data';
