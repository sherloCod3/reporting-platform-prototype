import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { pinoHttp } from 'pino-http';
import routes from './routes/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);

app.use(cookieParser());

// CSRF middleware
app.use(csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
}));

// Limite padrao de 1mb para mitigar ataques de exhaustion de memoria
app.use(express.json({ limit: '1mb' }));

app.use(pinoHttp({ logger }));
app.use('/api', routes);
app.use(errorHandler);

export default app;
