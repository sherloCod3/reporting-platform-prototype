
import 'dotenv/config';
import readline from 'readline';
import axios from 'axios';
import { env } from '../src/config/env.config.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    console.log('\n--- Test Authenticated API ---\n');

    try {
        // 1. Login
        console.log('1. Login to get Access Token');
        const email = await question('Email (admin@example.com): ') || 'admin@example.com';
        const password = await question('Password (admin123): ') || 'admin123';

        const loginUrl = `http://localhost:${env.PORT}/api/login`;
        console.log(`\nLogging in at ${loginUrl}...`);

        const loginRes = await axios.post(loginUrl, { email, password });
        const { token } = loginRes.data.data;

        if (!token) {
            throw new Error('No token received');
        }

        console.log('\n✅ Login successful!');
        console.log(`Token: ${token.substring(0, 20)}...`);

        // 2. Make Request
        while (true) {
            console.log('\n--------------------------------------------------');
            console.log('2. Make Authenticated Request');

            const method = (await question('Method (GET/POST/PUT/DELETE) [GET]: ') || 'GET').toUpperCase();
            const endpoint = await question('Endpoint (/api/users): ') || '/api/users';

            let data = null;
            if ([ 'POST', 'PUT', 'PATCH' ].includes(method)) {
                const bodyStr = await question('Body (JSON) [{}]: ') || '{}';
                try {
                    data = JSON.parse(bodyStr);
                } catch (e) {
                    console.error('Invalid JSON body');
                    continue;
                }
            }

            const url = `http://localhost:${env.PORT}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
            console.log(`\nRequest: ${method} ${url}`);

            try {
                const res = await axios({
                    method,
                    url,
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    data
                });

                console.log(`\nResponse Status: ${res.status} ${res.statusText}`);
                console.log('Response Data:');
                console.dir(res.data, { depth: null, colors: true });

            } catch (reqErr: any) {
                if (reqErr.response) {
                    console.error(`\n❌ Error Status: ${reqErr.response.status} ${reqErr.response.statusText}`);
                    console.error('Error Data:', reqErr.response.data);
                } else {
                    console.error('\n❌ Request Error:', reqErr.message);
                }
            }

            const again = await question('\nMake another request? (y/n) [y]: ');
            if (again.toLowerCase() === 'n') break;
        }

    } catch (err: any) {
        console.error('\n❌ ERROR:');
        if (err.response) {
            console.error(`Status: ${err.response.status}`);
            console.error('Data:', err.response.data);
        } else {
            console.error(err.message);
        }
    } finally {
        rl.close();
        process.exit(0);
    }
}

main();
