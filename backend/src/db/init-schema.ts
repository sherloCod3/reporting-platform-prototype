import { authPool } from '../config/authDb.config.js';
import { logger } from '../utils/logger.js';

export async function initAuthSchema(): Promise<void> {
  try {
    logger.info('Iniciando verificação de schema do banco de autenticação...');

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

    logger.info('Schema inicializado com sucesso.');
  } catch (error) {
    logger.error({ err: error }, 'Erro ao inicializar schema');
    throw error;
  }
}
