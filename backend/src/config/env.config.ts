import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import fs from 'fs';

function getEnv(key: string): string {
  // 1. Tenta ler via Docker Secrets explícito via _FILE
  const fileKey = `${key}_FILE`;
  const filePath = process.env[ fileKey ];
  if (filePath && fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8').trim();
  }

  // 2. Tenta ler via Docker Secrets padrão (comum em setups Swarm/K8s)
  const secretPath = `/run/secrets/${key}`;
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, 'utf8').trim();
  }

  // 3. Fallback para variaveis de ambiente
  const value = process.env[ key ];
  if (!value) {
    throw new Error(`Variavel de ambiente ou secret ausente: ${key}`);
  }
  return value;
}
export const env = {
  PORT: process.env.PORT ?? '3000',

  AUTH_DB_HOST: getEnv('DB_HOST'),
  AUTH_DB_PORT: Number(getEnv('AUTH_DB_PORT')),
  AUTH_DB_USER: getEnv('DB_USER'),
  AUTH_DB_PASSWORD: getEnv('DB_PASSWORD'),
  AUTH_DB_NAME: getEnv('DB_NAME'),

  REPORT_DB_HOST: getEnv('REPORT_DB_HOST'),
  REPORT_DB_READ_USER: getEnv('REPORT_DB_READ_USER'),
  REPORT_DB_READ_PASSWORD: getEnv('REPORT_DB_READ_PASSWORD'),

  REPORT_DB_WRITE_USER: getEnv('REPORT_DB_WRITE_USER'),
  REPORT_DB_WRITE_PASSWORD: getEnv('REPORT_DB_WRITE_PASSWORD'),

  // JWT
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '4h',

  PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH
};
