import app from './server.js';
import { env } from './config/env.config.js';
import { testConnection } from './config/database.config.js';
import { initAuthSchema } from './db/init-schema.js';
import { browserPool } from './config/puppeteer.config.js';
// Init background workers
import './workers/pdf.worker.js';
import { connectRedis, disconnectRedis } from './config/redis.config.js';
import { logger } from './utils/logger.js';

// Inicia o servidor
let serverInstance: any;

async function startServer() {
  try {
    await testConnection();
    await connectRedis();
    await initAuthSchema();
    serverInstance = app.listen(env.PORT, () => {
      logger.info(`Backend rodando na porta ${env.PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

    serverInstance.on('error', (error: any) => {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ err: error }, `Servidor nao iniciado: ${message}`);
      process.exit(1);
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ err: error }, `Falha na inicializacao: ${message}`);
    process.exit(1);
  }
}

startServer();

const gracefullyShutdown = async () => {
  logger.info('Encerrando servidor...');
  try {
    await browserPool.drain().then(() => browserPool.clear());
    logger.info('Pool de browsers encerrado.');
  } catch (err) {
    logger.error({ err }, 'Erro ao encerrar pool');
  }

  try {
    await disconnectRedis();
    logger.info('Conexao Redis encerrada.');
  } catch (err) {
    logger.error({ err }, 'Erro ao desconectar Redis');
  }

  if (serverInstance) {
    serverInstance.close(() => {
      logger.info('Processo finalizado.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefullyShutdown);
process.on('SIGINT', gracefullyShutdown);

export { default } from './server.js';
