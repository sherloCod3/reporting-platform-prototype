import mysql from "mysql2/promise";
import { authPool } from "../config/authDb.config.js";
import type { CreateReportDto, UpdateReportDto } from "../validators/report.schema.js";

export interface Report {
    id: number;
    title: string;
    description?: string | null;
    sqlQuery?: string | null;
    components: any; // components
    created_at: Date;
    updated_at: Date;
}

export class ReportRepository {
    private pool: mysql.Pool;

    constructor() {
        this.pool = authPool;
    }

    async create(data: CreateReportDto): Promise<Report> {
        const [ result ] = await this.pool.execute<mysql.OkPacket>(
            "INSERT INTO reports (name, description, layout_json, sql_query) VALUES (?, ?, ?, ?)",
            [
                data.title,
                data.description || null,
                JSON.stringify(data.components),
                data.sqlQuery || null
            ]
        );

        return {
            id: result.insertId,
            title: data.title,
            description: data.description || null,
            sqlQuery: data.sqlQuery || null,
            components: data.components,
            created_at: new Date(),
            updated_at: new Date(),
        };
    }

    async findById(id: number): Promise<Report | null> {
        const [ rows ] = await this.pool.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM reports WHERE id = ?",
            [ id ]
        );

        if (rows.length === 0) return null;

        const row = rows[ 0 ];
        if (!row) return null;
        let components = [];
        if (row.layout_json) {
            components = typeof row.layout_json === 'string' ? JSON.parse(row.layout_json) : row.layout_json;
        }

        return {
            id: row.id,
            title: row.name, // Map match: DB(name) -> API(title)
            description: row.description,
            sqlQuery: row.sql_query,
            components: components, // Map match: DB(layout_json) -> API(components)
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async update(id: number, data: UpdateReportDto): Promise<Report | null> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.title !== undefined) {
            fields.push("name = ?");
            values.push(data.title);
        }
        if (data.description !== undefined) {
            fields.push("description = ?");
            values.push(data.description);
        }
        if (data.components !== undefined) {
            fields.push("layout_json = ?");
            values.push(JSON.stringify(data.components));
        }
        if (data.sqlQuery !== undefined) {
            fields.push("sql_query = ?");
            values.push(data.sqlQuery);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        await this.pool.execute(
            `UPDATE reports SET ${fields.join(", ")} WHERE id = ?`,
            values
        );

        return this.findById(id);
    }
}
