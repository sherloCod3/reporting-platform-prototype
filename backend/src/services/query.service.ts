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
  pool: Pool,
  page: number = 1,
  pageSize: number = 500
): Promise<ReportExecutionResult> {
  await validateSql(sql);

  const startTime = Date.now();
  const offset = (page - 1) * pageSize;

  try {
    const QUERY_TIMEOUT = 30_000;

    // Remove trailing semicolon if present to wrap it properly
    const cleanSql = sql.trim().replace(/;$/, '');

    // 1. Get total rows count
    const countQuery = `SELECT COUNT(*) as total FROM (${cleanSql}) AS count_query_wrapper`;

    // 2. Wrap original query with pagination
    const dataQuery = `SELECT * FROM (${cleanSql}) AS data_query_wrapper LIMIT ? OFFSET ?`;

    const queryPromise = async () => {
      // Run count and data sequentially for safety or use Promise.all
      const [ countRows ] = await pool.execute<RowDataPacket[]>(countQuery);
      const totalRows = (countRows?.[ 0 ]?.total) ? Number(countRows[ 0 ].total) : 0;

      const [ rows, fields ] = await pool.execute<RowDataPacket[]>(dataQuery, [ String(pageSize), String(offset) ]);
      return { totalRows, rows, fields };
    };

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          ErrorFactory.badRequest(
            'Query excedeu tempo limite',
            'Simplifique a consulta ou adicione filtros (WHERE)'
          )
        );
      }, QUERY_TIMEOUT);
    });

    const { totalRows, rows, fields } = await Promise.race([ queryPromise(), timeoutPromise ]);

    const duration = Date.now() - startTime;

    const columns = fields.map(field => field.name) || [];

    const resultData: QueryResult = {
      columns,
      rows,
      rowCount: Array.isArray(rows) ? rows.length : 0,
      duration,
      page,
      pageSize,
      totalRows,
      totalPages: Math.ceil(totalRows / pageSize)
    };

    return {
      success: true,
      data: resultData
    };


  } catch (error: any) {
    console.error('queryService.execute error:', error?.message || error);
    throw ErrorFactory.badRequest(`Database execution failed: ${error?.message || error}`);
  }
}
