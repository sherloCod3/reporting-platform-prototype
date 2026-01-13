import type { JwTPayload } from './auth.types.js'; // tipo do jwt
import type { Pool } from 'mysql2/promise'; //tipo do pool

declare global {
    namespace Express {
        interface Request {
            user?: JwTPayload; // user do token
            db?: Pool; // pool dinâmico
        }
    }
}