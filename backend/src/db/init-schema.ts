import { authPool } from '../config/authDb.config.js';

export async function initAuthSchema(): Promise<void> {
  try {
    console.log('Iniciando verificação de schema do banco de autenticação...');

    // Tabela de definicoes de relatorios
    await authPool.execute(`
            CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                sql_query TEXT,
                layout_json JSON,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

    console.log('Schema inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar schema:', error);
    throw error;
  }
}
