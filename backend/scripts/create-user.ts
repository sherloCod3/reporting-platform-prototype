import 'dotenv/config';
import readline from 'readline';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { env } from '../src/config/env.config.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

async function main() {
  console.log('\n--- Create New User ---\n');

  try {
    const email = await question('Email: ');
    if (!email) throw new Error('Email is required');

    const password = await question('Password: ');
    if (!password) throw new Error('Password is required');

    const role =
      (await question('Role (admin/user/viewer) [default: user]: ')) || 'user';

    console.log('\nListando clients ativos...');

    const pool = mysql.createPool({
      host: env.AUTH_DB_HOST,
      port: env.AUTH_DB_PORT,
      user: env.AUTH_DB_USER,
      password: env.AUTH_DB_PASSWORD,
      database: env.AUTH_DB_NAME
    });

    console.log('Connecting to DB with:', {
      host: env.AUTH_DB_HOST,
      port: env.AUTH_DB_PORT,
      user: env.AUTH_DB_USER,
      db: env.AUTH_DB_NAME
    });

    const [clients]: any = await pool.execute(
      'SELECT id, slug FROM clients WHERE active = 1'
    );

    if (clients.length === 0) {
      console.error(
        'No active clients found. Please create a client in the database first.'
      );
      process.exit(1);
    }

    console.table(clients);

    const clientIdStr = await question('Client ID: ');
    const clientId = Number(clientIdStr);
    if (isNaN(clientId)) throw new Error('Invalid Client ID');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Insert
    await pool.execute(
      `INSERT INTO users (client_id, email, password_hash, role, active) VALUES (?, ?, ?, ?, ?)`,
      [clientId, email, hash, role, 1]
    );

    console.log(`\nUsuario ${email} criado com sucesso.`);

    await pool.end();
  } catch (err: any) {
    console.error('\nERRO:');
    console.error(err);
    if (err.message) console.error('Message:', err.message);
    if (err.code) console.error('Code:', err.code);
    if (err.errno) console.error('Errno:', err.errno);
    if (err.sqlMessage) console.error('SQL Message:', err.sqlMessage);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();
