import pool from '../config/database.config.js';
import { validateSql } from './validation.service.js';
import type {
  QueryResult,
  ReportExecutionResult
} from '../types/report.types.js';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { ErrorFactory } from '../types/errors.types.js';

export async function execute(
  sql: string,
  pool: Pool
): Promise<ReportExecutionResult> {
  validateSql(sql);

  const startTime = Date.now();

  const QUERY_TIMEOUT = 30_000;

  const queryPromise = pool.execute<RowDataPacket[]>(sql);

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        ErrorFactory.badRequest(
          'Query excedeu tempo limite',
          'Simplifique a consulta ou adicione filtros (WHERE, LIMIT)'
        )
      );
    }, QUERY_TIMEOUT);
  });

  const [rows, fields] = await Promise.race([queryPromise, timeoutPromise]);

  const duration = Date.now() - startTime;

  const columns = fields.map(field => field.name) || [];

  const MAX_ROWS = 50_000;

  if (Array.isArray(rows) && rows.length > MAX_ROWS) {
    throw ErrorFactory.badRequest(
      `Resultado acima do esperado: ${rows.length.toLocaleString('pt-BR')} linhas`,
      `Use LIMIT ${MAX_ROWS} ou filtro com WHERE`
    );
  }

  const resultData: QueryResult = {
    columns,
    rows,
    rowCount: Array.isArray(rows) ? rows.length : 0,
    duration
  };

  return {
    success: true,
    data: resultData
  };
}
