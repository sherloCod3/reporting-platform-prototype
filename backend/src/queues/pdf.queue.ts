import { Queue } from 'bullmq';
import { connection } from '../config/bullmq.config.js';

export const PDF_QUEUE_NAME = 'pdf-generation-queue';

// The Queue instance is used to add jobs
export const pdfQueue = new Queue<{ htmlContent: string; reportId?: string }>(
    PDF_QUEUE_NAME,
    { connection }
);
