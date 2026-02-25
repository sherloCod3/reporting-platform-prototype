import { jest } from '@jest/globals';

jest.unstable_mockModule('bullmq', () => ({
    Worker: jest.fn().mockImplementation(() => ({
        on: jest.fn()
    })),
    Queue: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
        on: jest.fn()
    })),
    Job: class { }
}));

jest.unstable_mockModule('@/config/bullmq.config.js', () => ({
    connection: {} // mock redis connection 
}));

jest.unstable_mockModule('@/services/pdf.service.js', () => ({
    htmlToPdf: jest.fn()
}));

jest.unstable_mockModule('@/utils/logger.js', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn()
    }
}));

describe('pdf.worker', () => {
    let processPdfJob: any;
    let htmlToPdfMock: jest.Mock<any>;
    let mockJob: any;
    let loggerMock: any;

    beforeAll(async () => {
        const workerModule = await import('@/workers/pdf.worker.js');
        processPdfJob = workerModule.processPdfJob;

        const pdfService = await import('@/services/pdf.service.js');
        htmlToPdfMock = pdfService.htmlToPdf as jest.Mock<any>;

        const loggerModule = await import('@/utils/logger.js');
        loggerMock = loggerModule.logger;
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockJob = {
            id: 'job-123',
            data: {
                htmlContent: '<h1>Test Report</h1>',
                reportId: 'rep-456'
            },
            updateProgress: (jest.fn() as jest.Mock<any>).mockResolvedValue(undefined)
        };
    });

    it('should process a valid pdf job, stream progress and return base64 Data', async () => {
        const fakePdfBuffer = Buffer.from('fake-pdf-content');
        htmlToPdfMock.mockResolvedValueOnce(fakePdfBuffer);

        const result = await processPdfJob(mockJob);

        expect(loggerMock.info).toHaveBeenCalledWith({ jobId: 'job-123' }, 'Processing job');

        // Assert sequence of progression according to business logic rules
        expect(mockJob.updateProgress).toHaveBeenNthCalledWith(1, 10);
        expect(mockJob.updateProgress).toHaveBeenNthCalledWith(2, 30);

        expect(htmlToPdfMock).toHaveBeenCalledWith('<h1>Test Report</h1>');

        expect(mockJob.updateProgress).toHaveBeenNthCalledWith(3, 90);
        expect(mockJob.updateProgress).toHaveBeenNthCalledWith(4, 100);

        expect(loggerMock.info).toHaveBeenCalledWith({ jobId: 'job-123' }, 'Job completed successfully');

        expect(result).toEqual({
            status: 'success',
            pdfData: fakePdfBuffer.toString('base64')
        });
    });

    it('should handle pdf service errors gracefully, log failures and throw', async () => {
        const mockError = new Error('PDF Generation Failed');
        htmlToPdfMock.mockRejectedValueOnce(mockError);

        await expect(processPdfJob(mockJob)).rejects.toThrow('PDF Generation Failed');

        expect(mockJob.updateProgress).toHaveBeenCalledWith(10);
        expect(mockJob.updateProgress).toHaveBeenCalledWith(30);

        // Validation limits because it crashed inside htmlToPdf
        expect(mockJob.updateProgress).not.toHaveBeenCalledWith(90);

        expect(loggerMock.error).toHaveBeenCalledWith({ err: mockError, jobId: 'job-123' }, 'Job failed');
    });
});
