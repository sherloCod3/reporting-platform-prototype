import mysql from 'mysql2/promise';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

export const dbPool = mysql.createPool({
  host: env.AUTH_DB_HOST,
  user: env.AUTH_DB_USER,
  password: env.AUTH_DB_PASSWORD,
  database: env.AUTH_DB_NAME,
  port: env.AUTH_DB_PORT,

  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 15_000,
  timezone: '+00:00'
});

export async function testConnection(): Promise<void> {
  let connection;
  try {
    connection = await dbPool.getConnection();
    await connection.ping();
    logger.info('MySQL conectado com sucesso');
  } catch (error) {
    logger.error({ err: error }, 'Erro ao conectar ao MySQL');
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export default dbPool;
