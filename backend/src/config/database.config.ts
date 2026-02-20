import mysql from 'mysql2/promise';
import { env } from './env.config.js';

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
  try {
    const connection = await dbPool.getConnection();
    console.log('MySQL conectado com sucesso');
    connection.release();
  } catch (error) {
    console.error('Erro ao conectar ao MySQL:', error);
    throw new Error('Falha na conexão com banco de dados');
  }
}

export default dbPool;
