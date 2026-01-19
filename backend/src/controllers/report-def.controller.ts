import type { Request, Response, NextFunction } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ErrorFactory } from '../types/errors.types.js';

interface ReportRow extends RowDataPacket {
    id: number;
    name: string;
    description: string;
    sql_query: string;
    layout_json: any; // Stored as JSON
    created_at: Date;
    updated_at: Date;
}

export const ReportDefinitionController = {
    // List all reports
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.db) throw ErrorFactory.unauthorized('Conexão não disponível');

            // Ensure table exists (simple check/creation approach for MVP)
            await ensureTableExists(req.db);

            const [ rows ] = await req.db.execute<ReportRow[]>('SELECT id, name, description, created_at FROM reports ORDER BY created_at DESC');
            res.json(rows);
        } catch (error) {
            next(error);
        }
    },

    // Get single report
    async get(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.db) throw ErrorFactory.unauthorized('Conexão não disponível');
            const { id } = req.params;

            const [ rows ] = await req.db.execute<ReportRow[]>('SELECT * FROM reports WHERE id = ?', [ id ]);
            const report = rows[ 0 ];

            if (!report) throw ErrorFactory.notFound('Relatório não encontrado');

            // Parse JSON if it comes back as string (depends on driver/mysql version)
            if (typeof report.layout_json === 'string') {
                report.layout_json = JSON.parse(report.layout_json);
            }

            res.json(report);
        } catch (error) {
            next(error);
        }
    },

    // Create report
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.db) throw ErrorFactory.unauthorized('Conexão não disponível');
            const { name, description, sql_query, layout_json } = req.body;

            if (!name) throw ErrorFactory.badRequest('Nome é obrigatório');

            await ensureTableExists(req.db);

            const [ result ] = await req.db.execute<ResultSetHeader>(
                'INSERT INTO reports (name, description, sql_query, layout_json, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
                [ name, description || '', sql_query || '', JSON.stringify(layout_json || {}) ]
            );

            res.status(201).json({ id: result.insertId, message: 'Relatório criado com sucesso' });
        } catch (error) {
            next(error);
        }
    },

    // Update report
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.db) throw ErrorFactory.unauthorized('Conexão não disponível');
            const { id } = req.params;
            const { name, description, sql_query, layout_json } = req.body;

            const [ result ] = await req.db.execute<ResultSetHeader>(
                'UPDATE reports SET name = ?, description = ?, sql_query = ?, layout_json = ?, updated_at = NOW() WHERE id = ?',
                [ name, description, sql_query, JSON.stringify(layout_json), id ]
            );

            if (result.affectedRows === 0) throw ErrorFactory.notFound('Relatório não encontrado');

            res.json({ message: 'Relatório atualizado com sucesso' });
        } catch (error) {
            next(error);
        }
    },

    // Delete report
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.db) throw ErrorFactory.unauthorized('Conexão não disponível');
            const { id } = req.params;

            await req.db.execute('DELETE FROM reports WHERE id = ?', [ id ]);
            res.json({ message: 'Relatório excluído' });
        } catch (error) {
            next(error);
        }
    }
};

// Helper to ensure table exists in client DB
async function ensureTableExists(pool: any) {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            sql_query TEXT,
            layout_json JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}
