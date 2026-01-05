import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Mapear erros MySQL para mensagens amigáveis
    const statusCode = error.statuscode || 500;
    const message = error.userMessage || 'Erro interno';

    res.status(statusCode).json({
        success: false,
        message,
        hint: error.hint
    });
}