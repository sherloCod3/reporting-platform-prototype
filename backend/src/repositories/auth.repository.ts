import type { RowDataPacket } from 'mysql2';
import { authPool } from '../config/authDb.config.js';

// linha de usuário
interface UserRow extends RowDataPacket {
    id: number;
    client_id: number;
    email: string;
    password_hash: string;
    role: 'admin' | 'user' | 'viewer';
    active: 0 | 1;
    client_slug: string;
    client_active: 0 | 1;
}

// linha com conexão do cliente
interface ClientConnRow extends RowDataPacket {
    id: number;
    slug: string;
    db_host: string; // host externo do banco
    db_port: number; // porta de conexão com o host
    db_name: string; // nome da db
    active: 0 | 1;
}

// export do repositório
export const AuthRepository = {
    async findUserByEmail(email: string): Promise<UserRow | null> {
        const [ rows ] = await authPool.execute<UserRow[]>(
            `
            SELECT
                u.id,
                u.client_id,
                u.email,
                u.password_hash,
                u.role,
                u.active,
                c.slug AS client_slug,
                c.active AS client_active
            FROM users u
            INNER JOIN clients c ON c.id = u.client_id
            WHERE u.email = ?
            LIMIT 1
            `,
            [ email ],
        );

        const row = rows[ 0 ]; // primeira linha
        if (!row) return null; // não encontrado
        if (row.active !== 1 || row.client_active !== 1) return null; // inativo
        return row;
    },

    // pega os dados da conexão com o banco/bd cliente (sem user/pass)
    async getClientConnection(clientId: number): Promise<ClientConnRow | null> {
        const [ rows ] = await authPool.execute<ClientConnRow[]>(
            `
            SELECT id, slug, db_host, db_port, db_name, active
            FROM clients
            WHERE id = ?
            LIMIT 1
            `,
            [ clientId ],
        );
        const row = rows[ 0 ];
        if (!row) return null;
        if (row.active !== 1) return null;
        return row;
    },

    async findAllUsers(): Promise<UserRow[]> {
        const [ rows ] = await authPool.execute<UserRow[]>(
            `
            SELECT
                u.id,
                u.client_id,
                u.email,
                u.role,
                u.active,
                c.slug AS client_slug
            FROM users u
            INNER JOIN clients c ON c.id = u.client_id
            WHERE u.active = 1
            ORDER BY u.id DESC
            `
        );
        return rows;
    },

    async createUser(user: { email: string; password_hash: string; role: string; client_id: number }): Promise<number> {
        const [ result ] = await authPool.execute<any>(
            `INSERT INTO users (client_id, email, password_hash, role, active) VALUES (?, ?, ?, ?, 1)`,
            [ user.client_id, user.email, user.password_hash, user.role ]
        );
        return result.insertId;
    },

    async updateUser(id: number, data: { email?: string; password_hash?: string; role?: string; client_id?: number; active?: number }): Promise<void> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.email) { fields.push('email = ?'); values.push(data.email); }
        if (data.password_hash) { fields.push('password_hash = ?'); values.push(data.password_hash); }
        if (data.role) { fields.push('role = ?'); values.push(data.role); }
        if (data.client_id) { fields.push('client_id = ?'); values.push(data.client_id); }
        if (data.active !== undefined) { fields.push('active = ?'); values.push(data.active); }

        if (fields.length === 0) return;

        values.push(id);

        await authPool.execute(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
    },

    async deleteUser(id: number): Promise<void> {
        // Soft delete
        await authPool.execute('UPDATE users SET active = 0 WHERE id = ?', [ id ]);
    }
};