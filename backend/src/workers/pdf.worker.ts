import { Worker, Job } from 'bullmq';
import { connection } from '../config/bullmq.config.js';
import { PDF_QUEUE_NAME } from '../queues/pdf.queue.js';
import { htmlToPdf } from '../services/pdf.service.js';
import { logger } from '../utils/logger.js';

// The Worker is responsible for processing jobs from the queue
export const pdfWorker = new Worker(
    PDF_QUEUE_NAME,
    async (job: Job<{ htmlContent: string; reportId?: string }>) => {
        logger.info({ jobId: job.id }, 'Processing job');

        // We update progress to give feedback to clients
        await job.updateProgress(10);

        try {
            const { htmlContent } = job.data;

            await job.updateProgress(30);

            // We leverage the existing pdf.service pool mechanism
            const pdfBuffer = await htmlToPdf(htmlContent);

            await job.updateProgress(90);

            // Store the PDF buffer in Redis temporarily so the client can fetch it
            // Job result data must be easily serializable; returning large buffers directly through BullMQ can be heavy.
            // However, BullMQ handles results by stringifying them. We'll return it as a base64 string.
            const base64Pdf = pdfBuffer.toString('base64');

            await job.updateProgress(100);
            logger.info({ jobId: job.id }, 'Job completed successfully');

            return {
                status: 'success',
                pdfData: base64Pdf
            };

        } catch (error: any) {
            logger.error({ err: error, jobId: job.id }, 'Job failed');
            throw error;
        }
    },
    {
        connection,
        concurrency: 2 // Handle max 2 parallel PDF generations to protect CPU/RAM
    }
);

pdfWorker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'PDF Job has completed!');
});

pdfWorker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, 'PDF Job has failed');
});
