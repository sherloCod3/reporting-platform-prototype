import mysql from 'mysql2/promise';
import { env } from '../config/env.config.js';
import { ErrorFactory } from '../types/errors.types.js';

/** Servico de gerenciamento de conexoes com bancos externos. */
export const DbService = {
  /** Testa a conectividade executando uma query simples. */
  async testConnection(
    pool: mysql.Pool
  ): Promise<{ success: boolean; message: string; duration: string }> {
    const startTime = Date.now();
    try {
      const [ rows ] = await pool.query('SELECT 1 as test');
      const duration = `${Date.now() - startTime}ms`;

      return {
        success: true,
        message: 'Connection successful',
        duration
      };
    } catch (error: any) {
      console.error('testConnection error', error);
      const duration = `${Date.now() - startTime}ms`;
      throw ErrorFactory.internal(`Database connection test failed: ${error?.message || error}`);
    }
  },

  /** Lista bancos disponiveis, excluindo os de sistema. */
  async listDatabases(pool: mysql.Pool): Promise<string[]> {
    try {
      const [ rows ] = await pool.query<mysql.RowDataPacket[]>('SHOW DATABASES');

      const systemDbs = [
        'information_schema',
        'mysql',
        'performance_schema',
        'sys'
      ];
      const databases = rows
        .map(row => row.Database)
        .filter(db => !systemDbs.includes(db));

      return databases;
    } catch (error) {
      throw ErrorFactory.internal('Failed to list databases');
    }
  },

  /** Retorna informacoes da conexao ativa. */
  async getConnectionInfo(pool: mysql.Pool): Promise<{
    host: string;
    database: string;
    user: string;
  }> {
    try {
      const [ rows ] = await pool.query<mysql.RowDataPacket[]>(
        'SELECT DATABASE() as db, USER() as user, @@hostname as host'
      );

      const info = rows[ 0 ];
      if (!info) {
        throw ErrorFactory.internal('No connection info returned');
      }

      return {
        host: info.host,
        database: info.db || 'none',
        user: info.user
      };
    } catch (error: any) {
      console.error('Erro em getConnectionInfo:', error);
      throw ErrorFactory.internal(`Failed to get connection info: ${error?.message || error}`);
    }
  },

  /** Cria um novo pool apontando para outro banco no mesmo host. */
  async switchDatabase(
    host: string,
    port: number,
    database: string,
    credentials: { user: string; password: string }
  ): Promise<mysql.Pool> {
    try {
      const newPool = mysql.createPool({
        host,
        port,
        user: credentials.user,
        password: credentials.password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 10_000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        idleTimeout: 30_000,
        queueLimit: 0
      });

      await this.testConnection(newPool);

      return newPool;
    } catch (error) {
      throw ErrorFactory.badRequest('Failed to switch database');
    }
  }
};
