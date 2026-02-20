import { Router } from 'express';
import { DbService } from '../services/db.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { ErrorFactory } from '../types/errors.types.js';

const router = Router();

/** GET /db/status - Retorna o status da conexao com o banco */
router.get('/status', authenticate, async (req, res, next) => {
  try {
    if (!req.db) {
      throw ErrorFactory.internal('No database connection available');
    }

    const info = await DbService.getConnectionInfo(req.db);
    const testResult = await DbService.testConnection(req.db);

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
    next(error);
  }
});

/** GET /db/databases - Lista os bancos disponiveis no host conectado */
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

/** POST /db/test - Testa a conectividade com o banco */
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

/** POST /db/switch - Altera o banco ativo no mesmo host. Body: { database: string } */
router.post('/switch', authenticate, async (req, res, next) => {
  try {
    const { database } = req.body;

    if (!database) {
      throw ErrorFactory.badRequest('Database name is required');
    }

    if (!req.user || !req.db) {
      throw ErrorFactory.unauthorized('User not authenticated');
    }

    const clientConnInfo = req.clientConn;

    if (!clientConnInfo) {
      throw ErrorFactory.internal('Client connection info not available');
    }

    const credentials = req.dbCredentials;

    if (!credentials) {
      throw ErrorFactory.internal('Database credentials not available');
    }

    const newPool = await DbService.switchDatabase(
      clientConnInfo.host,
      clientConnInfo.port,
      database,
      credentials
    );

    req.db = newPool;
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
