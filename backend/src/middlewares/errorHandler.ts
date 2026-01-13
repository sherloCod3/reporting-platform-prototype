import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors.types.js';

export function errorHandler(
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Se o erro já foi tratado passa adiante
    if (res.headersSent) {
        return next(error);
    }

    // Se é AppError (erro controlado)
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            hint: error.hint,
            timestamp: new Date().toISOString()
        });
    }

    // Para erros inesperados, log completo (somente em dev)
    if (process.env.NODE_ENV !== 'production') {
        console.error('⚠️ Erro não tratado:', error);
    }

    // Resposta genérica em produção
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
    });
}