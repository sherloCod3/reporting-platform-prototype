import app from './server.js';
import { env } from './config/env.config.js';
import { testConnection } from './config/database.config.js';
import { initAuthSchema } from './db/init-schema.js';
import { browserPool } from './config/puppeteer.config.js';

// Inicia o servidor
let serverInstance: any;

async function startServer() {
  try {
    await testConnection();
    await initAuthSchema();
    serverInstance = app.listen(env.PORT, () => {
      console.log(`Backend rodando na porta ${env.PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Servidor nao iniciado:', message);
    process.exit(1);
  }
}

startServer();

const gracefullyShutdown = async () => {
  console.log('Encerrando servidor...');
  try {
    await browserPool.drain().then(() => browserPool.clear());
    console.log('Pool de browsers encerrado.');
  } catch (err) {
    console.error('Erro ao encerrar pool:', err);
  }
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('Processo finalizado.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefullyShutdown);
process.on('SIGINT', gracefullyShutdown);

export { default } from './server.js';
