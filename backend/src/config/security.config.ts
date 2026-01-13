// Limites de segurança

export const SECURITY_LIMITS = {
    // queries
    MAX_QUERY_LENGTH: 35_000,   // 35k caracteres
    MAX_QUERY_TIMEOUT: 30_000,  // 30 segundos
    MAX_RESULT_ROWS: 50_000,    // 50k linhas

    // rate limiting
    QUERY_RATE_LIMIT: {
        windowMs: 60_000,   // 1 minuto
        maxRequests: 10     // 10 queries/min
    },

    GENERAL_RATE_LIMIT: {
        windowMs: 60_000,
        maxRequest: 60      // 60 req/min
    },

    // database
    DB_CONNECTION_TIMEOUT: 15_000,  // 10 segundos
    DB_POOL_SIZE: 10    // 10 conexões simultâneas
} as const;