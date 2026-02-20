export const SECURITY_LIMITS = {
  MAX_QUERY_LENGTH: 35_000,
  MAX_QUERY_TIMEOUT: 30_000,
  MAX_RESULT_ROWS: 50_000,

  QUERY_RATE_LIMIT: {
    windowMs: 60_000,
    maxRequests: 10
  },

  GENERAL_RATE_LIMIT: {
    windowMs: 60_000,
    maxRequest: 60
  },

  DB_CONNECTION_TIMEOUT: 15_000,
  DB_POOL_SIZE: 10
} as const;
