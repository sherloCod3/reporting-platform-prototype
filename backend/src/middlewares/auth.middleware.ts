import type { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2/promise';
import { AuthService } from '../services/auth.service.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { env } from '../config/env.config.js';
import { ErrorFactory } from '../types/errors.types.js';
import { redisClient } from '../config/redis.config.js';

// O pool de conexao precisa viver em memoria (são sockets TCP ativos), 
// entao este cache local permanece para reaproveitar conexoes do mysql2 
// dentro de uma mesma instancia do backend
const poolCache = new Map<string, mysql.Pool>();

const CLIENT_CONN_TTL_MS = 60_000;

// Seleciona credenciais do banco conforme a role do usuario
function pickDbCredential(role: 'admin' | 'user' | 'viewer') {
  if (role === 'admin') {
    return {
      user: env.REPORT_DB_WRITE_USER,
      password: env.REPORT_DB_WRITE_PASSWORD
    };
  }
  return {
    user: env.REPORT_DB_READ_USER,
    password: env.REPORT_DB_READ_PASSWORD
  };
}

function getOrCreatePool(
  clientConn: { host: string; port: number; db: string; slug: string },
  cred: { user: string; password: string }
): mysql.Pool {
  const poolKey = `${clientConn.host}:${clientConn.port}:${clientConn.db}:${cred.user}`;
  let pool = poolCache.get(poolKey);

  if (!pool) {
    const poolConfig: mysql.PoolOptions = {
      host: clientConn.host,
      port: clientConn.port,
      user: cred.user,
      password: cred.password,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 10_000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      idleTimeout: 30_000,
      queueLimit: 0
    };

    // Only set database if it's explicitly provided and not the local auth db
    if (clientConn.db && clientConn.db !== 'relatorios') {
      poolConfig.database = clientConn.db;
    }

    pool = mysql.createPool(poolConfig);

    poolCache.set(poolKey, pool);
  }

  return pool;
}

/**
 * Middleware de autenticacao.
 * Valida o JWT, busca a conexao do cliente e injeta o pool no request.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else {
      const header = req.headers.authorization;
      if (header?.startsWith('Bearer ')) {
        token = header.substring(7);
      }
    }

    if (!token) {
      throw ErrorFactory.unauthorized('Token não fornecido');
    }
    const payload = AuthService.verifyToken(token);
    req.user = payload;

    const cacheKey = `client_conn:${payload.clientId}`;
    const cachedStr = await redisClient.get(cacheKey).catch(() => null);

    let clientConn: {
      host: string;
      port: number;
      db: string;
      slug: string;
    } | null = null;

    if (cachedStr) {
      try {
        clientConn = JSON.parse(cachedStr);
      } catch (e) {
        // Ignora erro de parse e força re-fetch
      }
    }

    if (!clientConn) {
      const row = await AuthRepository.getClientConnection(payload.clientId);
      if (!row) {
        throw ErrorFactory.unauthorized('Cliente inválido ou inativo'); // 401
      }

      clientConn = {
        // Usa host do jumpserver para conexoes externas
        host: env.REPORT_DB_HOST,
        port: row.db_port,
        db: row.db_name,
        slug: row.slug
      };

      // Grava no Redis
      await redisClient.set(cacheKey, JSON.stringify(clientConn), {
        PX: CLIENT_CONN_TTL_MS
      }).catch(err => console.warn('Aviso: Falha ao setar cache Redis:', err));
    }

    // Por seguranca, usa credenciais somente-leitura para todos os usuarios
    const cred = {
      user: env.REPORT_DB_READ_USER,
      password: env.REPORT_DB_READ_PASSWORD
    };

    const requestedDb = req.headers[ 'x-database' ];
    if (requestedDb && typeof requestedDb === 'string') {
      // clientConn was guaranteed to be assigned above
      clientConn = { ...clientConn!, db: requestedDb };
    }

    const pool = getOrCreatePool(clientConn!, cred);

    req.db = pool;
    req.clientConn = clientConn!;
    req.dbCredentials = cred;

    next();
  } catch (err) {
    next(err);
  }
}
