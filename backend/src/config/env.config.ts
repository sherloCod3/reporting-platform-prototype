import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

function getEnv(key: string): string {
    const value = process.env[ key ];
    if (!value) {
        throw new Error(`❌ Variável de ambiente ausente: ${key}`);
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

    // Credenciais fixas e isoladas para acesso aos DBs
    REPORT_DB_READ_USER: getEnv('REPORT_DB_READ_USER'),
    REPORT_DB_READ_PASSWORD: getEnv('REPORT_DB_READ_PASSWORD'),

    // JWT
    JWT_SECRET: getEnv('JWT_SECRET'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '4h',


    PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH
} as const;