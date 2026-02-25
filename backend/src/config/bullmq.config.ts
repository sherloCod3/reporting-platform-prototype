import Redis from 'ioredis';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

// BullMQ recommends a separate Redis connection logic based on ioredis
const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
};

// We create a singleton connection to be reused by queues and workers
export const connection = new Redis.default(env.REDIS_URL, redisOptions);

connection.on('error', (err: any) => {
    logger.error({ err }, 'BullMQ Redis connection error');
});
connection.on('ready', () => {
    logger.info('BullMQ Redis connection ready');
});
