import rateLimit from 'express-rate-limit';

// rate limiting adaptativo: 
// para endpoints de query mais restritivo
// para endpoints de leitura mais permissivo

export const queryRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 queries/min por IP
    message: {
        success: false,
        message: 'Muitas requisições. Aguarde 1 minuto.',
        hint: 'Limite: 10 queries por minuto'
    },
    standardHeaders: true, // retorna RateLimit e headers
    legacyHeaders: false
});

// Para os endpoints leves (health, export PDF já gerado)
export const generalRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        success: false,
        message: 'Muitas requisições. Aguarde 1 minuto.'
    }
});