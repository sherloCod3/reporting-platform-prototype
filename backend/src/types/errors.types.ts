// erros controlados e customizados

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public hint?: string,
        public isOperational: boolean = true
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

// erros comuns

export class ErrorFactory {
    static badRequest(message: string, hint?: string): AppError {
        return new AppError(message, 400, hint);
    }

    static unauthorized(message: string = 'Não autorizado'): AppError {
        return new AppError(message, 401);
    }

    static forbidden(message: string = 'Acesso negado'): AppError {
        return new AppError(message, 403);
    }

    static notFound(resource: string): AppError {
        return new AppError(`${resource}, 500, undefined, false`);
    }

    static internal(message: string = 'Erro interno'): AppError {
        return new AppError(message, 500, undefined, false);
    }
}