-- Complete Database Initialization Script
-- Run this once to set up the authentication database

USE relatorios;

-- ============================================
-- DROP EXISTING TABLES (if needed for clean setup)
-- ============================================
-- WARNING: Uncomment only if you want to start fresh
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS clients;

-- ============================================
-- CREATE CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique identifier',
    name VARCHAR(255) NOT NULL COMMENT 'Client display name',
    db_host VARCHAR(255) NOT NULL COMMENT 'External database host',
    db_port INT NOT NULL DEFAULT 3306,
    db_name VARCHAR(100) NOT NULL COMMENT 'External database name',
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (active),
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'viewer') NOT NULL DEFAULT 'user',
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_email_client (email, client_id),
    INDEX idx_email (email),
    INDEX idx_client_id (client_id),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT CLIENT
-- ============================================
INSERT INTO clients (slug, name, db_host, db_port, db_name, active)
VALUES ('default', 'Default Client', 'localhost', 3306, 'relatorios', 1)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- VERIFY SETUP
-- ============================================
SELECT 'Setup complete!' AS status;
SELECT COUNT(*) AS client_count FROM clients WHERE active = 1;
