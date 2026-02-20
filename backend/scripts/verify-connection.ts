import mysql from 'mysql2/promise';
import fs from 'fs';
import { env } from '../src/config/env.config.js';
import { authPool } from '../src/config/authDb.config.js';

const LOG_FILE = 'verification.log';

function log(data: any) {
  fs.appendFileSync(LOG_FILE, JSON.stringify(data, null, 2) + '\n');
}

async function verify() {
  fs.writeFileSync(LOG_FILE, 'START_VERIFICATION\n');
  try {
    const [rows] = await authPool.execute<any[]>(
      'SELECT db_name, db_port, slug FROM clients WHERE active = 1 LIMIT 1'
    );

    if (rows.length === 0) {
      log({ error: 'No active clients found' });
      process.exit(0);
    }

    const client = rows[0];
    const clientConn = {
      host: env.REPORT_DB_HOST,
      user: env.REPORT_DB_READ_USER,
      password: env.REPORT_DB_READ_PASSWORD,
      database: client.db_name, // Add database back for proper connection test
      port: client.db_port || 3306,
      connectTimeout: 20000
    };

    log({
      step: 'connecting',
      config: {
        ...clientConn,
        password: clientConn.password
          ? clientConn.password.substring(0, 3) + '***'
          : 'undefined'
      },
      original_client_data: client
    });

    const connection = await mysql.createConnection(clientConn);
    log({ step: 'connected' });

    const [result] = await connection.execute('SELECT 1 as val');
    log({ step: 'query_success', result });

    await connection.end();
    log({ status: 'SUCCESS' });
  } catch (error: any) {
    log({
      error: error.message,
      code: error.code,
      fatal: true
    });
  } finally {
    await authPool.end();
  }
}

verify();
