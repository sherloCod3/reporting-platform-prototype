import { Worker, Job } from 'bullmq';
import { connection } from '../config/bullmq.config.js';
import { PDF_QUEUE_NAME } from '../queues/pdf.queue.js';
import { htmlToPdf } from '../services/pdf.service.js';

// The Worker is responsible for processing jobs from the queue
export const pdfWorker = new Worker(
    PDF_QUEUE_NAME,
    async (job: Job<{ htmlContent: string; reportId?: string }>) => {
        console.log(`[PDF Worker] Processing job ${job.id}`);

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
            console.log(`[PDF Worker] Job ${job.id} completed successfully`);

            return {
                status: 'success',
                pdfData: base64Pdf
            };

        } catch (error: any) {
            console.error(`[PDF Worker] Job ${job.id} failed:`, error);
            throw error;
        }
    },
    {
        connection,
        concurrency: 2 // Handle max 2 parallel PDF generations to protect CPU/RAM
    }
);

pdfWorker.on('completed', (job) => {
    console.log(`[BullMQ] PDF Job ${job.id} has completed!`);
});

pdfWorker.on('failed', (job, err) => {
    console.log(`[BullMQ] PDF Job ${job?.id} has failed with ${err.message}`);
});
