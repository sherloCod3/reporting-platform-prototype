import mysql from 'mysql2/promise';
import { env } from '../config/env.config.js';
import { ErrorFactory } from '../types/errors.types.js';

/**
 * Database connection service for managing external database connections.
 * Handles connection testing, database listing, and connection status tracking.
 */
export const DbService = {
    /**
     * Tests the connection to a database pool.
     * Executes a simple query to verify connectivity.
     */
    async testConnection(pool: mysql.Pool): Promise<{ success: boolean; message: string; duration: string }> {
        const startTime = Date.now();
        try {
            const [ rows ] = await pool.query('SELECT 1 as test');
            const duration = `${Date.now() - startTime}ms`;

            return {
                success: true,
                message: 'Connection successful',
                duration
            };
        } catch (error) {
            const duration = `${Date.now() - startTime}ms`;
            throw ErrorFactory.internal('Database connection test failed');
        }
    },

    /**
     * Lists all databases available on the connected MySQL host.
     * Excludes system databases.
     */
    async listDatabases(pool: mysql.Pool): Promise<string[]> {
        try {
            const [ rows ] = await pool.query<mysql.RowDataPacket[]>(
                'SHOW DATABASES'
            );

            // Filter out system databases
            const systemDbs = [ 'information_schema', 'mysql', 'performance_schema', 'sys' ];
            const databases = rows
                .map(row => row.Database)
                .filter(db => !systemDbs.includes(db));

            return databases;
        } catch (error) {
            throw ErrorFactory.internal('Failed to list databases');
        }
    },

    /**
     * Gets information about the current database connection.
     */
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
        } catch (error) {
            console.error('💥 Original error in getConnectionInfo:', error);
            throw ErrorFactory.internal('Failed to get connection info');
        }
    },

    /**
     * Switches to a different database on the existing connection pool.
     * Creates a new pool with the specified database.
     */
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
            });

            // Test the new connection
            await this.testConnection(newPool);

            return newPool;
        } catch (error) {
            throw ErrorFactory.badRequest('Failed to switch database');
        }
    }
};
