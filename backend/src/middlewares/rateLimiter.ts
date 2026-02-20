import rateLimit from 'express-rate-limit';

export const queryRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Muitas requisições. Aguarde 1 minuto.',
    hint: 'Limite: 10 queries por minuto'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Muitas requisições. Aguarde 1 minuto.'
  }
});
