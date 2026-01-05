// server.ts (20 linhas)
import express from 'express';
import reportRoutes from './routes/index.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import router from './routes/report.routes.js';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use('/api', reportRoutes);
app.use((req, res, next) => requestLogger(req, res, next));
app.use(router);
app.use(errorHandler);

app.listen(3000);

export default app;