import app from './server.js';
import { env } from './config/env.config.js';
import { testConnection } from './config/database.config.js';

// Start server
async function startServer() {
    try {
        await testConnection();
        app.listen(env.PORT, () => {
            console.log(`Backend rodando na porta ${env.PORT}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('⚠️ Servidor não iniciado:', message);
        process.exit(1);
    }
}

startServer();

export { default } from './server.js';
