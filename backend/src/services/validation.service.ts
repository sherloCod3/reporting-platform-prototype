import { ErrorFactory } from "../types/errors.types.js";

// Valida se o SQL é seguro para execução (@throws {AppError} se a query for invalidada)

export function validateSql(query: string): void {
    const normalized = query.trim().toUpperCase();

    // Regra 1: Apenas SELECT
    if (!normalized.startsWith('SELECT') || !normalized.startsWith('WITH')) {
        throw ErrorFactory.badRequest(
            'Apenas consultas SELECT e/ou CTE (WITH) são permitidas'
        );
    }

    // Regra 2: Comandos perigosos
    const forbidden = [ 'DROP', 'DELETE', 'UPDATE', 'ALTER', 'TRUNCATE', 'INSERT' ];
    const found = forbidden.find(word => normalized.includes(word));

    if (found) {
        throw ErrorFactory.badRequest(
            `Comando ${found} não é permitido`,
            'Use apenas SELECT para consultas'
        );
    }

    // Regra 3: limite de tamanho da query de acordo com a rotina
    const MAX_QUERY_LENGTH = 35_000;

    if (query.length > MAX_QUERY_LENGTH) {
        throw ErrorFactory.badRequest(
            'Query muito longa',
            `Limite: ${MAX_QUERY_LENGTH.toLocaleString('pt-BR')} caracteres`
        );
    }
}