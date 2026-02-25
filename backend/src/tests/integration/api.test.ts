import request from 'supertest';
import { jest } from '@jest/globals';

// Set up ESM mocks before importing the modules that require them
jest.unstable_mockModule('../../middlewares/auth.middleware.js', () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.user = { id: 1, role: 'admin', clientId: 'test-client' };
        req.db = {
            query: jest.fn(),
            execute: jest.fn(),
            end: jest.fn()
        };
        req.clientConn = { host: 'localhost', port: 3306, db: 'test', slug: 'test' };
        req.dbCredentials = { user: 'user', password: 'password' };
        next();
    }
}));

jest.unstable_mockModule('../../services/reportService.js', () => {
    return {
        ReportService: jest.fn().mockImplementation(() => {
            return {
                exportPdf: jest.fn<any>().mockResolvedValue('fake-job-id-123'),
                getPdfStatus: jest.fn<any>().mockResolvedValue({ state: 'completed', url: 'http://fake.url/file.pdf' })
            };
        })
    };
});

jest.unstable_mockModule('../../queues/pdf.queue.js', () => ({
    pdfQueue: {
        add: jest.fn<any>().mockResolvedValue({ id: 'fake-job-id' }),
        getJob: jest.fn<any>().mockImplementation((jobId: string) => {
            if (jobId === 'fake-job-id') {
                return Promise.resolve({
                    id: 'fake-job-id',
                    getState: jest.fn<any>().mockResolvedValue('completed'),
                    progress: 100,
                    returnvalue: { pdfData: 'fakebase64string' }
                });
            }
            return Promise.resolve(null);
        })
    }
}));

// Load the dependencies after mock declarations using top-level await
const { default: app } = await import('../../server.js');
const { disconnectRedis } = await import('../../config/redis.config.js');
const { browserPool } = await import('../../config/puppeteer.config.js');
const { DbService } = await import('../../services/db.service.js');

describe('API Endpoints Integration', () => {
    let csrfToken: string;
    let csrfCookie: string[];

    afterAll(async () => {
        if (disconnectRedis) {
            await disconnectRedis();
        }
        if (browserPool) {
            await browserPool.drain().then(() => browserPool.clear());
        }
    });

    beforeAll(async () => {
        const csrfRes = await request(app).get('/api/auth/csrf-token');
        csrfToken = csrfRes.body.csrfToken;
        const rawCookie = csrfRes.headers[ 'set-cookie' ];
        csrfCookie = Array.isArray(rawCookie) ? rawCookie : rawCookie ? [ rawCookie as string ] : [];
    });

    describe('Report Routes', () => {
        it('should reject invalid SQL queries in /api/reports/execute', async () => {
            const res = await request(app)
                .post('/api/reports/execute')
                .set('Cookie', csrfCookie)
                .set('CSRF-Token', csrfToken)
                .send({
                    sql: 'DROP TABLE users;',
                    filters: [],
                    pagination: { page: 1, pageSize: 10 }
                });

            // Based on typical SQL validation, DROP/DELETE/INSERT should be rejected
            // with a 400 Bad Request
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should successfully initiate PDF export', async () => {
            const res = await request(app)
                .post('/api/reports/export-pdf')
                .set('Cookie', csrfCookie)
                .set('CSRF-Token', csrfToken)
                .send({
                    htmlContent: '<h1>Test Report</h1>'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('jobId');
        });

        it('should return PDF job status', async () => {
            const res = await request(app)
                .get('/api/reports/export-pdf/fake-job-id/status');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.state).toBe('completed');
        });
    });

    describe('DB Routes', () => {
        it('should return DB connection status', async () => {
            jest.spyOn(DbService, 'testConnection')
                .mockResolvedValue({ success: true, duration: 15 } as any);
            jest.spyOn(DbService, 'getConnectionInfo')
                .mockResolvedValue({ host: 'localhost', database: 'test', user: 'root' });

            const res = await request(app).get('/api/db/status');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.connected).toBe(true);
        });
    });
});
