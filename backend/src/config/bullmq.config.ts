import Redis from 'ioredis';
import { env } from './env.config.js';

// BullMQ recommends a separate Redis connection logic based on ioredis
const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
};

// We create a singleton connection to be reused by queues and workers
export const connection = new Redis.default(env.REDIS_URL, redisOptions);

connection.on('error', (err: any) => {
    console.error('BullMQ Redis connection error:', err);
});
connection.on('ready', () => {
    console.log('BullMQ Redis connection ready');
});
