import { createClient } from 'redis';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

export const redisClient = createClient({
    url: env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error({ err }, 'Redis Client Error'));
redisClient.on('connect', () => logger.info('Conectado ao Redis com sucesso'));

export async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

export async function disconnectRedis() {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}
