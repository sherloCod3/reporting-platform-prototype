import mysql from 'mysql2/promise';
import { env } from './env.config.js';

export const dbPool = mysql.createPool({
    host: env.AUTH_DB_HOST,
    user: env.AUTH_DB_USER,
    password: env.AUTH_DB_PASSWORD,
    database: env.AUTH_DB_NAME,

    // pool config
    waitForConnections: true,
    connectionLimit: 10,

    // Timeout para controle de queries individuais pesadas
    connectTimeout: 15_000, // 15 segundos para conectar

    timezone: '+00:00' // UTC
});

export async function testConnection(): Promise<void> {
    try {
        const connection = await dbPool.getConnection();
        console.log('MySQL conectado com sucesso');
        connection.release();
    } catch (error) {
        console.error('❌ Erro ao conectar ao MySQL:', error);
        throw new Error('Falha na conexão com banco de dados');
    }
}

export default dbPool;