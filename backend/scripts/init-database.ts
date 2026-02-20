import mysql from 'mysql2/promise';
import { env } from '../src/config/env.config.js';

async function initializeDatabase() {
  console.log('Inicializando banco de dados...\n');

  const connection = await mysql.createConnection({
    host: env.AUTH_DB_HOST,
    port: env.AUTH_DB_PORT,
    user: env.AUTH_DB_USER,
    password: env.AUTH_DB_PASSWORD,
    database: env.AUTH_DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('Conectado ao banco.');

    console.log('Criando tabela clients...');
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
    console.log('Tabela clients criada.');

    console.log('Criando tabela users...');
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
    console.log('Tabela users criada.');

    console.log('Inserindo client padrao...');
    await connection.execute(`
            INSERT INTO clients (slug, name, db_host, db_port, db_name, active)
            VALUES ('default', 'Default Client', 'localhost', 3306, 'relatorios', 1)
            ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
        `);
    console.log('Client padrao inserido/atualizado.');

    const [clients] = await connection.execute(
      'SELECT COUNT(*) as count FROM clients WHERE active = 1'
    );
    console.log(
      `\nSetup concluido. Clients ativos: ${(clients as any)[0].count}`
    );

    console.log('\nProximos passos:');
    console.log('  1. npx tsx scripts/create-user.ts');
    console.log('  2. Criar usuario admin');
    console.log('  3. Iniciar backend: npm run dev');
    console.log('  4. Testar login no frontend\n');
  } catch (error) {
    console.error('Falha ao inicializar banco:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

initializeDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
