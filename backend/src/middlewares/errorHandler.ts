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

  if (process.env.NODE_ENV !== 'production') {
    console.error('Erro nao tratado:', error);
  }
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
}
