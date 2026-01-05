import 'dotenv/config';

function getEnv(key: string): string {
    const value = process.env[ key ];
    if (!value) {
        throw new Error(`❌ Variável de ambiente ausente: ${key}`);
    }
    return value;
}
export const env = {
    PORT: process.env.PORT ?? '3000',

    DB_HOST: getEnv('DB_HOST'),
    DB_USER: getEnv('DB_USER'),
    DB_PASSWORD: getEnv('DB_PASSWORD'),
    DB_NAME: getEnv('DB_NAME'),


    PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH
};