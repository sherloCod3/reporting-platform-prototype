import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Configure JSON body parser with increased limit for large payloads (e.g., HTML content)
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => requestLogger(req, res, next));
app.use('/api', routes);
app.use(errorHandler);

export default app;