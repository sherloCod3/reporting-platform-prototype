import { createClient } from 'redis';
import { env } from './env.config.js';

export const redisClient = createClient({
    url: env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Conectado ao Redis com sucesso'));

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
