import app from './server.js';
import { env } from './config/env.config.js';

app.listen(env.PORT, () => {
    console.log(`🚀 Backend rodando na porta ${env.PORT}`);
})