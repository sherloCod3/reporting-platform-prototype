import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { pinoHttp } from 'pino-http';
import routes from './routes/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [ 'http://localhost:5173' ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests) if not strict, but here we secure it via list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
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

import { randomUUID } from 'crypto';

app.use(pinoHttp({
  logger,
  genReqId: function (req, res) {
    const existingID = req.id ?? req.headers[ "x-request-id" ];
    if (existingID) return existingID;
    const id = randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
  customSuccessMessage: function (req, res, responseTime) {
    return `[${req.method}] ${req.url} completed in ${responseTime}ms with status ${res.statusCode}`;
  }
}));
app.use('/api', routes);
app.use(errorHandler);

export default app;
