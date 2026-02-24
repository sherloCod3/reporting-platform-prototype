import request from 'supertest';
import express from 'express';
import app from '../../server.js';

describe('Security Middlewares Integration', () => {

    it('should return a CSRF token from GET /api/auth/csrf-token', async () => {
        const res = await request(app).get('/api/auth/csrf-token');

        expect(res.status).toBe(200);
        expect(res.body.csrfToken).toBeDefined();

        // Check if a cookie was set by csurf
        // Check if a cookie was set by csurf
        const setCookieHeader = res.headers[ 'set-cookie' ];
        expect(setCookieHeader).toBeDefined();
        if (setCookieHeader) {
            const cookieArray = Array.isArray(setCookieHeader) ? setCookieHeader : [ setCookieHeader ];
            expect(cookieArray.some(str => str.includes('_csrf'))).toBe(true);
        }
    });

    it('should reject POST request without CSRF token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password' });

        // csurf returns 403 Forbidden with "invalid csrf token" by default
        expect(res.status).toBe(403);
    });

    it('should reject a JSON payload larger than 1MB', async () => {
        // Obter CSRF token primeiro
        const csrfRes = await request(app).get('/api/auth/csrf-token');
        const token = csrfRes.body.csrfToken;
        const cookie = csrfRes.headers[ 'set-cookie' ];

        // Generate a string larger than 1MB
        const largeString = 'a'.repeat(2 * 1024 * 1024);

        const res = await request(app)
            .post('/api/auth/login')
            .set('Cookie', cookie)
            .set('CSRF-Token', token)
            .set('Content-Type', 'application/json')
            .send(`{"dummy": "${largeString}"}`);

        // express.json() payload limits throw a PayloadTooLargeError which usually results in 413
        expect(res.status).toBe(413);
    });
});
