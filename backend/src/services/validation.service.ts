import { ErrorFactory } from '../types/errors.types.js';
import sqlParser from 'node-sql-parser';
const { Parser } = sqlParser;

interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export const validationService = {
  async validateQuery(query: string): Promise<ValidationResult> {
    const MAX_QUERY_LENGTH = 35_000;

    if (!query || query.trim().length === 0) {
      return { isValid: false, reason: 'Query vazia' };
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return {
        isValid: false,
        reason: `Query muito longa. Limite: ${MAX_QUERY_LENGTH.toLocaleString('pt-BR')} caracteres`
      };
    }

    const parser = new Parser();

    try {
      // Parse the SQL query into an AST
      const ast = parser.astify(query, { database: 'MySQL' });

      // astify pode retornar um array de nodes se houver múltiplas statements (separadas por ;)
      const astList = Array.isArray(ast) ? ast : [ ast ];

      // Verifica se TODAS as statements são do tipo 'select'
      const isSelectOnly = astList.every(node => node.type === 'select');

      if (!isSelectOnly) {
        return {
          isValid: false,
          reason: 'Apenas consultas SELECT ou WITH são permitidas. Comandos de modificação (DML/DDL) são proibidos.'
        };
      }

      return { isValid: true };
    } catch (error: any) {
      // Se o parser falhar, a query é malformada ou usa sintaxe não suportada
      return {
        isValid: false,
        reason: `Query SQL inválida ou não suportada: ${error.message}`
      };
    }
  }
};

// TODO: remover apos refatoracao completa do servico
export async function validateSql(query: string): Promise<void> {
  const result = await validationService.validateQuery(query);
  if (!result.isValid) {
    throw ErrorFactory.badRequest(result.reason || 'Query inválida');
  }
}
