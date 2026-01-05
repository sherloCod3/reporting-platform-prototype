import pool from '../config/database.config.js';
import { validateSql } from './validation.service.js';

export async function execute(sql: string) {
    validateSql(sql); //Throws se inválido

    const startTime = Date.now();
    const [ rows ] = await pool.execute(sql);
    const duration = Date.now() - startTime;

    if (Array.isArray(rows))
        return {
            success: true,
            data: rows,
            meta: { rowCount: rows.length, duration }
        };
}