import pool from '../config/database.config.js';
import { validateSql } from './validation.service.js';
import type { QueryResult, ReportExecutionResult } from '../types/report.types.js';
import type { RowDataPacket } from 'mysql2';

export async function execute(sql: string): Promise<ReportExecutionResult> {
    validateSql(sql); //Throws se inválido

    const startTime = Date.now();
    const [ rows, fields ] = await pool.execute<RowDataPacket[]>(sql);
    const duration = Date.now() - startTime;

    const columns = fields.map(field => field.name) || [];

    const resultData: QueryResult = {
        columns,
        rows,
        rowCount: Array.isArray(rows) ? rows.length : 0,
        duration
    };

    return {
        success: true,
        data: resultData,
    };
}