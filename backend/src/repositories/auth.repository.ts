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
};