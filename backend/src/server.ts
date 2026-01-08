import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { env } from './config/env.config.js'

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// parser JSON - transforma body em objeto - limite de até 50mb de arquivo HTML
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => requestLogger(req, res, next));
app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`QReports Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;