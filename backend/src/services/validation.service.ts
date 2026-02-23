import { ErrorFactory } from '../types/errors.types.js';

interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export const validationService = {
  async validateQuery(query: string): Promise<ValidationResult> {
    const normalized = query.trim().toUpperCase();

    // Permite consultas de leitura e exploratórias
    const allowedPrefixes = [ 'SELECT', 'WITH', 'SHOW', 'DESCRIBE', 'EXPLAIN' ];
    const isAllowed = allowedPrefixes.some(prefix => normalized.startsWith(prefix));

    if (!isAllowed) {
      return {
        isValid: false,
        reason: 'Apenas consultas SELECT, WITH, SHOW, DESCRIBE ou EXPLAIN são permitidas'
      };
    }

    // Remove literais de string antes de checar comandos proibidos (evita falso positivo)
    const sqlWithoutStrings = normalized.replace(/'[^']*'/g, '');

    const forbidden = [
      'DROP',
      'DELETE',
      'UPDATE',
      'ALTER',
      'TRUNCATE',
      'INSERT'
    ];
    const found = forbidden.find(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(sqlWithoutStrings);
    });

    if (found) {
      return { isValid: false, reason: `Comando ${found} não é permitido` };
    }

    const MAX_QUERY_LENGTH = 35_000;

    if (query.length > MAX_QUERY_LENGTH) {
      return {
        isValid: false,
        reason: `Query muito longa. Limite: ${MAX_QUERY_LENGTH.toLocaleString('pt-BR')} caracteres`
      };
    }

    if (query.length === 0) {
      return { isValid: false, reason: 'Query vazia' };
    }

    return { isValid: true };
  }
};

// TODO: remover apos refatoracao completa do servico
export async function validateSql(query: string): Promise<void> {
  const result = await validationService.validateQuery(query);
  if (!result.isValid) {
    throw ErrorFactory.badRequest(result.reason || 'Query inválida');
  }
}
