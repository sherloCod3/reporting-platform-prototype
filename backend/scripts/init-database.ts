// Database initialization script
// Creates clients and users tables and seeds default client

import mysql from 'mysql2/promise';
import { env } from '../src/config/env.config.js';

async function initializeDatabase() {
    console.log('🔧 Initializing database...\n');

    const connection = await mysql.createConnection({
        host: env.AUTH_DB_HOST,
        port: env.AUTH_DB_PORT,
        user: env.AUTH_DB_USER,
        password: env.AUTH_DB_PASSWORD,
        database: env.AUTH_DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('✓ Connected to database');

        // Create clients table
        console.log('Creating clients table...');
        await connection.execute(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Clients table created');

        // Create users table
        console.log('Creating users table...');
        await connection.execute(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Users table created');

        // Insert default client
        console.log('Inserting default client...');
        await connection.execute(`
            INSERT INTO clients (slug, name, db_host, db_port, db_name, active)
            VALUES ('default', 'Default Client', 'localhost', 3306, 'relatorios', 1)
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
        `);
        console.log('✓ Default client inserted/updated');

        // Verify setup
        const [ clients ] = await connection.execute('SELECT COUNT(*) as count FROM clients WHERE active = 1');
        console.log(`\n✅ Setup complete! Active clients: ${(clients as any)[ 0 ].count}`);

        console.log('\n📋 Next steps:');
        console.log('   1. Run: npx tsx scripts/create-user.ts');
        console.log('   2. Create your admin user');
        console.log('   3. Start the backend: npm run dev');
        console.log('   4. Test login from frontend\n');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run if executed directly
initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
