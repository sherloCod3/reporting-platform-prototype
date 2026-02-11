import { Router } from 'express';
import { DbService } from '../services/db.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { ErrorFactory } from '../types/errors.types.js';

const router = Router();

/**
 * GET /db/status
 * Returns the current database connection status and information.
 */
router.get('/status', authenticate, async (req, res, next) => {
    try {
        console.log('🔍 DB Status endpoint hit');
        console.log('🔍 req.db exists:', !!req.db);
        console.log('🔍 req.user:', req.user);

        if (!req.db) {
            console.log('❌ No database pool available');
            throw ErrorFactory.internal('No database connection available');
        }

        console.log('✅ About to call DbService.getConnectionInfo');
        const info = await DbService.getConnectionInfo(req.db);
        console.log('✅ Got connection info:', info);

        console.log('✅ About to call DbService.testConnection');
        const testResult = await DbService.testConnection(req.db);
        console.log('✅ Got test result:', testResult);

        res.json({
            success: true,
            data: {
                connected: testResult.success,
                host: info.host,
                database: info.database,
                user: info.user,
                latency: testResult.duration
            }
        });
    } catch (error) {
        console.error('💥 Error in /db/status:', error);
        next(error);
    }
});

/**
 * GET /db/databases
 * Lists all available databases on the connected host.
 */
router.get('/databases', authenticate, async (req, res, next) => {
    try {
        if (!req.db) {
            throw ErrorFactory.internal('No database connection available');
        }

        const databases = await DbService.listDatabases(req.db);

        res.json({
            success: true,
            data: {
                databases,
                count: databases.length
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /db/test
 * Executes a test query to verify database connectivity.
 */
router.post('/test', authenticate, async (req, res, next) => {
    try {
        if (!req.db) {
            throw ErrorFactory.internal('No database connection available');
        }

        const result = await DbService.testConnection(req.db);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /db/switch
 * Switches to a different database on the same host.
 * Body: { database: string }
 */
router.post('/switch', authenticate, async (req, res, next) => {
    try {
        const { database } = req.body;

        if (!database) {
            throw ErrorFactory.badRequest('Database name is required');
        }

        if (!req.user || !req.db) {
            throw ErrorFactory.unauthorized('User not authenticated');
        }

        // Get current connection info to extract host and port
        const currentInfo = await DbService.getConnectionInfo(req.db);

        // Note: We need host and port from the client connection
        // This will be extracted from the auth middleware context
        const clientConnInfo = req.clientConn;

        if (!clientConnInfo) {
            throw ErrorFactory.internal('Client connection info not available');
        }

        // Get credentials based on user role
        const credentials = req.dbCredentials;

        if (!credentials) {
            throw ErrorFactory.internal('Database credentials not available');
        }

        // Switch to the new database
        const newPool = await DbService.switchDatabase(
            clientConnInfo.host,
            clientConnInfo.port,
            database,
            credentials
        );

        // Update the request database pool
        req.db = newPool;

        // Get new connection info
        const newInfo = await DbService.getConnectionInfo(newPool);

        res.json({
            success: true,
            data: {
                message: 'Database switched successfully',
                database: newInfo.database,
                host: newInfo.host
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
