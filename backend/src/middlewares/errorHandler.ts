import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors.types.js';

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      hint: error.hint,
      timestamp: new Date().toISOString()
    });
  }

  // Trata erros de middlewares conhecidos do Express
  // Type patch para propriedades comuns de erro HTTP
  const httpError = error as any;
  if (httpError.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'Sessão inválida ou expirada (CSRF Error)',
      timestamp: new Date().toISOString()
    });
  }

  if (httpError.type === 'entity.too.large' || httpError.statusCode === 413) {
    return res.status(413).json({
      success: false,
      message: 'Payload muito grande',
      timestamp: new Date().toISOString()
    });
  }

  // Verifica se o erro possui um status code embutido (ex: middlewares como body-parser)
  if (httpError.status && typeof httpError.status === 'number') {
    return res.status(httpError.status).json({
      success: false,
      message: httpError.message || 'Erro de processamento',
      timestamp: new Date().toISOString()
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('Erro nao tratado:', error);
  }
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
}
