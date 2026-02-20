import { ErrorFactory } from '../types/errors.types.js';

interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export const validationService = {
  async validateQuery(query: string): Promise<ValidationResult> {
    const normalized = query.trim().toUpperCase();

    // Permite apenas SELECT e CTE (WITH)
    if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH')) {
      return {
        isValid: false,
        reason: 'Apenas consultas SELECT e/ou CTE (WITH) são permitidas'
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
export function validateSql(query: string): void {
  validationService.validateQuery(query).then(result => {
    if (!result.isValid) {
      throw ErrorFactory.badRequest(result.reason || 'Query inválida');
    }
  });
}
