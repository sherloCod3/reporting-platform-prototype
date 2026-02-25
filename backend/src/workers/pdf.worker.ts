import { Worker, Job } from 'bullmq';
import { connection } from '../config/bullmq.config.js';
import { PDF_QUEUE_NAME } from '../queues/pdf.queue.js';
import { htmlToPdf } from '../services/pdf.service.js';
import { logger } from '../utils/logger.js';

// The Worker is responsible for processing jobs from the queue
export const processPdfJob = async (job: Job<{ htmlContent: string; reportId?: string }>) => {
    logger.info({ jobId: job.id }, 'Processing job');

    await job.updateProgress(10);

    try {
        const { htmlContent } = job.data;

        await job.updateProgress(30);

        const pdfBuffer = await htmlToPdf(htmlContent);

        await job.updateProgress(90);

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
};

export const pdfWorker = new Worker(
    PDF_QUEUE_NAME,
    processPdfJob,
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
