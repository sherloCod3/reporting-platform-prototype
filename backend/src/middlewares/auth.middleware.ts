import type { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2/promise';
import { AuthService } from '../services/auth.service.js'; // verifyToken
import { AuthRepository } from '../repositories/auth.repository.js'; // client conn
import { env } from '../config/env.config.js';
import { ErrorFactory } from '../types/errors.types.js';

// cache de pool por destino + credencial (evita recriar conexões)
const poolCache = new Map<string, mysql.Pool>();

// cache de conexão do cliente (evita bater sempre no auth db)
const clientConnCache = new Map<number, {
    value: { host: string; port: number; db: string; slug: string }
    expiresAt: number;
}>();

const CLIENT_CONN_TTL_MS = 60_000; // verificar com testes se é necessário alterar

// escolhe qual credencial usar baseado no role
function pickDbCredential(role: 'admin' | 'user' | 'viewer') {
    if (role === 'admin') {
        // Admin gets write access
        return { user: env.REPORT_DB_WRITE_USER, password: env.REPORT_DB_WRITE_PASSWORD };
    }
    // user and viewer only get read access
    return { user: env.REPORT_DB_READ_USER, password: env.REPORT_DB_READ_PASSWORD };
}

function getOrCreatePool(
    clientConn: { host: string; port: number; db: string; slug: string },
    cred: { user: string; password: string }
): mysql.Pool {
    const poolKey = `${clientConn.host}:${clientConn.port}:${clientConn.db}:${cred.user}`; // key única
    let pool = poolCache.get(poolKey);

    if (!pool) {
        pool = mysql.createPool({
            host: clientConn.host,
            port: clientConn.port,
            user: cred.user, // user fixo (powerbi)
            password: cred.password, // password fixa
            database: clientConn.db,
            waitForConnections: true,
            connectionLimit: 10,
            connectTimeout: 10_000,
        });

        poolCache.set(poolKey, pool); // guarda pool
        console.log(`Pool externo criado: ${clientConn.slug} (${cred.user})`); // log para depuração
    }

    return pool;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) { // validação do formato
            throw ErrorFactory.unauthorized('Token não fornecido'); // (401)
        }

        const token = header.substring(7); // remove a palavra "Bearer"
        const payload = AuthService.verifyToken(token);
        req.user = payload; // injeta o usuário no request

        // tenta pegar conn do cache
        const cached = clientConnCache.get(payload.clientId);
        const now = Date.now();

        let clientConn: { host: string; port: number; db: string; slug: string } | null = null;

        if (cached && cached.expiresAt > now) { // verifica se o cache é válido
            clientConn = cached.value;
        } else {
            const row = await AuthRepository.getClientConnection(payload.clientId); // busca no auth db
            if (!row) {
                throw ErrorFactory.unauthorized('Cliente inválido ou inativo'); // 401
            }

            clientConn = { // montagem do conn
                host: row.db_host,
                port: row.db_port,
                db: row.db_name,
                slug: row.slug
            };

            clientConnCache.set(payload.clientId, {
                value: clientConn,
                expiresAt: now + CLIENT_CONN_TTL_MS,
            });
        }

        const cred = pickDbCredential(payload.role); // escolhe credencial

        const pool = getOrCreatePool(clientConn, cred); // resolve pool sem undefined
        req.db = pool; // injeta pool no request
        next();
    } catch (err) {
        next(err); // manda para o error handler
    }
}
