import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { env } from '../src/config/env.config.js';

async function main() {
    console.log('\n--- Restore Admin User ---\n');

    const targetEmail = 'alexandre.cavalari@doqr.com.br';
    const defaultPassword = 'ChangeMe123!';
    const targetRole = 'admin';

    let pool;

    try {
        pool = mysql.createPool({
            host: env.AUTH_DB_HOST,
            port: env.AUTH_DB_PORT,
            user: env.AUTH_DB_USER,
            password: env.AUTH_DB_PASSWORD,
            database: env.AUTH_DB_NAME
        });

        console.log('Connecting to DB...');

        // 1. Get a valid client
        const [ clients ]: any = await pool.execute('SELECT id FROM clients WHERE active = 1 LIMIT 1');

        if (clients.length === 0) {
            console.error('❌ No active clients found. Cannot create/restore user without a client.');
            process.exit(1);
        }

        const clientId = clients[ 0 ].id;
        console.log(`Using Client ID: ${clientId}`);

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(defaultPassword, salt);

        // 3. Check if user exists
        const [ users ]: any = await pool.execute('SELECT id FROM users WHERE email = ?', [ targetEmail ]);

        if (users.length > 0) {
            console.log(`User ${targetEmail} exists. Updating password and role...`);
            await pool.execute(
                `UPDATE users SET password_hash = ?, role = ?, active = 1, client_id = ? WHERE email = ?`,
                [ hash, targetRole, clientId, targetEmail ]
            );
            console.log(`✅ User ${targetEmail} updated successfully!`);
        } else {
            console.log(`User ${targetEmail} does not exist. Creating...`);
            await pool.execute(
                `INSERT INTO users (client_id, email, password_hash, role, active) VALUES (?, ?, ?, ?, ?)`,
                [ clientId, targetEmail, hash, targetRole, 1 ]
            );
            console.log(`✅ User ${targetEmail} created successfully!`);
        }

    } catch (err: any) {
        console.error('\n❌ ERROR DETAILS:', err);
    } finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}

main();
