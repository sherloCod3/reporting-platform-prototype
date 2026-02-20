import mysql from 'mysql2/promise';
import { env } from './env.config.js';

// pool dedicado ao banco central de autenticação
export const authPool = mysql.createPool({
  host: env.AUTH_DB_HOST,
  port: env.AUTH_DB_PORT,
  user: env.AUTH_DB_USER,
  password: env.AUTH_DB_PASSWORD,
  database: env.AUTH_DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 15_000
});
